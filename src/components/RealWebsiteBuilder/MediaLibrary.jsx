// Per-business reusable media collection; selected items are copied into customer project state.
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { compressImage, imageSource } from './imageProcessing'
import { loadBusinessMediaLibrary, MEDIA_LIBRARY_MAX_ITEMS, saveBusinessMediaLibrary } from './realWebsiteStorage'
import './MediaLibrary.css'

const CATEGORIES = ['logos', 'hero', 'services', 'about', 'gallery', 'team', 'testimonials', 'general']
const COPY = {
  en: { title: 'Business Media Library', subtitle: 'Reusable images for this business only · 80 images / 3.5 MB maximum', category: 'Category', upload: 'Upload to library', drop: 'Drop reusable images here', all: 'All', rename: 'Rename', remove: 'Delete', use: 'Use for customer', chooseSlot: 'Choose a customer image slot first.', empty: 'No reusable images in this category.', newName: 'Image name', confirmDelete: 'Delete this library image?', targetSlot: 'Selected slot', needBusiness: 'Enter a business name before uploading media for this business.', categories: ['Logos', 'Hero backgrounds', 'Services', 'About', 'Gallery', 'Team', 'Testimonials', 'General'] },
  he: { title: 'ספריית מדיה לעסק', subtitle: 'תמונות לשימוש חוזר לעסק זה בלבד · עד 80 תמונות / 3.5MB', category: 'קטגוריה', upload: 'העלאה לספרייה', drop: 'גררו לכאן תמונות לשימוש חוזר', all: 'הכול', rename: 'שינוי שם', remove: 'מחיקה', use: 'שימוש ללקוח', chooseSlot: 'בחרו קודם אזור תמונות של לקוח.', empty: 'אין תמונות לשימוש חוזר בקטגוריה זו.', newName: 'שם התמונה', confirmDelete: 'למחוק את התמונה מהספרייה?', targetSlot: 'אזור נבחר', needBusiness: 'הזינו שם עסק לפני העלאת מדיה לעסק זה.', categories: ['לוגואים', 'תמונות פתיחה', 'שירותים', 'אודות', 'גלריה', 'צוות', 'המלצות', 'כללי'] },
  ar: { title: 'مكتبة وسائط النشاط', subtitle: 'صور قابلة لإعادة الاستخدام لهذا النشاط فقط · 80 صورة / 3.5MB كحد أقصى', category: 'الفئة', upload: 'رفع إلى المكتبة', drop: 'اسحب الصور القابلة لإعادة الاستخدام هنا', all: 'الكل', rename: 'إعادة تسمية', remove: 'حذف', use: 'استخدام للعميل', chooseSlot: 'اختر أولاً موضع صورة للعميل.', empty: 'لا توجد صور قابلة لإعادة الاستخدام في هذه الفئة.', newName: 'اسم الصورة', confirmDelete: 'حذف هذه الصورة من المكتبة؟', targetSlot: 'الموضع المحدد', needBusiness: 'أدخل اسم النشاط قبل رفع وسائط لهذا النشاط.', categories: ['الشعارات', 'صور الواجهة', 'الخدمات', 'من نحن', 'المعرض', 'الفريق', 'التوصيات', 'عام'] },
  ru: { title: 'Медиатека бизнеса', subtitle: 'Многоразовые изображения только для этого бизнеса · до 80 изображений / 3,5 МБ', category: 'Категория', upload: 'Загрузить в библиотеку', drop: 'Перетащите сюда многоразовые изображения', all: 'Все', rename: 'Переименовать', remove: 'Удалить', use: 'Использовать для клиента', chooseSlot: 'Сначала выберите слот изображения клиента.', empty: 'В этой категории нет изображений.', newName: 'Название изображения', confirmDelete: 'Удалить это изображение из библиотеки?', targetSlot: 'Выбранный слот', needBusiness: 'Укажите название бизнеса перед загрузкой медиа для этого бизнеса.', categories: ['Логотипы', 'Главные изображения', 'Услуги', 'О компании', 'Галерея', 'Команда', 'Отзывы', 'Общее'] },
}

export default function MediaLibrary({
  targetSlot,
  onSelect,
  copy = {},
  businessName = '',
  legacyProjectId = null,
  refreshKey = 0,
}) {
  const { language } = useLanguage()
  const labels = COPY[language] || COPY.en
  const inputRef = useRef(null)
  const [items, setItems] = useState(() => loadBusinessMediaLibrary(businessName, legacyProjectId))
  const [category, setCategory] = useState('general')
  const [filter, setFilter] = useState('all')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    setItems(loadBusinessMediaLibrary(businessName, legacyProjectId))
    setFilter('all')
    setError('')
  }, [businessName, legacyProjectId, refreshKey])

  const visible = filter === 'all' ? items : items.filter((item) => item.category === filter)

  function persist(next) {
    try {
      setItems(saveBusinessMediaLibrary(businessName, next))
      setError('')
      return true
    } catch (storageError) {
      setError(storageError.message)
      return false
    }
  }

  async function upload(fileList) {
    if (!String(businessName || '').trim()) {
      setError(labels.needBusiness)
      return
    }
    const files = [...fileList].filter((file) => file.type.startsWith('image/'))
    if (!files.length) return
    if (items.length + files.length > MEDIA_LIBRARY_MAX_ITEMS) {
      setError(`Maximum ${MEDIA_LIBRARY_MAX_ITEMS} library images.`)
      return
    }
    setError('')
    setProgress(1)
    try {
      const added = []
      for (let index = 0; index < files.length; index += 1) {
        const image = await compressImage(files[index], (value) => setProgress(Math.round((index * 100 + value) / files.length)))
        added.push({ ...image, category, libraryId: `library-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}` })
      }
      persist([...added, ...items])
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function rename(item) {
    const name = window.prompt(labels.newName, item.name)
    if (name?.trim()) {
      persist(items.map((current) => (
        current.libraryId === item.libraryId
          ? { ...current, name: name.trim(), updatedAt: new Date().toISOString() }
          : current
      )))
    }
  }

  function remove(item) {
    if (window.confirm(labels.confirmDelete)) {
      persist(items.filter((current) => current.libraryId !== item.libraryId))
    }
  }

  return (
    <section
      className={`media-library ${dragging ? 'is-dragging' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files) }}
    >
      <header>
        <div>
          <h3>{labels.title}</h3>
          <p>
            {labels.subtitle}
            {businessName ? ` · ${businessName}` : ''}
            {targetSlot && copy[targetSlot.key] ? ` · ${labels.targetSlot}: ${copy[targetSlot.key]}` : ''}
          </p>
        </div>
        <div>
          <label>
            {labels.category}
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORIES.map((key, index) => <option key={key} value={key}>{labels.categories[index]}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => inputRef.current?.click()}>{labels.upload}</button>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={(event) => upload(event.target.files)} />
        </div>
      </header>
      <p className="media-library__drop">{labels.drop}</p>
      {progress > 0 && <div className="media-library__progress"><span style={{ width: `${progress}%` }} />{progress}%</div>}
      {error && <p className="media-library__error">{error}</p>}
      <nav>
        <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>{labels.all} <b>{items.length}</b></button>
        {CATEGORIES.map((key, index) => (
          <button type="button" className={filter === key ? 'is-active' : ''} key={key} onClick={() => setFilter(key)}>
            {labels.categories[index]} <b>{items.filter((item) => item.category === key).length}</b>
          </button>
        ))}
      </nav>
      {visible.length ? (
        <div className="media-library__grid">
          {visible.map((item) => (
            <article key={item.libraryId}>
              <img src={imageSource(item)} alt={item.name} loading="lazy" />
              <strong>{item.name}</strong>
              <small>{labels.categories[CATEGORIES.indexOf(item.category)]}</small>
              <div>
                <button type="button" onClick={() => rename(item)}>{labels.rename}</button>
                <button type="button" onClick={() => remove(item)}>{labels.remove}</button>
                <button type="button" disabled={!targetSlot} title={!targetSlot ? labels.chooseSlot : ''} onClick={() => onSelect(item)}>{labels.use}</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="media-library__empty">{labels.empty}</p>
      )}
    </section>
  )
}
