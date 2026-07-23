import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authorizationError, setAuthorizationError] = useState('')
  const [loading, setLoading] = useState(true)
  const sessionRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    async function loadSession(nextSession) {
      sessionRef.current = nextSession
      setSession(nextSession)
      profileRef.current = null
      setProfile(null)
      setAuthorizationError('')
      if (nextSession?.user) {
        const result = await supabase.from('users').select('auth_user_id,email,role,business_id,active,created_at').eq('auth_user_id', nextSession.user.id).maybeSingle()
        if (result.error) setAuthorizationError(result.error.message)
        else if (!result.data) setAuthorizationError('No authorization profile exists for this account.')
        else if (!result.data.active) setAuthorizationError('This account is inactive.')
        else if (result.data.role !== 'owner') setAuthorizationError('This account is not enabled for the owner application.')
        else {
          profileRef.current = result.data
          setProfile(result.data)
        }
      }
      setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => loadSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
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
  const value = { session, user: session?.user || null, profile, authorizationError, authorized: Boolean(profile && !authorizationError), loading, signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }), signOut: () => supabase.auth.signOut(), resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }) }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { return useContext(AuthContext) }
