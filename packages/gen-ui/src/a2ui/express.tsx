/**
 * A2UI Express: the compact text a model writes instead of A2UI JSON, one statement per
 * component (`m = Metric("Attacks", $/kpi/attacks, "compact")`). Arguments follow the order of
 * the entry's props, bindings are `$/path`. The official @a2ui/agent compiler turns it into the
 * same v1.0 messages, so everything downstream is unchanged.
 *
 * `@wallarm-org/gen-ui/a2ui/express`: its own entry point, since the compiler is most of its weight.
 */
import { type FC, useEffect, useRef, useState } from 'react';
import { ExpressParser } from '@a2ui/agent';
import type { Catalog, ComponentApi } from '@a2ui/web_core';
import type { GenUiAction, GenUiActionHandler } from '../core/define';
import { A2uiSurfaces } from './A2uiSurfaces';
import type { A2uiMessage } from './catalog';

type A2uiCatalog = Catalog<ComponentApi>;

/** A compiler (and decompiler) for one surface. */
export const createExpressParser = (catalog: A2uiCatalog, surfaceId: string) =>
  new ExpressParser(catalog, surfaceId, '1.0');

/**
 * Recorded v1.0 messages as the Express a model would have written, one statement per line, in
 * order: feed the lines one by one to replay it streaming. The answer is decompiled as a whole,
 * because Express creates a surface in the scope that defines its root.
 */
export const toExpressLines = (
  catalog: A2uiCatalog,
  surfaceId: string,
  messages: readonly A2uiMessage[],
): string[] =>
  createExpressParser(catalog, surfaceId)
    .decompile(withRootInCreate(messages))
    .split('\n')
    .filter(line => line.trim() !== '');

/**
 * Express creates a surface in the scope that defines its root, so a recording that creates the
 * surface empty and sends the root later (valid v1.0) is rewritten with the components that hold
 * the root moved into createSurface. The rendered result is the same.
 */
const withRootInCreate = (messages: readonly A2uiMessage[]): A2uiMessage[] => {
  const holdsRoot = (m: A2uiMessage) =>
    'updateComponents' in m && m.updateComponents.components.some(c => c.id === 'root');
  const create = messages.find(m => 'createSurface' in m);
  const rootUpdate = messages.find(holdsRoot);
  if (!create || !('createSurface' in create) || create.createSurface.components || !rootUpdate)
    return [...messages];
  if (!('updateComponents' in rootUpdate)) return [...messages];
  const merged = {
    ...create,
    createSurface: { ...create.createSurface, components: rootUpdate.updateComponents.components },
  };
  return messages.flatMap(m => (m === create ? [merged] : m === rootUpdate ? [] : [m]));
};

export interface ExpressSurfacesProps {
  catalog: A2uiCatalog;
  surfaceId: string;
  /** The Express text so far, in the chunks it arrived in; new chunks are appended. */
  chunks: readonly string[];
  actions: readonly GenUiAction[];
  onAction: GenUiActionHandler;
  /** A block the compiler rejected, or a message the renderer did. Default: console.warn. */
  onError?: (errors: readonly unknown[]) => void;
}

/**
 * Renders a streaming Express answer: each new chunk goes into one streaming compiler, which
 * emits v1.0 messages as soon as they're complete, and those render like any A2UI answer.
 */
export const ExpressSurfaces: FC<ExpressSurfacesProps> = ({
  catalog,
  surfaceId,
  chunks,
  actions,
  onAction,
  onError,
}) => {
  const [stream] = useState(() =>
    createExpressParser(catalog, surfaceId).openStream({
      wrapped: false,
      afterRejectedBlock: 'continue',
    }),
  );
  const [messages, setMessages] = useState<readonly A2uiMessage[]>([]);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  // The compiler is incremental: feed it only the chunks it hasn't seen.
  const fed = useRef(0);
  useEffect(() => {
    if (chunks.length <= fed.current) return;
    const parts = chunks.slice(fed.current).flatMap(chunk => stream.feed(`${chunk}\n`));
    fed.current = chunks.length;
    const compiled = parts.flatMap(part => (part.type === 'a2ui' ? part.a2ui : []));
    const rejected = parts.filter(part => part.type === 'error');
    if (compiled.length) setMessages(list => [...list, ...compiled]);
    if (rejected.length) onErrorRef.current?.(rejected);
  }, [chunks, stream]);

  return (
    <A2uiSurfaces
      catalog={catalog}
      messages={messages}
      actions={actions}
      onAction={onAction}
      onError={onError}
    />
  );
};
