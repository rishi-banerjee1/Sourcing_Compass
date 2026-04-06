import { useState } from "react";
import { CATEGORY, STAGE_STYLES } from "../lib/constants.js";
import CompanyScores from "./CompanyScores.jsx";
import ScoreBar from "./ScoreBar.jsx";

export default function NodeCard({ node, category, onHover, isActive }) {
  const [expanded, setExpanded] = useState(false);
  const s = CATEGORY[category];

  const hasDetails =
    category === "companies" &&
    (node.talentDensity != null || node.likelyProfile || node.poachabilitySignals?.length);

  function handleClick(e) {
    if (hasDetails) {
      setExpanded((v) => !v);
    }
  }

  function handleCopy(e) {
    e.stopPropagation();
    const text = `${node.label} — ${node.sub || ""}${node.stage ? ` · ${node.stage}` : ""}${node.confidence != null ? ` · Confidence: ${node.confidence}%` : ""}`;
    navigator.clipboard.writeText(text);
  }

  return (
    <div
      id={`node-${node.id}`}
      onMouseEnter={() => onHover(node)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
      className={`relative bg-white rounded-xl border p-4 select-none card-lift group ${
        hasDetails ? "cursor-pointer" : "cursor-default"
      } ${
        isActive
          ? `border-2 shadow-lg ${s.border}`
          : "border-gray-200 shadow-sm hover:border-gray-300"
      }`}
    >
      {/* Colored top accent bar */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 rounded-b"
        style={{ background: s.color }}
      />

      {/* Copy button — appears on hover */}
      <button
        onClick={handleCopy}
        title="Copy to clipboard"
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
        </svg>
      </button>

      <div className="flex items-start justify-between gap-2 mb-1.5 pr-6">
        <div className="text-sm font-semibold text-gray-900 leading-tight">{node.label}</div>
        {node.stage && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap flex-shrink-0 ${
              STAGE_STYLES[node.stage] || "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {node.stage}
          </span>
        )}
      </div>

      {node.sub && <div className="text-xs text-gray-500 mb-2">{node.sub}</div>}

      {node.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {node.tags.map((t) => (
            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Compact confidence bar — always visible for companies */}
      {category === "companies" && node.confidence != null && !expanded && (
        <div className="mt-3">
          <ScoreBar label="Relevance" value={node.confidence} color="#10b981" />
        </div>
      )}

      {/* Expanded details — click to toggle */}
      {category === "companies" && expanded && <CompanyScores node={node} />}

      {/* Title confidence */}
      {category === "titles" && node.confidence != null && (
        <div className="mt-3">
          <ScoreBar
            label="Match Confidence"
            value={node.confidence}
            color={node.confidence >= 80 ? "#10b981" : node.confidence >= 60 ? "#f59e0b" : "#ef4444"}
          />
        </div>
      )}

      {/* Bottom row: expand hint + connection count */}
      <div className="flex items-center justify-between mt-2">
        {hasDetails && (
          <span className="text-[10px] text-gray-400">
            {expanded ? "Click to collapse" : "Click for details"}
          </span>
        )}
        {node.connections?.length > 0 && (
          <span className="text-[10px] text-gray-400 font-medium ml-auto">
            {node.connections.length} link{node.connections.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
