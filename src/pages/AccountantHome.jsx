import { useState } from "react";
import { TrendingUp, CheckCircle, Clock, Eye, Trash2 } from "lucide-react";
import { CommonCard } from "../components/common/CommonCard";
import Layout from "../components/layout/Layout";
import TableFilter from "../components/common/TableFilter";
import DataTable from "../components/common/DataTable";

const STATUS_COLORS = {
  New: { color: "#d4183d", bg: "#fff5f5" },
  Assigned: { color: "#d97706", bg: "#fffbf0" },
  "In Progress": { color: "#02949D", bg: "#e8f5f7" },
  Ready: { color: "#16a34a", bg: "#f0fdf4" },
};

const HARDCODED_REQUESTS = [
  {
    id: "JOB-1001", customerName: "Aisha Rahman", customerPhone: "0123456789",
    deviceBrand: "Apple", deviceModel: "iPhone 13",
    parts: [{ name: "Screen", quantity: 1, unitPrice: 250 }],
    status: "Ready", totalCost: 320.00,
    createdAt: "2026-06-20T10:00:00",
  },
  {
    id: "JOB-1002", customerName: "Daniel Lee", customerPhone: "0198765432",
    deviceBrand: "Samsung", deviceModel: "Galaxy S22",
    parts: [{ name: "Battery", quantity: 1, unitPrice: 80 }],
    status: "In Progress", totalCost: 120.00,
    createdAt: "2026-06-19T09:30:00",
  },
  {
    id: "JOB-1003", customerName: "Maya Kumar", customerPhone: "0171234567",
    deviceBrand: "Huawei", deviceModel: "P40 Pro",
    parts: [],
    status: "Assigned", totalCost: 0,
    createdAt: "2026-06-18T14:00:00",
  },
  {
    id: "JOB-1004", customerName: "Omar Hassan", customerPhone: "0112345678",
    deviceBrand: "Xiaomi", deviceModel: "Redmi Note 12",
    parts: [{ name: "Charging Port", quantity: 1, unitPrice: 60 }, { name: "Back Cover", quantity: 1, unitPrice: 40 }],
    status: "Ready", totalCost: 150.00,
    createdAt: "2026-06-17T11:15:00",
  },
  {
    id: "JOB-1005", customerName: "Sarah Lim", customerPhone: "0134567890",
    deviceBrand: "OnePlus", deviceModel: "OnePlus 11",
    parts: [{ name: "Camera Module", quantity: 1, unitPrice: 180 }],
    status: "New", totalCost: 0,
    createdAt: "2026-06-16T08:45:00",
  },
  {
    id: "JOB-1006", customerName: "Rajan Pillai", customerPhone: "0156789012",
    deviceBrand: "Apple", deviceModel: "iPhone 14 Pro",
    parts: [{ name: "Battery", quantity: 1, unitPrice: 150 }, { name: "Screen", quantity: 1, unitPrice: 300 }],
    status: "Ready", totalCost: 520.00,
    createdAt: "2026-06-15T13:00:00",
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatCard({ label, value, sub, icon, color, bg }) {
  return (
    <CommonCard contentClassName="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg, color }}>
          {icon}
        </div>
        <div>
          <p className="font-bold"
            style={{ color, fontSize: typeof value === "string" && value.length > 10 ? 14 : 20 }}>
            {value}
          </p>
          <p className="text-xs font-medium" style={{ color: "#1a2e38" }}>{label}</p>
          {sub && <p className="text-[10px] mt-0.5" style={{ color: "#5a7585" }}>{sub}</p>}
        </div>
      </div>
    </CommonCard>
  );
}

export default function AccountantHome({ requests = HARDCODED_REQUESTS }) {
  const [filterBilled, setFilterBilled] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [deletedIds, setDeletedIds] = useState([]);
  const [viewingRequest, setViewingRequest] = useState(null);

  const billedRequests = requests.filter((r) => r.totalCost > 0);
  const pendingRequests = requests.filter((r) => r.totalCost === 0);
  const totalRevenue = billedRequests.reduce((sum, r) => sum + r.totalCost, 0);

  const baseRequests = requests.filter((r) => !deletedIds.includes(r.id));
  const billingFiltered =
    filterBilled === "all" ? baseRequests
    : filterBilled === "billed" ? baseRequests.filter((r) => r.totalCost > 0)
    : baseRequests.filter((r) => r.totalCost === 0);

  const displayRequests = billingFiltered.filter((r) => {
    const q = search.trim().toLowerCase();
    const requestDate = new Date(r.createdAt).getTime();
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toTime = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;
    const matchQ =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerPhone.toLowerCase().includes(q) ||
      `${r.deviceBrand} ${r.deviceModel}`.toLowerCase().includes(q) ||
      r.parts.some((p) => p.name.toLowerCase().includes(q));
    const matchStatus = statusFilter === "All statuses" || r.status === statusFilter;
    const matchFrom = fromTime === null || requestDate >= fromTime;
    const matchTo = toTime === null || requestDate <= toTime;
    return matchQ && matchStatus && matchFrom && matchTo;
  });

  return (
    <Layout pageTitle="Financial Overview" showSearch={false}>
      <div className="flex flex-col gap-4 px-4 pt-5">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Total Revenue" value={`RM ${totalRevenue.toFixed(2)}`}
            sub="All billed jobs" icon={<TrendingUp className="w-5 h-5" />}
            color="#d97706" bg="#fffbf0" />
          <StatCard label="Billed Jobs" value={billedRequests.length}
            sub="With cost assigned" icon={<CheckCircle className="w-5 h-5" />}
            color="#16a34a" bg="#f0fdf4" />
          <StatCard label="Pending Billing" value={pendingRequests.length}
            sub="No cost yet" icon={<Clock className="w-5 h-5" />}
            color="#d4183d" bg="#fff5f5" />
        </div>

        {/* Search/Filter Row — aligned to the right */}
        <div className="flex flex-wrap items-end justify-end gap-3">
          <TableFilter
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by ID, customer, device..."
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={["All statuses", "New", "Assigned", "In Progress", "Ready"]}
          />

          <div>
            <label className="block text-[11px] mb-1" style={{ color: "#5a7585" }}>From</label>
            <input
              type="date"
              className="border border-[#d6dfde] rounded-[4px] h-[42px] px-3 text-[13px] outline-none"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] mb-1" style={{ color: "#5a7585" }}>To</label>
            <input
              type="date"
              className="border border-[#d6dfde] rounded-[4px] h-[42px] px-3 text-[13px] outline-none"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          data={displayRequests}
          columns={[
            {
              key: "index",
              title: "No.",
              render: (_, idx) => (
                <span className="text-[#5a7585]">{String(idx + 1).padStart(2, "0")}</span>
              ),
            },
            {
              key: "id",
              title: "Job ID",
              render: (req) => (
                <span className="text-[#d97706] font-mono font-semibold text-xs">{req.id}</span>
              ),
            },
            {
              key: "customer",
              title: "Customer",
              render: (req) => (
                <div>
                  <p className="text-[#1b1d21] font-medium whitespace-nowrap">{req.customerName}</p>
                  <p className="text-[#5a7585] text-xs">{req.customerPhone}</p>
                </div>
              ),
            },
            {
              key: "device",
              title: "Device",
              render: (req) => (
                <span className="text-[#1b1d21] whitespace-nowrap">
                  {req.deviceBrand} {req.deviceModel}
                </span>
              ),
            },
            {
              key: "parts",
              title: "Parts",
              render: (req) => (
                <span
                  className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-semibold"
                  style={{
                    background: req.parts.length > 0 ? "#fffbf0" : "#f5f5f5",
                    color: req.parts.length > 0 ? "#d97706" : "#5a7585",
                  }}
                >
                  {req.parts.length > 0 ? `${req.parts.length} part${req.parts.length > 1 ? "s" : ""}` : "None"}
                </span>
              ),
            },
            {
              key: "status",
              title: "Status",
              render: (req) => (
                <span
                  className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-semibold whitespace-nowrap"
                  style={{ background: STATUS_COLORS[req.status].bg, color: STATUS_COLORS[req.status].color }}
                >
                  {req.status}
                </span>
              ),
            },
            {
              key: "totalCost",
              title: "Total Cost",
              render: (req) =>
                req.totalCost > 0 ? (
                  <span className="text-[#d97706] font-semibold">RM{req.totalCost.toFixed(2)}</span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#fff5f5] text-[#d4183d]">
                    Not billed
                  </span>
                ),
            },
            {
              key: "date",
              title: "Date",
              render: (req) => (
                <span className="text-[#555] text-xs whitespace-nowrap">{formatDate(req.createdAt)}</span>
              ),
            },
            // {
            //   key: "actions",
            //   title: "",
            //   render: (req) => (
            //     <div className="flex items-center gap-1.5 justify-end">
            //       <button
            //         onClick={() => setViewingRequest(req)}
            //         className="w-8 h-8 rounded-[4px] flex items-center justify-center hover:opacity-80 bg-[#fffbf0] text-[#d97706]"
            //       >
            //         <Eye className="w-4 h-4" />
            //       </button>
            //       <button
            //         onClick={() => setDeletedIds((prev) => [...prev, req.id])}
            //         className="w-8 h-8 rounded-[4px] flex items-center justify-center hover:opacity-80 bg-[#fff5f5] text-[#d4183d]"
            //       >
            //         <Trash2 className="w-4 h-4" />
            //       </button>
            //     </div>
            //   ),
            // },
          ]}
        />

        {/* Total */}
        <div className="px-1 flex justify-end">
          <p className="text-sm font-bold" style={{ color: "#d97706" }}>
            Total: RM{displayRequests.reduce((s, r) => s + r.totalCost, 0).toFixed(2)}
          </p>
        </div>

      </div>
    </Layout>
  );
}