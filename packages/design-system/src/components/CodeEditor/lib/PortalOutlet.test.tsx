import { createContext, useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it } from '@rstest/core';
import { act, cleanup, render, screen } from '@testing-library/react';
import { PortalOutlet } from './PortalOutlet';
import { createPortalRegistry, type PortalRegistry } from './portalRegistry';

const LabelContext = createContext('none');
const ContextLabel = () => <span data-testid='context-label'>{useContext(LabelContext)}</span>;

describe('PortalOutlet', () => {
  let registry: PortalRegistry;
  let host: HTMLElement;

  beforeEach(() => {
    registry = createPortalRegistry();
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    cleanup();
    host.remove();
  });

  it('renders registered nodes into their detached hosts', () => {
    render(<PortalOutlet registry={registry} />);

    act(() => {
      registry.register(host, <span data-testid='portal-node'>hello</span>);
    });

    const node = screen.getByTestId('portal-node');
    expect(node).toHaveTextContent('hello');
    expect(host).toContainElement(node);
  });

  it('renders entries registered before mount', () => {
    registry.register(host, <span data-testid='early-node'>early</span>);

    render(<PortalOutlet registry={registry} />);

    expect(host).toContainElement(screen.getByTestId('early-node'));
  });

  it('re-renders when an entry is updated', () => {
    render(<PortalOutlet registry={registry} />);
    let id = 0;
    act(() => {
      id = registry.register(host, <span data-testid='portal-node'>one</span>);
    });

    act(() => {
      registry.update(id, <span data-testid='portal-node'>two</span>);
    });

    expect(screen.getByTestId('portal-node')).toHaveTextContent('two');
  });

  it('removes the node when an entry is unregistered', () => {
    render(<PortalOutlet registry={registry} />);
    let id = 0;
    act(() => {
      id = registry.register(host, <span data-testid='portal-node'>bye</span>);
    });

    act(() => {
      registry.unregister(id);
    });

    expect(screen.queryByTestId('portal-node')).not.toBeInTheDocument();
    expect(host).toBeEmptyDOMElement();
  });

  it('keeps React context from where the outlet is rendered', () => {
    render(
      <LabelContext.Provider value='from-outlet'>
        <PortalOutlet registry={registry} />
      </LabelContext.Provider>,
    );

    act(() => {
      registry.register(host, <ContextLabel />);
    });

    expect(screen.getByTestId('context-label')).toHaveTextContent('from-outlet');
  });

  it('renders several hosts independently', () => {
    const second = document.createElement('div');
    document.body.appendChild(second);
    render(<PortalOutlet registry={registry} />);

    act(() => {
      registry.register(host, <span data-testid='first-node'>1</span>);
      registry.register(second, <span data-testid='second-node'>2</span>);
    });

    expect(host).toContainElement(screen.getByTestId('first-node'));
    expect(second).toContainElement(screen.getByTestId('second-node'));
    second.remove();
  });
});
