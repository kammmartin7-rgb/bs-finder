export function createIsraeliWhatsAppUrl(phone) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^00/, '')
  if (!digits) return ''
  const internationalNumber = digits.startsWith('972') ? digits : `972${digits.replace(/^0/, '')}`
  return `https://wa.me/${internationalNumber}`
}
