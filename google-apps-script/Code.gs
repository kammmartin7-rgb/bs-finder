const SPREADSHEET_ID = '1tTjElzTkGkap-U90vN5sn0e7X44oIZuYzEANlZCELT4';

const HEADERS = [
  'Date',
  'Business Name',
  'Phone Number',
  'Website',
  'Full Address',
  'Google Rating',
  'Reviews Count',
  'Lead Score',
  'Google Maps URL',
];

function getSpreadsheet_() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (activeSpreadsheet && activeSpreadsheet.getId() === SPREADSHEET_ID) {
    return activeSpreadsheet;
  }

  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getTargetSheet_(spreadsheet) {
  return (
    spreadsheet.getSheetByName('BS Hunter Leads') ||
    spreadsheet.getSheetByName('Sheet1') ||
    spreadsheet.getSheets()[0]
  );
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const headersMatch = HEADERS.every(function (header, index) {
    return String(existingHeaders[index] || '').trim() === header;
  });

  if (!headersMatch) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function parsePayload_(e) {
  if (e.parameter && e.parameter.leads) {
    return {
      leads: JSON.parse(e.parameter.leads),
    };
  }

  if (e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  if (e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  throw new Error('No payload received.');
}

function leadToRow_(lead) {
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  return [
    date,
    lead['Business Name'] || '-',
    lead['Phone Number'] || '-',
    lead.Website || '-',
    lead['Full Address'] || '-',
    lead['Google Rating'] || '-',
    lead['Reviews Count'] || '-',
    lead['Lead Score'] || '-',
    lead['Google Maps URL'] || '-',
  ];
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const leads = payload.leads;

    if (!Array.isArray(leads) || leads.length === 0) {
      throw new Error('No leads received.');
    }

    const spreadsheet = getSpreadsheet_();
    const sheet = getTargetSheet_(spreadsheet);

    ensureHeaders_(sheet);

    const rows = leads.map(leadToRow_);
    const startRow = sheet.getLastRow() + 1;

    sheet.getRange(startRow, 1, rows.length, HEADERS.length).setValues(rows);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        rowsAdded: rows.length,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        error: error.message,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      message: 'BS Hunter Google Sheets web app is running.',
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}
