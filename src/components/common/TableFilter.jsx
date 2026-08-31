import { useState, useRef, useEffect } from "react";
import { Search, Filter } from "lucide-react";
 
export default function TableFilter({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterOptions = [],
  inputName = "table-filter-search",
  autoComplete = "off",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
 
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
 
      {/* Search */}
      <div className="relative w-full sm:w-[220px] md:w-[260px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "#5a7585" }}
        />
        <input
          type="text"
          name={inputName}
          autoComplete={autoComplete}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none bg-white"
          style={{
            borderColor: "rgba(57,80,98,0.15)",
            color: "#1a2e38",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        />
      </div>
 
      {/* Filter Dropdown */}
      <div ref={dropdownRef} className="relative w-full sm:w-[160px] md:w-[180px]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-2 pl-10 pr-3 py-2.5 rounded-xl border bg-white text-sm font-medium cursor-pointer transition-all outline-none"
          style={{
            borderColor: open ? "#02949D" : "rgba(57,80,98,0.15)",
            color: "#1a2e38",
            boxShadow: open
              ? "0 0 0 3px rgba(2,148,157,0.12)"
              : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "#02949D" }}
          />
          <span className="flex-1 text-left truncate">{filterValue || "Filter"}</span>
          <svg
            style={{
              transition: "transform 0.2s",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#5a7585"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
 
        {/* Dropdown Panel */}
        {open && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl overflow-hidden z-50"
            style={{
              border: "1px solid rgba(57,80,98,0.15)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              minWidth: "100%",
            }}
          >
            <div className="p-1">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onFilterChange(option);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors"
                  style={{
                    color: option === filterValue ? "#02949D" : "#1a2e38",
                    background:
                      option === filterValue ? "rgba(2,148,157,0.08)" : "transparent",
                    fontWeight: option === filterValue ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (option !== filterValue)
                      e.currentTarget.style.background = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    if (option !== filterValue)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {option}
                  {option === filterValue && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#02949D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}