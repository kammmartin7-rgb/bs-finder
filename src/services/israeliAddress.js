const CITY_NAMES_HE = new Map([
  ['petah tikva', 'פתח תקווה'],
  ['petach tikva', 'פתח תקווה'],
  ['tel aviv', 'תל אביב'],
  ['tel aviv-yafo', 'תל אביב-יפו'],
  ['tel aviv yafo', 'תל אביב-יפו'],
  ['jerusalem', 'ירושלים'],
  ['rishon lezion', 'ראשון לציון'],
  ['rishon le zion', 'ראשון לציון'],
  ['holon', 'חולון'],
  ['bat yam', 'בת ים'],
  ['ramat gan', 'רמת גן'],
  ['bnei brak', 'בני ברק'],
  ['bene beraq', 'בני ברק'],
  ['haifa', 'חיפה'],
])

const STREET_WORDS_HE = new Map([
  ['mivtsa', 'מבצע'],
  ['mivtza', 'מבצע'],
  ['dekel', 'דקל'],
  ['herzl', 'הרצל'],
  ['jabotinsky', 'ז׳בוטינסקי'],
  ['zhabotinsky', 'ז׳בוטינסקי'],
  ['bialik', 'ביאליק'],
  ['dizengoff', 'דיזנגוף'],
  ['rothschild', 'רוטשילד'],
  ['weizmann', 'ויצמן'],
  ['begin', 'בגין'],
  ['ben', 'בן'],
  ['gurion', 'גוריון'],
])

const STREET_SUFFIX = /\b(?:st\.?|street|rd\.?|road|ave\.?|avenue)\b/gi

function normalized(value) {
  return String(value || '').trim().toLowerCase().replace(/[.,]+$/g, '').replace(/\s+/g, ' ')
}

function translateCity(value) {
  const text = String(value || '').trim()
  return CITY_NAMES_HE.get(normalized(text)) || (normalized(text) === 'israel' ? 'ישראל' : '')
}

function translateStreet(value) {
  const text = String(value || '').trim()
  if (!text || /[\u0590-\u05ff]/.test(text) && !/[a-z]/i.test(text)) return text

  const withoutSuffix = text.replace(STREET_SUFFIX, ' ').replace(/\s+/g, ' ').trim()
  const numberMatch = withoutSuffix.match(/(?:^|\s)(\d+[a-z]?)$/i)
  const number = numberMatch?.[1] || ''
  const streetName = numberMatch ? withoutSuffix.slice(0, numberMatch.index).trim() : withoutSuffix
  const words = streetName.split(/[\s-]+/).filter(Boolean)
  const translatedWords = words.map((word) => STREET_WORDS_HE.get(normalized(word)))
  if (!words.length || translatedWords.some((word) => !word)) return ''
  return `${translatedWords.join(' ')}${number ? ` ${number}` : ''}`
}

export function formatIsraeliAddress(value) {
  const original = String(value || '').trim()
  if (!original || !/[a-z]/i.test(original)) return original

  const parts = original.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 1) return translateCity(parts[0]) || translateStreet(parts[0]) || original

  const translated = parts.map((part, index) => {
    const city = translateCity(part)
    if (city) return city
    if (index === 0) return translateStreet(part)
    return ''
  })

  return translated.every(Boolean) ? translated.join(', ') : original
}

export default formatIsraeliAddress
