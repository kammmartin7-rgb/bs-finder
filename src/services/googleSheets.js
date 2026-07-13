import { isDemoLead } from '../components/BusinessOS/dashboardFilters'
import { getLeadId } from '../services/leadId'
import { loadLeadCrm } from '../components/LeadCRM/crmStorage'
import { getProposalSummary } from '../components/proposalStorage'
import { normalizeCrmStage } from '../components/CRM/crmSelectors'

function sheetValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return value;
}

function formatRatingValue(rating) {
  if (typeof rating !== 'number') {
    return '-';
  }

  return rating.toFixed(1);
}

function leadToSheetRecord(lead) {
  const crm = loadLeadCrm(getLeadId(lead))
  const proposal = getProposalSummary(lead)

  return {
    'Business Name': sheetValue(lead.businessName),
    'Phone Number': sheetValue(lead.phone),
    Website: sheetValue(lead.website),
    'Full Address': sheetValue(lead.address),
    'Google Rating': formatRatingValue(lead.rating),
    'Reviews Count': sheetValue(lead.reviewsCount),
    'Lead Score': lead.leadScore ?? '-',
    'Google Maps URL': sheetValue(lead.mapsUrl),
    'CRM Status': sheetValue(normalizeCrmStage(crm.status)),
    'Proposal Status': proposal.accepted ? 'accepted' : (proposal.exists ? 'draft' : '-'),
    'Proposal Amount': proposal.amount || crm.proposalAmount || '-',
  };
}

export async function saveLeadsToGoogleSheets(leads) {
  const webAppUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL?.trim();

  if (!webAppUrl) {
    throw new Error(
      'Google Sheets Web App URL is missing. Add VITE_GOOGLE_SHEETS_WEB_APP_URL to .env.'
    );
  }

  const realLeads = (Array.isArray(leads) ? leads : []).filter((lead) => !isDemoLead(lead))

  if (realLeads.length === 0) {
    throw new Error('No real leads to save.');
  }

  const response = await fetch(webAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: new URLSearchParams({
      leads: JSON.stringify(realLeads.map(leadToSheetRecord)),
    }).toString(),
  });

  const responseText = await response.text();
  let result = null;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error('Google Sheets did not return a valid response. Check your web app URL and deployment.');
  }

  if (!response.ok || result.error) {
    throw new Error(result.error || 'Something went wrong while saving to Google Sheets.');
  }

  if (!result.success) {
    throw new Error('Google Sheets save was not confirmed.');
  }
}
