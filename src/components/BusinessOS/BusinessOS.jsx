// Provides the persistent Business OS shell and internal screen navigation.
import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import DashboardHome from './DashboardHome'
import Sidebar from './Sidebar'
import './BusinessOS.css'
import BSFunds from './BSFunds'
import TasksModule from './TasksModule'
import Projects from '../Projects/Projects'
import AICenter from '../AICenter/AICenter'
import RealWebsiteBuilder from '../RealWebsiteBuilder/RealWebsiteBuilder'
import { AssetsHub, BSFinderWorkspace, BusinessesHub } from './NavigationHub'

const PLACEHOLDER_KEYS = { crm: 'crmPlaceholder', sales: 'salesModulePlaceholder', users: 'usersPlaceholder', integrations: 'integrationsPlaceholder', settings: 'settingsPlaceholder' }

export default function BusinessOS({ leads = [], realWebsiteLead, onDashboardFilterChange, children }) {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [theme, setTheme] = useState(() => {
    try { return window.localStorage.getItem('business-os-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
  })
  const { t } = useLanguage()

  useEffect(() => { if (realWebsiteLead) setActiveScreen('real-website-builder') }, [realWebsiteLead])
  useEffect(() => { try { window.localStorage.setItem('business-os-theme', theme) } catch { /* Theme still works for this session. */ } }, [theme])

  function renderScreen() {
    if (['dashboard', 'development', 'documents'].includes(activeScreen)) {
      return <DashboardHome leads={leads} theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} onOpenScreen={setActiveScreen} onSelectFilter={(filter) => { onDashboardFilterChange(filter); setActiveScreen('bs-hunter') }} />
    }
    if (activeScreen === 'bs-hunter') return children
    if (activeScreen === 'businesses') return <BusinessesHub leads={leads} onOpenScreen={setActiveScreen} />
    if (activeScreen === 'bs-finder-workspace') return <BSFinderWorkspace onOpenScreen={setActiveScreen} />
    if (activeScreen === 'websites-assets') return <AssetsHub onOpenScreen={setActiveScreen} />
    if (activeScreen === 'projects') return <Projects onOpenScreen={setActiveScreen} />
    if (activeScreen === 'ai-center') return <AICenter />
    if (activeScreen === 'real-website-builder') return <RealWebsiteBuilder initialLead={realWebsiteLead} />
    if (activeScreen === 'bs-funds') return <BSFunds />
    if (activeScreen === 'tasks') return <TasksModule />

    return (
      <section className="business-os__placeholder">
        <span>Business OS</span><h1>{t(activeScreen)}</h1><p>{t(PLACEHOLDER_KEYS[activeScreen])}</p>
      </section>
    )
  }

  return (
    <div className="business-os" data-theme={theme}>
      <LanguageSwitcher />
      <Sidebar activeScreen={activeScreen} onSelect={setActiveScreen} />
      <div className="business-os__main">{renderScreen()}</div>
    </div>
  )
}
