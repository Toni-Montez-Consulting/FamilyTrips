import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

// Catches unexpected render errors anywhere in the routed tree so a thrown error
// (e.g. a missing trip context) shows a friendly fallback instead of a white screen.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[error-boundary] a page failed to render:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-sm space-y-3 rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-slate-600">
            This page hit an unexpected error. Your saved trip data is safe.
          </p>
          <a
            href="/"
            className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to trips
          </a>
        </div>
      </div>
    )
  }
}
