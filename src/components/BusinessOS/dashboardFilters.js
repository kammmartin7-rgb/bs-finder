// Shared dashboard filtering rules used by both dashboard metrics and the BS Hunter list.
import { getLeadCrmKey, loadLeadCrm } from '../LeadCRM/crmStorage'
import { hasLeadAction, LEAD_ACTIONS } from '../LeadCRM/leadActionStorage'

export const DASHBOARD_FILTERS = { REAL_LEADS: 'real-leads', HOT_LEADS: 'hot-leads', DEMO_SITES: 'demo-sites', PROPOSALS: 'proposals', FOLLOW_UPS: 'follow-ups', WON_DEALS: 'won-deals' }
const KNOWN_DEMO_IDS = new Set(['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'])

export function isDemoLead(lead = {}) {
  const placeId = String(lead.placeId || '')
  const fallbackId = String(lead.id || '')
  return lead.isDemo === true || lead.demo === true || placeId.startsWith('demo-') || fallbackId.startsWith('demo-') || KNOWN_DEMO_IDS.has(placeId) || KNOWN_DEMO_IDS.has(fallbackId)
}

export function getLeadDashboardData(lead) {
  return {
    crm: loadLeadCrm(getLeadCrmKey(lead)),
    hasDemoSite: lead.demoSiteCreated === true || lead.hasDemoSite === true || hasLeadAction(lead, LEAD_ACTIONS.DEMO_SITE_OPENED),
    hasProposal: lead.proposalCreated === true || lead.proposalSent === true || hasLeadAction(lead, LEAD_ACTIONS.PROPOSAL_OPENED),
  }
}

export function matchesDashboardFilter(lead, filter) {
  if (!filter) return true
  if (isDemoLead(lead)) return false
  const { crm, hasDemoSite, hasProposal } = getLeadDashboardData(lead)

  switch (filter) {
    case DASHBOARD_FILTERS.REAL_LEADS: return true
    case DASHBOARD_FILTERS.HOT_LEADS: return Number(lead.leadScore) >= 80
    case DASHBOARD_FILTERS.DEMO_SITES: return hasDemoSite
    case DASHBOARD_FILTERS.PROPOSALS: return hasProposal || ['proposal-sent', 'negotiation', 'won'].includes(crm.status)
    case DASHBOARD_FILTERS.FOLLOW_UPS: return Boolean(crm.nextFollowUp)
    case DASHBOARD_FILTERS.WON_DEALS: return crm.status === 'won'
    default: return true
  }
}

export function getDashboardFilterLabelKey(filter) {
  return { [DASHBOARD_FILTERS.REAL_LEADS]: 'filterAllRealLeads', [DASHBOARD_FILTERS.HOT_LEADS]: 'filterHotLeads', [DASHBOARD_FILTERS.DEMO_SITES]: 'filterDemoSites', [DASHBOARD_FILTERS.PROPOSALS]: 'filterProposals', [DASHBOARD_FILTERS.FOLLOW_UPS]: 'filterFollowUps', [DASHBOARD_FILTERS.WON_DEALS]: 'filterWonDeals' }[filter]
}
