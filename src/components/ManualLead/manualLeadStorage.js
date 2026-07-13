// Converts, deduplicates, and persists real leads entered manually from Google Maps.
import { calculateLeadScore } from '../../utils/leadScore'

const STORAGE_KEY = 'bs-hunter-manual-leads'

export const LEGACY_MANUAL_LEADS_STORAGE_KEY = STORAGE_KEY

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function normalizeUrl(value) {
  return cleanText(value).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
}

function normalizePhone(value) {
  return cleanText(value).replace(/\D/g, '')
}

function sameNonEmpty(first, second) {
  return Boolean(first && second && first === second)
}

function normalizeLeadId(lead = {}) {
  return cleanText(lead.placeId || lead.id)
}

export function isSameLead(candidate, lead) {
  const candidateNameAddress = `${cleanText(candidate.businessName).toLowerCase()}|${cleanText(candidate.address).toLowerCase()}`
  const leadNameAddress = `${cleanText(lead.businessName).toLowerCase()}|${cleanText(lead.address).toLowerCase()}`
  const candidateId = normalizeLeadId(candidate)
  const leadId = normalizeLeadId(lead)

  return sameNonEmpty(candidateId, leadId)
    || sameNonEmpty(normalizeUrl(candidate.mapsUrl), normalizeUrl(lead.mapsUrl))
    || sameNonEmpty(normalizePhone(candidate.phone), normalizePhone(lead.phone))
    || sameNonEmpty(normalizeUrl(candidate.website), normalizeUrl(lead.website))
    || (candidate.businessName && candidate.address && candidateNameAddress === leadNameAddress)
}

export function findDuplicateLeadIndex(candidate, leads = []) {
  return leads.findIndex((lead) => isSameLead(candidate, lead))
}

export function loadManualLeads() {
  try {
    const leads = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return Array.isArray(leads) ? leads : []
  } catch {
    return []
  }
}

export function isDuplicateManualLead(candidate, leads) {
  return findDuplicateLeadIndex(candidate, leads) >= 0
}

export function isDuplicatePhoneLead(candidate, leads = []) {
  const phone = normalizePhone(candidate.phone)
  if (!phone) return false
  return leads.some((lead) => normalizePhone(lead.phone) === phone)
}

export function createManualLead(values) {
  const rating = values.rating === '' ? null : Number(values.rating)
  const reviewsCount = values.reviewsCount === '' ? null : Number(values.reviewsCount)
  const source = cleanText(values.source) || 'Google Maps'
  const lead = {
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    businessName: cleanText(values.businessName),
    category: cleanText(values.category),
    city: cleanText(values.city),
    website: cleanText(values.website),
    phone: cleanText(values.phone),
    address: cleanText(values.address),
    rating: Number.isFinite(rating) ? rating : null,
    reviewsCount: Number.isFinite(reviewsCount) ? reviewsCount : null,
    mapsUrl: cleanText(values.mapsUrl),
    source,
    searchMode: 'manual',
    isDemo: false,
    createdAt: new Date().toISOString(),
  }
  return { ...lead, leadScore: calculateLeadScore(lead) }
}

export function saveManualLead(lead, currentLeads = []) {
  const savedLeads = loadManualLeads()
  if (isDuplicateManualLead(lead, [...currentLeads, ...savedLeads])) return false

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedLeads, lead]))
    return true
  } catch {
    return false
  }
}
