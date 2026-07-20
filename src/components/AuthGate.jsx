import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/brand/growthpilot-logo-horizontal.png'
import './AuthGate.css'

export default function AuthGate({ children }) {
  const { user, authorized, authorizationError, loading, signIn, resetPassword, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  if (loading) return <div className="auth-gate"><p>Loading…</p></div>
  if (user && authorized) return children
  if (user && authorizationError) return <main className="auth-gate"><section className="auth-gate__card"><img src={logo} alt="GrowthPilot" /><h1>Access denied</h1><p>{authorizationError}</p><button type="button" onClick={signOut}>Log out</button></section></main>
  async function submit(event) { event.preventDefault(); setError(''); const result = await signIn(email.trim(), password); if (result.error) setError(result.error.message) }
  async function forgot() { setError(''); const result = await resetPassword(email.trim()); if (result.error) setError(result.error.message); else setNotice('Password reset instructions sent.') }
  return <main className="auth-gate" dir="ltr"><form className="auth-gate__card" onSubmit={submit}><img src={logo} alt="GrowthPilot" /><h1>Sign in</h1><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <p className="auth-gate__error">{error}</p>}{notice && <p>{notice}</p>}<button type="submit">Log in</button><button type="button" className="auth-gate__link" onClick={forgot} disabled={!email}>Forgot password?</button></form></main>
}
