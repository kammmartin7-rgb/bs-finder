// Compact edit modal for an existing persisted lead and its CRM record.
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { CRM_STAGES } from '../LeadCRM/crmStorage'
import LeadSalesTrackingFields from './LeadSalesTrackingFields'
import { buildLeadSalesTrackingValues, salesTrackingFormPayload } from '../../services/leadSalesTracking'
import '../ManualLead/ManualLeadForm.css'

function toFormValues(lead = {}, crm = {}) {
  return {
    businessName: lead.businessName || '',
    category: lead.category || '',
    city: lead.city || '',
    address: lead.address || '',
    phone: lead.phone || '',
    website: lead.website || '',
    rating: lead.rating ?? '',
    reviewsCount: lead.reviewsCount ?? '',
    mapsUrl: lead.mapsUrl || '',
    source: lead.source || '',
    notes: crm.notes || '',
    status: crm.status || 'new',
    nextFollowUp: crm.nextFollowUp || '',
    ...buildLeadSalesTrackingValues(lead),
  }
}

export default function LeadEditForm({ lead, crm, stageLabels = [], onSave, onPersistLeadFields, onManageImages, onClose }) {
  const { t } = useLanguage()
  const [values, setValues] = useState(() => toFormValues(lead, crm))
  const [error, setError] = useState('')

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function persistSalesField(field, value) {
    if (!onPersistLeadFields) return
    const nextValues = { ...values, [field]: value }
    const result = onPersistLeadFields(salesTrackingFormPayload(nextValues))
    if (result?.ok === false) {
      setError(result?.reason === 'duplicate-lead' ? t('manualDuplicateLead') : t('manualDuplicatePhone'))
    }
  }

  function submit(event) {
    event.preventDefault()
    setError('')
    if (!values.businessName.trim()) {
      setError(t('manualBusinessRequired'))
      return
    }

    const result = onSave({
      businessName: values.businessName,
      category: values.category,
      city: values.city,
      address: values.address,
      phone: values.phone,
      website: values.website,
      rating: values.rating,
      reviewsCount: values.reviewsCount,
      mapsUrl: values.mapsUrl,
      source: values.source,
      ...salesTrackingFormPayload(values),
    }, {
      notes: values.notes,
      status: values.status,
      nextFollowUp: values.nextFollowUp,
    })

    if (!result?.ok) {
      setError(result?.reason === 'duplicate-lead' ? t('manualDuplicateLead') : t('manualDuplicatePhone'))
    }
  }

  return (
    <div className="manual-lead-overlay" role="dialog" aria-modal="true" aria-labelledby="lead-edit-title">
      <form className="manual-lead-form" onSubmit={submit}>
        <header><div><span>BS Hunter</span><h2 id="lead-edit-title">{t('editLead')}</h2></div><button type="button" onClick={onClose} aria-label={t('close')}>×</button></header>
        <div className="manual-lead-grid">
          <label>{t('manualBusinessName')}<input value={values.businessName} onChange={(event) => update('businessName', event.target.value)} required autoFocus /></label>
          <label>{t('manualCategory')}<input value={values.category} onChange={(event) => update('category', event.target.value)} /></label>
          <label>{t('manualCity')}<input value={values.city} onChange={(event) => update('city', event.target.value)} /></label>
          <label>{t('manualAddress')}<input value={values.address} onChange={(event) => update('address', event.target.value)} /></label>
          <label>{t('manualPhone')}<input value={values.phone} onChange={(event) => update('phone', event.target.value)} /></label>
          <label>{t('manualWebsite')}<input value={values.website} onChange={(event) => update('website', event.target.value)} /></label>
          <label>{t('manualRating')}<input type="number" min="0" max="5" step="0.1" value={values.rating} onChange={(event) => update('rating', event.target.value)} /></label>
          <label>{t('manualReviews')}<input type="number" min="0" step="1" value={values.reviewsCount} onChange={(event) => update('reviewsCount', event.target.value)} /></label>
          <label>{t('manualSource')}<input value={values.source} onChange={(event) => update('source', event.target.value)} /></label>
          <label>{t('crmStatus')}<select value={values.status} onChange={(event) => update('status', event.target.value)}>{CRM_STAGES.map((stage, index) => <option key={stage} value={stage}>{stageLabels[index] || stage}</option>)}</select></label>
          <label>{t('crmNextFollowUp')}<input type="date" value={values.nextFollowUp} onChange={(event) => update('nextFollowUp', event.target.value)} /></label>
          <LeadSalesTrackingFields values={values} onChange={update} onPersistField={persistSalesField} />
          <label className="manual-lead-wide">{t('manualNotes')}<textarea rows="3" value={values.notes} onChange={(event) => update('notes', event.target.value)} /></label>
          <label className="manual-lead-wide">{t('manualMapsUrl')}<input type="url" value={values.mapsUrl} onChange={(event) => update('mapsUrl', event.target.value)} /></label>
        </div>
        {error && <p className="manual-lead-error">{error}</p>}
        <footer>
          <button type="submit">{t('saveLeadChanges')}</button>
          {onManageImages ? <button type="button" onClick={onManageImages}>{t('manageImages')}</button> : null}
          <button type="button" onClick={onClose}>{t('cancel')}</button>
        </footer>
      </form>
    </div>
  )
}
