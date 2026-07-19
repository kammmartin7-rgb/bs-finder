// Sales pipeline workflow: stages represent completed states; actions are separate.
export const CRM_STAGES = [
  'new',
  'first-contact',
  'demo-created',
  'demo-sent',
  'proposal-sent',
  'negotiation',
  'follow-up',
  'deal-won',
  'lost',
]

export const STAGE_WORKFLOW = [
  {
    id: 'new',
    icon: '🔥',
    label: 'ליד חדש',
    readOnly: false,
    primary: { id: 'call', emoji: '📞', label: 'התקשר' },
    secondary: [],
  },
  {
    id: 'first-contact',
    icon: '📞',
    label: 'יצירת קשר ראשונה',
    readOnly: false,
    primary: { id: 'whatsapp', emoji: '💬', label: 'WhatsApp' },
    secondary: [{ id: 'demo', emoji: '🌐', label: 'יצירת דמו' }],
  },
  {
    id: 'demo-created',
    icon: '🌐',
    label: 'דמו נוצר',
    readOnly: false,
    primary: { id: 'send-demo', emoji: '📤', label: 'שליחת דמו', confirmNextStage: 'demo-sent' },
    secondary: [],
  },
  {
    id: 'demo-sent',
    icon: '📤',
    label: 'דמו נשלח',
    readOnly: false,
    primary: { id: 'proposal', emoji: '💰', label: 'שליחת הצעת מחיר' },
    secondary: [],
  },
  {
    id: 'proposal-sent',
    icon: '💰',
    label: 'הצעת מחיר נשלחה',
    readOnly: false,
    primary: { id: 'start-negotiation', emoji: '🤝', label: 'התחל משא ומתן', moveToStage: 'negotiation' },
    secondary: [],
  },
  {
    id: 'negotiation',
    icon: '🤝',
    label: 'משא ומתן',
    readOnly: false,
    primary: { id: 'schedule-follow-up', emoji: '📅', label: 'קבע מעקב', moveToStage: 'follow-up' },
    secondary: [
      { id: 'close-deal', emoji: '✅', label: 'סגור עסקה', moveToStage: 'deal-won' },
      { id: 'not-interested', emoji: '❌', label: 'לא מעוניין', moveToStage: 'lost' },
    ],
  },
  {
    id: 'follow-up',
    icon: '📅',
    label: 'מעקב',
    readOnly: false,
    primary: { id: 'call-again', emoji: '📞', label: 'התקשר שוב' },
    secondary: [
      { id: 'whatsapp', emoji: '💬', label: 'WhatsApp' },
      { id: 'back-to-negotiation', emoji: '⬆', label: 'חזור למשא ומתן', moveToStage: 'negotiation' },
    ],
  },
  {
    id: 'deal-won',
    icon: '✅',
    label: 'נסגר',
    readOnly: true,
    primary: null,
    secondary: [],
  },
  {
    id: 'lost',
    icon: '❌',
    label: 'לא מעוניין',
    readOnly: true,
    primary: null,
    secondary: [],
  },
]

const LEGACY_STAGE_MAP = {
  contacted: 'first-contact',
  'whatsapp-sent': 'first-contact',
  won: 'deal-won',
  paid: 'deal-won',
  'website-in-progress': 'deal-won',
  completed: 'deal-won',
}

export const WON_STAGES = new Set(['deal-won', 'paid', 'website-in-progress', 'completed'])
export const ACTIVE_PIPELINE_STAGES = new Set([
  'first-contact', 'demo-created', 'demo-sent', 'proposal-sent', 'negotiation', 'follow-up',
])

export function normalizeCrmStage(status) {
  if (CRM_STAGES.includes(status)) return status
  return LEGACY_STAGE_MAP[status] || 'new'
}

export function getStageWorkflow(stageId) {
  const normalized = normalizeCrmStage(stageId)
  return STAGE_WORKFLOW.find((stage) => stage.id === normalized) || STAGE_WORKFLOW[0]
}

export function getStageIndex(stageId) {
  return CRM_STAGES.indexOf(normalizeCrmStage(stageId))
}

export function getStageLabel(stageId) {
  return getStageWorkflow(stageId).label
}

export function getNextStageId(stageId) {
  const index = getStageIndex(stageId)
  if (index < 0 || index >= CRM_STAGES.length - 1) return null
  return CRM_STAGES[index + 1]
}

export function getPreviousStageId(stageId) {
  const index = getStageIndex(stageId)
  if (index <= 0) return null
  return CRM_STAGES[index - 1]
}

export function isReadOnlyStage(stageId) {
  return getStageWorkflow(stageId).readOnly
}

export function getStageConfirmMessage(nextStageId) {
  const label = getStageLabel(nextStageId)
  return `להעביר את הליד לשלב "${label}"?`
}

export const STAGE_ICONS = STAGE_WORKFLOW.map((stage) => stage.icon)
export const STAGE_LABELS = STAGE_WORKFLOW.map((stage) => stage.label)
