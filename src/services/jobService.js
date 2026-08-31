import httpService from "./httpService";

const JOB_API            = "/job-dtls";
const FIELD_VALUES_API   = "/job-field-values";
const PAYMENT_API        = "/payment-dtls";

/**
 * Fetch paginated job list.
 * Returns { rows, count } from the API pagination response.
 */
export const getJobs = async ({
  page = 1,
  take = 100,
  search,
  status,
} = {}) => {
  const response = await httpService.get(JOB_API, {
    page,
    take,
    search,
    status,
  });
  
  return response?.data ?? { rows: [], count: 0 };
};

/**
 * Create a new job (repair request).
 * Pass flat fields: customerName, customerPhone, customerEmail,
 * deviceBrand, deviceModel, description (issue), priority, diagnosisNotes.
 */
export const createJob = async (payload) => {
  const body = buildPayload(payload);
  const response = await httpService.post(JOB_API, body);
  return response;
};

/**
 * Update an existing job by id.
 */
export const updateJob = async (id, payload) => {
  const body = buildPayload(payload);
  const response = await httpService.put(`${JOB_API}/${id}`, body);
  return response;
};

/**
 * Soft-delete a job by id.
 */
export const deleteJob = async (id) => {
  const response = await httpService.remove(`${JOB_API}/${id}`);
  return response;
};

/**
 * Advance a job to the next workflow stage. The backend condition engine
 * decides the destination stage and the assigned role/officer, and records a
 * stage-history row. Optionally pass a note stored on the history row.
 * Returns the ResponseModel payload: { data, message, success }.
 */
export const advanceStage = async (id, notes) => {
  const response = await httpService.patch(
    `${JOB_API}/${id}/advance-stage`,
    notes ? { notes } : {}
  );
  return response;
};

export const createPayment = async (payload) => {
  const body = buildPaymentPayload(payload);
  return httpService.post(PAYMENT_API, body);
};

export const updatePayment = async (id, payload) => {
  const response = await httpService.put(`${PAYMENT_API}/${id}`, buildPaymentPayload(payload));
  return response;
};

/**
 * Fetch previously saved dynamic field values for a job.
 * Returns [{ id, jobIdId, fieldIdId, value }]
 */
export const getJobFieldValues = async (jobId) => {
  const response = await httpService.get(FIELD_VALUES_API, { jobIdId: jobId, take: 200 });
  return response?.data?.rows ?? [];
};

/**
 * Save dynamic field values for a job.
 * Updates a field's existing row if one already exists, otherwise creates a new one
 * (avoids creating duplicate rows when editing a job a second time).
 * fieldValues: [{ fieldIdId: number, value: string }]
 */
export const saveJobFieldValues = async (jobId, fieldValues = []) => {
  const toSave = fieldValues.filter(fv => fv.value !== '' && fv.value != null);
  if (!toSave.length) return;

  const existing = await getJobFieldValues(jobId);
  const existingByFieldId = new Map(existing.map(row => [row.fieldIdId, row.id]));

  return Promise.all(
    toSave.map(fv => {
      const existingId = existingByFieldId.get(fv.fieldIdId);
      const body = { jobIdId: jobId, fieldIdId: fv.fieldIdId, value: String(fv.value) };
      return existingId
        ? httpService.put(`${FIELD_VALUES_API}/${existingId}`, body)
        : httpService.post(FIELD_VALUES_API, body);
    })
  );
};

// ---------------------------------------------------------------------------
// Map frontend form fields → API payload
// ---------------------------------------------------------------------------
function buildPayload(form) {
  return {
    customerName: form.customerName,
    customerPhone: form.customerPhone,
    customerEmail: form.customerEmail || undefined,
    // Pass customerIdId so the service updates the existing customer instead of creating a new one
    customerIdId: form.customerIdId || undefined,
    deviceBrand: form.deviceBrand,
    deviceModel: form.deviceModel,
    description: form.issueDescription,   // frontend "issueDescription" → API "description"
    priority: form.priority,
    diagnosisNotes: form.serviceNotes || undefined,
    status: form.status || undefined,
  };
}

// ---------------------------------------------------------------------------
// Map frontend payment form → API payload (must match PaymentDtlsModel exactly:
// id, amount, amountDue, collectedDate, jobIdId, collectedById, method, isDelete)
// ---------------------------------------------------------------------------
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("userData") || "null");
  } catch {
    return null;
  }
}

// Map frontend payment method labels → backend numeric codes.
// Confirm these against your DB/enum before shipping.
const PAYMENT_METHOD_CODES = {
  "Cash": 1,
  "GPay/UPI": 2,
  "Card": 3,
};

function buildPaymentPayload(form = {}) {
  const amount = Number(form.amountReceived ?? form.amount ?? form.paidAmount ?? 0);
  const methodLabel = form.paymentMethod ?? form.method ?? form.paymentType ?? "Cash";
  const jobId = form.jobIdId ?? form.jobId ?? form.jobIdIdId ?? null;
  const currentUser = getCurrentUser();

  return {
    jobIdId: jobId,
    amount: Number.isFinite(amount) ? amount : 0,
    method: PAYMENT_METHOD_CODES[methodLabel] ?? 1,
    collectedById: currentUser?.usr_id ?? currentUser?.id,
    collectedDate: new Date().toISOString(),
    isDelete: false,
  };
}