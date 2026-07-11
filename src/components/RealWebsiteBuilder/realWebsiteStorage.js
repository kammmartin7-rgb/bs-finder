// Owns the single localStorage collection for real paid-customer website projects.
export const REAL_WEBSITE_STORAGE_KEY = 'business-os-real-website-projects-v1'

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

export function createRealWebsiteProject(customer, sections, existingId, existingCreatedDate, status = 'draft') {
  const now = new Date().toISOString()
  return { id: existingId || `real-site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, customer: { ...customer }, selectedTemplate: customer.preferredTemplate, generatedSections: sections, createdDate: existingCreatedDate || now, updatedDate: now, status }
}
