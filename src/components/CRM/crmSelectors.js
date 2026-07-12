// Pure CRM view selectors assembled from the existing lead, CRM, and activity sources.
import { getLeadCrmKey, loadLeadCrm } from '../LeadCRM/crmStorage'
import { getLeadActions } from '../LeadCRM/leadActionStorage'
import { isDemoLead } from '../BusinessOS/dashboardFilters'

export const CRM_STAGES = ['new', 'first-contact', 'demo-sent', 'proposal-sent', 'follow-up', 'deal-won', 'paid', 'website-in-progress', 'completed', 'lost']

const LEGACY_STAGE_MAP = {
  contacted: 'first-contact',
  'whatsapp-sent': 'first-contact',
  negotiation: 'follow-up',
  won: 'deal-won',
}

export function normalizeCrmStage(status) {
  if (CRM_STAGES.includes(status)) return status
  return LEGACY_STAGE_MAP[status] || 'new'
}

function getLatestActivity(actions, crm) {
  const activity = actions.at(-1)
  if (activity) return `${activity.date} ${activity.time}`.trim()
  return crm.updatedAt || crm.stageChangedAt || ''
}

export function createCrmLeadView(lead) {
  const leadKey = getLeadCrmKey(lead)
  const crm = loadLeadCrm(leadKey)
  const actions = getLeadActions(lead)
  return {
    lead,
    leadKey,
    crm,
    actions,
    stage: normalizeCrmStage(crm.status),
    businessName: lead.businessName || lead.name || '',
    contactName: lead.contactName || lead.ownerName || lead.contact || '',
    phone: lead.phone || '',
    email: lead.email || '',
    source: lead.source || lead.leadSource || lead.searchMode || '',
    proposalAmount: crm.proposalAmount || lead.proposalAmount || '',
    dealAmount: crm.dealAmount || lead.dealAmount || '',
    latestActivity: getLatestActivity(actions, crm),
  }
}

export function getCrmLeadViews(leads = []) {
  return leads.filter((lead) => !isDemoLead(lead)).map(createCrmLeadView)
}

export function getUrgency(view, today = new Date().toISOString().slice(0, 10)) {
  const followUp = view.crm.nextFollowUp
  if (followUp && followUp < today && !['completed', 'lost'].includes(view.stage)) return { rank: 1, type: 'overdue' }
  if (followUp === today && !['completed', 'lost'].includes(view.stage)) return { rank: 2, type: 'today' }
  if (view.stage === 'proposal-sent') return { rank: 3, type: 'proposal' }
  if (view.stage === 'demo-sent') return { rank: 4, type: 'demo' }
  if (view.stage === 'new') return { rank: 5, type: 'new' }
  if (view.stage === 'deal-won') return { rank: 6, type: 'payment' }
  return null
}

export function getUrgentCrmLeads(views) {
  return views.map((view) => ({ ...view, urgency: getUrgency(view) })).filter((view) => view.urgency).sort((a, b) => {
    if (a.urgency.rank !== b.urgency.rank) return a.urgency.rank - b.urgency.rank
    const followUpCompare = String(a.crm.nextFollowUp || '').localeCompare(String(b.crm.nextFollowUp || ''))
    if (followUpCompare) return followUpCompare
    return Number(b.lead.leadScore || 0) - Number(a.lead.leadScore || 0)
  })
}
