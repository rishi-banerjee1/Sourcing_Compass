import { useState, useRef, useEffect } from "react";
import { API_KEY, CATEGORY, EMPTY_MAP } from "./lib/constants.js";
import { buildPrompt } from "./lib/prompt.js";
import { callGroq } from "./lib/groq.js";
import { saveToHistory } from "./lib/storage.js";
import { encodeFormToHash, decodeHashToForm } from "./lib/share.js";

import Sidebar from "./components/Sidebar.jsx";
import ConnectionLines from "./components/ConnectionLines.jsx";
import Section from "./components/Section.jsx";
import EmptyState from "./components/EmptyState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ViewToggle from "./components/ViewToggle.jsx";
import TableView from "./components/TableView.jsx";
import ReportView from "./components/ReportView.jsx";
import FilterBar from "./components/FilterBar.jsx";

const INITIAL_FORM = {
  role: "",
  company: "",
  location: "",
  seniority: "",
  skills: [],
  industries: [],
  exclusions: [],
};

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);
  const [viewMode, setViewMode] = useState("map");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mapRef = useRef(null);

  // Filter/sort state
  const [sortKey, setSortKey] = useState("confidence");
  const [minPoachability, setMinPoachability] = useState(0);
  const [visibleCategories, setVisibleCategories] = useState(
    Object.keys(CATEGORY)
  );

  // Load from URL hash on mount
  useEffect(() => {
    const hashForm = decodeHashToForm();
    if (hashForm) {
      setForm(hashForm);
      // Auto-generate after a tick so state is set
      setTimeout(() => {
        document.querySelector("[data-generate]")?.click();
      }, 100);
    }
  }, []);

  // Keyboard shortcut: Cmd+Enter to generate
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const allNodes = mapData
    ? [...mapData.companies, ...mapData.adjacent, ...mapData.wildcards, ...mapData.titles]
    : [];

  // Apply filters to map view
  function filterNodes(nodes, category) {
    if (!visibleCategories.includes(category)) return [];
    let filtered = [...nodes];
    if (minPoachability > 0) {
      filtered = filtered.filter(
        (n) => n.poachability == null || n.poachability >= minPoachability
      );
    }
    if (sortKey && sortKey !== "label") {
      filtered.sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));
    } else if (sortKey === "label") {
      filtered.sort((a, b) => a.label.localeCompare(b.label));
    }
    return filtered;
  }

  const filteredTotal = mapData
    ? Object.keys(CATEGORY).reduce(
        (sum, cat) => sum + filterNodes(mapData[cat] || [], cat).length,
        0
      )
    : 0;

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
      const result = { ...EMPTY_MAP, ...parsed };
      setMapData(result);
      setGenerated(true);
      saveToHistory(form, result);
    } catch (e) {
      if (e.message?.includes("401") || e.message?.includes("invalid_api_key")) {
        setError("Invalid API key. Check VITE_GROQ_API_KEY in your .env file.");
      } else {
        setError(`Error: ${e.message}`);
      }
    }
    setLoading(false);
  }

  function handleRestore(restoredForm, restoredMapData) {
    setForm(restoredForm);
    setMapData(restoredMapData);
    setGenerated(true);
    setError("");
  }

  function handleShare() {
    const hash = encodeFormToHash(form);
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    navigator.clipboard.writeText(url);
  }

  function toggleCategory(cat) {
    setVisibleCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on md+, toggleable on mobile */}
      <div className={`max-md:${sidebarOpen ? "block" : "hidden"} md:block z-50`}>
        <Sidebar
          form={form}
          onChange={setForm}
          onGenerate={generate}
          loading={loading}
          error={error}
          generated={generated}
          onRestore={handleRestore}
        />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 bg-white rounded-lg shadow-md p-2 border border-gray-200"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Right map area */}
      <div className="flex-1 relative overflow-y-auto map-scroll bg-gray-50" ref={mapRef}>
        {viewMode === "map" && (
          <ConnectionLines nodes={allNodes} activeNode={activeNode} containerRef={mapRef} />
        )}

        {/* Empty state */}
        {!generated && !loading && <EmptyState />}

        {/* Loading with skeleton */}
        {loading && <LoadingState />}

        {/* Results */}
        {mapData && !loading && (
          <div className="relative z-10 p-8 max-w-5xl mx-auto">
            {/* Results header */}
            <div className="mb-6 pb-5 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {form.role}
                    {form.seniority ? ` · ${form.seniority}` : ""}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {[form.company, form.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                  <button
                    onClick={handleShare}
                    title="Copy shareable link"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-4">
                  {Object.entries(CATEGORY).map(([key, cat]) => {
                    const count = (mapData[key] || []).length;
                    if (!count) return null;
                    return (
                      <div key={key} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${cat.dot}`} />
                        <span className="text-xs text-gray-500">
                          {count} {cat.label.toLowerCase().split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs text-gray-400 ml-auto">{allNodes.length} total nodes</span>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-gray-400 mt-2 italic">
                AI-generated intelligence. Verify before outreach.
              </p>
            </div>

            {/* Filter bar — map & table views */}
            {viewMode === "map" && (
              <FilterBar
                sortKey={sortKey}
                onSortChange={setSortKey}
                minPoachability={minPoachability}
                onMinPoachabilityChange={setMinPoachability}
                visibleCategories={visibleCategories}
                onToggleCategory={toggleCategory}
                totalCount={allNodes.length}
                filteredCount={filteredTotal}
              />
            )}

            {/* Map View */}
            {viewMode === "map" && (
              <>
                <Section
                  title="Target Companies"
                  category="companies"
                  nodes={filterNodes(mapData.companies, "companies")}
                  onHover={setActiveNode}
                  activeNode={activeNode}
                />
                <Section
                  title="Adjacent Talent Pools"
                  category="adjacent"
                  nodes={filterNodes(mapData.adjacent, "adjacent")}
                  onHover={setActiveNode}
                  activeNode={activeNode}
                />
                <Section
                  title="Wildcard Bets"
                  category="wildcards"
                  nodes={filterNodes(mapData.wildcards, "wildcards")}
                  onHover={setActiveNode}
                  activeNode={activeNode}
                />
                <Section
                  title="Target Titles"
                  category="titles"
                  nodes={filterNodes(mapData.titles, "titles")}
                  onHover={setActiveNode}
                  activeNode={activeNode}
                />
              </>
            )}

            {/* Table View */}
            {viewMode === "table" && <TableView mapData={mapData} />}

            {/* Report View */}
            {viewMode === "report" && <ReportView mapData={mapData} form={form} />}
          </div>
        )}
      </div>
    </div>
  );
}
