// Complete customer file sections for the selected CRM lead.
import { memo, useMemo } from 'react'
import { CRM_STAGES } from './crmSelectors'
import { createDemoOpenUrl, createShareableDemoUrl, loadShareableDemo } from '../WebsiteBuilder/demoStorage'
import { enrichViewWithSalesTracking } from './salesTrackingSelectors'
import { getLeadNotesHistory } from '../../services/leadNotesHistory'
import LeadNotesEditor from './LeadNotesEditor'
import LeadActivityTimeline from './LeadActivityTimeline'

function fieldText(value) {
  if (value === 0) return '0'
  return String(value ?? '').trim()
}

function display(value, fallback) {
  return value === 0 || value ? value : fallback
}

function InfoGrid({ items = [] }) {
  return (
    <dl className="lead-customer-file__grid">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const LeadCustomerFile = memo(function LeadCustomerFile({
  view,
  copy = {},
  categoryLabels = {},
  onEditLead,
  onAction,
  onNotesSaved,
}) {
  const enriched = useMemo(() => enrichViewWithSalesTracking(view), [view])
  const notesHistory = useMemo(() => getLeadNotesHistory(view?.crm), [view?.crm])
  const demoRecord = useMemo(() => (view?.lead ? loadShareableDemo(view.lead) : null), [view?.lead])
  const demoUrl = demoRecord ? createShareableDemoUrl(demoRecord) : ''
  const demoOpenUrl = demoRecord ? createDemoOpenUrl(demoRecord) : ''
  const category = categoryLabels[fieldText(view?.category || view?.leadCategory)] || fieldText(view?.category || view?.leadCategory) || copy.unknown
  const stageIndex = view ? CRM_STAGES.indexOf(view.stage) : -1
  const stageLabel = stageIndex >= 0 ? copy.stages?.[stageIndex] : view?.stage

  if (!view) return null

  const businessItems = [
    [copy.contact || 'איש קשר', display(view.contactName, copy.unknown)],
    [copy.phone, display(view.phone, copy.unknown)],
    [copy.email, display(view.email, copy.unknown)],
    [copy.category, category],
    [copy.city || 'עיר', display(view.city, copy.unknown)],
    [copy.address, display(view.lead?.address, copy.unknown)],
    [copy.website, display(view.website, copy.unknown)],
    [copy.source, display(view.source, copy.unknown)],
    [copy.rating || 'דירוג', display(view.lead?.leadScore, copy.unknown)],
  ]

  const salesItems = [
    [copy.status, stageLabel || copy.unknown],
    [copy.salesStatus || 'סטטוס מכירה', enriched.salesStatusLabel || copy.unknown],
    [copy.nextAction, enriched.nextActionText || copy.unknown],
    [copy.followUp, display(view.crm?.nextFollowUp, copy.none || copy.unknown)],
    [copy.nextActionDate || 'תאריך פעולה', enriched.nextActionDateLabel || copy.unknown],
    [copy.lastContact || 'יצירת קשר אחרונה', enriched.lastContactLabel || copy.unknown],
    [copy.proposal, view.proposal?.exists ? display(view.proposalAmount, copy.unknown) : copy.unknown],
    [copy.deal, display(view.dealAmount, copy.unknown)],
  ]

  return (
    <div className="lead-customer-file" data-testid="lead-customer-file">
      <div className="lead-customer-file__toolbar">
        <button type="button" className="lead-customer-file__edit" onClick={() => onEditLead?.(view)}>
          ✏ {copy.editLead || 'עריכת ליד'}
        </button>
      </div>

      <section className="lead-customer-file__section" data-testid="lead-business-info">
        <header><h3>{copy.businessInformation || 'פרטי העסק'}</h3></header>
        <InfoGrid items={businessItems} />
      </section>

      <section className="lead-customer-file__section" data-testid="lead-sales-info">
        <header><h3>{copy.salesInformation || 'פרטי מכירה'}</h3></header>
        <InfoGrid items={salesItems} />
      </section>

      <section className="lead-customer-file__section" id="lead-notes-section" data-testid="lead-notes-section">
        <header><h3>{copy.notes || 'הערות'}</h3></header>
        {notesHistory.length ? (
          <ol className="lead-customer-file__notes-history">
            {notesHistory.map((note) => (
              <li key={note.id}>
                <p>{note.text}</p>
                <small>{note.date} · {note.time}</small>
              </li>
            ))}
          </ol>
        ) : (
          <p className="lead-customer-file__empty">{copy.noNotesYet || 'אין הערות עדיין.'}</p>
        )}
        <LeadNotesEditor view={view} copy={copy} className="lead-customer-file__notes-editor" onSaved={onNotesSaved} />
      </section>

      <LeadActivityTimeline view={view} copy={copy} emptyLabel={copy.noActivityYet || 'אין פעילות עדיין.'} />

      <section className="lead-customer-file__section" data-testid="lead-demo-link">
        <header><h3>{copy.demoLink || 'קישור דמו'}</h3></header>
        {demoUrl ? (
          <div className="lead-customer-file__link-row">
            <a href={demoOpenUrl} target="_blank" rel="noopener noreferrer">{demoUrl}</a>
            <button type="button" onClick={() => window.open(demoOpenUrl, '_blank', 'noopener,noreferrer')}>{copy.openDemo || 'פתיחת דמו'}</button>
            <button type="button" onClick={() => navigator.clipboard?.writeText?.(demoUrl)}>{copy.copyLink || 'העתק'}</button>
          </div>
        ) : (
          <p className="lead-customer-file__empty">{copy.noDemoYet || 'טרם נוצר דמו.'}</p>
        )}
      </section>

      <section className="lead-customer-file__section" data-testid="lead-proposal-link">
        <header><h3>{copy.proposalLink || 'קישור הצעה'}</h3></header>
        {view.proposal?.exists ? (
          <div className="lead-customer-file__link-row">
            <strong>{display(view.proposalAmount, copy.unknown)}</strong>
            <button type="button" onClick={() => onAction?.('proposal', view.lead)}>
              {copy.openProposal || 'פתיחת הצעה'}
            </button>
          </div>
        ) : (
          <div className="lead-customer-file__link-row">
            <p className="lead-customer-file__empty">{copy.noProposalYet || 'טרם נוצרה הצעה.'}</p>
            <button type="button" onClick={() => onAction?.('proposal', view.lead)}>
              {copy.sendProposal || copy.openProposal || 'יצירת הצעה'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
})

export default LeadCustomerFile
