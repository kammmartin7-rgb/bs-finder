const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '')
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

function configured() {
  return Boolean(supabaseUrl && publishableKey)
}

function headers(prefer) {
  return {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

export async function saveDemoToSupabase(record) {
  if (!configured() || !record?.id || !record?.business) return false
  const response = await fetch(`${supabaseUrl}/rest/v1/demos?on_conflict=id`, {
    method: 'POST',
    headers: headers('resolution=merge-duplicates,return=minimal'),
    body: JSON.stringify({ id: record.id, payload: record }),
  })
  if (!response.ok) throw new Error(`Unable to save demo (${response.status}).`)
  return true
}

export async function loadDemoFromSupabase(id) {
  if (!configured() || !id) return null
  const response = await fetch(`${supabaseUrl}/rest/v1/demos?id=eq.${encodeURIComponent(id)}&select=payload&limit=1`, {
    headers: headers(),
  })
  if (!response.ok) throw new Error(`Unable to load demo (${response.status}).`)
  const rows = await response.json()
  const record = rows[0]?.payload
  return record?.business ? { ...record, id } : null
}
