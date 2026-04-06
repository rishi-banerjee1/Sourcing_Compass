import ScoreBar from "./ScoreBar.jsx";

export default function CompanyScores({ node }) {
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
