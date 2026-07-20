// Opens the existing per-business Media Library and Image Manager for a CRM lead.
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { getLeadId } from '../../services/leadId'
import ImageManager from '../RealWebsiteBuilder/ImageManager'
import './LeadMediaModal.css'

export default function LeadMediaModal({ lead, onClose, onChanged }) {
  const { t } = useLanguage()
  const [images, setImages] = useState({})
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0)
  const businessName = lead.businessName || lead.name || ''
  const leadId = getLeadId(lead)

  function handleChange(key, value) {
    setImages((current) => ({ ...current, [key]: value }))
    setLibraryRefreshKey((current) => current + 1)
    onChanged?.()
  }

  function handleClose() {
    onChanged?.()
    onClose()
  }

  return (
    <div className="lead-media-overlay" role="dialog" aria-modal="true" aria-labelledby="lead-media-title">
      <section className="lead-media-modal">
        <header>
          <div><span>GrowthPilot Hunter</span><h2 id="lead-media-title">{t('manageImages')}</h2><p>{businessName}</p></div>
          <button type="button" onClick={handleClose} aria-label={t('close')}>×</button>
        </header>
        <ImageManager
          images={images}
          onChange={handleChange}
          leadId={leadId}
          businessName={businessName}
          libraryRefreshKey={libraryRefreshKey}
        />
        <footer><button type="button" onClick={handleClose}>{t('close')}</button></footer>
      </section>
    </div>
  )
}
