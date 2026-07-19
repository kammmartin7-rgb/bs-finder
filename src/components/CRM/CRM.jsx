// Sales-first CRM V2 workspace built on the existing lead, CRM, proposal-action, and language architecture.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { loadLeadCrm, saveLeadCrm, subscribeToCrmChanges } from '../LeadCRM/crmStorage'
import { LEAD_ACTIONS, recordLeadAction, subscribeToLeadActionChanges } from '../LeadCRM/leadActionStorage'
import { subscribeToProposalChanges } from '../proposalStorage'
import { matchesDashboardFilter } from '../BusinessOS/dashboardFilters'
import { loadCrmGoals, saveCrmGoals } from './crmGoalsStorage'
import { CRM_STAGES, getCrmLeadViews, getCrmRevenueSummary, getFollowUpGroups, getTodayMissionActuals, getUrgentCrmLeads, normalizeCrmStage } from './crmSelectors'
import ManualLeadForm from '../ManualLead/ManualLeadForm'
import GoogleMapsImportForm from '../GoogleMapsImport/GoogleMapsImportForm'
import LeadEditForm from './LeadEditForm'
import LeadMediaModal from './LeadMediaModal'
import DemoImageModal from './DemoImageModal'
import { loadLeadMediaLibrary } from '../RealWebsiteBuilder/realWebsiteStorage'
import { imageSource } from '../RealWebsiteBuilder/imageProcessing'
import { createIsraeliWhatsAppUrl } from '../../services/whatsapp'
import { createShareableDemoUrl, loadShareableDemo } from '../WebsiteBuilder/demoStorage'
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
  stages: ['ליד חדש', 'יצירת קשר ראשונה', 'הדמו נשלח', 'הצעת מחיר נשלחה', 'מעקב', 'עסקה נסגרה', 'שולם', 'אתר בבנייה', 'הושלם', 'ארכיון / אבוד'],
  importGoogleMaps: 'ייבוא מגוגל מפות',
  addLeadManually: 'הוספת ליד ידנית',
  createDemo: 'יצירת דמו',
  viewDemo: 'צפייה בדמו',
  sendDemo: 'שליחת דמו',
  demoImage: 'תמונת דמו',
}
const PIPELINE_METADATA_HE = {
  'Plumber': 'אינסטלטור',
  'Google Maps': 'גוגל מפות',
  'Apify Google Maps': 'גוגל מפות',
  'Persistence Verify': 'בדיקת התמדה',
}

const STAGE_ICONS = ['🔥', '📞', '🌐', '📄', '📅', '🤝', '💳', '🏗', '✅', '◌']
const PRIMARY_ACTIONS = ['call', 'demo', 'proposal', 'schedule', 'call', 'payment', 'real-website', 'complete', 'archive', 'restore']
const FINISH_COPY = {
  en: { search: 'Search leads', allStages: 'All stages', sortUrgent: 'Urgency', sortFollowUp: 'Next follow-up', sortScore: 'Lead score', sortUpdated: 'Last updated', sortName: 'Business name', revenue: 'Revenue Summary', openProposals: 'Open proposals', proposalValue: 'Proposal value', wonDeals: 'Won deals', paidRevenue: 'Paid revenue', awaitingPayment: 'Awaiting payment' },
  he: { search: 'חיפוש לידים', allStages: 'כל השלבים', sortUrgent: 'דחיפות', sortFollowUp: 'מעקב הבא', sortScore: 'ציון ליד', sortUpdated: 'עדכון אחרון', sortName: 'שם העסק', revenue: 'סיכום הכנסות', openProposals: 'הצעות פתוחות', proposalValue: 'שווי הצעות', wonDeals: 'עסקאות שנסגרו', paidRevenue: 'הכנסה ששולמה', awaitingPayment: 'ממתינים לתשלום' },
  ar: { search: 'بحث العملاء', allStages: 'كل المراحل', sortUrgent: 'الأولوية', sortFollowUp: 'المتابعة التالية', sortScore: 'تقييم العميل', sortUpdated: 'آخر تحديث', sortName: 'اسم النشاط', revenue: 'ملخص الإيرادات', openProposals: 'العروض المفتوحة', proposalValue: 'قيمة العروض', wonDeals: 'الصفقات الناجحة', paidRevenue: 'الإيرادات المدفوعة', awaitingPayment: 'بانتظار الدفع' },
  ru: { search: 'Поиск лидов', allStages: 'Все этапы', sortUrgent: 'Срочность', sortFollowUp: 'Следующий контакт', sortScore: 'Оценка лида', sortUpdated: 'Последнее обновление', sortName: 'Название компании', revenue: 'Сводка выручки', openProposals: 'Открытые предложения', proposalValue: 'Сумма предложений', wonDeals: 'Выигранные сделки', paidRevenue: 'Оплаченная выручка', awaitingPayment: 'Ожидают оплаты' },
}
function display(value, fallback) { return value === 0 || value ? value : fallback }
function amount(value, fallback) { const number = Number(value); return Number.isFinite(number) && number > 0 ? `₪${number.toLocaleString()}` : fallback }
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

function LeadCard({ view, copy, onAction, onEditLead, onManageImages, onDemoImage, mediaRevision, onStageChange, pipeline = false, selected = false, onSelect }) {
  const { t } = useLanguage()
  const [editor, setEditor] = useState('')
  const [notes, setNotes] = useState(view.crm.notes)
  const [followUp, setFollowUp] = useState(view.crm.nextFollowUp)
  const [demoRecord, setDemoRecord] = useState(() => loadShareableDemo(view.lead))
  const mediaItems = useMemo(() => {
    void mediaRevision
    try {
      return loadLeadMediaLibrary(view.lead)
    } catch {
      return []
    }
  }, [view.lead, mediaRevision])
  const mediaPreview = mediaItems[0] ? imageSource(mediaItems[0]) : ''
  const stageIndex = CRM_STAGES.indexOf(view.stage)
  function update(updates) { saveLeadCrm(view.leadId, { ...view.crm, ...updates }) }
  function openDetails(event) {
    if (event?.target?.closest('a, select, option')) return
    if (pipeline && !selected) {
      onSelect?.(view.leadId)
      return
    }
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
  if (pipeline) {
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
        window.open(createShareableDemoUrl(existingDemo), '_blank', 'noopener,noreferrer')
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
  function primary() {
    const action = PRIMARY_ACTIONS[stageIndex]
    if (action === 'schedule') return setEditor('follow-up')
    if (action === 'complete') return update({ status: 'completed', stageChangedAt: new Date().toISOString() })
    if (action === 'archive') return update({ status: 'lost', archived: true, stageChangedAt: new Date().toISOString() })
    if (action === 'restore') return update({ status: 'new', archived: false, stageChangedAt: new Date().toISOString() })
    if (action === 'real-website') update({ status: 'website-in-progress', stageChangedAt: new Date().toISOString() })
    if (action === 'call' && view.stage === 'follow-up') recordLeadAction(view.lead, LEAD_ACTIONS.FOLLOW_UP_COMPLETED)
    onAction?.(action, view.lead)
  }
  function saveEditor() { update(editor === 'notes' ? { notes } : { nextFollowUp: followUp }); setEditor('') }
  const paymentBlocked = view.stage === 'deal-won' && !/^https?:\/\//i.test(String(view.lead.paymentUrl || ''))
  return <article className="crm-lead-card"><header><div>{mediaPreview ? <img className="crm-lead-card__thumb" src={mediaPreview} alt="" loading="lazy" /> : null}<h4>{display(view.businessName, copy.unknown)}</h4><span>{display(view.contactName, copy.unknown)}</span>{mediaItems.length ? <small className="crm-lead-card__media-count">{mediaItems.length} {t('leadImageCount')}</small> : null}</div><strong>{Number(view.lead.leadScore) || '—'}</strong></header>
    <StageSelect value={view.stage} copy={copy} className="crm-lead-card__stage" onChange={changeStage} />
    <dl><div><dt>{copy.phone}</dt><dd>{display(view.phone, copy.unknown)}</dd></div><div><dt>{copy.email}</dt><dd>{display(view.email, copy.unknown)}</dd></div><div><dt>{copy.website || 'Website'}</dt><dd>{display(view.website, copy.unknown)}</dd></div><div><dt>{copy.source}</dt><dd>{display(view.source, copy.unknown)}</dd></div><div><dt>{copy.followUp}</dt><dd>{display(view.crm.nextFollowUp, copy.unknown)}</dd></div><div><dt>{copy.proposal}</dt><dd>{amount(view.proposalAmount, copy.unknown)}</dd></div><div><dt>{copy.deal}</dt><dd>{amount(view.dealAmount, copy.unknown)}</dd></div></dl>
    <p><b>{copy.notes}:</b> {display(view.crm.notes, copy.unknown)}</p><small>{copy.activity}: {display(view.latestActivity, copy.unknown)}</small>
    <button className="crm-lead-card__primary" type="button" disabled={paymentBlocked} onClick={primary}>{copy.nextAction}: {copy.actions[stageIndex]}</button>{paymentBlocked && <em>{copy.paymentMissing}</em>}
    <div className="crm-lead-card__secondary"><button type="button" onClick={() => onEditLead?.(view)}>{t('editLead')}</button><button type="button" onClick={() => onManageImages?.(view)} disabled={!view.leadId}>{t('manageImages')}</button><button type="button" disabled={!view.phone} onClick={() => onAction?.('call', view.lead)}>{copy.call}</button><button type="button" disabled={!view.phone} onClick={() => onAction?.('whatsapp', view.lead)}>{copy.whatsapp}</button><button type="button" onClick={() => onAction?.('demo', view.lead)}>{copy.openDemo}</button><button type="button" onClick={() => onAction?.('proposal', view.lead)}>{copy.openProposal}</button><button type="button" onClick={() => setEditor('notes')}>{copy.addNote}</button><button type="button" onClick={() => setEditor('follow-up')}>{copy.setFollowUp}</button></div>
    {editor && <div className="crm-lead-card__editor">{editor === 'notes' ? <textarea rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} /> : <input type="date" value={followUp} onChange={(event) => setFollowUp(event.target.value)} />}<div><button type="button" onClick={saveEditor}>{copy.save}</button><button type="button" onClick={() => setEditor('')}>{copy.cancel}</button></div></div>}
  </article>
}

function PipelineColumn({ stageId, stageIndex, stageViews, copy, onAction, onEditLead, onManageImages, onDemoImage, mediaRevision, onStageChange, selectedLeadId, onSelectLead, isDropTarget, onDragEnter, onDragLeave }) {
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
          <LeadCard key={view.leadId} view={view} copy={copy} pipeline selected={selectedLeadId === view.leadId} onSelect={onSelectLead} onAction={onAction} onEditLead={onEditLead} onManageImages={onManageImages} onDemoImage={onDemoImage} mediaRevision={mediaRevision} onStageChange={onStageChange} />
        ))}
      </div>
      <footer className="pipeline-column-footer"><strong>{stageViews.length}</strong></footer>
    </article>
  )
}

export default function CRM({ leads = [], onAction, onAddLead, onUpdateLead, onRefreshLeads, navigation = null, onNavigationApplied }) {
  const direction = 'rtl'; const copy = PIPELINE_COPY; const finish = FINISH_COPY.he
  const [revision, setRevision] = useState(0); const [goals, setGoals] = useState(loadCrmGoals); const [editingGoals, setEditingGoals] = useState(false); const [followUpTab, setFollowUpTab] = useState('overdue'); const [search, setSearch] = useState(''); const [stageFilter, setStageFilter] = useState('all'); const [sortBy, setSortBy] = useState('urgent'); const [pipelineFilters, setPipelineFilters] = useState(DEFAULT_PIPELINE_FILTERS); const [pipelineFilterOpen, setPipelineFilterOpen] = useState(false); const [dashboardLeadFilter, setDashboardLeadFilter] = useState(null); const [showManualLeadForm, setShowManualLeadForm] = useState(false); const [showGoogleMapsImport, setShowGoogleMapsImport] = useState(false); const [editingView, setEditingView] = useState(null); const [mediaView, setMediaView] = useState(null); const [demoImageView, setDemoImageView] = useState(null); const [mediaRevision, setMediaRevision] = useState(0); const [dragOverStage, setDragOverStage] = useState(''); const [selectedPipelineLeadId, setSelectedPipelineLeadId] = useState('')
  const revenueRef = useRef(null)
  const followUpsRef = useRef(null)
  const pipelineRef = useRef(null)
  const navigationFilter = navigation?.filter ?? null
  const navigationSection = navigation?.section ?? null
  const navigationFollowUpTab = navigation?.followUpTab ?? null
  useEffect(() => { onRefreshLeads?.() }, [onRefreshLeads])
  useEffect(() => subscribeToCrmChanges(() => setRevision((value) => value + 1)), [])
  useEffect(() => subscribeToLeadActionChanges(() => setRevision((value) => value + 1)), [])
  useEffect(() => subscribeToProposalChanges(() => setRevision((value) => value + 1)), [])
  useEffect(() => {
    if (!navigation) return
    setDashboardLeadFilter(navigationFilter)
    if (navigationFollowUpTab) setFollowUpTab(navigationFollowUpTab)
    requestAnimationFrame(() => {
      if (navigationSection === 'revenue') revenueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (navigationSection === 'followups') followUpsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (navigationSection === 'pipeline') pipelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    onNavigationApplied?.()
  }, [navigation, navigationFilter, navigationFollowUpTab, navigationSection, onNavigationApplied])
  const views = useMemo(() => { void revision; return getCrmLeadViews(leads) }, [leads, revision]); const urgent = useMemo(() => getUrgentCrmLeads(views), [views]); const actuals = useMemo(() => getTodayMissionActuals(views), [views]); const followUpGroups = useMemo(() => getFollowUpGroups(views), [views]); const revenue = useMemo(() => getCrmRevenueSummary(views), [views])
  const pipelineBaseViews = useMemo(() => {
    const query = search.trim().toLowerCase()
    return views
      .filter((view) => stageFilter === 'all' || view.stage === stageFilter)
      .filter((view) => !dashboardLeadFilter || matchesDashboardFilter(view.lead, dashboardLeadFilter))
      .filter((view) => !query || [view.businessName, view.contactName, view.phone, view.email, view.website, view.lead.category, view.lead.city, view.source, view.crm.notes].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [dashboardLeadFilter, search, stageFilter, views])
  const pipelineFilteredViews = useMemo(() => {
    const filtered = applyPipelineFilters(pipelineBaseViews, pipelineFilters)
    return applyPipelineSort(filtered, pipelineFilters.sort)
  }, [pipelineBaseViews, pipelineFilters])
  const stages = useMemo(() => CRM_STAGES.map((stage) => pipelineFilteredViews.filter((view) => view.stage === stage)), [pipelineFilteredViews])
  const pipelineEmptyMessage = views.length
    ? (isPipelineFiltersActive(pipelineFilters) ? 'אין לידים לפי הסינון הנוכחי.' : PIPELINE_COPY.noItems)
    : PIPELINE_COPY.empty
  function resetPipelineFilters() {
    setPipelineFilters(DEFAULT_PIPELINE_FILTERS)
    setPipelineFilterOpen(false)
  }
  const metrics = [['leads', copy.leads], ['outreach', copy.outreach], ['calls', copy.calls], ['followUps', copy.followUps], ['deals', copy.deals]]; const tabs = [['overdue', copy.overdue], ['today', copy.today], ['upcoming', copy.upcoming], ['none', copy.none]]
  function updateLeadStage(leadId, nextStage) {
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
    onRefreshLeads?.()
    return { ok: true }
  }
  function persistGoals() { setGoals(saveCrmGoals(goals)); setEditingGoals(false) }
  return <section className="crm-v2" dir={direction}><header className="crm-v2__header"><div><span>{copy.eyebrow}</span><h1>{copy.pageTitle}</h1><p>{copy.subtitle}</p></div><div className="crm-v2__toolbar"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={finish.search} aria-label={finish.search} /><select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option value="all">{finish.allStages}</option>{CRM_STAGES.map((stage, index) => <option key={stage} value={stage}>{copy.stages[index]}</option>)}</select><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="urgent">{finish.sortUrgent}</option><option value="follow-up">{finish.sortFollowUp}</option><option value="score">{finish.sortScore}</option><option value="updated">{finish.sortUpdated}</option><option value="name">{finish.sortName}</option></select></div></header>
    <section className="crm-v2__mission"><header><span>01</span><h2>{copy.mission}</h2><button type="button" onClick={() => editingGoals ? persistGoals() : setEditingGoals(true)}>{editingGoals ? copy.saveGoals : copy.editGoals}</button></header><div>{metrics.map(([key, label]) => <article key={key}><span>{label}</span><strong>{actuals[key]} / {editingGoals ? <input type="number" min="0" value={goals[key]} onChange={(event) => setGoals({ ...goals, [key]: event.target.value })} /> : goals[key]}</strong><i><b style={{ width: `${Math.min(100, goals[key] ? actuals[key] / goals[key] * 100 : 0)}%` }} /></i></article>)}</div></section>
    <section className="crm-v2__urgent"><header><div><span>02</span><h2>{copy.urgent}</h2><p>{copy.urgentHint}</p></div><strong>{urgent.length}</strong></header>{urgent.length ? <div>{urgent.slice(0, 6).map((view) => <article key={view.leadId} className={`is-priority-${view.urgency.rank}`}><i /><div><strong>{copy.urgency[view.urgency.type]}</strong><span>{view.businessName}</span></div><b>{view.lead.leadScore || '—'}</b></article>)}</div> : <p className="crm-v2__empty">{copy.noUrgent}</p>}</section>
    <section className="crm-v2__revenue" ref={revenueRef}><header><span>03</span><h2>{finish.revenue}</h2></header><div>{[[finish.openProposals, revenue.openProposals], [finish.proposalValue, `₪${revenue.proposalValue.toLocaleString()}`], [finish.wonDeals, revenue.wonDeals], [finish.paidRevenue, `₪${revenue.paidRevenue.toLocaleString()}`], [finish.awaitingPayment, revenue.awaitingPayment]].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div></section>
    <section className="crm-v2__followups" ref={followUpsRef}><header><span>04</span><h2>{copy.followUpBoard}</h2></header><nav>{tabs.map(([key, label]) => <button type="button" className={followUpTab === key ? 'is-active' : ''} key={key} onClick={() => setFollowUpTab(key)}>{label} <b>{followUpGroups[key].length}</b></button>)}</nav><div>{followUpGroups[followUpTab].length ? followUpGroups[followUpTab].map((view) => <article key={view.leadId}><strong>{view.businessName}</strong><span>{view.crm.nextFollowUp || copy.none}</span><button type="button" onClick={() => onAction?.('call', view.lead)} disabled={!view.phone}>{copy.call}</button></article>) : <p>{copy.noItems}</p>}</div></section>
    <section className="crm-v2__pipeline" ref={pipelineRef} dir="rtl"><header><span>05</span><h2>{PIPELINE_COPY.pipeline}</h2><div className="crm-v2__pipeline-actions"><button type="button" className="crm-v2__add-lead crm-v2__add-lead--secondary" onClick={() => setShowGoogleMapsImport(true)}>{PIPELINE_COPY.importGoogleMaps}</button><button type="button" className="crm-v2__add-lead" onClick={() => setShowManualLeadForm(true)}>{PIPELINE_COPY.addLeadManually}</button></div></header><PipelineFilterSort leads={leads} filters={pipelineFilters} onChange={setPipelineFilters} onReset={resetPipelineFilters} open={pipelineFilterOpen} onOpenChange={setPipelineFilterOpen} visibleCount={pipelineFilteredViews.length} totalCount={views.length} />{pipelineFilteredViews.length ? <div className="crm-v2__stages"><div className="crm-v2__stages-row crm-v2__stages-row--primary">{stages.slice(0, 4).map((stageViews, index) => <PipelineColumn key={CRM_STAGES[index]} stageId={CRM_STAGES[index]} stageIndex={index} stageViews={stageViews} copy={PIPELINE_COPY} onAction={onAction} onEditLead={setEditingView} onManageImages={setMediaView} onDemoImage={setDemoImageView} mediaRevision={mediaRevision} onStageChange={updateLeadStage} selectedLeadId={selectedPipelineLeadId} onSelectLead={setSelectedPipelineLeadId} isDropTarget={dragOverStage === CRM_STAGES[index]} onDragEnter={setDragOverStage} onDragLeave={() => setDragOverStage('')} />)}</div><div className="crm-v2__stages-row crm-v2__stages-row--secondary">{stages.slice(4).map((stageViews, index) => { const stageIndex = index + 4; return <PipelineColumn key={CRM_STAGES[stageIndex]} stageId={CRM_STAGES[stageIndex]} stageIndex={stageIndex} stageViews={stageViews} copy={PIPELINE_COPY} onAction={onAction} onEditLead={setEditingView} onManageImages={setMediaView} onDemoImage={setDemoImageView} mediaRevision={mediaRevision} onStageChange={updateLeadStage} selectedLeadId={selectedPipelineLeadId} onSelectLead={setSelectedPipelineLeadId} isDropTarget={dragOverStage === CRM_STAGES[stageIndex]} onDragEnter={setDragOverStage} onDragLeave={() => setDragOverStage('')} /> })}</div></div> : <p className="crm-v2__empty">{pipelineEmptyMessage}</p>}</section>
    {showManualLeadForm && <ManualLeadForm existingLeads={leads} useLegacyManualStore={false} onClose={() => setShowManualLeadForm(false)} onSave={(lead, notes) => { if (onAddLead?.(lead, notes)) setShowManualLeadForm(false) }} />}
    {showGoogleMapsImport && <GoogleMapsImportForm existingLeads={leads} onClose={() => setShowGoogleMapsImport(false)} onSave={(lead, notes, options) => { if (onAddLead?.(lead, notes, options)) setShowGoogleMapsImport(false) }} />}
    {editingView && <LeadEditForm lead={editingView.lead} crm={editingView.crm} stageLabels={copy.stages} onClose={() => setEditingView(null)} onSave={(leadUpdates, crmUpdates) => { const result = onUpdateLead?.(editingView.leadId, leadUpdates, crmUpdates); if (result?.ok) setEditingView(null); return result }} />}
    {mediaView && <LeadMediaModal lead={mediaView.lead} onClose={() => setMediaView(null)} onChanged={() => setMediaRevision((value) => value + 1)} />}
    {demoImageView && <DemoImageModal lead={demoImageView.lead} onClose={() => setDemoImageView(null)} onChanged={() => setMediaRevision((value) => value + 1)} />}
  </section>
}
