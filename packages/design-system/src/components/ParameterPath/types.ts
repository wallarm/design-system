import type { HTMLAttributes, Ref } from 'react';
import type { TestableProps } from '../../utils/testId';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface CopyFormatData {
  method?: HttpMethod;
  segments: string[];
  encoding?: string;
}

// Cmd/Ctrl+C uses the native onCopy handler, which needs a real text selection.
// Do not place ParameterPath inside a `user-select: none` ancestor or copy
// silently falls back to the empty browser default.
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
