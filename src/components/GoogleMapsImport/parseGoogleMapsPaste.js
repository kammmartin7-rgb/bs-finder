// Best-effort parser for text copied from Google Maps business panels (no scraping).
function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function stripMapsUrl(value) {
  return cleanText(value).replace(/[)\].,;]+$/g, '')
}

function extractMapsUrl(text = '', explicitUrl = '') {
  const fromField = stripMapsUrl(explicitUrl)
  if (/google\.[\w.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(fromField)) return fromField
  const match = String(text).match(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|(?:www\.)?(?:google\.[\w.]+\/maps|maps\.google\.[\w.]+))[^\s)\]"']*/i)
  return match ? stripMapsUrl(match[0]) : ''
}

function extractRatingAndReviews(text = '') {
  let rating = ''
  let reviewsCount = ''

  const combined = text.match(/(\d(?:\.\d)?)\s*(?:\/\s*5)?\s*\(([\d,]+)\)/)
  if (combined) {
    rating = combined[1]
    reviewsCount = combined[2].replace(/,/g, '')
    return { rating, reviewsCount }
  }

  const starLine = text.match(/(?:★|\*)\s*(\d(?:\.\d)?)/)
  if (starLine) rating = starLine[1]

  const reviewsLine = text.match(/([\d,]+)\s*(?:reviews|review|ratings|rating|ביקורות|مراجع|отзыв)/i)
  if (reviewsLine) reviewsCount = reviewsLine[1].replace(/,/g, '')

  const loneRating = text.match(/(?:^|\n)\s*(\d\.\d)\s*(?:\/\s*5)?\s*(?:\n|$)/)
  if (!rating && loneRating) rating = loneRating[1]

  return { rating, reviewsCount }
}

function extractPhone(text = '') {
  const labeled = text.match(/(?:phone|tel|mobile|טלפון|هاتف|тел(?:ефон)?)\s*[: -]?\s*([+\d\s().-]{7,})/i)
  if (labeled) return cleanText(labeled[1])

  const candidates = [...text.matchAll(/(?:\+?\d[\d\s().-]{6,}\d)/g)]
    .map((match) => cleanText(match[0]))
    .filter((value) => value.replace(/\D/g, '').length >= 7)

  return candidates[0] || ''
}

function extractWebsite(text = '', mapsUrl = '') {
  const labeled = text.match(/(?:website|site|web|אתר|موقع|сайт)\s*[: -]?\s*((?:https?:\/\/)?(?:www\.)?[a-z0-9][-a-z0-9.]*\.[a-z]{2,}(?:\/[^\s]*)?)/i)
  if (labeled) return cleanText(labeled[1]).replace(/^https?:\/\//i, '')

  const urls = [...text.matchAll(/(?:https?:\/\/)?(?:www\.)?[a-z0-9][-a-z0-9.]*\.[a-z]{2,}(?:\/[^\s]*)?/gi)]
    .map((match) => cleanText(match[0]))
    .filter((value) => !/google\.|goo\.gl|maps\.|facebook\.com\/maps|gstatic/i.test(value))
    .filter((value) => !mapsUrl || !value.includes(mapsUrl))

  return urls[0]?.replace(/^https?:\/\//i, '') || ''
}

function isSkippableLine(line, parsed) {
  if (!line) return true
  if (/^https?:\/\//i.test(line)) return true
  if (/^\d\.\d/.test(line)) return true
  if (/^(phone|tel|website|address|directions|open|closed|hours|שעות|ساعات)/i.test(line)) return true
  if (parsed.phone && line.replace(/\D/g, '') === parsed.phone.replace(/\D/g, '')) return true
  if (parsed.website && line.toLowerCase().includes(parsed.website.toLowerCase())) return true
  return false
}

export function parseGoogleMapsPaste(rawText = '', mapsUrlInput = '') {
  const text = String(rawText || '').trim()
  const lines = text.split(/\r?\n/).map(cleanText).filter(Boolean)
  const mapsUrl = extractMapsUrl(text, mapsUrlInput)
  const { rating, reviewsCount } = extractRatingAndReviews(text)
  const phone = extractPhone(text)
  const website = extractWebsite(text, mapsUrl)

  const parsed = {
    businessName: '',
    category: '',
    city: '',
    address: '',
    phone,
    website,
    rating,
    reviewsCount,
    source: 'Google Maps',
    notes: '',
    mapsUrl,
  }

  for (const line of lines) {
    const catCity = line.match(/^(.+?)\s*[·•|]\s*(.+)$/)
    if (catCity && !/^\d/.test(catCity[1]) && catCity[1].length < 80) {
      parsed.category = cleanText(catCity[1])
      parsed.city = cleanText(catCity[2].split(',')[0])
      break
    }
  }

  for (const line of lines) {
    if (isSkippableLine(line, parsed)) continue
    if (line.includes('·') || line.includes('•') || line.includes('|')) {
      if (parsed.category) continue
    }
    parsed.businessName = line
    break
  }

  const addressHints = /\d|street|st\.|ave|road|rd\.|blvd|boulevard|רח|שדר|דרך|شارع|ул\.|улица|просп/i
  for (const line of lines) {
    if (line === parsed.businessName) continue
    if (isSkippableLine(line, parsed)) continue
    if ((parsed.category || parsed.city) && (line.includes('·') || line.includes('•'))) continue
    if (addressHints.test(line) || (parsed.city && line.includes(parsed.city))) {
      parsed.address = line
      break
    }
  }

  if (!parsed.city && parsed.address.includes(',')) {
    parsed.city = cleanText(parsed.address.split(',').slice(-2, -1)[0] || parsed.address.split(',').pop())
  }

  const unparsed = lines.filter((line) => {
    if (line === parsed.businessName || line === parsed.address) return false
    if (parsed.category && line.includes(parsed.category)) return false
    if (parsed.city && line.includes(parsed.city)) return false
    return isSkippableLine(line, parsed)
  })

  if (unparsed.length) {
    parsed.notes = unparsed.join('\n')
  }

  return parsed
}

export default parseGoogleMapsPaste
