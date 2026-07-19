// One-time migration: persist businessType/category for existing leads in bs-hunter-real-leads.
import { isDemoLead } from '../components/BusinessOS/dashboardFilters'
import {
  BUSINESS_TYPE_GROUPS,
  UNCLASSIFIED_ID,
  applyDetectedCategoryFields,
  categoryCandidateValues,
  detectBusinessTypeGroup,
  leadNeedsCategoryMigration,
} from './leadCategory'

export const LEAD_CATEGORY_MIGRATION_KEY = 'bs-hunter-lead-category-migration-v2'
export const LEAD_CATEGORY_MIGRATION_RESULT_KEY = 'bs-hunter-lead-category-migration-v2-result'
const REAL_LEADS_STORAGE_KEY = 'bs-hunter-real-leads'
const LEAD_PERSISTENCE_CHANGE_EVENT = 'bs-hunter-lead-persistence-change'

function readRawLeads() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(REAL_LEADS_STORAGE_KEY))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function notifyLeadPersistenceChange() {
  try {
    window.dispatchEvent(new CustomEvent(LEAD_PERSISTENCE_CHANGE_EVENT))
  } catch {
    // Best-effort only.
  }
}

/** Runs once per browser profile. Updates lead records only — never CRM, actions, or demos. */
export function runLeadCategoryMigrationOnce() {
  if (window.localStorage.getItem(LEAD_CATEGORY_MIGRATION_KEY)) {
    try {
      const cached = JSON.parse(window.localStorage.getItem(LEAD_CATEGORY_MIGRATION_RESULT_KEY) || 'null')
      if (cached?.ok && cached.migrated > 0) return { ...cached, alreadyMigrated: true }
    } catch {
      // Fall through and attempt migration again when the cached result is invalid.
    }
  }

  const rawLeads = readRawLeads()
  const counts = Object.fromEntries([
    ...BUSINESS_TYPE_GROUPS.map((group) => [group.id, 0]),
    [UNCLASSIFIED_ID, 0],
  ])
  let migrated = 0

  const nextLeads = rawLeads.map((lead) => {
    if (isDemoLead(lead)) return lead

    const before = JSON.stringify(lead)
    const updated = applyDetectedCategoryFields(lead)
    if (JSON.stringify(updated) !== before) migrated += 1

    const group = detectBusinessTypeGroup(updated)
    const bucket = group?.id || UNCLASSIFIED_ID
    counts[bucket] = (counts[bucket] || 0) + 1
    return updated
  })

  const realTotal = nextLeads.filter((lead) => !isDemoLead(lead)).length
  const payload = JSON.stringify(nextLeads)

  try {
    window.localStorage.setItem(REAL_LEADS_STORAGE_KEY, payload)
    if (window.localStorage.getItem(REAL_LEADS_STORAGE_KEY) !== payload) {
      throw new Error('Lead category migration storage verification failed.')
    }
  } catch (error) {
    console.error('[bs-hunter] Lead category migration failed to save:', error)
    return { ok: false, total: realTotal, migrated: 0, counts, error: String(error?.message || error) }
  }

  const result = {
    ok: true,
    alreadyMigrated: false,
    total: realTotal,
    migrated,
    counts,
    completedAt: new Date().toISOString(),
  }

  if (migrated > 0) {
    window.localStorage.setItem(LEAD_CATEGORY_MIGRATION_KEY, result.completedAt)
    window.localStorage.setItem(LEAD_CATEGORY_MIGRATION_RESULT_KEY, JSON.stringify(result))
  }

  if (migrated > 0) notifyLeadPersistenceChange()

  if (import.meta.env.DEV || migrated > 0) {
    console.info('[bs-hunter] Lead category migration complete:', result)
  }

  return result
}

/** Development helper: inspect what would be detected without writing storage. */
export function previewLeadCategoryMigration(leads = readRawLeads()) {
  const counts = Object.fromEntries([
    ...BUSINESS_TYPE_GROUPS.map((group) => [group.id, 0]),
    [UNCLASSIFIED_ID, 0],
  ])
  let wouldMigrate = 0

  for (const lead of leads) {
    if (isDemoLead(lead)) continue
    if (leadNeedsCategoryMigration(lead)) wouldMigrate += 1
    const group = detectBusinessTypeGroup(applyDetectedCategoryFields(lead))
    const bucket = group?.id || UNCLASSIFIED_ID
    counts[bucket] = (counts[bucket] || 0) + 1
  }

  return {
    total: leads.filter((lead) => !isDemoLead(lead)).length,
    wouldMigrate,
    counts,
    sampleFields: leads.slice(0, 3).map((lead) => categoryCandidateValues(lead)),
  }
}
