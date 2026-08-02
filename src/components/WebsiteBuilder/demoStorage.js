// Stable public demo IDs, Supabase/local persistence, and short /demo/:id URLs.
import { getLeadId } from '../../services/leadId'
import { loadDemoFromSupabase, saveDemoToSupabase } from '../../services/supabaseDemos'
import { loadLeadMediaLibrary } from '../RealWebsiteBuilder/realWebsiteStorage'

const STORAGE_PREFIX = 'bs-finder-demo:'
const LEAD_INDEX_PREFIX = 'bs-finder-demo-lead:'
const ALIAS_PREFIX = 'bs-finder-demo-alias:'
const MAX_PORTABLE_DATA_LENGTH = 200_000
const DEMO_ID_SUFFIX_LENGTH = 6
const DEMO_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const DEFAULT_PUBLIC_APP_URL = 'https://bs-finder.vercel.app'

export function getPublicAppBaseUrl() {
  const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (!configuredUrl) return DEFAULT_PUBLIC_APP_URL
  try {
    const url = new URL(configuredUrl)
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
      return DEFAULT_PUBLIC_APP_URL
    }
    return configuredUrl
  } catch {
    return DEFAULT_PUBLIC_APP_URL
  }
}

function getLocalDemoPreviewBaseUrl() {
  const origin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : ''
  const pathname = typeof window !== 'undefined'
    ? window.location.pathname.replace(/\/demo\/[^/]+\/?$/, '').replace(/\/$/, '')
    : ''
  return `${origin}${pathname}`.replace(/\/$/, '') || origin
}

function buildDemoPath(id) {
  return `/demo/${encodeURIComponent(id)}`
}

export function createShareableDemoUrl(record) {
  return `${getPublicAppBaseUrl()}${buildDemoPath(record.id)}`
}

export function createDemoOpenUrl(record) {
  const base = import.meta.env.DEV ? getLocalDemoPreviewBaseUrl() : getPublicAppBaseUrl()
  return `${base}${buildDemoPath(record.id)}`
}

function hash(value) {
  let result = 2166136261
  for (const character of value) { result ^= character.charCodeAt(0); result = Math.imul(result, 16777619) }
  return (result >>> 0).toString(36)
}

function businessSlug(business = {}) {
  const name = String(business.businessName || business.name || '').trim()
  const latin = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
  return latin.length >= 3 ? latin : ''
}

export function isPublicDemoId(id = '') {
  const value = String(id || '').trim()
  if (!value || value.startsWith('lead-')) return false
  if (/^demo_[A-HJ-NP-Z2-9]{6}$/.test(value)) return true
  if (/^[a-z0-9]{8}$/.test(value)) return false
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)
}

function generatePrefixedDemoId() {
  const bytes = crypto.getRandomValues(new Uint8Array(DEMO_ID_SUFFIX_LENGTH))
  const suffix = Array.from(bytes, (byte) => DEMO_ID_ALPHABET[byte % DEMO_ID_ALPHABET.length]).join('')
  return `demo_${suffix}`
}

function chooseCanonicalDemoId(record = null, business = {}) {
  const currentId = resolveDemoId(record?.id || '')
  if (currentId && isPublicDemoId(currentId)) return currentId

  const slug = businessSlug(business)
  if (slug && !readStoredRecord(slug)) return slug

  let candidate = generatePrefixedDemoId()
  while (readStoredRecord(candidate)) candidate = generatePrefixedDemoId()
  return candidate
}

function portableSnapshot(business = {}) {
  const fields = ['id', 'placeId', 'websiteLanguage', 'businessName', 'name', 'businessType', 'category', 'phone', 'address', 'city', 'website', 'mapsUrl', 'url', 'rating', 'totalScore', 'reviewsCount', 'demoHeroImage', 'demoHeroImageMode']
  return Object.fromEntries(fields.filter((field) => business[field] !== undefined).map((field) => [field, business[field]]))
}

function readStoredRecord(id) {
  if (!id) return null
  try {
    const record = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${id}`))
    return record?.business ? record : null
  } catch {
    return null
  }
}

function setAlias(previousId, nextId) {
  if (!previousId || !nextId || previousId === nextId) return
  localStorage.setItem(`${ALIAS_PREFIX}${previousId}`, nextId)
}

export function resolveDemoId(id = '') {
  const value = String(id || '').trim()
  if (!value) return ''
  return localStorage.getItem(`${ALIAS_PREFIX}${value}`) || value
}

function cacheRecord(record) {
  localStorage.setItem(`${STORAGE_PREFIX}${record.id}`, JSON.stringify(record))
  if (record.leadId) localStorage.setItem(`${LEAD_INDEX_PREFIX}${record.leadId}`, record.id)
}

function enrichDemoAnalytics(record, { touch = false } = {}) {
  const now = new Date().toISOString()
  const next = {
    ...record,
    createdAt: record.createdAt || record.updatedAt || now,
    opens: Number(record.opens) || 0,
    lastOpenedAt: record.lastOpenedAt || null,
    leadId: record.leadId ?? null,
  }
  if (touch) {
    next.opens += 1
    next.lastOpenedAt = now
  }
  return next
}

function persistRecord(record, { touch = false } = {}) {
  const next = enrichDemoAnalytics(record, { touch })
  cacheRecord(next)
  void saveDemoToSupabase(next).catch((error) => console.error('[demo-storage]', error.message))
  return next
}

function migrateDemoRecord(record, business = record?.business) {
  if (!record?.business) return record
  const canonicalId = chooseCanonicalDemoId(record, business)
  const enriched = enrichDemoAnalytics({
    ...record,
    id: canonicalId,
    business: portableSnapshot({ ...business, ...record.business }),
    updatedAt: new Date().toISOString(),
  })
  if (record.id !== canonicalId) setAlias(record.id, canonicalId)
  cacheRecord(enriched)
  void saveDemoToSupabase(enriched).catch((error) => console.error('[demo-storage]', error.message))
  return enriched
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
  const indexedId = leadId ? resolveDemoId(localStorage.getItem(`${LEAD_INDEX_PREFIX}${leadId}`) || '') : ''
  const legacyId = leadId ? `lead-${leadId}` : `legacy-${hash(JSON.stringify(portableSnapshot(business)))}`
  const existing = readStoredRecord(indexedId) || readStoredRecord(legacyId)
  const existingBusiness = existing?.business || {}
  const hasExistingChoice = Object.hasOwn(existingBusiness, 'demoHeroImageMode')
  const googleImage = hasExistingChoice ? null : findGoogleMapsDemoImage(business)
  const demoHeroImageMode = hasExistingChoice ? existingBusiness.demoHeroImageMode : (googleImage ? 'google-maps' : undefined)
  const demoHeroImage = hasExistingChoice ? existingBusiness.demoHeroImage : imageSnapshot(googleImage)
  const snapshot = portableSnapshot({ ...business, demoHeroImageMode, demoHeroImage })
  const draft = {
    ...(existing || {}),
    id: existing?.id || indexedId || legacyId,
    leadId: leadId || existing?.leadId || null,
    business: snapshot,
    updatedAt: new Date().toISOString(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    opens: existing?.opens || 0,
    lastOpenedAt: existing?.lastOpenedAt || null,
  }
  return migrateDemoRecord(draft, snapshot)
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
  const indexedId = resolveDemoId(localStorage.getItem(`${LEAD_INDEX_PREFIX}${leadId}`) || '')
  const indexed = readStoredRecord(indexedId)
  if (indexed) return migrateDemoRecord(indexed, indexed.business)
  const legacy = readStoredRecord(`lead-${leadId}`)
  if (!legacy) return null
  return migrateDemoRecord({ ...legacy, leadId, updatedAt: new Date().toISOString() }, legacy.business)
}

export async function loadPublicDemo(id) {
  const resolvedId = resolveDemoId(id)
  try {
    const remote = await loadDemoFromSupabase(resolvedId)
    if (remote) {
      const migrated = migrateDemoRecord(remote, remote.business)
      return persistRecord(migrated, { touch: true })
    }
  } catch {
    // Fall back to local cache below.
  }
  const local = readStoredRecord(resolvedId)
  if (!local) return null
  const migrated = migrateDemoRecord(local, local.business)
  return persistRecord(migrated, { touch: true })
}

function buildPortableRecord(rawId, portableBusiness, stored) {
  const storedImageChoice = Object.hasOwn(stored?.business || {}, 'demoHeroImageMode')
    ? { demoHeroImage: stored.business.demoHeroImage, demoHeroImageMode: stored.business.demoHeroImageMode }
    : {}
  const draft = {
    ...(stored || {}),
    id: stored?.id || rawId,
    leadId: stored?.leadId || null,
    business: { ...portableBusiness, ...storedImageChoice },
    updatedAt: new Date().toISOString(),
    createdAt: stored?.createdAt || new Date().toISOString(),
    opens: stored?.opens || 0,
    lastOpenedAt: stored?.lastOpenedAt || null,
  }
  return migrateDemoRecord(draft, draft.business)
}

function legacyHashRouteNeedsRedirect(id = '') {
  const value = resolveDemoId(id)
  return !isPublicDemoId(value)
}

export function parseShareableDemoRoute(location = window.location) {
  const pathnameMatch = location.pathname.match(/\/demo\/([^/?#]+)\/?$/)
  if (pathnameMatch) {
    const id = resolveDemoId(decodeURIComponent(pathnameMatch[1]))
    return { id, record: readStoredRecord(id), remote: true, legacyRedirect: false }
  }

  const match = String(location.hash || '').match(/^#\/demo\/([^?]+)(?:\?data=(.+))?$/)
  if (!match) return null

  const rawId = decodeURIComponent(match[1])
  const resolvedId = resolveDemoId(rawId)

  if (match[2]) {
    if (match[2].length > MAX_PORTABLE_DATA_LENGTH) {
      return { id: resolvedId, record: readStoredRecord(resolvedId), remote: true, legacyRedirect: legacyHashRouteNeedsRedirect(rawId) }
    }
    try {
      const portableBusiness = decode(match[2])
      const stored = readStoredRecord(resolvedId) || readStoredRecord(rawId)
      const record = buildPortableRecord(rawId, portableBusiness, stored)
      return { id: record.id, record, remote: false, legacyRedirect: true }
    } catch {
      return { id: resolvedId, record: readStoredRecord(resolvedId), remote: true, legacyRedirect: legacyHashRouteNeedsRedirect(rawId) }
    }
  }

  return {
    id: resolvedId,
    record: readStoredRecord(resolvedId),
    remote: true,
    legacyRedirect: legacyHashRouteNeedsRedirect(rawId),
  }
}

export const DEMO_STORAGE_PREFIX = STORAGE_PREFIX
