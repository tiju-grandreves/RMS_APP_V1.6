import {
  Package,
  Clock,
  Wrench,
  CheckCircle,
} from "lucide-react";

import { CommonCard } from "../components/common/CommonCard";
import Layout from "../components/layout/Layout";
import { useEffect, useState } from "react";


const STATUS_COLORS = {
  New: { color: "#d4183d", bg: "#fff5f5" },
  Assigned: { color: "#d97706", bg: "#fffbf0" },
  "In Progress": { color: "#02949D", bg: "#e8f5f7" },
  Ready: { color: "#16a34a", bg: "#f0fdf4" },
};



// const recentRequests = [
//   {
//     id: "REQ-001",
//     customerName: "Aisha Rahman",
//     deviceBrand: "Apple",
//     deviceModel: "iPhone 13",
//     createdAt: "2026-06-20",
//     status: "New",
//   },
//   {
//     id: "REQ-002",
//     customerName: "Daniel Lee",
//     deviceBrand: "Samsung",
//     deviceModel: "Galaxy S22",
//     createdAt: "2026-06-19",
//     status: "In Progress",
//   },
//   {
//     id: "REQ-003",
//     customerName: "Maya Kumar",
//     deviceBrand: "Huawei",
//     deviceModel: "P40 Pro",
//     createdAt: "2026-06-18",
//     status: "Assigned",
//   },
//   {
//     id: "REQ-004",
//     customerName: "Omar Hassan",
//     deviceBrand: "Xiaomi",
//     deviceModel: "Redmi Note 12",
//     createdAt: "2026-06-17",
//     status: "Ready",
//   },
// ];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard({ requests = [] }) {


const recentRequests = [...requests]
.sort(
  (a, b) =>
    new Date(b.createdDate) - new Date(a.createdDate)
)
.slice(0, 5);
console.log("req",requests)

  const totalRevenue = requests.reduce((sum, request) => {
    return sum + request.totalCost;
  }, 0);

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: <Package className="w-5 h-5" />,
      color: "#395062",
      bg: "#edf1f4",
    },
    {
      label: "New",
      value: requests.filter((r) => r.status === "New").length,
      icon: <Clock className="w-5 h-5" />,
      color: "#d4183d",
      bg: "#fff5f5",
    },
    {
      label: "In Progress",
      value: requests.filter(
        (r) => r.status === "In Progress" || r.status === "Assigned"
      ).length,
      icon: <Wrench className="w-5 h-5" />,
      color: "#02949D",
      bg: "#e8f5f7",
    },
    {
      label: "Ready ",
      value: requests.filter((r) => r.status === "Ready").length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    
  ];

  return (
    <Layout pageTitle="Admin Dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="flex flex-col gap-6 mt-8 px-4">
        {/* Top stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
          {stats.map((s) => (
            <CommonCard key={s.label} contentClassName="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
  
              <div>
                <p className="text-xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-sm" style={{ color: "#5a7585" }}>
                  {s.label}
                </p>
              </div>
            </CommonCard>
          ))}
        </div>
  
        {/* Recent requests full width */}
        <CommonCard
          title="Recent Requests"
          className="w-full min-h-[300px]"
          contentClassName="pt-6"
        >
          {recentRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between py-4 border-b last:border-0"
              style={{ borderColor: "rgba(57,80,98,0.06)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "#1a2e38" }}>
                  {req.customerName}
                </p>
  
                <p className="text-xs mt-1" style={{ color: "#5a7585" }}>
                  {req.deviceBrand} {req.deviceModel} · {formatDate(req.createdDate)}
                </p>
              </div>
  
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{
                  background: STATUS_COLORS[req.status].bg,
                  color: STATUS_COLORS[req.status].color,
                }}
              >
                {req.status}
              </span>
            </div>
          ))}
        </CommonCard>
      </div>
    </Layout>
  );
}