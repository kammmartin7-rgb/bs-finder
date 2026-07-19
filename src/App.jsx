import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { searchLeads as fetchGoogleMapsLeads, mapPlace } from './services/leads'
import { saveLeadsToGoogleSheets } from './services/googleSheets'
import { calculateLeadScore, getLeadScoreClass } from './utils/leadScore'
import './App.css'
import ProposalGenerator from './components/ProposalGenerator'
import WebsiteBuilder from './components/WebsiteBuilder/WebsiteBuilder'
import SalesCenter from './components/SalesCenter/SalesCenter'
import { useLanguage } from './context/LanguageContext'
import LeadCRM from './components/LeadCRM/LeadCRM'
import BusinessOS from './components/BusinessOS/BusinessOS'
import { getDashboardFilterLabelKey, isDemoLead, matchesDashboardFilter } from './components/BusinessOS/dashboardFilters'
import { parseLeadsCsv } from './utils/csvImport'
import ManualLeadForm from './components/ManualLead/ManualLeadForm'
import { loadPersistedLeads, mergePersistedLeads, persistLeadCollection, addPersistedLead, updatePersistedLead, subscribeToLeadPersistenceChanges } from './services/leadPersistence'
import { runLeadCategoryMigrationOnce } from './services/leadCategoryMigration'
import { createIsraeliWhatsAppUrl } from './services/whatsapp'
import { hasLeadAction, LEAD_ACTIONS, recordLeadAction } from './components/LeadCRM/leadActionStorage'
import { getProposalSummary } from './components/proposalStorage'
import ShareableDemo from './components/WebsiteBuilder/ShareableDemo'
import { createDemoOpenUrl, createShareableDemoUrl, parseShareableDemoRoute, saveShareableDemo } from './components/WebsiteBuilder/demoStorage'
function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function displayValue(value) {
  return hasValue(value) ? value : '-'
}

function formatWebsiteUrl(website) {
  if (!hasValue(website)) {
    return null
  }

  return website.startsWith('http') ? website : `https://${website}`
}

function createWhatsAppUrl(lead) {
  const phone = lead.phone?.replace(/\D/g, '')

  if (!phone) {
    return null
  }

  const location = lead.city || lead.address || 'your area'
  const message = `Hi ${lead.businessName}, I came across your business in ${location} and prepared a demo website for you. Would you like me to send you the preview?`

  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
}

function formatRating(rating) {
  if (typeof rating !== 'number') {
    return '-'
  }

  return (
    <span className="rating">
      {rating.toFixed(1)} <span aria-hidden="true">⭐</span>
    </span>
  )
}

function formatLeadScore(score) {
  return (
    <span className={`lead-score ${getLeadScoreClass(score)}`}>{score}</span>
  )
}

const DEMO_PLACES = [
  {
    placeId: 'demo-1',
    title: 'Bright Smile Dental Studio',
    website: 'brightsmiledemo.com',
    phone: '+1 555-0101',
    address: '124 Market Street, Austin, TX',
    totalScore: 4.7,
    reviewsCount: 86,
    url: 'https://maps.google.com/?q=Bright+Smile+Dental+Studio',
  },
  {
    placeId: 'demo-2',
    title: 'Oak & Stone Coffee',
    website: '',
    phone: '+1 555-0102',
    address: '88 Pine Avenue, Denver, CO',
    totalScore: 3.8,
    reviewsCount: 42,
    url: 'https://maps.google.com/?q=Oak+and+Stone+Coffee',
  },
  {
    placeId: 'demo-3',
    title: 'Northside Auto Repair',
    website: 'northsideautorepair.example',
    phone: '+1 555-0103',
    address: '501 Industrial Road, Phoenix, AZ',
    totalScore: 4.3,
    reviewsCount: 127,
    url: 'https://maps.google.com/?q=Northside+Auto+Repair',
  },
  {
    placeId: 'demo-4',
    title: 'Evergreen Family Law',
    website: '',
    phone: '',
    address: '19 Court Plaza, Portland, OR',
    totalScore: 4.9,
    reviewsCount: 18,
    url: 'https://maps.google.com/?q=Evergreen+Family+Law',
  },
  {
    placeId: 'demo-5',
    title: 'Metro Fitness Club',
    website: 'metrofitnessdemo.com',
    phone: '+1 555-0105',
    address: '740 Lakeview Drive, Chicago, IL',
    totalScore: 4.1,
    reviewsCount: 214,
    url: 'https://maps.google.com/?q=Metro+Fitness+Club',
  },
]

function enrichLead(place, index, searchContext = {}) {
  const lead = place.businessName ? place : mapPlace(place, index, searchContext)
  return {
    ...lead,
    leadScore: calculateLeadScore(lead),
  }
}

function downloadCsv(filename, rows) {
  const headers = [
    'Business Name',
    'Website',
    'Phone Number',
    'Full Address',
    'Google Rating',
    'Reviews Count',
    'Lead Score',
    'Google Maps URL',
  ]

  const csvRows = [
    headers,
    ...rows.map((lead) => [
      lead.businessName || '',
      lead.website || '',
      lead.phone || '',
      lead.address || '',
      typeof lead.rating === 'number' ? lead.rating.toFixed(1) : '',
      lead.reviewsCount ?? '',
      lead.leadScore ?? '',
      lead.mapsUrl || '',
    ]),
  ]

  const csvContent = csvRows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const { t, language } = useLanguage()
  const [businessType, setBusinessType] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('Israel')
  const [searchMode, setSearchMode] = useState('paid')
  const [csvText, setCsvText] = useState('')
  const [sourceNotice, setSourceNotice] = useState('')
  const [showManualLeadForm, setShowManualLeadForm] = useState(false)
  const [persistedLeads, setPersistedLeads] = useState(() => loadPersistedLeads())
  const [tableLeads, setTableLeads] = useState(() => loadPersistedLeads())
  const isDemoTableSessionRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [sheetsLoading, setSheetsLoading] = useState(false)
  const [sheetsNotice, setSheetsNotice] = useState('')
  const [sheetsNoticeType, setSheetsNoticeType] = useState('')

  const [searchText, setSearchText] = useState('')
  const [websiteFilter, setWebsiteFilter] = useState('all')
  const [minRating, setMinRating] = useState('0')
  const [sortBy, setSortBy] = useState('leadScore')
  const [dashboardFilter, setDashboardFilter] = useState(null)
const [showProposal, setShowProposal] = useState(false)
const [selectedBusiness, setSelectedBusiness] = useState(null)
const [selectedDemoLead, setSelectedDemoLead] = useState(null)
const [selectedSalesLead, setSelectedSalesLead] = useState(null)
const [selectedRealWebsiteLead, setSelectedRealWebsiteLead] = useState(null)
const [demoLinkNotice, setDemoLinkNotice] = useState('')

  function applyPersistedLeads(nextLeads) {
    isDemoTableSessionRef.current = false
    setPersistedLeads((current) => (current === nextLeads ? current : nextLeads))
    setTableLeads((current) => (current === nextLeads ? current : nextLeads))
  }

  function handleAddLead(lead, notes = '', options = {}) {
    const result = addPersistedLead(persistedLeads, lead, { notes, images: options.images || [] })
    if (!result.ok) return false
    applyPersistedLeads(result.leads)
    return true
  }

  function handleUpdateLead(leadId, leadUpdates, crmUpdates) {
    const result = updatePersistedLead(leadId, leadUpdates, { crm: crmUpdates })
    if (!result.ok) return result
    applyPersistedLeads(result.leads)
    return result
  }

  const refreshLeadsFromStorage = useCallback(() => {
    const nextLeads = loadPersistedLeads()
    setPersistedLeads((current) => (current === nextLeads ? current : nextLeads))
    if (!isDemoTableSessionRef.current) {
      setTableLeads((current) => (current === nextLeads ? current : nextLeads))
    }
  }, [])

  useEffect(() => {
    const migrationResult = runLeadCategoryMigrationOnce()
    refreshLeadsFromStorage()
    if (migrationResult?.migrated > 0) {
      refreshLeadsFromStorage()
    }
  }, [refreshLeadsFromStorage])

  useEffect(() => subscribeToLeadPersistenceChanges(refreshLeadsFromStorage), [refreshLeadsFromStorage])

  function trackRealLeadAction(lead, actionType) {
    if (!isDemoLead(lead)) recordLeadAction(lead, actionType)
  }

  function openDemoPreview(lead) {
    const shareDemo = saveShareableDemo({ ...lead, websiteLanguage: language })
    setDemoLinkNotice('')
    setSelectedDemoLead({ ...lead, ...shareDemo.business, shareDemo })
    return shareDemo
  }

  function handleMissionAction(task) {
    if (task.action === 'proposal') {
      setSelectedBusiness(task.lead)
      setShowProposal(true)
    } else if (task.action === 'demo-site') {
      openDemoPreview(task.lead)
    } else if (task.action === 'sales-pitch') {
      setSelectedSalesLead(task.lead)
    } else if (task.action === 'whatsapp') {
      const whatsappUrl = createWhatsAppUrl(task.lead)
      if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  }

  function handleCrmAction(action, lead) {
    if (action === 'call') {
      if (!lead.phone) return
      const whatsappUrl = createIsraeliWhatsAppUrl(lead.phone)
      if (!whatsappUrl) return
      trackRealLeadAction(lead, LEAD_ACTIONS.WHATSAPP_OPENED)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    } else if (action === 'whatsapp') {
      const whatsappUrl = createWhatsAppUrl(lead)
      if (!whatsappUrl) return
      trackRealLeadAction(lead, LEAD_ACTIONS.WHATSAPP_OPENED)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    } else if (action === 'demo') {
      trackRealLeadAction(lead, LEAD_ACTIONS.DEMO_SITE_OPENED)
      return openDemoPreview(lead)
    } else if (action === 'send-demo') {
      trackRealLeadAction(lead, LEAD_ACTIONS.DEMO_SENT)
    } else if (action === 'proposal') {
      setSelectedBusiness(lead)
      setShowProposal(true)
    } else if (action === 'real-website') {
      setSelectedRealWebsiteLead({ ...lead })
    } else if (action === 'payment') {
      const paymentUrl = String(lead.paymentUrl || '')
      if (/^https?:\/\//i.test(paymentUrl)) window.open(paymentUrl, '_blank', 'noopener,noreferrer')
    }
  }

  function loadDemoLeads() {
    setError('')
    setLoading(false)
    setHasSearched(true)
    setSearchText('')
    setDashboardFilter(null)
    isDemoTableSessionRef.current = true
    setSourceNotice('Loaded demo leads for testing only. Demo leads are not saved and are not mixed with real search results.')
    setTableLeads(DEMO_PLACES.map((place, index) => ({
      ...enrichLead(mapPlace(place, index), index),
      isDemo: true,
    })))
  }

  function openFreeGoogleMapsSearch() {
    setError('')
    setSourceNotice('')
    if (!businessType.trim() || !city.trim() || !country.trim()) {
      setError('Please enter Business Type, City, and Country.')
      return
    }
    const query = `${businessType.trim()} ${city.trim()} ${country.trim()}`.trim()
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer')
    setSourceNotice(`Opened Google Maps for: ${query}. Collect real business details, then paste or import them below.`)
  }

  function importCsv(csv) {
    setError('')
    setSourceNotice('')
    try {
      const importedLeads = parseLeadsCsv(csv).map((lead) => ({ ...lead, leadScore: calculateLeadScore(lead) }))
      const mergedLeads = mergePersistedLeads(loadPersistedLeads(), importedLeads)
      const savedLeads = persistLeadCollection(mergedLeads)
      applyPersistedLeads(savedLeads)
      setHasSearched(true)
      setSearchText('')
      setDashboardFilter(null)
      setSourceNotice(`Imported ${importedLeads.length} real lead${importedLeads.length === 1 ? '' : 's'} from CSV.`)
    } catch (importError) {
      setError(importError.message)
    }
  }

  async function handleCsvFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    importCsv(await file.text())
    event.target.value = ''
  }

  async function handleFindLeads() {
    setError('')
    setSourceNotice('')
    setHasSearched(false)
    setSearchText('')

    if (!businessType.trim() || !city.trim() || !country.trim()) {
      setError('Please enter Business Type, City, and Country.')
      return
    }

    setLoading(true)

    try {
      const results = await fetchGoogleMapsLeads(businessType, city, country)
      const mergedLeads = mergePersistedLeads(loadPersistedLeads(), results)
      const savedLeads = persistLeadCollection(mergedLeads)
      applyPersistedLeads(savedLeads)
      setHasSearched(true)
      setDashboardFilter(null)
      const addedCount = results.length
      setSourceNotice(`Found ${addedCount} real lead${addedCount === 1 ? '' : 's'} for "${businessType.trim()}" in ${city.trim()}, ${country.trim()}. ${savedLeads.length} total saved lead${savedLeads.length === 1 ? '' : 's'}.`)
    } catch (searchError) {
      setError(searchError?.message || 'Google Maps search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveToGoogleSheets() {
    setSheetsNotice('')
    setSheetsNoticeType('')
    setSheetsLoading(true)

    try {
      await saveLeadsToGoogleSheets(persistedLeads)
      setSheetsNotice('Sent to Google Sheets. Check your sheet.')
      setSheetsNoticeType('success')
    } catch (err) {
      setSheetsNotice(
        err.message || 'Something went wrong while saving to Google Sheets.',
      )
      setSheetsNoticeType('error')
    } finally {
      setSheetsLoading(false)
    }
  }

  function handleExportCsv() {
    const safeBusinessType = businessType.trim().replaceAll(' ', '-') || 'leads'
    const safeCity = city.trim().replaceAll(' ', '-') || 'city'
    const exportLeads = filteredLeads.filter((lead) => !isDemoLead(lead))
    downloadCsv(`bs-hunter-${safeBusinessType}-${safeCity}.csv`, exportLeads)
  }

  async function handleCopy(text, label) {
    if (!hasValue(text)) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setSheetsNotice(`${label} copied.`)
      setSheetsNoticeType('success')
    } catch {
      setSheetsNotice(`Could not copy ${label}.`)
      setSheetsNoticeType('error')
    }
  }

  const stats = useMemo(() => {
    const realLeads = persistedLeads.filter((lead) => !isDemoLead(lead))
    const withoutWebsite = realLeads.filter((lead) => !hasValue(lead.website)).length
    const withPhone = realLeads.filter((lead) => hasValue(lead.phone)).length
    const lowRating = realLeads.filter(
      (lead) => typeof lead.rating === 'number' && lead.rating < 4,
    ).length
    const highScore = realLeads.filter((lead) => Number(lead.leadScore) >= 70).length

    return {
      total: realLeads.length,
      withoutWebsite,
      withPhone,
      lowRating,
      highScore,
    }
  }, [persistedLeads])

  const filteredLeads = useMemo(() => {
    const minRatingNumber = Number(minRating)
    const text = searchText.trim().toLowerCase()

    return tableLeads
      .filter((lead) => {
        if (websiteFilter === 'withWebsite' && !hasValue(lead.website)) {
          return false
        }

        if (websiteFilter === 'withoutWebsite' && hasValue(lead.website)) {
          return false
        }

        if (typeof lead.rating === 'number' && lead.rating < minRatingNumber) {
          return false
        }

        if (text) {
          const haystack = [
            lead.businessName,
            lead.website,
            lead.phone,
            lead.address,
            lead.mapsUrl,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (!haystack.includes(text)) {
            return false
          }
        }

        return true
      })
      .filter((lead) => matchesDashboardFilter(lead, dashboardFilter))
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0)
        }

        if (sortBy === 'reviews') {
          return (b.reviewsCount || 0) - (a.reviewsCount || 0)
        }

        if (sortBy === 'name') {
          return String(a.businessName || '').localeCompare(String(b.businessName || ''))
        }

        return (b.leadScore || 0) - (a.leadScore || 0)
      })
  }, [dashboardFilter, tableLeads, minRating, searchText, sortBy, websiteFilter])

  const shareableDemoRoute = parseShareableDemoRoute()
  if (shareableDemoRoute) return <ShareableDemo route={shareableDemoRoute} />
  const selectedDemoShareUrl = selectedDemoLead?.shareDemo ? createShareableDemoUrl(selectedDemoLead.shareDemo) : ''
  const selectedDemoOpenUrl = selectedDemoLead?.shareDemo ? createDemoOpenUrl(selectedDemoLead.shareDemo) : ''

  return (
    <>
    <BusinessOS leads={persistedLeads} realWebsiteLead={selectedRealWebsiteLead} onDashboardFilterChange={setDashboardFilter} onMissionAction={handleMissionAction} onCrmAction={handleCrmAction} onRefreshLeads={refreshLeadsFromStorage} onAddLead={handleAddLead} onUpdateLead={handleUpdateLead}>
      <main className="page">
      <h1>BS Hunter</h1>
      <p className="subtitle">AI Lead Generation</p>

      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          <span>Lead Source</span>
          <select value={searchMode} onChange={(event) => { setSearchMode(event.target.value); setError(''); setSourceNotice('') }}>
            <option value="paid">Paid API</option>
            <option value="free">Free Mode</option>
            <option value="csv">Import CSV</option>
          </select>
        </label>

        {searchMode !== 'csv' && (
          <>
        <label className="field">
          <span>Business Type</span>
          <input
            type="text"
            name="businessType"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            disabled={loading}
          />
        </label>

        <label className="field">
          <span>City</span>
          <input
            type="text"
            name="city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            disabled={loading}
          />
        </label>

        <label className="field">
          <span>Country</span>
          <input
            type="text"
            name="country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            disabled={loading}
          />
        </label>

          </>
        )}

        {searchMode === 'paid' && (
        <button
          type="button"
          className="submit-button"
          onClick={handleFindLeads}
          disabled={loading}
        >
          {loading ? 'Searching...' : t('findLeads')}
        </button>
        )}

        {searchMode === 'free' && (
          <button type="button" className="submit-button" onClick={openFreeGoogleMapsSearch}>
            Open Google Maps Search
          </button>
        )}

        {(searchMode === 'free' || searchMode === 'csv') && (
          <div className="csv-import-panel">
            <p>Import real leads with these columns: business name, website, phone, address, rating, reviews, maps URL.</p>
            <label className="csv-file-button">
              Import CSV File
              <input type="file" accept=".csv,text/csv" onChange={handleCsvFile} />
            </label>
            <textarea
              rows="5"
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              placeholder="Paste CSV data here, including the header row..."
            />
            <button type="button" className="submit-button" disabled={!csvText.trim()} onClick={() => importCsv(csvText)}>
              Import Pasted CSV
            </button>
          </div>
        )}

        <button type="button" className="submit-button" onClick={() => setShowManualLeadForm(true)}>
          {t('addLeadManually')}
        </button>

        <button
          type="button"
          className="submit-button"
          onClick={loadDemoLeads}
          disabled={loading}
        >
          {t('loadDemoLeads')}
        </button>

        {loading && (
          <p className="apify-notice">Searching Google Maps. This may take a minute...</p>
        )}

        {sourceNotice && <p className="source-notice">{sourceNotice}</p>}
        {error && <p className="apify-notice apify-error">{error}</p>}
      </form>

      {hasSearched && !loading && tableLeads.length === 0 && !error && (
        <section className="results">
          <div className="empty-state">
            <h2>No businesses found</h2>
            <p>Try a different business type or city to find more leads.</p>
          </div>
        </section>
      )}

      {tableLeads.length > 0 && (
        <section className="results">
          {dashboardFilter && (
            <div className="dashboard-filter-notice">
              <span>{t('activeDashboardFilter')}: <strong>{t(getDashboardFilterLabelKey(dashboardFilter))}</strong></span>
              <button type="button" className="mini-button" onClick={() => setDashboardFilter(null)}>{t('clearFilter')}</button>
            </div>
          )}
          <div className="results-header">
            <div className="results-title">
              <h2>Lead Results</h2>
              <span className="results-count">
                Showing {filteredLeads.length} of {tableLeads.length} businesses
              </span>
            </div>

<div className="header-actions">
  <button
    type="button"
    className="export-button"
    onClick={handleExportCsv}
    disabled={filteredLeads.length === 0}
  >
    {t('exportCsv')}
  </button>

  <button
    type="button"
    className="export-button"
    onClick={handleSaveToGoogleSheets}
    disabled={sheetsLoading}
  >
    {sheetsLoading && <span className="spinner" aria-hidden="true" />}
    {sheetsLoading ? 'Saving...' : t('saveToGoogleSheets')}
  </button>

</div>
</div>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total Leads</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat-card">
              <span>No Website</span>
              <strong>{stats.withoutWebsite}</strong>
            </div>
            <div className="stat-card">
              <span>With Phone</span>
              <strong>{stats.withPhone}</strong>
            </div>
            <div className="stat-card">
              <span>Rating Under 4</span>
              <strong>{stats.lowRating}</strong>
            </div>
            <div className="stat-card">
              <span>Hot Leads</span>
              <strong>{stats.highScore}</strong>
            </div>
          </div>

          <div className="filters-panel">
            <label className="field">
              <span>Search Results</span>
              <input
                type="text"
                placeholder="Name, phone, website, address..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Website Filter</span>
              <select
                value={websiteFilter}
                onChange={(event) => setWebsiteFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="withoutWebsite">Only without website</option>
                <option value="withWebsite">Only with website</option>
              </select>
            </label>

            <label className="field">
              <span>Minimum Rating</span>
              <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
                <option value="0">Any rating</option>
                <option value="3">3.0+</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </label>

            <label className="field">
              <span>Sort By</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="leadScore">Lead Score</option>
                <option value="rating">Google Rating</option>
                <option value="reviews">Reviews Count</option>
                <option value="name">Business Name</option>
              </select>
            </label>
          </div>

          {sheetsNotice && (
            <p
              className={`sheets-notice ${
                sheetsNoticeType === 'success' ? 'sheets-notice-success' : 'sheets-notice-error'
              }`}
            >
              {sheetsNotice}
            </p>
          )}

          <div className="table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Website</th>
                  <th>Phone Number</th>
                  <th>Full Address</th>
                  <th>Google Rating</th>
                  <th>Reviews Count</th>
                  <th>Lead Score</th>
                  <th>{t('crm')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const websiteUrl = formatWebsiteUrl(lead.website)
                  const whatsappUrl = createWhatsAppUrl(lead)

                  return (
                    <tr key={lead.id} className={isDemoLead(lead) ? 'is-demo-lead' : undefined}>
                      <td className="cell-business" data-label="Business Name">
                        {displayValue(lead.businessName)}
                        {isDemoLead(lead) && <span className="demo-lead-badge">Demo</span>}
                      </td>
                      <td className="cell-website" data-label="Website">
                        {websiteUrl ? (
                          <div className="cell-actions">
                            <a href={websiteUrl} target="_blank" rel="noreferrer">
                              {lead.website}
                            </a>
                            <button
                              type="button"
                              className="mini-button"
                              onClick={() => handleCopy(lead.website, 'Website')}
                            >
                              Copy
                            </button>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td data-label="Phone Number">
                        {hasValue(lead.phone) ? (
                          <div className="cell-actions">
                            <span>{lead.phone}</span>
                            <button
                              type="button"
                              className="mini-button"
                              onClick={() => handleCopy(lead.phone, 'Phone')}
                            >
                              Copy
                            </button>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="cell-address" data-label="Full Address">
                        {displayValue(lead.address)}
                      </td>
                      <td data-label="Google Rating">{formatRating(lead.rating)}</td>
                      <td data-label="Reviews Count">
                        {displayValue(lead.reviewsCount)}
                      </td>
                      <td data-label="Lead Score">{formatLeadScore(lead.leadScore)}</td>
                      <td data-label={t('crm')}><LeadCRM lead={lead} /></td>
<td data-label="Actions">
  <div className="lead-action-grid">
    <button
      type="button"
      className="mini-button"
      onClick={() => {
        setSelectedBusiness(lead)
        setShowProposal(true)
      }}
    >
      📄 {t('proposal')}{(hasLeadAction(lead, LEAD_ACTIONS.PROPOSAL_SENT) || getProposalSummary(lead).exists) && !isDemoLead(lead) ? ' ✓' : ''}
    </button>

    <button
      type="button"
      className="mini-button"
      onClick={() => {
        trackRealLeadAction(lead, LEAD_ACTIONS.DEMO_SITE_OPENED)
        openDemoPreview(lead)
      }}
    >
      {t('demoSite')}{hasLeadAction(lead, LEAD_ACTIONS.DEMO_SITE_OPENED) && !isDemoLead(lead) ? ' ✓' : ''}
    </button>

    <button
      type="button"
      className="mini-button"
      onClick={() => {
        trackRealLeadAction(lead, LEAD_ACTIONS.SALES_PITCH_OPENED)
        setSelectedSalesLead(lead)
      }}
    >
      {t('salesPitch')}{hasLeadAction(lead, LEAD_ACTIONS.SALES_PITCH_OPENED) && !isDemoLead(lead) ? ' ✓' : ''}
    </button>

    <button
      type="button"
      className="mini-button"
      disabled={!whatsappUrl}
      onClick={() => {
        trackRealLeadAction(lead, LEAD_ACTIONS.WHATSAPP_OPENED)
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      }}
    >
      {t('whatsapp')}{hasLeadAction(lead, LEAD_ACTIONS.WHATSAPP_OPENED) && !isDemoLead(lead) ? ' ✓' : ''}
    </button>
    <button type="button" className="mini-button lead-action-grid__wide" onClick={() => setSelectedRealWebsiteLead({ ...lead })}>
      {t('buildRealWebsite')}
    </button>
  </div>
</td>                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showManualLeadForm && (
        <ManualLeadForm
          existingLeads={persistedLeads}
          useLegacyManualStore={false}
          onClose={() => setShowManualLeadForm(false)}
          onSave={(lead, notes) => {
            const result = addPersistedLead(persistedLeads, lead, { notes })
            if (!result.ok) return
            applyPersistedLeads(result.leads)
            setHasSearched(true)
            setDashboardFilter(null)
            setSourceNotice(t('manualLeadSaved'))
            setShowManualLeadForm(false)
          }}
        />
      )}

      </main>
    </BusinessOS>

    {showProposal && selectedBusiness && (
      <ProposalGenerator
        business={selectedBusiness}
        onClose={() => setShowProposal(false)}
      />
    )}

    {selectedDemoLead && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Demo site for ${selectedDemoLead.businessName}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          overflowY: 'auto',
          background: '#ffffff',
        }}
      >
        <div className="demo-share-toolbar">
          <button type="button" className="mini-button" onClick={async () => { try { await navigator.clipboard.writeText(selectedDemoShareUrl); setDemoLinkNotice('Demo link copied.') } catch { setDemoLinkNotice('Could not copy. Open the demo and copy the browser URL.') } }}>Copy Demo Link</button>
          <button type="button" className="mini-button" onClick={() => window.open(selectedDemoOpenUrl, '_blank', 'noopener,noreferrer')}>Open Demo</button>
          <button type="button" className="mini-button" onClick={() => setSelectedDemoLead(null)}>{t('close')}</button>
          {demoLinkNotice && <span>{demoLinkNotice}</span>}
        </div>
        <WebsiteBuilder business={selectedDemoLead} />
      </div>
    )}

    {selectedSalesLead && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Sales pitch for ${selectedSalesLead.businessName}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          overflowY: 'auto',
          background: '#ffffff',
        }}
      >
        <button
          type="button"
          className="mini-button"
          onClick={() => setSelectedSalesLead(null)}
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 10001 }}
        >
          {t('close')}
        </button>
        <SalesCenter lead={selectedSalesLead} />
      </div>
    )}
    </>
  )
}

export default App
