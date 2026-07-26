import { createClient } from '@supabase/supabase-js'

function requiredEnvironmentValue(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

export function getBearerToken(request) {
  const authorization = request.headers.authorization || ''
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
}

export function createRequestSupabaseClient(request) {
  const token = getBearerToken(request)
  if (!token) {
    const error = new Error('Authentication is required.')
    error.status = 401
    throw error
  }
  return createClient(
    requiredEnvironmentValue('SUPABASE_URL'),
    requiredEnvironmentValue('SUPABASE_PUBLISHABLE_KEY'),
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    },
  )
}

export function createSupabaseAdminClient() {
  return createClient(
    requiredEnvironmentValue('SUPABASE_URL'),
    requiredEnvironmentValue('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  )
}

export async function requireActiveManager(request, { allowAdmin = true } = {}) {
  const requestClient = createRequestSupabaseClient(request)
  const { data: authData, error: authError } = await requestClient.auth.getUser(getBearerToken(request))
  if (authError || !authData.user) {
    const error = new Error('Authentication is required.')
    error.status = 401
    throw error
  }

  const { data: profile, error: profileError } = await requestClient
    .from('users')
    .select('auth_user_id,name,email,role,business_id,active,created_at,updated_at')
    .eq('auth_user_id', authData.user.id)
    .single()

  if (profileError || !profile?.active) {
    const error = new Error('Active user access is required.')
    error.status = 403
    throw error
  }
  if (profile.role !== 'owner' && !(allowAdmin && profile.role === 'admin')) {
    const error = new Error('User management permission is required.')
    error.status = 403
    throw error
  }

  return { profile, requestClient }
}
