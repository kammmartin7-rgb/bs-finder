// Lead-level sales tracking fields stored on each real lead record.
export const SALES_STATUS = {
  NEW: 'new',
  MESSAGE_SENT: 'message_sent',
  DEMO_OPENED: 'demo_opened',
  IN_CALL: 'in_call',
  PROPOSAL_SENT: 'proposal_sent',
  FOLLOW_UP: 'follow_up',
  WON: 'won',
  LOST: 'lost',
}

export const SALES_STATUS_VALUES = Object.values(SALES_STATUS)

export const SALES_STATUS_I18N_KEYS = {
  [SALES_STATUS.NEW]: 'salesStatus_new',
  [SALES_STATUS.MESSAGE_SENT]: 'salesStatus_message_sent',
  [SALES_STATUS.DEMO_OPENED]: 'salesStatus_demo_opened',
  [SALES_STATUS.IN_CALL]: 'salesStatus_in_call',
  [SALES_STATUS.PROPOSAL_SENT]: 'salesStatus_proposal_sent',
  [SALES_STATUS.FOLLOW_UP]: 'salesStatus_follow_up',
  [SALES_STATUS.WON]: 'salesStatus_won',
  [SALES_STATUS.LOST]: 'salesStatus_lost',
}

const SALES_TRACKING_UPDATE_KEYS = [
  'messageVersion',
  'messageSentAt',
  'demoOpenCount',
  'firstDemoOpenAt',
  'lastDemoOpenAt',
  'lastContactAt',
  'nextAction',
  'nextActionDate',
  'salesStatus',
]

export function pickSalesTrackingUpdates(leadUpdates = {}) {
  const picked = {}
  for (const key of SALES_TRACKING_UPDATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(leadUpdates, key)) {
      picked[key] = leadUpdates[key]
    }
  }
  return picked
}

export const DEFAULT_LEAD_SALES_TRACKING = {
  messageVersion: null,
  messageSentAt: null,
  demoOpenCount: 0,
  firstDemoOpenAt: null,
  lastDemoOpenAt: null,
  lastContactAt: null,
  nextAction: null,
  nextActionDate: null,
  salesStatus: SALES_STATUS.NEW,
}

function cleanText(value) {
  return String(value || '').trim()
}

function cleanIsoDate(value) {
  const text = cleanText(value)
  if (!text) return null
  const timestamp = Date.parse(text)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function cleanDateOnly(value) {
  const text = cleanText(value)
  if (!text) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const timestamp = Date.parse(text)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : null
}

export function normalizeSalesStatus(value) {
  const status = cleanText(value)
  return SALES_STATUS_VALUES.includes(status) ? status : SALES_STATUS.NEW
}

function toDateInputValue(value) {
  if (!value) return ''
  const text = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const timestamp = Date.parse(text)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : ''
}

export function buildLeadSalesTrackingValues(lead = {}) {
  return {
    salesStatus: normalizeSalesStatus(lead.salesStatus),
    messageVersion: lead.messageVersion || '',
    nextAction: lead.nextAction || '',
    nextActionDate: toDateInputValue(lead.nextActionDate),
    lastContactAt: toDateInputValue(lead.lastContactAt),
  }
}

export function salesTrackingFormPayload(values) {
  return {
    salesStatus: values.salesStatus,
    messageVersion: values.messageVersion || null,
    nextAction: values.nextAction || null,
    nextActionDate: values.nextActionDate || null,
    lastContactAt: values.lastContactAt || null,
  }
}

export function leadNeedsSalesTrackingMigration(lead = {}) {
  return lead.messageVersion === undefined
    || lead.messageSentAt === undefined
    || lead.demoOpenCount === undefined
    || lead.firstDemoOpenAt === undefined
    || lead.lastDemoOpenAt === undefined
    || lead.lastContactAt === undefined
    || lead.nextAction === undefined
    || lead.nextActionDate === undefined
    || lead.salesStatus === undefined
    || !SALES_STATUS_VALUES.includes(cleanText(lead.salesStatus))
}

export function applyLeadSalesTrackingFields(lead = {}) {
  const next = { ...lead }

  if (next.messageVersion === undefined || next.messageVersion === null) {
    next.messageVersion = null
  } else {
    next.messageVersion = cleanText(next.messageVersion) || null
  }

  next.messageSentAt = next.messageSentAt === undefined ? null : cleanIsoDate(next.messageSentAt)
  next.firstDemoOpenAt = next.firstDemoOpenAt === undefined ? null : cleanIsoDate(next.firstDemoOpenAt)
  next.lastDemoOpenAt = next.lastDemoOpenAt === undefined ? null : cleanIsoDate(next.lastDemoOpenAt)
  next.lastContactAt = next.lastContactAt === undefined ? null : cleanIsoDate(next.lastContactAt)
  next.nextAction = next.nextAction === undefined ? null : (cleanText(next.nextAction) || null)
  next.nextActionDate = next.nextActionDate === undefined ? null : cleanDateOnly(next.nextActionDate)
  next.demoOpenCount = next.demoOpenCount === undefined || next.demoOpenCount === null
    ? 0
    : Math.max(0, Number(next.demoOpenCount) || 0)
  next.salesStatus = next.salesStatus === undefined
    ? SALES_STATUS.NEW
    : normalizeSalesStatus(next.salesStatus)

  return next
}

export function enrichLeadSalesTracking(lead = {}) {
  return applyLeadSalesTrackingFields(lead)
}
