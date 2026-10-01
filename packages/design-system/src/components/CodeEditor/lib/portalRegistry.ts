import type { ReactNode } from 'react';

/** A React node to render into a DOM host owned by the editor engine (gutter marker, widget, panel). */
export interface PortalEntry {
  id: number;
  host: HTMLElement;
  node: ReactNode;
}

/**
 * External store connecting plain-DOM CodeMirror extensions to React.
 * The engine registers `(host, node)` pairs; `PortalOutlet` renders each one with `createPortal`.
 */
export interface PortalRegistry {
  register(host: HTMLElement, node: ReactNode): number;
  update(id: number, node: ReactNode): void;
  unregister(id: number): void;
  subscribe(listener: () => void): () => void;
  /** Stable reference until a change */
  getSnapshot(): readonly PortalEntry[];
}

export const createPortalRegistry = (): PortalRegistry => {
  let nextId = 1;
  let entries: readonly PortalEntry[] = [];
  const listeners = new Set<() => void>();

  const emit = (next: readonly PortalEntry[]) => {
    entries = next;
    for (const listener of [...listeners]) listener();
  };

  return {
    register(host, node) {
      const id = nextId++;
      emit([...entries, { id, host, node }]);
      return id;
    },
    update(id, node) {
      const current = entries.find(entry => entry.id === id);
      if (!current || current.node === node) return;
      emit(entries.map(entry => (entry.id === id ? { ...entry, node } : entry)));
    },
    unregister(id) {
      if (!entries.some(entry => entry.id === id)) return;
      emit(entries.filter(entry => entry.id !== id));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return entries;
    },
  };
};
