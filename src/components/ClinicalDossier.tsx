import React, { useState, useEffect } from "react";
import { 
  FileText, Copy, Check, Download, Volume2, VolumeX, Pause, PlayCircle, 
  HelpCircle, ShieldAlert, BadgeCheck, Activity, Compass, Flame, Quote, BookmarkCheck 
} from "lucide-react";
import { PharmaAIResponse } from "../types";
import { jsPDF } from "jspdf";

interface ClinicalDossierProps {
  data: PharmaAIResponse;
  isDark: boolean;
}

export default function ClinicalDossier({ data, isDark }: ClinicalDossierProps) {
  const [copied, setCopied] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<"stopped" | "playing" | "paused">("stopped");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const { medicineName, language, explanation, disclaimer } = data;

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Clipboard Copy
  const handleCopy = async () => {
    try {
      const copyText = `
CLINICAL DOSSIER: ${medicineName}
Language: ${language}
--------------------------------------
${disclaimer}

1. OVERVIEW
${explanation.overview}

2. COMMON USES
${explanation.commonUses.map((u) => `- ${u}`).join("\n")}

3. HOW IT WORKS (MECHANISM OF ACTION)
${explanation.howItWorks}

4. COMMON SIDE EFFECTS
${explanation.commonSideEffects.map((s) => `- ${s}`).join("\n")}

5. IMPORTANT PRECAUTIONS
${explanation.importantPrecautions.map((p) => `- ${p}`).join("\n")}

6. STORAGE INSTRUCTIONS
${explanation.storageInstructions}

7. PATIENT-FRIENDLY SIMPLIFIED EXPLANATION
${explanation.patientFriendlyExplanation}

8. FREQUENTLY ASKED QUESTIONS
${explanation.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}
      `.trim();

      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // Convert HTML5 Text to Speech
  const handleSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis is not supported on your browser.");
      return;
    }

    if (speechStatus === "playing") {
      window.speechSynthesis.pause();
      setSpeechStatus("paused");
      return;
    }

    if (speechStatus === "paused") {
      window.speechSynthesis.resume();
      setSpeechStatus("playing");
      return;
    }

    // New play
    window.speechSynthesis.cancel(); // Stop any pending speech
    
    // Read the simplified patient friendly explanation
    const speakText = `${medicineName}. ${explanation.overview}. Clinical Explanation: ${explanation.patientFriendlyExplanation}`;
    const newUtterance = new SpeechSynthesisUtterance(speakText);
    
    // Choose voice based on query language
    const voices = window.speechSynthesis.getVoices();
    let targetVoice = null;
    
    if (language === "Hindi") {
      targetVoice = voices.find(v => v.lang.includes("hi-IN") || v.lang.includes("hi_IN")) || null;
    } else if (language === "Telugu") {
      targetVoice = voices.find(v => v.lang.includes("te-IN") || v.lang.includes("te_IN")) || null;
    }
    
    if (targetVoice) {
      newUtterance.voice = targetVoice;
    } else {
      // standard fallback
      newUtterance.lang = language === "Hindi" ? "hi-IN" : language === "Telugu" ? "te-IN" : "en-US";
    }

    newUtterance.onend = () => {
      setSpeechStatus("stopped");
    };

    newUtterance.onerror = () => {
      setSpeechStatus("stopped");
    };

    setUtterance(newUtterance);
    window.speechSynthesis.speak(newUtterance);
    setSpeechStatus("playing");
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeechStatus("stopped");
    }
  };

  // Download PDF Dossier
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      let y = 20;
      const margin = 15;
      const pageWidth = doc.internal.pageSize.width;
      const maxLineWidth = pageWidth - (margin * 2);

      const addText = (text: string, fontSize: number, style: "normal" | "bold" | "italic" = "normal", color = [15, 23, 42]) => {
        doc.setFont("helvetica", style);
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxLineWidth);
        lines.forEach((line: string) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += fontSize * 0.45 + 2;
        });
        y += 2; // general gap
      };

      // Header Banner
      doc.setFillColor(13, 148, 136); // Teal primary
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("PharmaAI Clinical Explained Dossier", margin, 20);
      
      doc.setFontSize(10);
      doc.text(`GROUNDED DOSSIER FOR: ${medicineName.toUpperCase()} | TARGET LANG: ${language.toUpperCase()}`, margin, 30);
      
      y = 50;

      // Disclaimer Box
      doc.setFillColor(254, 242, 242); // pale rose
      doc.rect(margin - 2, y, maxLineWidth + 4, 30, "F");
      doc.setDrawColor(244, 63, 94); // rose border
      doc.rect(margin - 2, y, maxLineWidth + 4, 30, "S");
      
      y += 6;
      addText(`MEDICAL DISCLAIMER: ${disclaimer}`, 8, "italic", [225, 29, 72]);
      y = 88;

      // Section 1: Overview
      addText("1. CLINICAL OVERVIEW", 12, "bold", [13, 148, 136]);
      addText(explanation.overview, 10, "normal");
      y += 4;

      // Section 2: Clinical Uses
      addText("2. DIRECT INDICATIONS & USES", 12, "bold", [13, 148, 136]);
      explanation.commonUses.forEach((use) => {
        addText(`- ${use}`, 10, "normal");
      });
      y += 4;

      // Section 3: Mechanism of Action
      addText("3. MECHANISM OF ACTION (HOW IT WORKS)", 12, "bold", [13, 148, 136]);
      addText(explanation.howItWorks, 10, "normal");
      y += 4;

      // Section 4: Side Effects
      addText("4. SUSPECTED SIDE EFFECTS & COGENT RISKS", 12, "bold", [13, 148, 136]);
      explanation.commonSideEffects.forEach((se) => {
        addText(`- ${se}`, 10, "normal");
      });
      y += 4;

      // Section 5: Precautions
      addText("5. IMPORTANT HEALTH PRECAUTIONS", 12, "bold", [13, 148, 136]);
      explanation.importantPrecautions.forEach((prec) => {
        addText(`- ${prec}`, 10, "normal");
      });
      y += 4;

      // Section 6: Preservation Profile
      addText("6. PHARMACEUTICAL SHELF STORAGE", 12, "bold", [13, 148, 136]);
      addText(explanation.storageInstructions, 10, "normal");
      y += 4;

      // Section 7: Patient Analogy
      addText("7. SIMPLIFIED FAMILY GUIDE (ANALOGY)", 12, "bold", [13, 148, 136]);
      addText(explanation.patientFriendlyExplanation, 10, "normal", [71, 85, 105]);

      // Save file
      doc.save(`${medicineName.replace(/\s+/g, "_")}_Dossier.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to export PDF file.");
    }
  };

  return (
    <div className="space-y-6" id="clinical-dossier-root">
      {/* HEADER SECTION PANEL */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm frosted-glass-card ${
        isDark ? "border-white/10" : "bg-white/60 border-slate-200 light-theme-shadow"
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 fill-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading">{medicineName}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">Synthesized Educational Dossier • {language}</p>
          </div>
        </div>

        {/* WORK ACTIONS BUTTONS */}
        <div className="flex flex-wrap items-center gap-2" id="dossier-actions-dashboard">
          {/* Read Aloud Speaking helper */}
          <button
            onClick={handleSpeech}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all frosted-glass-card ${
              speechStatus === "playing"
                ? "bg-amber-500 text-white border-amber-500 animate-pulse"
                : isDark
                  ? "bg-slate-950/20 border-white/10 text-slate-300 hover:border-white/20"
                  : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Read simplified summary"
          >
            {speechStatus === "playing" ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Assist</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Read Explanation</span>
              </>
            )}
          </button>

          {speechStatus !== "stopped" && (
            <button
              onClick={handleStopSpeech}
              className="p-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all border border-rose-500 text-xs font-bold"
              title="Stop TTS Playback"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}

          {/* Copy markdown text button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all frosted-glass-card ${
              copied
                ? "bg-sky-500 text-white border-sky-400"
                : isDark
                  ? "bg-slate-950/20 border-white/10 text-slate-300 hover:border-white/20"
                  : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Copy entire dossier as clinical markdown text"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied Check</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {/* Download PDF file button */}
          <button
            onClick={downloadPDF}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all frosted-glass-card ${
              isDark
                ? "bg-slate-950/20 border-white/10 text-slate-300 hover:border-white/20"
                : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-3xs"
            }`}
            title="Compile and download offline clinical dossier"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* DETAILED DOSSIER SECTIONS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="bento-grid-report">
        
        {/* Card 1: Overview Description (Wide top left) */}
        <div className={`md:col-span-2 rounded-2xl border p-5 md:p-6 shadow-sm transition-all relative frosted-glass-card ${
          isDark ? "border-white/10" : "bg-white/60 border-slate-200 light-theme-shadow"
        }`} id="bento-overview">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-2">
            <BookmarkCheck className="w-4 h-4" />
            Clinical Synthesis Synopsis
          </span>
          <h3 className="text-lg font-bold font-heading mb-3 text-slate-100 dark:text-slate-100 light:text-slate-900">1. Medical Overview</h3>
          <p className="text-sm leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-700 font-normal">
            {explanation.overview}
          </p>
        </div>

        {/* Card 2: Safe Shelf Storage (Standard right) */}
        <div className={`rounded-2xl border p-5 md:p-6 shadow-sm transition-all frosted-glass-card ${
          isDark ? "border-white/10" : "bg-white/60 border-slate-150 light-theme-shadow"
        }`} id="bento-storage">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-2">
            <Compass className="w-4 h-4 text-slate-400" />
            Preservation Manual
          </span>
          <h3 className="text-lg font-bold font-heading mb-3 text-slate-100 dark:text-slate-100 light:text-slate-900">2. Storage Safety</h3>
          <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-700 font-normal">
            {explanation.storageInstructions}
          </p>
        </div>

        {/* Card 3: Action Mechanics / Biological Path (Wide Bottom left) */}
        <div className={`md:col-span-2 rounded-2xl border p-5 md:p-6 shadow-sm transition-all relative overflow-hidden frosted-glass-card ${
          isDark ? "border-white/10" : "bg-white/60 border-slate-100 light-theme-shadow"
        }`} id="bento-mechanics">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
            <Activity className="w-4 h-4" />
            Biomedical Pathway Mapping
          </span>
          <h3 className="text-lg font-bold font-heading mb-3 text-slate-100 dark:text-slate-100 light:text-slate-900">3. How It Operates (Mechanism)</h3>
          <p className="text-sm leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-700">
            {explanation.howItWorks}
          </p>
        </div>

        {/* Card 4: Indications List (Right) */}
        <div className={`rounded-2xl border p-5 md:p-6 shadow-sm transition-all frosted-glass-card ${
          isDark ? "border-white/10" : "bg-white/60 border-slate-100"
        }`} id="bento-indications">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 mb-2">
            <BadgeCheck className="w-4 h-4 text-sky-400" />
            Approved Indications
          </span>
          <h3 className="text-lg font-bold font-heading mb-3 text-slate-100 dark:text-slate-100 light:text-slate-900">4. Primary Uses</h3>
          <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-700">
            {explanation.commonUses.map((use, i) => (
              <li key={i} className="flex gap-2 items-start leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5 animate-pulse" />
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 5: Side Effects Warnings (Standard Left) */}
        <div className={`rounded-2xl border p-5 md:p-6 shadow-sm transition-all frosted-glass-card ${
          isDark ? "border-white/10" : "bg-white/60 border-slate-100"
        }`} id="bento-side-effects">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-rose flex items-center gap-1.5 mb-2">
            <Flame className="w-4 h-4 text-accent-rose animate-pulse" />
            Adverse Side-Effects Risk
          </span>
          <h3 className="text-lg font-bold font-heading mb-3 text-slate-100 dark:text-slate-100 light:text-slate-900">5. Side Effects</h3>
          <ul className="space-y-2 text-xs text-rose-950 dark:text-rose-300 light:text-rose-900">
            {explanation.commonSideEffects.map((se, i) => (
              <li key={i} className="flex gap-2 items-start leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-rose shrink-0 mt-1.5" />
                <span>{se}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 6: Health Precautions Warnings (Wide center bottom) */}
        <div className={`md:col-span-2 rounded-2xl border p-5 md:p-6 shadow-sm transition-all frosted-glass-card ${
          isDark ? "border-white/10" : "bg-white/60 border-slate-100"
        }`} id="bento-precautions">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-rose flex items-center gap-1.5 mb-2">
            <ShieldAlert className="w-4 h-4 text-accent-rose" />
            Mandatory Consumer Safety Rules
          </span>
          <h3 className="text-lg font-bold font-heading mb-3 text-rose-300 dark:text-rose-300 light:text-rose-950">6. Clinical Precautions</h3>
          <ul className="space-y-2.5 text-xs text-slate-400 dark:text-slate-400 light:text-slate-700">
            {explanation.importantPrecautions.map((prec, i) => (
              <li key={i} className="flex gap-2.5 items-start leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-rose shrink-0 mt-1.5" />
                <span>{prec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 7: Warm Simplified Guide / Analogy (Full width) */}
        <div className={`col-span-1 md:col-span-3 rounded-2xl border p-6 md:p-8 shadow-md transition-all relative overflow-hidden frosted-glass-card ${
          isDark 
            ? "border-sky-500/20 shadow-sky-950/10" 
            : "bg-white/80 border-slate-200 shadow-sky-100/30"
        }`} id="bento-analogy">
          
          <div className="flex items-start gap-4" id="analogy-intro-box">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white shrink-0 shadow-lg shadow-sky-500/25">
              <Quote className="w-6 h-6 transform rotate-180" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Patient-Friendly Family Translation</span>
              <h3 className="text-xl font-bold font-heading text-slate-100 dark:text-slate-100 light:text-slate-900">7. Simplified Clinical Explanation</h3>
              <p className="text-sm md:text-base leading-relaxed text-slate-300 dark:text-slate-300 light:text-slate-700 font-normal italic">
                "{explanation.patientFriendlyExplanation}"
              </p>
            </div>
          </div>
        </div>

        {/* Card 8: FAQ Accordion Panel (Full width) */}
        <div className={`col-span-1 md:col-span-3 rounded-2xl border p-5 md:p-6 shadow-sm transition-all frosted-glass-card ${
          isDark ? "border-white/10" : "bg-white/60 border-slate-100"
        }`} id="bento-faq-cabinet">
          <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2 text-sky-400">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            Frequently Asked Patient Queries
          </h3>
          <div className="space-y-3" id="accordion-list">
            {explanation.faqs.map((faq, index) => {
              const isActive = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className={`border rounded-xl transition-all frosted-glass-card ${
                    isActive 
                      ? isDark ? "bg-slate-950/60 border-sky-400/30" : "bg-sky-50/20 border-sky-400/20"
                      : isDark ? "bg-slate-950/20 border-white/5 hover:border-white/10" : "bg-white/40 border-slate-150 hover:border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isActive ? null : index)}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-semibold font-heading outline-none text-slate-200 dark:text-slate-200 light:text-slate-800"
                  >
                    <span>{faq.question}</span>
                    <span className="text-xs font-bold text-sky-400 ml-2">
                      {isActive ? "Collapse ▲" : "Expand ▼"}
                    </span>
                  </button>
                  {isActive && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed border-t border-dashed border-white/5 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
