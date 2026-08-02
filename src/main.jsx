import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import ProductionErrorBoundary from './components/ProductionErrorBoundary'
import { findRecoveredPlumberLead, verifyLeadPersistence } from './services/leadPersistence'
import { AuthProvider } from './context/AuthContext'
import AuthGate from './components/AuthGate'
import ShareableDemo from './components/WebsiteBuilder/ShareableDemo'
import { parseShareableDemoRoute } from './components/WebsiteBuilder/demoStorage'

if (import.meta.env.DEV) {
  window.__bsHunterVerifyLeadPersistence = verifyLeadPersistence
  window.__bsHunterFindPlumberLead = findRecoveredPlumberLead
}

const publicDemoRoute = parseShareableDemoRoute()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProductionErrorBoundary>
      {publicDemoRoute
        ? <LanguageProvider><ShareableDemo route={publicDemoRoute} /></LanguageProvider>
        : <AuthProvider><LanguageProvider><AuthGate><App /></AuthGate></LanguageProvider></AuthProvider>}
    </ProductionErrorBoundary>
  </StrictMode>,
)
