import assert from 'node:assert/strict'
import {
  canAccess,
  getProfileAuthorizationError,
  hasPermission,
  PERMISSIONS,
  ROLES,
  SCREEN_PERMISSIONS,
} from '../src/services/authorization.js'

const profile = (role, active = true) => ({
  auth_user_id: `${role}-user`,
  email: `${role}@example.com`,
  role,
  active,
  business_id: role === ROLES.CLIENT ? 'client-business' : null,
  created_at: '2026-07-23T00:00:00.000Z',
})

const activeOwner = profile(ROLES.OWNER)
const activeClient = profile(ROLES.CLIENT)
const inactiveOwner = profile(ROLES.OWNER, false)

assert.equal(getProfileAuthorizationError(activeOwner), '', 'Active owner must pass login authorization.')
assert.equal(getProfileAuthorizationError(activeClient), '', 'Active client must pass login authorization.')
assert.equal(getProfileAuthorizationError(inactiveOwner), 'This account is inactive.', 'Inactive user must be rejected.')
assert.equal(getProfileAuthorizationError(null), 'No authorization profile exists for this account.', 'Missing user profile must be rejected.')

assert.equal(canAccess(activeOwner, 'screen', 'users'), true, 'Owner must retain full access.')
assert.equal(canAccess(profile(ROLES.ADMIN), 'screen', 'users'), true, 'Admin must reach assigned user management.')
assert.equal(canAccess(activeClient, 'screen', 'dashboard'), true, 'Client must reach its dashboard after login.')
assert.equal(canAccess(activeClient, 'screen', 'users'), false, 'Client must not reach user administration.')
assert.equal(hasPermission(profile(ROLES.SALES), PERMISSIONS.CRM), true, 'Sales must access CRM.')
assert.equal(hasPermission(profile(ROLES.SALES), PERMISSIONS.FINANCE), false, 'Sales must not access finance.')
assert.equal(hasPermission(profile(ROLES.DEMO), PERMISSIONS.DEMO_READ_ONLY), true, 'Demo role must be read-only.')
assert.equal(hasPermission(inactiveOwner, PERMISSIONS.DASHBOARD), false, 'Inactive users must have no permissions.')

for (const role of Object.values(ROLES)) {
  for (const screen of Object.keys(SCREEN_PERMISSIONS)) {
    assert.equal(typeof canAccess(profile(role), 'screen', screen), 'boolean', `${role}/${screen} access must resolve safely.`)
  }
}

console.log('PASS active owner login')
console.log('PASS active client login')
console.log('PASS inactive user rejection')
console.log('PASS post-login permission enforcement')
console.log('PASS all role/screen permission evaluations')
