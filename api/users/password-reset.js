import { createSupabaseAdminClient, requireActiveManager } from '../_lib/supabaseAdmin.js'
import {
  assertManagerScope,
  getManagerBusinessIds,
  getAppRedirectUrl,
  httpError,
  normalizeUserId,
  sendApiError,
  writeUserAudit,
} from '../_lib/userManagement.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  try {
    const userId = normalizeUserId(request.body?.userId)

    const { profile: manager } = await requireActiveManager(request)
    const adminClient = createSupabaseAdminClient()
    const { data: target, error: targetError } = await adminClient
      .from('users')
      .select('auth_user_id,email,role,active')
      .eq('auth_user_id', userId)
      .single()
    if (targetError || !target) throw httpError(404, 'User was not found.')
    if (!target.active) throw httpError(409, 'Inactive users cannot reset their password.')

    const { data: memberships, error: membershipsError } = await adminClient
      .from('business_memberships')
      .select('business_id')
      .eq('user_id', userId)
    if (membershipsError) throw membershipsError
    const managerBusinessIds = await getManagerBusinessIds(adminClient, manager)
    if (manager.auth_user_id !== userId) {
      assertManagerScope(
        manager,
        managerBusinessIds,
        target.role,
        (memberships || []).map((membership) => membership.business_id),
      )
    }

    await writeUserAudit(adminClient, manager.auth_user_id, userId, 'password_reset_requested')

    const redirectTo = getAppRedirectUrl('reset')
    const { error: resetError } = await adminClient.auth.resetPasswordForEmail(
      target.email,
      redirectTo ? { redirectTo } : undefined,
    )
    if (resetError) throw httpError(resetError.status || 400, resetError.message)

    return response.status(200).json({ sent: true })
  } catch (error) {
    return sendApiError(response, error)
  }
}
