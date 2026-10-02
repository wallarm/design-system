'use no memo';

import type { ReactNode } from 'react';

/**
 * Calls `render` on every render of the caller — never memoized.
 *
 * This file opts out of the React Compiler on purpose. Some consumer callbacks
 * are invoked as plain functions during render instead of as React elements:
 * a function `header` (called inline so `TableHeadCell` can scan its output
 * for `<TableSortTrigger>` / `<TableColumnMenu>`), `meta.renderMenuAction` and
 * `renderExpandedRow`. Such a callback may call hooks or read context, so it
 * must run on every render of the host component, exactly as it did before
 * the compiler. Inside a compiled component the call would be cached in a
 * memo scope and skipped whenever the scope's inputs look unchanged — which
 * breaks the consumer's hook order ("Rendered fewer hooks than expected") and
 * leaves context reads stale. A hook call itself is never skipped by the
 * compiler, so routing the callback through this uncompiled hook keeps it
 * running every render.
 */
export const useRenderEveryTime = <V>(render: () => V): V => render();

interface RenderCallbackProps<A> {
  render: (arg: A) => ReactNode;
  arg: A;
}

/**
 * Renders `render(arg)` as its own component, so a consumer callback that is
 * only called conditionally (e.g. `renderExpandedRow` while the row is
 * expanded) keeps its hooks in a component of its own instead of changing the
 * host's hook list. Uncompiled like `useRenderEveryTime`; create the element
 * inside `useRenderEveryTime` so it is a new element on every host render.
 */
export const RenderCallback = <A>({ render, arg }: RenderCallbackProps<A>): ReactNode =>
  render(arg);
