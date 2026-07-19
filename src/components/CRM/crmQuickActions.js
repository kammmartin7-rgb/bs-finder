// Shared quick CRM actions (call, WhatsApp, demo, proposal) for pipeline panels.
import { loadShareableDemo } from '../WebsiteBuilder/demoStorage'
import { executeSalesWorkflowAction } from './salesWorkflowActions'

export function runCrmQuickAction(actionId, {
  view,
  onAction,
  onStageChange,
  onEditLead,
  onDemoImage,
  demoRecord = null,
  setDemoRecord,
  copy = {},
}) {
  if (!view?.lead) return

  if (actionId === 'demo-image') {
    onDemoImage?.(view)
    return
  }

  if (actionId === 'send-demo') {
    executeSalesWorkflowAction('send-demo', {
      view,
      actionDef: { confirmNextStage: 'demo-sent' },
      onAction,
      onStageChange,
      onEditLead,
      demoRecord,
      setDemoRecord,
      copy,
    })
    return
  }

  executeSalesWorkflowAction(actionId, {
    view,
    onAction,
    onStageChange,
    onEditLead,
    demoRecord,
    setDemoRecord,
    copy,
  })
}

export function getDemoActionLabel(view, demoRecord, copy = {}) {
  const demo = demoRecord || loadShareableDemo(view?.lead)
  return demo ? (copy.viewDemo || 'צפייה בדמו') : (copy.createDemo || 'יצירת דמו')
}
