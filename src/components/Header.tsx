import React from "react";
import { Pill, Sun, Moon, ShieldCheck, HeartPulse } from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  return (
    <header className="py-6 border-b border-white/10 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white shadow-lg shadow-sky-500/20 col-span-1">
            <Pill className="w-7 h-7" id="header-logo-icon" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                PharmaAI
              </h1>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-400/20">
                Product Explainer
              </span>
            </div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Professional Clinical Drug Context & AI-Synthesized Patient Guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3" id="header-controls">
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border frosted-glass-card ${
            isDark 
              ? "border-white/10 text-slate-300" 
              : "bg-white/80 border-slate-200 text-slate-700 shadow-sm"
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Vetted Local RAG Cache</span>
          </div>

          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border frosted-glass-card ${
            isDark 
              ? "border-white/10 text-slate-300" 
              : "bg-white/80 border-slate-200 text-slate-600 shadow-sm"
          }`}>
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clinical Compliance</span>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all frosted-glass-card ${
              isDark
                ? "border-white/10 text-amber-400 hover:bg-white/5"
                : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle visual theme"
            id="theme-toggler-btn"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
