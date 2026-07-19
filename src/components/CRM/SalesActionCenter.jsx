// Sales Action Center: category tabs + actionable lead queue (read-only filtering).
import { forwardRef, memo } from 'react'
import { createIsraeliWhatsAppUrl } from '../../services/whatsapp'
import { SALES_ACTION_CATEGORY_ORDER } from './salesTrackingSelectors'

const VISIBLE_LIMIT = 5

function phoneTelHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits ? `tel:+${digits.startsWith('972') ? digits : `972${digits.replace(/^0/, '')}`}` : ''
}

const ActionLeadRow = memo(function ActionLeadRow({ view, copy, onEditLead, onAction }) {
  const whatsappUrl = createIsraeliWhatsAppUrl(view.phone)
  const telHref = phoneTelHref(view.phone)

  return (
    <article className="crm-v2__action-item" data-testid="sales-action-item">
      <div className="crm-v2__action-main">
        <strong>{view.businessName || copy.unknown}</strong>
        <span className="crm-v2__action-phone">{view.phone || copy.unknown}</span>
        <div className="crm-v2__action-meta">
          <span className="crm-v2__action-status">{view.salesStatusLabel}</span>
          {view.nextActionText ? <span><b>{copy.nextAction}</b> {view.nextActionText}</span> : null}
          {view.nextActionDateLabel ? <span><b>{copy.nextActionDate}</b> {view.nextActionDateLabel}</span> : null}
        </div>
      </div>
      <div className="crm-v2__action-buttons">
        <button
          type="button"
          disabled={!telHref}
          onClick={() => {
            if (telHref) window.location.href = telHref
            onAction?.('call', view.lead)
          }}
        >
          {copy.call}
        </button>
        <button
          type="button"
          disabled={!whatsappUrl}
          onClick={() => {
            if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
            onAction?.('whatsapp', view.lead)
          }}
        >
          {copy.whatsapp}
        </button>
        <button type="button" onClick={() => onEditLead?.(view)}>
          {copy.editLead}
        </button>
      </div>
    </article>
  )
})

const SalesActionCenter = forwardRef(function SalesActionCenter({
  categories = {},
  counts = {},
  activeCategory = '',
  onCategoryChange,
  copy = {},
  emptyReason = '',
  onEditLead,
  onAction,
}, ref) {
  const activeViews = categories[activeCategory] || []
  const visibleViews = activeViews.slice(0, VISIBLE_LIMIT)
  const totalCount = counts[activeCategory] || 0

  return (
    <section className="crm-v2__action-center" dir="rtl" ref={ref} data-testid="sales-action-center">
      <header className="crm-v2__action-header">
        <div>
          <span>01</span>
          <h2>{copy.title}</h2>
          <p>{copy.hint}</p>
        </div>
        <strong>{totalCount}</strong>
      </header>

      <nav className="crm-v2__action-nav" aria-label={copy.title}>
        {SALES_ACTION_CATEGORY_ORDER.map((key) => (
          <button
            type="button"
            key={key}
            className={activeCategory === key ? 'is-active' : ''}
            onClick={() => onCategoryChange?.(key)}
          >
            {copy.categories?.[key]} <b>{counts[key] || 0}</b>
          </button>
        ))}
      </nav>

      <div className="crm-v2__action-list">
        {visibleViews.length ? visibleViews.map((view) => (
          <ActionLeadRow
            key={view.leadId}
            view={view}
            copy={copy}
            onEditLead={onEditLead}
            onAction={onAction}
          />
        )) : (
          <p className="crm-v2__empty">{emptyReason || copy.empty}</p>
        )}
      </div>

      {totalCount > VISIBLE_LIMIT ? (
        <p className="crm-v2__action-more">
          {copy.showing.replace('{shown}', String(VISIBLE_LIMIT)).replace('{total}', String(totalCount))}
        </p>
      ) : null}
    </section>
  )
})

export default SalesActionCenter
