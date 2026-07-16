// Category landing pages keep businesses, assets, and operational tools out of the global sidebar.
import { useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { getCrmLeadViews, getCrmRevenueSummary } from '../CRM/crmSelectors'
import { getLeadDashboardData, isDemoLead } from './dashboardFilters'
import { commandDocuments, developmentFacts, ecosystemProjects } from './commandCenterData'
import WebsiteAssetCard from './WebsiteAssetCard'
import { WEBSITE_ASSETS } from './websiteAssets'

const BUSINESS_TOOLS = [
  ['bsFinderOverview', 'bsFinderOverviewDescription', 'bs-finder-projects', '⌂'],
  ['leadSources', 'leadDiscoveryDescription', 'bs-hunter', '◎'],
  ['crmSalesPipeline', 'crmSalesPipelineDescription', 'crm', '◫'],
  ['proposalGenerator', 'proposalWorkspaceDescription', 'bs-hunter', '▤'],
  ['demoWebsiteBuilder', 'demoBuilderWorkspaceDescription', 'bs-hunter', '◇'],
  ['realWebsiteBuilder', 'realBuilderWorkspaceDescription', 'real-website-builder', '▰'],
  ['mediaLibrary', 'mediaLibraryDescription', 'real-website-builder', '▦'],
  ['customers', 'customersDescription', 'crm-customers', '◌'],
]

function HubHeader({ eyebrow, title, description, onBack }) {
  const { t } = useLanguage()
  return <header className="navigation-hub__header">{onBack && <button type="button" onClick={onBack}>← {t('backToBusinesses')}</button>}<span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>
}

const BS_FINDER_ASSET = WEBSITE_ASSETS.find((asset) => asset.id === 'bs-finder')
const BS_FUNDS_ASSET = WEBSITE_ASSETS.find((asset) => asset.id === 'bs-funds')
const PLUMBER_DEMO_ASSET = WEBSITE_ASSETS.find((asset) => asset.id === 'plumber-demo')
const KIDNEY_CAMPAIGN_ASSET = {
  id: 'kidney-help-campaign',
  name: 'התרמה להשתלת כליה',
  icon: '❤️',
  typeKey: 'assetTypeWebsite',
  statusKey: 'assetStatusActive',
  productionUrl: 'https://kidney-help-campaign.kammmartin7.chatgpt.site',
  repositoryUrl: '',
}
const BS_FUNDS_PROJECT = ecosystemProjects.find((project) => project.id === 'bs-funds')

export function BusinessesHub({ leads, onOpenScreen }) {
  const { t } = useLanguage()
  const realLeads = leads.filter((lead) => !isDemoLead(lead))
  const activity = realLeads.map(getLeadDashboardData)
  const metrics = [[t('leads'), realLeads.length], [t('demoSites'), activity.filter((item) => item.hasDemoSite).length], [t('proposals'), activity.filter((item) => item.hasProposal).length], [t('sales'), activity.filter((item) => ['deal-won', 'paid', 'website-in-progress', 'completed'].includes(item.crm.status)).length]]
  return (
    <section className="navigation-hub">
      <HubHeader eyebrow="Business OS" title={t('businesses')} description={t('businessesDescription')} />
      <div className="navigation-hub__grid is-business-list">
        <button type="button" className="navigation-card is-featured business-card" onClick={() => onOpenScreen('bs-finder-workspace')}>
          <span className="navigation-card__icon">◎</span>
          <div>
            <small>{t('revenueGeneratingBusiness')}</small>
            <h2>BS Finder</h2>
            <p>{t('bsFinderDescription')}</p>
            <dl>
              <div><dt>{t('technicalName')}</dt><dd>BS Hunter</dd></div>
              <div><dt>{t('workspaceStatus')}</dt><dd>{t('activePartial')}</dd></div>
              <div><dt>{t('currentBusinessTask')}</dt><dd>{t('protectSourceTask')}</dd></div>
            </dl>
            <div className="business-card__metrics">{metrics.map(([label, value]) => <span key={label}><b>{value}</b>{label}</span>)}</div>
            <strong>{t('openBusiness')} →</strong>
          </div>
        </button>
        <button type="button" className="navigation-card" onClick={() => onOpenScreen('bs-funds')}>
          <span className="navigation-card__icon">{BS_FUNDS_ASSET?.icon || '◈'}</span>
          <div>
            <small>{t('bsFundsShortcut')}</small>
            <h2>{t('bsFunds')}</h2>
            <p>{t('bsFundsSubtitle')}</p>
            <strong>{t('openBusiness')} →</strong>
          </div>
        </button>
        {PLUMBER_DEMO_ASSET && <WebsiteAssetCard asset={PLUMBER_DEMO_ASSET} onOpenScreen={onOpenScreen} />}
        <WebsiteAssetCard asset={KIDNEY_CAMPAIGN_ASSET} onOpenScreen={onOpenScreen} />
      </div>
    </section>
  )
}

export function BSFinderWorkspace({ onOpenScreen }) {
  const { t } = useLanguage()
  return (
    <section className="navigation-hub">
      <HubHeader eyebrow={t('primaryRevenueBusiness')} title="BS Finder" description={t('bsFinderWorkspaceDescription')} onBack={() => onOpenScreen('businesses')} />
      <div className="navigation-hub__status"><span>{t('technicalName')}</span><strong>BS Hunter / bs-hunter</strong><span>{t('workspaceStatus')}</span><strong>{t('activePartial')}</strong></div>
      <div className="navigation-hub__grid">{BUSINESS_TOOLS.map(([title, description, screen, icon]) => <button type="button" className="navigation-card" key={title} onClick={() => onOpenScreen(screen)}><span className="navigation-card__icon">{icon}</span><div><h2>{t(title)}</h2><p>{t(description)}</p><strong>{t('openModule')} →</strong></div></button>)}</div>
      {BS_FINDER_ASSET && <div className="navigation-hub__grid is-website-assets"><WebsiteAssetCard asset={BS_FINDER_ASSET} onOpenScreen={onOpenScreen} /></div>}
    </section>
  )
}

export function BSFundsWorkspace({ onOpenScreen }) {
  const { t } = useLanguage()
  return (
    <section className="navigation-hub">
      <HubHeader eyebrow="Business OS" title={t('bsFunds')} description={t('bsFundsSubtitle')} onBack={() => onOpenScreen('businesses')} />
      {BS_FUNDS_ASSET && <div className="navigation-hub__grid is-website-assets"><WebsiteAssetCard asset={BS_FUNDS_ASSET} onOpenScreen={onOpenScreen} /></div>}
      {BS_FUNDS_PROJECT && <article className="navigation-card is-featured business-card"><div><small>{t('projects')}</small><h2>{BS_FUNDS_PROJECT.name}</h2><p>{BS_FUNDS_PROJECT.purpose}</p><dl><div><dt>{t('taskStatus')}</dt><dd>{BS_FUNDS_PROJECT.status}</dd></div><div><dt>{t('currentTask')}</dt><dd>{BS_FUNDS_PROJECT.currentTask}</dd></div></dl></div></article>}
    </section>
  )
}

export function AssetsHub({ onOpenScreen }) {
  const { t } = useLanguage()
  return (
    <section className="navigation-hub">
      <HubHeader eyebrow="Business OS" title={t('websitesAssets')} description={t('websitesAssetsDescription')} />
      <div className="navigation-hub__grid is-website-assets">
        {WEBSITE_ASSETS.map((asset) => <WebsiteAssetCard key={asset.id} asset={asset} onOpenScreen={onOpenScreen} />)}
      </div>
    </section>
  )
}

export function FinanceHub({ leads = [], onOpenScreen, onNavigate }) {
  const { t } = useLanguage()
  const revenue = useMemo(() => getCrmRevenueSummary(getCrmLeadViews(leads.filter((lead) => !isDemoLead(lead)))), [leads])
  const cards = [
    [t('financeOpenProposals'), revenue.openProposals],
    [t('financeProposalValue'), `₪${revenue.proposalValue.toLocaleString()}`],
    [t('financeWonDeals'), revenue.wonDeals],
    [t('financePaidRevenue'), `₪${revenue.paidRevenue.toLocaleString()}`],
    [t('financeAwaitingPayment'), revenue.awaitingPayment],
  ]
  return (
    <section className="navigation-hub">
      <HubHeader eyebrow="Business OS" title={t('finance')} description={t('financeDescription')} />
      <div className="navigation-hub__grid">{cards.map(([label, value]) => <article className="navigation-card" key={label}><div><span>{label}</span><strong>{value}</strong></div></article>)}</div>
      <div className="navigation-hub__grid">
        <button type="button" className="navigation-card" onClick={() => onNavigate?.({ type: 'crm', section: 'revenue' })}><span className="navigation-card__icon">◫</span><div><h2>{t('crmSalesPipeline')}</h2><p>{t('financeCrmLinkDescription')}</p><strong>{t('openModule')} →</strong></div></button>
        <button type="button" className="navigation-card" onClick={() => onOpenScreen('bs-funds')}><span className="navigation-card__icon">◈</span><div><h2>{t('bsFunds')}</h2><p>{t('financeBsFundsLinkDescription')}</p><strong>{t('openModule')} →</strong></div></button>
      </div>
    </section>
  )
}

export function DocumentsHub() {
  const { t } = useLanguage()
  const [selectedDocument, setSelectedDocument] = useState(commandDocuments[0])
  return (
    <section className="navigation-hub">
      <HubHeader eyebrow="Business OS" title={t('documentsNav')} description={t('documentsDescription')} />
      <div className="command-panel document-center">
        <div className="document-list">{commandDocuments.map((document) => <button type="button" key={document[0]} className={selectedDocument[0] === document[0] ? 'is-active' : ''} onClick={() => setSelectedDocument(document)}><strong>{document[0]}</strong><span>{document[2]}</span></button>)}</div>
        <article><strong>{selectedDocument[0]}</strong><p>{selectedDocument[1]}</p><span>{t('exists')} · {selectedDocument[2]}</span></article>
      </div>
    </section>
  )
}

export function DevelopmentConsole() {
  const { t } = useLanguage()
  return (
    <section className="navigation-hub">
      <HubHeader eyebrow="Business OS" title={t('developmentNav')} description={t('developmentConsoleDescription')} />
      <section className="command-panel development-console"><dl>{developmentFacts.map(([label, value, state]) => <div key={label}><dt>{label}</dt><dd className={`is-${state}`}>{value}</dd></div>)}</dl></section>
    </section>
  )
}
