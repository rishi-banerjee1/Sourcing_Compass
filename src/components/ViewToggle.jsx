const VIEWS = [
  {
    id: "map",
    label: "Map",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "table",
    label: "Table",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path d="M3 6h18M3 12h18M3 18h18" />
        <path d="M9 3v18" />
      </svg>
    ),
  },
  {
    id: "report",
    label: "Report",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function ViewToggle({ viewMode, onViewChange }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          onClick={() => onViewChange(v.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === v.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {v.icon}
          {v.label}
        </button>
      ))}
    </div>
  );
}
