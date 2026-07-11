import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import ProductionErrorBoundary from './components/ProductionErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProductionErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ProductionErrorBoundary>
  </StrictMode>,
)
