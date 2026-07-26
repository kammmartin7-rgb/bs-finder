import { supabase } from './supabaseClient'

const USER_FIELDS = 'auth_user_id,name,email,role,business_id,active,created_at,updated_at'
const BUSINESS_FIELDS = 'id,name,active,created_at,updated_at'
const MEMBERSHIP_FIELDS = 'id,user_id,business_id,created_at'

export async function loadUserDirectory() {
  const [usersResult, businessesResult, membershipsResult] = await Promise.all([
    supabase.from('users').select(USER_FIELDS).order('created_at', { ascending: false }),
    supabase.from('businesses').select(BUSINESS_FIELDS).order('name', { ascending: true }),
    supabase.from('business_memberships').select(MEMBERSHIP_FIELDS),
  ])

  const error = usersResult.error || businessesResult.error || membershipsResult.error
  if (error) return { data: null, error }

  const businesses = businessesResult.data || []
  const businessById = new Map(businesses.map((business) => [business.id, business]))
  const membershipsByUser = new Map()

  for (const membership of membershipsResult.data || []) {
    const current = membershipsByUser.get(membership.user_id) || []
    current.push({
      ...membership,
      business: businessById.get(membership.business_id) || null,
    })
    membershipsByUser.set(membership.user_id, current)
  }

  return {
    data: {
      businesses,
      memberships: membershipsResult.data || [],
      users: (usersResult.data || []).map((user) => ({
        ...user,
        businesses: membershipsByUser.get(user.auth_user_id) || [],
      })),
    },
    error: null,
  }
}

export async function updateUserProfile(authUserId, changes) {
  return requestUserApi(`/api/users/${encodeURIComponent(authUserId)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export async function inviteUser(input) {
  return requestUserApi('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function disableUser(authUserId) {
  return requestUserApi(`/api/users/${encodeURIComponent(authUserId)}`, { method: 'DELETE' })
}

export async function sendUserPasswordReset(authUserId) {
  return requestUserApi('/api/users/password-reset', {
    method: 'POST',
    body: JSON.stringify({ userId: authUserId }),
  })
}

async function requestUserApi(path, options) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData.session?.access_token) {
    return { data: null, error: sessionError || new Error('Authentication is required.') }
  }

  try {
    const response = await fetch(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { data: null, error: new Error(data.error || 'User management request failed.') }
    return { data, error: null }
  } catch {
    return { data: null, error: new Error('Cannot reach the user management service.') }
  }
}
