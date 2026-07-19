import { createDemoOpenUrl, createShareableDemoUrl, loadShareableDemo } from '../WebsiteBuilder/demoStorage'
import { createIsraeliWhatsAppUrl } from '../../services/whatsapp'
import { getLeadId } from '../../services/leadId'
import { getStageConfirmMessage, getStageLabel } from './salesWorkflow'

const SEND_DEMO_MESSAGE = (demoUrl) => `היי, ראיתי את העסק שלכם בגוגל והכנתי לכם דוגמה אישית לאתר חדש.

הדמו מבוסס על הפרטים והתמונה של העסק שלכם.

אפשר לראות כאן:
${demoUrl}

אם אהבתם, אפשר להפוך אותו לאתר אמיתי ולהעלות אותו לאוויר במהירות.

אשמח לשמוע מה דעתכם.`

function phoneTelHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits ? `tel:+${digits.startsWith('972') ? digits : `972${digits.replace(/^0/, '')}`}` : ''
}

export function offerStageAdvance(onStageChange, leadId, nextStageId) {
  if (!leadId || !nextStageId) return
  if (window.confirm(getStageConfirmMessage(nextStageId))) {
    onStageChange?.(leadId, nextStageId)
  }
}

export function runStageAction(actionDef, context) {
  if (!actionDef || !context?.view) return

  if (actionDef.uiAction === 'edit') {
    context.onEditLead?.(context.view)
    return
  }
  if (actionDef.uiAction === 'notes') {
    context.onNotesToggle?.()
    return
  }
  if (actionDef.id === 'demo-image') {
    context.onDemoImage?.(context.view)
    return
  }

  executeSalesWorkflowAction(actionDef.id, {
    view: context.view,
    actionDef,
    onAction: context.onAction,
    onStageChange: context.onStageChange,
    onEditLead: context.onEditLead,
    demoRecord: context.demoRecord,
    setDemoRecord: context.setDemoRecord,
    copy: context.copy,
  })
}

export function executeSalesWorkflowAction(actionId, {
  view,
  actionDef = {},
  onAction,
  onStageChange,
  onEditLead,
  demoRecord = null,
  setDemoRecord,
  copy = {},
}) {
  if (!view?.lead) return

  const whatsappUrl = createIsraeliWhatsAppUrl(view.phone)
  const telHref = phoneTelHref(view.phone)
  const demo = demoRecord || loadShareableDemo(view.lead)

  if (actionDef.moveToStage) {
    onStageChange?.(view.leadId, actionDef.moveToStage)
    if (actionId === 'schedule-follow-up') onEditLead?.(view)
    return
  }

  switch (actionId) {
    case 'call':
    case 'call-again':
      if (telHref) window.location.href = telHref
      onAction?.('call', view.lead)
      break
    case 'whatsapp':
      if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      onAction?.('whatsapp', view.lead)
      break
    case 'demo': {
      if (demo) {
        window.open(createDemoOpenUrl(demo), '_blank', 'noopener,noreferrer')
        return
      }
      const createdDemo = onAction?.('demo', view.lead)
      if (createdDemo && setDemoRecord) setDemoRecord(createdDemo)
      if (createdDemo && actionDef.confirmNextStage) {
        offerStageAdvance(onStageChange, view.leadId, actionDef.confirmNextStage)
      }
      break
    }
    case 'send-demo': {
      const record = demoRecord || loadShareableDemo(view.lead)
      if (!record) {
        window.alert(copy.demoRequired || 'יש ליצור אתר דמו לפני השליחה')
        return
      }
      if (!whatsappUrl) return
      onAction?.('send-demo', view.lead)
      const demoUrl = createShareableDemoUrl(record)
      window.open(`${whatsappUrl}?text=${encodeURIComponent(SEND_DEMO_MESSAGE(demoUrl))}`, '_blank', 'noopener,noreferrer')
      if (actionDef.confirmNextStage) {
        offerStageAdvance(onStageChange, view.leadId, actionDef.confirmNextStage)
      }
      break
    }
    case 'proposal':
      onAction?.('proposal', view.lead)
      break
    case 'start-negotiation':
      onStageChange?.(view.leadId, 'negotiation')
      break
    case 'schedule-follow-up':
      onStageChange?.(view.leadId, 'follow-up')
      onEditLead?.(view)
      break
    case 'close-deal':
      onStageChange?.(view.leadId, 'deal-won')
      break
    case 'not-interested':
      onStageChange?.(view.leadId, 'lost')
      break
    case 'back-to-negotiation':
      onStageChange?.(view.leadId, 'negotiation')
      break
    default:
      break
  }
}

export function dispatchProposalSent(lead) {
  window.dispatchEvent(new CustomEvent('bs-hunter-proposal-sent', {
    detail: {
      leadId: getLeadId(lead),
      nextStageId: 'proposal-sent',
      nextStageLabel: getStageLabel('proposal-sent'),
    },
  }))
}
