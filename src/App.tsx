import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import DisclaimerAlert from "./components/DisclaimerAlert";
import MedicineSelector from "./components/MedicineSelector";
import RagCacheView from "./components/RagCacheView";
import ClinicalDossier from "./components/ClinicalDossier";
import { Medicine, PharmaAIResponse, SupportedLanguage } from "./types";
import { Pill, Activity, ShieldAlert, Sparkles, RefreshCw, FileText } from "lucide-react";

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("English");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(true); // Initialized to true for primary mesh theme spotlight
  const [responseResult, setResponseResult] = useState<PharmaAIResponse | null>(null);
  
  const [apiError, setApiError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState<boolean>(false);

  // Load medicines from fullstack API on mount
  useEffect(() => {
    async function fetchMedicines() {
      try {
        const response = await fetch("/api/medicines");
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();
        setMedicines(data);
        if (data.length > 0) {
          setSelectedMedicineId(data[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load medicines list:", err);
        setApiError("Unable to establish connectivity to the local RAG database. Please check if server is active.");
      }
    }
    fetchMedicines();
  }, []);

  // Theme support
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Simulate progress statements for AI generation (high-impact delight loading)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Execute Gemini Explanation Query
  const handleGenerate = async () => {
    if (!selectedMedicineId) return;
    
    setIsLoading(true);
    setApiError(null);
    setIsConfigError(false);
    setResponseResult(null);

    try {
      const response = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: selectedMedicineId,
          language: selectedLanguage
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.isConfigError) {
          setIsConfigError(true);
        }
        throw new Error(result.error || "Generation query crashed on server.");
      }

      setResponseResult(result);
    } catch (err: any) {
      console.error("Explainer error:", err);
      setApiError(err.message || "An unexpected network blockage took place.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeMedicine = medicines.find((m) => m.id === selectedMedicineId);

  const getLoadingHeadline = () => {
    switch (loadingStep) {
      case 0: return "Accessing Local Vetted Clinical Records...";
      case 1: return "Injecting Context into Gemini Large Language Models...";
      case 2: return "Structuring Medical Guidelines & Visual Formatting Schema...";
      case 3: return "Finalizing Local Multilingual Conversational Synthesis...";
      default: return "Synthesizing Pharmacology Analysis...";
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 relative overflow-x-hidden ${isDark ? "dark" : "light-theme"}`}>
      {/* Dynamic Mesh backgrounds */}
      {isDark ? (
        <div className="mesh-bg"></div>
      ) : (
        <div className="mesh-bg mesh-bg-light"></div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10" id="main-canvas">
        
        {/* Dynamic Nav Header */}
        <Header isDark={isDark} toggleTheme={toggleTheme} />

        {/* Global Level Alerts & Safety Outlines */}
        <DisclaimerAlert isDark={isDark} />

        {/* DASHBOARD GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="applet-dashboard-grid">
          
          {/* LEFT INTERACTIVE CONFIGURATION FORM (5 cols) */}
          <section className="lg:col-span-5 space-y-6" id="dashboard-left-aside">
            
            {/* Selector Card */}
            <MedicineSelector
              medicines={medicines}
              selectedMedicineId={selectedMedicineId}
              onSelectMedicine={(id) => {
                setSelectedMedicineId(id);
                setApiError(null);
                setResponseResult(null);
              }}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={(lang) => {
                setSelectedLanguage(lang);
                setResponseResult(null);
              }}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isDark={isDark}
            />

            {/* Static Facts Sheet Visualizer */}
            <RagCacheView activeMedicine={activeMedicine} isDark={isDark} />

          </section>

          {/* RIGHT DETAILED ANALYTICS CARD VIEW (7 cols) */}
          <section className="lg:col-span-7" id="dashboard-right-details">
            
            {/* INITIAL ZERO-STATE (No Query Done Yet & Not Loading) */}
            {!isLoading && !responseResult && !apiError && (
              <div className={`rounded-3xl border p-10 md:p-14 text-center frosted-glass-card ${
                isDark ? "border-white/10" : "bg-white/60 border-slate-200 light-theme-shadow"
              }`} id="zero-state-splash">
                <div className="p-4 rounded-2xl bg-clinical-500/10 text-clinical-500 fill-clinical-500 w-fit mx-auto mb-6">
                  <Activity className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold tracking-tight font-heading mb-2">
                  No Generated Explanation Active
                </h3>
                <p className={`text-sm max-w-sm mx-auto leading-relaxed mb-6 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}>
                  Select a candidate medicine and target language on the left hand panel, then click the generator button to request a certified AI pharmaceutical summary.
                </p>
                
                {activeMedicine && (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between text-left max-w-md mx-auto frosted-glass-card ${
                    isDark ? "bg-slate-950/40 border-white/10" : "bg-white/80 border-slate-100 shadow-sm"
                  }`}>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-clinical-500">Quick Start Candidate</span>
                      <p className="text-sm font-bold font-heading">{activeMedicine.name}</p>
                    </div>
                    <button
                      onClick={handleGenerate}
                      className="text-xs bg-clinical-500 text-white rounded-lg px-3 py-1.5 font-bold hover:bg-clinical-600 transition-colors"
                    >
                      Process Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ERROR PRESENTATION */}
            {apiError && (
              <div className={`rounded-2xl border p-6 md:p-8 frosted-glass-card ${
                isDark 
                  ? "border-rose-950 text-rose-200" 
                  : "bg-rose-50/75 border-rose-200 text-rose-950 light-theme-shadow"
              }`} id="api-error-banner">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-heading mb-2">Clinical Service Error</h3>
                    <p className="text-xs sm:text-sm leading-relaxed mb-4">{apiError}</p>

                    {isConfigError && (
                      <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-2 frosted-glass-card ${
                        isDark ? "border-rose-950/45" : "bg-white/80 border-rose-100"
                      }`}>
                        <p className="font-semibold text-rose-600">How to Fix Your Secrets Environment Variable Keys:</p>
                        <ol className="list-decimal pl-4 space-y-1 text-slate-500">
                          <li>Access the <strong>Settings (Gear Icon)</strong> or <strong>Secrets Panel</strong> in the top-right AI Studio interface.</li>
                          <li>Register a new secret key: <code>GEMINI_API_KEY</code>.</li>
                          <li>Paste your official Google Gemini API Token as the key's value.</li>
                          <li>Refresh the preview panel or click standard generate again.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVE IN-PROGRESS LOADING ANIMATION (DELIGHT) */}
            {isLoading && (
              <div className={`rounded-3xl border p-10 md:p-16 text-center frosted-glass-card shadow-lg relative overflow-hidden ${
                isDark ? "border-white/10" : "bg-white/60 border-slate-200 light-theme-shadow"
              }`} id="dossier-loader">
                {/* Embedded moving background grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative z-10 space-y-6">
                  {/* Rotating clinical symbol */}
                  <div className="relative w-20 h-20 mx-auto" id="loading-spinner-wrapper">
                    <div className="absolute inset-0 rounded-full border-4 border-clinical-500/20 border-t-clinical-500 animate-spin" />
                    <div className="absolute inset-2 flex items-center justify-center text-clinical-500">
                      <Pill className="w-8 h-8 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-heading tracking-tight animate-pulse text-clinical-500">
                      {getLoadingHeadline()}
                    </h3>
                    <p className={`text-xs max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Applying clinical instructions and mapping biochemical contexts to structure a safe, educational pharmacology analysis.
                    </p>
                  </div>

                  {/* Progress Indicators bar */}
                  <div className="max-w-2xs mx-auto flex items-center justify-center gap-1.5" id="milestones-indicators">
                    {[0, 1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          step <= loadingStep 
                            ? "w-8 bg-clinical-500" 
                            : "w-2 bg-slate-300 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Text statement step outlines */}
                  <div className={`p-4 rounded-xl border text-left max-w-sm mx-auto text-2xs space-y-2 ${
                    isDark ? "bg-slate-950/80 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`} id="loading-checklist-box">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${loadingStep >= 0 ? "bg-clinical-500" : "bg-slate-300"}`} />
                      <span className={loadingStep >= 0 ? "font-bold text-clinical-500" : ""}>Reference Data Loaded (RAG Vetted)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${loadingStep >= 1 ? "bg-clinical-500" : "bg-slate-300"}`} />
                      <span className={loadingStep >= 1 ? "font-bold text-clinical-500" : ""}>Prompt Payload Dispatched</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${loadingStep >= 2 ? "bg-clinical-500" : "bg-slate-300"}`} />
                      <span className={loadingStep >= 2 ? "font-bold text-clinical-500" : ""}>Multilingual Formulations Matched</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${loadingStep >= 3 ? "bg-clinical-500" : "bg-slate-300"}`} />
                      <span className={loadingStep >= 3 ? "font-bold text-clinical-500" : ""}>Generating Dashboard Results</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RESULTS VIEW */}
            {responseResult && (
              <ClinicalDossier data={responseResult} isDark={isDark} />
            )}

          </section>

        </div>

      </main>
      
      {/* Footer copyright */}
      <footer className="text-center py-8 text-2xs opacity-40 border-t border-clinical-500/5 mt-16 pb-24">
        PharmaAI Product Explainer • Clinically Safe AI Solutions for Modern Pharmacy Distribution
      </footer>
    </div>
  );
}
