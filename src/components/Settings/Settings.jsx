// Owner settings UI; all state and existing language/theme behavior remain owned by BusinessOS.
import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { DEFAULT_SCREEN_OPTIONS } from './settingsStorage'
import './Settings.css'

const SCREEN_LABELS = { dashboard: 'dashboard', businesses: 'businesses', tasks: 'tasks', finance: 'finance', documents: 'documentsNav', 'ai-center': 'aiCenter', settings: 'settings' }

export default function Settings({ settings, onChange, onReset, onOpenScreen }) {
  const { t } = useLanguage()
  const [notice, setNotice] = useState('')

  function change(field, value) { onChange(field, value); setNotice(t('settingsSaved')) }
  function reset() { if (!window.confirm(t('settingsResetConfirm'))) return; onReset(); setNotice(t('settingsResetSuccess')) }

  return <section className="settings-page">
    <header><span>Business OS</span><h1>{t('settings')}</h1><p>{t('settingsSubtitle')}</p></header>
    <div className="settings-card">
      <label><span>{t('settingsLanguage')}</span><small>{t('settingsLanguageHelp')}</small><select value={settings.language} onChange={(event) => change('language', event.target.value)}><option value="en">English</option><option value="he">עברית</option><option value="ar">العربية</option><option value="ru">Русский</option></select></label>
      <fieldset><legend>{t('settingsAppearance')}</legend><p>{t('settingsThemeHelp')}</p><div className="settings-segmented"><button type="button" className={settings.theme === 'light' ? 'is-active' : ''} onClick={() => change('theme', 'light')}>☀ {t('settingsLight')}</button><button type="button" className={settings.theme === 'dark' ? 'is-active' : ''} onClick={() => change('theme', 'dark')}>◐ {t('settingsDark')}</button></div></fieldset>
      <label><span>{t('settingsDefaultScreen')}</span><small>{t('settingsDefaultScreenHelp')}</small><select value={settings.defaultScreen} onChange={(event) => change('defaultScreen', event.target.value)}>{DEFAULT_SCREEN_OPTIONS.map((screen) => <option key={screen} value={screen}>{t(SCREEN_LABELS[screen])}</option>)}</select></label>
      <label className="settings-toggle"><span><b>{t('settingsCompact')}</b><small>{t('settingsCompactHelp')}</small></span><input type="checkbox" checked={settings.compactMode} onChange={(event) => change('compactMode', event.target.checked)} /></label>
      {onOpenScreen && <button type="button" className="settings-dev-link" onClick={() => onOpenScreen('development')}>{t('openDevelopmentConsole')}</button>}
    </div>
    <footer><button type="button" onClick={reset}>{t('settingsReset')}</button>{notice && <p role="status">✓ {notice}</p>}</footer>
  </section>
}
