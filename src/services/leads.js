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

export function attachSearchMetadata(lead, { businessType, city, country } = {}) {
  return {
    ...lead,
    searchBusinessType: cleanText(businessType || lead.searchBusinessType),
    searchedCity: cleanText(city || lead.searchedCity || lead.city),
    searchedCountry: cleanText(country || lead.searchedCountry || lead.country),
    createdAt: lead.createdAt || new Date().toISOString(),
    isDemo: false,
  }
}

export async function searchLeads(businessType, city, country) {
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const apiBaseUrl = configuredApiUrl || (import.meta.env.DEV ? '' : null)

  if (apiBaseUrl === null) {
    throw new Error('Paid lead search is unavailable because billing is not enabled.')
  }

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
  return Array.isArray(data.leads)
    ? data.leads.map((place, index) => attachSearchMetadata(mapPlace(place, index, searchContext), searchContext))
    : []
}
