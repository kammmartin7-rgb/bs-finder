// Stores per-lead sales action history and coordinates CRM/task completion through existing utilities.
import { getLeadId } from '../../services/leadId'
import { completeRoadmapTrackingTask } from '../BusinessOS/taskStorage'

const STORAGE_KEY = 'bs-hunter-lead-action-history'
const ACTION_CHANGE_EVENT = 'bs-hunter-lead-action-change'

let actionHistoryCache = null

function readActionHistoryFromStorage() {
  try {
    const history = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return history && typeof history === 'object' ? history : {}
  } catch {
    return {}
  }
}

export function invalidateLeadActionHistoryCache() {
  actionHistoryCache = null
}

export function loadLeadActionHistory() {
  if (actionHistoryCache) return actionHistoryCache
  actionHistoryCache = readActionHistoryFromStorage()
  return actionHistoryCache
}

export const LEAD_ACTIONS = {
  DEMO_SITE_OPENED: 'demo-site-opened',
  DEMO_SENT: 'demo-sent',
  PROPOSAL_OPENED: 'proposal-opened',
  PROPOSAL_SENT: 'proposal-sent',
  SALES_PITCH_OPENED: 'sales-pitch-opened',
  WHATSAPP_OPENED: 'whatsapp-opened',
  CALL_OPENED: 'call-opened',
  FOLLOW_UP_COMPLETED: 'follow-up-completed',
}

export function getLeadActions(lead, actionHistory = loadLeadActionHistory()) {
  return actionHistory[getLeadId(lead)] || []
}

export function hasLeadAction(lead, actionType) {
  return getLeadActions(lead).some((record) => record.actionType === actionType)
}

export function recordLeadAction(lead, actionType) {
  const leadId = getLeadId(lead)
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
    const nextHistory = { ...history, [leadId]: [...(history[leadId] || []), record] }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory))
    actionHistoryCache = nextHistory
  } catch {
    return false
  }

  completeRoadmapTrackingTask(actionType)
  window.dispatchEvent(new CustomEvent(ACTION_CHANGE_EVENT, { detail: record }))
  return true
}

export function subscribeToLeadActionChanges(callback) {
  function handleStorage(event) {
    if (event.key === STORAGE_KEY) {
      invalidateLeadActionHistoryCache()
      callback()
    }
  }
  function handleActionChange() {
    callback()
  }
  window.addEventListener(ACTION_CHANGE_EVENT, handleActionChange)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(ACTION_CHANGE_EVENT, handleActionChange)
    window.removeEventListener('storage', handleStorage)
  }
}

export { STORAGE_KEY as LEAD_ACTION_STORAGE_KEY }
