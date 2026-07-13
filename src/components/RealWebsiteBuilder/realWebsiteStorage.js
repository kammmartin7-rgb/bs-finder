// Owns the single localStorage collection for real paid-customer website projects.
import { getLeadId } from '../../services/leadId'

export const REAL_WEBSITE_STORAGE_KEY = 'business-os-real-website-projects-v1'
export const REAL_WEBSITE_MEDIA_LIBRARY_KEY = 'business-os-real-website-media-library-v1'
export const REAL_WEBSITE_ACTIVE_DRAFT_KEY = 'business-os-real-website-active-draft-v1'
export const MEDIA_LIBRARY_MAX_ITEMS = 80
export const MEDIA_LIBRARY_MAX_CHARACTERS = 3_500_000

const IMAGE_SLOTS = ['logo', 'hero', 'about', 'services', 'gallery', 'team', 'testimonials', 'contact']

export function cloneCustomerImages(images = {}) {
  const next = {}
  IMAGE_SLOTS.forEach((slot) => {
    const value = images[slot]
    if (!value) return
    next[slot] = Array.isArray(value) ? value.map((item) => ({ ...item })) : { ...value }
  })
  return next
}

export function normalizeCustomer(customer = {}) {
  const images = cloneCustomerImages(customer.images)
  if (!images.logo && customer.logoUrl) images.logo = { id: 'legacy-logo', name: 'Logo URL', dataUrl: customer.logoUrl, type: 'image/url' }
  if (!images.hero && customer.heroImageUrl) images.hero = { id: 'legacy-hero', name: 'Hero URL', dataUrl: customer.heroImageUrl, type: 'image/url' }
  if (!images.gallery?.length && customer.galleryImageUrls) {
    images.gallery = String(customer.galleryImageUrls).split(/[\n,]/).map((url) => url.trim()).filter(Boolean).map((url, index) => ({ id: `legacy-gallery-${index}`, name: `Gallery ${index + 1}`, dataUrl: url, type: 'image/url' }))
  }
  return { ...customer, images }
}

export function saveActiveDraft(customer, projectMeta) {
  try {
    localStorage.setItem(REAL_WEBSITE_ACTIVE_DRAFT_KEY, JSON.stringify({
      customer: normalizeCustomer(customer),
      projectMeta,
      updatedAt: new Date().toISOString(),
    }))
  } catch { /* Draft save is best-effort when storage is full. */ }
}

export function loadActiveDraft() {
  try {
    const value = JSON.parse(localStorage.getItem(REAL_WEBSITE_ACTIVE_DRAFT_KEY))
    if (!value?.customer) return null
    return { customer: normalizeCustomer(value.customer), projectMeta: value.projectMeta || { id: null, createdDate: null, status: 'draft' } }
  } catch { return null }
}

export function clearActiveDraft() {
  try { localStorage.removeItem(REAL_WEBSITE_ACTIVE_DRAFT_KEY) } catch { /* ignore */ }
}

export function loadRealWebsiteProjects() {
  try { const value = JSON.parse(localStorage.getItem(REAL_WEBSITE_STORAGE_KEY)); return Array.isArray(value) ? value : [] } catch { return [] }
}

export function saveRealWebsiteProject(project) {
  const projects = loadRealWebsiteProjects()
  const index = projects.findIndex((item) => item.id === project.id)
  const next = index >= 0 ? projects.map((item) => item.id === project.id ? project : item) : [project, ...projects]
  localStorage.setItem(REAL_WEBSITE_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function createRealWebsiteProject(customer, sections, existingId, existingCreatedDate, status = 'draft', leadId = null) {
  const now = new Date().toISOString()
  const normalized = normalizeCustomer(customer)
  const resolvedLeadId = leadId || customer.leadId || null
  return {
    id: existingId || `real-site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    leadId: resolvedLeadId,
    customer: { ...normalized, leadId: resolvedLeadId },
    selectedTemplate: normalized.preferredTemplate,
    generatedSections: sections,
    createdDate: existingCreatedDate || now,
    updatedDate: now,
    status,
  }
}

function readMediaItems(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : []
  } catch { return [] }
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

/** Canonical media library key — LeadID only. */
export function leadMediaStorageKey(leadId) {
  const id = String(leadId || '').trim()
  if (!id) return `${REAL_WEBSITE_MEDIA_LIBRARY_KEY}:draft`
  return `${REAL_WEBSITE_MEDIA_LIBRARY_KEY}:lead-${id}`
}

/** Legacy business-name key (migration only). */
export function businessMediaStorageKey(businessName) {
  const name = String(businessName || '').trim().toLowerCase()
  if (!name) return `${REAL_WEBSITE_MEDIA_LIBRARY_KEY}:draft`
  const slug = name.normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 64)
  return `${REAL_WEBSITE_MEDIA_LIBRARY_KEY}:biz-${slug || encodeURIComponent(name).replace(/%/g, '').slice(0, 64)}`
}

export function legacyMediaKeysForBusinessName(businessName, legacyProjectId = null) {
  const keys = []
  const ascii = String(businessName || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48)
  if (ascii) keys.push(`${REAL_WEBSITE_MEDIA_LIBRARY_KEY}:${ascii}`)
  if (legacyProjectId) {
    const projectSlug = String(legacyProjectId).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)
    if (projectSlug) keys.push(`${REAL_WEBSITE_MEDIA_LIBRARY_KEY}:${projectSlug}`)
  }
  return keys
}

function resolveLeadId(leadOrLeadId) {
  return typeof leadOrLeadId === 'string' ? leadOrLeadId : getLeadId(leadOrLeadId)
}

export function loadLeadMediaLibrary(leadOrLeadId) {
  const leadId = resolveLeadId(leadOrLeadId)
  if (!leadId) return []
  return readMediaItems(leadMediaStorageKey(leadId))
}

export function saveLeadMediaLibrary(leadOrLeadId, items) {
  const leadId = resolveLeadId(leadOrLeadId)
  if (!leadId) throw new Error('LeadID is required before saving media for this lead.')
  if (!Array.isArray(items)) throw new Error('Invalid media library data.')
  if (items.length > MEDIA_LIBRARY_MAX_ITEMS) throw new Error(`The media library supports up to ${MEDIA_LIBRARY_MAX_ITEMS} images.`)
  const serialized = JSON.stringify(items)
  if (serialized.length > MEDIA_LIBRARY_MAX_CHARACTERS) throw new Error('The media library storage limit is 3.5 MB. Delete unused images before uploading more.')
  try { localStorage.setItem(leadMediaStorageKey(leadId), serialized); return items } catch { throw new Error('Browser storage is full. Delete unused images before uploading more.') }
}

export function loadBusinessMediaLibrary(leadOrBusinessName, legacyProjectId = null) {
  if (typeof leadOrBusinessName === 'object' && leadOrBusinessName !== null) {
    return loadLeadMediaLibrary(leadOrBusinessName)
  }
  const leadId = String(leadOrBusinessName || '').trim()
  if (leadId && leadId.startsWith('lead-')) return loadLeadMediaLibrary(leadId)
  const legacyKeys = [businessMediaStorageKey(leadOrBusinessName), ...legacyMediaKeysForBusinessName(leadOrBusinessName, legacyProjectId)]
  return mergeMediaItems(...legacyKeys.map(readMediaItems))
}

export function saveBusinessMediaLibrary(leadOrLeadId, items) {
  if (typeof leadOrLeadId === 'object' && leadOrLeadId !== null) {
    return saveLeadMediaLibrary(leadOrLeadId, items)
  }
  return saveLeadMediaLibrary(String(leadOrLeadId || ''), items)
}

export function addImagesToLeadMediaLibrary(leadOrLeadId, images = [], category = 'general') {
  const leadId = resolveLeadId(leadOrLeadId)
  if (!leadId) throw new Error('LeadID is required before uploading media for this lead.')
  const existing = loadLeadMediaLibrary(leadId)
  const stamped = images.map((image, index) => ({
    ...image,
    category: image.category || category,
    libraryId: image.libraryId || `library-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    updatedAt: new Date().toISOString(),
  }))
  if (existing.length + stamped.length > MEDIA_LIBRARY_MAX_ITEMS) throw new Error(`The media library supports up to ${MEDIA_LIBRARY_MAX_ITEMS} images.`)
  return saveLeadMediaLibrary(leadId, mergeMediaItems(stamped, existing))
}

/** @deprecated Use addImagesToLeadMediaLibrary */
export function addImagesToBusinessMediaLibrary(leadOrLeadId, images = [], category = 'general') {
  return addImagesToLeadMediaLibrary(leadOrLeadId, images, category)
}

export function syncCustomerImagesToLeadMediaLibrary(leadOrLeadId, images = {}) {
  const leadId = resolveLeadId(leadOrLeadId)
  if (!leadId) return []
  const seeded = []
  IMAGE_SLOTS.forEach((slot) => {
    const value = images[slot]
    const list = Array.isArray(value) ? value : (value ? [value] : [])
    list.forEach((image, index) => {
      if (!image?.dataUrl) return
      seeded.push({
        ...image,
        category: slot === 'logo' ? 'logos' : slot === 'contact' ? 'general' : slot,
        libraryId: image.librarySourceId || image.libraryId || image.id || `synced-${slot}-${index}-${String(image.dataUrl).slice(-24)}`,
      })
    })
  })
  if (!seeded.length) return loadLeadMediaLibrary(leadId)
  try { return addImagesToLeadMediaLibrary(leadId, seeded) } catch { return loadLeadMediaLibrary(leadId) }
}

/** @deprecated LeadID is stable; business rename does not move media. */
export function migrateBusinessMediaLibrary(_fromName, leadOrLeadId) {
  return loadLeadMediaLibrary(leadOrLeadId)
}

export function syncCustomerImagesToBusinessMediaLibrary(leadOrLeadId, images = {}) {
  return syncCustomerImagesToLeadMediaLibrary(leadOrLeadId, images)
}

export function loadMediaLibrary(leadOrLeadId, legacyProjectId = null) {
  if (typeof leadOrLeadId === 'object') return loadLeadMediaLibrary(leadOrLeadId)
  return loadBusinessMediaLibrary(leadOrLeadId, legacyProjectId)
}

export function saveMediaLibrary(items, leadOrLeadId) {
  return saveLeadMediaLibrary(leadOrLeadId, items)
}

export function findProjectForLead(projects, lead) {
  const leadId = getLeadId(lead)
  if (leadId) {
    const byId = projects.find((project) => project.leadId === leadId)
    if (byId) return byId
  }
  const name = String(lead?.businessName || lead?.title || '').trim().toLowerCase()
  return name ? projects.find((project) => project.customer?.businessName?.trim().toLowerCase() === name) : null
}
