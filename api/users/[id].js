import { createSupabaseAdminClient, requireActiveManager } from '../_lib/supabaseAdmin.js'
import {
  assertBusinessAssignment,
  assertBusinessesExist,
  assertManagerScope,
  getManagerBusinessIds,
  httpError,
  normalizeUserId,
  normalizeUserInput,
  sendApiError,
} from '../_lib/userManagement.js'

async function loadTarget(adminClient, userId) {
  const { data, error } = await adminClient
    .from('users')
    .select('auth_user_id,name,email,role,business_id,active')
    .eq('auth_user_id', userId)
    .single()
  if (error || !data) throw httpError(404, 'User was not found.')
  return data
}

async function loadTargetBusinessIds(adminClient, userId) {
  const { data, error } = await adminClient
    .from('business_memberships')
    .select('business_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data || []).map((membership) => membership.business_id)
}

export default async function handler(request, response) {
  if (!['PATCH', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'PATCH, DELETE')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const userId = normalizeUserId(request.query.id)

    const { profile: manager } = await requireActiveManager(request)
    if (manager.auth_user_id === userId) throw httpError(409, 'You cannot change or disable your own account here.')

    const adminClient = createSupabaseAdminClient()
    const target = await loadTarget(adminClient, userId)
    const currentBusinessIds = await loadTargetBusinessIds(adminClient, userId)
    const managerBusinessIds = await getManagerBusinessIds(adminClient, manager)

    if (request.method === 'DELETE') {
      assertManagerScope(manager, managerBusinessIds, target.role, currentBusinessIds)
      const { error: banError } = await adminClient.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
      if (banError) throw banError
      const { error: profileError } = await adminClient.rpc('apply_user_management_update', {
        actor_id: manager.auth_user_id,
        target_id: userId,
        next_name: target.name,
        next_role: target.role,
        next_active: false,
        next_business_ids: currentBusinessIds,
        change_name: false,
        change_role: false,
        change_active: true,
        change_businesses: false,
        audit_action: 'user_disabled',
        audit_details: { previous_role: target.role },
      })
      if (profileError) {
        await adminClient.auth.admin.updateUserById(userId, { ban_duration: 'none' })
        if (profileError.message?.includes('last active owner')) {
          throw httpError(409, 'The last active owner cannot be changed or disabled.')
        }
        throw profileError
      }
      return response.status(200).json({ disabled: true })
    }

    const input = normalizeUserInput(request.body, { partial: true })
    if (!Object.keys(input).length) throw httpError(400, 'At least one user field is required.')
    const nextRole = input.role || target.role
    const nextActive = Object.hasOwn(input, 'active') ? input.active : target.active
    const nextBusinessIds = input.businessIds || currentBusinessIds
    assertBusinessAssignment(nextRole, nextBusinessIds)
    assertManagerScope(manager, managerBusinessIds, nextRole, nextBusinessIds)
    await assertBusinessesExist(adminClient, nextBusinessIds)

    let authActiveChanged = false
    if (Object.hasOwn(input, 'active')) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(
        userId,
        { ban_duration: input.active ? 'none' : '876000h' },
      )
      if (authError) throw authError
      authActiveChanged = input.active !== target.active
    }

    const membershipsChanged = Object.hasOwn(input, 'businessIds')

    const profileChanged = ['name', 'role', 'active', 'businessIds'].some((field) => Object.hasOwn(input, field))
    if (profileChanged) {
      const { error: profileError } = await adminClient.rpc('apply_user_management_update', {
        actor_id: manager.auth_user_id,
        target_id: userId,
        next_name: input.name || target.name,
        next_role: nextRole,
        next_active: nextActive,
        next_business_ids: nextBusinessIds,
        change_name: Object.hasOwn(input, 'name'),
        change_role: Object.hasOwn(input, 'role'),
        change_active: Object.hasOwn(input, 'active'),
        change_businesses: membershipsChanged,
        audit_action: 'user_updated',
        audit_details: { changed_fields: Object.keys(input) },
      })
      if (profileError) {
        if (authActiveChanged) {
          await adminClient.auth.admin.updateUserById(
            userId,
            { ban_duration: target.active ? 'none' : '876000h' },
          )
        }
        if (profileError.message?.includes('last active owner')) {
          throw httpError(409, 'The last active owner cannot be changed or disabled.')
        }
        throw profileError
      }
    }
    return response.status(200).json({ updated: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}
