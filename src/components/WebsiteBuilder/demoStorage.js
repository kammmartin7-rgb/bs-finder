// Creates stable demo IDs, portable URL snapshots, and same-browser persistence.
import { getLeadId } from '../../services/leadId'

const STORAGE_PREFIX = 'bs-finder-demo:'

function hash(value) {
  let result = 2166136261
  for (const character of value) { result ^= character.charCodeAt(0); result = Math.imul(result, 16777619) }
  return (result >>> 0).toString(36)
}

function demoIdFor(business = {}) {
  const source = String(business.placeId || business.id || `${business.businessName || business.name || 'business'}|${business.phone || ''}|${business.address || ''}`)
  const slug = String(business.businessName || business.name || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 36) || 'business'
  return `${slug}-${hash(source)}`
}

function portableSnapshot(business = {}) {
  const fields = ['id', 'placeId', 'websiteLanguage', 'businessName', 'name', 'businessType', 'category', 'phone', 'address', 'city', 'website', 'mapsUrl', 'url', 'rating', 'totalScore', 'reviewsCount']
  return Object.fromEntries(fields.filter((field) => business[field] !== undefined).map((field) => [field, business[field]]))
}

function encode(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function decode(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0))))
}

export function saveShareableDemo(business) {
  const leadId = getLeadId(business)
  const id = leadId ? `lead-${leadId}` : demoIdFor(business)
  const record = { id, leadId: leadId || null, business: portableSnapshot(business), updatedAt: new Date().toISOString() }
  localStorage.setItem(`${STORAGE_PREFIX}${record.id}`, JSON.stringify(record))
  return record
}

export function createShareableDemoUrl(record) {
  const base = `${window.location.origin}${window.location.pathname}${window.location.search}`
  return `${base}#/demo/${encodeURIComponent(record.id)}?data=${encode(record.business)}`
}

export function parseShareableDemoRoute(hashValue = window.location.hash) {
  const match = hashValue.match(/^#\/demo\/([^?]+)(?:\?data=(.+))?$/)
  if (!match) return null
  const id = decodeURIComponent(match[1])
  try {
    if (match[2]) {
      const record = { id, business: decode(match[2]), updatedAt: new Date().toISOString() }
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(record))
      return { id, record }
    }
    const stored = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${id}`))
    return { id, record: stored?.business ? stored : null }
  } catch {
    return { id, record: null }
  }
}

export const DEMO_STORAGE_PREFIX = STORAGE_PREFIX
