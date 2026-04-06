export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const MODEL = "llama-3.3-70b-versatile";
export const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const CATEGORY = {
  companies: {
    label: "Target Companies",
    color: "#0284c7",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    badge: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    barColor: "#0ea5e9",
  },
  adjacent: {
    label: "Adjacent Talent Pools",
    color: "#7c3aed",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
    barColor: "#8b5cf6",
  },
  wildcards: {
    label: "Wildcard Bets",
    color: "#d97706",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    barColor: "#f59e0b",
  },
  titles: {
    label: "Target Titles",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    barColor: "#10b981",
  },
};

export const STAGE_STYLES = {
  "Public":     "bg-sky-100 text-sky-700 border-sky-200",
  "Enterprise": "bg-sky-100 text-sky-700 border-sky-200",
  "Late Stage": "bg-violet-100 text-violet-700 border-violet-200",
  "Series C+":  "bg-violet-100 text-violet-700 border-violet-200",
  "Series B":   "bg-amber-100 text-amber-700 border-amber-200",
  "Series A":   "bg-orange-100 text-orange-700 border-orange-200",
  "Seed":       "bg-rose-100 text-rose-700 border-rose-200",
};

export const SENIORITY_OPTIONS = ["Junior", "Mid", "Senior", "Staff", "Principal", "Director", "VP"];

export const PRESETS = [
  {
    label: "Staff Backend Eng",
    form: { role: "Staff Backend Engineer", seniority: "Staff", skills: ["Go", "Kubernetes", "PostgreSQL", "Distributed Systems"], industries: ["Cloud Infrastructure", "Developer Tools"], company: "", location: "", exclusions: [] },
  },
  {
    label: "Product Designer",
    form: { role: "Senior Product Designer", seniority: "Senior", skills: ["Figma", "Design Systems", "User Research", "Prototyping"], industries: ["SaaS", "Fintech"], company: "", location: "", exclusions: [] },
  },
  {
    label: "Data Scientist",
    form: { role: "Senior Data Scientist", seniority: "Senior", skills: ["Python", "ML", "SQL", "A/B Testing", "Statistical Modeling"], industries: ["E-commerce", "AdTech"], company: "", location: "", exclusions: [] },
  },
  {
    label: "GTM Leader",
    form: { role: "VP of Sales", seniority: "VP", skills: ["Enterprise Sales", "Team Building", "Revenue Operations", "Strategic Partnerships"], industries: ["B2B SaaS", "Data Infrastructure"], company: "", location: "", exclusions: [] },
  },
];

export const EMPTY_MAP = { companies: [], adjacent: [], wildcards: [], titles: [] };
