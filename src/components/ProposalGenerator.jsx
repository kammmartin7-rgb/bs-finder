// Customer-ready fixed-scope proposal with local acceptance tracking and print/PDF support.
import { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { applyProposalTemplate, createProposalDraft, getProposalTemplate, PROPOSAL_TEMPLATES, proposalFeatures } from './proposalTemplates'
import './ProposalGenerator.css'

const FEATURE_HE = {
  'One-page mobile website': 'אתר מובייל בן עמוד אחד', 'Call, WhatsApp and Maps': 'שיחה, WhatsApp ומפות', 'Business content setup': 'הכנת תוכן עסקי', 'One revision round': 'סבב תיקונים אחד', 'Basic SEO setup': 'הגדרת SEO בסיסית',
  'Premium one-page website': 'אתר פרימיום בן עמוד אחד', 'Custom business content': 'תוכן מותאם לעסק', 'Call, WhatsApp, Maps and contact form': 'שיחה, WhatsApp, מפות וטופס יצירת קשר', 'Google reputation section': 'אזור מוניטין Google', 'Two revision rounds': 'שני סבבי תיקונים', 'Domain connection assistance': 'סיוע בחיבור דומיין', 'Basic SEO and launch checks': 'SEO בסיסי ובדיקות השקה', '7 days correction support': '7 ימי תמיכה בתיקונים',
  'Up to five pages': 'עד חמישה עמודים', 'Expanded service content': 'תוכן שירותים מורחב', 'Gallery or portfolio': 'גלריה או תיק עבודות', 'Three revision rounds': 'שלושה סבבי תיקונים', 'SEO-ready page structure': 'מבנה עמודים מוכן ל-SEO', '14 days correction support': '14 ימי תמיכה בתיקונים',
}

const COPY = {
  en: { brand: 'BS Finder', proposal: 'Website Project Proposal', preparedFor: 'Prepared for', valid: 'Valid for 14 days', status: 'Approval status', awaiting: 'Awaiting customer approval', accepted: 'Accepted', choose: 'Choose the right launch package', recommended: 'RECOMMENDED', launch: 'Launch', growth: 'Growth', pro: 'Professional', days: 'business days', select: 'Select package', selected: 'Selected', scope: 'Scope of work', scopeIntro: 'Your project will follow the selected package and the approved business information. Work outside this scope requires written approval and a separate quote.', timeline: 'Delivery timeline', timelineItems: ['Deposit and content received', 'Design and content production', 'Private customer review', 'Included revision rounds', 'Final approval and remaining payment', 'Domain connection and publication'], payment: 'Payment', deposit: '50% deposit to begin', balance: '50% after final approval and before publication', paymentNote: 'Domain registration and recurring hosting fees are separate unless explicitly included in writing.', pay: 'Continue to Secure Payment', paymentUnavailable: 'Payment link not configured yet.', acceptFirst: 'Accept the proposal to continue to payment.', terms: 'Approval terms', termsText: 'By accepting, the customer approves the selected package, fixed price, scope, payment schedule, and delivery process. Delivery begins after the deposit and required content are received. The timeline moves when customer content or feedback is delayed.', approve: 'Accept proposal', approvedOn: 'Approved on', print: 'Print / Save PDF', close: 'Close', included: 'Included', notIncluded: 'Not included', exclusions: ['Domain registration fees', 'Recurring hosting fees', 'Ongoing maintenance unless purchased separately', 'Paid advertising, guaranteed leads or Google rankings', 'Work beyond the selected package'], revisions: 'Revision rounds', domainTerms: 'Domain connection assistance is included. The customer owns and pays for the domain.', hostingTerms: 'Hosting is quoted separately and requires approval before publication.', maintenanceTerms: 'Ongoing maintenance is optional and not included in the fixed project price.', notGuarantee: 'BS Finder does not guarantee traffic, leads, revenue, or search ranking. The commitment is to deliver the agreed professional website scope.', next: 'What happens next?', nextText: 'After acceptance, BS Finder confirms the deposit method, sends the content checklist, and reserves the production slot.', afterPayment: 'Immediately after payment', afterPaymentItems: ['Payment is confirmed', 'The production slot is reserved', 'The customer receives the content checklist', 'Work begins after required content is received'] },
  he: { brand: 'BS Finder', proposal: 'הצעה לפרויקט אתר', preparedFor: 'הוכן עבור', valid: 'בתוקף ל-14 ימים', status: 'סטטוס אישור', awaiting: 'ממתין לאישור הלקוח', accepted: 'אושר', choose: 'בחירת חבילת ההשקה המתאימה', recommended: 'מומלץ', launch: 'השקה', growth: 'צמיחה', pro: 'מקצועי', days: 'ימי עסקים', select: 'בחירת חבילה', selected: 'נבחר', scope: 'היקף העבודה', scopeIntro: 'הפרויקט יבוצע בהתאם לחבילה שנבחרה ולפרטי העסק שאושרו. עבודה מחוץ להיקף דורשת אישור בכתב והצעת מחיר נפרדת.', timeline: 'לוח זמנים למסירה', timelineItems: ['קבלת מקדמה ותוכן', 'עיצוב והכנת תוכן', 'תצוגה פרטית ללקוח', 'סבבי התיקונים הכלולים', 'אישור סופי ותשלום יתרה', 'חיבור דומיין והעלאה לאוויר'], payment: 'תשלום', deposit: '50% מקדמה לתחילת העבודה', balance: '50% לאחר אישור סופי ולפני העלאה לאוויר', paymentNote: 'רישום דומיין ועלויות אחסון שוטפות נפרדים, אלא אם נכללו במפורש בכתב.', pay: 'המשך לתשלום מאובטח', paymentUnavailable: 'קישור לתשלום עדיין לא הוגדר.', acceptFirst: 'יש לאשר את ההצעה כדי להמשיך לתשלום.', terms: 'תנאי אישור', termsText: 'באישור ההצעה הלקוח מאשר את החבילה, המחיר הקבוע, ההיקף, לוח התשלומים ותהליך המסירה. העבודה מתחילה לאחר קבלת המקדמה והתוכן הנדרש. עיכוב בתוכן או במשוב הלקוח דוחה את לוח הזמנים.', approve: 'אישור ההצעה', approvedOn: 'אושר בתאריך', print: 'הדפסה / שמירה כ-PDF', close: 'סגירה', included: 'כלול', notIncluded: 'לא כלול', exclusions: ['דמי רישום דומיין', 'דמי אחסון שוטפים', 'תחזוקה שוטפת אלא אם נרכשה בנפרד', 'פרסום ממומן, לידים מובטחים או דירוג Google', 'עבודה מעבר לחבילה שנבחרה'], revisions: 'סבבי תיקונים', domainTerms: 'סיוע בחיבור הדומיין כלול. הדומיין בבעלות הלקוח ובתשלום הלקוח.', hostingTerms: 'האחסון מתומחר בנפרד ודורש אישור לפני הפרסום.', maintenanceTerms: 'תחזוקה שוטפת היא אופציונלית ואינה כלולה במחיר הפרויקט.', notGuarantee: 'BS Finder אינה מתחייבת לתנועה, לידים, הכנסות או דירוג בחיפוש. ההתחייבות היא למסירת האתר המקצועי בהתאם להיקף שסוכם.', next: 'מה קורה עכשיו?', nextText: 'לאחר האישור, BS Finder מאשרת את אמצעי המקדמה, שולחת רשימת תוכן ושומרת מקום בלוח הייצור.', afterPayment: 'מיד לאחר התשלום', afterPaymentItems: ['התשלום מאושר', 'מקום נשמר בלוח הייצור', 'הלקוח מקבל רשימת תוכן', 'העבודה מתחילה לאחר קבלת התוכן הנדרש'] },
}

const EDIT_COPY = {
  en: { contactName: 'Contact name', proposalDate: 'Proposal date', choose: 'Choose a proposal template', launch: 'Basic Website', growth: 'Business Website', pro: 'Premium Website', editProposal: 'Edit proposal', previewProposal: 'Preview proposal', saveDraft: 'Save proposal draft', draftSaved: 'Proposal draft saved.', editableDetails: 'Editable proposal details', price: 'Price', delivery: 'Delivery', features: 'Included items — one per line', select: 'Use template' },
  he: { contactName: 'שם איש קשר', proposalDate: 'תאריך ההצעה', choose: 'בחירת תבנית להצעה', launch: 'אתר בסיסי', growth: 'אתר לעסק', pro: 'אתר פרימיום', editProposal: 'עריכת ההצעה', previewProposal: 'תצוגת ההצעה', saveDraft: 'שמירת טיוטת הצעה', draftSaved: 'טיוטת ההצעה נשמרה.', editableDetails: 'פרטי הצעה לעריכה', price: 'מחיר', delivery: 'זמן מסירה', features: 'פריטים כלולים — אחד בכל שורה', select: 'שימוש בתבנית' },
}

function proposalKey(business) {
  return `bs-finder-proposal:${business?.placeId || business?.id || `${business?.businessName || business?.name || 'customer'}-${business?.phone || ''}`}`
}

function loadDraft(key, business, templateId) {
  try { const stored = JSON.parse(localStorage.getItem(`${key}:draft`)); return stored?.businessName ? { ...createProposalDraft(business, templateId), ...stored } : createProposalDraft(business, templateId) } catch { return createProposalDraft(business, templateId) }
}

function loadApproval(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null }
}

export default function ProposalGenerator({ business, onClose }) {
  const { language } = useLanguage()
  const copy = { ...(COPY[language] || COPY.en), ...(EDIT_COPY[language] || EDIT_COPY.en) }
  const direction = language === 'he' ? 'rtl' : 'ltr'
  const key = useMemo(() => proposalKey(business), [business])
  const storedApproval = useMemo(() => loadApproval(key), [key])
  const initialTemplateId = storedApproval?.packageId || 'growth'
  const [draft, setDraft] = useState(() => loadDraft(key, business, initialTemplateId))
  const [editing, setEditing] = useState(false)
  const [draftNotice, setDraftNotice] = useState('')
  const [approval, setApproval] = useState(storedApproval)
  const selectedPackage = { ...getProposalTemplate(draft.templateId), price: Math.max(0, Number(draft.price) || 0), delivery: draft.delivery, revisions: Math.max(0, Number(draft.revisions) || 0), features: proposalFeatures(draft) }
  const name = draft.businessName || (language === 'he' ? 'שם העסק' : 'Customer business')
  const proposalDate = draft.proposalDate ? new Date(`${draft.proposalDate}T00:00:00`).toLocaleDateString(language) : '—'
  const configuredPaymentUrl = String(business?.paymentUrl || '')
  const paymentUrl = /^https?:\/\//i.test(configuredPaymentUrl) ? configuredPaymentUrl : ''
  const featureLabel = (feature) => language === 'he' ? FEATURE_HE[feature] || feature : feature

  function selectTemplate(templateId) { if (approval) return; setDraft((current) => applyProposalTemplate(current, templateId)); setEditing(true); setDraftNotice('') }
  function updateDraft(field, value) { setDraft((current) => ({ ...current, [field]: value })); setDraftNotice('') }
  function saveDraft() { localStorage.setItem(`${key}:draft`, JSON.stringify(draft)); setDraftNotice(copy.draftSaved); setEditing(false) }

  function acceptProposal() {
    const record = { status: 'accepted', packageId: selectedPackage.id, price: selectedPackage.price, acceptedAt: new Date().toISOString(), businessName: name }
    localStorage.setItem(key, JSON.stringify(record))
    setApproval(record)
  }

  return <div className="proposal-overlay" role="dialog" aria-modal="true" aria-label={`${copy.proposal} — ${name}`}><article className="proposal-page" dir={direction}>
    <header className="proposal-toolbar"><button type="button" onClick={onClose}>× {copy.close}</button><div>{!approval && <button type="button" onClick={() => setEditing((value) => !value)}>{editing ? copy.previewProposal : copy.editProposal}</button>}<button type="button" onClick={() => window.print()}>▣ {copy.print}</button></div></header>
    <section className="proposal-hero"><div><span>{copy.brand}</span><h1>{copy.proposal}</h1><p>{copy.preparedFor}: <strong>{name}</strong></p>{draft.contactName && <p>{copy.contactName}: <strong>{draft.contactName}</strong></p>}<p>{copy.proposalDate}: <strong>{proposalDate}</strong></p></div><div className={`proposal-status ${approval ? 'is-accepted' : ''}`}><small>{copy.status}</small><strong>{approval ? `✓ ${copy.accepted}` : copy.awaiting}</strong>{approval && <span>{copy.approvedOn}: {new Date(approval.acceptedAt).toLocaleDateString(language)}</span>}<em>{copy.valid}</em></div></section>

    {editing && !approval && <section className="proposal-editor"><header><h2>{copy.editableDetails}</h2><button type="button" onClick={saveDraft}>{copy.saveDraft}</button></header><div><label>{copy.preparedFor}<input value={draft.businessName} onChange={(event) => updateDraft('businessName', event.target.value)} /></label><label>{copy.contactName}<input value={draft.contactName} onChange={(event) => updateDraft('contactName', event.target.value)} /></label><label>{copy.proposalDate}<input type="date" value={draft.proposalDate} onChange={(event) => updateDraft('proposalDate', event.target.value)} /></label><label>{copy.price}<input type="number" min="0" value={draft.price} onChange={(event) => updateDraft('price', event.target.value)} /></label><label>{copy.delivery}<input value={draft.delivery} onChange={(event) => updateDraft('delivery', event.target.value)} /></label><label>{copy.revisions}<input type="number" min="0" value={draft.revisions} onChange={(event) => updateDraft('revisions', event.target.value)} /></label><label className="is-wide">{copy.features}<textarea rows="7" value={draft.features} onChange={(event) => updateDraft('features', event.target.value)} /></label></div></section>}{draftNotice && <p className="proposal-draft-notice">{draftNotice}</p>}

    <section className="proposal-section"><header><span>01</span><h2>{copy.choose}</h2></header><div className="proposal-packages">{PROPOSAL_TEMPLATES.map((item) => <article key={item.id} className={`${draft.templateId === item.id ? 'is-selected' : ''} ${item.recommended ? 'is-recommended' : ''}`}>{item.recommended && <b>{copy.recommended}</b>}<h3>{copy[item.id]}</h3><strong>₪{(draft.templateId === item.id ? selectedPackage.price : item.price).toLocaleString()}</strong><small>{item.delivery} {copy.days}</small><ul>{item.features.map((feature) => <li key={feature}>✓ {featureLabel(feature)}</li>)}</ul><button type="button" disabled={Boolean(approval)} onClick={() => selectTemplate(item.id)}>{draft.templateId === item.id ? copy.selected : copy.select}</button></article>)}</div></section>

    <section className="proposal-section proposal-scope"><header><span>02</span><h2>{copy.scope}</h2></header><p><strong>{copy.selected}: {copy[selectedPackage.id]} — ₪{selectedPackage.price.toLocaleString()}</strong></p><p>{copy.scopeIntro}</p><div>{selectedPackage.features.map((feature) => <span key={feature}><b>✓</b>{featureLabel(feature)}</span>)}</div><p><strong>{copy.revisions}: {selectedPackage.revisions}</strong></p><div className="proposal-terms-grid"><p>{copy.domainTerms}</p><p>{copy.hostingTerms}</p><p>{copy.maintenanceTerms}</p></div><h3>{copy.notIncluded}</h3><ul className="proposal-exclusions">{copy.exclusions.map((item) => <li key={item}>× {item}</li>)}</ul><small>{copy.notGuarantee}</small></section>

    <section className="proposal-section"><header><span>03</span><h2>{copy.timeline}</h2></header><ol className="proposal-timeline">{copy.timelineItems.map((item, index) => <li key={item}><b>{index + 1}</b><span>{item}</span></li>)}</ol></section>

    <section className="proposal-commercial"><div><span>04</span><h2>{copy.payment}</h2><strong>₪{selectedPackage.price.toLocaleString()}</strong><p>{copy.deposit}: ₪{Math.round(selectedPackage.price / 2).toLocaleString()}</p><p>{copy.balance}: ₪{Math.round(selectedPackage.price / 2).toLocaleString()}</p><small>{copy.paymentNote}</small><h3>{copy.afterPayment}</h3><ul>{copy.afterPaymentItems.map((item) => <li key={item}>✓ {item}</li>)}</ul>{paymentUrl && approval ? <a href={paymentUrl} target="_blank" rel="noreferrer">{copy.pay} ↗</a> : <em>{paymentUrl ? copy.acceptFirst : copy.paymentUnavailable}</em>}</div><div><span>05</span><h2>{copy.terms}</h2><p>{copy.termsText}</p><h3>{copy.next}</h3><p>{copy.nextText}</p>{approval ? <strong className="proposal-approved">✓ {copy.accepted}</strong> : <button type="button" className="proposal-accept" onClick={acceptProposal}>{copy.approve}</button>}</div></section>
  </article></div>
}
