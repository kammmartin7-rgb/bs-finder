// Shared read/write helpers for existing per-lead proposal drafts and approvals.
import { getLeadId } from '../services/leadId'

const PROPOSAL_CHANGE_EVENT = 'bs-finder-proposal-change'
const PROPOSAL_PREFIX = 'bs-finder-proposal:'

export function getProposalStorageKey(business = {}) {
  return `${PROPOSAL_PREFIX}${getLeadId(business)}`
}

function getLegacyProposalStorageKey(business = {}) {
  return `${PROPOSAL_PREFIX}${business.placeId || business.id || `${business.businessName || business.name || 'customer'}-${business.phone || ''}`}`
}

function read(key) { try { return JSON.parse(window.localStorage.getItem(key)) || null } catch { return null } }

function readWithLegacy(key, legacyKey) {
  const current = read(key)
  if (current) return current
  if (!legacyKey || legacyKey === key) return null
  return read(legacyKey)
}

export function loadProposalDraft(business) {
  const key = getProposalStorageKey(business)
  const legacyBase = getLegacyProposalStorageKey(business)
  return readWithLegacy(`${key}:draft`, `${legacyBase}:draft`)
}

export function loadProposalApproval(business) {
  const key = getProposalStorageKey(business)
  const legacyKey = getLegacyProposalStorageKey(business)
  return readWithLegacy(key, legacyKey)
}

export function getProposalSummary(business) {
  const draft = loadProposalDraft(business)
  const approval = loadProposalApproval(business)
  const amount = Math.max(0, Number(approval?.price ?? draft?.price) || 0)
  return { draft, approval, amount, exists: Boolean(draft || approval), accepted: approval?.status === 'accepted' }
}

export function notifyProposalChange(business) {
  window.dispatchEvent(new CustomEvent(PROPOSAL_CHANGE_EVENT, { detail: { leadId: getLeadId(business) } }))
}

export function subscribeToProposalChanges(callback) {
  function storage(event) { if (event.key?.startsWith('bs-finder-proposal:')) callback() }
  window.addEventListener(PROPOSAL_CHANGE_EVENT, callback); window.addEventListener('storage', storage)
  return () => { window.removeEventListener(PROPOSAL_CHANGE_EVENT, callback); window.removeEventListener('storage', storage) }
}
