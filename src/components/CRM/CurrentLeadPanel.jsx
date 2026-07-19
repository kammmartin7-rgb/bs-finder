import { memo, useMemo, useState } from 'react'
import { loadShareableDemo } from '../WebsiteBuilder/demoStorage'
import {
  getNextStageId,
  getPreviousStageId,
  getStagePrimaryAction,
  getStageSecondaryActions,
  isReadOnlyStage,
} from './salesWorkflow'
import { runStageAction } from './salesWorkflowActions'
import LeadCustomerFile from './LeadCustomerFile'
import { useLanguage } from '../../context/LanguageContext'

const CurrentLeadPanel = memo(function CurrentLeadPanel({
  view = null,
  copy = {},
  categoryLabels = {},
  visibleIndex = -1,
  visibleTotal = 0,
  onAction,
  onEditLead,
  onDemoImage,
  onStageChange,
  onNextLead,
  onNotesSaved,
}) {
  const { t } = useLanguage()
  const [demoRecord, setDemoRecord] = useState(null)

  const primaryAction = useMemo(() => (view ? getStagePrimaryAction(view.stage) : null), [view])
  const secondaryActions = useMemo(() => (
    view
      ? getStageSecondaryActions(view.stage, {
        editLead: copy.editLead || t('editLead'),
        notes: copy.notes,
      })
      : []
  ), [view, copy.editLead, copy.notes, t])
  const readOnly = view ? isReadOnlyStage(view.stage) : false
  const previousStageId = view ? getPreviousStageId(view.stage) : null
  const nextStageId = view ? getNextStageId(view.stage) : null

  if (!view) {
    return (
      <section className="crm-v2__current-lead is-empty" dir="rtl" data-testid="current-lead-panel">
        <p>{copy.emptyCurrentLead || 'בחר ליד מהצינור כדי להתחיל לעבוד'}</p>
      </section>
    )
  }

  function runAction(actionDef) {
    runStageAction(actionDef, {
      view,
      onAction,
      onStageChange,
      onEditLead,
      onDemoImage,
      demoRecord: demoRecord || loadShareableDemo(view.lead),
      setDemoRecord,
      copy,
      onNotesToggle: () => document.getElementById('lead-notes-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    })
  }

  return (
    <section className="crm-v2__current-lead" dir="rtl" data-testid="current-lead-panel">
      <header className="crm-v2__current-lead-header">
        <div>
          <span>{copy.customerFileEyebrow || copy.currentLeadEyebrow || 'תיק לקוח'}</span>
          <h2>{view.businessName || copy.unknown}</h2>
        </div>
        {visibleTotal > 0 ? (
          <strong className="crm-v2__current-lead-position">
            {visibleIndex + 1} / {visibleTotal}
          </strong>
        ) : null}
      </header>

      <LeadCustomerFile
        view={view}
        copy={copy}
        categoryLabels={categoryLabels}
        onEditLead={onEditLead}
        onAction={onAction}
        onNotesSaved={onNotesSaved}
      />

      {readOnly ? (
        <p className="crm-v2__current-lead-readonly">{copy.readOnlyStage}</p>
      ) : primaryAction ? (
        <div className="crm-v2__current-lead-actions">
          <button
            type="button"
            className="crm-v2__current-lead-primary"
            onClick={() => runAction(primaryAction)}
          >
            {primaryAction.emoji} {primaryAction.label}
          </button>
        </div>
      ) : null}

      {secondaryActions.length ? (
        <div className="crm-v2__current-lead-secondary">
          {secondaryActions.map((actionDef) => (
            <button key={actionDef.id} type="button" onClick={() => runAction(actionDef)}>
              {actionDef.emoji} {actionDef.label}
            </button>
          ))}
        </div>
      ) : null}

      {!readOnly ? (
        <div className="crm-v2__current-lead-stage-nav">
          <button
            type="button"
            disabled={!previousStageId}
            onClick={() => previousStageId && onStageChange?.(view.leadId, previousStageId)}
          >
            ⬅ {copy.previousStage}
          </button>
          <button type="button">⏸ {copy.stayHere}</button>
          <button
            type="button"
            disabled={!nextStageId}
            onClick={() => nextStageId && onStageChange?.(view.leadId, nextStageId)}
          >
            ➡ {copy.nextStage}
          </button>
          <button type="button" className="crm-v2__current-lead-next" onClick={onNextLead}>
            ⏭ {copy.nextLead || 'ליד הבא'}
          </button>
        </div>
      ) : (
        <div className="crm-v2__current-lead-stage-nav">
          <button type="button" className="crm-v2__current-lead-next" onClick={onNextLead}>
            ⏭ {copy.nextLead || 'ליד הבא'}
          </button>
        </div>
      )}
    </section>
  )
})

export default CurrentLeadPanel
