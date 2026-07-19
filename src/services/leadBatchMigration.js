// One-time migration: persist import batch metadata for existing leads in bs-hunter-real-leads.
import { isDemoLead } from '../components/BusinessOS/dashboardFilters'
import {
  applyLegacyBatchFields,
  leadNeedsBatchMigration,
  resolveLeadBatchId,
} from './leadCategory'

export const LEAD_BATCH_MIGRATION_KEY = 'bs-hunter-lead-batch-migration-v1'
export const LEAD_BATCH_MIGRATION_RESULT_KEY = 'bs-hunter-lead-batch-migration-v1-result'
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

/** Runs once per browser profile. Updates lead batch metadata only — never CRM, actions, or demos. */
export function runLeadBatchMigrationOnce() {
  if (window.localStorage.getItem(LEAD_BATCH_MIGRATION_KEY)) {
    try {
      const cached = JSON.parse(window.localStorage.getItem(LEAD_BATCH_MIGRATION_RESULT_KEY) || 'null')
      if (cached?.ok && cached.migrated > 0) return { ...cached, alreadyMigrated: true }
    } catch {
      // Fall through and attempt migration again when the cached result is invalid.
    }
  }

  const rawLeads = readRawLeads()
  const batchCounts = new Map()
  let migrated = 0
  const hadPendingMigration = rawLeads.some((lead) => !isDemoLead(lead) && leadNeedsBatchMigration(lead))

  const nextLeads = rawLeads.map((lead) => {
    if (isDemoLead(lead)) return lead

    const before = JSON.stringify(lead)
    const updated = leadNeedsBatchMigration(lead) ? applyLegacyBatchFields(lead) : lead
    if (JSON.stringify(updated) !== before) migrated += 1

    const batchId = resolveLeadBatchId(updated)
    batchCounts.set(batchId, (batchCounts.get(batchId) || 0) + 1)
    return updated
  })

  const realTotal = nextLeads.filter((lead) => !isDemoLead(lead)).length
  const payload = JSON.stringify(nextLeads)

  try {
    window.localStorage.setItem(REAL_LEADS_STORAGE_KEY, payload)
    if (window.localStorage.getItem(REAL_LEADS_STORAGE_KEY) !== payload) {
      throw new Error('Lead batch migration storage verification failed.')
    }
  } catch (error) {
    console.error('[bs-hunter] Lead batch migration failed to save:', error)
    return { ok: false, total: realTotal, migrated: 0, uniqueBatches: 0, error: String(error?.message || error) }
  }

  const result = {
    ok: true,
    alreadyMigrated: false,
    total: realTotal,
    migrated,
    uniqueBatches: batchCounts.size,
    completedAt: new Date().toISOString(),
  }

  if (migrated > 0 || !hadPendingMigration) {
    window.localStorage.setItem(LEAD_BATCH_MIGRATION_KEY, result.completedAt)
    window.localStorage.setItem(LEAD_BATCH_MIGRATION_RESULT_KEY, JSON.stringify(result))
  }

  if (migrated > 0) notifyLeadPersistenceChange()

  if (import.meta.env.DEV || migrated > 0) {
    console.info('[bs-hunter] Lead batch migration complete:', result)
  }

  return result
}
