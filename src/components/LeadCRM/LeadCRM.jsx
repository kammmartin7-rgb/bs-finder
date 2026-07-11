// Renders compact per-lead CRM controls while delegating persistence to crmStorage.js.
import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { getLeadCrmKey, loadLeadCrm, saveLeadCrm, subscribeToCrmChanges } from './crmStorage'
import './LeadCRM.css'

const CRM_STATUSES = [
  ['new', 'statusNew'],
  ['contacted', 'statusContacted'],
  ['whatsapp-sent', 'statusWhatsappSent'],
  ['proposal-sent', 'statusProposalSent'],
  ['negotiation', 'statusNegotiation'],
  ['won', 'statusWon'],
  ['lost', 'statusLost'],
]

export function LeadCRM({ lead }) {
  const { t } = useLanguage()
  const leadKey = useMemo(() => getLeadCrmKey(lead), [lead])
  const [record, setRecord] = useState(() => loadLeadCrm(leadKey))

  useEffect(() => subscribeToCrmChanges(() => setRecord(loadLeadCrm(leadKey))), [leadKey])

  function updateRecord(field, value) {
    setRecord((currentRecord) => {
      const nextRecord = { ...currentRecord, [field]: value }
      saveLeadCrm(leadKey, nextRecord)
      return nextRecord
    })
  }

  return (
    <div className="lead-crm">
      <label>
        <span>{t('crmStatus')}</span>
        <select value={record.status} onChange={(event) => updateRecord('status', event.target.value)}>
          {CRM_STATUSES.map(([value, translationKey]) => (
            <option key={value} value={value}>{t(translationKey)}</option>
          ))}
        </select>
      </label>

      <label>
        <span>{t('crmNotes')}</span>
        <textarea
          rows="2"
          value={record.notes}
          placeholder={t('crmNotesPlaceholder')}
          onChange={(event) => updateRecord('notes', event.target.value)}
        />
      </label>

      <label>
        <span>{t('crmNextFollowUp')}</span>
        <input type="date" value={record.nextFollowUp} onChange={(event) => updateRecord('nextFollowUp', event.target.value)} />
      </label>
    </div>
  )
}

export default LeadCRM
