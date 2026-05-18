import { useSyncExternalStore } from 'react';

let listeners: Array<() => void> = [];

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];

  window.addEventListener('popstate', listener);

  return () => {
    listeners = listeners.filter(l => l !== listener);
    window.removeEventListener('popstate', listener);
  };
}

function getSnapshot(): string {
  return window.location.pathname;
}

/** Push a new pathname to the browser history and notify subscribers. */
export function pushPathname(path: string): void {
  window.history.pushState(null, '', path);
  for (const listener of listeners) {
    listener();
  }
}

/** Subscribe to `window.location.pathname` via `useSyncExternalStore`. */
export function useLocationPathname(): string {
  return useSyncExternalStore(subscribe, getSnapshot);
}
