import { Component, type ReactNode } from 'react';

interface InstanceErrorBoundaryProps {
  children: ReactNode;
  onError: (error: unknown) => void;
}

interface InstanceErrorBoundaryState {
  failed: boolean;
}

/**
 * Keeps a render error inside one overlay instance. A class, because React has no hook for
 * error boundaries; React Compiler skips classes.
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
    return this.state.failed ? null : this.props.children;
  }
}
