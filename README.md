# PharmaAI Product Explainer

PharmaAI Product Explainer is a secure, state-of-the-art educational medicine explanation platform engineered for pharmaceutical distributors and general consumers alike. Utilizing **Retrieval-Augmented Generation (RAG)** grounded against local facts sheets, the system queries **Google Gemini AI** to translate chemical indexes and clinical descriptions into clear analogies in **English, Hindi, and Telugu** while strictly observing medical safety disclaimers (no auto-prescribing, no pricing/dosing recommendations).

---

##  Tech Stack & Key Technologies

- **Frontend Core**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Aura Clinical Teal theme) + Lucide Icons + Motion Layouts
- **Platform/Development Sandbox**: Fast, lightweight Node.js Express full-stack proxy (Port 3000)
- **Production Python Backend**: Independent, fully deployable **FastAPI (Python) server** (located in `/backend`)
- **Intelligence Model**: Google Gemini AI (`gemini-3.5-flash` model via official GenAI native SDK)
- **Add-on Helpers**: HTML5 Speech Synthesis (Voice narration in multiple languages), `jspdf` for customized PDF document downloads

---

## 📂 Project Directory Structure

```text
/
├── server.ts              # Primary development full-stack Express server (serves Vite & proxies Gemini APIs)
├── package.json           # Node configuration holding dev, build, and start commands
├── vite.config.ts         # Vite bundler options with Tailwind v4 configuration
├── metadata.json          # Application capabilities setup
│
├── src/
│   ├── App.tsx            # Main application dashboard controller
│   ├── main.tsx           # Initial mounting logic
│   ├── index.css          # Clinical teal styles, scrollbars, animations, and custom font registers
│   ├── types.ts          # Unified TypeScript Interfaces for medicines, parameters, and models
│   ├── data/
│   │   └── medicines.json # Primary medicine JSON dataset (Local RAG knowledge boundary)
│   └── components/
│       ├── Header.tsx            # Navigation, logos, stats, and light/dark theme togglers
│       ├── DisclaimerAlert.tsx   # Prominent legal safety warnings and compliance guidelines
│       ├── MedicineSelector.tsx  # Searchable autocomplete selector and language badges
│       ├── RagCacheView.tsx      # Step 1: Pre-computed factual RAG details from dataset
│       └── ClinicalDossier.tsx   # Step 2: Gemini results (voice playback, clipboard backup, pdf compilations)
│
└── backend/               # Independent deployable Python Backend (Render ready)
    ├── main.py            # FastAPI service exposing GET /medicines and POST /generate-explanation
    ├── database.json      # Dual representation of the medicine JSON database
    ├── requirements.txt   # Critical Python dependency tree (fastapi, python-genai, etc.)
    └── README.md          # Dedicated deployment instructions for Render
```

---

##  Local Development (Sandbox Preview)

In this AI Studio preview container, the application uses **Express + Vite** as a unified full-stack Node server. The API routes `/api/medicines` and `/api/generate-explanation` are directly available alongside the hot-reloading frontend.

### Running Globally in the sandbox
1. Dependencies are already auto-installed.
2. Ensure you have your `GEMINI_API_KEY` set in the Secrets/Settings panel in AI Studio.
3. Start the server using:
   ```bash
   npm run dev
   ```
4. Open the active preview at `http://localhost:3000`.

---

##  Deployment Instructions (Production Ready)

PharmaAI is split-ready, allowing you to deploy the frontend to Vercel and the backend service independently on Render.

### 1. Frontend Web App (Vercel)

The React single-page application is structured utilizing standard Vite, building plain static files inside `/dist`.

#### Steps:
1. Push this workspace code to **GitHub**.
2. Create a new project on **Vercel** (`https://vercel.com`).
3. Connect your repository and select the root directory.
4. Set Framework Preset: **Vite**.
5. Set Build Command: `npm run build` (This runs `vite build`).
6. Set Output Directory: `dist`.
7. Configure Environment Variables in Vercel:
   - `VITE_API_URL` = Your deployable backend URL (e.g., `https://pharma-api.onrender.com/api` or your endpoints).
   *(Note: Remember to update fetch paths in `./src/App.tsx` from `/api/...` to your live Render endpoint if hosted fully separately!)*

### 2. Backend API Service (Render)

The independent FastAPI backend resides in the `/backend` folder.

#### Steps:
1. Log in to [Render](https://render.com) and create a **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Environment/Runtime**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python backend/main.py` OR `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables in Render:
   - `GEMINI_API_KEY` = *Insert your Google AI Studio / Gemini API key token here.*
5. Deploy.

---

##  Responsible AI Safety Compliance

1. **Deterministic Local RAG Source**: Every Gemini prompt is strictly formatted to embed the *vetted clinical dataset factsheet* as its absolute boundary. This strictly prevents the generation of hallucinations.
2. **Firm Operational Guardrails**:
   - The model is strictly instructed **never** to diagnose conditions based on user descriptions.
   - It **never** issues drug list recommendations or updates individuals' therapeutic dosing configurations.
   - It serves exclusively as a professional explainer converting indices into patient-friendly analogies.
3. **Pervasive Legal Warning**: A detailed clinical disclaimer must accompany all outputs on the screen to safeguard end-users.
