// Compact modal for adding a real Google Maps lead without an API.
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { createManualLead, saveManualLead } from './manualLeadStorage'
import './ManualLeadForm.css'

const EMPTY_LEAD = { businessName: '', website: '', phone: '', address: '', rating: '', reviewsCount: '', mapsUrl: '' }

export default function ManualLeadForm({ existingLeads, onSave, onClose }) {
  const { t } = useLanguage()
  const [values, setValues] = useState(EMPTY_LEAD)
  const [error, setError] = useState('')

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    setError('')
    const lead = createManualLead(values)
    if (!lead.businessName) {
      setError(t('manualBusinessRequired'))
      return
    }
    if (!saveManualLead(lead, existingLeads)) {
      setError(t('manualDuplicateLead'))
      return
    }
    onSave(lead)
  }

  return (
    <div className="manual-lead-overlay" role="dialog" aria-modal="true" aria-labelledby="manual-lead-title">
      <form className="manual-lead-form" onSubmit={submit}>
        <header><div><span>BS Hunter</span><h2 id="manual-lead-title">{t('addLeadManually')}</h2></div><button type="button" onClick={onClose} aria-label={t('close')}>×</button></header>
        <div className="manual-lead-grid">
          <label>{t('manualBusinessName')}<input value={values.businessName} onChange={(event) => update('businessName', event.target.value)} required autoFocus /></label>
          <label>{t('manualWebsite')}<input value={values.website} onChange={(event) => update('website', event.target.value)} /></label>
          <label>{t('manualPhone')}<input value={values.phone} onChange={(event) => update('phone', event.target.value)} /></label>
          <label>{t('manualAddress')}<input value={values.address} onChange={(event) => update('address', event.target.value)} /></label>
          <label>{t('manualRating')}<input type="number" min="0" max="5" step="0.1" value={values.rating} onChange={(event) => update('rating', event.target.value)} /></label>
          <label>{t('manualReviews')}<input type="number" min="0" step="1" value={values.reviewsCount} onChange={(event) => update('reviewsCount', event.target.value)} /></label>
          <label className="manual-lead-wide">{t('manualMapsUrl')}<input type="url" value={values.mapsUrl} onChange={(event) => update('mapsUrl', event.target.value)} /></label>
        </div>
        {error && <p className="manual-lead-error">{error}</p>}
        <footer><button type="submit">{t('saveLead')}</button><button type="button" onClick={onClose}>{t('cancel')}</button></footer>
      </form>
    </div>
  )
}
