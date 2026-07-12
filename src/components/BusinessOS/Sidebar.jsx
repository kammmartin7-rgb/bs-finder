// Renders Business OS navigation without depending on a routing library.
import { useLanguage } from '../../context/LanguageContext'

const MENU_ITEMS = [
  ['dashboard', 'dashboard', '⌂'],
  ['businesses', 'businesses', '◎'],
  ['ideas-vault', 'ideasVault', '◇'],
  ['projects', 'projects', '▦'],
  ['websites-assets', 'websitesAssets', '◇'],
  ['crm', 'crm', '◫'],
  ['sales', 'sales', '↗'],
  ['tasks', 'tasks', '✓'],
  ['ai-center', 'aiCenter', '✦'],
  ['development', 'developmentNav', '⌘'],
  ['documents', 'documentsNav', '▤'],
  ['users', 'usersPermissions', '♙'],
  ['integrations', 'integrationsNav', '⌁'],
  ['settings', 'settings', '⚙'],
]

export default function Sidebar({ activeScreen, onSelect }) {
  const { t } = useLanguage()
  const activeCategory = ['bs-hunter', 'bs-finder-workspace', 'real-website-builder'].includes(activeScreen) ? 'businesses' : activeScreen === 'bs-funds' ? 'websites-assets' : activeScreen

  return (
    <aside className="business-os__sidebar">
      <div className="business-os__brand"><span>BO</span><div><strong>Business OS</strong><small>Growth workspace</small></div></div>
      <nav aria-label="Business OS">
        {MENU_ITEMS.map(([screen, labelKey, icon]) => (
          <button key={screen} type="button" className={activeCategory === screen ? 'is-active' : ''} onClick={() => onSelect(screen)}>
            <span aria-hidden="true">{icon}</span>{t(labelKey)}
          </button>
        ))}
      </nav>
      <p className="business-os__sidebar-footer">Business OS · BS Finder</p>
    </aside>
  )
}
