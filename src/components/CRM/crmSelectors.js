// Pure CRM view selectors assembled from the existing lead, CRM, and activity sources.
import { CRM_STAGES, loadLeadCrm, normalizeCrmStage } from '../LeadCRM/crmStorage'
import { getLeadId } from '../../services/leadId'
import { getLeadActions, LEAD_ACTIONS } from '../LeadCRM/leadActionStorage'
import { isDemoLead } from '../BusinessOS/dashboardFilters'
import { getProposalSummary } from '../proposalStorage'

export { CRM_STAGES, normalizeCrmStage }

function getLatestActivity(actions, crm) {
  const activity = actions.at(-1)
  if (activity) return `${activity.date} ${activity.time}`.trim()
  return crm.updatedAt || crm.stageChangedAt || ''
}

export function createCrmLeadView(lead) {
  const leadId = getLeadId(lead)
  const crm = loadLeadCrm(leadId)
  const actions = getLeadActions(lead)
  const proposal = getProposalSummary(lead)
  return {
    lead,
    leadId,
    crm,
    actions,
    stage: normalizeCrmStage(crm.status),
    businessName: lead.businessName || lead.name || '',
    contactName: lead.contactName || lead.ownerName || lead.contact || '',
    phone: lead.phone || '',
    email: lead.email || '',
    website: lead.website || '',
    source: lead.source || lead.leadSource || lead.searchMode || '',
    category: lead.category || '',
    city: lead.city || '',
    proposal,
    proposalAmount: crm.proposalAmount || lead.proposalAmount || proposal.amount || '',
    dealAmount: crm.dealAmount || lead.dealAmount || '',
    latestActivity: getLatestActivity(actions, crm),
  }
}

export function getCrmRevenueSummary(views) {
  const activeProposalViews = views.filter((view) => view.proposal.exists && !['paid', 'website-in-progress', 'completed', 'lost'].includes(view.stage))
  const wonViews = views.filter((view) => ['deal-won', 'paid', 'website-in-progress', 'completed'].includes(view.stage))
  const paidViews = views.filter((view) => ['paid', 'website-in-progress', 'completed'].includes(view.stage))
  const value = (view) => Math.max(0, Number(view.dealAmount || view.proposalAmount) || 0)
  return {
    openProposals: activeProposalViews.length,
    proposalValue: activeProposalViews.reduce((sum, view) => sum + Math.max(0, Number(view.proposalAmount) || 0), 0),
    wonDeals: wonViews.length,
    paidRevenue: paidViews.reduce((sum, view) => sum + value(view), 0),
    awaitingPayment: views.filter((view) => view.stage === 'deal-won').length,
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

export function getFollowUpGroups(views, today = new Date().toISOString().slice(0, 10)) {
  const active = views.filter((view) => !['completed', 'lost'].includes(view.stage))
  return {
    overdue: active.filter((view) => view.crm.nextFollowUp && view.crm.nextFollowUp < today).sort((a, b) => a.crm.nextFollowUp.localeCompare(b.crm.nextFollowUp)),
    today: active.filter((view) => view.crm.nextFollowUp === today),
    upcoming: active.filter((view) => view.crm.nextFollowUp > today).sort((a, b) => a.crm.nextFollowUp.localeCompare(b.crm.nextFollowUp)),
    none: active.filter((view) => !view.crm.nextFollowUp),
  }
}

export function getTodayMissionActuals(views, today = new Date().toISOString().slice(0, 10)) {
  const actions = views.flatMap((view) => view.actions).filter((action) => action.date === today)
  const outreachTypes = new Set([LEAD_ACTIONS.CALL_OPENED, LEAD_ACTIONS.WHATSAPP_OPENED, LEAD_ACTIONS.DEMO_SITE_OPENED, LEAD_ACTIONS.PROPOSAL_OPENED, LEAD_ACTIONS.SALES_PITCH_OPENED])
  return {
    leads: views.filter((view) => String(view.lead.createdAt || view.lead.addedAt || view.lead.dateAdded || '').slice(0, 10) === today).length,
    outreach: actions.filter((action) => outreachTypes.has(action.actionType)).length,
    calls: actions.filter((action) => action.actionType === LEAD_ACTIONS.CALL_OPENED).length,
    followUps: actions.filter((action) => action.actionType === LEAD_ACTIONS.FOLLOW_UP_COMPLETED).length,
    deals: views.filter((view) => view.stage === 'deal-won' && String(view.crm.stageChangedAt || '').slice(0, 10) === today).length,
  }
}
