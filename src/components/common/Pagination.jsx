import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  totalRecords = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex items-center justify-between mt-1" style={{ borderTop: "1px solid rgba(57,80,98,0.1)" }}>
      {/* Records info */}
      <p className="text-xs" style={{ color: "#5a7585" }}>
        Showing <span className="font-medium" style={{ color: "#1a2e38" }}>{from}–{to}</span> of{" "}
        <span className="font-medium" style={{ color: "#1a2e38" }}>{totalRecords}</span> records
      </p>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#5a7585" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span
              key={`dots-${i}`}
              className="flex items-center justify-center w-8 h-8 text-xs"
              style={{ color: "#5a7585" }}
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-all"
              style={
                page === currentPage
                  ? { background: "#02949D", color: "white" }
                  : { color: "#5a7585" }
              }
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#5a7585" }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;