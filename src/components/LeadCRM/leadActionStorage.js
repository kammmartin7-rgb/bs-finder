// Stores per-lead sales action history and coordinates CRM/task completion through existing utilities.
import { getLeadCrmKey, loadLeadCrm, saveLeadCrm } from './crmStorage'
import { completeRoadmapTrackingTask } from '../BusinessOS/taskStorage'

const STORAGE_KEY = 'bs-hunter-lead-action-history'
const ACTION_CHANGE_EVENT = 'bs-hunter-lead-action-change'

export const LEAD_ACTIONS = {
  DEMO_SITE_OPENED: 'demo-site-opened',
  PROPOSAL_OPENED: 'proposal-opened',
  SALES_PITCH_OPENED: 'sales-pitch-opened',
  WHATSAPP_OPENED: 'whatsapp-opened',
}

export function loadLeadActionHistory() {
  try {
    const history = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return history && typeof history === 'object' ? history : {}
  } catch {
    return {}
  }
}

export function getLeadActions(lead) {
  return loadLeadActionHistory()[getLeadCrmKey(lead)] || []
}

export function hasLeadAction(lead, actionType) {
  return getLeadActions(lead).some((record) => record.actionType === actionType)
}

export function recordLeadAction(lead, actionType) {
  const leadId = getLeadCrmKey(lead)
  const now = new Date()
  const history = loadLeadActionHistory()
  const record = {
    actionType,
    leadId,
    businessName: lead.businessName || lead.name || '',
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 8),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...history, [leadId]: [...(history[leadId] || []), record] }))
  } catch {
    return false
  }

  if ([LEAD_ACTIONS.PROPOSAL_OPENED, LEAD_ACTIONS.WHATSAPP_OPENED].includes(actionType)) {
    const crm = loadLeadCrm(leadId)
    if (['new', 'contacted'].includes(crm.status)) {
      saveLeadCrm(leadId, { ...crm, status: actionType === LEAD_ACTIONS.PROPOSAL_OPENED ? 'proposal-sent' : 'whatsapp-sent' })
    }
  }

  completeRoadmapTrackingTask(actionType)
  window.dispatchEvent(new CustomEvent(ACTION_CHANGE_EVENT, { detail: record }))
  return true
}

export function subscribeToLeadActionChanges(callback) {
  function handleStorage(event) {
    if (event.key === STORAGE_KEY) callback()
  }
  window.addEventListener(ACTION_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(ACTION_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}

export { STORAGE_KEY as LEAD_ACTION_STORAGE_KEY }
