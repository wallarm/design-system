// Typechecked by tsconfig.typetest.json (part of `pnpm typecheck`). Rstest runs it as a file with no tests.
// Every @ts-expect-error must be used by a real error, or tsc reports an unused directive.
// It imports from the public entry, so every type it names is pinned as exported.
import { createElement, lazy } from 'react';
import {
  defineOverlay,
  type LazyOverlayBody,
  lazyOverlayBody,
  type OverlayDefinition,
  type OverlayOpenArgs,
  type OverlayPayload,
  type OverlayProps,
  type OverlayResult,
  useOverlay,
} from './index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

interface DeleteProps extends OverlayProps<boolean> {
  userId: string;
  userName: string;
}
interface FilterProps extends OverlayProps {
  query?: string;
}
type PolicyProps = OverlayProps<boolean> &
  ({ mode: 'create' } | { mode: 'edit'; policyId: string });
type ModeProps = OverlayProps<boolean> & ({ mode?: 'create' } | { mode: 'edit'; policyId: string });

export type TypeCases = [
  Expect<Equal<OverlayPayload<DeleteProps>, { userId: string; userName: string }>>,
  Expect<Equal<OverlayResult<DeleteProps>, boolean>>,
  Expect<Equal<OverlayResult<OverlayProps>, void>>,
  Expect<Equal<OverlayOpenArgs<OverlayPayload<OverlayProps>>, []>>,
  Expect<Equal<OverlayOpenArgs<OverlayPayload<FilterProps>>, [payload?: { query?: string }]>>,
  Expect<
    Equal<
      OverlayOpenArgs<OverlayPayload<DeleteProps>>,
      [payload: { userId: string; userName: string }]
    >
  >,
  Expect<
    Equal<OverlayPayload<PolicyProps>, { mode: 'create' } | { mode: 'edit'; policyId: string }>
  >,
  // One union member needs no keys, so the payload is optional.
  Expect<
    Equal<
      OverlayOpenArgs<OverlayPayload<ModeProps>>,
      [payload?: { mode?: 'create' } | { mode: 'edit'; policyId: string }]
    >
  >,
];

export const DeleteDialog = ({ controller }: DeleteProps) => {
  // @ts-expect-error close takes the overlay's result type
  controller.close('yes');
  return null;
};
export const DeleteOverlay = defineOverlay(async () => DeleteDialog);
export const PolicyOverlay = defineOverlay(async () => (_: PolicyProps) => null);

export type DefinitionCases = [
  Expect<
    Equal<typeof DeleteOverlay, OverlayDefinition<{ userId: string; userName: string }, boolean>>
  >,
  // The helpers also take a definition, as a column builder that imports it would write them.
  Expect<Equal<OverlayPayload<typeof DeleteOverlay>, { userId: string; userName: string }>>,
  Expect<Equal<OverlayResult<typeof DeleteOverlay>, boolean>>,
];

const NotAnOverlay = ({ userId }: { userId: string }) => userId;
// @ts-expect-error a component without the `controller` prop
defineOverlay(async () => NotAnOverlay);
// @ts-expect-error return the component itself, never React.lazy
defineOverlay(async () => lazy(async () => ({ default: DeleteDialog })));
// @ts-expect-error a component that takes no props has no `controller` either
defineOverlay(async () => () => null);
// @ts-expect-error optional props only, such as a legacy dialog's `title?`, still lack `controller`
defineOverlay(async () => (_: { title?: string }) => null);
// @ts-expect-error a `key` prop never reaches a component: React takes it
defineOverlay(async () => (_: OverlayProps & { key: string }) => null);

const NoPayloadOverlay = defineOverlay(async () => (_: OverlayProps<boolean>) => null);

const EditBody = (_: { userId: string }) => null;
export const EditBodyPart = lazyOverlayBody(async () => EditBody);

export type LazyBodyCases = [
  Expect<Equal<typeof EditBodyPart, LazyOverlayBody<{ userId: string }>>>,
];

createElement(EditBodyPart, { fallback: null, userId: '1' });
// @ts-expect-error the fallback is required
createElement(EditBodyPart, { userId: '1' });
// @ts-expect-error the body's own props are required
createElement(EditBodyPart, { fallback: null });
// @ts-expect-error and keep their types
createElement(EditBodyPart, { fallback: null, userId: 1 });
// @ts-expect-error return the body component itself, never React.lazy
lazyOverlayBody(async () => lazy(async () => ({ default: EditBody })));
// @ts-expect-error a body prop named `fallback` never arrives: the helper takes it
lazyOverlayBody(async () => (_: { fallback: string }) => null);
// @ts-expect-error nor one that only a union member has
lazyOverlayBody(async () => (_: { mode: 'a'; fallback: string } | { mode: 'b' }) => null);
// A body with loose props declares no `fallback`, so it compiles.
lazyOverlayBody(async () => (_: Record<string, unknown>) => null);

export const CallSites = () => {
  const del = useOverlay(DeleteOverlay);
  const none = useOverlay(NoPayloadOverlay);
  const policy = useOverlay(PolicyOverlay);
  const handle = async () => {
    // @ts-expect-error missing required payload
    await del.open();
    // @ts-expect-error wrong payload type
    await del.open({ userId: 1, userName: 'x' });
    // @ts-expect-error excess payload key
    await del.open({ userId: '1', userName: 'x', extra: true });
    // @ts-expect-error payload for an overlay without payload props
    await none.open({ userId: '1' });
    // @ts-expect-error the result can be undefined (dismissed)
    const deleted: boolean = await del.open({ userId: '1', userName: 'x' });
    // @ts-expect-error the edit member needs its id
    await policy.open({ mode: 'edit' });
    await none.open();
    await policy.open({ mode: 'create' });
    return deleted;
  };
  // @ts-expect-error a component is not a definition
  useOverlay(DeleteDialog);
  return handle;
};
