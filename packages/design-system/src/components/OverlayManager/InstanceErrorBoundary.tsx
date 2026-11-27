import { Component, type ReactNode } from 'react';

interface InstanceErrorBoundaryProps {
  children: ReactNode;
  /** Rendered in place of the children after an error; nothing by default. */
  fallback?: ReactNode;
  onError: (error: unknown) => void;
}

interface InstanceErrorBoundaryState {
  failed: boolean;
}

/**
 * Keeps a render error inside one overlay instance, or inside a split overlay's body. A class,
 * because React has no hook for error boundaries; React Compiler skips classes.
 */
export class InstanceErrorBoundary extends Component<
  InstanceErrorBoundaryProps,
  InstanceErrorBoundaryState
> {
  state: InstanceErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): InstanceErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
