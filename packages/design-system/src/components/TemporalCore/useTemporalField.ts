import { useControlled } from '../../hooks';

interface UseTemporalFieldProps<T> {
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T | null) => void;
}

export function useTemporalField<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseTemporalFieldProps<T>) {
  const [value, setValue] = useControlled({
    controlled: controlledValue,
    default: defaultValue ?? null,
  });

  const handleChange = (newValue: T | null) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return {
    value,
    onChange: handleChange,
  };
}
