// Lead business-type normalization, import batch metadata, and CRM category filters.
import { isDemoLead } from '../components/BusinessOS/dashboardFilters'

export const ALL_LEADS_FILTER = '__all__'
export const ALL_BATCHES_FILTER = '__all_batches__'
export const ALL_BATCHES_LABEL = 'כל הייבואים'
export const LEGACY_BATCH_SUFFIX = 'ייבוא קודם'
export const UNKNOWN_CITY_LABEL = 'לא ידוע'
export const UNCLASSIFIED_ID = 'unclassified'
export const UNCLASSIFIED_STORAGE_LABEL = 'לא מסווג'

export const BUSINESS_TYPE_GROUPS = [
  {
    id: 'dentist',
    filterLabel: 'Dentist',
    storageLabel: 'רופא שיניים',
    aliases: ['dentist', 'dentists', 'dental clinic', 'dental', 'מרפאת שיניים', 'רופא שיניים', 'שיניים', 'orthodont', 'dental care', 'orthodontist', 'dental implants provider', 'periodontist'],
  },
  {
    id: 'cosmetician',
    filterLabel: 'Cosmetician',
    storageLabel: 'קוסמטיקאית',
    aliases: ['cosmetician', 'cosmetics', 'beauty clinic', 'beauty salon', 'beauty', 'קוסמטיקאית', 'קוסמטיקה', 'אסתטיקה', 'aesthetic', 'skincare', 'cosmetics store', 'beauty product supplier', 'medical spa', 'facial spa', 'laser hair removal service'],
  },
  {
    id: 'plumber',
    filterLabel: 'Plumber',
    storageLabel: 'אינסטלטור',
    aliases: ['plumber', 'plumbing', 'אינסטלטור', 'אינסטלציה', 'plumbers', 'sanitary', 'plumbing supply store', 'drainage service'],
  },
]

/** @deprecated Use BUSINESS_TYPE_GROUPS map instead. */
export const KNOWN_HEBREW_CATEGORIES = BUSINESS_TYPE_GROUPS.map((group) => group.storageLabel)

/** @deprecated Use UNCLASSIFIED_STORAGE_LABEL instead. */
export const UNCLASSIFIED_CATEGORY = UNCLASSIFIED_STORAGE_LABEL

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function normalizeComparable(value) {
  return cleanText(value).toLowerCase()
}

function slugPart(value, max = 32) {
  return normalizeComparable(value)
    .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max) || 'unknown'
}

function batchLabelBusinessType(batchLabel) {
  const text = cleanText(batchLabel)
  if (!text) return ''
  return text.split('—').map((part) => part.trim())[0] || ''
}

export function categoryCandidateValues(lead = {}) {
  return [
    lead.businessType,
    lead.searchBusinessType,
    lead.category,
    lead.searchTerm,
    lead.query,
    lead.sourceCategory,
    lead.source,
    batchLabelBusinessType(lead.batchLabel),
  ].map(cleanText).filter(Boolean)
}

export function detectBusinessTypeGroup(lead = {}) {
  for (const group of BUSINESS_TYPE_GROUPS) {
    const businessType = cleanText(lead.businessType)
    const category = cleanText(lead.category)
    if (businessType === group.storageLabel || businessType === group.filterLabel) return group
    if (category === group.storageLabel || category === group.filterLabel) return group
  }

  for (const value of categoryCandidateValues(lead)) {
    const group = matchBusinessTypeGroup(value)
    if (group) return group
  }

  const businessName = normalizeComparable(lead.businessName || lead.name)
  if (businessName) {
    for (const group of BUSINESS_TYPE_GROUPS) {
      for (const alias of group.aliases) {
        const aliasComparable = normalizeComparable(alias)
        if (businessName.includes(aliasComparable)) return group
      }
    }
  }

  return null
}

export function leadNeedsCategoryMigration(lead = {}) {
  const group = detectBusinessTypeGroup(lead)
  if (group) {
    return cleanText(lead.businessType) !== group.storageLabel
      || cleanText(lead.category) !== group.filterLabel
  }

  return !cleanText(lead.category)
    || !cleanText(lead.businessType)
    || cleanText(lead.businessType) === UNCLASSIFIED_STORAGE_LABEL
}

export function applyDetectedCategoryFields(lead = {}) {
  const group = detectBusinessTypeGroup(lead)
  const next = { ...lead }
  const importedAt = cleanText(next.importedAt) || cleanText(next.createdAt) || cleanText(next.addedAt) || new Date().toISOString()

  if (group) {
    next.businessType = group.storageLabel
    next.category = group.filterLabel
  } else if (!cleanText(next.businessType)) {
    next.businessType = UNCLASSIFIED_STORAGE_LABEL
    if (!cleanText(next.category)) next.category = 'Unclassified'
  }

  if (!cleanText(next.city) && cleanText(next.searchedCity)) next.city = cleanText(next.searchedCity)
  if (!cleanText(next.country) && cleanText(next.searchedCountry)) next.country = cleanText(next.searchedCountry)
  if (!cleanText(next.importedAt)) next.importedAt = importedAt
  if (!cleanText(next.importedDate)) next.importedDate = formatImportedDate(importedAt)
  if (!cleanText(next.batchId)) next.batchId = createBatchId(next.businessType || 'unknown', next.city, importedAt)
  if (!cleanText(next.batchLabel)) next.batchLabel = buildBatchLabel(next.businessType, next.city, importedAt)

  return next
}

function matchBusinessTypeGroup(text) {
  const comparable = normalizeComparable(text)
  if (!comparable) return null

  for (const group of BUSINESS_TYPE_GROUPS) {
    if (cleanText(text) === group.storageLabel) return group
    for (const alias of group.aliases) {
      const aliasComparable = normalizeComparable(alias)
      if (comparable === aliasComparable || comparable.includes(aliasComparable) || aliasComparable.includes(comparable)) {
        return group
      }
    }
  }

  return null
}

export function resolveLeadCategoryId(lead = {}) {
  const group = detectBusinessTypeGroup(lead)
  if (group) return group.id

  const businessType = cleanText(lead.businessType)
  if (businessType && businessType !== UNCLASSIFIED_STORAGE_LABEL) {
    return slugPart(businessType, 48)
  }

  return UNCLASSIFIED_ID
}

export function resolveLeadCategory(lead = {}) {
  const group = BUSINESS_TYPE_GROUPS.find((item) => item.id === resolveLeadCategoryId(lead))
  if (group) return group.storageLabel

  const businessType = cleanText(lead.businessType)
  if (businessType && businessType !== UNCLASSIFIED_STORAGE_LABEL) return businessType
  return UNCLASSIFIED_STORAGE_LABEL
}

export function getBusinessTypeFilterLabel(categoryId) {
  if (categoryId === ALL_LEADS_FILTER) return 'All'
  if (categoryId === UNCLASSIFIED_ID) return 'Unclassified'
  const group = BUSINESS_TYPE_GROUPS.find((item) => item.id === categoryId)
  if (group) return group.filterLabel
  return categoryId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatImportedDate(importedAt = new Date().toISOString()) {
  const date = new Date(importedAt)
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date
  const dd = String(safeDate.getDate()).padStart(2, '0')
  const mm = String(safeDate.getMonth() + 1).padStart(2, '0')
  const yyyy = safeDate.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function createBatchId(businessType, city, importedAt = new Date().toISOString()) {
  const timestamp = new Date(importedAt).getTime()
  const safeTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now()
  return `${slugPart(businessType)}-${slugPart(city)}-${safeTimestamp}`
}

export function buildBatchLabel(businessType, city, importedAt = new Date().toISOString()) {
  const type = cleanText(businessType) || UNCLASSIFIED_STORAGE_LABEL
  const place = cleanText(city) || '—'
  return `${type} — ${place} — ${formatImportedDate(importedAt)}`
}

export function buildLegacyBatchLabel(businessType, city) {
  const type = cleanText(businessType) || UNCLASSIFIED_STORAGE_LABEL
  const place = cleanText(city) || UNKNOWN_CITY_LABEL
  return `${type} — ${place} — ${LEGACY_BATCH_SUFFIX}`
}

export function resolveLeadBatchId(lead = {}) {
  return cleanText(lead.batchId) || createBatchId(
    resolveLeadCategory(lead),
    lead.city || lead.searchedCity || UNKNOWN_CITY_LABEL,
    lead.importedAt || lead.createdAt || lead.addedAt || new Date().toISOString(),
  )
}

export function resolveLeadBatchLabel(lead = {}) {
  const existing = cleanText(lead.batchLabel)
  if (existing) return existing
  const businessType = resolveLeadCategory(lead)
  const city = cleanText(lead.city) || cleanText(lead.searchedCity)
  const importedAt = cleanText(lead.importedAt) || cleanText(lead.createdAt) || cleanText(lead.addedAt)
  if (businessType && (city || importedAt)) {
    return buildBatchLabel(businessType, city, importedAt || new Date().toISOString())
  }
  return buildLegacyBatchLabel(businessType, city)
}

export function createImportBatchContext(businessType, city, country = '') {
  const importedAt = new Date().toISOString()
  const importedDate = formatImportedDate(importedAt)
  const group = detectBusinessTypeGroup({ businessType })
  const resolvedBusinessType = group?.storageLabel || cleanText(businessType) || UNCLASSIFIED_STORAGE_LABEL
  const resolvedCity = cleanText(city)
  const resolvedCountry = cleanText(country)
  const batchId = createBatchId(resolvedBusinessType, resolvedCity, importedAt)
  const batchLabel = buildBatchLabel(resolvedBusinessType, resolvedCity, importedAt)
  return {
    batchId,
    batchLabel,
    businessType: resolvedBusinessType,
    city: resolvedCity,
    country: resolvedCountry,
    importedAt,
    importedDate,
    source: 'Apify',
  }
}

export function applyLegacyBatchFields(lead = {}) {
  const next = { ...lead }
  const businessType = cleanText(next.businessType) || resolveLeadCategory(next)
  const city = cleanText(next.city) || cleanText(next.searchedCity)
  const importedAt = cleanText(next.importedAt) || cleanText(next.createdAt) || cleanText(next.addedAt) || new Date().toISOString()

  next.businessType = businessType
  if (!cleanText(next.city) && city) next.city = city
  if (!cleanText(next.importedAt)) next.importedAt = importedAt
  if (!cleanText(next.importedDate)) next.importedDate = formatImportedDate(importedAt)
  if (!cleanText(next.batchId)) next.batchId = createBatchId(businessType, city, importedAt)

  if (!cleanText(next.batchLabel)) {
    next.batchLabel = businessType && (city || importedAt)
      ? buildBatchLabel(businessType, city, importedAt)
      : buildLegacyBatchLabel(businessType, city)
  }

  next.legacyBatch = true
  return next
}

export function leadNeedsBatchMigration(lead = {}) {
  if (isDemoLead(lead)) return false
  if (lead.legacyBatch === true) return false
  if (cleanText(lead.source) === 'Apify' && cleanText(lead.batchLabel) && cleanText(lead.batchId) && cleanText(lead.importedDate)) {
    return false
  }
  return !cleanText(lead.batchLabel)
    || !cleanText(lead.batchId)
    || !cleanText(lead.importedDate)
    || lead.legacyBatch !== false
}

export function enrichLeadCategory(lead = {}) {
  return applyDetectedCategoryFields(lead)
}

export function getCategoryFilterOptions(leads = []) {
  const realLeads = leads.filter((lead) => !isDemoLead(lead))
  const counts = new Map()

  for (const lead of realLeads) {
    const categoryId = resolveLeadCategoryId(lead)
    counts.set(categoryId, (counts.get(categoryId) || 0) + 1)
  }

  const options = [{ id: ALL_LEADS_FILTER, label: 'All', count: realLeads.length }]
  const used = new Set()

  for (const group of BUSINESS_TYPE_GROUPS) {
    const count = counts.get(group.id) || 0
    if (count > 0) {
      options.push({ id: group.id, label: group.filterLabel, count })
      used.add(group.id)
    }
  }

  const dynamicCategories = [...counts.entries()]
    .filter(([categoryId]) => !used.has(categoryId) && categoryId !== UNCLASSIFIED_ID)
    .sort((a, b) => getBusinessTypeFilterLabel(a[0]).localeCompare(getBusinessTypeFilterLabel(b[0]), 'en'))

  for (const [categoryId, count] of dynamicCategories) {
    options.push({ id: categoryId, label: getBusinessTypeFilterLabel(categoryId), count })
  }

  const unclassifiedCount = counts.get(UNCLASSIFIED_ID) || 0
  if (unclassifiedCount > 0) {
    options.push({ id: UNCLASSIFIED_ID, label: 'Unclassified', count: unclassifiedCount })
  }

  return options
}

export function getBatchFilterOptions(leads = []) {
  const realLeads = leads.filter((lead) => !isDemoLead(lead))
  const batchMap = new Map()

  for (const lead of realLeads) {
    const batchId = resolveLeadBatchId(lead)
    const batchLabel = resolveLeadBatchLabel(lead)
    const importedAt = cleanText(lead.importedAt) || cleanText(lead.createdAt) || cleanText(lead.addedAt) || ''
    const existing = batchMap.get(batchId)

    if (existing) {
      existing.count += 1
      if (!existing.label && batchLabel) existing.label = batchLabel
      if (!existing.importedAt && importedAt) existing.importedAt = importedAt
      continue
    }

    batchMap.set(batchId, { id: batchId, label: batchLabel, count: 1, importedAt })
  }

  const batches = [...batchMap.values()].sort((a, b) => {
    const dateCompare = String(b.importedAt).localeCompare(String(a.importedAt))
    if (dateCompare) return dateCompare
    return a.label.localeCompare(b.label, 'he')
  })

  return [
    { id: ALL_BATCHES_FILTER, label: ALL_BATCHES_LABEL, count: realLeads.length },
    ...batches.map(({ id, label, count }) => ({ id, label, count })),
  ]
}

export function summarizeLeadCategories(leads = []) {
  const realLeads = leads.filter((lead) => !isDemoLead(lead))
  const counts = {}

  for (const lead of realLeads) {
    const categoryId = resolveLeadCategoryId(lead)
    counts[categoryId] = (counts[categoryId] || 0) + 1
  }

  return {
    total: realLeads.length,
    counts,
    unclassified: counts[UNCLASSIFIED_ID] || 0,
  }
}
