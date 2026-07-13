const API_BASE = 'https://api.apify.com/v2'
const POLL_INTERVAL_MS = 3000
const MAX_POLL_MS = 5 * 60 * 1000

function getToken() { return process.env.APIFY_TOKEN?.trim() }

function getActorId() {
  const actorId =
    process.env.APIFY_ACTOR_ID ||
    'compass/crawler-google-places'

  return actorId.replace('/', '~')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apifyFetch(path, options = {}) {
  const token = getToken()

  if (!token) {
    throw new Error('Apify token is missing. Add APIFY_TOKEN to .env.')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const errorBody = await response.json()
      message = errorBody.error?.message || errorBody.message || message
    } catch {
      // Keep default status text when the body is not JSON.
    }
    throw new Error(`Apify request failed (${response.status}): ${message}`)
  }

  return response.json()
}

function isRunning(status) {
  return status === 'READY' || status === 'RUNNING'
}

function isFailure(status) {
  return status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT'
}

export async function fetchApifyLeads(businessType, city, country) {
  const actorId = getActorId()
  const locationQuery = `${city.trim()}, ${country.trim()}`

  const runResponse = await apifyFetch(`/acts/${actorId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      searchStringsArray: [businessType.trim()],
      locationQuery,
      maxCrawledPlacesPerSearch: 50,
      language: 'en',
    }),
  })

  const runId = runResponse.data.id
  let datasetId = runResponse.data.defaultDatasetId
  let status = runResponse.data.status
  const startedAt = Date.now()

  while (isRunning(status)) {
    if (Date.now() - startedAt > MAX_POLL_MS) {
      throw new Error('Search timed out. Please try again.')
    }

    await sleep(POLL_INTERVAL_MS)

    const pollResponse = await apifyFetch(`/actor-runs/${runId}`)
    status = pollResponse.data.status
    datasetId = pollResponse.data.defaultDatasetId || datasetId
  }

  if (isFailure(status)) {
    throw new Error(`Apify actor run ${status.toLowerCase()}.`)
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify actor run ended with status: ${status}`)
  }

  const items = await apifyFetch(`/datasets/${datasetId}/items?format=json&clean=true&limit=50`)
  return Array.isArray(items) ? items.slice(0, 50) : []
}
