// CRM metadata keyed exclusively by LeadID (lead.id).
import { getLeadId } from '../../services/leadId'

const STORAGE_PREFIX = 'bs-hunter-crm:'
const CRM_CHANGE_EVENT = 'bs-hunter-crm-change'

export const CRM_STAGES = ['new', 'first-contact', 'demo-sent', 'proposal-sent', 'follow-up', 'deal-won', 'paid', 'website-in-progress', 'completed', 'lost']

const LEGACY_STAGE_MAP = {
  contacted: 'first-contact',
  'whatsapp-sent': 'first-contact',
  negotiation: 'follow-up',
  won: 'deal-won',
}

export function normalizeCrmStage(status) {
  if (CRM_STAGES.includes(status)) return status
  return LEGACY_STAGE_MAP[status] || 'new'
}

export const DEFAULT_CRM_RECORD = {
  status: 'new',
  notes: '',
  nextFollowUp: '',
  dealAmount: '',
  proposalAmount: '',
  stageChangedAt: '',
  updatedAt: '',
}

/** @deprecated Use getLeadId */
export function getLeadCrmKey(lead = {}) {
  return getLeadId(lead)
}

export function loadLeadCrm(leadOrLeadId) {
  const leadId = typeof leadOrLeadId === 'string' ? leadOrLeadId : getLeadId(leadOrLeadId)
  if (!leadId) return { ...DEFAULT_CRM_RECORD }

  try {
    const savedRecord = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${leadId}`))
    return { ...DEFAULT_CRM_RECORD, ...(savedRecord || {}) }
  } catch {
    return { ...DEFAULT_CRM_RECORD }
  }
}

export function saveLeadCrm(leadOrLeadId, record) {
  const leadId = typeof leadOrLeadId === 'string' ? leadOrLeadId : getLeadId(leadOrLeadId)
  if (!leadId) return false

  try {
    const nextRecord = { ...DEFAULT_CRM_RECORD, ...record, updatedAt: new Date().toISOString() }
    window.localStorage.setItem(`${STORAGE_PREFIX}${leadId}`, JSON.stringify(nextRecord))
    window.dispatchEvent(new CustomEvent(CRM_CHANGE_EVENT, { detail: { leadId, record: nextRecord } }))
    return true
  } catch {
    return false
  }
}

export function ensureLeadCrmRecord(lead) {
  const leadId = getLeadId(lead)
  if (!leadId) return { ...DEFAULT_CRM_RECORD }

  if (window.localStorage.getItem(`${STORAGE_PREFIX}${leadId}`)) {
    return loadLeadCrm(leadId)
  }

  const createdAt = lead.createdAt || new Date().toISOString()
  saveLeadCrm(leadId, {
    ...DEFAULT_CRM_RECORD,
    status: 'new',
    stageChangedAt: createdAt,
  })
  return loadLeadCrm(leadId)
}

export function ensureCrmRecordsForLeads(leads = []) {
  for (const lead of leads) {
    ensureLeadCrmRecord(lead)
  }
}

export function subscribeToCrmChanges(callback) {
  function handleStorage(event) {
    if (event.key?.startsWith(STORAGE_PREFIX)) callback()
  }

  window.addEventListener(CRM_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(CRM_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}
