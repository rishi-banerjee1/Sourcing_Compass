import { loadHistory, removeFromHistory, clearHistory } from "../lib/storage.js";

export default function HistoryPanel({ onRestore, onClose }) {
  const history = loadHistory();

  function handleRestore(entry) {
    onRestore(entry.form, entry.mapData);
    onClose();
  }

  function handleRemove(e, id) {
    e.stopPropagation();
    removeFromHistory(id);
    // Force re-render by triggering parent
    onClose();
  }

  function handleClear() {
    clearHistory();
    onClose();
  }

  if (!history.length) {
    return (
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-600">Search History</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">Close</button>
        </div>
        <p className="text-xs text-gray-400 text-center py-4">No saved maps yet.</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-600">
          History ({history.length})
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="text-[11px] text-red-500 hover:text-red-700">
            Clear all
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">
            Close
          </button>
        </div>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {history.map((entry) => (
          <div
            key={entry.id}
            onClick={() => handleRestore(entry)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer group transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 truncate">{entry.label}</div>
              <div className="text-[10px] text-gray-400">
                {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <button
              onClick={(e) => handleRemove(e, entry.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
