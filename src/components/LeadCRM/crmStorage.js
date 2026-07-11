// Provides stable lead identifiers and localStorage persistence for lead-level CRM data.
const STORAGE_PREFIX = 'bs-hunter-crm:'
const CRM_CHANGE_EVENT = 'bs-hunter-crm-change'

export const DEFAULT_CRM_RECORD = {
  status: 'new',
  notes: '',
  nextFollowUp: '',
}

export function getLeadCrmKey(lead = {}) {
  if (lead.placeId) return String(lead.placeId)
  if (lead.id) return String(lead.id)

  const fallbackParts = [lead.businessName, lead.name, lead.address, lead.phone, lead.website, lead.mapsUrl]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return fallbackParts.length > 0 ? fallbackParts.join('|') : 'unknown-lead'
}

export function loadLeadCrm(leadKey) {
  try {
    const savedRecord = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${leadKey}`))
    return { ...DEFAULT_CRM_RECORD, ...(savedRecord || {}) }
  } catch {
    return { ...DEFAULT_CRM_RECORD }
  }
}

export function saveLeadCrm(leadKey, record) {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${leadKey}`, JSON.stringify(record))
    window.dispatchEvent(new CustomEvent(CRM_CHANGE_EVENT, { detail: { leadKey, record } }))
    return true
  } catch {
    return false
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
