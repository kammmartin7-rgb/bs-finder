import { LEAD_ACTIONS } from '../LeadCRM/leadActionStorage'
import { getLeadNotesHistory } from '../../services/leadNotesHistory'

const ACTION_LABELS_HE = {
  [LEAD_ACTIONS.DEMO_SITE_OPENED]: 'דמו נפתח',
  [LEAD_ACTIONS.DEMO_SENT]: 'דמו נשלח',
  [LEAD_ACTIONS.PROPOSAL_OPENED]: 'הצעת מחיר נפתחה',
  [LEAD_ACTIONS.PROPOSAL_SENT]: 'הצעת מחיר נשלחה',
  [LEAD_ACTIONS.SALES_PITCH_OPENED]: 'תסריט מכירה נפתח',
  [LEAD_ACTIONS.WHATSAPP_OPENED]: 'WhatsApp נפתח',
  [LEAD_ACTIONS.CALL_OPENED]: 'שיחה',
  [LEAD_ACTIONS.FOLLOW_UP_COMPLETED]: 'מעקב הושלם',
}

export function buildLeadActivityTimeline(view = {}) {
  const items = []

  for (const action of view.actions || []) {
    items.push({
      id: `${action.date}-${action.time}-${action.actionType}`,
      kind: 'action',
      label: ACTION_LABELS_HE[action.actionType] || action.actionType,
      date: action.date,
      time: action.time,
      sortKey: `${action.date}T${action.time || '00:00:00'}`,
    })
  }

  for (const note of getLeadNotesHistory(view.crm)) {
    items.push({
      id: note.id,
      kind: 'note',
      label: 'הערה נוספה',
      text: note.text,
      date: note.date,
      time: note.time,
      sortKey: note.createdAt || `${note.date}T${note.time || '00:00:00'}`,
    })
  }

  return items.sort((left, right) => String(right.sortKey).localeCompare(String(left.sortKey)))
}
