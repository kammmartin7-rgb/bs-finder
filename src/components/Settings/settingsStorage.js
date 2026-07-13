// Stable local persistence for owner-controlled Business OS interface preferences.
export const SETTINGS_STORAGE_KEY = 'business-os-settings-v1'
export const DEFAULT_SETTINGS = { language: 'en', theme: 'light', defaultScreen: 'dashboard', compactMode: false }
export const DEFAULT_SCREEN_OPTIONS = ['dashboard', 'businesses', 'tasks', 'finance', 'documents', 'ai-center', 'settings']

export function normalizeSettings(value = {}) {
  return {
    language: ['en', 'he', 'ar', 'ru'].includes(value.language) ? value.language : DEFAULT_SETTINGS.language,
    theme: value.theme === 'dark' ? 'dark' : DEFAULT_SETTINGS.theme,
    defaultScreen: DEFAULT_SCREEN_OPTIONS.includes(value.defaultScreen) ? value.defaultScreen : DEFAULT_SETTINGS.defaultScreen,
    compactMode: value.compactMode === true,
  }
}
export function loadSettings() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY))
    if (stored) return normalizeSettings(stored)
    const legacyTheme = window.localStorage.getItem('business-os-theme')
    const legacyLanguage = window.localStorage.getItem('bs-hunter-language')
    return normalizeSettings({ theme: legacyTheme, language: legacyLanguage })
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  const normalized = normalizeSettings(settings)
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function resetSettings() {
  window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
  return saveSettings(DEFAULT_SETTINGS)
}
