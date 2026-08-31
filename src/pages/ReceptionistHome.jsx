import { useState, useEffect } from "react";
import { Package, Clock, Wrench, CheckCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { CommonCard } from "../components/common/CommonCard";
import Breadcrumb from "../components/common/Breadcrumbs";
import Layout from "../components/layout/Layout";

const STATUS_COLORS = {
  New:           { color: "#2563eb", bg: "#eff6ff" },
  "In Progress": { color: "#02949D", bg: "#e8f5f7" },
  Ready:         { color: "#16a34a", bg: "#f0fdf4" },
  Closed:        { color: "#395062", bg: "#edf1f4" },
  Cancelled:     { color: "#d4183d", bg: "#fff5f5" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── mock data — replace with real API data ─────────────────────────────────
const mockRequests = [
  {
    id: "REQ-1001",
    customerName: "Ahmad bin Yusof",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S23 Ultra",
    createdAt: "2026-06-20",
    status: "In Progress",
  },
  {
    id: "REQ-1002",
    customerName: "Priya Nair",
    deviceBrand: "Apple",
    deviceModel: "iPhone 15 Pro",
    createdAt: "2026-06-19",
    status: "Ready",
  },
  {
    id: "REQ-1003",
    customerName: "Wong Kai Wen",
    deviceBrand: "Xiaomi",
    deviceModel: "Redmi Note 13 Pro",
    createdAt: "2026-06-18",
    status: "New",
  },
  {
    id: "REQ-1004",
    customerName: "Siti Aminah",
    deviceBrand: "Huawei",
    deviceModel: "Nova 10",
    createdAt: "2026-06-17",
    status: "Assigned",
  },
];

export default function ReceptionistHome({ requests = mockRequests }) {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: <Package className="w-5 h-5" />,
      color: "#395062",
      bg: "#edf1f4",
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
      label: "Ready for Pickup",
      value: requests.filter((r) => r.status === "Ready").length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "New Requests",
      value: requests.filter((r) => r.status === "New").length,
      icon: <Clock className="w-5 h-5" />,
      color: "#d97706",
      bg: "#fffbf0",
    },
  ];

  return (
    <Layout pageTitle="Dashboard">
      <div className="flex flex-col gap-6 mt-8 px-4">


        {/* Subtitle */}
        <p className="text-sm -mt-4" style={{ color: "#778c9d" }}>
          Overview of all repair activity
        </p>

        {/* Stat cards — same as AdminDashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Recent Requests card */}
        <CommonCard
          title="Recent Requests"
          className="w-full min-h-[300px]"
          contentClassName="pt-4"
        >
          {/* View all link */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => navigate("/RequestListing")}
              className="text-xs font-semibold"
              style={{ color: "#02949D", background: "none", border: "none", cursor: "pointer" }}
            >
              View all →
            </button>
          </div>

          {requests.length === 0 ? (
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
            requests.map((req) => (
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
                    {req.deviceBrand} {req.deviceModel} · {formatDate(req.createdAt)}
                  </p>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: STATUS_COLORS[req.status]?.bg,
                    color: STATUS_COLORS[req.status]?.color,
                  }}
                >
                  {req.status}
                </span>
              </div>
            ))
          )}
        </CommonCard>
      </div>
    </Layout>
  );
}