// Parses user-provided CSV into the existing BS Hunter lead object shape.
function parseCsvRows(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const next = text[index + 1]
    if (character === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }

  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function normalizeHeader(value) {
  return String(value || '').replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findValue(record, aliases) {
  const key = aliases.find((alias) => record[alias] !== undefined)
  return key ? record[key] : ''
}

function parseNumber(value) {
  const normalizedValue = String(value || '').replaceAll(',', '').trim()
  if (!normalizedValue) return null
  const number = Number(normalizedValue)
  return Number.isFinite(number) ? number : null
}

export function parseLeadsCsv(text) {
  const rows = parseCsvRows(String(text || '').trim())
  if (rows.length < 2) throw new Error('CSV must include a header row and at least one lead.')

  const headers = rows[0].map(normalizeHeader)
  const leads = rows.slice(1).map((values, index) => {
    const record = Object.fromEntries(headers.map((header, column) => [header, values[column] || '']))
    const businessName = findValue(record, ['businessname', 'name', 'title']).trim()
    const address = findValue(record, ['address', 'fulladdress']).trim()
    const mapsUrl = findValue(record, ['mapsurl', 'googlemapsurl', 'googlemaps', 'maps']).trim()

    if (!businessName) return null

    return {
      id: `csv-${mapsUrl || `${businessName}-${address}`}-${index}`,
      businessName,
      website: findValue(record, ['website', 'site']).trim(),
      phone: findValue(record, ['phone', 'phonenumber', 'telephone']).trim(),
      address,
      rating: parseNumber(findValue(record, ['rating', 'googlerating', 'totalscore'])),
      reviewsCount: parseNumber(findValue(record, ['reviews', 'reviewscount', 'numberofreviews'])),
      mapsUrl,
      isDemo: false,
    }
  }).filter(Boolean)

  if (leads.length === 0) throw new Error('No rows with a business name were found.')
  return leads
}
