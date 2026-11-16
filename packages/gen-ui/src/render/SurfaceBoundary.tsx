import { Component, type ReactNode } from 'react';
import { SurfaceForm } from './SurfaceForm';

/**
 * Agent output is untrusted: a View that throws on it blanks its own surface, not the chat. Every
 * format wraps each surface in one, so it also holds the surface's form.
 */
export class SurfaceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : <SurfaceForm>{this.props.children}</SurfaceForm>;
  }
}
