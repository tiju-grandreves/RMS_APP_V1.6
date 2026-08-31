import { useState, useEffect } from "react";

import {
  Package, Clock, Wrench, CheckCircle, Plus,
  TrendingUp, Archive
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CommonCard } from "../components/common/CommonCard";
import Layout from "../components/layout/Layout";
import FormInput from "../components/common/FormInput";
import Button from "../components/common/Button";
import DataTable from "../components/common/DataTable";
import { AddRequestDrawer } from "./AddRequestDrawer";
import httpService from "../services/httpService";

// ─── Shared constants ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  New:           { color: "#2563eb", bg: "#eff6ff" },
  "In Progress": { color: "#02949D", bg: "#e8f5f7" },
  Ready:         { color: "#16a34a", bg: "#f0fdf4" },
  Closed:        { color: "#395062", bg: "#edf1f4" },
  Cancelled:     { color: "#d4183d", bg: "#fff5f5" },
};

const PRIORITY_COLORS = {
  High: { color: "#d4183d", bg: "#fff5f5" },
  Medium: { color: "#d97706", bg: "#fffbf0" },
  Low: { color: "#16a34a", bg: "#f0fdf4" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Shared badge components ───────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
    style={{ background: STATUS_COLORS[status]?.bg, color: STATUS_COLORS[status]?.color }}
  >
    {status}
  </span>
);

const PriorityBadge = ({ priority }) => (
  <span
    className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
    style={{ background: PRIORITY_COLORS[priority]?.bg, color: PRIORITY_COLORS[priority]?.color }}
  >
    {priority}
  </span>
);

// ─── Shared stat card ──────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color, bg }) => (
  <CommonCard contentClassName="flex items-center gap-3 p-4">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: bg, color }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p
        className="font-bold truncate"
        style={{ color, fontSize: typeof value === "string" && value.length > 10 ? 13 : 20 }}
      >
        {value}
      </p>
      <p className="text-xs sm:text-sm leading-tight" style={{ color: "#5a7585" }}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#5a7585" }}>{sub}</p>}
    </div>
  </CommonCard>
);

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────
function AdminDashboard({ dashboard = {}, recentRequests = [] }) {
  const stats = [
    { label: "Total Jobs", value: dashboard.totalRequests, icon: <Package className="w-5 h-5" />, color: "#395062", bg: "#ecfeff" },
    { label: "New", value: dashboard.new, icon: <Clock className="w-5 h-5" />, color: "#2563eb", bg: "#eff6ff" },
    { label: "In Progress", value: dashboard.inProgress, icon: <Wrench className="w-5 h-5" />, color: "#02949D", bg: "#e8f5f7" },
    { label: "Ready", value: dashboard.ready, icon: <CheckCircle className="w-5 h-5" />, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Closed", value: dashboard.closed, icon: <Archive className="w-5 h-5" />, color: "#6b7280", bg: "#f3f4f6" },
  ];

  return (
    <>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <CommonCard title="Recent Requests" className="w-full min-h-[300px]" contentClassName="pt-4">
        {recentRequests?.slice(0, 5).map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between py-3 sm:py-4 border-b last:border-0 gap-2"
            style={{ borderColor: "rgba(57,80,98,0.06)" }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: "#1a2e38" }}>{req.customerName}</p>
              <p className="text-xs mt-1 truncate" style={{ color: "#5a7585" }}>
                {req.deviceBrand} {req.deviceModel} · {formatDate(req.createdDate)}
              </p>
            </div>
            {/* <StatusBadge status={req.status} /> */}
          </div>
        ))}
      </CommonCard>
    </>
  );
}

// ─── RECEPTIONIST DASHBOARD ────────────────────────────────────────────────
function ReceptionistDashboard({ dashboard = {}, recentRequests = [] }) {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Jobs", value: dashboard.totalRequests, icon: <Package className="w-5 h-5" />, color: "#395062", bg: "#ecfeff" },
    { label: "New", value: dashboard.new, icon: <Clock className="w-5 h-5" />, color: "#2563eb", bg: "#eff6ff" },
    { label: "In Progress", value: dashboard.inProgress, icon: <Wrench className="w-5 h-5" />, color: "#02949D", bg: "#e8f5f7" },
    { label: "Ready", value: dashboard.ready, icon: <CheckCircle className="w-5 h-5" />, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Closed", value: dashboard.closed, icon: <Archive className="w-5 h-5" />, color: "#6b7280", bg: "#f3f4f6" },
  ];

  return (
    <>
      <p className="text-sm -mt-2" style={{ color: "#778c9d" }}>Overview of all repair activity</p>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <CommonCard title="Recent Requests" className="w-full min-h-[300px]" contentClassName="pt-4">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => navigate("/RequestListing")}
            className="text-xs font-semibold"
            style={{ color: "#02949D", background: "none", border: "none", cursor: "pointer" }}
          >
            View all →
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="w-10 h-10" style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#778c9d" }}>No requests yet</p>
            <button
              onClick={() => navigate("/RequestListing")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: "#395062" }}
            >
              <Plus className="w-4 h-4" /> Add New Request
            </button>
          </div>
        ) : (
          recentRequests.slice(0, 5).map(req => (
            <div
              key={req.id}
              className="flex items-center justify-between py-3 sm:py-4 border-b last:border-0 gap-2"
              style={{ borderColor: "rgba(57,80,98,0.06)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: "#1a2e38" }}>{req.customerName}</p>
                <p className="text-xs mt-1 truncate" style={{ color: "#5a7585" }}>
                  {req.deviceBrand} {req.deviceModel} · {formatDate(req.createdDate)}
                </p>
              </div>
              {/* <StatusBadge status={req.status} /> */}
            </div>
          ))
        )}
      </CommonCard>
    </>
  );
}

// ─── SERVICE OFFICER DASHBOARD ─────────────────────────────────────────────
function ServiceOfficerDashboard({dashboard = {},recentRequests = [],})
 {
  const [requests, setRequests] = useState(recentRequests);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  const stats = [
    { label: "Total Jobs", value: dashboard.totalRequests, icon: <Package className="w-5 h-5" />, color: "#395062", bg: "#ecfeff" },
    { label: "New", value: dashboard.new, icon: <Clock className="w-5 h-5" />, color: "#2563eb", bg: "#eff6ff" },
    { label: "In Progress", value: dashboard.inProgress, icon: <Wrench className="w-5 h-5" />, color: "#02949D", bg: "#e8f5f7" },
    { label: "Ready", value: dashboard.ready, icon: <CheckCircle className="w-5 h-5" />, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Closed", value: dashboard.closed, icon: <Archive className="w-5 h-5" />, color: "#6b7280", bg: "#f3f4f6" },
  ];

  useEffect(() => {
    setRequests(recentRequests);
  }, [recentRequests]);

  return (
    <>
      <p className="text-sm -mt-2" style={{ color: "#5a7585" }}>Overview of all repair activity</p>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <CommonCard title="Recent Jobs">
        <div className="flex flex-col">
          {requests.slice(0, 5).map((r, idx) => ( 
            <div
              key={r.id}
              className="flex items-start sm:items-center justify-between py-3 sm:py-4 gap-2"
              style={idx !== requests.length - 1 ? { borderBottom: "1px solid rgba(57,80,98,0.08)" } : undefined}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: "#1a2e38" }}>{r.customerName}</p>
                <p className="text-xs mt-1 truncate" style={{ color: "#5a7585" }}>
                  {r.deviceBrand} {r.deviceModel} · {formatDate(r.createdDate)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end flex-shrink-0">
                <PriorityBadge priority={r.priority} />
            
                <button
                  onClick={() => setUpdatingRequest(r)}
                  className="text-xs font-semibold px-3 py-1 rounded-full hover:opacity-80 whitespace-nowrap"
                  style={{ background: "#edf1f4", color: "#395062" }}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </CommonCard>

      {updatingRequest && (
        <AddRequestDrawer
          open={!!updatingRequest}
          onClose={() => setUpdatingRequest(null)}
          editData={updatingRequest}
          mode="edit"
          wfId={null}
          onSubmit={(updated) => {
            setRequests(prev =>
              prev.map(r =>
                r.id === updatingRequest.id ? { ...r, ...updated } : r
              )
            );
            setUpdatingRequest(null);
          }}
        />
      )}
    </>
  );
}

// ─── ACCOUNTANT DASHBOARD ──────────────────────────────────────────────────
function AccountantDashboard({ requests: allRequests = [] }) {
 

  const [dashboard, setDashboard] = useState({
    jobs: [],
  });
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const deletedIds = [];

  const requestList = dashboard.jobs || [];

  const baseRequests = requestList.filter(
    r => !deletedIds.includes(r.id)
  );
  const validate = () => {
    const newErrors = {};
    if (!fromDate) newErrors.fromDate = "From date is required.";
    if (!toDate) newErrors.toDate = "To date is required.";
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      newErrors.toDate = "To date cannot be before From date.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const displayRequests = baseRequests.filter(r => {
    const q = search.trim().toLowerCase();
    const requestDate = new Date(r.createdDate).getTime();
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toTime = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;
    const matchQ =
    !q ||
    String(r.id).includes(q) ||
    (r.customerId?.name || "").toLowerCase().includes(q) ||
    (r.customerId?.phone || "").toLowerCase().includes(q) ||
    `${r.deviceBrand} ${r.deviceModel}`.toLowerCase().includes(q);

    const matchStatus = statusFilter === "All statuses" || r.status === statusFilter;
    console.log("matchStatus",matchStatus)
    const matchFrom = fromTime === null || requestDate >= fromTime;
    const matchTo = toTime === null || requestDate <= toTime;
    return matchQ && matchStatus && matchFrom && matchTo;
  });

  const total = displayRequests.reduce(
    (s, r) => s + Number(r.totalAmount || 0),
    0
  );

  const loadAccountDashboard = async () => {
    try {
     
      const response = await httpService.get("/payment-dtls/dashboard", {
        params: {
          status:
            statusFilter !== "All statuses"
              ? statusFilter
              : undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      });
  
      console.log("response", response);
      setDashboard(response.data);
    } catch (err) {
      console.error(err);
    }
  };

//   useEffect(()=>{
//     loadAccountDashboard();
// },[]);

console.log("allRequests:", allRequests, typeof allRequests);

  return (
    <>
    
  {/* <div className="flex flex-wrap items-end gap-3 mb-4"> */}
  <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
    
  <CommonCard title="Total Revenue">
    <p className="text-3xl font-bold text-[#d97706] ">
      RM {dashboard.totalRevenue ?? 0}
    </p>
    <p className="text-xs text-[#5a7585] mt-2">
      All collected payments
    </p>
  </CommonCard>

  <CommonCard title="Billed Jobs">
    <p className="text-3xl font-bold text-[#16a34a]">
      RM{dashboard.billedAmount ?? 0}
    </p>
    <p className="text-xs text-[#5a7585] mt-2">
      Payment received
    </p>
  </CommonCard>

  <CommonCard title="Pending Billing">
    <p className="text-3xl font-bold text-[#d4183d]">
      RM{dashboard.pendingAmount ?? 0}
    </p>
    <p className="text-xs text-[#5a7585] mt-2">
      Awaiting payment
    </p>
  </CommonCard></div>

  <div className="flex items-end gap-4 flex-wrap">
  {/* Status */}
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium" style={{ color: "#395062" }}>
      Status
    </label>
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="h-[42px] min-w-[180px] px-3 rounded-md border border-[#d6dfde] text-sm bg-white outline-none"
    >
      <option>--Select--</option>
      <option>All statuses</option>
      <option>New</option>
      <option>In Progress</option>
      <option>Ready</option>
      <option>Closed</option>
    </select>
  </div>

  {/* From */}
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium" style={{ color: "#395062" }}>
      From
    </label>
    <FormInput
      type="date"
      value={fromDate}
      onChange={(e) => {
        setFromDate(e.target.value);
        if (errors.fromDate)
          setErrors((p) => ({ ...p, fromDate: undefined }));
      }}
      className="h-10"
    />
  </div>

  {/* To */}
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium" style={{ color: "#395062" }}>
      To
    </label>
    <FormInput
      type="date"
      value={toDate}
      onChange={(e) => {
        setToDate(e.target.value);
        if (errors.toDate)
          setErrors((p) => ({ ...p, toDate: undefined }));
      }}
      className="h-10"
    />
  </div>

  {/* Search Button */}
  <Button
    variant="primary"
    onClick={loadAccountDashboard}
    className="h-10 px-4"
  >
    Search
  </Button>
</div>

  
{/* </div> */}
      <div className="overflow-x-auto -mx-4 px-4">
        <DataTable
          data={displayRequests}
          columns={[
            { key: "index", title: "No.", render: (_, idx) => <span className="text-[#5a7585]">{String(idx + 1).padStart(2, "0")}</span> },
            { key: "id", title: "Job ID", render: req => <span className="text-[#d97706] font-mono font-semibold text-xs">{req.id}</span> },
            {
              key: "customer", title: "Customer", render: req => (
                <div>
                  <p className="text-[#1b1d21] font-medium whitespace-nowrap">{req.customerId?.name}</p>
                  <p className="text-[#5a7585] text-xs">{req.customerId?.phone}</p>
                </div>
              )
            },
            { key: "device", title: "Device", render: req => <span className="text-[#1b1d21] whitespace-nowrap">{req.deviceBrand} {req.deviceModel}</span> },
            {
              key: "parts", title: "Parts", render: req => (
                <span className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-semibold"
                  style={{ background: (req.parts || []).length > 0 ? "#fffbf0" : "#f5f5f5", color: (req.parts || []).length > 0 ? "#d97706" : "#5a7585" }}>
                  {(req.parts || []).length > 0 ? `${(req.parts || []).length} part${(req.parts || []).length > 1 ? "s" : ""}` : "None"}
                </span>
              )
            },
            { key: "status", title: "Status", render: req => <StatusBadge status={req.status} /> },
            {
              key: "totalCost", title: "Total Cost", render: req =>
              Number(req.totalAmount || 0).toFixed(2) > 0
                  ? <span className="text-[#d97706] font-semibold whitespace-nowrap">RM{Number(req.totalAmount || 0).toFixed(2)}</span>
                  : <span className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#fff5f5] text-[#d4183d] whitespace-nowrap">Not billed</span>
            },
            { key: "date", title: "Date", render: req => <span className="text-[#555] text-xs whitespace-nowrap">{formatDate(req.createdDate)}</span> },
          ]}
        />
      </div>
  

      <div className="px-1 flex justify-end">
        <p className="text-sm font-bold" style={{ color: "#d97706" }}>
        Total: RM{total.toFixed(2)}
        </p>
      </div>
  
 <div className="flex flex-wrap items-end gap-3">

 </div>
</>
  );

        }
// ─── ROLE CONFIG ───────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin:          { title: "Admin Dashboard",    breadcrumb: [{ label: "Dashboard" }] },
  receptionist:   { title: "Dashboard",          breadcrumb: [{ label: "Dashboard" }] },
  serviceOfficer: { title: "Dashboard",          breadcrumb: [{ label: "Dashboard" }] },
  "account manager":     { title: "Financial Overview", breadcrumb: [{ label: "Financial Overview" }] },
};



// ─── MAIN UNIFIED DASHBOARD ────────────────────────────────────────────────
export default function Dashboard({ role = "admin" }) {
  const [recentRequests, setRecentRequests] = useState([]);
  const [dashboard, setDashboard] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);
  
  const loadDashboard = async () => {
    try {
      const response = await httpService.get("/job-dtls/dashboard");
      const data = response?.data || {};
      setDashboard(data);
      setRecentRequests(data.recentRequests || []);
    } catch (error) {
      console.error(error);
      setDashboard({});
    setRecentRequests([]);
    }
  };
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.admin;

  return (
    <Layout pageTitle={config.title} showSearch={role !== "account manager"}>
      <div className="flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 pt-4 sm:pt-5 pb-6">
        {role === "admin"          && <AdminDashboard dashboard={dashboard} 
    recentRequests={recentRequests} />}
        {role === "receptionist"   && <ReceptionistDashboard dashboard={dashboard}  recentRequests={recentRequests} />}
        {role === "serviceOfficer" && <ServiceOfficerDashboard dashboard={dashboard}  recentRequests={recentRequests} />}
        {role === "account manager" && <AccountantDashboard requests={dashboard.requests || []} />}
      </div>
    </Layout>
  );
  }