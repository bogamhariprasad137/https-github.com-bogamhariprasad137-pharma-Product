import React, { useState, useEffect } from "react";
import { Search, Globe, ChevronDown, Check, RefreshCw } from "lucide-react";
import { Medicine, SupportedLanguage } from "../types";

interface MedicineSelectorProps {
  medicines: Medicine[];
  selectedMedicineId: string;
  onSelectMedicine: (id: string) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isDark: boolean;
}

export default function MedicineSelector({
  medicines,
  selectedMedicineId,
  onSelectMedicine,
  selectedLanguage,
  onSelectLanguage,
  onGenerate,
  isLoading,
  isDark
}: MedicineSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter medicines based on user typed queries
  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMedicine = medicines.find((m) => m.id === selectedMedicineId);

  return (
    <div className={`rounded-2xl border p-5 md:p-6 frosted-glass-card shadow-sm transition-all ${
      isDark ? "border-white/10" : "bg-white/60 border-slate-200 light-theme-shadow"
    }`} id="selector-panel-card">
      <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2 font-heading text-sky-400">
        <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
        Drug & Language Configuration
      </h2>

      {/* SEARCH OR SELECT MEDICINE */}
      <div className="space-y-4">
        <div className="relative" id="dropdown-outer-container">
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            Search or Select Medicine
          </label>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left text-sm transition-all outline-none frosted-glass-card ${
                isDark 
                  ? "bg-slate-950/45 border-white/10 text-slate-100 hover:border-white/20" 
                  : "bg-white/80 border-slate-200 text-slate-900 hover:border-slate-300"
              }`}
              id="medicine-dropdown-btn"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>{activeMedicine ? activeMedicine.name : "Choose medication..."}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className={`absolute z-30 w-full mt-2 rounded-xl border shadow-xl overflow-hidden frosted-glass-card ${
                isDark ? "bg-slate-950/95 border-white/10 text-white" : "bg-white/95 border-slate-200"
              }`} id="dropdown-menu-list">
                <div className="p-2 border-b border-white/10">
                  <input
                    type="text"
                    placeholder="Search medicines, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none frosted-glass-card ${
                      isDark
                        ? "bg-slate-900/60 border-white/10 text-slate-100 focus:border-sky-500"
                        : "bg-white border-slate-200 text-slate-900 focus:border-sky-500"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    id="medicine-search-input"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {filteredMedicines.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No medicines found match.</div>
                  ) : (
                    filteredMedicines.map((med) => (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => {
                          onSelectMedicine(med.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-sky-500/10 transition-colors ${
                          med.id === selectedMedicineId 
                            ? isDark ? "bg-sky-950/40 text-sky-400" : "bg-sky-50 text-sky-700"
                            : isDark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{med.name}</p>
                          <p className="text-2xs opacity-80 mt-0.5">{med.category}</p>
                        </div>
                        {med.id === selectedMedicineId && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QUICK PILL SELECTIONS */}
        <div id="quick-pick-panel">
          <span className={`block text-2xs font-semibold uppercase tracking-wider mb-2 ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}>
            Quick-Select Clinical Reference Samples
          </span>
          <div className="flex flex-wrap gap-1.5" id="quick-pills-list">
            {medicines.map((med) => {
              const isSelected = med.id === selectedMedicineId;
              return (
                <button
                  key={med.id}
                  onClick={() => onSelectMedicine(med.id)}
                  className={`text-2xs px-2.5 py-1.5 rounded-lg border transition-all frosted-glass-card ${
                    isSelected
                      ? "bg-sky-500 text-white border-sky-400 font-semibold"
                      : isDark
                        ? "bg-slate-950/20 border-white/10 text-slate-300 hover:border-white/20"
                        : "bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300 shadow-3xs"
                  }`}
                >
                  {med.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* LANGUAGE SELECTION */}
        <div id="language-selection-panel">
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            Target Explanation Language
          </label>
          <div className="grid grid-cols-3 gap-2" id="languages-grid-input">
            {(["English", "Hindi", "Telugu"] as SupportedLanguage[]).map((lang) => {
              const isSelected = selectedLanguage === lang;
              const subText = lang === "English" ? "Global" : lang === "Hindi" ? "हिन्दी" : "తెలుగు";
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onSelectLanguage(lang)}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-center transition-all frosted-glass-card ${
                    isSelected
                      ? isDark
                        ? "bg-sky-950/30 border-sky-400 text-sky-400 ring-1 ring-sky-500"
                        : "bg-sky-50/80 border-sky-400 text-sky-700 ring-1 ring-sky-500"
                      : isDark
                        ? "bg-slate-950/20 border-white/10 text-slate-300 hover:border-white/20"
                        : "bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{lang}</span>
                  <span className="text-3xs opacity-80 mt-1">{subText}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBMISSION ACTION */}
        <button
          onClick={onGenerate}
          disabled={isLoading || !selectedMedicineId}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold font-heading text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            isLoading || !selectedMedicineId
              ? "cursor-not-allowed opacity-50 bg-slate-500/20 text-slate-400"
              : "bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-500 hover:from-sky-400 hover:to-emerald-500 text-white shadow-lg shadow-sky-500/20 clinical-pulse-button"
          }`}
          id="trigger-gemini-btn"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Pharmacology Context...</span>
            </>
          ) : (
            <>
              <span>Generate AI Product Explanation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
