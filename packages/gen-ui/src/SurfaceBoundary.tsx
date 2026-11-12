import { Component, type ReactNode } from 'react';

/** Agent output is untrusted: a View that throws on it blanks its own surface, not the chat. */
export class SurfaceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
