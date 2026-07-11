// Always-visible language control backed by the global language context.
import { useLanguage } from '../../context/LanguageContext'
import { supportedLanguages } from '../../i18n/translations'
import './LanguageSwitcher.css'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <label className="language-switcher">
      <span>{t('language')}</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value)}>
        {Object.entries(supportedLanguages).map(([code, option]) => (
          <option key={code} value={code}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}
