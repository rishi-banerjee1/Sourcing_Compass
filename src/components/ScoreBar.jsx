export default function ScoreBar({ label, value, color }) {
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
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
