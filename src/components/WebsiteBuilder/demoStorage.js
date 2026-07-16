// Creates stable demo IDs, portable URL snapshots, and same-browser persistence.
import { getLeadId } from '../../services/leadId'
import { loadDemoFromSupabase, saveDemoToSupabase } from '../../services/supabaseDemos'
import { loadLeadMediaLibrary } from '../RealWebsiteBuilder/realWebsiteStorage'

const STORAGE_PREFIX = 'bs-finder-demo:'
const LEAD_INDEX_PREFIX = 'bs-finder-demo-lead:'
const MAX_PORTABLE_DATA_LENGTH = 200_000
const SHORT_ID_LENGTH = 8

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

function shortDemoId() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(SHORT_ID_LENGTH))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

function portableSnapshot(business = {}) {
  const fields = ['id', 'placeId', 'websiteLanguage', 'businessName', 'name', 'businessType', 'category', 'phone', 'address', 'city', 'website', 'mapsUrl', 'url', 'rating', 'totalScore', 'reviewsCount', 'demoHeroImage', 'demoHeroImageMode']
  return Object.fromEntries(fields.filter((field) => business[field] !== undefined).map((field) => [field, business[field]]))
}

function readStoredRecord(id) {
  try {
    const record = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${id}`))
    return record?.business ? record : null
  } catch {
    return null
  }
}

function cacheRecord(record) {
  localStorage.setItem(`${STORAGE_PREFIX}${record.id}`, JSON.stringify(record))
  if (record.leadId) localStorage.setItem(`${LEAD_INDEX_PREFIX}${record.leadId}`, record.id)
}

function persistRecord(record) {
  cacheRecord(record)
  void saveDemoToSupabase(record).catch((error) => console.error('[demo-storage]', error.message))
  return record
}

function imageSnapshot(image) {
  if (!image?.dataUrl) return null
  return Object.fromEntries(['id', 'libraryId', 'name', 'type', 'dataUrl', 'width', 'height'].filter((field) => image[field] !== undefined).map((field) => [field, image[field]]))
}

export function findGoogleMapsDemoImage(business) {
  return loadLeadMediaLibrary(business).find((item) => item?.category === 'hero' && String(item.libraryId || '').startsWith('import-')) || null
}

function decode(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0))))
}

export function saveShareableDemo(business) {
  const leadId = getLeadId(business)
  const indexedId = leadId ? localStorage.getItem(`${LEAD_INDEX_PREFIX}${leadId}`) : null
  const legacyId = leadId ? `lead-${leadId}` : demoIdFor(business)
  const existing = readStoredRecord(indexedId) || readStoredRecord(legacyId)
  const id = indexedId || shortDemoId()
  const existingBusiness = existing?.business || {}
  const hasExistingChoice = Object.hasOwn(existingBusiness, 'demoHeroImageMode')
  const googleImage = hasExistingChoice ? null : findGoogleMapsDemoImage(business)
  const demoHeroImageMode = hasExistingChoice ? existingBusiness.demoHeroImageMode : (googleImage ? 'google-maps' : undefined)
  const demoHeroImage = hasExistingChoice ? existingBusiness.demoHeroImage : imageSnapshot(googleImage)
  const snapshot = portableSnapshot({ ...business, demoHeroImageMode, demoHeroImage })
  const record = { id, leadId: leadId || null, business: snapshot, updatedAt: new Date().toISOString() }
  return persistRecord(record)
}

export function saveDemoHeroImage(business, image, mode) {
  const record = saveShareableDemo(business)
  record.business.demoHeroImageMode = mode
  record.business.demoHeroImage = mode === 'default' ? null : imageSnapshot(image)
  record.updatedAt = new Date().toISOString()
  return persistRecord(record)
}

export function loadShareableDemo(business) {
  const leadId = getLeadId(business)
  if (!leadId) return null
  const indexedId = localStorage.getItem(`${LEAD_INDEX_PREFIX}${leadId}`)
  const indexed = readStoredRecord(indexedId)
  if (indexed) return indexed
  const legacy = readStoredRecord(`lead-${leadId}`)
  if (!legacy) return null
  return persistRecord({ ...legacy, id: shortDemoId(), leadId, updatedAt: new Date().toISOString() })
}

export function createShareableDemoUrl(record) {
  const configuredBase = import.meta.env.VITE_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  const base = configuredBase || `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '')
  return `${base}/#/demo/${encodeURIComponent(record.id)}`
}

export async function loadPublicDemo(id) {
  try {
    const remote = await loadDemoFromSupabase(id)
    if (remote) cacheRecord(remote)
    return remote || readStoredRecord(id)
  } catch {
    return readStoredRecord(id)
  }
}

export function parseShareableDemoRoute(hashValue = window.location.hash) {
  const match = hashValue.match(/^#\/demo\/([^?]+)(?:\?data=(.+))?$/)
  if (!match) return null
  const id = decodeURIComponent(match[1])
  try {
    if (match[2]) {
      if (match[2].length > MAX_PORTABLE_DATA_LENGTH) return { id, record: readStoredRecord(id) }
      const portableBusiness = decode(match[2])
      const stored = readStoredRecord(id)
      const storedImageChoice = Object.hasOwn(stored?.business || {}, 'demoHeroImageMode')
        ? { demoHeroImage: stored.business.demoHeroImage, demoHeroImageMode: stored.business.demoHeroImageMode }
        : {}
      const record = { id, leadId: stored?.leadId || null, business: { ...portableBusiness, ...storedImageChoice }, updatedAt: new Date().toISOString() }
      cacheRecord(record)
      return { id, record }
    }
    return { id, record: readStoredRecord(id), remote: true }
  } catch {
    return { id, record: null }
  }
}

export const DEMO_STORAGE_PREFIX = STORAGE_PREFIX
