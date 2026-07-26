import { createSupabaseAdminClient, requireActiveManager } from '../_lib/supabaseAdmin.js'
import {
  assertBusinessAssignment,
  assertBusinessesExist,
  assertManagerScope,
  getManagerBusinessIds,
  getAppRedirectUrl,
  httpError,
  normalizeUserInput,
  sendApiError,
} from '../_lib/userManagement.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  let createdUserId = ''
  try {
    const { profile: manager } = await requireActiveManager(request)
    const adminClient = createSupabaseAdminClient()
    const input = normalizeUserInput(request.body)
    assertBusinessAssignment(input.role, input.businessIds)
    const managerBusinessIds = await getManagerBusinessIds(adminClient, manager)
    assertManagerScope(manager, managerBusinessIds, input.role, input.businessIds)
    await assertBusinessesExist(adminClient, input.businessIds)

    const redirectTo = getAppRedirectUrl('setup')
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      input.email,
      { data: { name: input.name, provisioning: true }, ...(redirectTo ? { redirectTo } : {}) },
    )
    if (inviteError) throw httpError(inviteError.status || 400, inviteError.message)
    createdUserId = inviteData.user?.id || ''
    if (!createdUserId) throw new Error('Supabase did not return the invited user.')

    const { error: profileError } = await adminClient.rpc('provision_invited_user', {
      actor_id: manager.auth_user_id,
      target_id: createdUserId,
      target_name: input.name,
      target_email: input.email,
      target_role: input.role,
      target_business_ids: input.businessIds,
      audit_details: {
        role: input.role,
        business_ids: input.businessIds,
      },
    })
    if (profileError) throw profileError
    return response.status(201).json({ userId: createdUserId, invited: true })
  } catch (error) {
    if (createdUserId) {
      try {
        const rollbackClient = createSupabaseAdminClient()
        const { error: deleteError } = await rollbackClient.auth.admin.deleteUser(createdUserId)
        if (deleteError) {
          await rollbackClient.auth.admin.updateUserById(createdUserId, { ban_duration: '876000h' })
          await rollbackClient.from('users').update({ active: false }).eq('auth_user_id', createdUserId)
        }
      } catch { /* The trigger creates provisioning profiles inactive, so rollback fails closed. */ }
    }
    return sendApiError(response, error)
  }
}
