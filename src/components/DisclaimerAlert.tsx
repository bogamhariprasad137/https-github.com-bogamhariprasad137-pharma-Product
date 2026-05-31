import React from "react";
import { ShieldAlert, AlertCircle, HeartCrack, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface DisclaimerAlertProps {
  isDark: boolean;
}

export default function DisclaimerAlert({ isDark }: DisclaimerAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border p-5 md:p-6 mb-8 transition-all relative overflow-hidden frosted-glass-card ${
        isDark
          ? "border-rose-500/20 text-rose-200"
          : "bg-rose-50/80 border-rose-200 text-rose-950 light-theme-shadow"
      }`}
    >
      {/* Decorative side accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" 
        id="safety-disclaimer-accent"
      />
      
      <div className="flex flex-col md:flex-row gap-4 items-start" id="safety-disclaimer-container">
        <div className={`p-3 rounded-xl shrink-0 ${isDark ? "bg-rose-950/20 text-rose-400 border border-rose-500/10" : "bg-rose-100/80 text-rose-600 border border-rose-200"}`}>
          <ShieldAlert className="w-6 h-6" id="safety-disclaimer-icon" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-base font-semibold tracking-tight font-heading flex items-center gap-2">
            Clinical Safety & Legal Medical Disclaimer
          </h3>
          <p className="text-sm leading-relaxed opacity-90">
            <strong>Important Medical Disclaimer:</strong> This platform utilizes Retrieval-Augmented Generation (RAG) combined with Google Gemini AI for pharmaceutical educational exploration. 
            All insights generated are for <strong>educational purposes only</strong>. This information is <strong>not</strong> medical advice, official diagnosis, clinical treatment, or a prescription. 
            Always consult a qualified primary healthcare physician or pharmacist before starting, changing, or stopping any medication.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs opacity-90" id="safety-boundaries-grid">
            <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border ${isDark ? "bg-slate-950/40 border-white/5" : "bg-white/80 border-slate-100"}`}>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Never diagnoses symptoms or diseases</span>
            </div>
            <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border ${isDark ? "bg-slate-950/40 border-white/5" : "bg-white/80 border-slate-100"}`}>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Never offers customized dosage scales</span>
            </div>
            <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border ${isDark ? "bg-slate-950/40 border-white/5" : "bg-white/80 border-slate-100"}`}>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Never prescribes therapeutic regimens</span>
            </div>
            <div className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border ${isDark ? "bg-slate-950/40 border-white/5" : "bg-white/80 border-slate-100"}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span>Synthesizes strictly vetted clinical data</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
