import assert from 'node:assert/strict'
import {
  assertBusinessAssignment,
  assertManagerScope,
  getAppRedirectUrl,
  normalizeUserId,
  normalizeUserInput,
} from '../api/_lib/userManagement.js'

const owner = { role: 'owner' }
const admin = { role: 'admin' }
const assignedBusinesses = new Set(['business-a', 'business-b'])

const createInput = normalizeUserInput({
  name: 'Client User',
  email: 'CLIENT@EXAMPLE.COM',
  role: 'client',
  businessIds: ['business-a', 'business-a'],
})
assert.deepEqual(createInput, {
  name: 'Client User',
  email: 'client@example.com',
  role: 'client',
  businessIds: ['business-a'],
})

assert.doesNotThrow(() => assertManagerScope(owner, null, 'owner', []))
assert.doesNotThrow(() => assertBusinessAssignment('owner', []))
assert.throws(() => assertBusinessAssignment('client', []), /requires at least one business/)
assert.doesNotThrow(() => assertManagerScope(admin, assignedBusinesses, 'client', ['business-a']))
assert.throws(
  () => assertManagerScope(admin, assignedBusinesses, 'owner', ['business-a']),
  /Admins cannot assign this role/,
)
assert.equal(
  normalizeUserId('550e8400-e29b-41d4-a716-446655440000'),
  '550e8400-e29b-41d4-a716-446655440000',
)
assert.throws(() => normalizeUserId('not-a-user-id'), /valid user ID/)
process.env.PUBLIC_APP_URL = 'https://example.com/app?source=admin'
assert.equal(
  getAppRedirectUrl('reset'),
  'https://example.com/app?source=admin&reset=password',
)
delete process.env.PUBLIC_APP_URL
assert.throws(
  () => normalizeUserInput({ active: 'false' }, { partial: true }),
  /Active must be true or false/,
)
assert.throws(
  () => assertManagerScope(admin, assignedBusinesses, 'client', ['business-c']),
  /Admins may only assign their own businesses/,
)
assert.throws(
  () => normalizeUserInput({ name: '', email: 'invalid', role: 'unknown', businessIds: [] }),
  /Name is required/,
)

console.log('PASS user input normalization')
console.log('PASS owner assignment scope')
console.log('PASS admin business and role scope')
console.log('PASS tenant assignment and boolean validation')
console.log('PASS user ID and redirect validation')
