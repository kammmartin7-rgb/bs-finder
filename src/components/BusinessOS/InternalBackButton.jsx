// Shared Business OS back control; screen history remains owned by BusinessOS.
import { useLanguage } from '../../context/LanguageContext'

const LABELS = { en: 'Back', he: 'חזרה', ar: 'رجوع', ru: 'Назад' }

export default function InternalBackButton({ onBack }) {
  const { language } = useLanguage()
  const label = LABELS[language] || LABELS.en
  return <button type="button" className="business-os__back" onClick={onBack} aria-label={label}><span aria-hidden="true">‹</span>{label}</button>
}
