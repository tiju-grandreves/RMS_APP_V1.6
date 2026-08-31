import { useState } from "react";
import FormInput from "../components/common/FormInput";
import TextArea from "../components/common/TeaxtArea";

const PackageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PartNameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7 6.3a4 4 0 0 0-5.66 5.66L3 18l3 3 6.04-6.04a4 4 0 0 0 5.66-5.66l-2.12 2.12-2.83-2.83 2.12-2.12-.17-.17z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QtyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const PriceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 0h4.5a1.5 1.5 0 0 1 0 3H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const STATUS_COLORS = {
  New: { color: "#d4183d", bg: "#fff5f5" },
  "In Progress": { color: "#02949D", bg: "#e8f5f7" },
  Ready: { color: "#16a34a", bg: "#f0fdf4" },
};

const UpdateDrawer = ({ isOpen, onClose, request, onSave }) => {
  const [partForm, setPartForm] = useState({ name: "", qty: "1", price: "" });
  const [partErrors, setPartErrors] = useState({});
  const [parts, setParts] = useState([]);
  const [notes, setNotes] = useState("");

  const validatePart = () => {
    const errs = {};
    if (!partForm.name.trim()) errs.name = "Part name is required";
    if (!partForm.qty || isNaN(partForm.qty) || Number(partForm.qty) < 1)
      errs.qty = "Enter valid quantity";
    if (!partForm.price || isNaN(partForm.price) || Number(partForm.price) < 0)
      errs.price = "Enter valid price";
    setPartErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddPart = () => {
    if (!validatePart()) return;
    setParts([...parts, { ...partForm, id: Date.now() }]);
    setPartForm({ name: "", qty: "1", price: "" });
    setPartErrors({});
  };

  const handleRemovePart = (id) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleClose = () => {
    setPartForm({ name: "", qty: "1", price: "" });
    setPartErrors({});
    setParts([]);
    setNotes("");
    onClose();
  };

  const handleSave = () => {
    onSave({ ...request, parts, notes });
    handleClose();
  };

  if (!isOpen || !request) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={{ color: "#02949D", borderColor: "#02949D", background: "#e8f5f7" }}
              >
                {request.id}
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: STATUS_COLORS[request.status]?.color,
                  background: STATUS_COLORS[request.status]?.bg,
                }}
              >
                ● {request.status}
              </span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: "#1a2e38" }}>{request.customerName}</h2>
            <p className="text-sm" style={{ color: "#5a7585" }}>{request.device}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F3F4F6] text-text/50 hover:bg-[#E5E7EB] transition-colors mt-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">

          {/* Add Part Section */}
          <div className="rounded-2xl border border-[#E5E7EB] p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#02949D" }}>
              Add Part / Component
            </p>

            <div className="flex flex-col gap-3">
              <FormInput
                label=""
                placeholder="Part name (e.g. Samsung S23 Screen)"
                value={partForm.name}
                onChange={(e) => {
                  setPartForm({ ...partForm, name: e.target.value });
                  if (partErrors.name) setPartErrors({ ...partErrors, name: "" });
                }}
                icon={<PartNameIcon />}
                error={partErrors.name}
              />

              <div className="flex gap-3">
                <div className="flex-1">
                  <FormInput
                    label=""
                    placeholder="Qty"
                    value={partForm.qty}
                    type="number"
                    onChange={(e) => {
                      setPartForm({ ...partForm, qty: e.target.value });
                      if (partErrors.qty) setPartErrors({ ...partErrors, qty: "" });
                    }}
                    icon={<QtyIcon />}
                    error={partErrors.qty}
                  />
                </div>
                <div className="flex-1">
                  <FormInput
                    label=""
                    placeholder="Price (RM)"
                    value={partForm.price}
                    type="number"
                    onChange={(e) => {
                      setPartForm({ ...partForm, price: e.target.value });
                      if (partErrors.price) setPartErrors({ ...partErrors, price: "" });
                    }}
                    icon={<PriceIcon />}
                    error={partErrors.price}
                  />
                </div>
              </div>

              <button
                onClick={handleAddPart}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#02949D" }}
              >
                + Add Part
              </button>
            </div>

            {/* Parts list */}
            {parts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <PackageIcon />
                <p className="text-sm" style={{ color: "#9ca3af" }}>No parts added yet</p>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {parts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: "#f8fafc", border: "1px solid #E5E7EB" }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#1a2e38" }}>{p.name}</p>
                      <p className="text-xs" style={{ color: "#5a7585" }}>Qty: {p.qty} × RM {p.price}</p>
                    </div>
                    <button
                      onClick={() => handleRemovePart(p.id)}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: "#FCE9EA", color: "#E0556F" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Notes */}
          <div className="rounded-2xl border border-[#E5E7EB] p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#02949D" }}>
              Service Notes
            </p>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add detailed notes about the repair work, findings, or any important information..."
              rows={4}
            //   className="w-full px-4 py-3 rounded-xl border border-[#D1D5DB] text-sm outline-none resize-none focus:border-[#0E9594] focus:ring-1 focus:ring-[#0E9594] transition-all"
               style={{ color: "#1a2e38" }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-8 py-5 border-t border-[#E5E7EB]">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
            style={{ color: "#395062", borderColor: "#d1d5db" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #02949D, #395062)" }}
          >
            Save Changes
          </button>
        </div>

      </div>
    </>
  );
};

export default UpdateDrawer;