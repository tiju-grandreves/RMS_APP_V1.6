import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import TextArea from '../components/common/TeaxtArea';
import Button from '../components/common/Button';
import DeleteUser from '../components/common/DeleteUser';
import { showEventToast } from '../components/common/toastHelper';
import {
  getWorkflows, getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow,
  createStage, updateStage, deleteStage, getRoles,
  getFormFields, createFormField, updateFormField, deleteFormField,
  getNotifications, createNotification, updateNotification,
  getConditions, createCondition, updateCondition, deleteCondition,
} from '../services/workflowService';
import {
  Plus, ArrowLeft, Save, X, Check, Edit2, Trash2,
  Bell, MessageSquare, Info, ChevronDown, Calendar,
  Layers, LayoutGrid, Clock, GripVertical, ArrowRight,
  CheckCircle, XCircle, Asterisk, Loader, Filter,
} from 'lucide-react';

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <label style={{ position: 'relative', width: 30, height: 17, display: 'inline-block', cursor: 'pointer', flexShrink: 0 }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
    <span style={{
      position: 'absolute', inset: 0,
      background: checked ? '#0E9594' : '#d1d5db',
      borderRadius: 17, transition: '.2s',
    }}>
      <span style={{
        position: 'absolute', width: 13, height: 13,
        left: checked ? 15 : 2, bottom: 2,
        background: '#fff', borderRadius: '50%', transition: '.2s',
      }} />
    </span>
  </label>
);

const s = {
  content: { flex: 1, padding: '20px 24px', overflowY: 'auto', background: 'rgba(226,249,250,0.4)' },
  pageTitle: { fontSize: 18, fontWeight: 700, color: '#1a2e38', margin: 0 },
  pageSub: { fontSize: 12, color: '#778c9d', marginTop: 2 },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0E9594', cursor: 'pointer', fontWeight: 600, marginBottom: 14, background: 'none', border: 'none', padding: 0 },
  card: { background: '#fff', borderRadius: 16, border: '1px solid rgba(57,80,98,0.1)', boxShadow: '0 1px 4px rgba(2,80,98,0.06)' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(57,80,98,0.07)' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#1a2e38' },
  cardSub: { fontSize: 12, color: '#5a7585', marginTop: 2 },
  cardBody: { padding: '16px 20px' },
  sfInput: { border: 'none', background: 'transparent', padding: 0, fontSize: 13, fontWeight: 700, color: '#1a2e38', outline: 'none', width: '60%' },
};

const PRIORITY_OPTIONS = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Urgent', label: 'Urgent' },
  { value: 'VIP', label: 'VIP' },
];

const SEND_BACK_NONE = '';

// ─── SCREEN 1: Workflow List ───────────────────────────────────────────────────
const WfList = ({ wfList, loading, onDelete, goScreen, setEditingWf }) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openNew = () => { setEditingWf(null); goScreen('wf-builder'); };
  const openEdit = (e, wf) => { e.stopPropagation(); setEditingWf(wf); goScreen('wf-builder'); };
  const openFormFields = (e, wf) => { e.stopPropagation(); setEditingWf(wf); goScreen('form-builder'); };
  const openConditions = (e, wf) => { e.stopPropagation(); setEditingWf(wf); goScreen('conditions-config'); };
  const openNotif = (e, wf) => { e.stopPropagation(); setEditingWf(wf); goScreen('notif-config'); };

  if (loading) {
    return (
      <div style={s.content}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: '#778c9d' }}>
          <Loader size={20} className="animate-spin" /> Loading workflows…
        </div>
      </div>
    );
  }

  return (
    <div style={s.content}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <p style={s.pageSub}>Define and manage service workflows for your shop</p>
        <Button variant="primary" onClick={openNew}>
          <Plus size={15} /> New workflow
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {wfList.map(wf => (
          <div
            key={wf.id}
            onClick={e => openEdit(e, wf)}
            style={{
              position: 'relative', background: '#fff',
              border: `1px solid rgba(57,80,98,0.1)`,
              borderRadius: 16, padding: 18, cursor: 'pointer',
              boxShadow: 'none', transition: 'border-color .15s,box-shadow .15s',
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: wf.isActive ? '#e8f5f7' : '#f4f6f8',
                color: wf.isActive ? '#0E9594' : '#778c9d',
              }}>
                {wf.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {wf.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <button
              onClick={e => { e.stopPropagation(); setDeleteTarget({ id: wf.id, name: wf.name }); }}
              style={{
                position: 'absolute', top: 12, right: 12, width: 28, height: 28,
                borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Trash2 size={14} color="#dc2626" />
            </button>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2e38', marginBottom: 4 }}>{wf.name}</div>
            <div style={{ fontSize: 12, color: '#778c9d', marginBottom: 14 }}>{wf.description}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: '#f4f6f8', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color="#0E9594" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2e38' }}>{wf.stageCount ?? 0}</div>
                  <div style={{ fontSize: 11, color: '#778c9d' }}>Stages</div>
                </div>
              </div>
              <div style={{ background: '#f4f6f8', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <LayoutGrid size={16} color="#0E9594" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2e38' }}>{wf.fieldCount ?? 0}</div>
                  <div style={{ fontSize: 11, color: '#778c9d' }}>Fields</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <button
                onClick={e => openEdit(e, wf)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(57,80,98,0.18)', background: '#fff', fontSize: 12, fontWeight: 500, color: '#395062', cursor: 'pointer' }}
              >
                <Edit2 size={14} color="#0E9594" /> Edit
              </button>
              <button
                onClick={e => openFormFields(e, wf)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(57,80,98,0.18)', background: '#fff', fontSize: 12, fontWeight: 500, color: '#395062', cursor: 'pointer' }}
              >
                <LayoutGrid size={14} color="#0E9594" /> Form fields
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={e => openConditions(e, wf)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(57,80,98,0.18)', background: '#fff', fontSize: 12, fontWeight: 500, color: '#395062', cursor: 'pointer' }}
              >
                <Layers size={14} color="#0E9594" /> Routing rules
              </button>
              <button
                onClick={e => openNotif(e, wf)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(57,80,98,0.18)', background: '#fff', fontSize: 12, fontWeight: 500, color: '#395062', cursor: 'pointer' }}
              >
                <Bell size={14} color="#0E9594" /> Notifications
              </button>
            </div>
          </div>
        ))}

        <div
          onClick={openNew}
          style={{ background: '#f8fafb', border: '1.5px dashed rgba(57,80,98,0.2)', borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 200 }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(14,149,148,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={22} color="#0E9594" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2e38' }}>Create new workflow</div>
            <div style={{ fontSize: 12, color: '#778c9d', marginTop: 4 }}>Set up a custom workflow tailored to your service needs.</div>
          </div>
        </div>
      </div>

      <DeleteUser
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        user={deleteTarget ? { id: deleteTarget.id, name: deleteTarget.name } : null}
        entityName="Workflow"
      />
    </div>
  );
};

// ─── SCREEN 2: Workflow Builder ────────────────────────────────────────────────
const WfBuilder = ({ goScreen, editingWf, onSaved }) => {
  const isNew = !editingWf;

  const [wfName, setWfName]     = useState(isNew ? '' : editingWf.name ?? '');
  const [wfDesc, setWfDesc]     = useState(isNew ? '' : editingWf.description ?? '');
  const [priority, setPriority] = useState(isNew ? 'Normal' : (editingWf.priority ?? 'Normal'));
  const [active, setActive]     = useState(isNew ? true : (editingWf.isActive ?? true));
  const [stages, setStages]     = useState([]);       // { id, dbId?, roleId, roleName, sla, btnLabel, returnToStageId, notifyAssignee, notifyCustomer }
  const [originalDbIds, setOriginalDbIds] = useState(new Set()); // db ids that existed on load (to detect deletions)
  const [roles, setRoles]       = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id (local), dbId?, name } — for stage trash modal
  const [stageSaving, setStageSaving] = useState({}); // stageId → bool

  // ── Load roles (scoped to current shop) ─────────────────────────────────
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') ?? 'null');
    const shopId = userData?.user?.shopId ?? userData?.shopId ?? null;
    getRoles(shopId)
      .then(r => setRoles(r))
      .catch(() => {});
  }, []);

  // ── Load workflow detail (edit mode) ─────────────────────────────────────
  useEffect(() => {
    if (isNew) return;
    setLoadingDetail(true);
    getWorkflow(editingWf.id)
      .then(wf => {
        if (!wf) return;
        const loaded = (wf.stages || []).map(stg => ({
          id: stg.id,          // use DB id as local id for existing stages
          dbId: stg.id,
          name: stg.name,
          roleId: stg.roleId,
          roleName: stg.roleName ?? '',
          sla: stg.slaHours ?? 2,
          btnLabel: stg.actionLabel ?? 'Next',
          returnToStageId: stg.returnToStageId ?? null,
          notifyAssignee: stg.notifyAssignee ?? true,
          notifyCustomer: stg.notifyCustomerSms ?? false,
        }));
        setStages(loaded);
        setOriginalDbIds(new Set(loaded.map(s => s.dbId)));
      })
        .catch(() => showEventToast('error', 'Failed to Load Workflow', 'We could not load this workflow\'s details. Please try again.'))
      .finally(() => setLoadingDetail(false));
  }, []);  // eslint-disable-line

  const roleOptions = [
    { value: '', label: 'Select role' },
    ...roles.map(r => ({ value: String(r.id), label: r.name })),
  ];

  const updateStageField = (localId, field, val) =>
    setStages(prev => prev.map(st => st.id === localId ? { ...st, [field]: val } : st));

  // ── Delete a stage (from builder UI) ─────────────────────────────────────
  const handleStageDeleteRequest = (stage) => {
    setDeleteTarget(stage);
  };

  const handleStageDeleteConfirm = async () => {
    const stage = deleteTarget;
    setDeleteTarget(null);

    if (!stage.dbId) {
      // New stage (never saved) — just remove from local state
      setStages(prev => prev.filter(s => s.id !== stage.id));
      return;
    }

    setStageSaving(p => ({ ...p, [stage.id]: true }));
    try {
      await deleteStage(stage.dbId);
      setStages(prev => prev.filter(s => s.id !== stage.id));
      setOriginalDbIds(prev => { const n = new Set(prev); n.delete(stage.dbId); return n; });
       showEventToast('delete', 'Stage Removed', `"${stage.name}" has been removed from this workflow.`);
    } catch (err) {
      const msg = err?.message || err?.error || 'Cannot delete this stage because it already has associated job data.';
      showEventToast('warning', 'Cannot delete stage', msg);
    } finally {
      setStageSaving(p => { const n = { ...p }; delete n[stage.id]; return n; });
    }
  };

  // ── Save workflow + stages ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!wfName.trim()) {
        showEventToast('error', 'Incomplete Form', 'Please enter a workflow name before saving.');
      return;
    }

    setSaving(true);
    try {
      // 1. Save / update workflow basic info
      let wfId = editingWf?.id;
      const wfPayload = {
        name: wfName.trim(),
        description: wfDesc.trim() || undefined,
        isActive: active,
      };
      if (isNew) {
        const res = await createWorkflow(wfPayload);
        wfId = res?.data?.id;
        if (!wfId) throw new Error('Failed to create workflow');
      } else {
        await updateWorkflow(wfId, wfPayload);
      }

      // 2. Save stages in order; build tempId → dbId map for returnToStageId resolution
      const savedIdMap = {};   // localId → dbId

      // Pre-populate with existing stages (their id already == dbId)
      stages.forEach(s => { if (s.dbId) savedIdMap[s.id] = s.dbId; });

      for (let idx = 0; idx < stages.length; idx++) {
        const st = stages[idx];
        // Resolve returnToStageId from local id → dbId
        const returnToStageId = st.returnToStageId
          ? (savedIdMap[st.returnToStageId] ?? null)
          : null;

        const stagePayload = {
          wfId,
          roleId: st.roleId || undefined,
          order: idx + 1,
          name: st.name,
          actionLabel: st.btnLabel,
          slaHours: Number(st.sla) || 0,
          returnToStageId: returnToStageId || undefined,
          notifyAssignee: st.notifyAssignee,
          notifyCustomerSms: st.notifyCustomer,
        };

        if (st.dbId) {
          // Existing stage — update
          await updateStage(st.dbId, stagePayload);
        } else {
          // New stage — create
          const res = await createStage(stagePayload);
          const newDbId = res?.data?.id;
          if (newDbId) savedIdMap[st.id] = newDbId;
        }
      }

      // 3. Delete stages removed from UI that existed in DB
      const currentDbIds = new Set(stages.filter(s => s.dbId).map(s => s.dbId));
      const toDelete = [...originalDbIds].filter(dbId => !currentDbIds.has(dbId));
      for (const dbId of toDelete) {
        try {
          await deleteStage(dbId);
        } catch (err) {
          const msg = err?.message || err?.error || 'Cannot delete stage — it has associated job data.';
          showEventToast('warning', 'Stage not deleted', msg);
        }
      }

      showEventToast('success', isNew ? 'Workflow created' : 'Workflow saved', `"${wfName}" has been ${isNew ? 'created' : 'updated'} successfully.`);
      onSaved();
      goScreen('wf-list');
    } catch (err) {
      const msg = err?.message || err?.error || 'Something went wrong. Please try again.';
      showEventToast('error', 'Save failed', msg);
    } finally {
      setSaving(false);
    }
  };

  const totalSla = stages.reduce((sum, st) => sum + Number(st.sla || 0), 0);

  if (loadingDetail) {
    return (
      <div style={s.content}>
        <button style={s.backBtn} onClick={() => goScreen('wf-list')}>
          <ArrowLeft size={13} /> Back to workflows
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#778c9d', marginTop: 40, justifyContent: 'center' }}>
          <Loader size={20} className="animate-spin" /> Loading workflow…
        </div>
      </div>
    );
  }

  return (
    <div style={s.content}>
      <button style={s.backBtn} onClick={() => goScreen('wf-list')}>
        <ArrowLeft size={13} /> Back to workflows
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={s.pageTitle}>{isNew ? 'New workflow' : editingWf.name}</h1>
          <p style={s.pageSub}>{isNew ? 'Set up a new workflow for your service' : 'Configure stages, roles and SLA for this workflow'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => goScreen('wf-list')}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
            {isNew ? 'Create workflow' : 'Save workflow'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          {/* Basic info */}
          <div style={{ ...s.card, marginBottom: 14 }}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>Basic info</div>
              <Toggle checked={active} onChange={e => setActive(e.target.checked)} />
            </div>
            <div style={{ ...s.cardBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormInput
                label="Workflow name" required
                value={wfName}
                onChange={e => setWfName(e.target.value)}
                placeholder="e.g. Mobile service repair"
              />
              <FormSelect
                label="Default priority"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                options={PRIORITY_OPTIONS}
              />
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput
                  label="Description"
                  value={wfDesc}
                  onChange={e => setWfDesc(e.target.value)}
                  placeholder="Briefly describe this workflow"
                />
              </div>
            </div>
          </div>

          {/* Stages */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <div style={s.cardTitle}>Stages</div>
                <div style={s.cardSub}>Define the order of work and who handles each stage</div>
              </div>
              <Button size="small" variant="secondary" onClick={() => goScreen('form-builder')}>
                <LayoutGrid size={13} /> Edit form fields
              </Button>
            </div>
            <div style={{ ...s.cardBody, paddingTop: 18 }}>

              {stages.length === 0 && (
                <div style={{ background: '#f8fafc', border: '1px dashed rgba(57,80,98,0.18)', borderRadius: 12, padding: '24px 20px', textAlign: 'center', color: '#778c9d', fontSize: 13, marginBottom: 14 }}>
                  No stages yet. Click <strong>Add stage</strong> to get started.
                </div>
              )}

              {stages.map((st, idx) => {
                const sendBackOptions = [
                  { value: SEND_BACK_NONE, label: '— none —' },
                  ...stages.slice(0, idx).map(prev => ({
                    value: String(prev.id),
                    label: `Stage ${stages.indexOf(prev) + 1} – ${prev.name}`,
                  })),
                ];

                return (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                    {/* timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0, marginTop: 4 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0E9594', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>{idx + 1}</div>
                      {idx < stages.length - 1 && <div style={{ width: 2, background: 'rgba(14,149,148,0.2)', flex: 1, minHeight: 20, margin: '2px 0' }} />}
                    </div>

                    {/* stage card */}
                    <div style={{ flex: 1, background: 'rgba(226,249,250,0.4)', border: '1px solid rgba(57,80,98,0.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 12, marginLeft: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <input
                          style={s.sfInput}
                          value={st.name}
                          onChange={e => updateStageField(st.id, 'name', e.target.value)}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {st.roleName && (
                            <span style={{ background: '#e8f5f7', color: '#085041', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>{st.roleName}</span>
                          )}
                          <button
                            onClick={() => handleStageDeleteRequest(st)}
                            disabled={!!stageSaving[st.id]}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, cursor: stageSaving[st.id] ? 'not-allowed' : 'pointer', opacity: stageSaving[st.id] ? 0.5 : 1 }}
                          >
                            {stageSaving[st.id] ? <Loader size={14} className="animate-spin" /> : <Trash2 size={15} color="#dc2626" />}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <FormSelect
                          label="Assigned role"
                          value={String(st.roleId ?? '')}
                          onChange={e => {
                            const selectedId = Number(e.target.value);
                            const selectedRole = roles.find(r => r.id === selectedId);
                            updateStageField(st.id, 'roleId', selectedId);
                            updateStageField(st.id, 'roleName', selectedRole?.name ?? '');
                          }}
                          options={roleOptions}
                        />
                        <FormInput
                          label="SLA (hours)"
                          type="number"
                          value={st.sla}
                          onChange={e => updateStageField(st.id, 'sla', e.target.value)}
                          placeholder="Hours"
                        />
                        <FormInput
                          label="Button label"
                          value={st.btnLabel}
                          onChange={e => updateStageField(st.id, 'btnLabel', e.target.value)}
                          placeholder="e.g. Next"
                        />
                        <FormSelect
                          label="Send back to"
                          value={st.returnToStageId ? String(st.returnToStageId) : SEND_BACK_NONE}
                          onChange={e => updateStageField(st.id, 'returnToStageId', e.target.value ? Number(e.target.value) : null)}
                          options={sendBackOptions}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5a7585', cursor: 'pointer' }}>
                          <Toggle checked={st.notifyAssignee} onChange={e => updateStageField(st.id, 'notifyAssignee', e.target.checked)} />
                          Notify assignee
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5a7585', cursor: 'pointer' }}>
                          <Toggle checked={st.notifyCustomer} onChange={e => updateStageField(st.id, 'notifyCustomer', e.target.checked)} />
                          Notify customer (SMS)
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add stage */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f0fdf9', border: '1.5px dashed #0E9594', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E9594' }}>
                    <Plus size={11} />
                  </div>
                </div>
                <button
                  onClick={() => setStages(prev => [...prev, {
                    id: Date.now(),
                    dbId: undefined,
                    name: 'New stage',
                    roleId: null,
                    roleName: '',
                    sla: 2,
                    btnLabel: 'Next',
                    returnToStageId: null,
                    notifyAssignee: true,
                    notifyCustomer: false,
                  }])}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0E9594', fontWeight: 600, cursor: 'pointer', background: '#f0fdf9', border: '1.5px dashed rgba(14,149,148,0.3)', borderRadius: 10, padding: '7px 14px' }}
                >
                  <Plus size={14} /> Add stage
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={s.card}>
            <div style={s.cardHeader}><div style={s.cardTitle}>Flow preview</div></div>
            <div style={{ ...s.cardBody, paddingTop: 14 }}>
              {stages.length === 0 ? (
                <div style={{ fontSize: 12, color: '#778c9d', textAlign: 'center', padding: '16px 0' }}>
                  Add stages to see the flow preview
                </div>
              ) : (
                <>
                  {stages.map((st, idx) => (
                    <React.Fragment key={st.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0E9594', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a2e38' }}>{idx + 1}. {st.name}</span>
                        <span style={{ fontSize: 10, color: '#0E9594', background: '#e8f5f7', padding: '2px 6px', borderRadius: 6 }}>{st.sla}h SLA</span>
                      </div>
                      {idx < stages.length - 1 && <div style={{ width: 1, height: 14, background: 'rgba(14,149,148,0.3)', marginLeft: 6 }} />}
                    </React.Fragment>
                  ))}
                  <div style={{ marginTop: 10, padding: '8px 10px', background: '#fff8ed', borderRadius: 8, border: '1px solid rgba(186,117,23,0.2)' }}>
                    <div style={{ fontSize: 11, color: '#854F0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color="#854F0B" /> Total max SLA
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#854F0B', marginTop: 2 }}>{totalSla} hours</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}><div style={s.cardTitle}>Quick links</div></div>
            <div style={{ ...s.cardBody, paddingTop: 12 }}>
              {[
                { icon: <LayoutGrid size={16} color="#0E9594" />, label: 'Form fields', screen: 'form-builder' },
                { icon: <Layers size={16} color="#0E9594" />, label: 'Routing rules', screen: 'conditions-config' },
                { icon: <Bell size={16} color="#0E9594" />, label: 'Notifications', screen: 'notif-config' },
                { icon: <Filter size={16} color="#0E9594" />, label: 'Conditions', screen: 'conditions-config' },
              ].map(link => (
                <div key={link.screen} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(57,80,98,0.06)' }}>
                  <div style={{ fontSize: 13, color: '#1a2e38', display: 'flex', alignItems: 'center', gap: 7 }}>
                    {link.icon} {link.label}
                  </div>
                  <Button size="small" variant="secondary" onClick={() => goScreen(link.screen)}>
                    Open <ArrowRight size={12} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stage delete confirmation */}
      <DeleteUser
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleStageDeleteConfirm}
        user={deleteTarget ? { id: deleteTarget.id, name: deleteTarget.name } : null}
        entityName="Stage"
      />
    </div>
  );
};

// ─── SCREEN 3: Form Builder ────────────────────────────────────────────────────
const FIELD_TYPE_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'section_header', label: 'Section header' },
];

const EMPTY_FIELD = { label: '', type: '', options: '', isRequired: false };

const FormBuilder = ({ goScreen, editingWf }) => {
  const [fields, setFields]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newField, setNewField]     = useState(EMPTY_FIELD);
  const [editingField, setEditingField] = useState(null); // field being edited inline
  const [deleteTarget, setDeleteTarget] = useState(null); // field pending delete confirmation
  const [saving, setSaving]         = useState(false);

  // ── Load fields ──────────────────────────────────────────────────────────
  const loadFields = useCallback(async () => {
    if (!editingWf?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const rows = await getFormFields(editingWf.id);
      setFields(rows);
    } catch {
      showEventToast('error', 'Failed to Load Fields', 'We could not load the form fields for this workflow.');
    } finally {
      setLoading(false);
    }
  }, [editingWf?.id]);

  useEffect(() => { loadFields(); }, [loadFields]);

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newField.label.trim() || !newField.type) return;
    setSaving(true);
    try {
      await createFormField({
        wfId: editingWf.id,
        label: newField.label.trim(),
        type: newField.type,
        options: newField.type === 'dropdown' ? newField.options : undefined,
        isRequired: newField.type === 'section_header' ? false : newField.isRequired,
        order: fields.length + 1,
      });
      await loadFields();
      setNewField(EMPTY_FIELD);
      setShowNewForm(false);
      showEventToast('success', 'Field added', `"${newField.label}" added.`);
    } catch {
     showEventToast('error', 'Failed to Add Field', 'Something went wrong while adding this field. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit save ────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editingField) return;
    setSaving(true);
    try {
      await updateFormField(editingField.id, {
        wfId: editingWf.id,
        label: editingField.label,
        type: editingField.type,
        options: editingField.type === 'dropdown' ? editingField.options : undefined,
        isRequired: editingField.type === 'section_header' ? false : editingField.isRequired,
        order: editingField.order,
      });
      await loadFields();
      setEditingField(null);
      showEventToast('success', 'Field updated', 'Changes saved.');
    } catch {
      showEventToast('error', 'Failed to Update Field', 'Something went wrong while updating this field. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async (field) => {
    try {
      await deleteFormField(field.id);
      setFields(prev => prev.filter(f => f.id !== field.id));
      setDeleteTarget(null);
         showEventToast('delete', 'Field Removed', `"${field.label}" has been removed from this workflow.`);
    } catch {
     showEventToast('error', 'Failed to Remove Field', 'Something went wrong while removing this field. Please try again.');
    }
  };

  return (
    <div style={s.content}>
      <button style={s.backBtn} onClick={() => goScreen('wf-builder')}>
        <ArrowLeft size={13} /> Back to workflow
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10}}>
        <div>
          <h1 style={s.pageTitle}>Form fields</h1>
          <p style={s.pageSub}>{editingWf?.name ?? ''} — extra fields shown on new request</p>
        </div>
      </div>

      {!editingWf?.id ? (
        <div style={{ ...s.card, padding: 24, textAlign: 'center', color: '#778c9d', fontSize: 13 }}>
          Open a workflow first to manage its form fields.
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div>
              <div style={s.cardTitle}>Dynamic fields</div>
              <div style={s.cardSub}>Added below the fixed fields on the New Request form</div>
            </div>
          </div>
          <div style={{ ...s.cardBody, paddingTop: 14 }}>
            <div style={{ background: '#f0fdf9', border: '1px solid rgba(14,149,148,0.15)', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={14} />
              Fixed fields (customer name, phone, brand, model, issue) are always shown. Add extra fields below.
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#778c9d', fontSize: 13, padding: '16px 0' }}>
                <Loader size={16} className="animate-spin" /> Loading fields…
              </div>
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map((f, idx) => (
                editingField?.id === f.id ? (
                  // ── Inline edit form ──
                  <div key={f.id} style={{ background: '#f0fdf9', border: '1px solid rgba(14,149,148,0.2)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2e38', marginBottom: 12 }}>Edit field</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <FormInput label="Field label" required placeholder="e.g. Serial number"
                        value={editingField.label}
                        onChange={e => setEditingField(p => ({ ...p, label: e.target.value }))} />
                      <FormSelect label="Field type" required value={editingField.type}
                        onChange={e => setEditingField(p => ({ ...p, type: e.target.value }))}
                        options={FIELD_TYPE_OPTIONS} />
                    </div>
                    {editingField.type === 'dropdown' && (
                      <div style={{ marginBottom: 12 }}>
                        <FormInput label="Dropdown options" placeholder="Option A, Option B"
                          value={editingField.options ?? ''}
                          onChange={e => setEditingField(p => ({ ...p, options: e.target.value }))} />
                        <div style={{ fontSize: 11, color: '#778c9d', marginTop: 4 }}>Comma-separated</div>
                      </div>
                    )}
                    {editingField.type === 'section_header' ? (
                      <div style={{ fontSize: 12, color: '#778c9d', marginBottom: 14 }}>
                        Section headers are display-only — they group the fields below and collect no value.
                      </div>
                    ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <Toggle checked={editingField.isRequired}
                        onChange={e => setEditingField(p => ({ ...p, isRequired: e.target.checked }))} />
                      <span style={{ fontSize: 13, color: '#1a2e38' }}>Required field</span>
                    </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="small" variant="primary" onClick={handleEditSave} disabled={saving}>
                        {saving ? <Loader size={13} className="animate-spin" /> : <Check size={13} />} Save
                      </Button>
                      <Button size="small" variant="secondary" onClick={() => setEditingField(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  // ── Field row ──
                  <div key={f.id} style={{ background: '#f8fafc', border: '1px solid rgba(57,80,98,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <GripVertical size={18} color="#b0bec5" style={{ cursor: 'grab' }} />
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: '#e8f5f7', color: '#0E9594', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2e38' }}>{f.label}</div>
                      <div style={{ marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ background: '#edf1f4', color: '#395062', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6 }}>{f.type}</span>
                        {f.options && <span style={{ fontSize: 11, color: '#778c9d' }}>{f.options}</span>}
                      </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, padding: '2px 7px', borderRadius: 6, fontWeight: 600, background: f.isRequired ? '#e8f5f7' : '#f4f6f8', color: f.isRequired ? '#085041' : '#778c9d' }}>
                      {f.isRequired ? <><Asterisk size={10} /> Required</> : 'Optional'}
                    </span>
                    <Button size="small" variant="secondary" onClick={() => { setShowNewForm(false); setEditingField({ ...f }); }}>
                      <Edit2 size={13} />
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => setDeleteTarget(f)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                )
              ))}

              {/* Add new field form */}
              {showNewForm && (
                <div style={{ background: '#f0fdf9', border: '1px solid rgba(14,149,148,0.2)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2e38', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    New field
                    <Button size="small" variant="secondary" onClick={() => setShowNewForm(false)}><X size={13} /></Button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <FormInput label="Field label" required placeholder="e.g. Serial number"
                      value={newField.label}
                      onChange={e => setNewField(p => ({ ...p, label: e.target.value }))} />
                    <FormSelect label="Field type" required value={newField.type}
                      onChange={e => setNewField(p => ({ ...p, type: e.target.value }))}
                      options={FIELD_TYPE_OPTIONS} />
                  </div>
                  {newField.type === 'dropdown' && (
                    <div style={{ marginBottom: 12 }}>
                      <FormInput label="Dropdown options" required placeholder="Samsung, Apple, OnePlus"
                        value={newField.options}
                        onChange={e => setNewField(p => ({ ...p, options: e.target.value }))} />
                      <div style={{ fontSize: 11, color: '#778c9d', marginTop: 4 }}>Comma-separated</div>
                    </div>
                  )}
                  {newField.type === 'section_header' ? (
                    <div style={{ fontSize: 12, color: '#778c9d', marginBottom: 14 }}>
                      Section headers are display-only — they group the fields below and collect no value.
                    </div>
                  ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Toggle checked={newField.isRequired}
                      onChange={e => setNewField(p => ({ ...p, isRequired: e.target.checked }))} />
                    <span style={{ fontSize: 13, color: '#1a2e38' }}>Required field</span>
                  </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" variant="primary" onClick={handleAdd} disabled={saving}>
                      {saving ? <Loader size={13} className="animate-spin" /> : <Check size={13} />} Add field
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => setShowNewForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {!showNewForm && !editingField && (
                <div
                  onClick={() => { setEditingField(null); setShowNewForm(true); }}
                  style={{ border: '1.5px dashed rgba(57,80,98,0.18)', borderRadius: 10, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#778c9d', fontWeight: 500 }}
                >
                  <Plus size={16} /> Add new field
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Form preview */}
        <div style={s.card}>
          <div style={{ ...s.cardHeader, alignItems: 'flex-start' }}>
            <div style={s.cardTitle}>Form preview</div>
            <div style={{ fontSize: 11, color: '#0E9594' }}>As receptionist sees it</div>
          </div>
          <div style={{ ...s.cardBody, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Customer name *', 'Phone *', 'Issue *'].map(label => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#778c9d', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{label}</div>
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#b0bec5' }}>
                  {label === 'Customer name *' ? 'Full name' : label === 'Phone *' ? '+60 12-...' : 'Describe the issue...'}
                </div>
              </div>
            ))}
            {fields.length > 0 && (
              <div style={{ borderTop: '1px dashed rgba(57,80,98,0.15)', paddingTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#0E9594', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Dynamic fields</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fields.map(f => (
                    f.type === 'section_header' ? (
                      <div key={f.id} style={{ marginTop: 4, paddingBottom: 4, borderBottom: '1px solid rgba(14,149,148,0.25)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F6E56' }}>{f.label}</div>
                      </div>
                    ) : (
                    <div key={f.id}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#778c9d', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                        {f.label}{f.isRequired ? ' *' : ''}
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#b0bec5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {f.type === 'dropdown' ? <><span>Select…</span><ChevronDown size={12} /></>
                          : f.type === 'date' ? <><span>Pick a date</span><Calendar size={12} /></>
                          : f.type === 'checkbox' ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, border: '1px solid #d1d5db', borderRadius: 3 }} /><span>Yes</span></div>
                          : <span>{f.label}…</span>}
                      </div>
                    </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      <DeleteUser
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        user={deleteTarget ? { id: deleteTarget.id, name: deleteTarget.label } : null}
        entityName="Field"
      />
    </div>
  );
};

// ─── SCREEN 4: Notification Config ────────────────────────────────────────────
const NOTIF_EVENTS = [
  { code: 'job_created', event: 'Job created', desc: 'Triggered when receptionist submits a new job' },
  { code: 'stage_assigned', event: 'Stage assigned', desc: 'Triggered when job moves to a new stage' },
  { code: 'job_ready', event: 'Job ready for pickup', desc: 'Triggered when job reaches the Ready status' },
  { code: 'payment_done', event: 'Payment done', desc: 'Triggered after payment is recorded' },
  { code: 'sla_breach', event: 'SLA breach', desc: 'Triggered when a stage exceeds its SLA hours — notifies admin' },
];

const NotifConfig = ({ goScreen, editingWf }) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadNotifs = useCallback(async () => {
    if (!editingWf?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const rows = await getNotifications(editingWf.id);
      setNotifs(NOTIF_EVENTS.map(ev => {
        const found = rows.find(r => r.event === ev.code);
        return {
          id: found?.id ?? null,
          code: ev.code,
          event: ev.event,
          desc: ev.desc,
          push: found?.pushEnabled ?? true,
          sms: found?.smsEnabled ?? false,
          template: found?.smsTemplate ?? '',
        };
      }));
    } catch {
       showEventToast('error', 'Failed to Load Notifications', 'We could not load the notification settings for this workflow.');
    } finally {
      setLoading(false);
    }
  }, [editingWf?.id]);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  const update = (code, field, val) =>
    setNotifs(prev => prev.map(n => n.code === code ? { ...n, [field]: val } : n));

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = [];
      for (const n of notifs) {
        const payload = {
          wfId: editingWf.id,
          event: n.code,
          pushEnabled: n.push,
          smsEnabled: n.sms,
          smsTemplate: n.template || undefined,
        };
        if (n.id) {
          await updateNotification(n.id, payload);
          saved.push(n);
        } else {
          const res = await createNotification(payload);
          saved.push({ ...n, id: res?.data?.id ?? null });
        }
      }
      setNotifs(saved);
      showEventToast('success', 'Saved', 'Notification settings have been updated.');
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to save notification settings.';
       showEventToast('error', 'Failed to Save Notifications', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.content}>
      <button style={s.backBtn} onClick={() => goScreen('wf-builder')}>
        <ArrowLeft size={13} /> Back to workflow
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={s.pageTitle}>Notification settings</h1>
          <p style={s.pageSub}>Configure when and how customers and staff are notified</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving || !editingWf?.id}>
          <Save size={15} /> {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {!editingWf?.id ? (
        <div style={{ ...s.card, padding: 24, textAlign: 'center', color: '#778c9d', fontSize: 13 }}>
          Open a workflow first to manage its notifications.
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#778c9d', fontSize: 13, padding: '16px 0' }}>
          <Loader size={16} className="animate-spin" /> Loading notifications…
        </div>
      ) : (
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>Events</div>
          <div style={s.cardSub}>Toggle push and SMS per event. SMS requires a template.</div>
        </div>
        <div style={{ ...s.cardBody, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifs.map(n => (
            <div key={n.code} style={{ border: '1px solid rgba(57,80,98,0.1)', borderRadius: 12, background: '#f8fafc', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: n.sms ? 10 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a2e38' }}>{n.event}</div>
                  <div style={{ fontSize: 12, color: '#778c9d', marginTop: 2 }}>{n.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <Toggle checked={n.push} onChange={e => update(n.code, 'push', e.target.checked)} />
                    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Bell size={13} /> Push</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <Toggle checked={n.sms} onChange={e => update(n.code, 'sms', e.target.checked)} />
                    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={13} /> SMS</span>
                  </label>
                </div>
              </div>
              {n.sms && (
                <TextArea label="SMS template" value={n.template} onChange={e => update(n.code, 'template', e.target.value)} rows={3} placeholder="Enter SMS template..." />
              )}
              {n.sms && (
                <div style={{ fontSize: 11, color: '#778c9d' }}>Variables: {'{customer_name}'} {'{token_num}'} {'{shop_name}'}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

// ─── SCREEN 5: Conditions / Routing Rules ─────────────────────────────────────
const OPERATOR_OPTIONS = [
  { value: 'equals',       label: 'equals' },
  { value: 'not_equals',   label: 'not equals' },
  { value: 'contains',     label: 'contains' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than',    label: 'less than' },
];

const ACTION_OPTIONS = [
  { value: '',              label: 'Select action' },
  { value: 'assign_role',   label: 'Assign role' },
  { value: 'skip_to_stage', label: 'Skip to stage' },
  { value: 'notify_admin',  label: 'Notify admin' },
];

const ACTION_LABELS = { assign_role: 'Assign role', skip_to_stage: 'Skip to stage', notify_admin: 'Notify admin' };
const OPERATOR_LABELS = OPERATOR_OPTIONS.reduce((m, o) => ({ ...m, [o.value]: o.label }), {});

const EMPTY_COND = { stageId: '', fieldLabel: '', operator: 'equals', value: '', action: '', targetRoleId: '', targetStageId: '', priority: 1 };

const ConditionsBuilder = ({ goScreen, editingWf }) => {
  const [conditions, setConditions] = useState([]);
  const [fields, setFields]         = useState([]);
  const [stages, setStages]         = useState([]);
  const [roles, setRoles]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(EMPTY_COND);
  const [editingId, setEditingId]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    if (!editingWf?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') ?? 'null');
      const shopId = userData?.user?.shopId ?? userData?.shopId ?? null;
      const [conds, flds, wf, rls] = await Promise.all([
        getConditions(editingWf.id),
        getFormFields(editingWf.id),
        getWorkflow(editingWf.id),
        getRoles(shopId),
      ]);
      setConditions(conds);
      setFields(flds.filter(f => f.type !== 'section_header'));
      setStages((wf?.stages ?? []).map(st => ({ id: st.id, name: st.name, roleName: st.roleName ?? '' })));
      setRoles(rls);
    } catch {
      showEventToast('error', 'Failed to Load Rules', 'We could not load the routing rules for this workflow.');
    } finally {
      setLoading(false);
    }
  }, [editingWf?.id]);

  useEffect(() => { load(); }, [load]);

  const stageName = (id) => stages.find(s => s.id === Number(id))?.name ?? `Stage ${id}`;
  const roleName  = (id) => roles.find(r => r.id === Number(id))?.name ?? `Role ${id}`;
  const selectedField = fields.find(f => f.label === form.fieldLabel);

  const fieldOptions = [
    { value: '', label: 'Select field' },
    ...fields.map(f => ({ value: f.label, label: f.label })),
  ];
  const stageOptions = [
    { value: '', label: 'Select stage' },
    ...stages.map(s => ({ value: String(s.id), label: s.name })),
  ];
  const roleOptions = [
    { value: '', label: 'Select role' },
    ...roles.map(r => ({ value: String(r.id), label: r.name })),
  ];
  const valueOptions = [
    { value: '', label: 'Select value' },
    ...(selectedField?.options ?? '').split(',').map(o => ({ value: o.trim(), label: o.trim() })).filter(o => o.value),
  ];

  const openNew = () => { setEditingId(null); setForm({ ...EMPTY_COND, priority: conditions.length + 1 }); setShowForm(true); };
  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      stageId: String(c.stageId ?? ''),
      fieldLabel: c.fieldLabel ?? '',
      operator: c.operator ?? 'equals',
      value: c.value ?? '',
      action: c.action ?? '',
      targetRoleId: c.targetRoleId ? String(c.targetRoleId) : '',
      targetStageId: c.targetStageId ? String(c.targetStageId) : '',
      priority: c.priority ?? 1,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_COND); };

  const validate = () => {
    if (!form.stageId)      return 'Please choose the stage this rule runs at.';
    if (!form.fieldLabel)   return 'Please choose the field to check.';
    if (form.value === '' && form.action !== 'notify_admin' && form.operator !== 'not_equals') return 'Please enter the value to compare against.';
    if (!form.action)       return 'Please choose an action.';
    if (form.action === 'assign_role' && !form.targetRoleId)   return 'Please choose the role to assign.';
    if (form.action === 'skip_to_stage' && !form.targetStageId) return 'Please choose the stage to skip to.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { showEventToast('error', 'Incomplete Rule', err); return; }
    setSaving(true);
    try {
      const payload = {
        wfId: editingWf.id,
        stageId: Number(form.stageId),
        fieldLabel: form.fieldLabel,
        operator: form.operator,
        value: form.value,
        action: form.action,
        targetRoleId: form.action === 'assign_role' ? Number(form.targetRoleId) : undefined,
        targetStageId: form.action === 'skip_to_stage' ? Number(form.targetStageId) : undefined,
        priority: Number(form.priority) || 1,
      };
      if (editingId) {
        await updateCondition(editingId, payload);
        showEventToast('success', 'Rule updated', 'The routing rule has been saved.');
      } else {
        await createCondition(payload);
        showEventToast('success', 'Rule added', 'The routing rule has been created.');
      }
      closeForm();
      await load();
    } catch (e) {
      showEventToast('error', 'Failed to Save Rule', e?.message || e?.error || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteCondition(target.id);
      setConditions(prev => prev.filter(c => c.id !== target.id));
      showEventToast('delete', 'Rule Removed', 'The routing rule has been removed.');
    } catch (e) {
      showEventToast('error', 'Failed to Remove Rule', e?.message || 'Something went wrong. Please try again.');
    }
  };

  const actionSummary = (c) => {
    if (c.action === 'assign_role')   return `${ACTION_LABELS.assign_role}: ${roleName(c.targetRoleId)}`;
    if (c.action === 'skip_to_stage') return `${ACTION_LABELS.skip_to_stage}: ${stageName(c.targetStageId)}`;
    return ACTION_LABELS[c.action] ?? c.action;
  };

  return (
    <div style={s.content}>
      <button style={s.backBtn} onClick={() => goScreen('wf-builder')}>
        <ArrowLeft size={13} /> Back to workflow
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={s.pageTitle}>Routing rules</h1>
          <p style={s.pageSub}>{editingWf?.name ?? ''} — auto-assign or reroute jobs based on submitted field values</p>
        </div>
        {editingWf?.id && !showForm && (
          <Button variant="primary" onClick={openNew}><Plus size={15} /> New rule</Button>
        )}
      </div>

      {!editingWf?.id ? (
        <div style={{ ...s.card, padding: 24, textAlign: 'center', color: '#778c9d', fontSize: 13 }}>
          Open a workflow first to manage its routing rules.
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#778c9d', fontSize: 13, padding: '16px 0' }}>
          <Loader size={16} className="animate-spin" /> Loading rules…
        </div>
      ) : (
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <div style={s.cardTitle}>Conditions</div>
            <div style={s.cardSub}>Evaluated in priority order when a job leaves the selected stage. First matching “assign role” wins; “notify admin” rules all fire.</div>
          </div>
        </div>
        <div style={{ ...s.cardBody, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#f0fdf9', border: '1px solid rgba(14,149,148,0.15)', borderRadius: 10, padding: '10px 12px', marginBottom: 6, fontSize: 12, color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={14} />
            The field must exist as a form field (add dropdowns like “Device brand” under Form fields). If no rule matches, the next stage’s default role is used.
          </div>

          {conditions.length === 0 && !showForm && (
            <div style={{ background: '#f8fafc', border: '1px dashed rgba(57,80,98,0.18)', borderRadius: 12, padding: '24px 20px', textAlign: 'center', color: '#778c9d', fontSize: 13 }}>
              No routing rules yet. Click <strong>New rule</strong> to add one.
            </div>
          )}

          {conditions.map(c => (
            <div key={c.id} style={{ background: '#f8fafc', border: '1px solid rgba(57,80,98,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#e8f5f7', color: '#0E9594', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Priority">{c.priority}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#1a2e38' }}>
                  <span style={{ color: '#778c9d' }}>At</span> <strong>{stageName(c.stageId)}</strong>{' '}
                  <span style={{ color: '#778c9d' }}>if</span> <strong>{c.fieldLabel}</strong> {OPERATOR_LABELS[c.operator] ?? c.operator} <strong>{c.value}</strong>
                </div>
                <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e8f5f7', color: '#085041', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                    <ArrowRight size={11} /> {actionSummary(c)}
                  </span>
                </div>
              </div>
              <Button size="small" variant="secondary" onClick={() => openEdit(c)}><Edit2 size={13} /></Button>
              <Button size="small" variant="secondary" onClick={() => setDeleteTarget(c)}><Trash2 size={13} /></Button>
            </div>
          ))}

          {showForm && (
            <div style={{ background: '#f0fdf9', border: '1px solid rgba(14,149,148,0.2)', borderRadius: 12, padding: 16, marginTop: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2e38', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {editingId ? 'Edit rule' : 'New rule'}
                <Button size="small" variant="secondary" onClick={closeForm}><X size={13} /></Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <FormSelect label="At stage" required value={form.stageId}
                  onChange={e => setForm(p => ({ ...p, stageId: e.target.value }))} options={stageOptions} />
                <FormInput label="Priority" type="number" value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <FormSelect label="If field" required value={form.fieldLabel}
                  onChange={e => setForm(p => ({ ...p, fieldLabel: e.target.value, value: '' }))} options={fieldOptions} />
                <FormSelect label="Operator" value={form.operator}
                  onChange={e => setForm(p => ({ ...p, operator: e.target.value }))} options={OPERATOR_OPTIONS} />
                {selectedField?.type === 'dropdown' ? (
                  <FormSelect label="Value" value={form.value}
                    onChange={e => setForm(p => ({ ...p, value: e.target.value }))} options={valueOptions} />
                ) : (
                  <FormInput label="Value" placeholder="e.g. Apple" value={form.value}
                    onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <FormSelect label="Then" required value={form.action}
                  onChange={e => setForm(p => ({ ...p, action: e.target.value }))} options={ACTION_OPTIONS} />
                {form.action === 'assign_role' && (
                  <FormSelect label="Assign role" required value={form.targetRoleId}
                    onChange={e => setForm(p => ({ ...p, targetRoleId: e.target.value }))} options={roleOptions} />
                )}
                {form.action === 'skip_to_stage' && (
                  <FormSelect label="Skip to stage" required value={form.targetStageId}
                    onChange={e => setForm(p => ({ ...p, targetStageId: e.target.value }))} options={stageOptions} />
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="small" variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader size={13} className="animate-spin" /> : <Check size={13} />} {editingId ? 'Save rule' : 'Add rule'}
                </Button>
                <Button size="small" variant="secondary" onClick={closeForm}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      <DeleteUser
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        user={deleteTarget ? { id: deleteTarget.id, name: `rule #${deleteTarget.priority}` } : null}
        entityName="Rule"
      />
    </div>
  );
};

// ─── Main WorkflowConfig ───────────────────────────────────────────────────────
const getScreenMeta = (goScreen) => ({
  'wf-list':      { title: 'Workflows',             breadcrumb: [{ label: 'Workflow configuration' }] },
  'wf-builder':   { title: 'Workflow Builder',      breadcrumb: [{ label: 'Workflows', onClick: () => goScreen('wf-list') }, { label: 'Edit workflow' }] },
  'form-builder': { title: 'Form fields',            breadcrumb: [{ label: 'Workflows', onClick: () => goScreen('wf-list') }, { label: 'Edit workflow', onClick: () => goScreen('wf-builder') }, { label: 'Form fields' }] },
  'notif-config': { title: 'Notification settings', breadcrumb: [{ label: 'Workflows', onClick: () => goScreen('wf-list') }, { label: 'Edit workflow', onClick: () => goScreen('wf-builder') }, { label: 'Notifications' }] },
  'conditions-config': { title: 'Routing rules', breadcrumb: [{ label: 'Workflows', onClick: () => goScreen('wf-list') }, { label: 'Edit workflow', onClick: () => goScreen('wf-builder') }, { label: 'Routing rules' }] },
});

const WorkflowConfig = () => {
  const [screen, setScreen]       = useState('wf-list');
  const [editingWf, setEditingWf] = useState(null);
  const [wfList, setWfList]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkflows();
      setWfList(data.rows ?? []);
    } catch {
       showEventToast('error', 'Failed to Load Workflows', 'We could not load the list of workflows. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);

  const handleDeleteWorkflow = async (id) => {
    try {
      await deleteWorkflow(id);
      setWfList(prev => prev.filter(wf => wf.id !== id));
    showEventToast('delete', 'Workflow Deleted', 'The workflow has been permanently removed.');
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to delete workflow.';
        showEventToast('error', 'Failed to Delete Workflow', msg);
      throw err; // re-throw so modal stays open on error
    }
  };

  const meta = getScreenMeta(setScreen)[screen];

  return (
    <Layout showSearch={false} breadcrumbs={meta.breadcrumb}>
      <div className="">
        {screen === 'wf-list' && (
          <WfList
            wfList={wfList}
            loading={loading}
            onDelete={handleDeleteWorkflow}
            goScreen={setScreen}
            setEditingWf={setEditingWf}
          />
        )}
        {screen === 'wf-builder' && (
          <WfBuilder
            goScreen={setScreen}
            editingWf={editingWf}
            onSaved={loadWorkflows}
          />
        )}
        {screen === 'form-builder' && <FormBuilder goScreen={setScreen} editingWf={editingWf} />}
        {screen === 'notif-config' && <NotifConfig goScreen={setScreen} editingWf={editingWf} />}
        {screen === 'conditions-config' && <ConditionsBuilder goScreen={setScreen} editingWf={editingWf} />}
      </div>
    </Layout>
  );
};

export default WorkflowConfig;