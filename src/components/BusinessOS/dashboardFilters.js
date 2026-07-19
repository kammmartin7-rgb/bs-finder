// Shared dashboard filtering rules used by both dashboard metrics and the BS Hunter list.
import { getLeadId } from '../../services/leadId'
import { loadLeadCrm, normalizeCrmStage } from '../LeadCRM/crmStorage'
import { hasLeadAction, LEAD_ACTIONS } from '../LeadCRM/leadActionStorage'

export const DASHBOARD_FILTERS = {
  REAL_LEADS: 'real-leads',
  HOT_LEADS: 'hot-leads',
  DEMO_SITES: 'demo-sites',
  PROPOSALS: 'proposals',
  FOLLOW_UPS: 'follow-ups',
  FOLLOW_UPS_DUE: 'follow-ups-due',
  NEW_LEADS_TODAY: 'new-leads-today',
  ACTIVE_DEALS: 'active-deals',
  WON_DEALS: 'won-deals',
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
const KNOWN_DEMO_IDS = new Set(['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'])

export function isDemoLead(lead = {}) {
  const placeId = String(lead.placeId || '')
  const fallbackId = String(lead.id || '')
  return lead.isDemo === true || lead.demo === true || placeId.startsWith('demo-') || fallbackId.startsWith('demo-') || KNOWN_DEMO_IDS.has(placeId) || KNOWN_DEMO_IDS.has(fallbackId)
}

export function getLeadDashboardData(lead) {
  const crm = loadLeadCrm(getLeadId(lead))
  return {
    crm: { ...crm, status: normalizeCrmStage(crm.status) },
    hasDemoSite: lead.demoSiteCreated === true || lead.hasDemoSite === true || hasLeadAction(lead, LEAD_ACTIONS.DEMO_SITE_OPENED),
    hasProposal: lead.proposalCreated === true || lead.proposalSent === true || hasLeadAction(lead, LEAD_ACTIONS.PROPOSAL_SENT) || hasLeadAction(lead, LEAD_ACTIONS.PROPOSAL_OPENED),
  }
}

export function matchesDashboardFilter(lead, filter) {
  if (!filter) return true
  if (isDemoLead(lead)) return false
  const { crm, hasDemoSite, hasProposal } = getLeadDashboardData(lead)
  const stage = crm.status

  switch (filter) {
    case DASHBOARD_FILTERS.REAL_LEADS: return true
    case DASHBOARD_FILTERS.HOT_LEADS: return Number(lead.leadScore) >= 80
    case DASHBOARD_FILTERS.DEMO_SITES: return hasDemoSite
    case DASHBOARD_FILTERS.PROPOSALS: return hasProposal || ['proposal-sent', 'negotiation', 'follow-up', 'deal-won'].includes(stage)
    case DASHBOARD_FILTERS.FOLLOW_UPS: return Boolean(crm.nextFollowUp)
    case DASHBOARD_FILTERS.FOLLOW_UPS_DUE: return Boolean(crm.nextFollowUp && crm.nextFollowUp <= todayIso() && !['lost', 'deal-won'].includes(stage))
    case DASHBOARD_FILTERS.NEW_LEADS_TODAY: return String(lead.createdAt || lead.addedAt || lead.dateAdded || '').slice(0, 10) === todayIso()
    case DASHBOARD_FILTERS.ACTIVE_DEALS: return ['first-contact', 'demo-created', 'demo-sent', 'proposal-sent', 'negotiation', 'follow-up'].includes(stage)
    case DASHBOARD_FILTERS.WON_DEALS: return ['deal-won', 'paid', 'website-in-progress', 'completed'].includes(stage)
    default: return true
  }
}

export function getDashboardFilterLabelKey(filter) {
  return {
    [DASHBOARD_FILTERS.REAL_LEADS]: 'filterAllRealLeads',
    [DASHBOARD_FILTERS.HOT_LEADS]: 'filterHotLeads',
    [DASHBOARD_FILTERS.DEMO_SITES]: 'filterDemoSites',
    [DASHBOARD_FILTERS.PROPOSALS]: 'filterProposals',
    [DASHBOARD_FILTERS.FOLLOW_UPS]: 'filterFollowUps',
    [DASHBOARD_FILTERS.FOLLOW_UPS_DUE]: 'filterFollowUpsDue',
    [DASHBOARD_FILTERS.NEW_LEADS_TODAY]: 'filterNewLeadsToday',
    [DASHBOARD_FILTERS.ACTIVE_DEALS]: 'filterActiveDeals',
    [DASHBOARD_FILTERS.WON_DEALS]: 'filterWonDeals',
  }[filter]
}
