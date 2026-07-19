// Sales-tracking selectors for CRM widgets (read-only; uses lead record fields only).
import { isDemoLead } from '../BusinessOS/dashboardFilters'
import { SALES_STATUS, normalizeSalesStatus } from '../../services/leadSalesTracking'

export const SALES_STATUS_HE = {
  [SALES_STATUS.NEW]: 'חדש',
  [SALES_STATUS.MESSAGE_SENT]: 'הודעה נשלחה',
  [SALES_STATUS.DEMO_OPENED]: 'דמו נפתח',
  [SALES_STATUS.IN_CALL]: 'בשיחה',
  [SALES_STATUS.PROPOSAL_SENT]: 'הצעה נשלחה',
  [SALES_STATUS.FOLLOW_UP]: 'מעקב',
  [SALES_STATUS.WON]: 'נסגר',
  [SALES_STATUS.LOST]: 'אבוד',
}

const CLOSED_SALES_STATUSES = new Set([SALES_STATUS.WON, SALES_STATUS.LOST])

export const SALES_ACTION_CATEGORIES = {
  MUST_HANDLE_NOW: 'must_handle_now',
  CALL_NOW: 'call_now',
  SEND_WHATSAPP: 'send_whatsapp',
  OPEN_DEMO: 'open_demo',
  READY_FOR_PROPOSAL: 'ready_for_proposal',
  DEAL_CLOSED: 'deal_closed',
}

export const SALES_ACTION_CATEGORY_ORDER = [
  SALES_ACTION_CATEGORIES.MUST_HANDLE_NOW,
  SALES_ACTION_CATEGORIES.CALL_NOW,
  SALES_ACTION_CATEGORIES.SEND_WHATSAPP,
  SALES_ACTION_CATEGORIES.OPEN_DEMO,
  SALES_ACTION_CATEGORIES.READY_FOR_PROPOSAL,
  SALES_ACTION_CATEGORIES.DEAL_CLOSED,
]

const CALL_ACTION_PATTERNS = ['call', 'התקשר', 'שיחה']
const WHATSAPP_ACTION_PATTERNS = ['whatsapp', 'וואטסאפ', 'הודעה']
const PROPOSAL_ACTION_PATTERNS = ['proposal', 'הצעת מחיר']

function hasLeadPhone(lead = {}) {
  return String(lead.phone || '').replace(/\D/g, '').length >= 7
}

function nextActionIncludes(text = '', patterns = []) {
  const normalized = String(text || '').trim().toLowerCase()
  if (!normalized) return false
  return patterns.some((pattern) => normalized.includes(String(pattern).toLowerCase()))
}

function sortActionViews(left, right) {
  const leftDate = left.nextActionDate || '9999-99-99'
  const rightDate = right.nextActionDate || '9999-99-99'
  if (leftDate !== rightDate) return leftDate.localeCompare(rightDate)
  return String(left.businessName || '').localeCompare(String(right.businessName || ''), 'he')
}

function createEmptyActionCategories() {
  return SALES_ACTION_CATEGORY_ORDER.reduce((groups, key) => {
    groups[key] = []
    return groups
  }, {})
}

function matchesMustHandleNow(enriched, today) {
  const status = enriched.salesStatus
  const nextActionDate = enriched.nextActionDate
  if (nextActionDate && nextActionDate <= today) return true
  return status === SALES_STATUS.FOLLOW_UP
    || status === SALES_STATUS.DEMO_OPENED
    || status === SALES_STATUS.PROPOSAL_SENT
}

function classifySalesActionView(enriched, today, categories) {
  const lead = enriched.lead || {}
  const status = enriched.salesStatus
  const nextActionText = enriched.nextActionText

  if (matchesMustHandleNow(enriched, today)) {
    categories[SALES_ACTION_CATEGORIES.MUST_HANDLE_NOW].push(enriched)
  }
  if (nextActionIncludes(nextActionText, CALL_ACTION_PATTERNS) || status === SALES_STATUS.IN_CALL) {
    categories[SALES_ACTION_CATEGORIES.CALL_NOW].push(enriched)
  }
  if (nextActionIncludes(nextActionText, WHATSAPP_ACTION_PATTERNS)
    || (status === SALES_STATUS.NEW && hasLeadPhone(lead))) {
    categories[SALES_ACTION_CATEGORIES.SEND_WHATSAPP].push(enriched)
  }
  if (status === SALES_STATUS.DEMO_OPENED) {
    categories[SALES_ACTION_CATEGORIES.OPEN_DEMO].push(enriched)
  }
  if (status === SALES_STATUS.PROPOSAL_SENT
    || nextActionIncludes(nextActionText, PROPOSAL_ACTION_PATTERNS)) {
    categories[SALES_ACTION_CATEGORIES.READY_FOR_PROPOSAL].push(enriched)
  }
  if (status === SALES_STATUS.WON) {
    categories[SALES_ACTION_CATEGORIES.DEAL_CLOSED].push(enriched)
  }
}

/** Single-pass Sales Action Center grouping (read-only). */
export function getSalesActionCenterData(views = [], today = new Date().toISOString().slice(0, 10)) {
  const categories = createEmptyActionCategories()

  for (const view of views) {
    if (isDemoLead(view.lead)) continue
    classifySalesActionView(enrichViewWithSalesTracking(view), today, categories)
  }

  for (const key of SALES_ACTION_CATEGORY_ORDER) {
    categories[key].sort(sortActionViews)
  }

  const counts = SALES_ACTION_CATEGORY_ORDER.reduce((result, key) => {
    result[key] = categories[key].length
    return result
  }, {})

  return { categories, counts }
}

export function explainActionCategoryEmpty(categoryKey, views = [], matchedViews = []) {
  if (matchedViews.length > 0) return ''

  const realViews = views.filter((view) => !isDemoLead(view.lead))
  const total = realViews.length
  if (total === 0) return 'אין לידים אמיתיים טעונים במערכת.'

  const withNextActionDate = countLeadsWithField(realViews, 'nextActionDate')
  const withNextAction = countLeadsWithField(realViews, 'nextAction')
  const withPhone = realViews.filter((view) => hasLeadPhone(view.lead)).length

  const messages = {
    [SALES_ACTION_CATEGORIES.MUST_HANDLE_NOW]: `אין לידים שחייבים טיפול עכשיו. ${total} לידים טעונים, ${withNextActionDate} עם תאריך פעולה, ${withNextAction} עם תיאור פעולה.`,
    [SALES_ACTION_CATEGORIES.CALL_NOW]: `אין לידים לשיחה עכשיו. חפשו "התקשר" / "שיחה" בשדה הפעולה הבאה, או סטטוס "בשיחה".`,
    [SALES_ACTION_CATEGORIES.SEND_WHATSAPP]: `אין לידים ל-WhatsApp. ${withPhone} לידים עם טלפון; הגדירו פעולה עם "WhatsApp" / "הודעה", או סטטוס "חדש".`,
    [SALES_ACTION_CATEGORIES.OPEN_DEMO]: 'אין לידים עם סטטוס "דמו נפתח".',
    [SALES_ACTION_CATEGORIES.READY_FOR_PROPOSAL]: 'אין לידים מוכנים להצעת מחיר. סמנו סטטוס "הצעה נשלחה" או פעולה עם "הצעת מחיר".',
    [SALES_ACTION_CATEGORIES.DEAL_CLOSED]: 'אין לידים עם סטטוס "נסגר".',
  }

  return messages[categoryKey] || 'אין לידים בקטגוריה זו.'
}

const ATTENTION_STATUSES = new Set([
  SALES_STATUS.DEMO_OPENED,
  SALES_STATUS.PROPOSAL_SENT,
  SALES_STATUS.FOLLOW_UP,
])

export function normalizeLeadDateOnly(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const timestamp = Date.parse(text)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : ''
}

export function formatSalesDate(dateValue) {
  const date = normalizeLeadDateOnly(dateValue)
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function getSalesStatusHebrew(lead = {}) {
  const status = normalizeSalesStatus(lead.salesStatus)
  return SALES_STATUS_HE[status] || status
}

export function enrichViewWithSalesTracking(view = {}) {
  const lead = view.lead || {}
  const nextActionDate = normalizeLeadDateOnly(lead.nextActionDate)
  const nextActionText = String(lead.nextAction || '').trim()
  const lastContactLabel = formatSalesDate(lead.lastContactAt)

  return {
    ...view,
    salesStatus: normalizeSalesStatus(lead.salesStatus),
    salesStatusLabel: getSalesStatusHebrew(lead),
    nextActionText,
    nextActionDate,
    nextActionDateLabel: formatSalesDate(lead.nextActionDate),
    lastContactAt: lead.lastContactAt || null,
    lastContactLabel,
  }
}

export function isActiveSalesLead(view = {}) {
  if (isDemoLead(view.lead)) return false
  return !CLOSED_SALES_STATUSES.has(normalizeSalesStatus(view.lead?.salesStatus))
}

function countLeadsWithField(views, field) {
  return views.filter((view) => {
    const value = view.lead?.[field]
    if (field === 'nextActionDate') return Boolean(normalizeLeadDateOnly(value))
    if (field === 'nextAction') return Boolean(String(value || '').trim())
    if (field === 'lastContactAt') return Boolean(normalizeLeadDateOnly(value))
    return Boolean(value)
  }).length
}

export function explainSalesSectionEmpty(section, views = [], matchedViews = []) {
  if (matchedViews.length > 0) return ''

  const realViews = views.filter((view) => !isDemoLead(view.lead))
  const total = realViews.length

  if (total === 0) {
    return 'אין לידים אמיתיים טעונים במערכת.'
  }

  const withNextActionDate = countLeadsWithField(realViews, 'nextActionDate')
  const withNextAction = countLeadsWithField(realViews, 'nextAction')
  const withLastContact = countLeadsWithField(realViews, 'lastContactAt')
  const withAttentionStatus = realViews.filter((view) => ATTENTION_STATUSES.has(normalizeSalesStatus(view.lead?.salesStatus))).length

  if (section === 'attention') {
    return `אין לידים שדורשים טיפול כרגע: ${total} לידים טעונים, ${withNextActionDate} עם תאריך פעולה הבאה, ${withAttentionStatus} בסטטוס דמו נפתח / הצעה נשלחה / מעקב. עדכנו שדות מעקב מכירות בעריכת ליד.`
  }

  if (section === 'urgent') {
    return `אין פעולות דחופות כרגע: ${total} לידים טעונים, ${withNextActionDate} עם תאריך פעולה (${withNextAction} עם תיאור פעולה), ${withAttentionStatus} בסטטוס מכירות דחוף.`
  }

  if (section === 'followups') {
    return `אין לידים בקבוצה זו: ${total} לידים פעילים, ${withNextActionDate} עם תאריך פעולה הבאה, ${withLastContact} עם תאריך יצירת קשר אחרונה. הגדירו תאריך פעולה הבאה בעריכת ליד.`
  }

  return ''
}

export function leadMatchesRequiresAttention(lead = {}, today) {
  if (isDemoLead(lead)) return false

  const status = normalizeSalesStatus(lead.salesStatus)
  const nextActionDate = normalizeLeadDateOnly(lead.nextActionDate)

  if (nextActionDate && nextActionDate <= today) return true
  return ATTENTION_STATUSES.has(status)
}

function getRequiresAttentionPriority(lead = {}, today) {
  const status = normalizeSalesStatus(lead.salesStatus)
  const nextActionDate = normalizeLeadDateOnly(lead.nextActionDate)

  if (status === SALES_STATUS.DEMO_OPENED) return 1
  if (nextActionDate && nextActionDate < today) return 2
  if (status === SALES_STATUS.PROPOSAL_SENT) return 3
  if (status === SALES_STATUS.FOLLOW_UP) return 4
  if (nextActionDate && nextActionDate === today) return 5
  return 99
}

export function getRequiresAttentionViews(views = [], today = new Date().toISOString().slice(0, 10)) {
  return views
    .filter((view) => leadMatchesRequiresAttention(view.lead, today))
    .map((view) => ({
      ...enrichViewWithSalesTracking(view),
      attentionPriority: getRequiresAttentionPriority(view.lead, today),
    }))
    .sort((left, right) => {
      if (left.attentionPriority !== right.attentionPriority) {
        return left.attentionPriority - right.attentionPriority
      }

      const leftDate = left.nextActionDate || '9999-99-99'
      const rightDate = right.nextActionDate || '9999-99-99'
      if (leftDate !== rightDate) return leftDate.localeCompare(rightDate)

      return String(left.businessName || '').localeCompare(String(right.businessName || ''), 'he')
    })
}

export function getSalesUrgency(view = {}, today) {
  if (!isActiveSalesLead(view)) return null

  const status = normalizeSalesStatus(view.lead.salesStatus)
  const nextActionDate = normalizeLeadDateOnly(view.lead.nextActionDate)

  if (status === SALES_STATUS.DEMO_OPENED) return { rank: 1, type: 'demo' }
  if (nextActionDate && nextActionDate < today) return { rank: 2, type: 'overdue' }
  if (status === SALES_STATUS.PROPOSAL_SENT) return { rank: 3, type: 'proposal' }
  if (status === SALES_STATUS.FOLLOW_UP) return { rank: 4, type: 'follow_up' }
  if (nextActionDate && nextActionDate === today) return { rank: 5, type: 'today' }
  if (status === SALES_STATUS.IN_CALL) return { rank: 6, type: 'in_call' }
  if (status === SALES_STATUS.MESSAGE_SENT) return { rank: 7, type: 'message_sent' }
  return null
}

export function getUrgentSalesLeads(views = [], today = new Date().toISOString().slice(0, 10)) {
  return views
    .map((view) => {
      const enriched = enrichViewWithSalesTracking(view)
      return { ...enriched, urgency: getSalesUrgency(enriched, today) }
    })
    .filter((view) => view.urgency)
    .sort((left, right) => {
      if (left.urgency.rank !== right.urgency.rank) return left.urgency.rank - right.urgency.rank

      const leftDate = left.nextActionDate || '9999-99-99'
      const rightDate = right.nextActionDate || '9999-99-99'
      if (leftDate !== rightDate) return leftDate.localeCompare(rightDate)

      return String(left.businessName || '').localeCompare(String(right.businessName || ''), 'he')
    })
}

export function getSalesFollowUpGroups(views = [], today = new Date().toISOString().slice(0, 10)) {
  const active = views.filter(isActiveSalesLead).map(enrichViewWithSalesTracking)

  return {
    overdue: active
      .filter((view) => view.nextActionDate && view.nextActionDate < today)
      .sort((left, right) => left.nextActionDate.localeCompare(right.nextActionDate)),
    today: active.filter((view) => view.nextActionDate === today),
    upcoming: active
      .filter((view) => view.nextActionDate && view.nextActionDate > today)
      .sort((left, right) => left.nextActionDate.localeCompare(right.nextActionDate)),
    none: active.filter((view) => !view.nextActionDate),
  }
}

/** @deprecated Use getSalesActionCenterData */
export function getSalesCommandData(views = [], today = new Date().toISOString().slice(0, 10)) {
  return getSalesActionCenterData(views, today)
}
