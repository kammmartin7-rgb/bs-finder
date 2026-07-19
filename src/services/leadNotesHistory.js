// Append-only CRM note history stored on each lead CRM record.
import { loadLeadCrm, saveLeadCrm } from '../components/LeadCRM/crmStorage'

function formatNoteTimestamp(iso = '') {
  const date = iso ? new Date(iso) : new Date()
  if (Number.isNaN(date.getTime())) {
    const now = new Date()
    return {
      createdAt: now.toISOString(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
    }
  }
  return {
    createdAt: date.toISOString(),
    date: date.toISOString().slice(0, 10),
    time: date.toTimeString().slice(0, 8),
  }
}

export function getLeadNotesHistory(crm = {}) {
  if (Array.isArray(crm.notesHistory) && crm.notesHistory.length) {
    return crm.notesHistory
  }

  const legacy = String(crm.notes || '').trim()
  if (!legacy) return []

  const timestamp = formatNoteTimestamp(crm.updatedAt || crm.stageChangedAt)
  return [{
    id: 'legacy-note',
    text: legacy,
    createdAt: timestamp.createdAt,
    date: timestamp.date,
    time: timestamp.time,
    source: 'legacy',
  }]
}

export function appendLeadNote(leadId, text, crm = null) {
  const trimmed = String(text || '').trim()
  if (!leadId || !trimmed) return { ok: false, reason: 'empty-note' }

  const currentCrm = crm || loadLeadCrm(leadId)
  const timestamp = formatNoteTimestamp()
  const entry = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: trimmed,
    createdAt: timestamp.createdAt,
    date: timestamp.date,
    time: timestamp.time,
  }

  const notesHistory = [...getLeadNotesHistory(currentCrm), entry]
  const nextCrm = {
    ...currentCrm,
    notesHistory,
    notes: trimmed,
  }

  if (!saveLeadCrm(leadId, nextCrm)) {
    return { ok: false, reason: 'save-failed' }
  }

  return { ok: true, entry, crm: nextCrm }
}

export function ensureLeadNotesHistoryMigrated(leadId) {
  const crm = loadLeadCrm(leadId)
  if (Array.isArray(crm.notesHistory) && crm.notesHistory.length) {
    return crm
  }

  const history = getLeadNotesHistory(crm)
  if (!history.length) return crm

  const nextCrm = { ...crm, notesHistory: history }
  saveLeadCrm(leadId, nextCrm)
  return nextCrm
}
