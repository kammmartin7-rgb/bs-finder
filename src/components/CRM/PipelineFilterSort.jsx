import { useEffect, useId, useMemo, useRef } from 'react'
import { ALL_BATCHES_FILTER, ALL_LEADS_FILTER } from '../../services/leadCategory'
import {
  ALL_CITIES_FILTER,
  DEFAULT_PIPELINE_FILTERS,
  getPipelineBatchOptions,
  getPipelineCategoryOptions,
  getPipelineCityOptions,
  isPipelineFiltersActive,
  PIPELINE_FILTER_PRESETS,
  PIPELINE_SORT_OPTIONS,
  pipelineHasLeadScores,
} from './pipelineFilterSortUtils'

const PRESET_OPTIONS = [
  { id: PIPELINE_FILTER_PRESETS.ALL, label: 'כל הלידים' },
  { id: PIPELINE_FILTER_PRESETS.NO_WEBSITE, label: 'רק ללא אתר' },
  { id: PIPELINE_FILTER_PRESETS.WITH_WEBSITE, label: 'רק עם אתר' },
  { id: PIPELINE_FILTER_PRESETS.WITH_PHONE, label: 'רק עם מספר טלפון' },
]

const SORT_OPTIONS = [
  { id: PIPELINE_SORT_OPTIONS.SCORE_DESC, label: 'ניקוד: מהגבוה לנמוך', score: true },
  { id: PIPELINE_SORT_OPTIONS.SCORE_ASC, label: 'ניקוד: מהנמוך לגבוה', score: true },
  { id: PIPELINE_SORT_OPTIONS.NEWEST, label: 'החדשים ביותר', score: false },
  { id: PIPELINE_SORT_OPTIONS.OLDEST, label: 'הישנים ביותר', score: false },
  { id: PIPELINE_SORT_OPTIONS.NAME_ASC, label: 'שם העסק א-ת', score: false },
]

export default function PipelineFilterSort({
  leads = [],
  filters = DEFAULT_PIPELINE_FILTERS,
  onChange,
  onReset,
  open = false,
  onOpenChange,
  visibleCount = 0,
  totalCount = 0,
}) {
  const panelId = useId()
  const rootRef = useRef(null)
  const filtersActive = isPipelineFiltersActive(filters)
  const scoreAvailable = useMemo(() => pipelineHasLeadScores(leads), [leads])
  const categoryOptions = useMemo(() => getPipelineCategoryOptions(leads), [leads])
  const cityOptions = useMemo(() => getPipelineCityOptions(leads), [leads])
  const batchOptions = useMemo(() => getPipelineBatchOptions(leads), [leads])

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) onOpenChange?.(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open, onOpenChange])

  function updateFilters(patch) {
    onChange?.({ ...filters, ...patch })
  }

  return (
    <div className="crm-v2__pipeline-toolbar" ref={rootRef}>
      <div className="crm-v2__pipeline-filter-sort">
        <button
          type="button"
          className={`crm-v2__pipeline-filter-toggle${filtersActive ? ' is-active' : ''}${open ? ' is-open' : ''}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpenChange?.(!open)}
        >
          סינון ומיון
          {filtersActive ? <span className="crm-v2__pipeline-filter-indicator" aria-hidden="true" /> : null}
        </button>
        {open ? (
          <div className="crm-v2__pipeline-filter-panel" id={panelId} dir="rtl">
            <section className="crm-v2__pipeline-filter-section">
              <h3>סינון</h3>
              <div className="crm-v2__pipeline-filter-presets">
                {PRESET_OPTIONS.map(({ id, label }) => (
                  <label key={id} className={filters.preset === id ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="pipeline-filter-preset"
                      checked={filters.preset === id}
                      onChange={() => updateFilters({ preset: id })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <label className="crm-v2__pipeline-filter-field">
                <span>קטגוריה</span>
                <select
                  value={filters.category}
                  onChange={(event) => updateFilters({ category: event.target.value })}
                >
                  <option value={ALL_LEADS_FILTER}>כל הקטגוריות</option>
                  {categoryOptions.map(({ id, label, count }) => (
                    <option key={id} value={id}>{label} ({count})</option>
                  ))}
                </select>
              </label>
              <label className="crm-v2__pipeline-filter-field">
                <span>עיר</span>
                <select
                  value={filters.city}
                  onChange={(event) => updateFilters({ city: event.target.value })}
                >
                  <option value={ALL_CITIES_FILTER}>כל הערים</option>
                  {cityOptions.map(({ id, label, count }) => (
                    <option key={id} value={id}>{label} ({count})</option>
                  ))}
                </select>
              </label>
              <label className="crm-v2__pipeline-filter-field">
                <span>ייבוא</span>
                <select
                  value={filters.batch}
                  onChange={(event) => updateFilters({ batch: event.target.value })}
                >
                  <option value={ALL_BATCHES_FILTER}>כל הייבואים</option>
                  {batchOptions.map(({ id, label, count }) => (
                    <option key={id} value={id}>{label} ({count})</option>
                  ))}
                </select>
              </label>
            </section>
            <section className="crm-v2__pipeline-filter-section">
              <h3>מיון</h3>
              {!scoreAvailable ? <p className="crm-v2__pipeline-filter-note">עדיין אין ניקוד ללידים</p> : null}
              <div className="crm-v2__pipeline-filter-sort-options">
                <label className={!filters.sort ? 'is-active' : ''}>
                  <input
                    type="radio"
                    name="pipeline-sort"
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
                        name="pipeline-sort"
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
          </div>
        ) : null}
      </div>
      <span className="crm-v2__pipeline-filter-count">מציג {visibleCount} מתוך {totalCount} לידים</span>
      {filtersActive ? (
        <button type="button" className="crm-v2__pipeline-filter-reset" onClick={onReset}>איפוס</button>
      ) : null}
    </div>
  )
}
