import { useCallback, useRef, useState } from 'react';

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

  const { current: isControlled } = useRef<boolean>(controlled !== undefined);
  const [valueState, setValue] = useState<T | undefined>(defaultProp);
  const value = isControlled ? controlled : valueState;

  const setValueIfUncontrolled = useCallback((newValue: T | undefined) => {
    if (!isControlled) {
      setValue(newValue);
    }
  }, []);

  return [value, setValueIfUncontrolled];
};
