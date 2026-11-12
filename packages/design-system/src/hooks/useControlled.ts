import { useState } from 'react';

interface UseControlledProps<T = unknown> {
  /**
   * Holds the component value when it's controlled.
   */
  controlled: T | undefined;
  /**
   * The default value when uncontrolled.
   */
  default: T | undefined;
}

export const useControlled = <T = unknown>(
  props: UseControlledProps<T>,
): [T | undefined, (newValue: T | undefined) => void] => {
  const { controlled, default: defaultProp } = props;

  // The mode is fixed on mount. Held in state, not a ref, so render reads no ref.current.
  const [isControlled] = useState(controlled !== undefined);
  const [valueState, setValue] = useState<T | undefined>(defaultProp);
  const value = isControlled ? controlled : valueState;

  // React Compiler keeps this stable: it only closes over the never-changing mode and setter.
  const setValueIfUncontrolled = (newValue: T | undefined) => {
    if (!isControlled) {
      setValue(newValue);
    }
  };

  return [value, setValueIfUncontrolled];
};
