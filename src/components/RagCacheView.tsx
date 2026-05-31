import React from "react";
import { Database, HelpCircle, ShieldAlert, BadgeCheck, Compass } from "lucide-react";
import { Medicine } from "../types";

interface RagCacheViewProps {
  activeMedicine: Medicine | undefined;
  isDark: boolean;
}

export default function RagCacheView({ activeMedicine, isDark }: RagCacheViewProps) {
  if (!activeMedicine) {
    return (
      <div className={`p-6 rounded-2xl border text-center text-sm frosted-glass-card ${
        isDark ? "border-white/10 text-slate-500" : "bg-white/60 border-slate-200 light-theme-shadow text-slate-400"
      }`} id="rag-cache-empty">
        Please select a medicine above to examine the local grounding context cash.
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-5 md:p-6 frosted-glass-card shadow-sm transition-all relative overflow-hidden ${
      isDark ? "border-white/10" : "bg-white/60 border-slate-200 light-theme-shadow"
    }`} id="rag-cache-dashboard-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 font-heading text-sky-400">
          <Database className="w-5 h-5" />
          Local Grounding Context (RAG Factsheet)
        </h2>
        <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-400/20 w-fit">
          Step 1: Fact Sheet Loaded
        </span>
      </div>

      <p className={`text-xs mb-4 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        Below are the clinically vetted, local database parameters for <strong>{activeMedicine.name}</strong>. 
        These strictly verified coordinates are injected directly into Gemini's system instructions to prevent hallucinatory outputs.
      </p>

      {/* RAG PARAMETERS COMPILATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" id="rag-parameters-box">
        {/* Category Header */}
        <div className={`p-4 rounded-xl border col-span-1 md:col-span-2 frosted-glass-card ${
          isDark ? "bg-slate-950/40 border-white/5" : "bg-white/80 border-slate-100 shadow-3xs"
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Clinical Formulation Group</span>
          <p className="text-sm font-semibold mt-1 font-heading text-slate-100 dark:text-slate-100 light:text-slate-900">{activeMedicine.category}</p>
        </div>

        {/* Primary Uses */}
        <div className={`p-4 rounded-xl border frosted-glass-card ${
          isDark ? "bg-slate-950/20 border-white/5" : "bg-white/70 border-slate-100 shadow-3xs"
        }`} id="rag-primary-uses">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-2">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            Vetted Indications
          </span>
          <ul className="space-y-1.5 list-disc pl-4 text-slate-400 transition-colors">
            {activeMedicine.uses.map((use, index) => (
              <li key={index} className="leading-normal">{use}</li>
            ))}
          </ul>
        </div>

        {/* Cautions */}
        <div className={`p-4 rounded-xl border frosted-glass-card ${
          isDark ? "bg-slate-950/20 border-white/5" : "bg-white/70 border-slate-100 shadow-3xs"
        }`} id="rag-cautions">
          <span className="flex items-center gap-1.5 font-semibold text-amber-400 mb-2">
            <ShieldAlert className="w-4 h-4" />
            Static Safe Cautions
          </span>
          <ul className="space-y-1.5 list-disc pl-4 text-slate-404 transition-colors">
            {activeMedicine.precautions.map((prec, index) => (
              <li key={index} className="leading-normal">{prec}</li>
            ))}
          </ul>
        </div>

        {/* Shelf Storage */}
        <div className={`p-4 rounded-xl border col-span-1 md:col-span-2 frosted-glass-card ${
          isDark ? "bg-slate-950/20 border-white/5" : "bg-white/70 border-slate-100 shadow-3xs"
        }`} id="rag-storage">
          <span className="flex items-center gap-1.5 font-semibold text-slate-400 mb-1.5">
            <Compass className="w-4 h-4 text-sky-400" />
            Apothecary Preservation Guidelines
          </span>
          <p className="text-slate-400 leading-normal pl-5">{activeMedicine.storage}</p>
        </div>
      </div>
    </div>
  );
}
