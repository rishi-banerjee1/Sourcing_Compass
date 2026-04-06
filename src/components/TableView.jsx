import { useState } from "react";
import { CATEGORY, STAGE_STYLES } from "../lib/constants.js";
import CompanyScores from "./CompanyScores.jsx";

const SORTABLE_COLUMNS = [
  { key: "label", label: "Name", width: "w-[180px]" },
  { key: "category", label: "Category", width: "w-[140px]" },
  { key: "stage", label: "Stage", width: "w-[100px]" },
  { key: "confidence", label: "Confidence", width: "w-[100px]" },
  { key: "poachability", label: "Poachability", width: "w-[110px]" },
  { key: "talentDensity", label: "Density", width: "w-[90px]" },
  { key: "sub", label: "Why", width: "flex-1" },
];

function flattenNodes(mapData) {
  const rows = [];
  for (const [catKey, nodes] of Object.entries(mapData)) {
    if (!Array.isArray(nodes)) continue;
    for (const node of nodes) {
      rows.push({ ...node, category: catKey });
    }
  }
  return rows;
}

function SortIcon({ active, direction }) {
  return (
    <svg className={`w-3 h-3 ml-0.5 inline-block ${active ? "text-gray-700" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      {direction === "asc" ? (
        <path d="M5 15l7-7 7 7" />
      ) : (
        <path d="M19 9l-7 7-7-7" />
      )}
    </svg>
  );
}

function ScoreCell({ value, color }) {
  if (value == null) return <span className="text-gray-300">—</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[60px]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-medium text-gray-600 tabular-nums w-7 text-right">{value}</span>
    </div>
  );
}

export default function TableView({ mapData }) {
  const [sortKey, setSortKey] = useState("confidence");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedId, setExpandedId] = useState(null);

  const rows = flattenNodes(mapData);

  const sorted = [...rows].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
    if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleCopyAll() {
    const header = "Name\tCategory\tStage\tConfidence\tPoachability\tDensity\tWhy\tTags";
    const lines = sorted.map(
      (r) =>
        `${r.label}\t${CATEGORY[r.category]?.label || r.category}\t${r.stage || ""}\t${r.confidence ?? ""}\t${r.poachability ?? ""}\t${r.talentDensity ?? ""}\t${r.sub || ""}\t${(r.tags || []).join(", ")}`
    );
    navigator.clipboard.writeText([header, ...lines].join("\n"));
  }

  function handleDownloadCSV() {
    const header = "Name,Category,Stage,Confidence,Poachability,Talent Density,Why,Tags,Likely Profile";
    const lines = sorted.map(
      (r) =>
        `"${r.label}","${CATEGORY[r.category]?.label || r.category}","${r.stage || ""}",${r.confidence ?? ""},${r.poachability ?? ""},${r.talentDensity ?? ""},"${(r.sub || "").replace(/"/g, '""')}","${(r.tags || []).join("; ")}","${(r.likelyProfile || "").replace(/"/g, '""')}"`
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sourcing-compass-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Export bar */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
          </svg>
          Copy All
        </button>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download CSV
        </button>
        <span className="text-xs text-gray-400 ml-auto">{sorted.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {SORTABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors ${col.width}`}
                  >
                    {col.label}
                    <SortIcon active={sortKey === col.key} direction={sortKey === col.key ? sortDir : "desc"} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const cat = CATEGORY[row.category];
                const isExpanded = expandedId === row.id;
                return (
                  <tr key={row.id} className="group">
                    <td colSpan={SORTABLE_COLUMNS.length} className="p-0">
                      {/* Main row */}
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        className={`flex items-center cursor-pointer transition-colors ${
                          isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-[180px] px-4 py-3">
                          <span className="font-medium text-gray-900">{row.label}</span>
                        </div>
                        <div className="w-[140px] px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cat?.dot}`} />
                            <span className="text-xs text-gray-600">{cat?.label}</span>
                          </span>
                        </div>
                        <div className="w-[100px] px-4 py-3">
                          {row.stage && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STAGE_STYLES[row.stage] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                              {row.stage}
                            </span>
                          )}
                        </div>
                        <div className="w-[100px] px-4 py-3">
                          <ScoreCell value={row.confidence} color="#10b981" />
                        </div>
                        <div className="w-[110px] px-4 py-3">
                          <ScoreCell value={row.poachability} color="#f59e0b" />
                        </div>
                        <div className="w-[90px] px-4 py-3">
                          <ScoreCell value={row.talentDensity} color="#0ea5e9" />
                        </div>
                        <div className="flex-1 px-4 py-3">
                          <span className="text-xs text-gray-500 line-clamp-1">{row.sub}</span>
                        </div>
                      </div>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-6 pt-3">
                            <div>
                              {row.tags?.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1.5">Tags</div>
                                  <div className="flex flex-wrap gap-1">
                                    {row.tags.map((t) => (
                                      <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat?.badge}`}>{t}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {row.sub && (
                                <div>
                                  <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1">Details</div>
                                  <div className="text-xs text-gray-600">{row.sub}</div>
                                </div>
                              )}
                            </div>
                            <div>
                              {row.category === "companies" && <CompanyScores node={row} />}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Row border */}
                      <div className="border-b border-gray-100" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
