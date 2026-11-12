import { type FC, useEffect, useRef, useState } from 'react';
import { A2uiSurface } from '@a2ui/react';
import {
  type Catalog,
  type ComponentApi,
  MessageProcessor,
  type RendererErrorMessage,
} from '@a2ui/web_core';
import type { GenUiAction, GenUiActionHandler } from '../core/define';
import { SurfaceBoundary } from '../render/SurfaceBoundary';
import { warn } from '../render/warn';
import type { A2uiMessage } from './catalog';

/**
 * @a2ui/react types the surface with the consumer's zod while web_core types it with zod 3 (see
 * catalog.tsx); the cast to the React side's type happens here.
 */
type Surface = Parameters<typeof A2uiSurface>[0]['surface'];

export interface A2uiSurfacesProps {
  catalog: Catalog<ComponentApi>;
  /** Every message the agent has sent so far, in order; new ones are appended while it streams. */
  messages: readonly A2uiMessage[];
  /** The only action names that reach `onAction`; anything else the agent names is dropped. */
  actions: readonly GenUiAction[];
  onAction: GenUiActionHandler;
  /** Messages the processor rejected (bad ids, unknown surface, catalog mismatch). Default: console.warn. */
  onError?: (errors: readonly RendererErrorMessage[]) => void;
}

/** Feeds the messages to one MessageProcessor and renders every surface it holds. */
export const A2uiSurfaces: FC<A2uiSurfacesProps> = ({
  catalog,
  messages,
  actions,
  onAction,
  onError = warnErrors,
}) => {
  const latest = useRef({ actions, onAction, onError });
  useEffect(() => {
    latest.current = { actions, onAction, onError };
  });

  const [processor] = useState(
    () =>
      new MessageProcessor([catalog], action => {
        const { actions: allowed, onAction: dispatch } = latest.current;
        if (allowed.some(a => a.name === action.name)) dispatch(action.name, action.context);
        else warn(`dropped A2UI action '${action.name}', not in the allowlist`);
      }),
  );
  const [surfaces, setSurfaces] = useState(() => [...processor.model.surfacesMap.values()]);

  useEffect(() => {
    const sync = () => setSurfaces([...processor.model.surfacesMap.values()]);
    const created = processor.onSurfaceCreated(sync);
    const deleted = processor.onSurfaceDeleted(sync);
    return () => {
      created.unsubscribe();
      deleted.unsubscribe();
    };
  }, [processor]);

  // The processor is incremental: hand it only the messages it hasn't seen. A rejected message is
  // reported, not thrown, and never re-fed (its createSurface may already have been applied).
  const fed = useRef(0);
  useEffect(() => {
    if (messages.length <= fed.current) return;
    const batch = messages.slice(fed.current);
    fed.current = messages.length;
    const errors = processor.processMessagesWithErrors(batch);
    if (errors.length) latest.current.onError(errors);
  }, [messages, processor]);

  return surfaces.map(surface => (
    <SurfaceBoundary key={surface.id}>
      <A2uiSurface surface={surface as unknown as Surface} />
    </SurfaceBoundary>
  ));
};

const warnErrors = (errors: readonly RendererErrorMessage[]) => warn('A2UI errors', errors);
