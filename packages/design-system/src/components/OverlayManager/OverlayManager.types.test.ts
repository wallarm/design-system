// Typechecked by tsconfig.typetest.json (part of `pnpm typecheck`). Rstest runs it as a file with no tests.
// Every @ts-expect-error must be used by a real error, or tsc reports an unused directive.
import { lazy } from 'react';
import { defineOverlay } from './defineOverlay';
import type { OverlayOpenArgs, OverlayPayload, OverlayProps, OverlayResult } from './types';

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

const NotAnOverlay = ({ userId }: { userId: string }) => userId;
// @ts-expect-error a component without the `controller` prop
defineOverlay(async () => NotAnOverlay);
// @ts-expect-error return the component itself, never React.lazy
defineOverlay(async () => lazy(async () => ({ default: DeleteDialog })));
