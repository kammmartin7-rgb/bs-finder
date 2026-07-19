import { isDemoLead } from '../BusinessOS/dashboardFilters'
import {
  ALL_BATCHES_FILTER,
  ALL_LEADS_FILTER,
  BUSINESS_TYPE_GROUPS,
  getBatchFilterOptions,
  getCategoryFilterOptions,
  resolveLeadBatchId,
  resolveLeadCategory,
  resolveLeadCategoryId,
  UNCLASSIFIED_ID,
  UNCLASSIFIED_STORAGE_LABEL,
} from '../../services/leadCategory'

export const ALL_CITIES_FILTER = '__all_cities__'
export const PIPELINE_FILTER_PRESETS = {
  ALL: 'all',
  NO_WEBSITE: 'no-website',
  WITH_WEBSITE: 'with-website',
  WITH_PHONE: 'with-phone',
}

export const PIPELINE_SORT_OPTIONS = {
  SCORE_DESC: 'score-desc',
  SCORE_ASC: 'score-asc',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  NAME_ASC: 'name-asc',
}

export const DEFAULT_PIPELINE_FILTERS = {
  preset: PIPELINE_FILTER_PRESETS.ALL,
  category: ALL_LEADS_FILTER,
  city: ALL_CITIES_FILTER,
  batch: ALL_BATCHES_FILTER,
  sort: '',
}

function cleanText(value) {
  return String(value || '').trim()
}

export function hasValidWebsite(lead = {}) {
  const website = cleanText(lead.website)
  if (!website || website === '-' || website === '—') return false
  if (/^https?:\/\//i.test(website)) return true
  return /^[\w.-]+\.[a-z]{2,}/i.test(website)
}

export function hasPhoneNumber(lead = {}) {
  const digits = String(lead.phone || '').replace(/\D/g, '')
  return digits.length >= 7
}

export function resolveLeadCity(lead = {}) {
  return cleanText(lead.city) || cleanText(lead.searchedCity)
}

export function pipelineHasLeadScores(leads = []) {
  return leads.some((lead) => !isDemoLead(lead) && Number.isFinite(Number(lead.leadScore)))
}

export function isPipelineFiltersActive(filters = DEFAULT_PIPELINE_FILTERS) {
  return filters.preset !== PIPELINE_FILTER_PRESETS.ALL
    || filters.category !== ALL_LEADS_FILTER
    || filters.city !== ALL_CITIES_FILTER
    || filters.batch !== ALL_BATCHES_FILTER
    || Boolean(filters.sort)
}

export function getPipelineCategoryOptions(leads = []) {
  return getCategoryFilterOptions(leads)
    .filter((option) => option.id !== ALL_LEADS_FILTER)
    .map((option) => {
      const group = BUSINESS_TYPE_GROUPS.find((item) => item.id === option.id)
      const label = group?.storageLabel
        || (option.id === UNCLASSIFIED_ID ? UNCLASSIFIED_STORAGE_LABEL : resolveLeadCategory({ businessType: option.label }))
      return { id: option.id, label, count: option.count }
    })
}

export function getPipelineCityOptions(leads = []) {
  const counts = new Map()
  for (const lead of leads) {
    if (isDemoLead(lead)) continue
    const city = resolveLeadCity(lead)
    if (!city) continue
    counts.set(city, (counts.get(city) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'he'))
    .map(([city, count]) => ({ id: city, label: city, count }))
}

export function getPipelineBatchOptions(leads = []) {
  return getBatchFilterOptions(leads).filter((option) => option.id !== ALL_BATCHES_FILTER)
}

export function applyPipelineFilters(views = [], filters = DEFAULT_PIPELINE_FILTERS) {
  return views.filter((view) => {
    const lead = view.lead || {}

    if (filters.preset === PIPELINE_FILTER_PRESETS.NO_WEBSITE && hasValidWebsite(lead)) return false
    if (filters.preset === PIPELINE_FILTER_PRESETS.WITH_WEBSITE && !hasValidWebsite(lead)) return false
    if (filters.preset === PIPELINE_FILTER_PRESETS.WITH_PHONE && !hasPhoneNumber(lead)) return false

    if (filters.category !== ALL_LEADS_FILTER) {
      const categoryId = view.leadCategoryId || resolveLeadCategoryId(lead)
      if (categoryId !== filters.category) return false
    }

    if (filters.city !== ALL_CITIES_FILTER && resolveLeadCity(lead) !== filters.city) return false

    if (filters.batch !== ALL_BATCHES_FILTER) {
      const batchId = view.batchId || resolveLeadBatchId(lead)
      if (batchId !== filters.batch) return false
    }

    return true
  })
}

function leadImportedTimestamp(view = {}) {
  const lead = view.lead || {}
  const value = lead.importedAt || lead.createdAt || lead.addedAt || ''
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function applyPipelineSort(views = [], sortKey = '') {
  if (!sortKey) return views

  const sorted = [...views]
  if (sortKey === PIPELINE_SORT_OPTIONS.SCORE_DESC) {
    sorted.sort((a, b) => Number(b.lead?.leadScore || 0) - Number(a.lead?.leadScore || 0))
  } else if (sortKey === PIPELINE_SORT_OPTIONS.SCORE_ASC) {
    sorted.sort((a, b) => Number(a.lead?.leadScore || 0) - Number(b.lead?.leadScore || 0))
  } else if (sortKey === PIPELINE_SORT_OPTIONS.NEWEST) {
    sorted.sort((a, b) => leadImportedTimestamp(b) - leadImportedTimestamp(a))
  } else if (sortKey === PIPELINE_SORT_OPTIONS.OLDEST) {
    sorted.sort((a, b) => leadImportedTimestamp(a) - leadImportedTimestamp(b))
  } else if (sortKey === PIPELINE_SORT_OPTIONS.NAME_ASC) {
    sorted.sort((a, b) => String(a.businessName || '').localeCompare(String(b.businessName || ''), 'he'))
  }

  return sorted
}
