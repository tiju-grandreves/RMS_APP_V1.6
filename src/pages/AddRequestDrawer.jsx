import { useState, useEffect } from "react";
import { User, Phone, Mail, Smartphone, Trash2, Package, PhoneCall } from "lucide-react";
import SideDrawer from "../components/common/SideDrawer";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import { validateForm, validateName, validatePhone, validateEmailOptional, validateRequired } from '../components/common/Validators';
import { getFormFields } from "../services/workflowService";
import httpService from "../services/httpService";
import { showEventToast } from "../components/common/toastHelper";

const BRAND_OPTIONS = [
  { value: "", label: "Select brand" },
  { value: "Apple", label: "Apple" },
  { value: "Samsung", label: "Samsung" },
  { value: "Xiaomi", label: "Xiaomi" },
  { value: "Huawei", label: "Huawei" },
  { value: "OPPO", label: "OPPO" },
  { value: "Vivo", label: "Vivo" },
  { value: "OnePlus", label: "OnePlus" },
  { value: "Realme", label: "Realme" },
  { value: "Google", label: "Google" },
  { value: "Sony", label: "Sony" },
  { value: "Other", label: "Other" },
];

const ISSUE_OPTIONS = [
  { value: "", label: "Select issue type" },
  { value: "Screen cracked / broken", label: "Screen cracked / broken" },
  { value: "Battery issue", label: "Battery issue" },
  { value: "Water damage", label: "Water damage" },
  { value: "Charging port issue", label: "Charging port issue" },
  { value: "Speaker / microphone problem", label: "Speaker / microphone problem" },
  { value: "Camera malfunction", label: "Camera malfunction" },
  { value: "Software / OS issue", label: "Software / OS issue" },
  { value: "Button not working", label: "Button not working" },
  { value: "Other", label: "Other" },
];

const ALL_STATUSES = [
  { value: "New",         label: "New" },
  { value: "In Progress", label: "In Progress" },
  { value: "Ready",       label: "Ready" },
  { value: "Closed",      label: "Closed" },
  { value: "Cancelled",   label: "Cancelled" },
];

const STATUS_COLORS = {
  "New":         { color: "#2563eb", bg: "#eff6ff" },
  "In Progress": { color: "#d97706", bg: "#fffbf0" },
  "Ready":       { color: "#16a34a", bg: "#f0fdf4" },
  "Closed":      { color: "#395062", bg: "#edf1f4" },
  "Cancelled":   { color: "#d4183d", bg: "#fff5f5" },
};

const PAYMENT_METHODS = [
  { value: "Cash",     label: "Cash" },
  { value: "GPay/UPI", label: "GPay / UPI" },
  { value: "Card",     label: "Card" },
];

const EMPTY_PAYMENT = { customerCalled: "", method: "Cash", amountReceived: "", remarks: "" };

function getAllowedStatusOptions(currentStatus, roleId) {
  if (roleId === 1) return ALL_STATUSES;
  if (roleId === 3) {
    if (currentStatus === "New")         return [{ value: "In Progress", label: "In Progress" }];
    if (currentStatus === "In Progress") return [{ value: "Ready",       label: "Ready" }];
    return [];
  }
  if (roleId === 2) {
    if (currentStatus === "Ready") return [{ value: "Closed", label: "Closed" }];
    return ALL_STATUSES;
  }
  return ALL_STATUSES;
}

const PRIORITY_COLORS = {
  High:   { color: "#d4183d", bg: "#fff5f5", border: "#d4183d" },
  Medium: { color: "#d97706", bg: "#fffbf0", border: "#d97706" },
  Low:    { color: "#16a34a", bg: "#f0fdf4", border: "#16a34a" },
};

const EMPTY_FORM = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  deviceBrand: "",
  deviceModel: "",
  issueDescription: "",
  priority: "Medium",
  serviceNotes: "",
  status: "New",
};

const EMPTY_PART = { name: "", qty: 1, unitPrice: "" };

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
}

async function fetchParts(jobId) {
  const res = await httpService.get("/spare-parts", { jobIdId: jobId });
  return res?.data?.rows ?? res?.data ?? res ?? [];
}

async function createPart(jobId, part) {
  return httpService.post("/spare-parts", {
    jobIdId:  jobId,
    itemName: part.name,
    qty:      Number(part.qty),
    price:    Number(part.unitPrice || 0),
  });
}

async function deletePart(partId) {
  return httpService.remove(`/spare-parts/${partId}`);
}


function ViewRow({ label, value }) {
  const display = value !== undefined && value !== null && value !== "" ? String(value) : "—";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#8fa3af" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: value ? "#1a2e38" : "#b0c4ce" }}>
        {display}
      </span>
    </div>
  );
}

// Read-only consolidation of the receptionist-owned details (customer, device,
// additional fields, priority) shown to a Service Officer while they update a job.
function JobSummaryCard({ form, dynamicFields, dynamicValues }) {
  return (
    <div
      className="p-4 rounded-2xl flex flex-col gap-4"
      style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#0F6E56" }}>
          Job Summary
        </p>
        <span className="text-[10px] font-medium uppercase tracking-wide flex items-center gap-1" style={{ color: "#8fa3af" }}>
          Read-only
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ViewRow label="Customer Name" value={form.customerName} />
        <ViewRow label="Phone Number" value={form.customerPhone} />
      </div>

      <div style={{ borderTop: "1px solid #f0f4f6" }} />

      <div className="grid grid-cols-2 gap-4">
        <ViewRow label="Brand" value={form.deviceBrand} />
        <ViewRow label="Model" value={form.deviceModel} />
      </div>
      <ViewRow label="Issue Description" value={form.issueDescription} />

      {dynamicFields.length > 0 && (
        <>
          <div style={{ borderTop: "1px solid #f0f4f6" }} />
          <div className="grid grid-cols-2 gap-4">
            {dynamicFields.map(f => (
              f.type === "section_header" ? (
                <div key={f.id} className="col-span-2" style={{ marginTop: 2, paddingBottom: 4, borderBottom: "1px solid rgba(14,149,148,0.25)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", textTransform: "uppercase", letterSpacing: ".04em" }}>{f.label}</div>
                </div>
              ) : (
                <ViewRow
                  key={f.id}
                  label={f.label}
                  value={f.type === "checkbox" ? (dynamicValues[f.id] ? "Yes" : "No") : dynamicValues[f.id]}
                />
              )
            ))}
          </div>
        </>
      )}

      <div style={{ borderTop: "1px solid #f0f4f6" }} />
      <ViewRow label="Priority" value={form.priority} />
    </div>
  );
}

function DynamicField({ field, value, onChange, disabled }) {
  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1px solid rgba(57,80,98,0.2)", fontSize: 14,
    color: "#1a2e38", outline: "none", background: disabled ? "#f4f7f9" : "#fff",
  };

  // Display-only heading that groups the fields below it. Collects no value.
  if (field.type === "section_header") {
    return (
      <div style={{ marginTop: 4, paddingBottom: 6, borderBottom: "1px solid rgba(14,149,148,0.25)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", textTransform: "uppercase", letterSpacing: ".04em" }}>
          {field.label}
        </div>
      </div>
    );
  }

  if (field.type === "dropdown") {
    const opts = [
      { value: "", label: `Select ${field.label}` },
      ...(field.options ?? "").split(",").map(o => ({ value: o.trim(), label: o.trim() })).filter(o => o.value),
    ];
    return (
      <FormSelect
        label={field.label}
        required={field.isRequired}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        options={opts}
        disabled={disabled}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-text/50 uppercase tracking-wide">
          {field.label}{field.isRequired && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          rows={3}
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.label}
          disabled={disabled}
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: disabled ? "default" : "pointer", fontSize: 14, color: "#1a2e38" }}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          style={{ width: 16, height: 16, accentColor: "#0E9594" }}
        />
        {field.label}{field.isRequired && <span style={{ color: "#d4183d" }}> *</span>}
      </label>
    );
  }

  if (field.type === "date") {
    return (
      <FormInput
        label={field.label}
        required={field.isRequired}
        type="date"
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    );
  }

  if (field.type === "number") {
    return (
      <FormInput
        label={field.label}
        required={field.isRequired}
        type="number"
        placeholder={field.label}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    );
  }

  return (
    <FormInput
      label={field.label}
      required={field.isRequired}
      placeholder={field.label}
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}

function PartsSection({ parts, partForm, setPartForm, onAdd, onRemove, partsLoading, addingPart, disabled }) {
  const total = parts.reduce((sum, p) => sum + (Number(p.qty) * Number(p.unitPrice || p.price || 0)), 0);

  return (
    <div
      className="p-4 rounded-2xl flex flex-col gap-3"
      style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#02949D" }}>
        Parts / Components
      </p>
 {!disabled && (
        <>
          <input
            type="text"
            placeholder="Part name (e.g. Samsung S23 Screen)"
            value={partForm.name}
            onChange={e => setPartForm(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && !addingPart && onAdd()}
            disabled={addingPart}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
            style={{ borderColor: "rgba(57,80,98,0.2)", color: "#1a2e38", background: addingPart ? "#f4f7f9" : "#fff" }}
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5a7585" }}>
                Qty
              </label>
              <input
                type="number"
                min={1}
                placeholder="1"
                value={partForm.qty}
                onChange={e => setPartForm(f => ({ ...f, qty: Math.max(1, Number(e.target.value)) }))}
                disabled={addingPart}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: "rgba(57,80,98,0.2)", color: "#1a2e38", background: addingPart ? "#f4f7f9" : "#fff" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5a7585" }}>
                Unit Price (RM)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={partForm.unitPrice}
                onChange={e => setPartForm(f => ({ ...f, unitPrice: e.target.value }))}
                disabled={addingPart}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: "rgba(57,80,98,0.2)", color: "#1a2e38", background: addingPart ? "#f4f7f9" : "#fff" }}
              />
            </div>
          </div>

          <button
            onClick={onAdd}
            disabled={addingPart}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#02949D" }}
          >
            {addingPart ? "Adding…" : "+ Add Part"}
          </button>
        </>
      )}

      {partsLoading ? (
        <div className="flex items-center justify-center py-6" style={{ color: "#b0c4ce" }}>
          <p className="text-xs">Loading parts…</p>
        </div>
      ) : parts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2" style={{ color: "#b0c4ce" }}>
          <Package className="w-9 h-9 opacity-50" />
          <p className="text-xs">No parts added yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {parts.map((p) => {
            const unitPrice = p.unitPrice ?? p.price ?? 0;
            const lineTotal = Number(p.qty) * Number(unitPrice);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: "#f4f7f9", border: "1px solid #e0e8ed" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: "#1a2e38" }}>
                    {p.name ?? p.itemName}
                  </p>
                  <p className="text-xs" style={{ color: "#5a7585" }}>
                    Qty: {p.qty}
                    {unitPrice
                      ? ` · Rupees ${Number(unitPrice).toFixed(2)} each · Total: Rupees ${lineTotal.toFixed(2)}`
                      : ""}
                  </p>
                </div>
                {!disabled && (
                  <button
                    onClick={() => onRemove(p.id)}
                    className="ml-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                    style={{ background: "#fff5f5", color: "#d4183d" }}
                    title="Remove part"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {total > 0 && (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl mt-1"
              style={{ background: "#e8f5f7", border: "1px solid #b2dfe3" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#02949D" }}>
                Parts Total
              </p>
              <p className="text-sm font-bold" style={{ color: "#02949D" }}>
                Rupees {total.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function PaymentSection({ editData, parts, payment, setPayment, totalDue, onConfirm, submitting }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}
    >
      

      <div className="p-4 flex flex-col gap-3">

        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "#f0fdf4", border: "1px solid #c8ecd2" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#16a34a", color: "white" }}
          >
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "#1a2e38" }}>
              {(editData?.tokenNum || `#${editData?.id || ""}`)} — Ready 
            </p>
            <p className="text-xs truncate" style={{ color: "#5a7585" }}>
              {editData?.deviceBrand} {editData?.deviceModel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#8fa3af" }}>
              Customer Name
            </span>
            <span className="text-sm" style={{ color: "#1a2e38" }}>{editData?.customerName || "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#8fa3af" }}>
              Phone Number
            </span>
            <span className="text-sm" style={{ color: "#1a2e38" }}>{editData?.customerPhone || "—"}</span>
          </div>
        </div>

        {/* <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5a7585" }}>
            Customer called
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={editData?.customerPhone || "+91 00000 00000"}
              value={payment.customerCalled}
              onChange={e => setPayment(p => ({ ...p, customerCalled: e.target.value }))}
              className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: "rgba(57,80,98,0.2)", color: "#1a2e38" }}
            />
            <a
              href={`tel:${editData?.customerPhone || ""}`}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-medium flex-shrink-0"
              style={{ borderColor: "rgba(57,80,98,0.2)", color: "#395062" }}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call
            </a>
          </div>
        </div> */}

        <div
          className="px-3 py-2.5 rounded-xl flex flex-col gap-1.5"
          style={{ background: "#f4f7f9", border: "1px solid #e0e8ed" }}
        >
          {parts.length === 0 ? (
            <p className="text-xs" style={{ color: "#8fa3af" }}>No parts/charges recorded for this job.</p>
          ) : (
            parts.map(p => {
              const unitPrice = p.unitPrice ?? p.price ?? 0;
              const lineTotal = Number(p.qty) * Number(unitPrice);
              return (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: "#1a2e38" }}>{(p.name ?? p.itemName)} × {p.qty}</span>
                  <span style={{ color: "#1a2e38" }}>Rupees {lineTotal.toFixed(2)}</span>
                </div>
              );
            })
          )}
          <div
            className="flex items-center justify-between pt-2 mt-1"
            style={{ borderTop: "1px solid #d8e2e8" }}
          >
            <p className="text-sm font-bold" style={{ color: "#1a2e38" }}>Total due</p>
            <p className="text-sm font-bold" style={{ color: "#02949D" }}>Rupees {totalDue.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5a7585" }}>
            Payment method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(({ value, label }) => {
              const selected = payment.method === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPayment(p => ({ ...p, method: value }))}
                  className="py-3 rounded-xl text-sm font-medium border-2 transition-all"
                  style={{
                    background:  selected ? "#e8f5f7" : "transparent",
                    borderColor: selected ? "#02949D" : "rgba(57,80,98,0.15)",
                    color:       selected ? "#02949D" : "#5a7585",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <FormInput
          label="Amount received (Rupees)"
          type="number"
          placeholder="0.00"
          value={payment.amountReceived}
          onChange={e => setPayment(p => ({ ...p, amountReceived: e.target.value }))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#5a7585" }}>
            Remarks (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Customer satisfied"
            value={payment.remarks}
            onChange={e => setPayment(p => ({ ...p, remarks: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: "rgba(57,80,98,0.2)", color: "#1a2e38" }}
          />
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#0E9594" }}
        >
          {submitting ? "Saving…" : "Confirm payment & close job"}
        </button>

        <p className="text-[11px] text-center" style={{ color: "#8fa3af" }}>
          A receipt SMS will be sent to the customer automatically.
        </p>
      </div>
    </div>
  );
}


export function AddRequestDrawer({ open, onClose, onSubmit, editData = null, wfId = null, mode = "add" }) {

  const [form, setForm]                   = useState(EMPTY_FORM);
  const [errors, setErrors]               = useState({});
  const [dynamicFields, setDynamicFields] = useState([]);
  const [dynamicValues, setDynamicValues] = useState({});
  const [parts, setParts]                 = useState([]);
  const [partForm, setPartForm]           = useState(EMPTY_PART);
  const [partsLoading, setPartsLoading]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [payment, setPayment]             = useState(EMPTY_PAYMENT);
const [addingPart, setAddingPart]       = useState(false);
  const currentUser      = getCurrentUser();
  const roleId           = currentUser?.roleId ?? 1;
  const isServiceOfficer = roleId === 3;
  const isReceptionist   = roleId === 2;
  const isEdit            = !!editData;
  const isViewOnly        = mode === "view";
 
  const isPaymentMode     = mode === "payment";
  const fieldsDisabled    = isViewOnly || submitting;
  // Service Officer updating an existing job: collapse the receptionist-owned
  // details into one read-only summary and leave only Parts + Notes editable.
  const officerEditView   = isServiceOfficer && isEdit && !isViewOnly && !isPaymentMode;

  useEffect(() => {
    if (!wfId) { setDynamicFields([]); return; }
    const timer = setTimeout(() => {
      getFormFields(wfId)
        .then(rows => setDynamicFields(rows))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [wfId]);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setForm({
        customerName:     editData.customerName     || "",
        customerPhone:    editData.customerPhone     || "",
        customerEmail:    editData.customerEmail     || "",
        deviceBrand:      editData.deviceBrand       || "",
        deviceModel:      editData.deviceModel       || "",
        issueDescription: editData.issueDescription  || "",
        priority:         editData.priority          || "Medium",
        serviceNotes:     editData.serviceNotes      || "",
        status:           editData.status            || "New",
      });
      const vals = {};
      (editData.fieldValues ?? []).forEach(fv => { vals[fv.fieldIdId] = fv.value; });
      setDynamicValues(vals);

      if (editData.id) {
        setPartsLoading(true);
        fetchParts(editData.id)
          .then(data => {
            setParts(
              data.map(p => ({
                id:        p.id,
                name:      p.itemName,
                qty:       p.qty,
                unitPrice: p.price,
                _persisted: true,
              }))
            );
          })
             .catch(() => showEventToast("error", "Failed to Load Parts", "Could not load parts for this job. Please try again."))
          .finally(() => setPartsLoading(false));
      } else {
        setParts([]);
      }
    } else {
      setForm(EMPTY_FORM);
      setDynamicValues({});
      setParts([]);
    }

    setPartForm(EMPTY_PART);
    setPayment(EMPTY_PAYMENT);
    setErrors({});
  }, [editData, open]);

  const set = (key, val) => {
    if (fieldsDisabled) return;
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const setDynamic = (fieldId, val) => {
    if (fieldsDisabled) return;
    setDynamicValues(prev => ({ ...prev, [fieldId]: val }));
  };

    const validatePartForm = () => {
    if (!partForm.name.trim()) return "Please enter a part name before adding.";
    const qty = Number(partForm.qty);
    if (!Number.isFinite(qty) || qty < 1) return "Quantity must be at least 1.";
    if (partForm.unitPrice !== "" && (!Number.isFinite(Number(partForm.unitPrice)) || Number(partForm.unitPrice) < 0)) {
      return "Unit price must be a valid non-negative number.";
    }
    return null;
  };

 const addPart = async () => {
  if (fieldsDisabled || addingPart) return;

  const partError = validatePartForm();
  if (partError) {
    showEventToast("error", "Invalid Part Details", partError);
    return;
  }

  setAddingPart(true);
  try {
    if (isEdit && editData?.id) {
      const res    = await createPart(editData.id, partForm);
      const entity = res?.data ?? res;
      setParts(prev => [
        ...prev,
        {
          id:         entity.id,
          name:       entity.itemName,
          qty:        entity.qty,
          unitPrice:  entity.price,
          _persisted: true,
        },
      ]);
      setPartForm(EMPTY_PART);
      showEventToast("success", "Part Added", `${partForm.name} has been added to this job.`);
    } else {
      setParts(prev => [...prev, { ...partForm, id: Date.now(), _persisted: false }]);
      setPartForm(EMPTY_PART);
    }
  } catch {
     showEventToast("error", "Failed to Add Part", "Something went wrong while adding this part. Please try again.");
  } finally {
    setAddingPart(false);
  }
};

  const removePart = async (id) => {
    if (fieldsDisabled) return;
    const part = parts.find(p => p.id === id);
    if (!part) return;

    if (part._persisted && id) {
      try {
        await deletePart(id);
        setParts(prev => prev.filter(p => p.id !== id));
       showEventToast("delete", "Part Removed", `${part.name || "Part"} has been removed from this job.`);
      } catch (err) {
        console.error("Delete part error:", err);
         showEventToast("error", "Failed to Remove Part", "Could not delete this part. Please try again.");
      }
    } else {
      setParts(prev => prev.filter(p => p.id !== id));
    }
  };

  const validate = () => {
    const e = validateForm(form, {
      customerName:     (v) => validateName(v, "Customer name"),
      customerPhone:    validatePhone,
      customerEmail:    validateEmailOptional,
      deviceBrand:      (v) => validateRequired(v, "Device brand"),
      deviceModel:      (v) => validateRequired(v, "Device model"),
      issueDescription: (v) => validateRequired(v, "Issue description"),
    });

    if (!officerEditView) dynamicFields.forEach(f => {
      if (f.type === "section_header") return; // display-only, no value
      if (f.isRequired) {
        const val = dynamicValues[f.id];
        if (val === undefined || val === null || val === "" || val === false) {
          e[`dynamic_${f.id}`] = `${f.label} is required`;
        }
      }
    });

    setErrors(e);
    return e;
  };

  const handleSubmit = async () => {
    if (isViewOnly || isPaymentMode) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      showEventToast("error", "Incomplete Form", Object.values(validationErrors)[0]);
      return;
    }

    setSubmitting(true);
    try {
      const fieldValues = dynamicFields
        .filter(f => f.type !== "section_header")
        .filter(f => dynamicValues[f.id] !== undefined && dynamicValues[f.id] !== "")
        .map(f => ({ fieldIdId: f.id, value: String(dynamicValues[f.id]) }));

      if (isEdit && editData?.id && isServiceOfficer) {
        const unpersisted = parts.filter(p => !p._persisted);
        for (const p of unpersisted) {
          await createPart(editData.id, p);
        }
      }

      onSubmit({
        ...form,
        status:      isEdit ? form.status : "New",
        fieldValues,
        parts:       isServiceOfficer ? parts : [],
      });

      setForm(EMPTY_FORM);
      setDynamicValues({});
      setParts([]);
      setPartForm(EMPTY_PART);
      setErrors({});
      onClose();
    } catch (err) {
       showEventToast("error", "Save Failed", err.message || "We couldn't save this request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

const confirmPayment = async () => {
  const amount = Number(payment.amountReceived);
  if (!payment.amountReceived || !Number.isFinite(amount) || amount <= 0) {
    showEventToast("error", "Invalid Amount", "Please enter a valid amount received.");
    return;
  }

  setSubmitting(true);
  try {
    onSubmit({
      ...form,
      status: "Closed",
      payment: {
        method: payment.method,
        amountReceived: amount,
      },
      fieldValues: [],
      parts: [],
    });
    onClose();
  } catch (err) {
    showEventToast("error", "Payment Failed", err.message || "We couldn't save this payment. Please try again.");
  } finally {
    setSubmitting(false);
  }
};
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const statusStyle = STATUS_COLORS[form.status] ?? { color: "#395062", bg: "#f0f4f6" };
  const totalDue = parts.reduce(
    (sum, p) => sum + (Number(p.qty) * Number(p.unitPrice ?? p.price ?? 0)),
    0
  );

  const title = isPaymentMode
    ? "Collect Payment"
    : isViewOnly
    ? "Request Details"
    : isEdit
    ? "Update Request"
    : "New Request";

  const subtitle = isPaymentMode
    ? `Collecting payment for ${editData?.tokenNum || editData?.id || ""}`
    : isViewOnly
    ? `Viewing request ${editData?.tokenNum || editData?.id || ""}`
    : isEdit
    ? `Editing ${editData?.tokenNum || editData?.id} — update the details below`
    : "Fill in the customer, device, and priority details";


  const footer = isPaymentMode ? null : isViewOnly ? (
    <button
      onClick={handleClose}
      className="w-full py-3 rounded-xl text-sm font-medium border transition-colors"
      style={{ borderColor: "rgba(57,80,98,0.2)", color: "#5a7585" }}
    >
      Close
    </button>
  ) : (
    <div className="flex gap-3">
      <button
        onClick={handleClose}
        disabled={submitting}
        className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
        style={{ borderColor: "rgba(57,80,98,0.2)", color: "#5a7585" }}
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "#02949D" }}
      >
        {submitting ? "Saving…" : isEdit ? "Save Changes" : "Submit Request"}
      </button>
    </div>
  );

  return (
    <SideDrawer open={open} onClose={handleClose} title={title} subtitle={subtitle} footer={footer}>
      <div className="flex flex-col gap-4">

        {isPaymentMode ? (
       
          <PaymentSection
            editData={editData}
            parts={parts}
            payment={payment}
            setPayment={setPayment}
            totalDue={totalDue}
            onConfirm={confirmPayment}
            submitting={submitting}
          />
        ) : isViewOnly ? (
        
          <div
            className="p-4 rounded-2xl flex flex-col gap-4"
            style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {form.status}
              </span>
              <span className="text-xs" style={{ color: "#8fa3af" }}>
                {editData?.tokenNum || `#${editData?.id || ""}`}
              </span>
            </div>

            <div style={{ borderTop: "1px solid #f0f4f6" }} />

            <div className="grid grid-cols-2 gap-4">
              <ViewRow label="Customer Name" value={form.customerName} />
              <ViewRow label="Phone Number" value={form.customerPhone} />
              <ViewRow label="Email" value={form.customerEmail} />
            </div>

            <div style={{ borderTop: "1px solid #f0f4f6" }} />

            <div className="grid grid-cols-2 gap-4">
              <ViewRow label="Brand" value={form.deviceBrand} />
              <ViewRow label="Model" value={form.deviceModel} />
            </div>
            <ViewRow label="Issue Description" value={form.issueDescription} />

            {dynamicFields.length > 0 && (
              <>
                <div style={{ borderTop: "1px solid #f0f4f6" }} />
                <div className="grid grid-cols-2 gap-4">
                  {dynamicFields.map(f => (
                    f.type === "section_header" ? (
                      <div key={f.id} className="col-span-2" style={{ marginTop: 2, paddingBottom: 4, borderBottom: "1px solid rgba(14,149,148,0.25)" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", textTransform: "uppercase", letterSpacing: ".04em" }}>{f.label}</div>
                      </div>
                    ) : (
                    <ViewRow
                      key={f.id}
                      label={f.label}
                      value={f.type === "checkbox" ? (dynamicValues[f.id] ? "Yes" : "No") : dynamicValues[f.id]}
                    />
                    )
                  ))}
                </div>
              </>
            )}

            <div style={{ borderTop: "1px solid #f0f4f6" }} />

            <div className="grid grid-cols-2 gap-4">
              <ViewRow label="Priority" value={form.priority} />
            </div>

            <div style={{ borderTop: "1px solid #f0f4f6" }} />

            <ViewRow label="Notes" value={form.serviceNotes || "No notes added."} />

            {partsLoading ? (
              <p className="text-xs" style={{ color: "#8fa3af" }}>Loading parts…</p>
            ) : parts.length > 0 ? (
              <>
                <div style={{ borderTop: "1px solid #f0f4f6" }} />
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#8fa3af" }}>
                    Parts / Components
                  </span>
                  {parts.map(p => {
                    const unitPrice = p.unitPrice ?? p.price ?? 0;
                    const lineTotal = Number(p.qty) * Number(unitPrice);
                    return (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span style={{ color: "#1a2e38" }}>{(p.name ?? p.itemName)} × {p.qty}</span>
                        {unitPrice ? (
                          <span style={{ color: "#1a2e38" }}>Rupees {lineTotal.toFixed(2)}</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <>
            {isEdit && (
              <div
                className="p-4 rounded-2xl flex flex-col gap-3"
                style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#02949D" }}>
                  Status
                </p>

                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {form.status}
                  </span>
                  <span className="text-xs" style={{ color: "#8fa3af" }}>current</span>
                </div>

                {(() => {
                  const allowed = getAllowedStatusOptions(form.status, roleId);
                  if (allowed.length === 0) {
                    return (
                      <p className="text-xs" style={{ color: "#8fa3af" }}>
                        No status transitions available for this request.
                      </p>
                    );
                  }
                  return (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs" style={{ color: "#5a7585" }}>Move to:</p>
                      <div className="flex flex-wrap gap-2">
                        {allowed.map(({ value, label }) => {
                          const s = STATUS_COLORS[value] ?? { color: "#395062", bg: "#f0f4f6" };
                          const selected = form.status === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => set("status", value)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                              style={{
                                background:  selected ? s.bg    : "transparent",
                                borderColor: selected ? s.color : "rgba(57,80,98,0.15)",
                                color:       selected ? s.color : "#5a7585",
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {officerEditView ? (
              <>
                <JobSummaryCard
                  form={form}
                  dynamicFields={dynamicFields}
                  dynamicValues={dynamicValues}
                />

                <PartsSection
                  parts={parts}
                  partForm={partForm}
                  setPartForm={setPartForm}
                  onAdd={addPart}
                  onRemove={removePart}
                  partsLoading={partsLoading}
                  addingPart={addingPart}
                  disabled={fieldsDisabled}
                />

                <div className="p-4 rounded-2xl"
                  style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#02949D" }}>
                    Service Notes
                  </p>
                  <textarea
                    value={form.serviceNotes}
                    onChange={(e) => set("serviceNotes", e.target.value)}
                    placeholder="Diagnosis, work done, parts replaced..."
                    rows={4}
                    disabled={fieldsDisabled}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white resize-none focus:ring-1 focus:border-[#0E9594] focus:ring-[#0E9594]"
                    style={{ borderColor: "rgba(57,80,98,0.2)", color: "#1a2e38", background: fieldsDisabled ? "#f4f7f9" : "#fff" }}
                  />
                </div>
              </>
            ) : (
            <>
            <div className="p-4 rounded-2xl flex flex-col gap-3"
              style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#02949D" }}>
                Customer Information
              </p>
              <FormInput
                label="Full Name" required placeholder="Ahmad bin Yusof"
                value={form.customerName} onChange={(e) => set("customerName", e.target.value)}
                icon={<User className="w-4 h-4" />} error={errors.customerName}
                disabled={fieldsDisabled}
              />
              <FormInput
                label="Phone Number" required placeholder="9876543210"
                value={form.customerPhone}
                onChange={(e) => set("customerPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                icon={<Phone className="w-4 h-4" />} error={errors.customerPhone}
                disabled={fieldsDisabled}
                maxLength={10}
              />
              <FormInput
                label="Email (optional)" type="email" placeholder="customer@email.com"
                value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                disabled={fieldsDisabled}
              />
            </div>

            <div className="p-4 rounded-2xl flex flex-col gap-3"
              style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#02949D" }}>
                Device Information
              </p>
              <FormSelect
                label="Brand" required value={form.deviceBrand}
                onChange={(e) => set("deviceBrand", e.target.value)}
                options={BRAND_OPTIONS} error={errors.deviceBrand}
                disabled={fieldsDisabled}
              />
              <FormInput
                label="Model" required placeholder="e.g. Galaxy S23 Ultra"
                value={form.deviceModel} onChange={(e) => set("deviceModel", e.target.value)}
                icon={<Smartphone className="w-4 h-4" />} error={errors.deviceModel}
                disabled={fieldsDisabled}
              />
              <FormSelect
                label="Issue Description" required value={form.issueDescription}
                onChange={(e) => set("issueDescription", e.target.value)}
                options={ISSUE_OPTIONS} error={errors.issueDescription}
                disabled={fieldsDisabled}
              />
            </div>

            {dynamicFields.length > 0 && (
              <div className="p-4 rounded-2xl flex flex-col gap-3"
                style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#02949D" }}>
                  Additional Details
                </p>
                {dynamicFields.map(f => (
                  <div key={f.id}>
                    <DynamicField
                      field={f}
                      value={dynamicValues[f.id]}
                      onChange={val => setDynamic(f.id, val)}
                      disabled={fieldsDisabled}
                    />
                    {errors[`dynamic_${f.id}`] && (
                      <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                        {errors[`dynamic_${f.id}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Parts: Service Officer edits parts while updating a job */}
            {isServiceOfficer && (
              <PartsSection
                parts={parts}
                partForm={partForm}
                setPartForm={setPartForm}
                onAdd={addPart}
                onRemove={removePart}
                partsLoading={partsLoading}
                addingPart={addingPart}
                disabled={fieldsDisabled}
              />
            )}


            <div className="p-4 rounded-2xl"
              style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#02949D" }}>
                Priority Level
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["High", "Medium", "Low"].map((p) => {
                  const c = PRIORITY_COLORS[p];
                  const selected = form.priority === p;
                  return (
                    <button
                      key={p} type="button"
                      onClick={() => set("priority", p)}
                      disabled={fieldsDisabled}
                      className="py-3 rounded-xl text-sm font-medium border-2 transition-all"
                      style={{
                        background:  selected ? c.bg        : "transparent",
                        borderColor: selected ? c.border    : "rgba(57,80,98,0.15)",
                        color:       selected ? c.color     : "#5a7585",
                        opacity:     fieldsDisabled && !selected ? 0.6 : 1,
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl"
              style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#02949D" }}>
                Initial Notes (optional)
              </p>
              <textarea
                value={form.serviceNotes}
                onChange={(e) => set("serviceNotes", e.target.value)}
                placeholder="Any initial observations or notes about the device..."
                rows={4}
                disabled={fieldsDisabled}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white resize-none focus:ring-1 focus:border-[#0E9594] focus:ring-[#0E9594]"
                style={{ borderColor: "rgba(57,80,98,0.2)", color: "#1a2e38", background: fieldsDisabled ? "#f4f7f9" : "#fff" }}
              />
            </div>
            </>
            )}
          </>
        )}
      </div>
    </SideDrawer>
  );
}