// Canonical LeadID helpers — every related entity joins on lead.id only.
import { isDemoLead } from '../components/BusinessOS/dashboardFilters'

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function fingerprintLead(lead = {}) {
  return [
    cleanText(lead.businessName).toLowerCase(),
    cleanText(lead.address).toLowerCase(),
    cleanText(lead.phone).replace(/\D/g, ''),
    cleanText(lead.mapsUrl).toLowerCase(),
  ].filter(Boolean).join('|')
}

function hashFingerprint(value) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36)
}

/** Assigns a permanent lead.id used as the sole relation key across modules. */
export function ensureStableLeadId(lead = {}) {
  if (isDemoLead(lead)) return lead

  const placeId = cleanText(lead.placeId)
  const existingId = cleanText(lead.id)

  if (existingId && !existingId.startsWith('demo-')) {
    return { ...lead, id: existingId, placeId: placeId || lead.placeId, isDemo: false }
  }

  if (placeId) {
    return { ...lead, placeId, id: placeId, isDemo: false }
  }

  const fingerprint = fingerprintLead(lead)
  const stableId = fingerprint
    ? `lead-${hashFingerprint(fingerprint)}`
    : `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return { ...lead, id: stableId, isDemo: false }
}

/** The only relation key for CRM, proposals, media, demos, and website projects. */
export function getLeadId(lead = {}) {
  if (isDemoLead(lead)) return String(lead.id || '')
  return String(ensureStableLeadId(lead).id || '')
}

/** Pre-LeadID CRM / relation keys used before normalization (migration only). */
export function getLegacyCrmKey(lead = {}) {
  if (lead.placeId) return String(lead.placeId)
  if (lead.id) return String(lead.id)

  const fallbackParts = [lead.businessName, lead.name, lead.address, lead.phone, lead.website, lead.mapsUrl]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())

  return fallbackParts.length > 0 ? fallbackParts.join('|') : 'unknown-lead'
}

export function getLegacyProposalKey(lead = {}) {
  return `${lead.placeId || lead.id || `${lead.businessName || lead.name || 'customer'}-${lead.phone || ''}`}`
}

export function collectLegacyRelationKeys(lead = {}) {
  const leadId = getLeadId(lead)
  const keys = new Set([getLegacyCrmKey(lead), getLegacyProposalKey(lead)])
  if (lead.placeId) keys.add(String(lead.placeId))
  if (lead.id) keys.add(String(lead.id))
  keys.delete(leadId)
  keys.delete('')
  return [...keys]
}
