import { Component, type ErrorInfo, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────
// ErrorBoundary — root cause of the "black screen on sidebar click" was
// uncaught render errors with no boundary to catch them. When a page
// component (FounderPage, etc.) threw during render, React unmounted the
// entire tree and the user saw nothing but the dark `bg-background` void.
//
// This boundary:
//   1. Catches render-time exceptions in its subtree.
//   2. Shows a calm, branded fallback UI (NEVER a black void) with a
//      "Try again" + "Return home" affordance so the user is never stranded.
//   3. Resets automatically when the parent passes a new `resetKey` prop
//      (e.g. the wouter `location`), so simply navigating away from the
//      broken page clears the error state.
//   4. Logs the captured error to console so /api/marcus and /api/briefing
//      diagnostics still capture the stack via the browser console feed.
// ─────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional human label for diagnostic logs ("route", "MarcusOrb", etc.) */
  scope?: string;
  /** When this prop changes, the boundary resets (e.g. pass `location`). */
  resetKey?: unknown;
  /** Custom fallback. If omitted, the default branded fallback is used. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Render NOTHING on error (used to silently isolate floating widgets). */
  silent?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error so it shows up in browser logs / Sentry-style
    // collectors. Never swallow silently.
    // eslint-disable-next-line no-console
    console.error(
      `[ErrorBoundary${this.props.scope ? ":" + this.props.scope : ""}]`,
      error,
      info?.componentStack,
    );
  }

  componentDidUpdate(prev: ErrorBoundaryProps): void {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.silent) return null;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-8 text-center shadow-[0_0_40px_rgba(234,179,8,0.06)]">
          <div className="mx-auto mb-5 w-12 h-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
            !
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Terminal interruption
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            This panel hit an unexpected error and was caught by the Orakzai
            Bond safety boundary. The rest of the terminal is unaffected — you
            can retry this view or return to the homepage.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.reset}
              className="px-4 py-2 rounded-xl bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors text-sm font-medium"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-xl bg-muted/40 text-foreground border border-border hover:border-primary/30 transition-colors text-sm font-medium"
            >
              Return home
            </a>
          </div>
          {(import.meta as any)?.env?.DEV && (
            <pre className="mt-6 text-[10px] text-left text-muted-foreground/70 bg-black/40 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
              {String(error?.stack || error?.message || error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
