import { useRef, useState } from 'react'
import { addImagesToLeadMediaLibrary } from '../RealWebsiteBuilder/realWebsiteStorage'
import { compressImage, imageSource } from '../RealWebsiteBuilder/imageProcessing'
import { findGoogleMapsDemoImage, saveDemoHeroImage, saveShareableDemo } from '../WebsiteBuilder/demoStorage'
import './DemoImageModal.css'

export default function DemoImageModal({ lead, onClose, onChanged }) {
  const inputRef = useRef(null)
  const googleImage = findGoogleMapsDemoImage(lead)
  const [record] = useState(() => saveShareableDemo(lead))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const selectedImage = record?.business?.demoHeroImage
  const selectedMode = record?.business?.demoHeroImageMode

  function select(image, mode) {
    const next = saveDemoHeroImage(lead, image, mode)
    onChanged?.(next)
    onClose()
  }

  async function upload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const image = await compressImage(file)
      addImagesToLeadMediaLibrary(lead, [image], 'hero')
      const next = saveDemoHeroImage(lead, image, 'upload')
      if (inputRef.current) inputRef.current.value = ''
      setBusy(false)
      onChanged?.(next)
      onClose()
      return
    } catch (uploadError) {
      setError(uploadError.message || 'לא ניתן לשמור את התמונה.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="demo-image-overlay" role="dialog" aria-modal="true" aria-labelledby="demo-image-title" dir="rtl">
      <section className="demo-image-modal">
        <header><div><h2 id="demo-image-title">תמונת דמו</h2><p>{lead.businessName || lead.name}</p></div><button type="button" onClick={onClose} aria-label="סגירה">×</button></header>
        <div className="demo-image-preview">{selectedImage ? <><img src={imageSource(selectedImage)} alt="תמונת הרקע שנבחרה" /><strong>{selectedImage.name || 'תמונה שנבחרה'}</strong></> : <span>רקע ברירת המחדל</span>}</div>
        <div className="demo-image-options">
          <button type="button" disabled={!googleImage || busy} className={selectedMode === 'google-maps' ? 'is-selected' : ''} onClick={() => select(googleImage, 'google-maps')}>שימוש בתמונה מגוגל מפות</button>
          <button type="button" disabled={busy} className={selectedMode === 'upload' ? 'is-selected' : ''} onClick={() => inputRef.current?.click()}>{busy ? 'מעבד תמונה…' : 'העלאת תמונה מהמחשב'}</button>
          <button type="button" disabled={busy} className={selectedMode === 'default' ? 'is-selected' : ''} onClick={() => select(null, 'default')}>הסרת תמונה</button>
          <input ref={inputRef} type="file" accept="image/*" onChange={upload} />
        </div>
        {!googleImage && <small>לא נמצאה תמונת עסק מיובאת מגוגל מפות.</small>}
        {error && <p className="demo-image-error">{error}</p>}
        <footer><button type="button" onClick={onClose}>סגירה</button></footer>
      </section>
    </div>
  )
}
