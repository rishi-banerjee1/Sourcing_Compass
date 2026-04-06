import { useState } from "react";
import { CATEGORY, SENIORITY_OPTIONS, PRESETS } from "../lib/constants.js";
import TagInput from "./TagInput.jsx";
import HistoryPanel from "./HistoryPanel.jsx";
import { loadHistory } from "../lib/storage.js";

export default function Sidebar({ form, onChange, onGenerate, loading, error, generated, onRestore }) {
  const [showHistory, setShowHistory] = useState(false);
  const set = (k, v) => onChange({ ...form, [k]: v });
  const historyCount = loadHistory().length;

  function applyPreset(preset) {
    onChange({ ...preset.form });
  }

  return (
    <div className="w-[340px] min-w-[300px] border-r border-gray-200 flex flex-col bg-white max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:shadow-xl">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            SC
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Sourcing Compass</div>
            <div className="text-[11px] text-gray-400">Talent Intelligence</div>
          </div>
        </div>
      </div>

      {/* Quick-start presets */}
      {!generated && (
        <div className="px-5 pt-3 pb-1">
          <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-2">
            Quick start
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-5 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Role Title *</label>
            <input
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="e.g. Staff Engineer"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Hiring Company</label>
            <input
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="e.g. Atlan"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label>
            <input
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="e.g. North America"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Seniority</label>
            <select
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              value={form.seniority}
              onChange={(e) => set("seniority", e.target.value)}
            >
              <option value="">Select level</option>
              {SENIORITY_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Must-Have Skills</label>
          <TagInput
            placeholder="Type a skill, press comma or Enter"
            tags={form.skills}
            onChange={(v) => set("skills", v)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Preferred Industries</label>
          <TagInput
            placeholder="e.g. Fintech, Data"
            tags={form.industries}
            onChange={(v) => set("industries", v)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Exclusions</label>
          <TagInput
            placeholder="Companies or industries to skip"
            tags={form.exclusions}
            onChange={(v) => set("exclusions", v)}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating Map...
            </span>
          ) : (
            "Generate Map"
          )}
        </button>
      </div>

      {/* Footer: Legend + History toggle */}
      <div className="border-t border-gray-100">
        {showHistory ? (
          <HistoryPanel
            onRestore={onRestore}
            onClose={() => setShowHistory(false)}
          />
        ) : (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                Legend
              </div>
              {historyCount > 0 && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  History ({historyCount})
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              {Object.entries(CATEGORY).map(([k, s]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                  <span className="text-[11px] text-gray-500">{s.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-4 border-t-2 border-dashed border-blue-400" />
                <span className="text-[11px] text-gray-500">Hover = connections</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
