// Sales-first CRM V2 workspace built on the existing lead, CRM, proposal-action, and language architecture.
import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react'
import { loadLeadCrm, saveLeadCrm, subscribeToCrmChanges } from '../LeadCRM/crmStorage'
import { subscribeToProposalChanges } from '../proposalStorage'
import { matchesDashboardFilter } from '../BusinessOS/dashboardFilters'
import { CRM_STAGES, getCrmLeadViews, normalizeCrmStage } from './crmSelectors'
import ManualLeadForm from '../ManualLead/ManualLeadForm'
import GoogleMapsImportForm from '../GoogleMapsImport/GoogleMapsImportForm'
import LeadEditForm from './LeadEditForm'
import LeadMediaModal from './LeadMediaModal'
import DemoImageModal from './DemoImageModal'
import { createIsraeliWhatsAppUrl } from '../../services/whatsapp'
import { createDemoOpenUrl, createShareableDemoUrl, loadShareableDemo } from '../WebsiteBuilder/demoStorage'
import SalesActionCenter from './SalesActionCenter'
import {
  enrichViewWithSalesTracking,
  explainActionCategoryEmpty,
  getSalesActionCenterData,
  SALES_ACTION_CATEGORIES,
} from './salesTrackingSelectors'
import PipelineFilterSort from './PipelineFilterSort'
import {
  applyPipelineFilters,
  applyPipelineSort,
  DEFAULT_PIPELINE_FILTERS,
  isPipelineFiltersActive,
} from './pipelineFilterSortUtils'
import './CRM.css'

const COPY = {
  en: { eyebrow: 'BS Finder Sales', title: 'Sales CRM', subtitle: 'Focus the day on the conversations and deals that need attention.', mission: "Today's Mission", editGoals: 'Edit goals', saveGoals: 'Save goals', leads: 'Leads', outreach: 'Outreach', calls: 'Calls', followUps: 'Follow-ups', deals: 'Deals', urgent: 'Urgent Actions', urgentHint: 'Highest-priority opportunities appear first.', pipeline: 'Sales Pipeline', followUpBoard: 'Follow-up Center', empty: 'No real leads are currently loaded.', noUrgent: 'No urgent sales actions right now.', noItems: 'No leads in this group.', contact: 'Contact', phone: 'Phone', email: 'Email', website: 'Website', source: 'Source', category: 'Category', rating: 'Rating', address: 'Address', status: 'Status', followUp: 'Next follow-up', proposal: 'Proposal', deal: 'Deal', notes: 'Notes', activity: 'Latest activity', unknown: 'Not available', nextAction: 'Next Action', addNote: 'Add Note', setFollowUp: 'Set Follow-up', save: 'Save', cancel: 'Cancel', call: 'Call', whatsapp: 'WhatsApp', openDemo: 'Open Demo', openProposal: 'Open Proposal', paymentMissing: 'Payment link not configured.', overdue: 'Overdue', today: 'Today', upcoming: 'Upcoming', none: 'No follow-up', urgency: { overdue: 'Follow-up overdue', today: 'Follow-up due today', proposal: 'Proposal waiting for response', demo: 'Demo sent — no response', new: 'New lead waiting for first contact', payment: 'Deal won — waiting for payment' }, stages: ['New Lead', 'First Contact', 'Demo Sent', 'Proposal Sent', 'Follow-up', 'Deal Won', 'Paid', 'Website In Progress', 'Completed', 'Archived / Lost'], actions: ['Call Customer', 'Send Demo', 'Send Proposal', 'Schedule Follow-up', 'Call Customer', 'Collect Payment', 'Start Website', 'Mark Completed', 'Archive', 'Restore Lead'] },
  he: { eyebrow: 'מכירות BS Finder', title: 'CRM מכירות', subtitle: 'מיקוד היום בשיחות ובעסקאות שדורשות טיפול.', mission: 'המשימה של היום', editGoals: 'עריכת יעדים', saveGoals: 'שמירת יעדים', leads: 'לידים', outreach: 'פניות', calls: 'שיחות', followUps: 'מעקבים', deals: 'עסקאות', urgent: 'פעולות דחופות', urgentHint: 'ההזדמנויות בעדיפות הגבוהה ביותר מופיעות ראשונות.', pipeline: 'תהליך המכירה', followUpBoard: 'מרכז מעקבים', empty: 'אין כרגע לידים אמיתיים טעונים.', noUrgent: 'אין כרגע פעולות מכירה דחופות.', noItems: 'אין לידים בקבוצה זו.', contact: 'איש קשר', phone: 'טלפון', email: 'אימייל', website: 'אתר', source: 'מקור', category: 'קטגוריה', rating: 'דירוג', address: 'כתובת', status: 'סטטוס', followUp: 'מעקב הבא', proposal: 'הצעה', deal: 'עסקה', notes: 'הערות', activity: 'פעילות אחרונה', unknown: 'לא זמין', nextAction: 'הפעולה הבאה', addNote: 'הוספת הערה', setFollowUp: 'קביעת מעקב', save: 'שמירה', cancel: 'ביטול', call: 'שיחה', whatsapp: 'WhatsApp', openDemo: 'פתיחת דמו', openProposal: 'פתיחת הצעה', paymentMissing: 'קישור תשלום לא הוגדר.', overdue: 'באיחור', today: 'היום', upcoming: 'קרובים', none: 'ללא מעקב', urgency: { overdue: 'מעקב באיחור', today: 'מעקב להיום', proposal: 'הצעה ממתינה לתגובה', demo: 'דמו נשלח — אין תגובה', new: 'ליד חדש ממתין ליצירת קשר', payment: 'עסקה נסגרה — ממתינה לתשלום' }, stages: ['ליד חדש', 'יצירת קשר ראשונה', 'דמו נשלח', 'הצעה נשלחה', 'מעקב', 'עסקה נסגרה', 'שולם', 'אתר בבנייה', 'הושלם', 'ארכיון / אבד'], actions: ['התקשרות ללקוח', 'שליחת דמו', 'שליחת הצעה', 'קביעת מעקב', 'התקשרות ללקוח', 'גביית תשלום', 'התחלת אתר', 'סימון כהושלם', 'העברה לארכיון', 'שחזור ליד'] },
  ar: { eyebrow: 'مبيعات BS Finder', title: 'نظام المبيعات CRM', subtitle: 'ركّز يومك على المحادثات والصفقات التي تحتاج إلى اهتمام.', mission: 'مهمة اليوم', editGoals: 'تعديل الأهداف', saveGoals: 'حفظ الأهداف', leads: 'العملاء', outreach: 'التواصل', calls: 'المكالمات', followUps: 'المتابعات', deals: 'الصفقات', urgent: 'إجراءات عاجلة', urgentHint: 'تظهر الفرص الأعلى أولوية أولاً.', pipeline: 'مسار المبيعات', followUpBoard: 'مركز المتابعة', empty: 'لا يوجد عملاء حقيقيون محملون الآن.', noUrgent: 'لا توجد إجراءات مبيعات عاجلة الآن.', noItems: 'لا يوجد عملاء في هذه المجموعة.', contact: 'جهة الاتصال', phone: 'الهاتف', email: 'البريد', website: 'الموقع', source: 'المصدر', category: 'الفئة', rating: 'التقييم', address: 'العنوان', status: 'الحالة', followUp: 'المتابعة التالية', proposal: 'العرض', deal: 'الصفقة', notes: 'ملاحظات', activity: 'آخر نشاط', unknown: 'غير متاح', nextAction: 'الإجراء التالي', addNote: 'إضافة ملاحظة', setFollowUp: 'تحديد متابعة', save: 'حفظ', cancel: 'إلغاء', call: 'اتصال', whatsapp: 'WhatsApp', openDemo: 'فتح العرض التجريبي', openProposal: 'فتح العرض', paymentMissing: 'رابط الدفع غير مهيأ.', overdue: 'متأخرة', today: 'اليوم', upcoming: 'قادمة', none: 'بدون متابعة', urgency: { overdue: 'متابعة متأخرة', today: 'متابعة اليوم', proposal: 'عرض بانتظار الرد', demo: 'تم إرسال العرض التجريبي — لا رد', new: 'عميل جديد ينتظر التواصل الأول', payment: 'صفقة ناجحة — بانتظار الدفع' }, stages: ['عميل جديد', 'التواصل الأول', 'تم إرسال العرض التجريبي', 'تم إرسال العرض', 'متابعة', 'صفقة ناجحة', 'مدفوع', 'الموقع قيد الإنشاء', 'مكتمل', 'مؤرشف / مفقود'], actions: ['الاتصال بالعميل', 'إرسال العرض التجريبي', 'إرسال العرض', 'تحديد متابعة', 'الاتصال بالعميل', 'تحصيل الدفع', 'بدء الموقع', 'تحديد كمكتمل', 'أرشفة', 'استعادة العميل'] },
  ru: { eyebrow: 'Продажи BS Finder', title: 'CRM продаж', subtitle: 'Сосредоточьтесь на разговорах и сделках, которые требуют внимания.', mission: 'Миссия на сегодня', editGoals: 'Изменить цели', saveGoals: 'Сохранить цели', leads: 'Лиды', outreach: 'Контакты', calls: 'Звонки', followUps: 'Повторные контакты', deals: 'Сделки', urgent: 'Срочные действия', urgentHint: 'Самые приоритетные возможности отображаются первыми.', pipeline: 'Воронка продаж', followUpBoard: 'Центр контактов', empty: 'Сейчас нет загруженных реальных лидов.', noUrgent: 'Срочных действий по продажам сейчас нет.', noItems: 'В этой группе нет лидов.', contact: 'Контакт', phone: 'Телефон', email: 'Email', website: 'Сайт', source: 'Источник', category: 'Категория', rating: 'Рейтинг', address: 'Адрес', status: 'Статус', followUp: 'Следующий контакт', proposal: 'Предложение', deal: 'Сделка', notes: 'Заметки', activity: 'Последняя активность', unknown: 'Недоступно', nextAction: 'Следующее действие', addNote: 'Добавить заметку', setFollowUp: 'Назначить контакт', save: 'Сохранить', cancel: 'Отмена', call: 'Позвонить', whatsapp: 'WhatsApp', openDemo: 'Открыть демо', openProposal: 'Открыть предложение', paymentMissing: 'Платёжная ссылка не настроена.', overdue: 'Просрочено', today: 'Сегодня', upcoming: 'Предстоящие', none: 'Без даты', urgency: { overdue: 'Просроченный контакт', today: 'Контакт сегодня', proposal: 'Предложение ожидает ответа', demo: 'Демо отправлено — нет ответа', new: 'Новый лид ожидает первого контакта', payment: 'Сделка выиграна — ожидает оплаты' }, stages: ['Новый лид', 'Первый контакт', 'Демо отправлено', 'Предложение отправлено', 'Повторный контакт', 'Сделка выиграна', 'Оплачено', 'Сайт в работе', 'Завершено', 'Архив / Потерян'], actions: ['Позвонить клиенту', 'Отправить демо', 'Отправить предложение', 'Назначить контакт', 'Позвонить клиенту', 'Получить оплату', 'Начать сайт', 'Отметить завершённым', 'Архивировать', 'Восстановить лид'] },
}
const PIPELINE_COPY = {
  ...COPY.he,
  eyebrow: 'מכירות',
  pageTitle: 'ניהול מכירות וצינור המכירות',
  pipeline: 'צינור המכירות',
  urgentHint: 'לידים עם תאריך פעולה, סטטוס מכירות דחוף, או מעקב שדורשים טיפול.',
  none: 'ללא תאריך פעולה',
  lastContact: 'יצירת קשר אחרונה',
  urgency: {
    ...COPY.he.urgency,
    overdue: 'תאריך פעולה באיחור',
    today: 'פעולה להיום',
    proposal: 'הצעה נשלחה — ממתין לתגובה',
    demo: 'דמו נפתח — דורש מעקב',
    follow_up: 'סטטוס מעקב — דורש טיפול',
    in_call: 'בשיחה — המשך טיפול',
    message_sent: 'הודעה נשלחה — המתנה לתגובה',
  },
  stages: ['ליד חדש', 'יצירת קשר ראשונה', 'הדמו נשלח', 'הצעת מחיר נשלחה', 'מעקב', 'עסקה נסגרה', 'שולם', 'אתר בבנייה', 'הושלם', 'ארכיון / אבוד'],
  importGoogleMaps: 'ייבוא מגוגל מפות',
  addLeadManually: 'הוספת ליד ידנית',
  createDemo: 'יצירת דמו',
  viewDemo: 'צפייה בדמו',
  sendDemo: 'שליחת דמו',
  demoImage: 'תמונת דמו',
  requiresAttentionTitle: 'דורש טיפול עכשיו',
  requiresAttentionEmpty: 'אין כרגע לידים שדורשים טיפול',
  requiresAttentionShowAll: 'הצג הכל',
  requiresAttentionNextAction: 'הפעולה הבאה',
  requiresAttentionNextActionDate: 'תאריך',
  requiresAttentionLastContact: 'יצירת קשר אחרונה',
  requiresAttentionEditLead: 'עריכת ליד',
  actionCenterTitle: 'מרכז פעולות מכירה',
  actionCenterHint: 'בחר קטגוריה כדי לראות מה לעשות עכשיו — מבוסס על שדות מעקב המכירות בליד.',
  actionCenterEmpty: 'אין לידים בקטגוריה זו',
  actionCenterShowing: 'מציג {shown} מתוך {total}',
  actionCategories: {
    must_handle_now: 'חייב טיפול עכשיו',
    call_now: 'התקשר עכשיו',
    send_whatsapp: 'שלח WhatsApp',
    open_demo: 'פתח דמו',
    ready_for_proposal: 'מוכן להצעת מחיר',
    deal_closed: 'נסגרה עסקה',
  },
  call: 'שיחה',
  whatsapp: 'WhatsApp',
  unknown: 'לא זמין',
}
const PIPELINE_METADATA_HE = {
  'Plumber': 'אינסטלטור',
  'Google Maps': 'גוגל מפות',
  'Apify Google Maps': 'גוגל מפות',
  'Persistence Verify': 'בדיקת התמדה',
}

const STAGE_ICONS = ['🔥', '📞', '🌐', '📄', '📅', '🤝', '💳', '🏗', '✅', '◌']
function display(value, fallback) { return value === 0 || value ? value : fallback }
function fieldText(value) { if (value === 0) return '0'; return String(value ?? '').trim() }
function pipelineMetadata(value) { const text = fieldText(value); return PIPELINE_METADATA_HE[text] || text }
function leadAddress(view) { return [view.lead?.address, view.city].map(fieldText).filter(Boolean).join(', ') }

function StageSelect({ value, copy, className, onChange, onClick, onMouseDown }) {
  return (
    <select className={className} value={value} aria-label={copy.status} onMouseDown={onMouseDown} onClick={onClick} onChange={onChange}>
      {CRM_STAGES.map((stage, index) => <option key={stage} value={stage}>{copy.stages[index]}</option>)}
    </select>
  )
}

function stopCardOpen(event) { event.stopPropagation() }

const SEND_DEMO_MESSAGE = (demoUrl) => `היי, ראיתי את העסק שלכם בגוגל והכנתי לכם דוגמה אישית לאתר חדש.

הדמו מבוסס על הפרטים והתמונה של העסק שלכם.

אפשר לראות כאן:
${demoUrl}

אם אהבתם, אפשר להפוך אותו לאתר אמיתי ולהעלות אותו לאוויר במהירות.

אשמח לשמוע מה דעתכם.`

function PipelineLeadCard({ view, copy, onAction, onEditLead, onDemoImage, onStageChange, selected = false, onSelect }) {
  const [demoRecord, setDemoRecord] = useState(null)
  function openDetails(event) {
    if (event?.target?.closest('a, select, option, button')) return
    onSelect?.(view.leadId)
    onEditLead?.(view)
  }
  function changeStage(event) {
    stopCardOpen(event)
    onStageChange?.(view.leadId, event.target.value)
  }
  function startDrag(event) {
    event.dataTransfer.setData('text/plain', view.leadId)
    event.dataTransfer.effectAllowed = 'move'
  }
  const businessName = display(view.businessName, copy.unknown)
  const phone = display(view.phone, copy.unknown)
  const batchLabel = fieldText(view.batchLabel)
  const whatsappUrl = createIsraeliWhatsAppUrl(view.phone)
  const rating = Number(view.lead?.leadScore)
  const optionalFields = [
    fieldText(view.category) ? [copy.category, pipelineMetadata(view.category)] : null,
    fieldText(view.source) ? [copy.source, pipelineMetadata(view.source)] : null,
    Number.isFinite(rating) && rating > 0 ? [copy.rating, rating] : null,
    fieldText(view.website) ? [copy.website, view.website] : null,
    leadAddress(view) ? [copy.address, leadAddress(view)] : null,
  ].filter(Boolean)
  function createOrViewDemo(event) {
    stopCardOpen(event)
    const existingDemo = demoRecord || loadShareableDemo(view.lead)
    if (existingDemo) {
      window.open(createDemoOpenUrl(existingDemo), '_blank', 'noopener,noreferrer')
      return
    }
    const createdDemo = onAction?.('demo', view.lead)
    if (createdDemo) setDemoRecord(createdDemo)
  }
  function sendDemo(event) {
    stopCardOpen(event)
    const demo = demoRecord || loadShareableDemo(view.lead)
    if (!demo) {
      window.alert('יש ליצור אתר דמו לפני השליחה')
      return
    }
    if (!whatsappUrl) return
    const demoUrl = createShareableDemoUrl(demo)
    window.open(`${whatsappUrl}?text=${encodeURIComponent(SEND_DEMO_MESSAGE(demoUrl))}`, '_blank', 'noopener,noreferrer')
  }
  function openDemoImage(event) {
    stopCardOpen(event)
    onDemoImage(view)
  }
  return (
    <article className={`crm-lead-card crm-lead-card--pipeline${selected ? ' is-selected' : ''}`} role="button" aria-pressed={selected} tabIndex={0} draggable onDragStart={startDrag} onClick={openDetails} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetails(event) } }}>
      <div className="crm-lead-card__content">
        <strong className="crm-lead-card__name">{businessName}</strong>
        <div className="crm-lead-card__meta">
          {whatsappUrl ? <a className="crm-lead-card__phone" href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={stopCardOpen}>{phone}</a> : <span className="crm-lead-card__phone">{phone}</span>}
          {batchLabel ? <span className="crm-lead-card__batch" title={batchLabel}>{batchLabel}</span> : null}
        </div>
        <StageSelect value={view.stage} copy={copy} className="crm-lead-card__stage crm-lead-card__stage--pipeline" onMouseDown={stopCardOpen} onClick={stopCardOpen} onChange={changeStage} />
        {optionalFields.map(([label, value]) => <span className="crm-lead-card__field" key={label}><b>{label}</b> {value}</span>)}
        <div className="crm-lead-card__demo-actions">
          <button type="button" onClick={createOrViewDemo}>{demoRecord ? copy.viewDemo : copy.createDemo}</button>
          <button className="crm-lead-card__send-demo" type="button" disabled={!whatsappUrl} onClick={sendDemo}>{copy.sendDemo}</button>
          <button type="button" onClick={openDemoImage}>תמונת דמו</button>
        </div>
      </div>
    </article>
  )
}

const MemoPipelineLeadCard = memo(PipelineLeadCard)

function PipelineColumn({ stageId, stageIndex, stageViews, copy, onAction, onEditLead, onDemoImage, onStageChange, selectedLeadId, onSelectLead, isDropTarget, onDragEnter, onDragLeave }) {
  return (
    <article className={`pipeline-column ${stageIndex < 4 ? 'pipeline-column--primary' : 'pipeline-column--secondary'}${isDropTarget ? ' is-drop-target' : ''}`}>
      <header className="pipeline-column-header"><span>{STAGE_ICONS[stageIndex]}</span><h3>{copy.stages[stageIndex]}</h3></header>
      <div
        className="pipeline-column-leads"
        onDragEnter={(event) => { event.preventDefault(); onDragEnter?.(stageId) }}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onDragLeave?.() }}
        onDrop={(event) => {
          event.preventDefault()
          onDragLeave?.()
          const leadId = event.dataTransfer.getData('text/plain')
          if (leadId) onStageChange?.(leadId, stageId)
        }}
      >
        {stageViews.map((view) => (
          <MemoPipelineLeadCard key={view.leadId} view={view} copy={copy} selected={selectedLeadId === view.leadId} onSelect={onSelectLead} onAction={onAction} onEditLead={onEditLead} onDemoImage={onDemoImage} onStageChange={onStageChange} />
        ))}
      </div>
      <footer className="pipeline-column-footer"><strong>{stageViews.length}</strong></footer>
    </article>
  )
}

function mapNavigationActionCategory(navigation) {
  if (navigation?.actionCategory) return navigation.actionCategory
  if (navigation?.followUpTab === 'overdue' || navigation?.section === 'attention') {
    return SALES_ACTION_CATEGORIES.MUST_HANDLE_NOW
  }
  if (navigation?.section === 'followups') return SALES_ACTION_CATEGORIES.MUST_HANDLE_NOW
  return SALES_ACTION_CATEGORIES.MUST_HANDLE_NOW
}

export default function CRM({ leads = [], onAction, onAddLead, onUpdateLead, onRefreshLeads: _onRefreshLeads, navigation = null, onNavigationApplied }) {
  const direction = 'rtl'; const copy = PIPELINE_COPY
  const [revision, setRevision] = useState(0); const [actionCategory, setActionCategory] = useState(SALES_ACTION_CATEGORIES.MUST_HANDLE_NOW); const [pipelineFilters, setPipelineFilters] = useState(DEFAULT_PIPELINE_FILTERS); const [pipelineFilterOpen, setPipelineFilterOpen] = useState(false); const [dashboardLeadFilter, setDashboardLeadFilter] = useState(null); const [showManualLeadForm, setShowManualLeadForm] = useState(false); const [showGoogleMapsImport, setShowGoogleMapsImport] = useState(false); const [editingView, setEditingView] = useState(null); const [mediaView, setMediaView] = useState(null); const [demoImageView, setDemoImageView] = useState(null); const [dragOverStage, setDragOverStage] = useState(''); const [selectedPipelineLeadId, setSelectedPipelineLeadId] = useState('')
  const actionRef = useRef(null)
  const pipelineRef = useRef(null)
  const navigationFilter = navigation?.filter ?? null
  const navigationSection = navigation?.section ?? null
  useEffect(() => subscribeToCrmChanges(() => setRevision((value) => value + 1)), [])
  useEffect(() => subscribeToProposalChanges(() => setRevision((value) => value + 1)), [])
  useEffect(() => {
    if (!navigation) return
    setDashboardLeadFilter(navigationFilter)
    setActionCategory(mapNavigationActionCategory(navigation))
    requestAnimationFrame(() => {
      if (navigationSection === 'revenue' || navigationSection === 'followups' || navigationSection === 'attention') {
        actionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (navigationSection === 'pipeline') pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    onNavigationApplied?.()
  }, [navigation, navigationFilter, navigationSection, onNavigationApplied])
  const views = useMemo(() => { void revision; return getCrmLeadViews(leads) }, [leads, revision])
  const actionCenterData = useMemo(() => getSalesActionCenterData(views), [views])
  const { categories, counts } = actionCenterData
  const actionEmptyReason = useMemo(
    () => explainActionCategoryEmpty(actionCategory, views, categories[actionCategory] || []),
    [actionCategory, views, categories],
  )
  const actionCopy = useMemo(() => ({
    title: copy.actionCenterTitle,
    hint: copy.actionCenterHint,
    empty: copy.actionCenterEmpty,
    showing: copy.actionCenterShowing,
    categories: copy.actionCategories,
    nextAction: copy.requiresAttentionNextAction,
    nextActionDate: copy.requiresAttentionNextActionDate,
    editLead: copy.requiresAttentionEditLead,
    call: copy.call,
    whatsapp: copy.whatsapp,
    unknown: copy.unknown,
  }), [copy])
  const pipelineBaseViews = useMemo(() => views.filter((view) => !dashboardLeadFilter || matchesDashboardFilter(view.lead, dashboardLeadFilter)), [dashboardLeadFilter, views])
  const pipelineFilteredViews = useMemo(() => {
    const filtered = applyPipelineFilters(pipelineBaseViews, pipelineFilters)
    return applyPipelineSort(filtered, pipelineFilters.sort)
  }, [pipelineBaseViews, pipelineFilters])
  const stages = useMemo(() => {
    const grouped = CRM_STAGES.map(() => [])
    for (const view of pipelineFilteredViews) {
      const stageIndex = CRM_STAGES.indexOf(view.stage)
      if (stageIndex >= 0) grouped[stageIndex].push(view)
    }
    return grouped
  }, [pipelineFilteredViews])
  const handleEditLead = useCallback((view) => setEditingView(view), [])
  const handleSelectPipelineLead = useCallback((leadId) => setSelectedPipelineLeadId(leadId), [])
  const handleDemoImage = useCallback((view) => setDemoImageView(view), [])
  const pipelineEmptyMessage = views.length
    ? (isPipelineFiltersActive(pipelineFilters) ? 'אין לידים לפי הסינון הנוכחי.' : PIPELINE_COPY.noItems)
    : PIPELINE_COPY.empty
  function resetPipelineFilters() {
    setPipelineFilters(DEFAULT_PIPELINE_FILTERS)
    setPipelineFilterOpen(false)
  }
  const updateLeadStage = useCallback((leadId, nextStage) => {
    const normalized = normalizeCrmStage(nextStage)
    if (!leadId || !CRM_STAGES.includes(normalized)) return { ok: false, reason: 'invalid-stage' }
    if (onUpdateLead) {
      const result = onUpdateLead(leadId, {}, { status: normalized, archived: normalized === 'lost' })
      if (result?.ok === false) return result
      setRevision((value) => value + 1)
      return result || { ok: true }
    }
    const existing = loadLeadCrm(leadId)
    saveLeadCrm(leadId, {
      ...existing,
      status: normalized,
      archived: normalized === 'lost',
      stageChangedAt: new Date().toISOString(),
    })
    setRevision((value) => value + 1)
    return { ok: true }
  }, [onUpdateLead])
  function persistLeadFields(leadUpdates) {
    if (!editingView) return { ok: false, reason: 'not-open' }
    const result = onUpdateLead?.(editingView.leadId, leadUpdates, {})
    if (result?.ok) {
      setEditingView((current) => current ? {
        ...current,
        lead: { ...current.lead, ...leadUpdates },
        ...enrichViewWithSalesTracking({ ...current, lead: { ...current.lead, ...leadUpdates } }),
      } : current)
      setRevision((value) => value + 1)
    }
    return result
  }
  function saveLeadEdit(leadUpdates, crmUpdates) {
    if (!editingView) return { ok: false, reason: 'not-open' }
    const result = onUpdateLead?.(editingView.leadId, leadUpdates, crmUpdates)
    if (result?.ok) setEditingView(null)
    return result
  }
  function openLeadMediaFromEdit() {
    if (!editingView?.lead) return
    setEditingView(null)
    setMediaView(editingView)
  }
  return <section className="crm-v2" dir={direction}><header className="crm-v2__header"><div><span>{copy.eyebrow}</span><h1>{copy.pageTitle}</h1><p>{copy.subtitle}</p></div></header>
    <SalesActionCenter ref={actionRef} categories={categories} counts={counts} activeCategory={actionCategory} onCategoryChange={setActionCategory} copy={actionCopy} emptyReason={actionEmptyReason} onEditLead={handleEditLead} onAction={onAction} />
    <section className="crm-v2__pipeline" ref={pipelineRef} dir="rtl"><header><span>02</span><h2>{PIPELINE_COPY.pipeline}</h2><div className="crm-v2__pipeline-actions"><button type="button" className="crm-v2__add-lead crm-v2__add-lead--secondary" onClick={() => setShowGoogleMapsImport(true)}>{PIPELINE_COPY.importGoogleMaps}</button><button type="button" className="crm-v2__add-lead" onClick={() => setShowManualLeadForm(true)}>{PIPELINE_COPY.addLeadManually}</button></div></header><PipelineFilterSort leads={leads} filters={pipelineFilters} onChange={setPipelineFilters} onReset={resetPipelineFilters} open={pipelineFilterOpen} onOpenChange={setPipelineFilterOpen} visibleCount={pipelineFilteredViews.length} totalCount={views.length} />{pipelineFilteredViews.length ? <div className="crm-v2__stages"><div className="crm-v2__stages-row crm-v2__stages-row--primary">{stages.slice(0, 4).map((stageViews, index) => <PipelineColumn key={CRM_STAGES[index]} stageId={CRM_STAGES[index]} stageIndex={index} stageViews={stageViews} copy={PIPELINE_COPY} onAction={onAction} onEditLead={handleEditLead} onDemoImage={handleDemoImage} onStageChange={updateLeadStage} selectedLeadId={selectedPipelineLeadId} onSelectLead={handleSelectPipelineLead} isDropTarget={dragOverStage === CRM_STAGES[index]} onDragEnter={setDragOverStage} onDragLeave={() => setDragOverStage('')} />)}</div><div className="crm-v2__stages-row crm-v2__stages-row--secondary">{stages.slice(4).map((stageViews, index) => { const stageIndex = index + 4; return <PipelineColumn key={CRM_STAGES[stageIndex]} stageId={CRM_STAGES[stageIndex]} stageIndex={stageIndex} stageViews={stageViews} copy={PIPELINE_COPY} onAction={onAction} onEditLead={handleEditLead} onDemoImage={handleDemoImage} onStageChange={updateLeadStage} selectedLeadId={selectedPipelineLeadId} onSelectLead={handleSelectPipelineLead} isDropTarget={dragOverStage === CRM_STAGES[stageIndex]} onDragEnter={setDragOverStage} onDragLeave={() => setDragOverStage('')} /> })}</div></div> : <p className="crm-v2__empty">{pipelineEmptyMessage}</p>}</section>
    {showManualLeadForm && <ManualLeadForm existingLeads={leads} useLegacyManualStore={false} onClose={() => setShowManualLeadForm(false)} onSave={(lead, notes) => { if (onAddLead?.(lead, notes)) setShowManualLeadForm(false) }} />}
    {showGoogleMapsImport && <GoogleMapsImportForm existingLeads={leads} onClose={() => setShowGoogleMapsImport(false)} onSave={(lead, notes, options) => { if (onAddLead?.(lead, notes, options)) setShowGoogleMapsImport(false) }} />}
    {editingView && <LeadEditForm key={editingView.leadId} lead={editingView.lead} crm={editingView.crm} stageLabels={copy.stages} onClose={() => setEditingView(null)} onPersistLeadFields={persistLeadFields} onSave={saveLeadEdit} onManageImages={openLeadMediaFromEdit} />}
    {mediaView && <LeadMediaModal lead={mediaView.lead} onClose={() => setMediaView(null)} />}
    {demoImageView && <DemoImageModal lead={demoImageView.lead} onClose={() => setDemoImageView(null)} />}
  </section>
}
