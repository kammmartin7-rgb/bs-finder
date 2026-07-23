export const ROLES = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  SALES: 'sales',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
  DEMO: 'demo',
})

export const PERMISSIONS = Object.freeze({
  ALL: '*',
  DASHBOARD: 'dashboard',
  BUSINESSES: 'businesses',
  CRM: 'crm',
  LEADS: 'leads',
  WHATSAPP: 'whatsapp',
  DEMO_BUILDER: 'demo-builder',
  FINANCE: 'finance',
  TASKS: 'tasks',
  AI_CENTER: 'ai-center',
  DOCUMENTS: 'documents',
  USERS: 'users',
  INTEGRATIONS: 'integrations',
  SETTINGS: 'settings',
  PROJECTS: 'projects',
  WEBSITE_BUILDER: 'website-builder',
  OWN_BUSINESS: 'own-business',
  OWN_DASHBOARD: 'own-dashboard',
  OWN_REPORTS: 'own-reports',
  DEMO_READ_ONLY: 'demo-read-only',
})

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.OWNER]: [PERMISSIONS.ALL],
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD, PERMISSIONS.BUSINESSES, PERMISSIONS.CRM,
    PERMISSIONS.LEADS, PERMISSIONS.WHATSAPP, PERMISSIONS.DEMO_BUILDER,
    PERMISSIONS.FINANCE, PERMISSIONS.TASKS, PERMISSIONS.AI_CENTER,
    PERMISSIONS.DOCUMENTS, PERMISSIONS.INTEGRATIONS, PERMISSIONS.SETTINGS,
    PERMISSIONS.PROJECTS, PERMISSIONS.WEBSITE_BUILDER,
  ],
  [ROLES.SALES]: [
    PERMISSIONS.DASHBOARD, PERMISSIONS.BUSINESSES, PERMISSIONS.CRM,
    PERMISSIONS.LEADS, PERMISSIONS.WHATSAPP, PERMISSIONS.DEMO_BUILDER,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.DASHBOARD, PERMISSIONS.BUSINESSES, PERMISSIONS.CRM,
    PERMISSIONS.LEADS, PERMISSIONS.WHATSAPP, PERMISSIONS.DEMO_BUILDER,
  ],
  [ROLES.CLIENT]: [
    PERMISSIONS.OWN_BUSINESS, PERMISSIONS.OWN_DASHBOARD, PERMISSIONS.OWN_REPORTS,
  ],
  [ROLES.DEMO]: [PERMISSIONS.DEMO_BUILDER, PERMISSIONS.DEMO_READ_ONLY],
})

export const SCREEN_PERMISSIONS = Object.freeze({
  dashboard: [PERMISSIONS.DASHBOARD, PERMISSIONS.OWN_DASHBOARD],
  businesses: [PERMISSIONS.BUSINESSES, PERMISSIONS.OWN_BUSINESS],
  sales: [PERMISSIONS.CRM],
  crm: [PERMISSIONS.CRM],
  finance: [PERMISSIONS.FINANCE, PERMISSIONS.OWN_REPORTS],
  tasks: [PERMISSIONS.TASKS],
  'ai-center': [PERMISSIONS.AI_CENTER],
  documents: [PERMISSIONS.DOCUMENTS, PERMISSIONS.OWN_REPORTS],
  users: [PERMISSIONS.USERS],
  integrations: [PERMISSIONS.INTEGRATIONS],
  settings: [PERMISSIONS.SETTINGS],
  'bs-hunter': [PERMISSIONS.LEADS],
  'bs-finder-workspace': [PERMISSIONS.BUSINESSES, PERMISSIONS.OWN_BUSINESS],
  'bs-finder-projects': [PERMISSIONS.PROJECTS],
  'websites-assets': [PERMISSIONS.PROJECTS, PERMISSIONS.OWN_BUSINESS],
  projects: [PERMISSIONS.PROJECTS],
  'real-website-builder': [PERMISSIONS.WEBSITE_BUILDER],
  'bs-funds': [PERMISSIONS.BUSINESSES, PERMISSIONS.OWN_BUSINESS],
  'ideas-vault': [PERMISSIONS.PROJECTS],
  development: [PERMISSIONS.SETTINGS],
})

export function getProfileAuthorizationError(profile) {
  if (!profile) return 'No authorization profile exists for this account.'
  if (!profile.active) return 'This account is inactive.'
  return ''
}

export function hasPermission(profile, permission) {
  if (!profile?.active || !permission) return false
  const permissions = ROLE_PERMISSIONS[profile.role] || []
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission)
}

export function canAccess(profile, resource, action) {
  if (resource === 'screen') {
    const required = SCREEN_PERMISSIONS[action]
    return Boolean(required?.some((permission) => hasPermission(profile, permission)))
  }
  return hasPermission(profile, action || resource)
}

export function isOwner(profile) { return profile?.role === ROLES.OWNER }
export function isAdmin(profile) { return profile?.role === ROLES.ADMIN }
export function isSales(profile) { return profile?.role === ROLES.SALES }
export function isClient(profile) { return profile?.role === ROLES.CLIENT }
export function isDemo(profile) { return profile?.role === ROLES.DEMO }
