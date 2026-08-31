import { useState } from "react";
import { Package, Wrench, CheckCircle, Clock } from "lucide-react";
import Layout from "../components/layout/Layout";
import { CommonCard } from "../components/common/CommonCard";
import UpdateDrawer from "./UpdateDrawer";

const MOCK_REQUESTS = [
  {
    id: "REQ-1001",
    customerName: "Ahmad bin Yusof",
    device: "Samsung Galaxy S23 Ultra",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "REQ-1002",
    customerName: "Priya Nair",
    device: "Apple iPhone 15 Pro",
    status: "Ready",
    priority: "Medium",
  },
  {
    id: "REQ-1003",
    customerName: "Wong Kai Wen",
    device: "Xiaomi Redmi Note 13 Pro",
    status: "New",
    priority: "High",
  },
];

const STATUS_COLORS = {
  New: { color: "#d4183d", bg: "#fff5f5" },
  "In Progress": { color: "#02949D", bg: "#e8f5f7" },
  Ready: { color: "#16a34a", bg: "#f0fdf4" },
};

const PRIORITY_COLORS = {
  High: { color: "#d4183d", bg: "#fff5f5" },
  Medium: { color: "#d97706", bg: "#fffbf0" },
  Low: { color: "#16a34a", bg: "#f0fdf4" },
};

const StatusBadge = ({ status }) => (
  <span
    className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
    style={{
      background: STATUS_COLORS[status]?.bg,
      color: STATUS_COLORS[status]?.color,
    }}
  >
    {status}
  </span>
);

const PriorityBadge = ({ priority }) => (
  <span
    className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
    style={{
      background: PRIORITY_COLORS[priority]?.bg,
      color: PRIORITY_COLORS[priority]?.color,
    }}
  >
    {priority}
  </span>
);


export default function ServiceOfficerHome() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  const handleUpdate = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setUpdatingRequest(null);
  };

  const stats = [
    {
      label: "New Requests",
      value: requests.filter((r) => r.status === "New").length,
      icon: <Clock className="w-5 h-5" />,
      color: "#d97706",
      bg: "#fffbf0",
    },
    {
      label: "In Progress",
      value: requests.filter((r) => r.status === "In Progress").length,
      icon: <Wrench className="w-5 h-5" />,
      color: "#02949D",
      bg: "#e8f5f7",
    },
    {
      label: "Ready for Pickup",
      value: requests.filter((r) => r.status === "Ready").length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "Total Jobs",
      value: requests.length,
      icon: <Package className="w-5 h-5" />,
      color: "#395062",
      bg: "#edf1f4",
    },
  ];

  return (
    <Layout pageTitle="Dashboard" showSearch={false} breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="px-6 pt-5">
        <p className="text-sm mt-3 mb-4" style={{ color: "#5a7585" }}>
          Overview of all repair activity
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {stats.map((s) => (
            <CommonCard key={s.label}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold leading-tight" style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-sm" style={{ color: "#5a7585" }}>
                    {s.label}
                  </p>
                </div>
              </div>
            </CommonCard>
          ))}
        </div>

        {/* Recent Requests */}
        <CommonCard title="Recent Jobs">
          <div className="flex flex-col">
            {requests.map((r, idx) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-4"
                style={
                  idx !== requests.length - 1
                    ? { borderBottom: "1px solid rgba(57,80,98,0.08)" }
                    : undefined
                }
              >
                {/* Left — name + device */}
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1a2e38" }}>
                    {r.customerName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#5a7585" }}>
                    {r.device}
                  </p>
                </div>

                {/* Right — priority + status + update button */}
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={r.priority} />
                  <StatusBadge status={r.status} />
                  <button
                    onClick={() => setUpdatingRequest(r)}
                    className="text-xs font-semibold px-3 py-1 rounded-full transition-all hover:opacity-80"
                    style={{ background: "#edf1f4", color: "#395062" }}
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CommonCard>
      </div>

     {updatingRequest && (
  <UpdateDrawer
    isOpen={!!updatingRequest}
    onClose={() => setUpdatingRequest(null)}
    request={updatingRequest}
    onSave={(updatedRequest) => {
      setRequests((prev) =>
        prev.map((r) => r.id === updatedRequest.id ? updatedRequest : r)
      );
      setUpdatingRequest(null);
    }}
  />
)}
    </Layout>
  );
}