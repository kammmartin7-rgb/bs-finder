// Reusable upload, preview, replace, and delete UI backed by the parent website project state.
import { useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { compressImage, imageSource } from './imageProcessing'
import { addImagesToBusinessMediaLibrary } from './realWebsiteStorage'
import MediaLibrary from './MediaLibrary'
import './ImageManager.css'

const COPY = {
  en: { title: 'Images', subtitle: 'Upload and manage customer website images.', logo: 'Business logo', hero: 'Hero image', about: 'About section', services: 'Services images', gallery: 'Gallery', team: 'Team images', testimonials: 'Testimonial images', contact: 'Contact section', drop: 'Drop images here or choose from computer', choose: 'Choose image', add: 'Add images', library: 'Library', replace: 'Replace', remove: 'Delete', missing: 'No image uploaded', processing: 'Compressing image', error: 'The image could not be saved. Try a smaller file.', needBusiness: 'Enter a business name before uploading images.', targetSlot: 'Selected slot' },
  he: { title: 'תמונות', subtitle: 'העלאה וניהול של תמונות אתר הלקוח.', logo: 'לוגו העסק', hero: 'תמונת פתיחה', about: 'אזור אודות', services: 'תמונות שירותים', gallery: 'גלריה', team: 'תמונות צוות', testimonials: 'תמונות המלצות', contact: 'אזור יצירת קשר', drop: 'גררו תמונות לכאן או בחרו מהמחשב', choose: 'בחירת תמונה', add: 'הוספת תמונות', library: 'ספרייה', replace: 'החלפה', remove: 'מחיקה', missing: 'לא הועלתה תמונה', processing: 'דוחס תמונה', error: 'לא ניתן לשמור את התמונה. נסו קובץ קטן יותר.', needBusiness: 'הזינו שם עסק לפני העלאת תמונות.', targetSlot: 'אזור נבחר' },
  ar: { title: 'الصور', subtitle: 'رفع وإدارة صور موقع العميل.', logo: 'شعار النشاط', hero: 'صورة الواجهة', about: 'قسم من نحن', services: 'صور الخدمات', gallery: 'المعرض', team: 'صور الفريق', testimonials: 'صور التوصيات', contact: 'قسم التواصل', drop: 'اسحب الصور هنا أو اختر من الكمبيوتر', choose: 'اختيار صورة', add: 'إضافة صور', library: 'المكتبة', replace: 'استبدال', remove: 'حذف', missing: 'لم يتم رفع صورة', processing: 'جارٍ ضغط الصورة', error: 'تعذر حفظ الصورة. جرّب ملفًا أصغر.', needBusiness: 'أدخل اسم النشاط قبل رفع الصور.', targetSlot: 'الموضع المحدد' },
  ru: { title: 'Изображения', subtitle: 'Загрузка и управление изображениями сайта клиента.', logo: 'Логотип компании', hero: 'Главное изображение', about: 'Раздел о компании', services: 'Изображения услуг', gallery: 'Галерея', team: 'Фотографии команды', testimonials: 'Фото отзывов', contact: 'Раздел контактов', drop: 'Перетащите изображения сюда или выберите на компьютере', choose: 'Выбрать изображение', add: 'Добавить изображения', library: 'Медиатека', replace: 'Заменить', remove: 'Удалить', missing: 'Изображение не загружено', processing: 'Сжатие изображения', error: 'Не удалось сохранить изображение. Выберите файл меньшего размера.', needBusiness: 'Укажите название бизнеса перед загрузкой изображений.', targetSlot: 'Выбранный слот' },
}

const SLOT_CATEGORIES = {
  logo: 'logos',
  hero: 'hero',
  about: 'about',
  services: 'services',
  gallery: 'gallery',
  team: 'team',
  testimonials: 'testimonials',
  contact: 'general',
}

const SLOTS = [
  { key: 'logo', multiple: false },
  { key: 'hero', multiple: false },
  { key: 'about', multiple: false },
  { key: 'services', multiple: true },
  { key: 'gallery', multiple: true },
  { key: 'team', multiple: true },
  { key: 'testimonials', multiple: true },
  { key: 'contact', multiple: false },
]

function ImageSlot({ slot, images, copy, onChange, onOpenLibrary, isTarget, businessName, onLibrarySync }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const value = images[slot.key]
  const items = slot.multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])

  async function addFiles(fileList, replaceIndex = null) {
    if (!String(businessName || '').trim()) {
      setError(copy.needBusiness)
      return
    }
    const files = [...fileList].filter((file) => file.type.startsWith('image/'))
    if (!files.length) return
    setError('')
    setProgress(1)
    try {
      const processed = []
      for (let index = 0; index < files.length; index += 1) {
        processed.push(await compressImage(files[index], (value) => setProgress(Math.round((index * 100 + value) / files.length))))
      }
      if (slot.multiple) {
        const next = [...items]
        if (replaceIndex === null) next.push(...processed)
        else next.splice(replaceIndex, 1, processed[0])
        onChange(slot.key, next)
      } else {
        onChange(slot.key, processed[0])
      }
      try {
        addImagesToBusinessMediaLibrary(businessName, processed, SLOT_CATEGORIES[slot.key] || 'general')
        onLibrarySync?.()
      } catch (libraryError) {
        setError(libraryError.message)
      }
    } catch {
      setError(copy.error)
    } finally {
      setProgress(0)
      if (inputRef.current) {
        inputRef.current.value = ''
        delete inputRef.current.dataset.replaceIndex
      }
    }
  }

  function remove(index) {
    if (slot.multiple) onChange(slot.key, items.filter((_, itemIndex) => itemIndex !== index))
    else onChange(slot.key, null)
  }

  return (
    <section
      className={`image-manager__slot ${dragging ? 'is-dragging' : ''} ${isTarget ? 'is-target' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }}
    >
      <header>
        <h3>{copy[slot.key]}</h3>
        <div>
          <button type="button" className={isTarget ? 'is-active' : ''} onClick={() => onOpenLibrary(isTarget ? null : slot)}>{copy.library}</button>
          <button type="button" onClick={() => inputRef.current?.click()}>{slot.multiple ? copy.add : items.length ? copy.replace : copy.choose}</button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={slot.multiple}
          onChange={(event) => addFiles(
            event.target.files,
            event.currentTarget.dataset.replaceIndex === undefined ? null : Number(event.currentTarget.dataset.replaceIndex),
          )}
        />
      </header>
      <p className="image-manager__drop">{copy.drop}</p>
      {progress > 0 && (
        <div className="image-manager__progress" role="progressbar" aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
          <small>{copy.processing} · {progress}%</small>
        </div>
      )}
      {error && <p className="image-manager__error">{error}</p>}
      {items.length ? (
        <div className="image-manager__previews">
          {items.map((image, index) => (
            <article key={image.id || index}>
              <img src={imageSource(image)} alt={`${copy[slot.key]} ${index + 1}`} loading="lazy" />
              <div>
                <small>{image.name}</small>
                <button type="button" onClick={() => { inputRef.current.dataset.replaceIndex = index; inputRef.current.click() }}>{copy.replace}</button>
                <button type="button" onClick={() => remove(index)}>{copy.remove}</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="image-manager__missing"><span>▧</span>{copy.missing}</div>
      )}
    </section>
  )
}

export default function ImageManager({
  images = {},
  onChange,
  businessName = '',
  legacyProjectId = null,
  libraryRefreshKey = 0,
}) {
  const { language } = useLanguage()
  const copy = COPY[language] || COPY.en
  const [targetSlot, setTargetSlot] = useState(null)
  const [localLibraryRefreshKey, setLocalLibraryRefreshKey] = useState(0)
  const refreshKey = Number(libraryRefreshKey) + localLibraryRefreshKey

  function selectFromLibrary(item) {
    if (!targetSlot) return
    const customerCopy = {
      ...item,
      id: `customer-image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      librarySourceId: item.libraryId,
      updatedAt: new Date().toISOString(),
    }
    delete customerCopy.libraryId
    delete customerCopy.category
    if (targetSlot.multiple) {
      onChange(targetSlot.key, [...(Array.isArray(images[targetSlot.key]) ? images[targetSlot.key] : []), customerCopy])
    } else {
      onChange(targetSlot.key, customerCopy)
    }
    setTargetSlot(null)
  }

  return (
    <fieldset className="image-manager">
      <legend>{copy.title}</legend>
      <p>{copy.subtitle}</p>
      <MediaLibrary
        targetSlot={targetSlot}
        onSelect={selectFromLibrary}
        copy={copy}
        businessName={businessName}
        legacyProjectId={legacyProjectId}
        refreshKey={refreshKey}
      />
      <div>
        {SLOTS.map((slot) => (
          <ImageSlot
            key={slot.key}
            slot={slot}
            images={images}
            copy={copy}
            onChange={onChange}
            onOpenLibrary={setTargetSlot}
            isTarget={targetSlot?.key === slot.key}
            businessName={businessName}
            onLibrarySync={() => setLocalLibraryRefreshKey((value) => value + 1)}
          />
        ))}
      </div>
    </fieldset>
  )
}
