import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null, componentStack: '' }

  static getDerivedStateFromError() {
    return { error: new Error('A component failed to render.') }
  }

  componentDidCatch(error, info) {
    this.setState({ error, componentStack: info.componentStack || '' })
    console.error('Application render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="page-container error-boundary">
          <p className="eyebrow">CivicConnect</p>
          <h1>Something went wrong</h1>
          <p className="muted">The application encountered an unexpected error.</p>
          {import.meta.env.DEV && <details>
            <summary>Development error details</summary>
            <pre className="error-details">{this.state.error.message}{this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}{this.state.componentStack ? `\n\nComponent stack:${this.state.componentStack}` : ''}</pre>
          </details>}
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload Application</button>
        </main>
      )
    }
    return this.props.children
  }
}
