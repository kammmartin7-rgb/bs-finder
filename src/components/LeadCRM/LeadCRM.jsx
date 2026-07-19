// Renders compact per-lead CRM controls while delegating persistence to crmStorage.js.
import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { CRM_STAGES, normalizeCrmStage } from '../CRM/crmSelectors'
import { getLeadId } from '../../services/leadId'
import { loadLeadCrm, saveLeadCrm, subscribeToCrmChanges } from './crmStorage'
import LeadNotesEditor from '../CRM/LeadNotesEditor'
import { getLeadNotesHistory } from '../../services/leadNotesHistory'
import './LeadCRM.css'

function formatStageLabel(stage) {
  return stage.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function LeadCRM({ lead }) {
  const { t } = useLanguage()
  const leadId = useMemo(() => getLeadId(lead), [lead])
  const [record, setRecord] = useState(() => loadLeadCrm(leadId))

  useEffect(() => subscribeToCrmChanges(() => setRecord(loadLeadCrm(leadId))), [leadId])

  useEffect(() => {
    const loaded = loadLeadCrm(leadId)
    const normalizedStatus = normalizeCrmStage(loaded.status)
    if (normalizedStatus !== loaded.status) {
      const migrated = { ...loaded, status: normalizedStatus }
      saveLeadCrm(leadId, migrated)
      setRecord(migrated)
    }
  }, [leadId])

  function updateRecord(field, value) {
    setRecord((currentRecord) => {
      const nextRecord = {
        ...currentRecord,
        [field]: value,
        ...(field === 'status' ? { stageChangedAt: new Date().toISOString() } : {}),
      }
      saveLeadCrm(leadId, nextRecord)
      return nextRecord
    })
  }

  const currentStage = normalizeCrmStage(record.status)
  const notesHistory = getLeadNotesHistory(record)
  const view = { leadId, crm: record, lead }

  return (
    <div className="lead-crm">
      <label>
        <span>{t('crmStatus')}</span>
        <select value={currentStage} onChange={(event) => updateRecord('status', event.target.value)}>
          {CRM_STAGES.map((value) => (
            <option key={value} value={value}>{formatStageLabel(value)}</option>
          ))}
        </select>
      </label>

      <div className="lead-crm__notes">
        <span>{t('crmNotes')}</span>
        {notesHistory.length ? (
          <ol className="lead-crm__notes-history">
            {notesHistory.map((note) => (
              <li key={note.id}><p>{note.text}</p><small>{note.date} · {note.time}</small></li>
            ))}
          </ol>
        ) : null}
        <LeadNotesEditor
          view={view}
          copy={{ addNote: t('manualNotes'), notesPlaceholder: t('crmNotesPlaceholder') }}
          onSaved={() => setRecord(loadLeadCrm(leadId))}
        />
      </div>

      <label>
        <span>{t('crmNextFollowUp')}</span>
        <input type="date" value={record.nextFollowUp} onChange={(event) => updateRecord('nextFollowUp', event.target.value)} />
      </label>
    </div>
  )
}

export default LeadCRM
