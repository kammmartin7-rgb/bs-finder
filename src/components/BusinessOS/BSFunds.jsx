// Placeholder BS Funds module ready for future financial lead data integration.
import { useLanguage } from '../../context/LanguageContext'

export default function BSFunds() {
  const { t } = useLanguage()
  const cards = [
    ['bsFundsNewLeads', '0'],
    ['bsFundsContacted', '0'],
    ['bsFundsApplications', '0'],
    ['bsFundsApproved', '0'],
    ['bsFundsClosedDeals', '0'],
    ['bsFundsRevenue', '$0'],
  ]

  return (
    <section className="business-os__funds">
      <header><span>GrowthPilot OS</span><h1>GrowthPilot Funds</h1><p>{t('bsFundsSubtitle')}</p></header>
      <div className="business-os__funds-grid">
        {cards.map(([labelKey, value]) => <article key={labelKey}><strong>{value}</strong><p>{t(labelKey)}</p></article>)}
      </div>
      <div className="business-os__funds-placeholder"><span aria-hidden="true">↗</span><p>{t('bsFundsIntegrationPlaceholder')}</p></div>
    </section>
  )
}
