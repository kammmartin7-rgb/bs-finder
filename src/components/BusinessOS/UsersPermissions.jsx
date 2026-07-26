import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { isOwner, ROLES } from '../../services/authorization'
import { disableUser, inviteUser, loadUserDirectory, sendUserPasswordReset, updateUserProfile } from '../../services/userDirectory'
import './UsersPermissions.css'

const EDITABLE_ROLES = [
  [ROLES.OWNER, 'Owner'],
  [ROLES.ADMIN, 'Admin'],
  [ROLES.SALES, 'Sales'],
  [ROLES.CLIENT, 'Client'],
  [ROLES.DEMO, 'Demo'],
  [ROLES.EMPLOYEE, 'Employee (legacy)'],
]

function businessNames(user) {
  const names = user.businesses
    .map((membership) => membership.business?.name || membership.business_id)
    .filter(Boolean)
  return names.length ? names.join(', ') : '—'
}

export default function UsersPermissions() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [savingUserId, setSavingUserId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: ROLES.CLIENT, businessIds: [] })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const assignableRoles = isOwner(profile)
    ? EDITABLE_ROLES
    : EDITABLE_ROLES.filter(([value]) => ![ROLES.OWNER, ROLES.ADMIN].includes(value))
  const createRequiresBusiness = [ROLES.ADMIN, ROLES.SALES, ROLES.CLIENT, ROLES.EMPLOYEE].includes(createForm.role)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    const result = await loadUserDirectory()
    if (result.error) setError(result.error.message)
    else {
      setUsers(result.data.users)
      setBusinesses(result.data.businesses)
    }
    setLoading(false)
  }, [])

  useEffect(() => { void loadUsers() }, [loadUsers])

  const filtered = useMemo(
    () => users.filter((user) => (
      (!query || `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()))
      && (role === 'all' || user.role === role)
    )),
    [query, role, users],
  )
  const activeOwners = users.filter((user) => isOwner(user) && user.active).length

  async function updateUser(user, changes) {
    const editingSelf = user.auth_user_id === profile?.auth_user_id
    if (editingSelf && (changes.role && changes.role !== ROLES.OWNER || changes.active === false)) return
    if (isOwner(user) && user.active && changes.active === false && activeOwners <= 1) return

    setSavingUserId(user.auth_user_id)
    setError('')
    const result = changes.active === false
      ? await disableUser(user.auth_user_id)
      : await updateUserProfile(user.auth_user_id, changes)
    if (result.error) setError(result.error.message)
    else await loadUsers()
    setSavingUserId('')
  }

  async function createUser(event) {
    event.preventDefault()
    setSavingUserId('new')
    setError('')
    setNotice('')
    const result = await inviteUser(createForm)
    if (result.error) setError(result.error.message)
    else {
      setNotice(`Invitation sent to ${createForm.email}.`)
      setCreateForm({ name: '', email: '', role: ROLES.CLIENT, businessIds: [] })
      setShowCreate(false)
      await loadUsers()
    }
    setSavingUserId('')
  }

  async function resetUserPassword(user) {
    setSavingUserId(user.auth_user_id)
    setError('')
    setNotice('')
    const result = await sendUserPasswordReset(user.auth_user_id)
    if (result.error) setError(result.error.message)
    else setNotice(`Password reset instructions sent to ${user.email}.`)
    setSavingUserId('')
  }

  function selectedBusinessIds(event) {
    return Array.from(event.target.selectedOptions, (option) => option.value)
  }

  return (
    <section className="users-permissions" dir="rtl">
      <header>
        <div><span>GrowthPilot OS</span><h1>Users & Permissions</h1></div>
        <div>
          <button type="button" onClick={() => setShowCreate((current) => !current)}>Add User</button>
          <button type="button" onClick={() => void loadUsers()} disabled={loading}>Refresh Users</button>
        </div>
      </header>
      <p>Create invited users, assign roles and businesses, and disable access without leaving Business OS.</p>
      {showCreate && (
        <form className="users-permissions__create" onSubmit={createUser}>
          <label>Name<input value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} required /></label>
          <label>Email<input type="email" value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} required /></label>
          <label>Role<select value={createForm.role} onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))}>{assignableRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Businesses<select multiple required={createRequiresBusiness} value={createForm.businessIds} onChange={(event) => setCreateForm((current) => ({ ...current, businessIds: selectedBusinessIds(event) }))}>{businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select></label>
          <div><button type="submit" disabled={savingUserId === 'new'}>{savingUserId === 'new' ? 'Sending…' : 'Create & Invite'}</button><button type="button" className="is-secondary" onClick={() => setShowCreate(false)}>Cancel</button></div>
        </form>
      )}
      <div className="users-permissions__filters">
        <input placeholder="Search name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="all">All roles</option>
          {EDITABLE_ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error && <p className="users-permissions__error">{error}</p>}
      {notice && <p className="users-permissions__notice">{notice}</p>}
      {loading ? <p>Loading users…</p> : (
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Businesses</th><th>Active</th><th>Created</th><th>Access</th></tr></thead>
          <tbody>
            {filtered.map((user) => {
              const isSelf = user.auth_user_id === profile?.auth_user_id
              const saving = savingUserId === user.auth_user_id
              return (
                <tr key={user.auth_user_id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      disabled={isSelf || saving}
                      onChange={(event) => void updateUser(user, { role: event.target.value })}
                    >
                      {(isOwner(profile) ? EDITABLE_ROLES : assignableRoles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      multiple
                      aria-label={`Businesses for ${user.name}`}
                      value={user.businesses.map((membership) => membership.business_id)}
                      disabled={isSelf || saving}
                      onChange={(event) => void updateUser(user, { businessIds: selectedBusinessIds(event) })}
                    >
                      {businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
                    </select>
                    <small>{businessNames(user)}</small>
                  </td>
                  <td>{user.active ? 'Active' : 'Inactive'}</td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      disabled={saving || isSelf || (isOwner(user) && user.active && activeOwners <= 1)}
                      onClick={() => void updateUser(user, { active: !user.active })}
                    >
                      {saving ? 'Saving…' : user.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="is-secondary"
                      disabled={saving || !user.active}
                      onClick={() => void resetUserPassword(user)}
                    >
                      Reset password
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}
