import { CATEGORY } from "../lib/constants.js";

export default function FilterBar({ sortKey, onSortChange, minPoachability, onMinPoachabilityChange, visibleCategories, onToggleCategory, totalCount, filteredCount }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-gray-200">
      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-gray-400 font-medium">Sort:</span>
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:border-blue-400"
        >
          <option value="confidence">Confidence</option>
          <option value="poachability">Poachability</option>
          <option value="talentDensity">Talent Density</option>
          <option value="label">Alphabetical</option>
        </select>
      </div>

      {/* Poachability threshold */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400 font-medium">Min Poach:</span>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={minPoachability}
          onChange={(e) => onMinPoachabilityChange(Number(e.target.value))}
          className="w-20 h-1 accent-amber-500"
        />
        <span className="text-[11px] text-gray-600 font-medium tabular-nums w-6">{minPoachability}%</span>
      </div>

      {/* Category toggles */}
      <div className="flex items-center gap-1.5 ml-auto">
        {Object.entries(CATEGORY).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => onToggleCategory(key)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border ${
              visibleCategories.includes(key)
                ? `${cat.badge} border-transparent`
                : "text-gray-400 bg-white border-gray-200 line-through"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${visibleCategories.includes(key) ? cat.dot : "bg-gray-300"}`} />
            {cat.label.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Count */}
      {filteredCount !== totalCount && (
        <span className="text-[11px] text-gray-400">
          {filteredCount}/{totalCount} shown
        </span>
      )}
    </div>
  );
}
