import type { HTMLAttributes, Ref } from 'react';
import type { TestableProps } from '../../utils/testId';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface CopyFormatData {
  method?: HttpMethod;
  segments: string[];
  encoding?: string;
}

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
