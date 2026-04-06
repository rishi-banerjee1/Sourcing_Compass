import { CATEGORY } from "../lib/constants.js";

export default function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl mb-5">
        &#9096;
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Ready to Map</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        Fill in the role details on the left and click <strong>Generate Map</strong> to build
        your AI-powered talent landscape.
      </p>

      {/* Mini preview of what results look like */}
      <div className="w-full max-w-md opacity-40 pointer-events-none">
        <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-3">
          Example output
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(CATEGORY).map(([key, cat]) => (
            <div key={key} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                <span className="text-[10px] font-medium text-gray-500">{cat.label}</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-gray-100 rounded w-3/4" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
