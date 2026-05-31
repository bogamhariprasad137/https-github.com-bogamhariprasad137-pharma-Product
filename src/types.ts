export interface Medicine {
  id: string;
  name: string;
  category: string;
  uses: string[];
  sideEffects: string[];
  precautions: string[];
  storage: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ExplanationData {
  overview: string;
  commonUses: string[];
  howItWorks: string;
  commonSideEffects: string[];
  importantPrecautions: string[];
  storageInstructions: string;
  patientFriendlyExplanation: string;
  faqs: FAQItem[];
}

export interface PharmaAIResponse {
  medicineId: string;
  medicineName: string;
  language: string;
  explanation: ExplanationData;
  disclaimer: string;
}

export type SupportedLanguage = "English" | "Hindi" | "Telugu";
