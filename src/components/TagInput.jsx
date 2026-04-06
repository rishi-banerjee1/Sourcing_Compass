import { useState } from "react";

export default function TagInput({ placeholder, tags, onChange }) {
  const [input, setInput] = useState("");

  function handleKey(e) {
    if ((e.key === "," || e.key === "Enter") && input.trim()) {
      e.preventDefault();
      onChange([...tags, input.trim().replace(/,$/, "")]);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div
      className="w-full min-h-[40px] bg-white border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-text"
      onClick={(e) => e.currentTarget.querySelector("input").focus()}
    >
      {tags.map((t, i) => (
        <span
          key={i}
          className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-md font-medium"
        >
          {t}
          <button
            onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
            className="text-blue-400 hover:text-blue-700 leading-none ml-0.5"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        className="bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none flex-1 min-w-[100px]"
        placeholder={tags.length ? "" : placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
      />
    </div>
  );
}
