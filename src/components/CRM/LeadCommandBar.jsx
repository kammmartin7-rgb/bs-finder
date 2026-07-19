import { useEffect, useId, useMemo, useRef } from 'react'
import { ALL_BATCHES_FILTER, ALL_LEADS_FILTER } from '../../services/leadCategory'
import {
  ALL_CITIES_FILTER,
  DEFAULT_PIPELINE_FILTERS,
  getLeadCommandKpis,
  getPipelineBatchOptions,
  getPipelineCategoryOptions,
  getPipelineCityOptions,
  isPipelineFiltersActive,
  PIPELINE_FILTER_PRESETS,
  PIPELINE_SORT_OPTIONS,
  pipelineHasLeadScores,
} from './pipelineFilterSortUtils'

const FILTER_OPTIONS = [
  { id: PIPELINE_FILTER_PRESETS.ALL, label: 'כל הלידים' },
  { id: PIPELINE_FILTER_PRESETS.NO_WEBSITE, label: 'ללא אתר' },
  { id: PIPELINE_FILTER_PRESETS.WITH_WEBSITE, label: 'עם אתר' },
  { id: PIPELINE_FILTER_PRESETS.SCORE_90, label: 'ניקוד 90+' },
  { id: PIPELINE_FILTER_PRESETS.SCORE_80, label: 'ניקוד 80+' },
  { id: PIPELINE_FILTER_PRESETS.NEW_LEADS, label: 'לידים חדשים' },
  { id: PIPELINE_FILTER_PRESETS.NEEDS_FOLLOWUP, label: 'דורש מעקב' },
  { id: PIPELINE_FILTER_PRESETS.DEMO_SENT, label: 'הדמו נשלח' },
  { id: PIPELINE_FILTER_PRESETS.PROPOSAL_SENT, label: 'הצעת מחיר נשלחה' },
  { id: PIPELINE_FILTER_PRESETS.WON, label: 'נסגרה עסקה' },
  { id: PIPELINE_FILTER_PRESETS.LOST, label: 'אבוד' },
]

const SORT_OPTIONS = [
  { id: PIPELINE_SORT_OPTIONS.SCORE_DESC, label: 'ניקוד גבוה', score: true },
  { id: PIPELINE_SORT_OPTIONS.SCORE_ASC, label: 'ניקוד נמוך', score: true },
  { id: PIPELINE_SORT_OPTIONS.NEWEST, label: 'החדשים ביותר', score: false },
  { id: PIPELINE_SORT_OPTIONS.OLDEST, label: 'הישנים ביותר', score: false },
  { id: PIPELINE_SORT_OPTIONS.CITY_ASC, label: 'עיר', score: false },
  { id: PIPELINE_SORT_OPTIONS.CATEGORY_ASC, label: 'קטגוריה', score: false },
  { id: PIPELINE_SORT_OPTIONS.SALES_STATUS, label: 'סטטוס מכירות', score: false },
]

const KPI_CARDS = [
  { key: 'total', label: 'סה״כ לידים', preset: PIPELINE_FILTER_PRESETS.ALL },
  { key: 'noWebsite', label: 'ללא אתר', preset: PIPELINE_FILTER_PRESETS.NO_WEBSITE },
  { key: 'followUpToday', label: 'מעקב להיום', preset: PIPELINE_FILTER_PRESETS.NEEDS_FOLLOWUP },
  { key: 'score90', label: 'ניקוד 90+', preset: PIPELINE_FILTER_PRESETS.SCORE_90 },
  { key: 'demoSent', label: 'הדמו נשלח', preset: PIPELINE_FILTER_PRESETS.DEMO_SENT },
  { key: 'proposalSent', label: 'הצעה נשלחה', preset: PIPELINE_FILTER_PRESETS.PROPOSAL_SENT },
]

function CommandMenu({ label, open, onToggle, active, panelId, children }) {
  return (
    <div className="lead-command-bar__menu">
      <button
        type="button"
        className={`lead-command-bar__menu-toggle${active ? ' is-active' : ''}${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {label}
        <span aria-hidden="true"> ▼</span>
        {active ? <span className="lead-command-bar__indicator" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div className="lead-command-bar__panel" id={panelId} dir="rtl">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default function LeadCommandBar({
  views = [],
  leads = [],
  filters = DEFAULT_PIPELINE_FILTERS,
  onChange,
  onReset,
  openMenu = null,
  onOpenMenuChange,
  visibleCount = 0,
  totalCount = 0,
  onImportGoogleMaps,
  onAddLeadManually,
  importGoogleMapsLabel = 'ייבוא מגוגל מפות',
  addLeadManuallyLabel = 'הוספת ליד ידנית',
}) {
  const rootRef = useRef(null)
  const filterPanelId = useId()
  const sortPanelId = useId()
  const actionsPanelId = useId()
  const filtersActive = isPipelineFiltersActive(filters)
  const scoreAvailable = useMemo(() => pipelineHasLeadScores(leads), [leads])
  const categoryOptions = useMemo(() => getPipelineCategoryOptions(leads), [leads])
  const cityOptions = useMemo(() => getPipelineCityOptions(leads), [leads])
  const batchOptions = useMemo(() => getPipelineBatchOptions(leads), [leads])
  const kpis = useMemo(() => getLeadCommandKpis(views), [views])

  useEffect(() => {
    if (!openMenu) return undefined

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) onOpenMenuChange?.(null)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [openMenu, onOpenMenuChange])

  function updateFilters(patch) {
    onChange?.({ ...filters, ...patch })
  }

  function applyKpiFilter(preset) {
    updateFilters({ preset })
  }

  return (
    <div className="lead-command-bar-wrap" ref={rootRef}>
      <div className="lead-command-bar" dir="ltr">
        <label className="lead-command-bar__search">
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            value={filters.search || ''}
            placeholder="חיפוש לפי שם / עיר / טלפון"
            aria-label="חיפוש לידים"
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
        </label>

        <div className="lead-command-bar__menus">
          <CommandMenu
            label="סינון"
            open={openMenu === 'filter'}
            onToggle={() => onOpenMenuChange?.(openMenu === 'filter' ? null : 'filter')}
            active={filters.preset !== PIPELINE_FILTER_PRESETS.ALL || filters.category !== ALL_LEADS_FILTER || filters.city !== ALL_CITIES_FILTER || filters.batch !== ALL_BATCHES_FILTER}
            panelId={filterPanelId}
          >
            <section className="lead-command-bar__section">
              <div className="lead-command-bar__options">
                {FILTER_OPTIONS.map(({ id, label }) => (
                  <label key={id} className={filters.preset === id ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="lead-command-filter"
                      checked={filters.preset === id}
                      onChange={() => updateFilters({ preset: id })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </section>
            <section className="lead-command-bar__section">
              <h3>סינון מתקדם</h3>
              <label className="lead-command-bar__field">
                <span>קטגוריה</span>
                <select value={filters.category} onChange={(event) => updateFilters({ category: event.target.value })}>
                  <option value={ALL_LEADS_FILTER}>כל הקטגוריות</option>
                  {categoryOptions.map(({ id, label, count }) => (
                    <option key={id} value={id}>{label} ({count})</option>
                  ))}
                </select>
              </label>
              <label className="lead-command-bar__field">
                <span>עיר</span>
                <select value={filters.city} onChange={(event) => updateFilters({ city: event.target.value })}>
                  <option value={ALL_CITIES_FILTER}>כל הערים</option>
                  {cityOptions.map(({ id, label, count }) => (
                    <option key={id} value={id}>{label} ({count})</option>
                  ))}
                </select>
              </label>
              <label className="lead-command-bar__field">
                <span>ייבוא</span>
                <select value={filters.batch} onChange={(event) => updateFilters({ batch: event.target.value })}>
                  <option value={ALL_BATCHES_FILTER}>כל הייבואים</option>
                  {batchOptions.map(({ id, label, count }) => (
                    <option key={id} value={id}>{label} ({count})</option>
                  ))}
                </select>
              </label>
              <label className="lead-command-bar__field lead-command-bar__field--checkbox">
                <input
                  type="checkbox"
                  checked={filters.preset === PIPELINE_FILTER_PRESETS.WITH_PHONE}
                  onChange={(event) => updateFilters({
                    preset: event.target.checked ? PIPELINE_FILTER_PRESETS.WITH_PHONE : PIPELINE_FILTER_PRESETS.ALL,
                  })}
                />
                <span>רק עם מספר טלפון</span>
              </label>
            </section>
            {filtersActive ? (
              <button type="button" className="lead-command-bar__reset" onClick={onReset}>איפוס סינון</button>
            ) : null}
          </CommandMenu>

          <CommandMenu
            label="מיון"
            open={openMenu === 'sort'}
            onToggle={() => onOpenMenuChange?.(openMenu === 'sort' ? null : 'sort')}
            active={Boolean(filters.sort)}
            panelId={sortPanelId}
          >
            <section className="lead-command-bar__section">
              {!scoreAvailable ? <p className="lead-command-bar__note">עדיין אין ניקוד ללידים</p> : null}
              <div className="lead-command-bar__options">
                <label className={!filters.sort ? 'is-active' : ''}>
                  <input
                    type="radio"
                    name="lead-command-sort"
                    checked={!filters.sort}
                    onChange={() => updateFilters({ sort: '' })}
                  />
                  <span>ברירת מחדל</span>
                </label>
                {SORT_OPTIONS.map(({ id, label, score }) => {
                  const disabled = score && !scoreAvailable
                  return (
                    <label key={id} className={filters.sort === id ? 'is-active' : ''}>
                      <input
                        type="radio"
                        name="lead-command-sort"
                        checked={filters.sort === id}
                        disabled={disabled}
                        onChange={() => updateFilters({ sort: id })}
                      />
                      <span>{label}</span>
                    </label>
                  )
                })}
              </div>
            </section>
          </CommandMenu>

          <CommandMenu
            label="פעולות"
            open={openMenu === 'actions'}
            onToggle={() => onOpenMenuChange?.(openMenu === 'actions' ? null : 'actions')}
            active={false}
            panelId={actionsPanelId}
          >
            <section className="lead-command-bar__section lead-command-bar__actions">
              <button type="button" onClick={() => { onOpenMenuChange?.(null); onImportGoogleMaps?.() }}>
                {importGoogleMapsLabel}
              </button>
              <button type="button" onClick={() => { onOpenMenuChange?.(null); onAddLeadManually?.() }}>
                {addLeadManuallyLabel}
              </button>
            </section>
          </CommandMenu>
        </div>

        <span className="lead-command-bar__count">מציג {visibleCount} מתוך {totalCount}</span>
      </div>

      <div className="lead-command-kpis" dir="rtl">
        {KPI_CARDS.map(({ key, label, preset }) => (
          <button
            key={key}
            type="button"
            className={`lead-command-kpis__card${filters.preset === preset ? ' is-active' : ''}`}
            onClick={() => applyKpiFilter(preset)}
          >
            <span>{label}</span>
            <strong>{kpis[key]}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
