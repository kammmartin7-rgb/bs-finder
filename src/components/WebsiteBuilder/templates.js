// Defines the visual presets available to the Website Builder engine.
// Templates contain presentation choices only; content is assembled by generator.js.

export const DEFAULT_TEMPLATE_ID = 'modern-business'

export const websiteTemplates = {
  'modern-business': {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'A clean, professional layout for local service businesses.',
    theme: {
      background: '#f5f7fb',
      surface: '#ffffff',
      text: '#10233f',
      mutedText: '#5b6b82',
      primary: '#176b87',
      accent: '#d99b45',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
    defaultSections: ['hero', 'about', 'services', 'why-us', 'testimonials', 'service-areas', 'faq', 'contact', 'footer'],
  },
  'bold-local': {
    id: 'bold-local',
    name: 'Bold Local',
    description: 'A high-contrast layout with strong calls to action.',
    theme: {
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      mutedText: '#d1d5db',
      primary: '#f59e0b',
      accent: '#22c55e',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
    defaultSections: ['hero', 'about', 'services', 'why-us', 'testimonials', 'service-areas', 'faq', 'contact', 'footer'],
  },
}

export function getWebsiteTemplate(templateId = DEFAULT_TEMPLATE_ID) {
  return websiteTemplates[templateId] || websiteTemplates[DEFAULT_TEMPLATE_ID]
}

export default websiteTemplates
