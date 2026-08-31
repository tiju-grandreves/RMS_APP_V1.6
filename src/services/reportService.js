import httpService from "./httpService";

const REPORTS_API = "/reports";

/**
 * Fetch aggregated job counts by status and priority.
 * GET /reports/jobs-by-status-priority?startDate=...&endDate=...
 *
 * Response shape:
 * {
 *   byStatus: [{ statusId, statusName, statusCode, count }, ...],
 *   byPriority: [{ priority, count }, ...]
 * }
 */
export const getJobsByStatusAndPriority = async ({ startDate, endDate } = {}) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await httpService.get(`${REPORTS_API}/jobs-by-status-priority`, { params });
  return response ?? null;
};