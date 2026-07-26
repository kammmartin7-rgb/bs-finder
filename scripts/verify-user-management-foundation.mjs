import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const migration = read('supabase/migrations/202607260001_saas_user_management_foundation.sql')
const auditMigration = read('supabase/migrations/202607260002_user_management_audit.sql')
const realtimeMigration = read('supabase/migrations/202607260003_authorization_profile_realtime.sql')
const browserSource = [
  read('src/services/supabaseClient.js'),
  read('src/services/userDirectory.js'),
  read('src/context/AuthContext.jsx'),
].join('\n')
const serverSource = read('api/_lib/supabaseAdmin.js')
const createEndpoint = read('api/users/index.js')
const updateEndpoint = read('api/users/[id].js')
const passwordResetEndpoint = read('api/users/password-reset.js')
const managementHelpers = read('api/_lib/userManagement.js')

for (const requiredSql of [
  'create table if not exists public.businesses',
  'create table if not exists public.business_memberships',
  'create or replace function private.current_user_is_active()',
  'create or replace function private.current_user_can_manage_user',
  'alter table public.businesses enable row level security',
  'alter table public.business_memberships enable row level security',
  'create policy "authorized managers can read users"',
  'revoke insert, update, delete on public.users, public.businesses, public.business_memberships from authenticated',
]) {
  assert.ok(migration.includes(requiredSql), `Missing migration foundation: ${requiredSql}`)
}

assert.equal(browserSource.includes('SUPABASE_SERVICE_ROLE_KEY'), false, 'Service-role credentials must never enter browser source.')
assert.ok(serverSource.includes("requiredEnvironmentValue('SUPABASE_SERVICE_ROLE_KEY')"), 'Server admin client must require its service-role environment variable.')
assert.ok(serverSource.includes('requireActiveManager'), 'Server foundation must authenticate owner/admin requests.')
assert.ok(auditMigration.includes('create table if not exists public.user_management_audit'), 'User-management operations must be audited.')
assert.ok(auditMigration.includes('create or replace function public.provision_invited_user'), 'Provisioning and its audit must be atomic.')
assert.ok(auditMigration.includes('create or replace function public.apply_user_management_update'), 'Authorization changes and their audit must be atomic.')
assert.ok(auditMigration.includes('business-os-active-owner-transition'), 'Last-owner transitions must be serialized.')
assert.ok(realtimeMigration.includes('alter publication supabase_realtime add table public.users'), 'Profile changes must be published in real time.')
assert.ok(createEndpoint.includes('inviteUserByEmail'), 'Provisioning must create a Supabase Auth invitation.')
assert.ok(createEndpoint.includes('provisioning: true'), 'Invited profiles must remain inactive until provisioning commits.')
assert.ok(migration.includes("new.raw_user_meta_data ->> 'provisioning' = 'true' then false"), 'The Auth trigger must fail closed during invitation provisioning.')
assert.ok(createEndpoint.includes("rpc('provision_invited_user'"), 'Provisioning must atomically create the public profile, memberships, and audit record.')
assert.ok(updateEndpoint.includes("ban_duration: '876000h'"), 'Disabling a profile must also revoke Auth login access.')
assert.ok(updateEndpoint.includes("ban_duration: 'none'"), 'Reactivating a profile must restore Auth login access.')
assert.ok(createEndpoint.includes("getAppRedirectUrl('setup')"), 'Invitation links must open the password setup flow.')
assert.ok(managementHelpers.includes("url.searchParams.set(mode, 'password')"), 'Auth redirect modes must use the shared safe URL helper.')
assert.ok(passwordResetEndpoint.includes('resetPasswordForEmail'), 'Managers must be able to send a password recovery email.')
assert.ok(passwordResetEndpoint.includes("'password_reset_requested'"), 'Manager password reset requests must be audited before email delivery.')

console.log('PASS user profile foundation')
console.log('PASS businesses and memberships foundation')
console.log('PASS RLS policy foundation')
console.log('PASS server-only service-role boundary')
console.log('PASS trusted invitation and safe disable endpoints')
console.log('PASS authorization profile realtime refresh')
console.log('PASS invitation and password recovery completion paths')
