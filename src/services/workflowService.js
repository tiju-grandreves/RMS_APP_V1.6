import httpService from "./httpService";

const WF_API             = "/workflow-dtls";
const STAGES_API         = "/workflow-stages";
const ROLES_API          = "/user-role";
const FORM_FIELDS_API    = "/wf-form-fields";
const NOTIFICATIONS_API  = "/wf-notifications";
const CONDITIONS_API     = "/wf-conditions";

// ─── Workflows ───────────────────────────────────────────────────────────────

export const getWorkflows = async ({ page = 1, take = 100 } = {}) => {
  const res = await httpService.get(WF_API, { page, take });
  return res?.data ?? { rows: [], count: 0 };
};

/** Returns a single workflow with its stages, formFields, and notifications. */
export const getWorkflow = async (id) => {
  const res = await httpService.get(`${WF_API}/${id}`);
  return res?.data ?? null;
};

export const createWorkflow = async (data) => {
  return httpService.post(WF_API, data);
};

export const updateWorkflow = async (id, data) => {
  return httpService.put(`${WF_API}/${id}`, data);
};

export const deleteWorkflow = async (id) => {
  return httpService.remove(`${WF_API}/${id}`);
};

// ─── Stages ──────────────────────────────────────────────────────────────────

export const createStage = async (data) => {
  return httpService.post(STAGES_API, data);
};

export const updateStage = async (id, data) => {
  return httpService.put(`${STAGES_API}/${id}`, data);
};

/**
 * Soft-delete a stage.
 * Throws if the stage has associated job data (API returns 400).
 */
export const deleteStage = async (id) => {
  return httpService.remove(`${STAGES_API}/${id}`);
};

// ─── Form Fields ─────────────────────────────────────────────────────────────

export const getFormFields = async (wfId) => {
  const res = await httpService.get(FORM_FIELDS_API, { wfId, page: 1, take: 200 });
  const rows = res?.data?.rows ?? [];
  return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const createFormField = async (data) => httpService.post(FORM_FIELDS_API, data);

export const updateFormField = async (id, data) => httpService.put(`${FORM_FIELDS_API}/${id}`, data);

export const deleteFormField = async (id) => httpService.remove(`${FORM_FIELDS_API}/${id}`);

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = async (wfId) => {
  const res = await httpService.get(NOTIFICATIONS_API, { wfId, page: 1, take: 200 });
  return res?.data?.rows ?? [];
};

export const createNotification = async (data) => httpService.post(NOTIFICATIONS_API, data);

export const updateNotification = async (id, data) => httpService.put(`${NOTIFICATIONS_API}/${id}`, data);

// ─── Conditions (routing rules) ───────────────────────────────────────────────
// Drives the backend workflow condition engine (rms_wf_conditions).
// A rule: at `stageId`, IF field `fieldLabel` `operator` `value` THEN `action`
// (assign_role → targetRoleId | skip_to_stage → targetStageId | notify_admin).

export const getConditions = async (wfId) => {
  const res = await httpService.get(CONDITIONS_API, { wfId, page: 1, take: 200 });
  const rows = res?.data?.rows ?? [];
  return rows.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
};

export const createCondition = async (data) => httpService.post(CONDITIONS_API, data);

export const updateCondition = async (id, data) => httpService.put(`${CONDITIONS_API}/${id}`, data);

export const deleteCondition = async (id) => httpService.remove(`${CONDITIONS_API}/${id}`);

// ─── Roles ───────────────────────────────────────────────────────────────────

export const getRoles = async (shopId) => {
  const params = { page: 1, take: 200 };
  if (shopId) params.shopId = shopId;
  const res = await httpService.get(ROLES_API, params);
  return res?.data?.rows ?? [];
};
