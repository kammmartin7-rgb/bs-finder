// Renders Business OS navigation without depending on a routing library.
import { useLanguage } from '../../context/LanguageContext'
import logoCircle from '../../assets/brand/growthpilot-logo-circle.png'
import { useAuth } from '../../context/AuthContext'

const MENU_ITEMS = [
  ['dashboard', 'dashboard', '⌂'],
  ['businesses', 'businesses', '◎'],
  ['sales', 'sales', '◫'],
  ['finance', 'finance', '₪'],
  ['tasks', 'tasks', '✓'],
  ['ai-center', 'aiCenter', '✦'],
  ['documents', 'documentsNav', '▤'],
  ['users', 'usersPermissions', '♙'],
  ['integrations', 'integrationsNav', '⌁'],
  ['settings', 'settings', '⚙'],
]

const BUSINESS_SCREENS = new Set([
  'bs-hunter',
  'bs-finder-workspace',
  'bs-finder-projects',
  'real-website-builder',
  'bs-funds',
  'websites-assets',
  'projects',
  'ideas-vault',
])

function sidebarCategory(activeScreen) {
  if (activeScreen === 'crm' || activeScreen === 'sales') return 'sales'
  if (BUSINESS_SCREENS.has(activeScreen)) return 'businesses'
  return activeScreen
}

export default function Sidebar({ activeScreen, onSelect }) {
  const { t } = useLanguage()
  const { canAccess, signOut } = useAuth()
  const activeCategory = sidebarCategory(activeScreen)

  return (
    <aside className="business-os__sidebar">
      <div className="business-os__brand"><img src={logoCircle} alt="GrowthPilot" /><div><strong>GrowthPilot OS</strong><small>AI Growth Platform</small></div></div>
      <nav aria-label="Business OS">
        {MENU_ITEMS.filter(([screen]) => canAccess('screen', screen)).map(([screen, labelKey, icon]) => (
          <button key={screen} type="button" className={activeCategory === screen ? 'is-active' : ''} onClick={() => onSelect(screen)}>
            <span aria-hidden="true">{icon}</span>{t(labelKey)}
          </button>
        ))}
      </nav>
      <p className="business-os__sidebar-footer">GrowthPilot OS</p><button type="button" className="business-os__logout" onClick={signOut}>Log out</button>
    </aside>
  )
}
