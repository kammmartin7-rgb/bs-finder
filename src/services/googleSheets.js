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
  return {
    'Business Name': sheetValue(lead.businessName),
    'Phone Number': sheetValue(lead.phone),
    Website: sheetValue(lead.website),
    'Full Address': sheetValue(lead.address),
    'Google Rating': formatRatingValue(lead.rating),
    'Reviews Count': sheetValue(lead.reviewsCount),
    'Lead Score': lead.leadScore ?? '-',
    'Google Maps URL': sheetValue(lead.mapsUrl),
  };
}

export async function saveLeadsToGoogleSheets(leads) {
  const webAppUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL?.trim();

  if (!webAppUrl) {
    throw new Error(
      'Google Sheets Web App URL is missing. Add VITE_GOOGLE_SHEETS_WEB_APP_URL to .env.'
    );
  }

  if (!Array.isArray(leads) || leads.length === 0) {
    throw new Error('No leads to save.');
  }

  await fetch(webAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({
      leads: JSON.stringify(leads.map(leadToSheetRecord)),
    }).toString(),
  });
}