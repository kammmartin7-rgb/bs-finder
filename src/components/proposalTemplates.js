// Predefined Proposal Templates V1 data; UI edits are stored per business by ProposalGenerator.
export const PROPOSAL_TEMPLATES = [
  { id: 'launch', nameKey: 'basicWebsite', price: 2900, delivery: '5–7', revisions: 1, recommended: false, features: ['One-page mobile website', 'Call, WhatsApp and Maps', 'Business content setup', 'One revision round', 'Basic SEO setup'] },
  { id: 'growth', nameKey: 'businessWebsite', price: 4900, delivery: '7', revisions: 2, recommended: true, features: ['Premium one-page website', 'Custom business content', 'Call, WhatsApp, Maps and contact form', 'Google reputation section', 'Two revision rounds', 'Domain connection assistance', 'Basic SEO and launch checks', '7 days correction support'] },
  { id: 'pro', nameKey: 'premiumWebsite', price: 7900, delivery: '10–14', revisions: 3, recommended: false, features: ['Up to five pages', 'Expanded service content', 'Gallery or portfolio', 'Three revision rounds', 'Domain connection assistance', 'SEO-ready page structure', '14 days correction support'] },
]

export function getProposalTemplate(id) { return PROPOSAL_TEMPLATES.find((template) => template.id === id) || PROPOSAL_TEMPLATES[1] }

export function createProposalDraft(business = {}, templateId = 'growth') {
  const template = getProposalTemplate(templateId)
  return { templateId: template.id, businessName: business.businessName || business.name || '', contactName: business.contactName || business.ownerName || business.contact || '', proposalDate: new Date().toISOString().slice(0, 10), price: template.price, delivery: template.delivery, revisions: template.revisions, features: template.features.join('\n') }
}

export function applyProposalTemplate(currentDraft, templateId) {
  const template = getProposalTemplate(templateId)
  return { ...currentDraft, templateId: template.id, price: template.price, delivery: template.delivery, revisions: template.revisions, features: template.features.join('\n') }
}

export function proposalFeatures(draft) { return String(draft.features || '').split('\n').map((feature) => feature.trim()).filter(Boolean) }
