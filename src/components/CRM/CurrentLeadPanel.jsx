import { memo, useMemo, useState } from 'react'
import { loadShareableDemo } from '../WebsiteBuilder/demoStorage'
import {
  getNextStageId,
  getPreviousStageId,
  getStageWorkflow,
  isReadOnlyStage,
} from './salesWorkflow'
import { executeSalesWorkflowAction } from './salesWorkflowActions'
import { getDemoActionLabel, runCrmQuickAction } from './crmQuickActions'
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

  const workflow = useMemo(() => (view ? getStageWorkflow(view.stage) : null), [view])
  const readOnly = view ? isReadOnlyStage(view.stage) : false
  const previousStageId = view ? getPreviousStageId(view.stage) : null
  const nextStageId = view ? getNextStageId(view.stage) : null
  const demoLabel = view ? getDemoActionLabel(view, demoRecord || loadShareableDemo(view.lead), copy) : copy.createDemo

  if (!view) {
    return (
      <section className="crm-v2__current-lead is-empty" dir="rtl" data-testid="current-lead-panel">
        <p>{copy.emptyCurrentLead || 'בחר ליד מהצינור כדי להתחיל לעבוד'}</p>
      </section>
    )
  }

  function runAction(actionDef) {
    executeSalesWorkflowAction(actionDef.id, {
      view,
      actionDef,
      onAction,
      onStageChange,
      onEditLead,
      demoRecord: demoRecord || loadShareableDemo(view.lead),
      setDemoRecord,
      copy,
    })
  }

  function runQuick(actionId) {
    runCrmQuickAction(actionId, {
      view,
      onAction,
      onStageChange,
      onEditLead,
      onDemoImage,
      demoRecord: demoRecord || loadShareableDemo(view.lead),
      setDemoRecord,
      copy,
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
      ) : (
        <div className="crm-v2__current-lead-actions">
          {workflow?.primary ? (
            <button type="button" className="crm-v2__current-lead-primary" onClick={() => runAction(workflow.primary)}>
              {workflow.primary.emoji} {workflow.primary.label}
            </button>
          ) : null}
          {workflow?.secondary?.map((actionDef) => (
            <button key={actionDef.id} type="button" onClick={() => runAction(actionDef)}>
              {actionDef.emoji} {actionDef.label}
            </button>
          ))}
        </div>
      )}

      <div className="crm-v2__current-lead-crm-actions">
        <button type="button" disabled={!view.phone} onClick={() => runQuick('call')}>{copy.call}</button>
        <button type="button" disabled={!view.phone} onClick={() => runQuick('whatsapp')}>{copy.whatsapp}</button>
        <button type="button" onClick={() => runQuick('demo')}>{demoLabel}</button>
        <button type="button" disabled={!view.phone} onClick={() => runQuick('send-demo')}>{copy.sendDemo}</button>
        <button type="button" onClick={() => runQuick('proposal')}>{copy.sendProposal || copy.openProposal}</button>
        <button type="button" onClick={() => runQuick('demo-image')}>{copy.demoImage}</button>
      </div>

      <div className="crm-v2__current-lead-utility">
        <button type="button" onClick={() => onEditLead?.(view)}>
          ✏ {copy.editLead || t('editLead')}
        </button>
        <button type="button" onClick={() => document.getElementById('lead-notes-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}>
          📝 {copy.notes}
        </button>
      </div>

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
