import { fetchApifyLeads } from '../../server/services/apify.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { businessType, city, country } = req.body || {}

  if (![businessType, city, country].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({
      error: 'Please enter Business Type, City, and Country.',
    })
  }

  if (!process.env.APIFY_TOKEN?.trim()) {
    return res.status(503).json({
      error: 'Paid lead search is not configured for this deployment.',
    })
  }

  try {
    const leads = await fetchApifyLeads(businessType, city, country)
    return res.status(200).json({ leads })
  } catch (error) {
    console.error('Paid lead search failed:', error instanceof Error ? error.message : 'Unknown error')
    return res.status(500).json({
      error: 'Paid lead search failed. Please try again.',
    })
  }
}
