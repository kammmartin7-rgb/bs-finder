// Last-resort production boundary that prevents unexpected render failures from showing a blank page.
import { Component } from 'react'
import './ProductionErrorBoundary.css'

export default class ProductionErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="production-error" role="alert">
          <div>
            <span>Business OS</span>
            <h1>Something went wrong</h1>
            <p>The application could not finish loading. Your locally saved data has not been deleted.</p>
            <button type="button" onClick={() => window.location.reload()}>Reload application</button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
