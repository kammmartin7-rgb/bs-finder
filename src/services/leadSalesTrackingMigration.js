// One-time migration: persist sales tracking defaults on existing leads in bs-hunter-real-leads.
import { isDemoLead } from '../components/BusinessOS/dashboardFilters'
import {
  applyLeadSalesTrackingFields,
  leadNeedsSalesTrackingMigration,
} from './leadSalesTracking'

export const LEAD_SALES_TRACKING_MIGRATION_KEY = 'bs-hunter-lead-sales-tracking-migration-v1'
export const LEAD_SALES_TRACKING_MIGRATION_RESULT_KEY = 'bs-hunter-lead-sales-tracking-migration-v1-result'
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

/** Runs once per browser profile. Adds sales tracking fields only — never CRM, actions, or demos. */
export function runLeadSalesTrackingMigrationOnce() {
  if (window.localStorage.getItem(LEAD_SALES_TRACKING_MIGRATION_KEY)) {
    try {
      const cached = JSON.parse(window.localStorage.getItem(LEAD_SALES_TRACKING_MIGRATION_RESULT_KEY) || 'null')
      if (cached?.ok) return { ...cached, alreadyMigrated: true }
    } catch {
      // Fall through and attempt migration again when the cached result is invalid.
    }
  }

  const rawLeads = readRawLeads()
  let migrated = 0
  const hadPendingMigration = rawLeads.some((lead) => !isDemoLead(lead) && leadNeedsSalesTrackingMigration(lead))

  const nextLeads = rawLeads.map((lead) => {
    if (isDemoLead(lead)) return lead
    const before = JSON.stringify(lead)
    const updated = applyLeadSalesTrackingFields(lead)
    if (JSON.stringify(updated) !== before) migrated += 1
    return updated
  })

  const realTotal = nextLeads.filter((lead) => !isDemoLead(lead)).length
  const payload = JSON.stringify(nextLeads)

  try {
    window.localStorage.setItem(REAL_LEADS_STORAGE_KEY, payload)
    if (window.localStorage.getItem(REAL_LEADS_STORAGE_KEY) !== payload) {
      throw new Error('Lead sales tracking migration storage verification failed.')
    }
  } catch (error) {
    console.error('[bs-hunter] Lead sales tracking migration failed to save:', error)
    return { ok: false, total: realTotal, migrated: 0, error: String(error?.message || error) }
  }

  const result = {
    ok: true,
    alreadyMigrated: false,
    total: realTotal,
    migrated,
    completedAt: new Date().toISOString(),
  }

  if (migrated > 0 || !hadPendingMigration) {
    window.localStorage.setItem(LEAD_SALES_TRACKING_MIGRATION_KEY, result.completedAt)
    window.localStorage.setItem(LEAD_SALES_TRACKING_MIGRATION_RESULT_KEY, JSON.stringify(result))
  }

  if (migrated > 0) notifyLeadPersistenceChange()

  if (import.meta.env.DEV || migrated > 0) {
    console.info('[bs-hunter] Lead sales tracking migration complete:', result)
  }

  return result
}
