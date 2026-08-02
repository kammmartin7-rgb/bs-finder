export function createIsraeliWhatsAppUrl(phone) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^00/, '')
  if (!digits) return ''
  const internationalNumber = digits.startsWith('972') ? digits : `972${digits.replace(/^0/, '')}`
  return `https://wa.me/${internationalNumber}`
}

export function createWhatsAppMessageUrl(phone, message) {
  const whatsappUrl = createIsraeliWhatsAppUrl(phone)
  const text = String(message || '').trim()
  if (!whatsappUrl || !text) return ''
  return `${whatsappUrl}?text=${encodeURIComponent(text)}`
}

export function createDemoWhatsAppMessage(demoUrl, businessName = '') {
  const publicDemoUrl = String(demoUrl || '').trim()
  if (!/^https:\/\//i.test(publicDemoUrl)) return ''
  const recipient = String(businessName || '').trim()
  return `היי${recipient ? ` ${recipient}` : ''}, הכנתי לכם דוגמה אישית לאתר חדש.

הדמו מבוסס על הפרטים והתמונה של העסק שלכם.

אפשר לראות כאן:
${publicDemoUrl}

אם אהבתם, אפשר להפוך אותו לאתר אמיתי ולהעלות אותו לאוויר במהירות.

אשמח לשמוע מה דעתכם.`
}

export function createDemoWhatsAppUrl(phone, demoUrl, businessName = '') {
  return createWhatsAppMessageUrl(phone, createDemoWhatsAppMessage(demoUrl, businessName))
}
