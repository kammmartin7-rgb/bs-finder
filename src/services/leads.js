import {
  buildBatchLabel,
  createBatchId,
  createImportBatchContext,
  detectBusinessTypeGroup,
  formatImportedDate,
  resolveLeadCategory,
  UNCLASSIFIED_STORAGE_LABEL,
} from './leadCategory'

function cleanText(value) {
  return String(value || '').trim()
}

function readCategory(place) {
  if (place.categoryName) return cleanText(place.categoryName)
  if (typeof place.categories?.[0] === 'string') return cleanText(place.categories[0])
  if (place.categories?.[0]?.name) return cleanText(place.categories[0].name)
  if (place.categories?.[0]?.title) return cleanText(place.categories[0].title)
  return cleanText(place.category)
}

function buildAddress(place, searchContext = {}) {
  const direct = cleanText(place.address || place.formattedAddress || place.fullAddress)
  if (direct) return direct

  const parts = [
    place.street,
    place.city,
    place.state,
    place.postalCode,
    place.countryCode || place.country || searchContext.country,
  ]
    .map((value) => cleanText(value))
    .filter(Boolean)

  return parts.join(', ')
}

export function mapPlace(place, index, searchContext = {}) {
  const website = cleanText(place.website)
  const businessName = cleanText(place.title || place.name || place.businessName)
  const placeId = cleanText(place.placeId || place.place_id)
  const stableId = placeId || cleanText(place.url) || `${businessName || 'lead'}-${index}`

  return {
    id: stableId,
    placeId: placeId || undefined,
    businessName,
    website,
    phone: cleanText(place.phone || place.phoneUnformatted || place.phoneNumber || place.internationalPhoneNumber),
    address: buildAddress(place, searchContext),
    rating: typeof place.totalScore === 'number'
      ? place.totalScore
      : (typeof place.rating === 'number' ? place.rating : null),
    reviewsCount: typeof place.reviewsCount === 'number'
      ? place.reviewsCount
      : (typeof place.reviews === 'number'
        ? place.reviews
        : (typeof place.reviewsTotal === 'number' ? place.reviewsTotal : null)),
    mapsUrl: cleanText(place.url || place.mapsUrl),
    category: readCategory(place),
    city: cleanText(place.city || searchContext.city),
    country: cleanText(place.countryCode || place.country || searchContext.country),
    source: cleanText(place.source) || 'Apify Google Maps',
    isDemo: false,
  }
}

export function attachSearchMetadata(lead, batch = {}) {
  const rawBusinessType = cleanText(batch.businessType || businessTypeFromBatch(batch, lead))
  const resolvedCity = cleanText(batch.city || lead.searchedCity || lead.city)
  const resolvedCountry = cleanText(batch.country || lead.searchedCountry || lead.country)
  const resolvedImportedAt = batch.importedAt || lead.importedAt || new Date().toISOString()
  const resolvedImportedDate = batch.importedDate || formatImportedDate(resolvedImportedAt)
  const resolvedBatchId = batch.batchId || lead.batchId || createBatchId(rawBusinessType, resolvedCity, resolvedImportedAt)
  const resolvedSource = cleanText(batch.source) || 'Apify'
  const enriched = {
    ...lead,
    searchBusinessType: rawBusinessType,
    searchedCity: resolvedCity,
    searchedCountry: resolvedCountry,
    city: resolvedCity,
    country: resolvedCountry,
    importedAt: resolvedImportedAt,
    importedDate: resolvedImportedDate,
    batchId: resolvedBatchId,
    source: resolvedSource,
    createdAt: lead.createdAt || resolvedImportedAt,
    isDemo: false,
    legacyBatch: false,
  }

  const normalizedType = resolveLeadCategory({ ...enriched, businessType: rawBusinessType })
  const savedBusinessType = normalizedType !== UNCLASSIFIED_STORAGE_LABEL ? normalizedType : rawBusinessType
  const group = detectBusinessTypeGroup({ ...enriched, businessType: savedBusinessType })
  const resolvedBatchLabel = batch.batchLabel || buildBatchLabel(savedBusinessType, resolvedCity, resolvedImportedAt)

  return {
    ...enriched,
    businessType: savedBusinessType,
    category: group?.filterLabel || enriched.category || (savedBusinessType !== UNCLASSIFIED_STORAGE_LABEL ? savedBusinessType : 'Unclassified'),
    batchLabel: resolvedBatchLabel,
  }
}

function businessTypeFromBatch(batch, lead) {
  return batch.businessType || lead.searchBusinessType
}

export { createImportBatchContext }

export async function searchLeads(businessType, city, country) {
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const apiBaseUrl = configuredApiUrl || ''

  let response

  try {
    response = await fetch(`${apiBaseUrl}/api/leads/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessType,
        city,
        country,
      }),
    })
  } catch {
    throw new Error('Cannot reach the lead search server. Start the local API with `cd server && npm start`.')
  }

  if (!response.ok) {
    let message = response.statusText
    try {
      const errorBody = await response.json()
      message = errorBody.error || errorBody.message || message
    } catch {
      // Keep default status text when the body is not JSON.
    }
    throw new Error(message)
  }

  const data = await response.json()
  const searchContext = { businessType, city, country }
  const batch = createImportBatchContext(businessType, city, country)
  return Array.isArray(data.leads)
    ? data.leads.map((place, index) => attachSearchMetadata(mapPlace(place, index, searchContext), batch))
    : []
}
