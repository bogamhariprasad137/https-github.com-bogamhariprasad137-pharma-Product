import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load database config helper
DB_PATH = os.path.join(os.path.dirname(__file__), "database.json")

app = FastAPI(
    title="PharmaAI Product Explainer API",
    description="FastAPI service for local RAG medicine search and generation using Google Gemini AI",
    version="1.0.0"
)

# Enable CORS for frontend deployment (e.g., Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class MedicineInDB(BaseModel):
    id: str
    name: str
    category: str
    uses: List[str]
    sideEffects: List[str]
    precautions: List[str]
    storage: str

class ExplanationRequest(BaseModel):
    medicineId: str = Field(..., description="The ID or search query matches of the medicine")
    language: str = Field("English", description="Target language: English, Hindi, or Telugu")

class FAQItem(BaseModel):
    question: str
    answer: str

class ExplanationResponseSchema(BaseModel):
    overview: str
    commonUses: List[str]
    howItWorks: str
    commonSideEffects: List[str]
    importantPrecautions: List[str]
    storageInstructions: str
    patientFriendlyExplanation: str
    faqs: List[FAQItem]

class ExplainerOutput(BaseModel):
    medicineId: str
    medicineName: str
    language: str
    explanation: ExplanationResponseSchema
    disclaimer: str

def load_db() -> list:
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail="Local medicine database is missing.")
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# Endpoints
@app.get("/medicines", response_model=List[MedicineInDB])
def get_medicines():
    """Retrieve all medicines available in our local RAG clinical knowledge base."""
    return load_db()

@app.post("/generate-explanation", response_model=ExplainerOutput)
async def generate_explanation(payload: ExplanationRequest):
    """
    Search local clinical knowledge base for the medicine.
    Inject retrieved clinical data to synthesize a patient-friendly response in the selected language.
    """
    db_items = load_db()
    medicine = None
    for item in db_items:
        if item["id"] == payload.medicineId or payload.medicineId.lower() in item["name"].lower():
            medicine = item
            break

    if not medicine:
        raise HTTPException(status_code=404, detail=f"Medicine '{payload.medicineId}' not spotted in the local database.")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY environment variable is missing on the server. Please check your credentials configuration."
        )

    # Initialize Google GenAI library
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="Python SDK 'google-genai' is not installed. Please add it to requirements.txt."
        )

    client = genai.Client(api_key=api_key)

    # Format clinical context
    local_context = f"""
    Medicine Name: {medicine['name']}
    Category: {medicine['category']}
    Uses: {', '.join(medicine['uses'])}
    Side Effects: {', '.join(medicine['sideEffects'])}
    Precautions: {', '.join(medicine['precautions'])}
    Storage Instructions: {medicine['storage']}
    """.strip()

    system_instruction = f"""
    You are a professional clinical pharmacist.
    Summarize complex medical concepts into accessible explanations.
    Strict safety parameters:
    1. NEVER diagnose clinical systems or disease files.
    2. NEVER prescribe treatments or customized dosage frequencies.
    3. NEVER suggest specific dosage numbers for individuals.
    4. Base the complete answer ONLY on the provided reference medicine context.
    5. Translate all textual outputs inside the JSON values directly to {payload.language}. Keep keys strictly in camelCase (e.g. "overview", "commonUses", "howItWorks", etc.).
    """

    user_prompt = f"""
    Create a highly refined pharmaceutical explanation for "{medicine['name']}" in target language "{payload.language}".

    Here is the retrieved local context from the clinical database:
    -----------------
    {local_context}
    -----------------

    Please output the JSON matching the specified structure perfectly and translate all fields to {payload.language}.
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3,
                response_mime_type="application/json",
                response_schema=ExplanationResponseSchema,
            ),
        )

        explanation_data = json.loads(response.text)

        return ExplainerOutput(
            medicineId=medicine["id"],
            medicineName=medicine["name"],
            language=payload.language,
            explanation=explanation_data,
            disclaimer="Important Medical Disclaimer: This information is generated by AI for educational purposes only. It is not medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before taking any medication."
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
