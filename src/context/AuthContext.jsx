import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { canAccess, getProfileAuthorizationError, hasPermission, isAdmin, isClient, isDemo, isOwner, isSales } from '../services/authorization'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authorizationError, setAuthorizationError] = useState('')
  const [loading, setLoading] = useState(true)
  const [passwordSetupMode, setPasswordSetupMode] = useState(() => {
    const parameters = `${window.location.search}&${window.location.hash}`
    return /(?:setup|reset)=password|type=(?:invite|recovery)/.test(parameters)
  })
  const sessionRef = useRef(null)
  const profileRef = useRef(null)
  const profileRequestRef = useRef(0)

  useEffect(() => {
    async function loadSession(nextSession) {
      const requestId = ++profileRequestRef.current
      sessionRef.current = nextSession
      setSession(nextSession)
      profileRef.current = null
      setProfile(null)
      setAuthorizationError('')
      if (nextSession?.user) {
        const result = await supabase.from('users').select('auth_user_id,email,role,business_id,active,created_at').eq('auth_user_id', nextSession.user.id).maybeSingle()
        if (requestId !== profileRequestRef.current || nextSession.user.id !== sessionRef.current?.user?.id) return
        if (result.error) setAuthorizationError(result.error.message)
        else {
          const profileError = getProfileAuthorizationError(result.data)
          if (profileError) {
            setAuthorizationError(profileError)
          } else {
          profileRef.current = result.data
          setProfile(result.data)
          }
        }
      }
      setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => loadSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordSetupMode(true)
      const currentUserId = sessionRef.current?.user?.id
      const nextUserId = nextSession?.user?.id

      // Supabase may emit SIGNED_IN as well as TOKEN_REFRESHED when an existing
      // session's tab regains focus. Preserve the authorized profile so AuthGate
      // keeps the application mounted; only the refreshed session data changes.
      if (
        nextUserId &&
        nextUserId === currentUserId &&
        profileRef.current &&
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')
      ) {
        sessionRef.current = nextSession
        setSession(nextSession)
        return
      }

      void loadSession(nextSession)
    })
    return () => { listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return undefined

    const channel = supabase
      .channel(`authorization-profile-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `auth_user_id=eq.${userId}` },
        ({ new: nextProfile }) => {
          if (nextProfile.active !== true) {
            profileRef.current = null
            setProfile(null)
            setAuthorizationError('This account is inactive.')
            void supabase.auth.signOut()
            return
          }

          const profileError = getProfileAuthorizationError(nextProfile)
          if (profileError) {
            profileRef.current = null
            setProfile(null)
            setAuthorizationError(profileError)
            return
          }

          profileRef.current = nextProfile
          setProfile(nextProfile)
          setAuthorizationError('')
        },
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [session?.user?.id])

  const value = {
    session,
    user: session?.user || null,
    profile,
    authorizationError,
    authorized: Boolean(profile?.active && !authorizationError),
    loading,
    passwordSetupMode,
    canAccess: (resource, action) => canAccess(profile, resource, action),
    hasPermission: (permission) => hasPermission(profile, permission),
    isOwner: () => isOwner(profile),
    isAdmin: () => isAdmin(profile),
    isSales: () => isSales(profile),
    isClient: () => isClient(profile),
    isDemo: () => isDemo(profile),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/?reset=password` }),
    updatePassword: async (password) => {
      const result = await supabase.auth.updateUser({ password })
      if (!result.error) {
        setPasswordSetupMode(false)
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      return result
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { return useContext(AuthContext) }
