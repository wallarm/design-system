import { type FC, useEffect, useRef, useState } from 'react';
import { createStateStore, type Spec } from '@json-render/core';
import { type ComponentRenderProps, JSONUIProvider, Renderer } from '@json-render/react';
import type { GenUiActionHandler } from '../core/define';
import { isRecord } from '../core/guards';
import { Placeholder } from '../render/Placeholder';
import { SurfaceBoundary } from '../render/SurfaceBoundary';
import type { JsonRenderCatalog } from './catalog';
import { sanitizeSpec } from './spec';

export interface JsonRenderSurfaceProps {
  catalog: JsonRenderCatalog;
  /** The spec so far (`specFromLines`); it grows while the model streams. */
  spec: Spec | null;
  streaming?: boolean;
  onAction: GenUiActionHandler;
}

/** Renders one json-render spec through the catalog: actions allowlisted, state kept in step. */
export const JsonRenderSurface: FC<JsonRenderSurfaceProps> = ({
  catalog,
  spec,
  streaming,
  onAction,
}) => {
  // ActionProvider reads `handlers` once at mount, so they must forward to the latest onAction.
  const onActionRef = useRef(onAction);
  useEffect(() => {
    onActionRef.current = onAction;
  });
  const [handlers] = useState(() =>
    Object.fromEntries(
      catalog.actions.map(a => [
        a.name,
        (params: Record<string, unknown>) => onActionRef.current(a.name, params),
      ]),
    ),
  );

  // The spec's state grows after mount (the app fills it while the agent streams). It runs on a
  // store, and each new spec writes only the leaves whose value changed since the last spec (and
  // clears the ones it dropped), so a value a user edited in between stays.
  const [store] = useState(() => createStateStore(spec?.state ?? {}));
  const applied = useRef<Record<string, string>>({});
  useEffect(() => {
    const next = leaves(spec?.state ?? {});
    const updates: Record<string, unknown> = {};
    for (const [pointer, value] of Object.entries(next)) {
      const json = JSON.stringify(value);
      if (applied.current[pointer] !== json) updates[pointer] = value;
      applied.current[pointer] = json;
    }
    for (const pointer of Object.keys(applied.current)) {
      if (pointer in next) continue;
      updates[pointer] = undefined;
      delete applied.current[pointer];
    }
    if (Object.keys(updates).length) store.update(updates);
  }, [spec?.state, store]);

  return (
    <JSONUIProvider registry={catalog.registry} store={store} handlers={handlers}>
      <SurfaceBoundary>
        <Renderer
          spec={sanitizeSpec(spec, catalog.actions)}
          registry={catalog.registry}
          loading={streaming}
          fallback={PendingElement}
        />
      </SurfaceBoundary>
    </JSONUIProvider>
  );
};

/** Renders `specFromLines`' pending elements (and any unknown type) as a placeholder. */
const PendingElement: FC<ComponentRenderProps> = ({ element }) => (
  <Placeholder id={String(element.props.id ?? element.type)} />
);

/** JSON Pointer → value for every leaf; arrays are leaves (rows are replaced, not merged). */
const leaves = (value: Record<string, unknown>, prefix = ''): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(value).flatMap(([key, v]) => {
      const pointer = `${prefix}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      return isRecord(v) ? Object.entries(leaves(v, pointer)) : [[pointer, v]];
    }),
  );
