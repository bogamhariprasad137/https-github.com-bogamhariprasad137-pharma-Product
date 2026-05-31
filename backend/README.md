# PharmaAI Product Explainer - FastAPI Backend

This directory contains the production-ready Python FastAPI backend. It implements structured data validations, medicine lookups, and context injection (RAG) using Google Gemini AI.

## Local Development Requirements
1. Python 3.9 or higher
2. Installed dependencies from `requirements.txt`

## Local Setup
1. Standard Virtual Environment setup:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables:
   ```bash
   export GEMINI_API_KEY="your_actual_gemini_api_key"
   ```
4. Run the development server with Hot Reloading:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Documentation
Once running, you can inspect and try out the endpoints interactively at:
- Swagger Docs UI: `http://localhost:8000/docs`
- Redoc UI: `http://localhost:8000/redoc`

## Deploying to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository.
3. Choose the **Python** runtime environment.
4. Set Build Command: `pip install -r backend/requirements.txt`
5. Set Start Command: `python backend/main.py` (or `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`)
6. Add Environment Variable:
   - `GEMINI_API_KEY` = your secure token.
