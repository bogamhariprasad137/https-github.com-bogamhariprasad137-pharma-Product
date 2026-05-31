import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to medicine database
const MEDICINE_DB_PATH = path.join(__dirname, "src", "data", "medicines.json");

// Define lazy Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. GET /api/medicines
app.get("/api/medicines", (req, res) => {
  try {
    if (!fs.existsSync(MEDICINE_DB_PATH)) {
      return res.status(404).json({ error: "Medicine data file not found." });
    }
    const rawData = fs.readFileSync(MEDICINE_DB_PATH, "utf-8");
    const medicines = JSON.parse(rawData);
    res.json(medicines);
  } catch (error: any) {
    console.error("Error reading medicines DB:", error);
    res.status(500).json({ error: "Failed to read medicine database " + error.message });
  }
});

// 2. POST /api/generate-explanation
app.post("/api/generate-explanation", async (req: any, res: any) => {
  try {
    const { medicineId, language } = req.body;
    if (!medicineId) {
      return res.status(400).json({ error: "Medicine ID is required." });
    }
    const targetLang = language || "English";

    // Read local database
    if (!fs.existsSync(MEDICINE_DB_PATH)) {
      return res.status(500).json({ error: "Medicine context database is missing on the server." });
    }
    const rawData = fs.readFileSync(MEDICINE_DB_PATH, "utf-8");
    const medicines = JSON.parse(rawData);
    const medicine = medicines.find((m: any) => m.id === medicineId || m.name.toLowerCase().includes(medicineId.toLowerCase()));

    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found in local context database." });
    }

    // Lazy load Gemini Client
    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      return res.status(400).json({
        error: "Gemini API key is missing. Set GEMINI_API_KEY in the Secrets panel or '.env' file.",
        isConfigError: true
      });
    }

    // RAG: Construct system instructions & prompt containing the local database context
    const localContext = `
Medicine Name: ${medicine.name}
Category: ${medicine.category}
Uses:
${medicine.uses.map((u: string) => "- " + u).join("\n")}
Side Effects:
${medicine.sideEffects.map((s: string) => "- " + s).join("\n")}
Precautions:
${medicine.precautions.map((p: string) => "- " + p).join("\n")}
Storage Instructions: ${medicine.storage}
`.trim();

    const systemInstruction = `
You are an expert clinical pharmacist and professional medical explainer.
Your job is to translate complex medical terms into simple, client-friendly summaries.
Strictly adhere to these rules for responsible AI safety:
1. NEVER diagnose clinical symptoms or diseases.
2. NEVER prescribe drugs, treatments, or courses.
3. NEVER provide customized individual dosage suggestions.
4. Encourage consulting real doctors and highlight the medical disclaimer.
5. Base your explanation strictly on the Provided Reference Medicine Context.
6. The values inside the JSON output parameters must be completely in the target explanation language requested: ${targetLang}.
7. The JSON keys MUST remain exactly as specified in camelCase, but the text values (including lines, paragraphs, FAQs) must be written in ${targetLang}. For Hindi, write in standard, readable Devanagari script. For Telugu, write in natural, clear Telugu script.
`.trim();

    const userPrompt = `
Generate a thoroughly elaborated medicine explanation for "${medicine.name}" in language "${targetLang}".

Here is the retrieved local clinical database context for "${medicine.name}":
-------------------------
${localContext}
-------------------------

Please output the detailed explanation strictly using the exact schema. Make the FAQs address practical everyday questions patients ask about the medicine. Ensure the "patientFriendlyExplanation" uses simple analogies, metaphors, and warm language suitable for someone without any medical background.
`.trim();

    // Generate content with responseSchema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.STRING,
              description: "High-level overview description of the medicine."
            },
            commonUses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of common ailments or indications it treats."
            },
            howItWorks: {
              type: Type.STRING,
              description: "Clear and accessible explanation of the biological mechanism."
            },
            commonSideEffects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Frequent or noteworthy side effects."
            },
            importantPrecautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Mandatory consumer rules, cautions, and food/alcohol warnings."
            },
            storageInstructions: {
              type: Type.STRING,
              description: "Specific details on storage, temperature, and moisture safety."
            },
            patientFriendlyExplanation: {
              type: Type.STRING,
              description: "A warm, hyper-simplified explanation using simple vocabulary, daily analogies, or metaphors."
            },
            faqs: {
              type: Type.ARRAY,
              description: "List of exactly 3 or 4 practical FAQs patients often ask.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: [
            "overview",
            "commonUses",
            "howItWorks",
            "commonSideEffects",
            "importantPrecautions",
            "storageInstructions",
            "patientFriendlyExplanation",
            "faqs"
          ]
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Received empty response from Gemini model.");
    }

    const explanationData = JSON.parse(textResponse.trim());
    res.json({
      medicineId: medicine.id,
      medicineName: medicine.name,
      language: targetLang,
      explanation: explanationData,
      disclaimer: "Important Medical Disclaimer: This information is generated by AI for educational purposes only. It is not medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before taking any medication."
    });

  } catch (error: any) {
    console.error("Error generating explanation:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});


// Serve Vite or static files
async function setupViteOrStaticInExpress() {
  if (process.env.NODE_ENV !== "production") {
    // Lazy load Vite in development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    // Production client serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets in production.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PharmaAI app running at http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStaticInExpress().catch((err) => {
  console.error("Failed to bootstrap Express server:", err);
  process.exit(1);
});
