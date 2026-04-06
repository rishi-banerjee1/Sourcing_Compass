import { useState, useEffect } from "react";

export default function ConnectionLines({ nodes, activeNode, containerRef }) {
  const [lines, setLines] = useState([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!activeNode || !containerRef.current) {
      setLines([]);
      return;
    }
    const ctr = containerRef.current;
    const rect = ctr.getBoundingClientRect();
    const scrollTop = ctr.scrollTop;
    const scrollLeft = ctr.scrollLeft;

    setSvgSize({ w: ctr.scrollWidth, h: ctr.scrollHeight });

    const sourceEl = document.getElementById(`node-${activeNode.id}`);
    if (!sourceEl) return;

    const src = sourceEl.getBoundingClientRect();
    const sx = src.left - rect.left + scrollLeft + src.width / 2;
    const sy = src.top - rect.top + scrollTop + src.height / 2;

    const newLines = nodes
      .filter((n) => n.id !== activeNode.id && activeNode.connections?.includes(n.id))
      .map((n) => {
        const el = document.getElementById(`node-${n.id}`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x1: sx,
          y1: sy,
          x2: r.left - rect.left + scrollLeft + r.width / 2,
          y2: r.top - rect.top + scrollTop + r.height / 2,
          id: n.id,
        };
      })
      .filter(Boolean);
    setLines(newLines);
  }, [activeNode, nodes, containerRef]);

  if (!lines.length) return null;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 30, width: svgSize.w, height: svgSize.h }}
    >
      {lines.map((l) => (
        <g key={l.id}>
          <line
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" opacity="0.6"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0" to="-20" dur="0.6s" repeatCount="indefinite"
            />
          </line>
          <circle cx={l.x2} cy={l.y2} r="5" fill="#3b82f6" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}
