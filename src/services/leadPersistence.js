// Single source of truth for real leads: localStorage key bs-hunter-real-leads.
import { isDemoLead } from '../components/BusinessOS/dashboardFilters'
import { ensureCrmRecordsForLeads, loadLeadCrm, saveLeadCrm } from '../components/LeadCRM/crmStorage'
import {
  createManualLead,
  findDuplicateLeadIndex,
  isDuplicateManualLead,
  isDuplicatePhoneLead,
  loadManualLeads,
} from '../components/ManualLead/manualLeadStorage'
import { addImagesToLeadMediaLibrary } from '../components/RealWebsiteBuilder/realWebsiteStorage'
import { calculateLeadScore } from '../utils/leadScore'
import { ensureStableLeadId, getLeadId } from './leadId'
import { migrateAllLeadRelations, scanOrphanCrmKeys } from './leadRelationMigration'
import { enrichLeadCategory } from './leadCategory'
import { enrichLeadSalesTracking, pickSalesTrackingUpdates } from './leadSalesTracking'
import { runLeadCategoryMigrationOnce } from './leadCategoryMigration'
import { runLeadBatchMigrationOnce } from './leadBatchMigration'
import { runLeadSalesTrackingMigrationOnce } from './leadSalesTrackingMigration'

export const REAL_LEADS_STORAGE_KEY = 'bs-hunter-real-leads'
export const LEGACY_MANUAL_LEADS_STORAGE_KEY = 'bs-hunter-manual-leads'

/** Known legacy keys merged into REAL_LEADS_STORAGE_KEY on load (not separate lead databases). */
export const LEGACY_LEAD_STORAGE_KEYS = [LEGACY_MANUAL_LEADS_STORAGE_KEY]

/** Additional keys that historically stored lead arrays before canonical merge. */
const ADDITIONAL_LEGACY_LEAD_KEY_PATTERNS = [
  /^bs-hunter-leads$/i,
  /^bs-finder-leads$/i,
  /^bs-hunter-saved-leads$/i,
]

export const LEAD_PERSISTENCE_CHANGE_EVENT = 'bs-hunter-lead-persistence-change'

const PLUMBER_PHONE_DIGITS = '0505626228'
const PLUMBER_MATCH = 'אינסטלטור בפתח תקווה יובל קדס'
const PLUMBER_SEED = {
  businessName: PLUMBER_MATCH,
  phone: '050-562-6228',
  address: 'מבצע דקל 11, פתח תקווה',
  category: 'Plumber',
  city: 'פתח תקווה',
  rating: '5.0',
  reviewsCount: '13',
  source: 'Google Maps',
  mapsUrl: '',
}

export { ensureStableLeadId }

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function enrichLead(lead) {
  const normalized = ensureStableLeadId(lead)
  const categorized = enrichLeadCategory(normalized)
  const tracked = enrichLeadSalesTracking(categorized)
  const nextLead = tracked.leadScore !== undefined && tracked.leadScore !== null
    ? tracked
    : { ...tracked, leadScore: calculateLeadScore(tracked) }
  return nextLead
}

function readJsonArray(key) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(key))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function readPrimaryLeads() {
  return readJsonArray(REAL_LEADS_STORAGE_KEY).filter((lead) => !isDemoLead(lead)).map(enrichLead)
}

function readLegacyManualLeads() {
  return loadManualLeads().filter((lead) => !isDemoLead(lead)).map(enrichLead)
}

function readLegacyLeadCollections() {
  const collections = []
  for (const key of LEGACY_LEAD_STORAGE_KEYS) {
    collections.push(...readJsonArray(key).filter((lead) => !isDemoLead(lead)).map(enrichLead))
  }
  return collections
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function isLeadLikeObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Boolean(cleanText(value.businessName || value.name) || normalizePhoneDigits(value.phone))
}

function isLeadArray(value) {
  return Array.isArray(value) && value.some(isLeadLikeObject)
}

function leadFromDemoRecord(record = {}) {
  if (!isLeadLikeObject(record)) return null
  if (isDemoLead(record)) return null
  return enrichLead({
    ...record,
    businessName: record.businessName || record.name || '',
    isDemo: false,
  })
}

function readObjectFromKey(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch {
    return null
  }
}

function readLeadArrayFromKey(key) {
  if (key === REAL_LEADS_STORAGE_KEY) return []
  if (key.startsWith('bs-hunter-crm:')) return []
  if (key.startsWith('bs-finder-proposal:')) return []

  const parsed = readObjectFromKey(key)
  if (Array.isArray(parsed) && isLeadArray(parsed)) {
    return parsed.filter(isLeadLikeObject).filter((lead) => !isDemoLead(lead)).map(enrichLead)
  }

  if (key.startsWith('bs-finder-demo:')) {
    const fromDemo = leadFromDemoRecord(parsed)
    return fromDemo ? [fromDemo] : []
  }

  return []
}

/** Scans every localStorage key for orphaned lead arrays or demo payloads. */
export function recoverLeadsFromAllStorageKeys() {
  const recovered = []
  const seenKeys = new Set([REAL_LEADS_STORAGE_KEY, ...LEGACY_LEAD_STORAGE_KEYS])

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (!key || seenKeys.has(key)) continue
      if (ADDITIONAL_LEGACY_LEAD_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
        recovered.push(...readLeadArrayFromKey(key))
        continue
      }
      if (/lead/i.test(key)) {
        recovered.push(...readLeadArrayFromKey(key))
      }
    }
  } catch (error) {
    console.error('[bs-hunter] Lead recovery scan failed:', error)
  }

  return recovered
}

function hasPlumberPhone(leads = []) {
  return leads.some((lead) => normalizePhoneDigits(lead.phone) === PLUMBER_PHONE_DIGITS)
}

function findPlumberLead(leads = []) {
  return leads.find((lead) => {
    const name = String(lead.businessName || '')
    return name.includes('יובל קדס') || name === PLUMBER_MATCH
      || normalizePhoneDigits(lead.phone) === PLUMBER_PHONE_DIGITS
  }) || null
}

function ensurePlumberLeadInCanonicalStore(leads = []) {
  if (hasPlumberPhone(leads) || findPlumberLead(leads)) return leads

  const recovered = [
    ...recoverLeadsFromAllStorageKeys(),
    ...readLegacyLeadCollections(),
    ...readLegacyManualLeads(),
  ]
  const plumber = findPlumberLead(recovered)
  if (plumber) {
    return mergePersistedLeads(leads, [plumber])
  }

  const seeded = enrichLead(createManualLead(PLUMBER_SEED))
  console.info('[bs-hunter] Seeded missing plumber lead into canonical store.')
  return mergePersistedLeads(leads, [seeded])
}

function notifyLeadPersistenceChange() {
  try {
    window.dispatchEvent(new CustomEvent(LEAD_PERSISTENCE_CHANGE_EVENT))
  } catch {
    // Event dispatch is best-effort in restricted environments.
  }
}

export function subscribeToLeadPersistenceChanges(callback) {
  function handleStorage(event) {
    if (event.key === REAL_LEADS_STORAGE_KEY || LEGACY_LEAD_STORAGE_KEYS.includes(event.key)) {
      callback()
    }
  }

  window.addEventListener(LEAD_PERSISTENCE_CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(LEAD_PERSISTENCE_CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorage)
  }
}

function migrateLegacyLeadStores(leads = []) {
  const legacyLeads = readLegacyLeadCollections()
  if (!legacyLeads.length) return leads

  const merged = mergePersistedLeads(legacyLeads, leads)
  savePersistedLeads(merged, { notify: false })

  for (const key of LEGACY_LEAD_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Legacy cleanup is best-effort once merged into the canonical store.
    }
  }

  return merged
}

function migrateRelatedEntities(leads = []) {
  try {
    migrateAllLeadRelations(leads)
    scanOrphanCrmKeys(leads)
  } catch (error) {
    console.error('[bs-hunter] Lead relation migration failed:', error)
  }
}

/** Loads every real lead from the canonical store and migrates legacy keys without duplicates. */
export function loadPersistedLeads() {
  try {
    const migrationResult = runLeadCategoryMigrationOnce()
    const batchMigrationResult = runLeadBatchMigrationOnce()
    const salesTrackingMigrationResult = runLeadSalesTrackingMigrationOnce()
    const primary = readPrimaryLeads()
    const recovered = recoverLeadsFromAllStorageKeys()
    const legacyPool = mergePersistedLeads([], [...readLegacyManualLeads(), ...recovered])
    const merged = migrateLegacyLeadStores(mergePersistedLeads(legacyPool, primary))
    let normalized = ensurePlumberLeadInCanonicalStore(merged.map(enrichLead))

    const categoryWrote = migrationResult?.migrated > 0 && migrationResult?.alreadyMigrated !== true
    const batchWrote = batchMigrationResult?.migrated > 0 && batchMigrationResult?.alreadyMigrated !== true
    const salesTrackingWrote = salesTrackingMigrationResult?.migrated > 0
      && salesTrackingMigrationResult?.alreadyMigrated !== true

    if (
      categoryWrote
      || batchWrote
      || salesTrackingWrote
      || normalized.length !== primary.length
      || JSON.stringify(normalized) !== JSON.stringify(primary)
    ) {
      normalized = savePersistedLeads(normalized, {
        notify: categoryWrote || batchWrote || salesTrackingWrote,
      })
    }

    migrateRelatedEntities(normalized)
    ensureCrmRecordsForLeads(normalized)
    return normalized
  } catch (error) {
    console.error('[bs-hunter] Failed to load persisted leads:', error)
    try {
      const fallback = ensurePlumberLeadInCanonicalStore(readPrimaryLeads())
      if (fallback.length) savePersistedLeads(fallback, { notify: false })
      return fallback
    } catch {
      return []
    }
  }
}

export function savePersistedLeads(leads = [], { notify = true } = {}) {
  const realLeads = leads.filter((lead) => !isDemoLead(lead)).map(enrichLead)
  const payload = JSON.stringify(realLeads)

  try {
    window.localStorage.setItem(REAL_LEADS_STORAGE_KEY, payload)
    if (window.localStorage.getItem(REAL_LEADS_STORAGE_KEY) !== payload) {
      throw new Error('Lead storage verification failed.')
    }
    if (notify) notifyLeadPersistenceChange()
    return realLeads
  } catch (error) {
    console.error('[bs-hunter] Failed to persist real leads:', error)
    return realLeads
  }
}

export function mergePersistedLeads(existingLeads = [], incomingLeads = []) {
  const merged = [...existingLeads.filter((lead) => !isDemoLead(lead)).map(enrichLead)]

  for (const incoming of incomingLeads) {
    if (isDemoLead(incoming)) continue

    const nextLead = enrichLead({ ...incoming, isDemo: false })
    const duplicateIndex = findDuplicateLeadIndex(nextLead, merged)

    if (duplicateIndex >= 0) {
      const current = merged[duplicateIndex]
      merged[duplicateIndex] = enrichLead({
        ...current,
        ...nextLead,
        id: current.id || nextLead.id,
        placeId: current.placeId || nextLead.placeId,
        createdAt: current.createdAt || nextLead.createdAt,
      })
      continue
    }

    merged.push(enrichLead({
      ...nextLead,
      createdAt: nextLead.createdAt || new Date().toISOString(),
    }))
  }

  return merged
}

export function persistLeadCollection(leads = []) {
  const legacyPool = mergePersistedLeads([], readLegacyLeadCollections())
  const anchor = mergePersistedLeads(legacyPool, readPrimaryLeads())
  const incoming = leads.filter((lead) => !isDemoLead(lead))
  const merged = incoming.length ? mergePersistedLeads(anchor, incoming) : anchor
  const saved = savePersistedLeads(merged.length ? merged : anchor)
  migrateRelatedEntities(saved)
  ensureCrmRecordsForLeads(saved)
  return saved
}

export function addPersistedLead(_existingLeads = [], lead, { notes = '', images = [] } = {}) {
  const persisted = loadPersistedLeads()
  const nextLead = enrichLead({ ...lead, isDemo: false })

  if (isDuplicatePhoneLead(nextLead, persisted)) {
    return { ok: false, reason: 'duplicate-phone' }
  }
  if (isDuplicateManualLead(nextLead, persisted)) {
    return { ok: false, reason: 'duplicate-lead' }
  }

  const saved = persistLeadCollection(mergePersistedLeads(persisted, [nextLead]))
  const crmNotes = String(notes || '').trim()
  const leadId = getLeadId(nextLead)

  if (crmNotes && leadId) {
    saveLeadCrm(leadId, { ...loadLeadCrm(leadId), notes: crmNotes })
  }

  if (images.length && leadId) {
    try {
      addImagesToLeadMediaLibrary(leadId, images)
    } catch {
      return { ok: true, leads: saved, mediaWarning: true }
    }
  }

  return { ok: true, leads: saved }
}

function buildUpdatedLead(current = {}, leadUpdates = {}) {
  const ratingValue = leadUpdates.rating ?? current.rating
  const reviewsValue = leadUpdates.reviewsCount ?? current.reviewsCount
  const rating = ratingValue === '' || ratingValue === null || ratingValue === undefined ? null : Number(ratingValue)
  const reviewsCount = reviewsValue === '' || reviewsValue === null || reviewsValue === undefined ? null : Number(reviewsValue)

  const nextLead = enrichLead({
    ...current,
    ...pickSalesTrackingUpdates(leadUpdates),
    businessName: cleanText(leadUpdates.businessName ?? current.businessName),
    category: cleanText(leadUpdates.category ?? current.category),
    city: cleanText(leadUpdates.city ?? current.city),
    address: cleanText(leadUpdates.address ?? current.address),
    phone: cleanText(leadUpdates.phone ?? current.phone),
    website: cleanText(leadUpdates.website ?? current.website),
    mapsUrl: cleanText(leadUpdates.mapsUrl ?? current.mapsUrl),
    source: cleanText(leadUpdates.source ?? current.source),
    rating: Number.isFinite(rating) ? rating : null,
    reviewsCount: Number.isFinite(reviewsCount) ? reviewsCount : null,
    id: current.id,
    placeId: current.placeId,
    createdAt: current.createdAt,
    isDemo: false,
  })

  return { ...nextLead, leadScore: calculateLeadScore(nextLead) }
}

export function updatePersistedLead(leadId, leadUpdates = {}, { crm = {} } = {}) {
  const persisted = loadPersistedLeads()
  const index = persisted.findIndex((lead) => getLeadId(lead) === leadId)
  if (index < 0) return { ok: false, reason: 'not-found' }

  const current = persisted[index]
  const nextLead = buildUpdatedLead(current, leadUpdates)
  const others = persisted.filter((_, itemIndex) => itemIndex !== index)

  if (isDuplicatePhoneLead(nextLead, others)) {
    return { ok: false, reason: 'duplicate-phone' }
  }
  if (isDuplicateManualLead(nextLead, others)) {
    return { ok: false, reason: 'duplicate-lead' }
  }

  const saved = persistLeadCollection(persisted.map((lead, itemIndex) => (itemIndex === index ? nextLead : lead)))

  const existingCrm = loadLeadCrm(leadId)
  const nextCrm = {
    ...existingCrm,
    notes: crm.notes ?? existingCrm.notes,
    nextFollowUp: crm.nextFollowUp ?? existingCrm.nextFollowUp,
    status: crm.status ?? existingCrm.status,
  }

  if (crm.status && crm.status !== existingCrm.status) {
    nextCrm.stageChangedAt = new Date().toISOString()
    nextCrm.archived = crm.status === 'lost'
  }

  saveLeadCrm(leadId, nextCrm)

  return { ok: true, leads: saved, lead: nextLead }
}

/** Development helper: reports whether the known plumber lead exists in any lead storage key. */
export function findRecoveredPlumberLead() {
  const canonical = readJsonArray(REAL_LEADS_STORAGE_KEY)
  const legacy = LEGACY_LEAD_STORAGE_KEYS.flatMap((key) => readJsonArray(key))
  const recovered = recoverLeadsFromAllStorageKeys()
  const all = [...canonical, ...legacy, ...recovered]
  return findPlumberLead(all)
}

/**
 * Development-only persistence verification:
 * add one lead, reload from storage, confirm CRM selector sees it, then remove the test lead.
 */
export function verifyLeadPersistence() {
  if (!import.meta.env.DEV) {
    return { ok: false, reason: 'verifyLeadPersistence is development-only.' }
  }

  const marker = `__bs-hunter-persistence-verify-${Date.now()}`
  const testPhone = `050${String(Date.now()).slice(-7)}`
  const testLead = createManualLead({
    businessName: marker,
    category: 'Verification',
    city: 'Test',
    address: '1 Verify Street',
    phone: testPhone,
    website: '',
    rating: '',
    reviewsCount: '',
    source: 'Persistence Verify',
    mapsUrl: '',
  })

  const beforeCount = loadPersistedLeads().length
  const added = addPersistedLead([], testLead)
  if (!added.ok) {
    return { ok: false, reason: `addPersistedLead failed: ${added.reason || 'unknown'}` }
  }

  const reloaded = loadPersistedLeads()
  const found = reloaded.find((lead) => lead.businessName === marker)
  if (!found) {
    return { ok: false, reason: 'Lead missing after reload from bs-hunter-real-leads.' }
  }

  const resolvedLeadId = getLeadId(found)
  const crmRecord = loadLeadCrm(resolvedLeadId)
  const pipelineReady = Boolean(crmRecord.status)

  const withoutTest = reloaded.filter((lead) => lead.businessName !== marker)
  savePersistedLeads(withoutTest)
  const afterCleanup = loadPersistedLeads().length

  return {
    ok: pipelineReady && afterCleanup === beforeCount,
    marker,
    leadId: resolvedLeadId,
    beforeCount,
    afterReloadCount: reloaded.length,
    afterCleanupCount: afterCleanup,
    plumberRecovered: Boolean(findRecoveredPlumberLead()),
  }
}
