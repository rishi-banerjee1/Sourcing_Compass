import { CATEGORY } from "../lib/constants.js";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="h-0.5 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-gray-100 rounded-full w-14" />
        <div className="h-5 bg-gray-100 rounded-full w-10" />
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full w-full" />
    </div>
  );
}

export default function LoadingState() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-8 pb-5 border-b border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-40" />
      </div>

      {/* Section skeletons */}
      {Object.entries(CATEGORY).map(([key, cat]) => (
        <div key={key} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-2.5 h-2.5 rounded-full ${cat.dot}`} />
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="flex-1 border-t border-gray-200" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <SkeletonCard />
            <SkeletonCard />
            {key === "companies" && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
          </div>
        </div>
      ))}

      {/* Center spinner overlay */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="text-sm text-gray-600 font-medium">Mapping talent landscape...</div>
          <div className="text-xs text-gray-400">This usually takes 5-10 seconds</div>
        </div>
      </div>
    </div>
  );
}
