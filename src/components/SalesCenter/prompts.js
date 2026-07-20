// Builds deterministic sales copy from lead data.
// These helpers can later be replaced by AI-backed generation without changing the UI.

export function normalizeSalesLead(lead = {}) {
  return {
    businessName: lead.businessName || lead.name || 'your business',
    contactName: lead.contactName || 'there',
    city: lead.city || lead.location || lead.address || 'your area',
    website: lead.website || '',
    phone: lead.phone || lead.phoneNumber || '',
    rating: typeof lead.rating === 'number' ? lead.rating : lead.totalScore,
    reviewsCount: lead.reviewsCount ?? null,
  }
}

function opportunityText(lead) {
  if (!lead.website) {
    return 'I noticed the business does not appear to have a dedicated website yet'
  }

  return 'I noticed there may be an opportunity to make the website clearer, faster, and more effective at generating inquiries'
}

export function createPhoneScript(rawLead) {
  const lead = normalizeSalesLead(rawLead)

  return `Hi, is this ${lead.businessName}? My name is [Your Name] from GrowthPilot. ${opportunityText(lead)}. We create modern, mobile-friendly business websites designed to build trust and make it easier for customers to call, message, or visit. I prepared a quick demo specifically for ${lead.businessName}. Would you have two minutes for me to show you what it could look like?`
}

export function createWhatsAppMessage(rawLead) {
  const lead = normalizeSalesLead(rawLead)

  return `Hi ${lead.contactName}, I’m [Your Name] from GrowthPilot. I came across ${lead.businessName} while looking at businesses in ${lead.city}. ${opportunityText(lead)}, so I prepared a modern demo site for you—no commitment required. It shows how customers could quickly learn about your services, call, WhatsApp, and find your location. Would you like me to send you the preview?`
}

export function createEmailTemplate(rawLead) {
  const lead = normalizeSalesLead(rawLead)

  return `Subject: A website demo for ${lead.businessName}

Hi ${lead.contactName},

I’m [Your Name] from GrowthPilot. I recently found ${lead.businessName} and was impressed by the business${lead.rating ? `’s ${lead.rating.toFixed(1)} rating` : ''}${lead.reviewsCount ? ` across ${lead.reviewsCount} customer reviews` : ''}.

${opportunityText(lead)}. I created a complimentary one-page demo showing how a polished online presence could present your services, strengthen customer trust, and turn more visitors into calls and messages.

I’d be happy to send the preview and walk you through it. Would you be available for a quick conversation this week?

Best,
[Your Name]
GrowthPilot
[Your Phone]`
}

export function createObjectionResponses(rawLead) {
  const lead = normalizeSalesLead(rawLead)

  return [
    {
      objection: '“We already have a website.”',
      response: `That makes sense, and I’m not suggesting change for its own sake. The demo for ${lead.businessName} simply shows a more modern, conversion-focused option. You can compare it with the current site and decide whether any of the improvements would be valuable.`,
    },
    {
      objection: '“We get enough business from referrals.”',
      response: 'That is a great sign—strong referrals mean customers already trust you. A professional website supports those referrals by giving prospective customers confidence when they look you up and making it easy to contact you immediately.',
    },
    {
      objection: '“It’s too expensive.”',
      response: 'I understand that budget matters. We can focus on the essentials first: a professional mobile-friendly page, clear services, trust signals, and direct contact buttons. The goal is to create an asset that can pay for itself through new inquiries.',
    },
    {
      objection: '“I don’t have time right now.”',
      response: `Absolutely. The process is designed to require very little of your time, and the initial demo for ${lead.businessName} is already prepared. A short review is enough to decide whether it is worth discussing further.`,
    },
  ]
}

export function createSalesContent(lead) {
  return {
    phoneScript: createPhoneScript(lead),
    whatsappMessage: createWhatsAppMessage(lead),
    emailTemplate: createEmailTemplate(lead),
    objections: createObjectionResponses(lead),
  }
}

export default createSalesContent
