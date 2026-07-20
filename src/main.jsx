import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import ProductionErrorBoundary from './components/ProductionErrorBoundary'
import { findRecoveredPlumberLead, verifyLeadPersistence } from './services/leadPersistence'
import { AuthProvider } from './context/AuthContext'
import AuthGate from './components/AuthGate'

if (import.meta.env.DEV) {
  window.__bsHunterVerifyLeadPersistence = verifyLeadPersistence
  window.__bsHunterFindPlumberLead = findRecoveredPlumberLead
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProductionErrorBoundary>
      <AuthProvider><LanguageProvider><AuthGate><App /></AuthGate></LanguageProvider></AuthProvider>
    </ProductionErrorBoundary>
  </StrictMode>,
)
