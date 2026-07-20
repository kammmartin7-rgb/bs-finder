// Fast paste-and-review Google Maps lead import with optional images for the shared Media Library.
import { useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { compressImage, imageSource } from '../RealWebsiteBuilder/imageProcessing'
import { createManualLead, isDuplicateManualLead, isDuplicatePhoneLead } from '../ManualLead/manualLeadStorage'
import { loadPersistedLeads } from '../../services/leadPersistence'
import parseGoogleMapsPaste from './parseGoogleMapsPaste'
import './GoogleMapsImportForm.css'

const EMPTY_VALUES = {
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

function categorizeImportImages(images = []) {
  return images.map((image, index) => ({
    ...image,
    category: index === 0 ? 'hero' : index === 1 ? 'about' : 'gallery',
    libraryId: image.libraryId || `import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
  }))
}

export default function GoogleMapsImportForm({ existingLeads: _existingLeads, onSave, onClose }) {
  const { t } = useLanguage()
  const inputRef = useRef(null)
  const [step, setStep] = useState('paste')
  const [pasteText, setPasteText] = useState('')
  const [values, setValues] = useState(EMPTY_VALUES)
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function uploadFiles(fileList) {
    const files = [...fileList].filter((file) => file.type.startsWith('image/'))
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const next = []
      for (const file of files) {
        next.push(await compressImage(file))
      }
      setImages((current) => [...current, ...next])
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function continueToReview(event) {
    event.preventDefault()
    setError('')
    const parsed = parseGoogleMapsPaste(pasteText, values.mapsUrl)
    if (!parsed.businessName && !pasteText.trim()) {
      setError(t('gmapsPasteRequired'))
      return
    }
    setValues((current) => ({ ...parsed, mapsUrl: parsed.mapsUrl || current.mapsUrl }))
    setStep('review')
  }

  function submitReview(event) {
    event.preventDefault()
    setError('')
    const lead = { ...createManualLead(values), searchMode: 'google-maps-import' }
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
    onSave(lead, values.notes, { images: categorizeImportImages(images) })
  }

  return (
    <div className="gmaps-import-overlay" role="dialog" aria-modal="true" aria-labelledby="gmaps-import-title">
      {step === 'paste' ? (
        <form className="gmaps-import-form" onSubmit={continueToReview}>
          <header>
            <div><span>GrowthPilot Hunter</span><h2 id="gmaps-import-title">{t('importFromGoogleMaps')}</h2></div>
            <button type="button" onClick={onClose} aria-label={t('close')}>×</button>
          </header>
          <p className="gmaps-import-hint">{t('gmapsPasteHint')}</p>
          <label className="gmaps-import-wide">{t('gmapsPasteLabel')}
            <textarea rows="8" value={pasteText} onChange={(event) => setPasteText(event.target.value)} placeholder={t('gmapsPastePlaceholder')} autoFocus />
          </label>
          <label className="gmaps-import-wide">{t('manualMapsUrl')}
            <input type="url" value={values.mapsUrl} onChange={(event) => update('mapsUrl', event.target.value)} placeholder="https://maps.google.com/..." />
          </label>
          <div
            className={`gmaps-import-drop ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); uploadFiles(event.dataTransfer.files) }}
          >
            <p>{t('gmapsImageDrop')}</p>
            <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>{t('gmapsImageUpload')}</button>
            <input ref={inputRef} type="file" accept="image/*" multiple onChange={(event) => uploadFiles(event.target.files)} />
          </div>
          {images.length > 0 && (
            <div className="gmaps-import-previews">
              {images.map((image) => (
                <figure key={image.id}>
                  <img src={imageSource(image)} alt={image.name} />
                  <button type="button" onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))} aria-label={t('gmapsRemoveImage')}>×</button>
                </figure>
              ))}
            </div>
          )}
          {error && <p className="gmaps-import-error">{error}</p>}
          <footer>
            <button type="submit">{t('gmapsContinueReview')}</button>
            <button type="button" onClick={onClose}>{t('cancel')}</button>
          </footer>
        </form>
      ) : (
        <form className="gmaps-import-form" onSubmit={submitReview}>
          <header>
            <div><span>GrowthPilot Hunter</span><h2>{t('gmapsReviewTitle')}</h2></div>
            <button type="button" onClick={onClose} aria-label={t('close')}>×</button>
          </header>
          <p className="gmaps-import-hint">{t('gmapsReviewHint')}</p>
          <div className="gmaps-import-grid">
            <label>{t('manualBusinessName')}<input value={values.businessName} onChange={(event) => update('businessName', event.target.value)} required /></label>
            <label>{t('manualCategory')}<input value={values.category} onChange={(event) => update('category', event.target.value)} /></label>
            <label>{t('manualCity')}<input value={values.city} onChange={(event) => update('city', event.target.value)} /></label>
            <label>{t('manualAddress')}<input value={values.address} onChange={(event) => update('address', event.target.value)} /></label>
            <label>{t('manualPhone')}<input value={values.phone} onChange={(event) => update('phone', event.target.value)} /></label>
            <label>{t('manualWebsite')}<input value={values.website} onChange={(event) => update('website', event.target.value)} /></label>
            <label>{t('manualRating')}<input type="number" min="0" max="5" step="0.1" value={values.rating} onChange={(event) => update('rating', event.target.value)} /></label>
            <label>{t('manualReviews')}<input type="number" min="0" step="1" value={values.reviewsCount} onChange={(event) => update('reviewsCount', event.target.value)} /></label>
            <label>{t('manualSource')}<input value={values.source} onChange={(event) => update('source', event.target.value)} /></label>
            <label className="gmaps-import-wide">{t('manualNotes')}<textarea rows="3" value={values.notes} onChange={(event) => update('notes', event.target.value)} /></label>
            <label className="gmaps-import-wide">{t('manualMapsUrl')}<input type="url" value={values.mapsUrl} onChange={(event) => update('mapsUrl', event.target.value)} /></label>
          </div>
          {images.length > 0 && (
            <div className="gmaps-import-previews gmaps-import-previews--review">
              <span>{images.length} — {t('gmapsImagesSelected')}</span>
              <div>{images.map((image) => <img key={image.id} src={imageSource(image)} alt={image.name} />)}</div>
            </div>
          )}
          {error && <p className="gmaps-import-error">{error}</p>}
          <footer>
            <button type="button" onClick={() => setStep('paste')}>{t('gmapsBack')}</button>
            <button type="submit">{t('gmapsSaveLead')}</button>
          </footer>
        </form>
      )}
    </div>
  )
}
