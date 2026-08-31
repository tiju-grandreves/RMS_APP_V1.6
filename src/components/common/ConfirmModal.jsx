import React, { useState, useRef, useEffect, useMemo } from "react";

const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  description,
  textareaValue,
  onTextareaChange,
  showTextarea = false,
  showDropdown = false,
  dropdownValue,
  onDropdownChange,
  dropdownOptions = [],
  onDropdownScroll,
  confirmText = "Accept",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
  confirmDisabled = false,
  confirmButtonColor = "#395062",
  showAddManager = false,
  onAddManagerClick,
  disableConfirm = false,
  disableInteractions = false,

  // ✅ NEW OPTIONAL PROP
  variant = "default", // "default" | "deleteUser"
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else if (!isDropdownOpen) {
      setSearchTerm("");
    }
  }, [isDropdownOpen]);

  const filteredDropdownOptions = useMemo(() => {
    if (!searchTerm.trim()) return dropdownOptions;
    const lower = searchTerm.toLowerCase().trim();
    return dropdownOptions.filter((opt) => {
      const label = typeof opt === "string" ? opt : opt?.label ?? "";
      return label.toLowerCase().includes(lower);
    });
  }, [dropdownOptions, searchTerm]);

  if (!isOpen) return null;

  // ✅ Conditional styles (ONLY applied when variant = deleteUser)
  const isDeleteVariant = variant === "deleteUser";
  const isRejectPopup = confirmText === "Reject";
  const isConfirmDisabled = loading || confirmDisabled || disableConfirm;
  const shouldDisableInteractions = loading || disableInteractions;

  const isDangerPopup =
    isDeleteVariant ||
    confirmText === "Delete" ||
    confirmText === "Discard" ||
    confirmText === "Remove" ||
    confirmText === "Cancel" ||
    confirmText === "Cancel Event" ||
    confirmText === "Cancel event";
  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl
  ${isRejectPopup
            ? "w-[679px] min-h-[407px] rounded-[10px] px-[32px] pt-[32px] pb-[24px]"
            : isDangerPopup
              ? "w-[679px] min-h-[246px] rounded-[10px] px-[32px] pt-[32px] pb-[24px]"
              : "w-full max-w-[680px] rounded-[12px] p-6"
          }
`}
      >
        {/* Header with Centered Title and Close button on same line */}
        <div className="relative mb-6">
          <h2
            className={`text-center text-[#02949D] font-open-sans text-[24px] font-semibold leading-[28px] tracking-[-0.25%] ${isDeleteVariant ? "text-[#02949D]" : "text-[#02949D]"
              }`}
          >
            {title}
          </h2>

          {/* Close button - positioned on the same line at the right */}
          <button
            onClick={onClose}
            disabled={shouldDisableInteractions}
            className={`absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${
              shouldDisableInteractions ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
            }`}
            aria-label="Close"
          >
            <img
              src="/icons/ic_close.svg"
              alt="Close"
              className="w-6 h-6 cursor-pointer"
            />
          </button>
        </div>

        {/* Description */}
        <p className="text-center whitespace-pre-line text-[#000000] text-[18px] font-open-sans font-normal leading-[30px] mb-8">          {description}
        </p>

        {/* Textarea */}
        {showTextarea && (
          <textarea
            value={textareaValue}
            onChange={(e) => onTextareaChange(e.target.value)}
            disabled={shouldDisableInteractions}
            placeholder={
              confirmText === "Reject"
                ? "Enter reason for rejection..."
                : "Enter reason..."
            }
            className={`w-full h-[120px] border border-[#CDD6DC] rounded-[8px] px-4 py-3 text-[14px] font-open-sans font-normal text-[#000000] placeholder:text-[#8D8E90] focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none mb-8 ${
              shouldDisableInteractions ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
            rows={4}
          />
        )}

        {showDropdown && (
          <div className="mb-10">
            <label
              htmlFor="event-manager-dropdown"
              className="block mb-2 w-[374px] mx-auto -ml-1 pl-12 text-[14px] font-dm-sans font-semibold text-[#000000]"
            >
              Assign event manager <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center justify-center gap-3">
              <div className="relative w-[374px]">
                <button
                  type="button"
                  onClick={() => {
                    if (shouldDisableInteractions) return;
                    setIsDropdownOpen((prev) => !prev);
                  }}
                  disabled={shouldDisableInteractions}
                  className={`w-[374px] h-[43px] border border-[#CDD6DC] rounded-[8px] px-3 text-[16px] font-open-sans font-normal bg-white text-left focus:outline-none focus:ring-1 focus:ring-gray-300 flex items-center justify-between ${
                    shouldDisableInteractions ? "bg-gray-100 text-gray-500 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  <span className={`truncate ${dropdownValue ? 'text-[#000000]' : 'text-[#8D8E90]'}`}>
                    {dropdownValue
                      ? (dropdownOptions.find((opt) => (
                        (typeof opt === "string" ? opt : String(opt?.value)) === String(dropdownValue)
                      )) && (typeof dropdownOptions.find((opt) => (
                        (typeof opt === "string" ? opt : String(opt?.value)) === String(dropdownValue)
                      )) === "string"
                        ? dropdownOptions.find((opt) => (
                          (typeof opt === "string" ? opt : String(opt?.value)) === String(dropdownValue)
                        ))
                        : dropdownOptions.find((opt) => (
                          (typeof opt === "string" ? opt : String(opt?.value)) === String(dropdownValue)
                        ))?.label)) || "Select event manager"
                      : "Select event manager"}
                  </span>
                  <img
                    src="/icons/chevron-up.svg"
                    alt="toggle"
                    className={`w-6 h-6 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-[#CDD6DC] rounded-[8px] shadow-lg">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search users"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#02949D]"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-52 overflow-y-auto" onScroll={(e) => {
                      if (!searchTerm.trim() && onDropdownScroll) {
                        onDropdownScroll(e);
                      }
                    }}>
                      {filteredDropdownOptions.length > 0 ? (
                        filteredDropdownOptions.map((manager, idx) => {
                          const optionValue = typeof manager === "string" ? manager : String(manager?.value ?? "");
                          const optionLabel = typeof manager === "string" ? manager : manager?.label ?? "";
                          return (
                            <button
                              key={typeof manager === "string" ? `${manager}-${idx}` : manager?.value ?? idx}
                              type="button"
                              disabled={shouldDisableInteractions}
                              onClick={() => {
                                if (shouldDisableInteractions) return;
                                onDropdownChange(optionValue);
                                setIsDropdownOpen(false);
                              }}
                              className={`block w-full px-3 py-2 text-left text-[14px] font-open-sans text-[#000000] ${
                                shouldDisableInteractions
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed pointer-events-none"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {optionLabel}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          No users found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {showAddManager && (
                <button
                  type="button"
                  onClick={onAddManagerClick}
                  disabled={shouldDisableInteractions}
                  className={`w-[155px] h-[42px] border border-[#395062] text-[#395062] rounded-[4px] text-[14px] font-inter font-semibold transition ${
                    shouldDisableInteractions
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed pointer-events-none"
                      : "hover:bg-[#E6F6F7]"
                  }`}
                >
                  Add new
                </button>
              )}
            </div>
          </div>
        )}

        {/* Buttons - Fixed dimensions: 155px width, 42px height, 4px radius */}
        <div
          className={`flex justify-center gap-8 pb-2`}
        >
          <button
            onClick={onClose}
            disabled={shouldDisableInteractions}
            className={`w-[155px] h-[42px] rounded-[4px] border border-[#395062] border-[1px] px-[10px] py-[10px] gap-[12px] text-[#395062] font-inter font-semibold text-[14px] flex items-center justify-center ${
              shouldDisableInteractions
                ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed pointer-events-none"
                : "hover:bg-gray-50"
            }`}
          >
            {isDeleteVariant ? "Keep work" : cancelText}
          </button>

          <button
            onClick={() => {
              if (isConfirmDisabled) return;
              onConfirm();
            }}
            disabled={isConfirmDisabled}
            aria-disabled={isConfirmDisabled}
            className={`w-[155px] h-[42px] rounded-[4px] border-[1px] px-[10px] py-[10px] gap-[12px]
flex items-center justify-center text-white text-[14px] font-inter font-semibold transition-colors
${isRejectPopup
                ? isConfirmDisabled
                  ? "bg-[#FEA9A9] border-[#FEA9A9] cursor-not-allowed pointer-events-none"
                  : "bg-[#DE4242] border-[#DE4242] hover:bg-[#C73636]"

                : isDangerPopup
                  ? "bg-[#DE4242] border-[#DE4242] hover:bg-[#C73636]"

                  : isConfirmDisabled
                    ? "bg-[#395062]/50 border-[#395062]/50 cursor-not-allowed pointer-events-none"

                    : "bg-[#395062] border-[#395062] hover:bg-[#2F4A60]"
              }`}
          >
            {/* {confirmText} */}
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
