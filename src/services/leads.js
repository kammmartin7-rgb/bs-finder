export function mapPlace(place, index) {
  const website = place.website?.trim()

  return {
    id: place.placeId || place.url || `${place.title}-${index}`,
    businessName: place.title?.trim() || '',
    website: website || '',
    phone: place.phone?.trim() || '',
    address: place.address?.trim() || '',
    rating: typeof place.totalScore === 'number' ? place.totalScore : null,
    reviewsCount:
      typeof place.reviewsCount === 'number' ? place.reviewsCount : null,
    mapsUrl: place.url?.trim() || '',
  }
}

export async function searchLeads(businessType, city) {
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
  return Array.isArray(data.leads) ? data.leads : []
}
