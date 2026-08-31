import { useState, useRef, useEffect } from "react";

const FormSelect = ({
  label,
  required = false,
  value,
  onChange,
  options = [],
  error,
  placeholder = "Select an option",
  searchable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (opt) => {
   onChange({ target: { value: opt.value } }); 
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={wrapRef} className="relative flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-text/50 uppercase tracking-wide">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-sm flex items-center justify-between transition-all focus:outline-none
          ${error
            ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400"
            : open
            ? "border-[#0E9594] ring-1 ring-[#0E9594]/20"
            : "border-[#D1D5DB] hover:border-[#9CA3AF]"
          }`}
      >
        <span className={selected ? "text-text" : "text-text/40"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`transition-transform duration-200 text-text/40 ${open ? "rotate-180" : ""}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#D1D5DB] rounded-xl shadow-lg z-50 overflow-hidden">
          {searchable && (
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#F3F4F6]">
              <svg className="text-text/30 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full text-sm bg-transparent outline-none text-text placeholder:text-text/30"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-text/40 text-center py-3">No options found</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors
                    ${opt.value === value
                      ? "bg-[#0E9594]/10 text-[#0E9594] font-medium"
                      : "text-text hover:bg-[#F9FAFB]"
                    }`}
                >
                  {opt.label}
                  {opt.value === value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#0E9594" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;