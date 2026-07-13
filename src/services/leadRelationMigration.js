// Migrates CRM, actions, proposals, media, demos, and website projects onto LeadID keys.
import { DEFAULT_CRM_RECORD } from '../components/LeadCRM/crmStorage'
import { REAL_WEBSITE_STORAGE_KEY, businessMediaStorageKey, legacyMediaKeysForBusinessName, leadMediaStorageKey } from '../components/RealWebsiteBuilder/realWebsiteStorage'
import { DEMO_STORAGE_PREFIX } from '../components/WebsiteBuilder/demoStorage'
import { collectLegacyRelationKeys, getLeadId, getLegacyProposalKey } from './leadId'

const CRM_PREFIX = 'bs-hunter-crm:'
const ACTION_KEY = 'bs-hunter-lead-action-history'
const PROPOSAL_PREFIX = 'bs-finder-proposal:'

function readJson(key, fallback = null) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function mergeCrmRecords(...records) {
  const merged = { ...DEFAULT_CRM_RECORD }
  for (const record of records) {
    if (!record) continue
    Object.assign(merged, record)
    if (record.notes) merged.notes = record.notes
    if (record.status) merged.status = record.status
    if (record.nextFollowUp) merged.nextFollowUp = record.nextFollowUp
    if (record.proposalAmount) merged.proposalAmount = record.proposalAmount
    if (record.dealAmount) merged.dealAmount = record.dealAmount
    if (record.stageChangedAt) merged.stageChangedAt = record.stageChangedAt
    if (record.updatedAt) merged.updatedAt = record.updatedAt
  }
  return merged
}

function mergeMediaItems(...collections) {
  const seen = new Set()
  const next = []
  collections.flat().forEach((item) => {
    if (!item?.dataUrl) return
    const id = item.libraryId || item.id || item.dataUrl
    if (seen.has(id)) return
    seen.add(id)
    next.push(item)
  })
  return next
}

function migrateCrmRecord(lead) {
  const leadId = getLeadId(lead)
  if (!leadId) return

  const current = readJson(`${CRM_PREFIX}${leadId}`, null)
  const legacyRecords = collectLegacyRelationKeys(lead)
    .map((key) => readJson(`${CRM_PREFIX}${key}`, null))
    .filter(Boolean)

  if (!legacyRecords.length && current) return

  const merged = mergeCrmRecords(current, ...legacyRecords)
  window.localStorage.setItem(`${CRM_PREFIX}${leadId}`, JSON.stringify({ ...merged, updatedAt: merged.updatedAt || new Date().toISOString() }))

  for (const key of collectLegacyRelationKeys(lead)) {
    try { window.localStorage.removeItem(`${CRM_PREFIX}${key}`) } catch { /* ignore */ }
  }
}

function migrateActionHistory(lead) {
  const leadId = getLeadId(lead)
  if (!leadId) return

  const history = readJson(ACTION_KEY, {})
  if (!history || typeof history !== 'object') return

  let changed = false
  const mergedActions = [...(history[leadId] || [])]

  for (const key of collectLegacyRelationKeys(lead)) {
    if (!history[key]?.length) continue
    mergedActions.push(...history[key])
    delete history[key]
    changed = true
  }

  if (changed || (mergedActions.length && !history[leadId]?.length)) {
    history[leadId] = mergedActions
    window.localStorage.setItem(ACTION_KEY, JSON.stringify(history))
  }
}

function migrateProposalRecords(lead) {
  const leadId = getLeadId(lead)
  if (!leadId) return

  const targetBase = `${PROPOSAL_PREFIX}${leadId}`
  const legacyBase = `${PROPOSAL_PREFIX}${getLegacyProposalKey(lead)}`

  for (const suffix of ['', ':draft']) {
    const targetKey = `${targetBase}${suffix}`
    const legacyKey = `${legacyBase}${suffix}`
    if (legacyKey === targetKey) continue
    const legacy = readJson(legacyKey, null)
    if (!legacy) continue
    if (!readJson(targetKey, null)) {
      window.localStorage.setItem(targetKey, JSON.stringify(legacy))
    }
    try { window.localStorage.removeItem(legacyKey) } catch { /* ignore */ }
  }

  for (const key of collectLegacyRelationKeys(lead)) {
    for (const suffix of ['', ':draft']) {
      const legacyKey = `${PROPOSAL_PREFIX}${key}${suffix}`
      if (legacyKey.startsWith(targetBase)) continue
      const legacy = readJson(legacyKey, null)
      if (!legacy) continue
      const targetKey = `${targetBase}${suffix}`
      if (!readJson(targetKey, null)) {
        window.localStorage.setItem(targetKey, JSON.stringify(legacy))
      }
      try { window.localStorage.removeItem(legacyKey) } catch { /* ignore */ }
    }
  }
}

function migrateMediaLibrary(lead) {
  const leadId = getLeadId(lead)
  if (!leadId) return

  const targetKey = leadMediaStorageKey(leadId)
  const current = readJson(targetKey, [])
  const legacyKeys = [
    businessMediaStorageKey(lead.businessName || lead.name || ''),
    ...legacyMediaKeysForBusinessName(lead.businessName || lead.name || ''),
  ]

  const migrated = mergeMediaItems(current, ...legacyKeys.map((key) => readJson(key, [])))
  if (!migrated.length) return

  window.localStorage.setItem(targetKey, JSON.stringify(migrated))
  for (const key of legacyKeys) {
    if (key === targetKey) continue
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
  }
}

function demoIdForLegacy(business = {}) {
  let result = 2166136261
  const source = String(business.placeId || business.id || `${business.businessName || business.name || 'business'}|${business.phone || ''}|${business.address || ''}`)
  for (const character of source) {
    result ^= character.charCodeAt(0)
    result = Math.imul(result, 16777619)
  }
  const slug = String(business.businessName || business.name || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 36) || 'business'
  return `${slug}-${(result >>> 0).toString(36)}`
}

function migrateDemoRecord(lead) {
  const leadId = getLeadId(lead)
  if (!leadId) return

  const targetKey = `${DEMO_STORAGE_PREFIX}lead-${leadId}`
  if (readJson(targetKey, null)) return

  const legacyIds = new Set([demoIdForLegacy(lead)])
  collectLegacyRelationKeys(lead).forEach((key) => legacyIds.add(key))

  for (const id of legacyIds) {
    const legacy = readJson(`${DEMO_STORAGE_PREFIX}${id}`, null)
    if (!legacy) continue
    window.localStorage.setItem(targetKey, JSON.stringify({ ...legacy, leadId, id: `lead-${leadId}` }))
    try { window.localStorage.removeItem(`${DEMO_STORAGE_PREFIX}${id}`) } catch { /* ignore */ }
    return
  }
}

function migrateRealWebsiteProjects(leads = []) {
  const projects = readJson(REAL_WEBSITE_STORAGE_KEY, [])
  if (!Array.isArray(projects) || !projects.length) return

  const byName = new Map(
    leads.map((lead) => [String(lead.businessName || '').trim().toLowerCase(), getLeadId(lead)]),
  )

  let changed = false
  const next = projects.map((project) => {
    if (project.leadId) return project
    const name = String(project.customer?.businessName || '').trim().toLowerCase()
    const leadId = byName.get(name)
    if (!leadId) return project
    changed = true
    return {
      ...project,
      leadId,
      customer: { ...project.customer, leadId },
    }
  })

  if (changed) {
    window.localStorage.setItem(REAL_WEBSITE_STORAGE_KEY, JSON.stringify(next))
  }
}

export function migrateLeadRelations(lead) {
  if (!lead || !getLeadId(lead)) return
  migrateCrmRecord(lead)
  migrateActionHistory(lead)
  migrateProposalRecords(lead)
  migrateMediaLibrary(lead)
  migrateDemoRecord(lead)
}

export function migrateAllLeadRelations(leads = []) {
  for (const lead of leads) {
    migrateLeadRelations(lead)
  }
  migrateRealWebsiteProjects(leads)
}

export function scanOrphanCrmKeys(leads = []) {
  const validIds = new Set(leads.map((lead) => getLeadId(lead)).filter(Boolean))
  const legacyMap = new Map()
  for (const lead of leads) {
    for (const key of collectLegacyRelationKeys(lead)) {
      legacyMap.set(key, getLeadId(lead))
    }
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(CRM_PREFIX)) continue
    const storageKey = key.slice(CRM_PREFIX.length)
    if (validIds.has(storageKey)) continue
    const targetLeadId = legacyMap.get(storageKey)
    if (!targetLeadId) continue
    const legacy = readJson(key, null)
    if (!legacy) continue
    const current = readJson(`${CRM_PREFIX}${targetLeadId}`, null)
    window.localStorage.setItem(
      `${CRM_PREFIX}${targetLeadId}`,
      JSON.stringify(mergeCrmRecords(current, legacy)),
    )
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
  }
}
