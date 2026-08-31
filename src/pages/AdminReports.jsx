import { useState } from "react";
import * as XLSX from "xlsx";
import { Search as SearchIcon, FileSpreadsheet } from "lucide-react";
import { CommonCard } from "../components/common/CommonCard";
import Layout from "../components/layout/Layout";
import DataTable from "../components/common/DataTable";
import FormInput from "../components/common/FormInput";
import Button from "../components/common/Button";
import { getJobsByStatusAndPriority } from "../services/reportService";
import { showEventToast } from "../components/common/toastHelper";

export default function AdminReports() {
  const [byStatus, setByStatus] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!startDate) newErrors.startDate = "From date is required.";
    if (!endDate) newErrors.endDate = "To date is required.";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "To date cannot be before From date.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validate()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await getJobsByStatusAndPriority({ startDate, endDate });
      setByStatus(Array.isArray(data?.byStatus) ? data.byStatus : []);
      setByPriority(Array.isArray(data?.byPriority) ? data.byPriority : []);
    } catch (err) {
      console.error("Failed to load reports:", err);
      showEventToast(
        "error",
        "Failed to Load Reports",
        "We couldn't load the report data. Please refresh and try again."
      );
      setByStatus([]);
      setByPriority([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColumns = [
    { key: "statusName", label: "Status" },
    { key: "statusCode", label: "Code" },
    { key: "count", label: "Count" },
  ];

  const priorityColumns = [
    { key: "priority", label: "Priority" },
    { key: "count", label: "Count" },
  ];

  const handleExport = () => {
    if (byStatus.length === 0 && byPriority.length === 0) {
      showEventToast("info", "Nothing to Export", "There are no rows to export.");
      return;
    }

    const statusRows = byStatus.map((s) => ({
      Status: s.statusName,
      Code: s.statusCode,
      Count: s.count,
    }));
    const priorityRows = byPriority.map((p) => ({
      Priority: p.priority,
      Count: p.count,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(statusRows), "By Status");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(priorityRows), "By Priority");

    const fileName = `jobs-report_${startDate || "all"}_to_${endDate || "all"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Layout showSearch={false} breadcrumbs={[{ label: "Reports" }]}>
      <div className="flex flex-col gap-6 px-4 mt-8">
        <p className="text-sm" style={{ color: "#5a7585" }}>
          System-wide job counts by status and priority
        </p>

        <CommonCard>
          <div className="flex flex-wrap items-start gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#395062" }}>
                From
              </label>
              <FormInput
                type="date"
                value={startDate}
                className="h-10 box-border"
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) setErrors((p) => ({ ...p, startDate: undefined }));
                }}
              />
              {errors.startDate && (
                <span className="text-xs" style={{ color: "#e0576b" }}>
                  {errors.startDate}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#395062" }}>
                To
              </label>
              <FormInput
                type="date"
                value={endDate}
                className="h-10 box-border"
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate) setErrors((p) => ({ ...p, endDate: undefined }));
                }}
              />
              {errors.endDate && (
                <span className="text-xs" style={{ color: "#e0576b" }}>
                  {errors.endDate}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium invisible select-none">
                Search
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="h-10 box-border flex items-center px-4"
                >
                  <SearchIcon size={16} className="mr-1.5" />
                  Search
                </Button>

                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleExport}
                    title="Export to Excel"
                    className="h-10 w-10 box-border flex items-center justify-center rounded-lg transition-colors hover:opacity-80"
                    style={{ color: "#02949D", background: "#e8f5f7" }}
                  >
                    <FileSpreadsheet size={18} />
                  </button>
                )}
              </div>
              <span className="text-xs invisible select-none">placeholder</span>
            </div>
          </div>

          {!hasSearched ? (
            <div className="flex items-center justify-center py-20 text-sm" style={{ color: "#5a7585" }}>
              Select a date range and click Search to view the report.
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: "#02949D", borderTopColor: "transparent" }}
              />
              <span className="ml-3 text-sm" style={{ color: "#5a7585" }}>
                Loading reports...
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#395062" }}>
                  By Status
                </h3>
                <DataTable
                  columns={statusColumns}
                  data={byStatus}
                  emptyMessage="No status data for the selected date range."
                  rowKey="statusId"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#395062" }}>
                  By Priority
                </h3>
                <DataTable
                  columns={priorityColumns}
                  data={byPriority}
                  emptyMessage="No priority data for the selected date range."
                  rowKey="priority"
                />
              </div>
            </div>
          )}
        </CommonCard>
      </div>
    </Layout>
  );
}