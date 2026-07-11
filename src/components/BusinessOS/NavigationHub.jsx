// Category landing pages keep businesses, assets, and operational tools out of the global sidebar.
import { useLanguage } from '../../context/LanguageContext'
import { getLeadDashboardData, isDemoLead } from './dashboardFilters'

const BUSINESS_TOOLS = [
  ['leadDiscovery', 'leadDiscoveryDescription', 'bs-hunter', '◎'],
  ['crm', 'leadCrmDescription', 'crm', '◫'],
  ['sales', 'salesWorkspaceDescription', 'bs-hunter', '↗'],
  ['proposalGenerator', 'proposalWorkspaceDescription', 'bs-hunter', '▤'],
  ['demoWebsiteBuilder', 'demoBuilderWorkspaceDescription', 'bs-hunter', '◇'],
  ['realWebsiteBuilder', 'realBuilderWorkspaceDescription', 'real-website-builder', '▰'],
]

const ASSETS = [
  ['bsFunds', 'bsFundsAssetDescription', 'bs-funds', '◈', true],
  ['demoWebsitesAsset', 'demoWebsitesAssetDescription', 'bs-hunter', '◇', true],
  ['customerWebsitesAsset', 'customerWebsitesAssetDescription', 'real-website-builder', '▰', true],
  ['templatesAsset', 'templatesAssetDescription', null, '▦', false],
  ['landingPagesAsset', 'landingPagesAssetDescription', null, '▱', false],
  ['archivedWebsitesAsset', 'archivedWebsitesAssetDescription', null, '▥', false],
]

function HubHeader({ eyebrow, title, description, onBack }) {
  const { t } = useLanguage()
  return <header className="navigation-hub__header">{onBack && <button type="button" onClick={onBack}>← {t('backToBusinesses')}</button>}<span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>
}

export function BusinessesHub({ leads, onOpenScreen }) {
  const { t } = useLanguage()
  const realLeads = leads.filter((lead) => !isDemoLead(lead))
  const activity = realLeads.map(getLeadDashboardData)
  const metrics = [[t('leads'), realLeads.length], [t('demoSites'), activity.filter((item) => item.hasDemoSite).length], [t('proposals'), activity.filter((item) => item.hasProposal).length], [t('sales'), activity.filter((item) => item.crm.status === 'won').length]]
  return <section className="navigation-hub"><HubHeader eyebrow="Business OS" title={t('businesses')} description={t('businessesDescription')} /><div className="navigation-hub__grid is-business-list"><button type="button" className="navigation-card is-featured business-card" onClick={() => onOpenScreen('bs-finder-workspace')}><span className="navigation-card__icon">◎</span><div><small>{t('revenueGeneratingBusiness')}</small><h2>BS Finder</h2><p>{t('bsFinderDescription')}</p><dl><div><dt>{t('technicalName')}</dt><dd>BS Hunter</dd></div><div><dt>{t('workspaceStatus')}</dt><dd>{t('activePartial')}</dd></div><div><dt>{t('currentBusinessTask')}</dt><dd>{t('protectSourceTask')}</dd></div></dl><div className="business-card__metrics">{metrics.map(([label, value]) => <span key={label}><b>{value}</b>{label}</span>)}</div><strong>{t('openBusiness')} →</strong></div></button></div></section>
}

export function BSFinderWorkspace({ onOpenScreen }) {
  const { t } = useLanguage()
  return <section className="navigation-hub"><HubHeader eyebrow={t('primaryRevenueBusiness')} title="BS Finder" description={t('bsFinderWorkspaceDescription')} onBack={() => onOpenScreen('businesses')} /><div className="navigation-hub__status"><span>{t('technicalName')}</span><strong>BS Hunter / bs-hunter</strong><span>{t('workspaceStatus')}</span><strong>{t('activePartial')}</strong></div><div className="navigation-hub__grid">{BUSINESS_TOOLS.map(([title, description, screen, icon]) => <button type="button" className="navigation-card" key={title} onClick={() => onOpenScreen(screen)}><span className="navigation-card__icon">{icon}</span><div><h2>{t(title)}</h2><p>{t(description)}</p><strong>{t('openModule')} →</strong></div></button>)}</div></section>
}

export function AssetsHub({ onOpenScreen }) {
  const { t } = useLanguage()
  return <section className="navigation-hub"><HubHeader eyebrow="Business OS" title={t('websitesAssets')} description={t('websitesAssetsDescription')} /><div className="navigation-hub__grid">{ASSETS.map(([title, description, screen, icon, available]) => <button type="button" className="navigation-card" key={title} disabled={!available} onClick={() => screen && onOpenScreen(screen)}><span className="navigation-card__icon">{icon}</span><div><small>{available ? t('available') : t('planned')}</small><h2>{t(title)}</h2><p>{t(description)}</p>{available && <strong>{t('openAsset')} →</strong>}</div></button>)}</div></section>
}
