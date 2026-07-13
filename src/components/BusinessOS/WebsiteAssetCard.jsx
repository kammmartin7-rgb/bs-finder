// Shared Websites & Assets card for every registered website asset.
import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { checkProductionUrlReachable, copyAssetUrl, repositoryLabel } from './websiteAssets'

function openExternal(url) {
  if (!/^https?:\/\//i.test(String(url || ''))) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function WebsiteAssetCard({ asset, onOpenScreen }) {
  const { t } = useLanguage()
  const [productionReachable, setProductionReachable] = useState(false)

  useEffect(() => {
    let active = true
    checkProductionUrlReachable(asset.productionUrl).then((reachable) => {
      if (active) setProductionReachable(reachable)
    })
    return () => { active = false }
  }, [asset.productionUrl])

  function openWebsite() {
    if (asset.screen && onOpenScreen) {
      onOpenScreen(asset.screen)
      return
    }
    openExternal(asset.productionUrl)
  }

  return (
    <article className="navigation-card is-website-asset">
      <span className="navigation-card__icon">{asset.icon}</span>
      <div>
        <div className="website-asset-card__meta">
          {productionReachable && <span className="website-asset-card__badge">{t('assetProductionBadge')}</span>}
        </div>
        <h2>{asset.name}</h2>
        <dl>
          <div><dt>{t('assetStatus')}</dt><dd>{t(asset.statusKey)}</dd></div>
          <div className="is-wide"><dt>{t('assetProductionUrl')}</dt><dd title={asset.productionUrl}>{asset.productionUrl}</dd></div>
          <div className="is-wide"><dt>{t('assetRepository')}</dt><dd title={asset.repositoryUrl}>{repositoryLabel(asset.repositoryUrl)}</dd></div>
        </dl>
        <div className="website-asset-card__actions">
          <button type="button" onClick={openWebsite}>{t('openWebsite')}</button>
          <button type="button" className="is-secondary" onClick={() => openExternal(asset.repositoryUrl)}>{t('openRepository')}</button>
          <button type="button" className="is-secondary" onClick={() => copyAssetUrl(asset.productionUrl)}>{t('copyWebsiteUrl')}</button>
          <button type="button" className="is-secondary" onClick={() => copyAssetUrl(asset.repositoryUrl)}>{t('copyRepositoryUrl')}</button>
        </div>
      </div>
    </article>
  )
}
