// Provides the persistent Business OS shell and internal screen navigation.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'
import DashboardHome from './DashboardHome'
import Sidebar from './Sidebar'
import './BusinessOS.css'
import TasksModule from './TasksModule'
import AICenter from '../AICenter/AICenter'
import RealWebsiteBuilder from '../RealWebsiteBuilder/RealWebsiteBuilder'
import IdeasVault from '../IdeasVault/IdeasVault'
import Settings from '../Settings/Settings'
import CRM from '../CRM/CRM'
import Projects from '../Projects/Projects'
import { loadSettings, resetSettings, saveSettings } from '../Settings/settingsStorage'
import { DASHBOARD_FILTERS } from './dashboardFilters'
import { AssetsHub, BSFinderWorkspace, BSFundsWorkspace, BusinessesHub, DevelopmentConsole, DocumentsHub, FinanceHub } from './NavigationHub'
import InternalBackButton from './InternalBackButton'

const PLACEHOLDER_KEYS = { users: 'usersPlaceholder', integrations: 'integrationsPlaceholder' }

export default function BusinessOS({ leads = [], realWebsiteLead, onDashboardFilterChange, onCrmAction, onRefreshLeads, onAddLead, onUpdateLead, children }) {
  const [settings, setSettings] = useState(loadSettings)
  const [activeScreen, setActiveScreen] = useState(() => loadSettings().defaultScreen)
  const [crmNavigation, setCrmNavigation] = useState(null)
  const [tasksNavigation, setTasksNavigation] = useState(null)
  const screenHistory = useRef([])
  const { language, setLanguage, t } = useLanguage()
  const theme = settings.theme
  const salesPipelineNavigation = useMemo(() => ({ section: 'pipeline' }), [])

  useEffect(() => {
    if (!realWebsiteLead) return
    setActiveScreen((current) => {
      if (current !== 'real-website-builder') screenHistory.current.push(current)
      return 'real-website-builder'
    })
  }, [realWebsiteLead])
  useEffect(() => { try { window.localStorage.setItem('business-os-theme', theme) } catch { /* Theme still works for this session. */ } }, [theme])
  useEffect(() => { if (settings.language !== language) setSettings((current) => saveSettings({ ...current, language })) }, [language, settings.language])
  useEffect(() => {
    onRefreshLeads?.()
  }, [activeScreen, onRefreshLeads])

  function changeSetting(field, value) {
    const next = saveSettings({ ...settings, [field]: value })
    setSettings(next)
    if (field === 'language') setLanguage(next.language)
  }

  function resetAllSettings() {
    const next = resetSettings()
    setSettings(next)
    setLanguage(next.language)
    screenHistory.current = []
    setActiveScreen(next.defaultScreen)
  }

  function navigateTo(screen) {
    if (!screen) return
    let nextScreen = screen
    if (nextScreen === 'sales') nextScreen = 'crm'

    if (nextScreen === 'crm-customers') {
      setCrmNavigation({ filter: DASHBOARD_FILTERS.WON_DEALS, section: 'pipeline' })
      nextScreen = 'crm'
    } else if (nextScreen === 'crm') {
      setCrmNavigation(salesPipelineNavigation)
    } else if (!['crm', 'sales'].includes(screen)) {
      setCrmNavigation(null)
    }

    if (nextScreen === activeScreen) return
    screenHistory.current.push(activeScreen)
    setActiveScreen(nextScreen)
  }

  function navigateBack() {
    const previous = screenHistory.current.pop()
    setActiveScreen(previous || 'dashboard')
  }

  function handleDashboardNavigate(action) {
    if (!action?.type) return

    if (action.type === 'crm') {
      setCrmNavigation(action)
      setTasksNavigation(null)
      if (activeScreen !== 'crm') {
        screenHistory.current.push(activeScreen)
        setActiveScreen('crm')
      }
      return
    }

    if (action.type === 'tasks') {
      setTasksNavigation(action)
      setCrmNavigation(null)
      navigateTo('tasks')
      return
    }

    if (action.type === 'leads') {
      setCrmNavigation(null)
      setTasksNavigation(null)
      onDashboardFilterChange(action.filter || null)
      navigateTo('bs-hunter')
      return
    }

    if (action.type === 'screen') {
      setCrmNavigation(null)
      setTasksNavigation(null)
      navigateTo(action.screen)
    }
  }

  function renderScreen() {
    if (activeScreen === 'dashboard') {
      return <DashboardHome leads={leads} theme={theme} onToggleTheme={() => changeSetting('theme', theme === 'dark' ? 'light' : 'dark')} onOpenScreen={navigateTo} onNavigate={handleDashboardNavigate} />
    }
    if (activeScreen === 'documents') return <DocumentsHub />
    if (activeScreen === 'development') return <DevelopmentConsole />
    if (activeScreen === 'finance') return <FinanceHub leads={leads} onOpenScreen={navigateTo} onNavigate={handleDashboardNavigate} />
    if (activeScreen === 'bs-hunter') return children
    if (activeScreen === 'businesses') return <BusinessesHub leads={leads} onOpenScreen={navigateTo} />
    if (activeScreen === 'bs-finder-workspace') return <BSFinderWorkspace onOpenScreen={navigateTo} />
    if (activeScreen === 'bs-finder-projects') return <Projects onOpenScreen={navigateTo} />
    if (activeScreen === 'websites-assets') return <AssetsHub onOpenScreen={navigateTo} />
    if (activeScreen === 'projects') return <Projects onOpenScreen={navigateTo} />
    if (activeScreen === 'ai-center') return <AICenter />
    if (activeScreen === 'real-website-builder') return <RealWebsiteBuilder initialLead={realWebsiteLead} />
    if (activeScreen === 'bs-funds') return <BSFundsWorkspace onOpenScreen={navigateTo} />
    if (activeScreen === 'tasks') return <TasksModule navigation={tasksNavigation} onNavigationApplied={() => setTasksNavigation(null)} />
    if (activeScreen === 'ideas-vault') return <IdeasVault />
    if (activeScreen === 'crm') {
      return <CRM leads={leads} onAction={onCrmAction} onAddLead={onAddLead} onUpdateLead={onUpdateLead} onRefreshLeads={onRefreshLeads} navigation={crmNavigation || salesPipelineNavigation} onNavigationApplied={() => setCrmNavigation(null)} />
    }
    if (activeScreen === 'settings') return <Settings settings={settings} onChange={changeSetting} onReset={resetAllSettings} onOpenScreen={navigateTo} />

    return (
      <section className="business-os__placeholder">
        <span>Business OS</span><h1>{t(activeScreen)}</h1><p>{t(PLACEHOLDER_KEYS[activeScreen])}</p>
      </section>
    )
  }

  return (
    <div className="business-os" data-theme={theme} data-compact={settings.compactMode ? 'true' : 'false'}>
      <Sidebar activeScreen={activeScreen} onSelect={navigateTo} />
      <div className="business-os__main">
        <header className="business-os__topbar">
          {activeScreen !== 'dashboard' && <InternalBackButton onBack={navigateBack} />}
          <LanguageSwitcher />
        </header>
        {renderScreen()}
      </div>
    </div>
  )
}
