import type { Ref } from 'react';

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        (ref as { current: T | null }).current = value;
      }
    }
  };
}
