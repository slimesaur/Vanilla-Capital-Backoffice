'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallbackMessage?: string;
};

type State = { error: Error | null };

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error('Unknown error');
  }
}

/**
 * Catches React render errors so one failure does not leave a silent white screen.
 */
export default class ClientRenderErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    const e = toError(error);
    console.error('[ClientRenderErrorBoundary]', e.message, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center bg-secondary-50">
          <p className="font-avenir text-secondary-700 mb-6 max-w-md mx-auto">
            {this.props.fallbackMessage ??
              'This section could not be displayed. You can try again or refresh the page.'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="pressable inline-flex px-6 py-3 text-sm font-medium bg-accent-500 hover:bg-accent-400 text-white rounded-none transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
