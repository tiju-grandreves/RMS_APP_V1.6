import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Package,
  EyeIcon,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  Smartphone,
  Wallet,
  ArrowRight,
  UserCheck,
} from "lucide-react";

import Layout from "../components/layout/Layout";
import DataTable from "../components/common/DataTable";
import { AddRequestDrawer } from "./AddRequestDrawer";

import TableFilter from "../components/common/TableFilter";
import DeleteUser from "../components/common/DeleteUser";
import ConfirmModal from "../components/common/ConfirmModal";
import Pagination from "../components/common/Pagination";
import { showEventToast } from "../components/common/toastHelper";
import { getJobs, createJob, updateJob, deleteJob, saveJobFieldValues, getJobFieldValues, createPayment, advanceStage } from "../services/jobService";
import { getWorkflows } from "../services/workflowService";

const STATUS_COLORS = {
  New:           { color: "#2563eb", bg: "#eff6ff" },
  "In Progress": { color: "#d97706", bg: "#fffbf0" },
  Ready:         { color: "#16a34a", bg: "#f0fdf4" },
  Closed:        { color: "#395062", bg: "#edf1f4" },
  Cancelled:     { color: "#d4183d", bg: "#fff5f5" },
};

const PRIORITY_COLORS = {
  High: { color: "#d4183d", bg: "#fff5f5" },
  Medium: { color: "#d97706", bg: "#fffbf0" },
  Low: { color: "#16a34a", bg: "#f0fdf4" },
};

const PAGE_SIZE = 10;
const GRID_PAGE_SIZE = 9;

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
}

function getAllowedStatusOptions(currentStatus, roleId) {
  if (roleId === 1) return []; 
  if (roleId === 3) { 
    if (currentStatus === "New")         return [{ value: "In Progress", label: "In Progress" }];
    if (currentStatus === "In Progress") return [{ value: "Ready",       label: "Ready" }];
    return [];
  }
  if (roleId === 2) { 
    if (currentStatus === "Ready") return [{ value: "Closed", label: "Closed" }];
    return [];
  }
  return [];
}


function StatusSelect({ status, jobId, roleId, onChange }) {
  const allowed = getAllowedStatusOptions(status, roleId);
  const s = STATUS_COLORS[status] ?? { color: "#555", bg: "#f0f0f0" };

  if (!allowed.length) {
    return (
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{ background: s.bg, color: s.color }}
      >
        {status}
      </span>
    );
  }

  return (
    <select
      value={status}
      onChange={e => onChange(jobId, e.target.value)}
      title="Click to change status"
      style={{
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.color}60`,
        borderRadius: 999,
        padding: "2px 6px 2px 8px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        outline: "none",
      }}
    >
      <option value={status} disabled>{status}</option>
      {allowed.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}

function mapJobToDisplay(job) {
  return {
    id: job.id,
    tokenNum: job.tokenNum,
    customerName: job.customerName || "—",
    customerPhone: job.customerPhone || "—",
    customerEmail: job.customerEmail || "",
    deviceBrand: job.deviceBrand || "—",
    deviceModel: job.deviceModel || "—",
    issueDescription: job.description || "—",
    priority: job.priority || "Medium",
    status: job.status || "New",
    serviceNotes: job.diagnosisNotes || "",
    createdAt: job.createdDate,
    updatedAt: job.createdDate,
    customerIdId: job.customerIdId,
    currentStageIdId: job.currentStageIdId,
    assignedRoleName: job.assignedRoleName || "",
    assignedToName: job.assignedToName || "",
  };
}

// ── Grid Card Component ──────────────────────────────────────────────────────
function JobCard({ row, onView, onEdit, onDelete, onPayment, onAdvance, canAdvance, canDelete, canEdit, canPayment, roleId, onStatusChange }) {
  const priorityStyle = PRIORITY_COLORS[row.priority] ?? { color: "#555", bg: "#f0f0f0" };
  const isNew = row.status === "New";
  const paymentReady = row.status === "Ready";

  return (
    <div
      className="rounded-2xl bg-white flex flex-col"
      style={{
        border: isNew ? `2px solid ${STATUS_COLORS.New.color}` : "1.5px solid #e8edf0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-mono font-bold tracking-wide" style={{ color: "#02949D" }}>
          {row.tokenNum || `#${row.id}`}
        </span>
        <StatusSelect
          status={row.status}
          jobId={row.id}
          roleId={roleId}
          onChange={onStatusChange}
        />
      </div>

      {/* Customer Info */}
      <div className="px-4 pb-2">
        <p className="text-sm font-bold truncate" style={{ color: "#1a2e38" }}>{row.customerName}</p>
        <p className="text-xs" style={{ color: "#5a7585" }}>{row.customerPhone}</p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f0f4f6", margin: "0 16px" }} />

      {/* Device Info */}
      <div className="px-4 py-3 flex items-start gap-2">
        <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#5a7585" }} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "#1a2e38" }}>
            {row.deviceBrand} {row.deviceModel}
          </p>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#5a7585" }}>
            {row.issueDescription}
          </p>
        </div>
      </div>

      {/* Priority + Date */}
      <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
        <span
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: priorityStyle.bg, color: priorityStyle.color }}
        >
          {row.priority}
        </span>
        <span className="text-xs" style={{ color: "#8fa3af" }}>{formatDate(row.createdAt)}</span>
      </div>

      {/* Assigned */}
      {(row.assignedToName || row.assignedRoleName) && (
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <UserCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#0F6E56" }} />
          {row.assignedToName && (
            <span className="text-xs font-medium" style={{ color: "#1a2e38" }}>{row.assignedToName}</span>
          )}
          {row.assignedRoleName && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e8f5f7", color: "#085041" }}>
              {row.assignedRoleName}
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f0f4f6" }} />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => onView(row)}
          className="flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors"
          style={{ borderColor: "#d0dde3", color: "#395062", background: "#fff" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f4f7f9"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
        >
          View Details
        </button>
        {canAdvance && (
          <button
            onClick={() => onAdvance(row)}
            className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 transition-colors"
            style={{ background: "#eef7f0", color: "#0F6E56" }}
            title="Advance to next stage"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {canEdit && (
          <button
            onClick={() => onEdit(row)}
            className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 transition-colors"
            style={{ background: "#edf1f4", color: "#395062" }}
            title="Update Job"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {canPayment && (
          <button
            onClick={() => paymentReady && onPayment(row)}
            disabled={!paymentReady}
            className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 transition-colors"
            style={{
              background: paymentReady ? "#f0fdf4" : "#f4f7f9",
              color: paymentReady ? "#16a34a" : "#b0c4ce",
              cursor: paymentReady ? "pointer" : "not-allowed",
            }}
            title={paymentReady ? "Collect Payment" : "Available once request is Ready"}
          >
            <Wallet className="w-3.5 h-3.5" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(row)}
            className="flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 transition-colors"
            style={{ background: "#fff5f5", color: "#d4183d" }}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function RequestListing() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add"); 
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  // const [selectedRequest, setSelectedRequest] = useState(null);
  const [editRequest, setEditRequest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeWfId, setActiveWfId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [advanceTarget, setAdvanceTarget] = useState(null);
  const [advanceNotes, setAdvanceNotes] = useState("");
  const [advancing, setAdvancing] = useState(false);

  const currentUser = getCurrentUser();
  const roleId = currentUser?.roleId ?? 1;
  const isReceptionist = roleId === 2;
  const canDelete = roleId === 1 || roleId === 2;

  // const loadJobs = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const data = await getJobs({ page: 1, take: 200 });
  //     setRequests((data.rows || []).map(mapJobToDisplay));
  //   } catch (err) {
  //     console.error("Failed to load jobs:", err);
  //     showEventToast("error", "Failed to Load Requests", "We couldn't load the repair requests. Please refresh and try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const loadJobs = useCallback(async () => {
    console.count("loadJobs called");
    setLoading(true);
  
    try {
      const data = await getJobs({
        page: currentPage,
        take: viewMode === "grid" ? GRID_PAGE_SIZE : PAGE_SIZE,
        search,
        status: statusFilter === "All" ? undefined : statusFilter,
      });

      console.log("API Response:", data.rows);
  
      setRequests((data.rows || []).map(mapJobToDisplay));
  
      // Save total records if your API returns it
      // setTotalRows(data.total || 0);
  
    } catch (err) {
      console.error("Failed to load jobs:", err);
      showEventToast("error", "Failed to Load Requests", "We couldn't load the repair requests. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, viewMode]);


  useEffect(() => { loadJobs(); }, [loadJobs]);

  useEffect(() => {
    getWorkflows({ page: 1, take: 100 })
      .then(data => {
        const active = (data.rows ?? []).find(wf => wf.isActive);
        if (active) setActiveWfId(active.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  // const filteredRequests = requests.filter((r) => {
  //   const matchesSearch =
  //     (r.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
  //     String(r.id).toLowerCase().includes(search.toLowerCase()) ||
  //     (r.tokenNum || "").toLowerCase().includes(search.toLowerCase()) ||
  //     (r.deviceBrand || "").toLowerCase().includes(search.toLowerCase()) ||
  //     (r.deviceModel || "").toLowerCase().includes(search.toLowerCase());
  //   const matchesStatus = statusFilter === "All" || r.status === statusFilter;
  //   return matchesSearch && matchesStatus;
  // });

  const pageSize = viewMode === "grid" ? GRID_PAGE_SIZE : PAGE_SIZE;
  // const paginatedRequests = filteredRequests.slice(
  //   (currentPage - 1) * pageSize,
  //   currentPage * pageSize
  // );
  const rowOffset = (currentPage - 1) * pageSize;

  // ── CRUD handlers ───────────────────────────────────────────────────────
  const handleAddRequest = async (formData) => {
    try {
      const res = await createJob(formData);
      const newJobId = res?.data?.id;
      if (newJobId && formData.fieldValues?.length) {
        try {
          await saveJobFieldValues(newJobId, formData.fieldValues);
        } catch (fvErr) {
          console.error("Field values save error:", fvErr);
           showEventToast("warning", "Partial Save", "The request was created, but some additional field values couldn't be saved.");
        }
      }
      showEventToast("success", "Request Created", "The new repair request has been added successfully.");
      loadJobs();
    } catch (err) {
      console.error("Create job error:", err);
      showEventToast("error", "Failed to Create Request", err?.message || "Something went wrong while creating the request. Please try again.");
    }
  };

const handleEditRequest = async (formData) => {
  try {
    await updateJob(editRequest.id, { ...formData, customerIdId: editRequest.customerIdId });
    if (formData.fieldValues?.length) {
      try {
        await saveJobFieldValues(editRequest.id, formData.fieldValues);
      } catch (fvErr) {
        console.error("Field values save error:", fvErr);
          showEventToast("warning", "Partial Save", "The request was updated, but some additional field values couldn't be saved.");
      }
    }
  showEventToast("success", "Request Updated", "The request has been updated successfully.");
    setEditRequest(null);
    loadJobs();

    } catch (err) {
      console.error("Update job error:", err);
     showEventToast("error", "Failed to Update Request", err?.message || "Something went wrong while updating the request. Please try again.");
    }
  };

  const handleDelete = async (target) => {
    try {
      await deleteJob(target.id);
       showEventToast("delete", "Request Deleted", "The repair request has been permanently removed.");
      setDeleteTarget(null);
      loadJobs();
    } catch (err) {
      console.error("Delete job error:", err);
      showEventToast("error", "Failed to Delete Request", err?.message || "Something went wrong while deleting the request. Please try again.");
    }
  };

  const handlePaymentSubmit = async (formData) => {
  if (!editRequest?.id) return;

  try {
    await createPayment({
      jobIdId: editRequest.id,
      method: formData.payment.method,
      amountReceived: Number(formData.payment.amountReceived),
    });

    await updateJob(editRequest.id, { status: "Closed" });
    showEventToast("success", "Payment Recorded", "Payment was recorded and this job has been closed.");
    setEditRequest(null);
    setDrawerOpen(false);
    loadJobs();
  } catch (err) {
    console.error("Payment submission error:", err);
    const backendMsg = err?.message || err?.error || err?.response?.data?.message || "Something went wrong while saving the payment. Please try again.";
    showEventToast("error", "Payment Failed", backendMsg);
  }
};

  const handleViewClick = async (row) => {
  let fieldValues = [];
  try { fieldValues = await getJobFieldValues(row.id); } catch (err) { console.error(err); }
  setEditRequest({ ...row, fieldValues });
  setDrawerMode("view");
  setDrawerOpen(true);
};
const handleEditClick = async (row) => {
  let fieldValues = [];
  try { fieldValues = await getJobFieldValues(row.id); } catch (err) { console.error(err); }
  setEditRequest({ ...row, fieldValues });
  setDrawerMode("edit");
  setDrawerOpen(true);
};
  const handleDeleteClick = (row) => {
    setDeleteTarget({ id: row.id, name: row.customerName, email: null });
  };


  const handlePaymentClick = (row) => {
    if (row.status !== "Ready") return;
    setEditRequest({ ...row, fieldValues: [] });
    setDrawerMode("payment");
    setDrawerOpen(true);
  };

  const handleStatusChange = useCallback(async (jobId, newStatus) => {
  
    setRequests(prev => prev.map(r => r.id === jobId ? { ...r, status: newStatus } : r));
    try {
      await updateJob(jobId, { status: newStatus });
       showEventToast("success", "Status Updated", `This request has been moved to "${newStatus}".`);
    } catch (err) {
      console.error("Status update error:", err);
        showEventToast("error", "Failed to Update Status", err?.message || "Something went wrong while updating the status. Please try again.");
      loadJobs();
    }
  }, [loadJobs]);

  // ── Advance stage (runs the backend condition engine) ─────────────────────
  const canAdvance = (row) => row.status !== "Closed" && row.status !== "Cancelled";

  const handleAdvanceClick = (row) => { setAdvanceNotes(""); setAdvanceTarget(row); };

  const confirmAdvance = async () => {
    if (!advanceTarget) return;
    setAdvancing(true);
    try {
      const res = await advanceStage(advanceTarget.id, advanceNotes.trim() || undefined);
      if (res?.success === false) {
        showEventToast("warning", "Cannot Advance", res?.message || "This request could not be advanced.");
      } else {
        showEventToast("success", "Stage Advanced", res?.message || "The request has moved to the next stage.");
      }
      setAdvanceTarget(null);
      setAdvanceNotes("");
      loadJobs();
    } catch (err) {
      showEventToast("error", "Failed to Advance", err?.message || err?.error || "Something went wrong while advancing this request.");
    } finally {
      setAdvancing(false);
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      key: "no",
      title: "No.",
      flex: "0 0 50px",
      minWidth: "50px",
      render: (_, index) => (
        <span className="text-sm font-medium" style={{ color: "#5a7585" }}>
          {String(rowOffset + index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      key: "tokenNum",
      title: "Token",
      flex: "0 0 100px",
      minWidth: "100px",
      render: (row) => (
        <span className="text-xs font-mono font-semibold" style={{ color: "#02949D" }}>
          {row.tokenNum || `#${row.id}`}
        </span>
      ),
    },
    {
      key: "customer",
      title: "Customer",
      flex: "1.5",
      render: (row) => (
        <>
          <p className="text-sm font-medium truncate" style={{ color: "#1a2e38" }}>{row.customerName}</p>
          <p className="text-xs" style={{ color: "#5a7585" }}>{row.customerPhone}</p>
        </>
      ),
    },
    {
      key: "device",
      title: "Device",
      flex: "1",
      render: (row) => (
        <>
          <p className="text-sm truncate" style={{ color: "#1a2e38" }}>{row.deviceBrand}</p>
          <p className="text-xs truncate" style={{ color: "#5a7585" }}>{row.deviceModel}</p>
        </>
      ),
    },
    {
      key: "issueDescription",
      title: "Issue",
      flex: "1.5",
      render: (row) => (
        <p className="text-xs truncate max-w-[140px]" style={{ color: "#5a7585" }} title={row.issueDescription}>
          {row.issueDescription}
        </p>
      ),
    },
    {
      key: "status",
      title: "Status",
      flex: "0 0 120px",
      minWidth: "120px",
      render: (row) => (
        <StatusSelect
          status={row.status}
          jobId={row.id}
          roleId={roleId}
          onChange={handleStatusChange}
        />
      ),
    },
    {
      key: "assigned",
      title: "Assigned",
      flex: "0 0 130px",
      minWidth: "130px",
      render: (row) => (
        row.assignedRoleName || row.assignedToName ? (
          <div className="min-w-0">
            {row.assignedToName && (
              <p className="text-xs font-medium truncate" style={{ color: "#1a2e38" }}>{row.assignedToName}</p>
            )}
            {row.assignedRoleName && (
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[120px]" style={{ background: "#e8f5f7", color: "#085041" }} title={row.assignedRoleName}>
                {row.assignedRoleName}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs" style={{ color: "#b0c4ce" }}>—</span>
        )
      ),
    },
    {
      key: "priority",
      title: "Priority",
      flex: "0 0 85px",
      minWidth: "85px",
      render: (row) => (
        <span
          className="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
          style={{ background: PRIORITY_COLORS[row.priority]?.bg ?? "#f0f0f0", color: PRIORITY_COLORS[row.priority]?.color ?? "#555" }}
        >
          {row.priority}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: "Date",
      flex: "0 0 100px",
      minWidth: "100px",
      render: (row) => (
        <span className="text-xs" style={{ color: "#5a7585" }}>{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "action",
      title: "Action",
      flex: "0 0 140px",
      minWidth: "140px",
      render: (row) => {
        const paymentReady = row.status === "Ready";
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleViewClick(row)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105"
              style={{ background: "#e8f5f7", color: "#02949D" }}
              title="View"
            >
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
            {canAdvance(row) && (
              <button
                onClick={() => handleAdvanceClick(row)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105"
                style={{ background: "#eef7f0", color: "#0F6E56" }}
                title="Advance to next stage"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {roleId !== 1 && (
              <button
                onClick={() => handleEditClick(row)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105"
                style={{ background: "#fffbf0", color: "#d97706" }}
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {isReceptionist && (
              <button
                onClick={() => paymentReady && handlePaymentClick(row)}
                disabled={!paymentReady}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                style={{
                  background: paymentReady ? "#f0fdf4" : "#f4f7f9",
                  color: paymentReady ? "#16a34a" : "#b0c4ce",
                  cursor: paymentReady ? "pointer" : "not-allowed",
                }}
                title={paymentReady ? "Collect Payment" : "Available once request is Ready"}
              >
                <Wallet className="w-3.5 h-3.5" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDeleteClick(row)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105"
                style={{ background: "#fff5f5", color: "#d4183d" }}
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
  <Layout 
 showSearch={false} breadcrumbs={[{ label: "Requests Listing" }]}>
      <div className="-mt-2 px-3 sm:px-6 pt-4 sm:pt-5">

     
<div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2">

 
  <div className="flex-1 min-w-0" />

 
  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

  
    <div className="flex-1 sm:flex-none">
      <TableFilter
        search={search}
        onSearchChange={setSearch}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        searchPlaceholder="Search requests..."
        filterOptions={["All", "New", "In Progress", "Ready", "Closed", "Cancelled"]}
      />
    </div>

    
    <div
      className="flex items-center rounded-xl overflow-hidden flex-shrink-0"
      style={{ border: "1.5px solid #d0dde3", background: "#f4f7f9" }}
    >
      <button
        onClick={() => { setViewMode("grid"); setCurrentPage(1); }}
        className="flex items-center justify-center w-9 h-9 transition-all"
        style={{
          background: viewMode === "grid" ? "#395062" : "transparent",
          color: viewMode === "grid" ? "#fff" : "#5a7585",
        }}
        title="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => { setViewMode("list"); setCurrentPage(1); }}
        className="flex items-center justify-center w-9 h-9 transition-all"
        style={{
          background: viewMode === "list" ? "#395062" : "transparent",
          color: viewMode === "list" ? "#fff" : "#5a7585",
        }}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>

    {/* Add Button */}
    {isReceptionist && (
      <button
        onClick={() => { setEditRequest(null); setDrawerMode("add"); setDrawerOpen(true); }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm whitespace-nowrap flex-shrink-0"
        style={{ background: "#395062" }}
      >
        <Plus className="w-4 h-4" />
        <span>Add New Request</span>
      </button>
    )}
  </div>
</div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "#02949D", borderTopColor: "transparent" }}
            />
            <span className="ml-3 text-sm" style={{ color: "#5a7585" }}>Loading requests...</span>
          </div>

        ) : viewMode === "grid" ? (
          /* ── Grid View ── */
          <>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20" style={{ color: "#8fa3af" }}>
                <Package className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No requests found.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}
              >
                {requests.map((row) => (
                  <JobCard
                    key={row.id}
                    row={row}
                   onView={handleViewClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onPayment={handlePaymentClick}
                    onAdvance={handleAdvanceClick}
                    canAdvance={canAdvance(row)}
                    canDelete={canDelete}
                    canEdit={roleId !== 1}
                    canPayment={isReceptionist}
                    roleId={roleId}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
            <Pagination
              totalRecords={statusFilter.length}
              pageSize={GRID_PAGE_SIZE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>

        ) : (
          /* ── List View ── */
          <>
            {/* Mobile card fallback for list view on very small screens */}
            <div className="block sm:hidden">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20" style={{ color: "#8fa3af" }}>
                  <Package className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">No requests found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {requests.map((row) => {
                    const paymentReady = row.status === "Ready";
                    return (
                    <div
                      key={row.id}
                      className="bg-white rounded-2xl p-4"
                      style={{ border: "1.5px solid #e8edf0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: "#1a2e38" }}>{row.customerName}</p>
                          <p className="text-xs" style={{ color: "#5a7585" }}>{row.customerPhone}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="text-xs font-mono font-bold" style={{ color: "#02949D" }}>
                            {row.tokenNum || `#${row.id}`}
                          </span>
                          <StatusSelect
                            status={row.status}
                            jobId={row.id}
                            roleId={roleId}
                            onChange={handleStatusChange}
                          />
                        </div>
                      </div>

                      {/* Device */}
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#5a7585" }} />
                        <p className="text-xs truncate" style={{ color: "#1a2e38" }}>
                          {row.deviceBrand} {row.deviceModel}
                        </p>
                      </div>

                      {/* Issue */}
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: "#5a7585" }}>
                        {row.issueDescription}
                      </p>

                      {/* Priority + Date */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: PRIORITY_COLORS[row.priority]?.bg ?? "#f0f0f0", color: PRIORITY_COLORS[row.priority]?.color ?? "#555" }}
                        >
                          {row.priority}
                        </span>
                        <span className="text-xs" style={{ color: "#8fa3af" }}>{formatDate(row.createdAt)}</span>
                      </div>

                      {/* Assigned */}
                      {(row.assignedToName || row.assignedRoleName) && (
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <UserCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#0F6E56" }} />
                          {row.assignedToName && (
                            <span className="text-xs font-medium" style={{ color: "#1a2e38" }}>{row.assignedToName}</span>
                          )}
                          {row.assignedRoleName && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e8f5f7", color: "#085041" }}>
                              {row.assignedRoleName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2" style={{ borderTop: "1px solid #f0f4f6", paddingTop: "12px" }}>
                        <button
                        onClick={() => handleViewClick(row)}
                          className="flex-1 text-xs font-semibold py-2 rounded-xl border"
                          style={{ borderColor: "#d0dde3", color: "#395062", background: "#fff" }}
                        >
                          View
                        </button>
                        {canAdvance(row) && (
                          <button
                            onClick={() => handleAdvanceClick(row)}
                            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                            style={{ background: "#eef7f0", color: "#0F6E56" }}
                            title="Advance to next stage"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {roleId !== 1 && (
                          <button
                            onClick={() => handleEditClick(row)}
                            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                            style={{ background: "#edf1f4", color: "#395062" }}
                            title="Update Job"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isReceptionist && (
                          <button
                            onClick={() => paymentReady && handlePaymentClick(row)}
                            disabled={!paymentReady}
                            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                            style={{
                              background: paymentReady ? "#f0fdf4" : "#f4f7f9",
                              color: paymentReady ? "#16a34a" : "#b0c4ce",
                              cursor: paymentReady ? "pointer" : "not-allowed",
                            }}
                            title={paymentReady ? "Collect Payment" : "Available once request is Ready"}
                          >
                            <Wallet className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                            style={{ background: "#fff5f5", color: "#d4183d" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop table */}
          {/* Desktop table */}
<div className="hidden sm:block rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(57,80,98,0.1)", boxShadow: "0 1px 4px rgba(2,80,98,0.06)" }}>
  <div className="overflow-x-auto">
    <DataTable data={requests} columns={columns} />
  </div>
</div>

<div
  className="sticky bottom-0  px-2 py-1 rounded-2xl"
 
>
  <Pagination
    totalRecords={statusFilter.length}
    pageSize={PAGE_SIZE}
    currentPage={currentPage}
    onPageChange={setCurrentPage}
  />
</div>
          </>
        )}
      </div>

  <AddRequestDrawer
  open={drawerOpen}
  onClose={() => { setDrawerOpen(false); setEditRequest(null); }}
  onSubmit={
    drawerMode === "payment"
      ? handlePaymentSubmit
      : editRequest
        ? handleEditRequest
        : handleAddRequest
  }
  editData={editRequest}
  wfId={activeWfId}
  mode={drawerMode}
/>

     

      <DeleteUser
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        user={deleteTarget}
        entityName="Request"
      />

      <ConfirmModal
        isOpen={!!advanceTarget}
        onClose={() => { if (!advancing) { setAdvanceTarget(null); setAdvanceNotes(""); } }}
        title="Advance to next stage"
        description={advanceTarget ? `Move request ${advanceTarget.tokenNum || `#${advanceTarget.id}`} to the next stage? The workflow rules will assign the right role automatically.` : ""}
        showTextarea
        textareaValue={advanceNotes}
        onTextareaChange={setAdvanceNotes}
        confirmText="Advance"
        cancelText="Cancel"
        onConfirm={confirmAdvance}
        loading={advancing}
        confirmButtonColor="#0F6E56"
      />
    </Layout>
  );
}