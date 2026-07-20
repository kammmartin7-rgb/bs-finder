// Compact modal for adding a real Google Maps lead without an API.
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { createManualLead, isDuplicateManualLead, isDuplicatePhoneLead, saveManualLead } from './manualLeadStorage'
import { loadPersistedLeads } from '../../services/leadPersistence'
import './ManualLeadForm.css'

const EMPTY_LEAD = {
  businessName: '',
  category: '',
  city: '',
  address: '',
  phone: '',
  website: '',
  rating: '',
  reviewsCount: '',
  source: 'Google Maps',
  notes: '',
  mapsUrl: '',
}

export default function ManualLeadForm({ existingLeads: _existingLeads, onSave, onClose, useLegacyManualStore = false }) {
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
    const knownLeads = loadPersistedLeads()
    if (isDuplicatePhoneLead(lead, knownLeads)) {
      setError(t('manualDuplicatePhone'))
      return
    }
    if (isDuplicateManualLead(lead, knownLeads)) {
      setError(t('manualDuplicateLead'))
      return
    }
    if (useLegacyManualStore && !saveManualLead(lead, knownLeads)) {
      setError(t('manualDuplicateLead'))
      return
    }
    onSave(lead, values.notes)
  }

  return (
    <div className="manual-lead-overlay" role="dialog" aria-modal="true" aria-labelledby="manual-lead-title">
      <form className="manual-lead-form" onSubmit={submit}>
        <header><div><span>GrowthPilot Hunter</span><h2 id="manual-lead-title">{t('addLeadManually')}</h2></div><button type="button" onClick={onClose} aria-label={t('close')}>×</button></header>
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
          <label className="manual-lead-wide">{t('manualNotes')}<textarea rows="3" value={values.notes} onChange={(event) => update('notes', event.target.value)} /></label>
          <label className="manual-lead-wide">{t('manualMapsUrl')}<input type="url" value={values.mapsUrl} onChange={(event) => update('mapsUrl', event.target.value)} /></label>
        </div>
        {error && <p className="manual-lead-error">{error}</p>}
        <footer><button type="submit">{t('saveLead')}</button><button type="button" onClick={onClose}>{t('cancel')}</button></footer>
      </form>
    </div>
  )
}
