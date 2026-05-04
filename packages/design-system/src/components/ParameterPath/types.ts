import type { HTMLAttributes, Ref } from 'react';
import type { TestableProps } from '../../utils/testId';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface CopyFormatData {
  method?: HttpMethod;
  segments: string[];
  encoding?: string;
}

/**
 * Props for `ParameterPath`.
 *
 * **Test IDs.** Pass `data-testid` and child slots derive their own ids via
 * `TestIdProvider`. Slot suffixes:
 * - `--method`
 * - `--segment-N` (N = zero-based index in `segments`)
 * - `--encoding`
 * - `--ellipsis` (only present when truncated)
 *
 * **Cmd/Ctrl+C copy.** Copy is implemented via the native `onCopy` handler,
 * which fires only when the user has a non-empty selection inside the root.
 * The component renders inside a normal `<div>`, so the default text
 * selection works — but **do not place `ParameterPath` inside an ancestor
 * with `user-select: none`**, or copy will silently fall back to the
 * (empty) browser default. Override the serializer with `copyFormat`.
 */
export interface ParameterPathProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onCopy'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  method?: HttpMethod;
  segments: string[];
  encoding?: string;
  attack?: boolean;
  copyFormat?: (data: CopyFormatData) => string;
}
