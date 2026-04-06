import { CATEGORY } from "../lib/constants.js";
import NodeCard from "./NodeCard.jsx";

export default function Section({ title, category, nodes, onHover, activeNode }) {
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
