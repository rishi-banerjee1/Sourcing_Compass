import { useState, useRef, useEffect } from "react";
import { LOCATION_OPTIONS } from "../lib/constants.js";

export default function LocationInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = LOCATION_OPTIONS.filter((loc) =>
    loc.toLowerCase().includes((filter || value).toLowerCase())
  );

  function handleSelect(loc) {
    onChange(loc);
    setFilter("");
    setOpen(false);
  }

  function handleInputChange(e) {
    const v = e.target.value;
    onChange(v);
    setFilter(v);
    if (!open) setOpen(true);
  }

  function handleFocus() {
    setOpen(true);
  }

  return (
    <div ref={ref} className="relative">
      <input
        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        placeholder="e.g. North America"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
      />
      {/* Dropdown chevron */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((loc) => (
            <button
              key={loc}
              onClick={() => handleSelect(loc)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                value === loc ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
