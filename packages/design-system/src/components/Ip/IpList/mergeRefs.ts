import type { Ref } from 'react';

export const mergeRefs =
  <T>(...refs: (Ref<T> | undefined)[]) =>
  (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        (ref as { current: T | null }).current = value;
      }
    }
  };
