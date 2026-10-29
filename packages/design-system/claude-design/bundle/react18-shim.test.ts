import type { Ref } from 'react';
import { afterEach, describe, expect, it } from '@rstest/core';
import { createReact18Window } from '../harness/react18';
import { createJsxRuntime, createReactModule } from './react18-shim';

const windows: ReturnType<typeof createReact18Window>[] = [];
function setup() {
  const env = createReact18Window();
  windows.push(env);
  return { ...env, ...createJsxRuntime(env.React) };
}
afterEach(() => {
  for (const env of windows.splice(0)) env.dom.window.close();
});

describe('React 18 JSX compatibility', () => {
  it('maps context objects to providers and preserves keys', () => {
    const { React, jsx } = setup();
    const ctx = React.createContext(0);
    const element = jsx(ctx, { value: 1 }, 'row');
    expect(element.type).toBe(ctx.Provider);
    expect(element.key).toBe('row');
  });
  it('keeps original type when no ref, including null refs', () => {
    const { jsx } = setup();
    const Text = () => null;
    expect(jsx(Text, {}).type).toBe(Text);
    expect(jsx(Text, { ref: null }).type).toBe(Text);
  });
  it('caches wrappers and forwards function component refs to the DOM', () => {
    const { React, ReactDOM, window, jsx } = setup();
    const Input = ({ ref }: { ref?: Ref<HTMLInputElement> }) =>
      React.createElement('input', { ref });
    const ref = React.createRef<HTMLInputElement>();
    const first = jsx(Input, { ref });
    expect(first.type).toBe(jsx(Input, { ref: React.createRef() }).type);
    const root = ReactDOM.createRoot(window.document.getElementById('app')!);
    ReactDOM.flushSync(() => root.render(first));
    expect(ref.current).toBeInstanceOf(window.HTMLInputElement);
    ReactDOM.flushSync(() => root.unmount());
  });
  it('leaves class, forwardRef, and memo component types intact', () => {
    const { React, jsx } = setup();
    class Class extends React.Component {
      render() {
        return null;
      }
    }
    for (const type of [Class, React.forwardRef(() => null), React.memo(() => null)]) {
      expect(jsx(type, { ref: React.createRef() }).type).toBe(type);
    }
  });
  it('forwards refs added by cloneElement without mutating page React', () => {
    const { React, ReactDOM, window, jsx } = setup();
    const originalClone = React.cloneElement;
    const Button = ({ ref }: { ref?: Ref<HTMLButtonElement> }) =>
      React.createElement('button', { ref }, 'Save');
    const ref = React.createRef<HTMLButtonElement>();
    const module = createReactModule(React);
    const element = module.cloneElement(jsx(Button, {}), { ref });
    const root = ReactDOM.createRoot(window.document.getElementById('app')!);
    ReactDOM.flushSync(() => root.render(element));
    expect(ref.current).toBeInstanceOf(window.HTMLButtonElement);
    expect(React.cloneElement).toBe(originalClone);
    ReactDOM.flushSync(() => root.unmount());
  });
  it('normalizes inert only for host elements', () => {
    const { jsx } = setup();
    expect(jsx('div', { inert: true }).props).toEqual({ inert: '' });
    expect(jsx('div', { inert: false }).props).toEqual({});
    const Component = () => null;
    expect(jsx(Component, { inert: true }).props).toEqual({ inert: true });
  });
});
