'use client';

import { Component, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-sm space-y-4">
          <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-400">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Something went wrong</h2>
            <p className="max-w-md text-sm leading-6 text-zinc-400">
              We encountered an unexpected error. Try again or return to the dashboard to keep moving.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-emerald-500/90"
            >
              Try again
            </button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
