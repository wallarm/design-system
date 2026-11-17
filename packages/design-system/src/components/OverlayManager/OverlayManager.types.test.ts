// Typechecked by tsconfig.typetest.json (part of `pnpm typecheck`). Rstest runs it as a file with no tests.
// Every @ts-expect-error must be used by a real error, or tsc reports an unused directive.
import { lazy } from 'react';
import { defineOverlay } from './defineOverlay';
import type {
  OverlayDefinition,
  OverlayOpenArgs,
  OverlayPayload,
  OverlayProps,
  OverlayResult,
} from './types';
import { useOverlay } from './useOverlay';

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
];

const NotAnOverlay = ({ userId }: { userId: string }) => userId;
// @ts-expect-error a component without the `controller` prop
defineOverlay(async () => NotAnOverlay);
// @ts-expect-error return the component itself, never React.lazy
defineOverlay(async () => lazy(async () => ({ default: DeleteDialog })));

const NoPayloadOverlay = defineOverlay(async () => (_: OverlayProps<boolean>) => null);

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
