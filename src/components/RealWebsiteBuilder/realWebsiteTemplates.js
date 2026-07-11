// Defines genuinely different layout systems for paid-customer websites.
export const REAL_WEBSITE_TEMPLATES = [
  { id: 'modern-service', nameKey: 'rwbTemplateModern', className: 'template-service', heroLayout: 'split', sectionOrder: ['trust', 'services', 'about', 'process', 'highlights', 'reviews', 'faq'], font: 'Inter, ui-sans-serif, system-ui, sans-serif', displayFont: 'Inter, ui-sans-serif, system-ui, sans-serif', radius: '22px' },
  { id: 'premium-local', nameKey: 'rwbTemplatePremium', className: 'template-luxury', heroLayout: 'editorial', sectionOrder: ['about', 'services', 'highlights', 'reviews', 'process', 'faq', 'trust'], font: 'Inter, ui-sans-serif, system-ui, sans-serif', displayFont: 'Georgia, Times New Roman, serif', radius: '6px' },
  { id: 'professional-office', nameKey: 'rwbTemplateOffice', className: 'template-corporate', heroLayout: 'structured', sectionOrder: ['trust', 'highlights', 'about', 'services', 'process', 'faq', 'reviews'], font: 'Inter, ui-sans-serif, system-ui, sans-serif', displayFont: 'Inter, ui-sans-serif, system-ui, sans-serif', radius: '12px' },
]

export const DEFAULT_REAL_TEMPLATE = REAL_WEBSITE_TEMPLATES[0].id
export function getRealWebsiteTemplate(id) { return REAL_WEBSITE_TEMPLATES.find((template) => template.id === id) || REAL_WEBSITE_TEMPLATES[0] }
