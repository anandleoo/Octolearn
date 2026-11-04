import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorPage } from './ErrorPage';

interface Props {
  children: ReactNode;
}

/**
 * Catches unexpected crashes anywhere below it and shows a friendly screen instead of a blank app.
 * The real error is intentionally NOT shown to the user (stack traces can reveal internals).
 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <ErrorPage onRetry={() => this.setState({ failed: false })} />;
  }
}
