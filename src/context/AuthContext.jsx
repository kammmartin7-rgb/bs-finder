import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authorizationError, setAuthorizationError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined }
    async function loadSession(nextSession) {
      setSession(nextSession)
      setProfile(null)
      setAuthorizationError('')
      if (nextSession?.user) {
        const result = await supabase.from('users').select('auth_user_id,email,role,business_id,active,created_at').eq('auth_user_id', nextSession.user.id).maybeSingle()
        if (result.error) setAuthorizationError(result.error.message)
        else if (!result.data) setAuthorizationError('No authorization profile exists for this account.')
        else if (!result.data.active) setAuthorizationError('This account is inactive.')
        else if (result.data.role !== 'owner') setAuthorizationError('This account is not enabled for the owner application.')
        else setProfile(result.data)
      }
      setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => loadSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { void loadSession(nextSession) })
    return () => { listener.subscription.unsubscribe() }
  }, [])
  const value = { session, user: session?.user || null, profile, authorizationError, authorized: Boolean(profile && !authorizationError), loading, signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }), signOut: () => supabase.auth.signOut(), resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }) }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { return useContext(AuthContext) }
