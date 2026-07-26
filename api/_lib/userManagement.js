import { ROLES } from '../../src/services/authorization.js'

const ASSIGNABLE_ROLES = new Set([ROLES.OWNER, ROLES.ADMIN, ROLES.SALES, ROLES.CLIENT, ROLES.DEMO, ROLES.EMPLOYEE])
const ADMIN_ASSIGNABLE_ROLES = new Set([ROLES.SALES, ROLES.CLIENT, ROLES.DEMO, ROLES.EMPLOYEE])
const BUSINESS_REQUIRED_ROLES = new Set([ROLES.ADMIN, ROLES.SALES, ROLES.CLIENT, ROLES.EMPLOYEE])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

export function sendApiError(response, error) {
  const status = Number(error?.status) || 500
  const message = status >= 500 ? 'User management operation failed.' : error.message
  return response.status(status).json({ error: message })
}

export function normalizeUserId(value) {
  const userId = String(value || '').trim()
  if (!UUID_PATTERN.test(userId)) throw httpError(400, 'A valid user ID is required.')
  return userId
}

export function getAppRedirectUrl(mode) {
  const appUrl = process.env.PUBLIC_APP_URL?.trim() || process.env.VITE_PUBLIC_APP_URL?.trim()
  if (!appUrl) return undefined
  const url = new URL(appUrl)
  url.searchParams.set(mode, 'password')
  return url.toString()
}

export function normalizeUserInput(body = {}, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw httpError(400, 'A JSON object is required.')
  const input = {}
  if (!partial || Object.hasOwn(body, 'name')) {
    input.name = String(body.name || '').trim()
    if (!input.name) throw httpError(400, 'Name is required.')
    if (input.name.length > 200) throw httpError(400, 'Name must be 200 characters or fewer.')
  }
  if (!partial || Object.hasOwn(body, 'email')) {
    input.email = String(body.email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw httpError(400, 'A valid email is required.')
    if (input.email.length > 320) throw httpError(400, 'Email must be 320 characters or fewer.')
  }
  if (!partial || Object.hasOwn(body, 'role')) {
    input.role = String(body.role || '').trim()
    if (!ASSIGNABLE_ROLES.has(input.role)) throw httpError(400, 'A valid role is required.')
  }
  if (Object.hasOwn(body, 'active')) {
    if (typeof body.active !== 'boolean') throw httpError(400, 'Active must be true or false.')
    input.active = body.active
  }
  if (!partial || Object.hasOwn(body, 'businessIds')) {
    if (!Array.isArray(body.businessIds)) throw httpError(400, 'Business assignments must be an array.')
    input.businessIds = [...new Set(body.businessIds.map((value) => String(value).trim()).filter(Boolean))]
    if (input.businessIds.length > 100) throw httpError(400, 'A user cannot be assigned to more than 100 businesses.')
  }
  return input
}

export function assertBusinessAssignment(role, businessIds) {
  if (BUSINESS_REQUIRED_ROLES.has(role) && !businessIds.length) {
    throw httpError(400, 'This role requires at least one business assignment.')
  }
}

export async function getManagerBusinessIds(adminClient, profile) {
  if (profile.role === ROLES.OWNER) return null
  const { data, error } = await adminClient
    .from('business_memberships')
    .select('business_id')
    .eq('user_id', profile.auth_user_id)
  if (error) throw error
  return new Set((data || []).map((membership) => membership.business_id))
}

export function assertManagerScope(manager, managerBusinessIds, role, businessIds) {
  if (manager.role === ROLES.OWNER) return
  if (manager.role !== ROLES.ADMIN) throw httpError(403, 'User management permission is required.')
  if (!ADMIN_ASSIGNABLE_ROLES.has(role)) throw httpError(403, 'Admins cannot assign this role.')
  if (!businessIds.length || businessIds.some((id) => !managerBusinessIds.has(id))) {
    throw httpError(403, 'Admins may only assign their own businesses.')
  }
}

export async function assertBusinessesExist(adminClient, businessIds) {
  if (!businessIds.length) return
  const { data, error } = await adminClient
    .from('businesses')
    .select('id')
    .in('id', businessIds)
    .eq('active', true)
  if (error) throw error
  if ((data || []).length !== businessIds.length) throw httpError(400, 'One or more business assignments are invalid.')
}

export async function writeUserAudit(adminClient, actorId, targetId, action, details = {}) {
  const { error } = await adminClient.from('user_management_audit').insert({
    actor_user_id: actorId,
    target_user_id: targetId,
    action,
    details,
  })
  if (error) throw error
}
