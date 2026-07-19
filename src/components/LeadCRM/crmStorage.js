// CRM metadata keyed exclusively by LeadID (lead.id).
import { getLeadId } from '../../services/leadId'

export { CRM_STAGES, normalizeCrmStage, STAGE_LABELS } from '../CRM/salesWorkflow'

const STORAGE_PREFIX = 'bs-hunter-crm:'
const CRM_CHANGE_EVENT = 'bs-hunter-crm-change'

export const DEFAULT_CRM_RECORD = {
  status: 'new',
  notes: '',
  notesHistory: [],
  nextFollowUp: '',
  dealAmount: '',
  proposalAmount: '',
  stageChangedAt: '',
  updatedAt: '',
}

const crmRecordCache = new Map()
const ensuredLeadIds = new Set()

export function invalidateLeadCrmCache(leadId = '') {
  if (leadId) {
    crmRecordCache.delete(leadId)
    ensuredLeadIds.delete(leadId)
    return
  }
  crmRecordCache.clear()
  ensuredLeadIds.clear()
}

/** @deprecated Use getLeadId */
export function getLeadCrmKey(lead = {}) {
  return getLeadId(lead)
}

export function loadLeadCrm(leadOrLeadId) {
  const leadId = typeof leadOrLeadId === 'string' ? leadOrLeadId : getLeadId(leadOrLeadId)
  if (!leadId) return { ...DEFAULT_CRM_RECORD }

  if (crmRecordCache.has(leadId)) {
    return crmRecordCache.get(leadId)
  }

  try {
    const savedRecord = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${leadId}`))
    const record = { ...DEFAULT_CRM_RECORD, ...(savedRecord || {}) }
    crmRecordCache.set(leadId, record)
    return record
  } catch {
    const record = { ...DEFAULT_CRM_RECORD }
    crmRecordCache.set(leadId, record)
    return record
  }
}

export function saveLeadCrm(leadOrLeadId, record) {
  const leadId = typeof leadOrLeadId === 'string' ? leadOrLeadId : getLeadId(leadOrLeadId)
  if (!leadId) return false

  try {
    const nextRecord = { ...DEFAULT_CRM_RECORD, ...record, updatedAt: new Date().toISOString() }
    window.localStorage.setItem(`${STORAGE_PREFIX}${leadId}`, JSON.stringify(nextRecord))
    crmRecordCache.set(leadId, nextRecord)
    window.dispatchEvent(new CustomEvent(CRM_CHANGE_EVENT, { detail: { leadId, record: nextRecord } }))
    return true
  } catch {
    return false
  }
}

export function ensureLeadCrmRecord(lead) {
  const leadId = getLeadId(lead)
  if (!leadId) return { ...DEFAULT_CRM_RECORD }

  if (crmRecordCache.has(leadId) || ensuredLeadIds.has(leadId)) {
    return loadLeadCrm(leadId)
  }

  if (window.localStorage.getItem(`${STORAGE_PREFIX}${leadId}`)) {
    ensuredLeadIds.add(leadId)
    return loadLeadCrm(leadId)
  }

  const createdAt = lead.createdAt || new Date().toISOString()
  saveLeadCrm(leadId, {
    ...DEFAULT_CRM_RECORD,
    status: 'new',
    stageChangedAt: createdAt,
  })
  ensuredLeadIds.add(leadId)
  return loadLeadCrm(leadId)
}

export function ensureCrmRecordsForLeads(leads = []) {
  for (const lead of leads) {
    ensureLeadCrmRecord(lead)
  }
}

export function subscribeToCrmChanges(callback) {
  function handleCrmChange(event) {
    const leadId = event?.detail?.leadId
    if (leadId) invalidateLeadCrmCache(leadId)
    callback()
  }

  function handleStorage(event) {
    if (event.key?.startsWith(STORAGE_PREFIX)) {
      invalidateLeadCrmCache(event.key.slice(STORAGE_PREFIX.length))
      callback()
    }
  }

  window.addEventListener(CRM_CHANGE_EVENT, handleCrmChange)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(CRM_CHANGE_EVENT, handleCrmChange)
    window.removeEventListener('storage', handleStorage)
  }
}
