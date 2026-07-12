/* oxlint-disable react/only-export-components */
// Owns global language selection, persistence, translation lookup, and page direction.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LANGUAGE, supportedLanguages, translations } from '../i18n/translations'

const STORAGE_KEY = 'bs-hunter-language'
const LanguageContext = createContext(null)

function getInitialLanguage() {
  try {
    const settingsLanguage = JSON.parse(window.localStorage.getItem('business-os-settings-v1'))?.language
    if (supportedLanguages[settingsLanguage]) return settingsLanguage
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY)
    return supportedLanguages[savedLanguage] ? savedLanguage : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)
  const direction = supportedLanguages[language].direction

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // The selected language still works for this session when storage is unavailable.
    }
    document.documentElement.lang = language
    document.documentElement.dir = direction
  }, [direction, language])

  const value = useMemo(() => ({
    language,
    direction,
    setLanguage,
    t: (key) => translations[language][key] || translations[DEFAULT_LANGUAGE][key] || key,
  }), [direction, language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}

export default LanguageContext
