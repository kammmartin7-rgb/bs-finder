export function mapPlace(place, index, searchContext = {}) {
  const website = place.website?.trim()
  const businessName = place.title?.trim() || place.name?.trim() || place.businessName?.trim() || ''

  return {
    id: place.placeId || place.place_id || place.url || `${businessName}-${index}`,
    businessName,
    website: website || '',
    phone: place.phone?.trim() || place.phoneUnformatted?.trim() || place.phoneNumber?.trim() || '',
    address: place.address?.trim() || place.street?.trim() || '',
    rating: typeof place.totalScore === 'number' ? place.totalScore : (typeof place.rating === 'number' ? place.rating : null),
    reviewsCount: typeof place.reviewsCount === 'number' ? place.reviewsCount : (typeof place.reviews === 'number' ? place.reviews : null),
    mapsUrl: place.url?.trim() || place.mapsUrl?.trim() || '',
    category: place.categoryName?.trim() || place.categories?.[0]?.trim() || place.category?.trim() || '',
    city: place.city?.trim() || searchContext.city?.trim() || '',
    country: place.countryCode?.trim() || place.country?.trim() || searchContext.country?.trim() || '',
    source: 'Apify Google Maps',
  }
}

export async function searchLeads(businessType, city, country) {
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const apiBaseUrl = configuredApiUrl || (import.meta.env.DEV ? '' : null)

  if (apiBaseUrl === null) {
    throw new Error('Paid lead search is unavailable because billing is not enabled.')
  }

  const response = await fetch(`${apiBaseUrl}/api/leads/search`, {
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
  const searchContext = { city, country }
  return Array.isArray(data.leads) ? data.leads.map((place, index) => mapPlace(place, index, searchContext)) : []
}
