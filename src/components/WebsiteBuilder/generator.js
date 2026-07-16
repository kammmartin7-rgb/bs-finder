// Converts business data, a template, and optional overrides into a render-ready site model.
// This module is intentionally UI-independent so it can later support saving or exporting sites.

import { getWebsiteSection } from './sections'
import { DEFAULT_TEMPLATE_ID, getWebsiteTemplate } from './templates'
import { formatIsraeliAddress } from '../../services/israeliAddress'

const FALLBACK_BUSINESS = {
  name: 'העסק שלך',
  location: 'האזור שלך',
  phone: '',
  address: '',
  website: '',
  mapsUrl: '',
  rating: null,
  reviewsCount: null,
}

export function normalizeBusiness(business = {}) {
  return {
    name: business.name || business.businessName || FALLBACK_BUSINESS.name,
    type: business.businessType || business.category || business.type || '',
    location: business.location || business.city || business.address || FALLBACK_BUSINESS.location,
    phone: business.phone || business.phoneNumber || FALLBACK_BUSINESS.phone,
    address: business.address || FALLBACK_BUSINESS.address,
    website: business.website || FALLBACK_BUSINESS.website,
    mapsUrl: business.mapsUrl || business.url || FALLBACK_BUSINESS.mapsUrl,
    rating: typeof business.rating === 'number' ? business.rating : business.totalScore,
    reviewsCount: business.reviewsCount ?? FALLBACK_BUSINESS.reviewsCount,
    email: business.email || '',
    language: business.websiteLanguage || business.language || 'he',
  }
}

export function generateWebsite({
  business = {},
  templateId = DEFAULT_TEMPLATE_ID,
  sectionIds,
  contentOverrides = {},
  language,
} = {}) {
  const normalizedBusiness = normalizeBusiness(business)
  normalizedBusiness.language = language || normalizedBusiness.language
  normalizedBusiness.location = formatIsraeliAddress(normalizedBusiness.location)
  normalizedBusiness.address = formatIsraeliAddress(normalizedBusiness.address)
  const template = getWebsiteTemplate(templateId)
  const requestedSections = sectionIds || template.defaultSections

  const sections = requestedSections
    .map((sectionId) => getWebsiteSection(sectionId))
    .filter(Boolean)
    .map((section) => ({
      id: section.id,
      type: section.type,
      content: {
        ...section.createContent(normalizedBusiness),
        ...(contentOverrides[section.id] || {}),
      },
    }))

  return {
    schemaVersion: 1,
    template: {
      id: template.id,
      name: template.name,
      theme: { ...template.theme },
    },
    business: normalizedBusiness,
    sections,
  }
}

export default generateWebsite
