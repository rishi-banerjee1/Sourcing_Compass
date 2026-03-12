import { useState, useRef, useEffect } from "react";

// ─── Constants ───────────────────────────────────────────

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const CATEGORY = {
  companies: {
    label: "Target Companies",
    color: "#0284c7",       // sky-600
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    badge: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    barColor: "#0ea5e9",
  },
  adjacent: {
    label: "Adjacent Talent Pools",
    color: "#7c3aed",       // violet-600
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
    barColor: "#8b5cf6",
  },
  wildcards: {
    label: "Wildcard Bets",
    color: "#d97706",       // amber-600
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    barColor: "#f59e0b",
  },
  titles: {
    label: "Target Titles",
    color: "#059669",       // emerald-600
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    barColor: "#10b981",
  },
};

const STAGE_STYLES = {
  "Public":     "bg-sky-100 text-sky-700 border-sky-200",
  "Enterprise": "bg-sky-100 text-sky-700 border-sky-200",
  "Late Stage": "bg-violet-100 text-violet-700 border-violet-200",
  "Series C+":  "bg-violet-100 text-violet-700 border-violet-200",
  "Series B":   "bg-amber-100 text-amber-700 border-amber-200",
  "Series A":   "bg-orange-100 text-orange-700 border-orange-200",
  "Seed":       "bg-rose-100 text-rose-700 border-rose-200",
};

const SENIORITY_OPTIONS = ["Junior", "Mid", "Senior", "Staff", "Principal", "Director", "VP"];

// ─── Prompt Builder (the engine) ─────────────────────────

function buildPrompt(form) {
  return `You are a talent intelligence system. Return a structured talent map as JSON only — no markdown, no explanation, no backticks.

Role: ${form.role}
Hiring Company: ${form.company}
Location: ${form.location}
Seniority: ${form.seniority}
Skills: ${form.skills.join(", ")}
Preferred Industries: ${form.industries.join(", ") || "Any"}
Exclusions (do NOT include these): ${form.exclusions.join(", ") || "None"}

Return this exact JSON structure:
{
  "companies": [{
    "id": "c1",
    "label": "Company Name",
    "sub": "Industry · Size",
    "tags": ["tag1", "tag2"],
    "connections": ["w1"],
    "confidence": 85,
    "stage": "Series B",
    "talentDensity": 78,
    "poachability": 65,
    "likelyProfile": "One sentence describing the typical engineer background.",
    "poachabilitySignals": ["[Signal] First reason", "[Confirmed] Second reason"]
  }],
  "adjacent": [{ "id": "a1", "label": "Company Name", "sub": "Why their talent is transferable", "tags": ["tag1"], "connections": ["c1"] }],
  "wildcards": [{ "id": "w1", "label": "Real Company Name", "sub": "Specific reason why their engineers are a surprising but valid match", "tags": ["overlap"], "connections": ["c1", "a1"] }],
  "titles": [{ "id": "t1", "label": "Job Title", "sub": "Common at these orgs", "tags": ["variant"], "connections": [], "confidence": 90 }]
}

Rules:
- 6-8 companies (mix of established AND 3-4 notable startups)
- CRITICAL: Only include real companies that actually exist. Do NOT invent or combine company names.
- NEVER include "${form.company}" in target companies
- adjacent = 4-5 specific COMPANIES (not job titles) whose engineers have transferable skills
- wildcards = 3-4 unconventional companies with surprising talent overlap
- titles = 5-7 target job titles
- confidence = relevance 0-100
- talentDensity = concentration of relevant engineers 0-100
- poachability = likelihood to move 0-100
- poachabilitySignals = exactly 2-3 strings prefixed [Signal] or [Confirmed]
- likelyProfile = 1 sentence max
- stage = one of: Public / Late Stage / Series C+ / Series B / Series A / Seed / Enterprise
- Return ONLY raw valid JSON. No markdown. No backticks.`;
}

// ─── API Call ────────────────────────────────────────────

async function callGroq(apiKey, prompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `API error ${res.status}`);
  }

  const raw = data.choices?.[0]?.message?.content || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Components ──────────────────────────────────────────

function TagInput({ placeholder, tags, onChange }) {
  const [input, setInput] = useState("");

  function handleKey(e) {
    if ((e.key === "," || e.key === "Enter") && input.trim()) {
      e.preventDefault();
      onChange([...tags, input.trim().replace(/,$/, "")]);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div
      className="w-full min-h-[40px] bg-white border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-text"
      onClick={(e) => e.currentTarget.querySelector("input").focus()}
    >
      {tags.map((t, i) => (
        <span
          key={i}
          className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-md font-medium"
        >
          {t}
          <button
            onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
            className="text-blue-400 hover:text-blue-700 leading-none ml-0.5"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        className="bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none flex-1 min-w-[100px]"
        placeholder={tags.length ? "" : placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
      />
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-gray-500 font-medium">{label}</span>
        <span className="text-[11px] font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full score-bar-fill"
          style={{
            width: `${value}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function CompanyScores({ node, barColor }) {
  return (
    <div className="mt-3 space-y-1">
      {node.talentDensity != null && (
        <ScoreBar label="Talent Density" value={node.talentDensity} color="#0ea5e9" />
      )}
      {node.confidence != null && (
        <ScoreBar label="Relevance" value={node.confidence} color="#10b981" />
      )}
      {node.poachability != null && (
        <ScoreBar label="Poachability" value={node.poachability} color="#f59e0b" />
      )}
      {node.likelyProfile && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1">
            Likely Talent Profile
          </div>
          <div className="text-xs text-gray-600 leading-relaxed">{node.likelyProfile}</div>
        </div>
      )}
      {node.poachabilitySignals?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-100">
          <div className="text-[10px] text-amber-600 font-semibold tracking-wider uppercase mb-1">
            Poachability Signals
          </div>
          {node.poachabilitySignals.map((s, i) => (
            <div key={i} className="flex gap-1.5 mt-1">
              <span className="text-amber-500 text-xs mt-0.5 flex-shrink-0">&bull;</span>
              <span className="text-xs text-gray-600 leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NodeCard({ node, category, onHover, isActive }) {
  const s = CATEGORY[category];
  return (
    <div
      id={`node-${node.id}`}
      onMouseEnter={() => onHover(node)}
      onMouseLeave={() => onHover(null)}
      className={`relative bg-white rounded-xl border p-4 cursor-pointer card-lift select-none ${
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

      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className={`text-sm font-semibold text-gray-900 leading-tight`}>{node.label}</div>
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

      {category === "companies" && <CompanyScores node={node} barColor={s.barColor} />}

      {category === "titles" && node.confidence != null && (
        <div className="mt-3">
          <ScoreBar
            label="Match Confidence"
            value={node.confidence}
            color={node.confidence >= 80 ? "#10b981" : node.confidence >= 60 ? "#f59e0b" : "#ef4444"}
          />
        </div>
      )}

      {node.connections?.length > 0 && (
        <div className="absolute bottom-2.5 right-3 text-[10px] text-gray-400 font-medium">
          {node.connections.length} link{node.connections.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

function ConnectionLines({ nodes, activeNode, containerRef }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!activeNode || !containerRef.current) {
      setLines([]);
      return;
    }
    const container = containerRef.current.getBoundingClientRect();
    const sourceEl = document.getElementById(`node-${activeNode.id}`);
    if (!sourceEl) return;

    const src = sourceEl.getBoundingClientRect();
    const sx = src.left - container.left + src.width / 2;
    const sy = src.top - container.top + src.height / 2;

    const newLines = nodes
      .filter((n) => n.id !== activeNode.id && activeNode.connections?.includes(n.id))
      .map((n) => {
        const el = document.getElementById(`node-${n.id}`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x1: sx,
          y1: sy,
          x2: r.left - container.left + r.width / 2,
          y2: r.top - container.top + r.height / 2,
          id: n.id,
        };
      })
      .filter(Boolean);
    setLines(newLines);
  }, [activeNode, nodes, containerRef]);

  if (!lines.length) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      {lines.map((l) => (
        <g key={l.id}>
          <line
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.5"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-20"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </line>
          <circle cx={l.x2} cy={l.y2} r="4" fill="#3b82f6" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

function Section({ title, category, nodes, onHover, activeNode }) {
  const s = CATEGORY[category];
  if (!nodes?.length) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
        <h2 className={`text-sm font-semibold tracking-wide uppercase ${s.text}`}>{title}</h2>
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 font-medium">{nodes.length} nodes</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            node={n}
            category={category}
            onHover={onHover}
            isActive={activeNode?.id === n.id}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────

const EMPTY = { companies: [], adjacent: [], wildcards: [], titles: [] };

export default function App() {
  const [form, setForm] = useState({
    role: "",
    company: "",
    location: "",
    seniority: "",
    skills: [],
    industries: [],
    exclusions: [],
  });
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);
  const mapRef = useRef(null);

  const allNodes = mapData
    ? [...mapData.companies, ...mapData.adjacent, ...mapData.wildcards, ...mapData.titles]
    : [];

  async function generate() {
    if (!form.role.trim()) {
      setError("Role is required.");
      return;
    }
    if (!API_KEY) {
      setError("Missing API key. Set VITE_GROQ_API_KEY in your .env file.");
      return;
    }
    setError("");
    setLoading(true);
    setMapData(null);
    setActiveNode(null);

    try {
      const parsed = await callGroq(API_KEY, buildPrompt(form));
      setMapData({ ...EMPTY, ...parsed });
      setGenerated(true);
    } catch (e) {
      if (e.message?.includes("401") || e.message?.includes("invalid_api_key")) {
        setError("Invalid API key. Check VITE_GROQ_API_KEY in your .env file.");
      } else {
        setError(`Error: ${e.message}`);
      }
    }
    setLoading(false);
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-[340px] min-w-[300px] border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
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
        </div>

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
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Preferred Industries
            </label>
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
            onClick={generate}
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

        {/* Legend */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-2.5">
            Legend
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
      </div>

      {/* ── RIGHT MAP AREA ── */}
      <div className="flex-1 relative overflow-y-auto map-scroll bg-gray-50" ref={mapRef}>
        <ConnectionLines nodes={allNodes} activeNode={activeNode} containerRef={mapRef} />

        {/* Empty state */}
        {!generated && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mb-5">
              &#9096;
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Ready to Map</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Fill in the role details on the left and click <strong>Generate Map</strong> to build
              your AI-powered talent landscape.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="text-sm text-gray-500 font-medium">Mapping talent landscape...</div>
            <div className="text-xs text-gray-400">This usually takes 5-10 seconds</div>
          </div>
        )}

        {/* Map results */}
        {mapData && !loading && (
          <div className="relative z-10 p-8 max-w-5xl mx-auto">
            {/* Results header */}
            <div className="mb-8 pb-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {form.role}
                    {form.seniority ? ` · ${form.seniority}` : ""}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {[form.company, form.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{allNodes.length}</div>
                  <div className="text-xs text-gray-400">nodes mapped</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Hover over any card to reveal connections across categories
              </p>
            </div>

            <Section
              title="Target Companies"
              category="companies"
              nodes={mapData.companies}
              onHover={setActiveNode}
              activeNode={activeNode}
            />
            <Section
              title="Adjacent Talent Pools"
              category="adjacent"
              nodes={mapData.adjacent}
              onHover={setActiveNode}
              activeNode={activeNode}
            />
            <Section
              title="Wildcard Bets"
              category="wildcards"
              nodes={mapData.wildcards}
              onHover={setActiveNode}
              activeNode={activeNode}
            />
            <Section
              title="Target Titles"
              category="titles"
              nodes={mapData.titles}
              onHover={setActiveNode}
              activeNode={activeNode}
            />
          </div>
        )}
      </div>
    </div>
  );
}
