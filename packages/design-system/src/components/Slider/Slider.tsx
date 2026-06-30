import { type FC, type ReactNode, type Ref, useCallback, useMemo, useRef } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { sliderVariants } from './classes';
import { SliderRootContextProvider } from './SliderContext';
import type { SliderMark } from './types';

/** Ark/Zag machine-config props forwarded to the headless `Slider.Root`. */
type SliderRootConfig = Pick<
  ArkSlider.RootProps,
  | 'value'
  | 'defaultValue'
  | 'min'
  | 'max'
  | 'step'
  | 'disabled'
  | 'readOnly'
  | 'getAriaValueText'
  | 'name'
  | 'form'
  | 'minStepsBetweenThumbs'
  | 'thumbCollisionBehavior'
>;

export interface SliderProps extends SliderRootConfig, TestableProps {
  /** Error state → maps to Ark `invalid` (repaints the handle; the message is the Field's job). */
  error?: boolean;
  className?: string;
  children?: ReactNode;
  /** Fires live during drag with the current value array (`[n]` single, `[low, high]` range). */
  onValueChange?: (value: number[]) => void;
  /** Fires once on drag release with the committed value array. */
  onValueChangeEnd?: (value: number[]) => void;
  /** Ref to the Ark Slider root element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Slider — pick an approximate, bounded value (or range) by dragging a handle along
 * a track. Built on `@ark-ui/react/slider`.
 *
 * Compose the parts: `SliderControl` (renders the track + range) holds one
 * `SliderThumb` per thumb (the real `role="slider"` node — consumer `data-*` /
 * analytics / `ref` land there) and an optional `SliderMarks`. `SliderInput` and
 * `SliderValue` are optional readouts. Single vs range is driven by the length of
 * `value` / `defaultValue` — render one `SliderThumb` per entry. Thumbs never cross
 * (`thumbCollisionBehavior` defaults to `'none'`); set `minStepsBetweenThumbs` for a gap.
 *
 * It reads `Field` context like `Input`/`Textarea`, so wrapping it in `<Field>` wires
 * label / invalid / disabled. When an exact figure matters, pair with `NumberInput`;
 * for 2–7 fixed options use `SegmentedControl`. See `docs/slider-design-spec.md`.
 */
export const Slider: FC<SliderProps> = ({
  value,
  defaultValue = [50],
  min,
  max,
  step,
  disabled,
  readOnly,
  getAriaValueText,
  name,
  form,
  minStepsBetweenThumbs,
  thumbCollisionBehavior,
  error = false,
  className,
  children,
  onValueChange,
  onValueChangeEnd,
  ref,
  'data-testid': testId,
}) => {
  // Consume a wrapping `<Field>` (like Input/Textarea) so label / invalid / disabled
  // auto-wire. Consumer props take precedence; the field fills the gaps.
  const field = useFieldContext();
  const invalid = error || Boolean(field?.invalid);
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isReadOnly = readOnly ?? field?.readOnly;

  // Thumb COUNT is value-driven (Ark-native): controlled `value` wins, else `defaultValue`.
  const isRange = (value ?? defaultValue).length > 1;

  // Marks published by <SliderMarks> (if any), read lazily for ordinal aria-valuetext.
  const marksRef = useRef<SliderMark[]>([]);
  const registerMarks = useCallback((marks: SliderMark[]) => {
    marksRef.current = marks;
  }, []);

  // Ordinal scale: announce a mark's label as aria-valuetext (requirements §7.1) unless
  // the consumer supplies their own formatter. Reads marksRef at call time (post-mount).
  const resolvedGetAriaValueText = useMemo(
    () =>
      getAriaValueText ??
      (({ value: v }: { value: number; index: number }) =>
        marksRef.current.find(mark => mark.value === v)?.label ?? String(v)),
    [getAriaValueText],
  );

  // Single value in a Field → the field label names the thumb (via aria-labelledby).
  const fieldLabelId = field && !isRange ? field.ids.label : undefined;

  const contextValue = useMemo(
    () => ({
      isRange,
      invalid,
      disabled: isDisabled,
      ariaDescribedby: field?.ariaDescribedby,
      fieldLabelId,
      marksRef,
      registerMarks,
    }),
    [isRange, invalid, isDisabled, field?.ariaDescribedby, fieldLabelId, registerMarks],
  );

  return (
    <ArkSlider.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={isDisabled}
      readOnly={isReadOnly}
      invalid={invalid}
      getAriaValueText={resolvedGetAriaValueText}
      name={name}
      form={form}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      thumbCollisionBehavior={thumbCollisionBehavior}
      onValueChange={onValueChange ? details => onValueChange(details.value) : undefined}
      onValueChangeEnd={onValueChangeEnd ? details => onValueChangeEnd(details.value) : undefined}
      data-slot='slider'
      data-testid={testId}
      className={cn(sliderVariants(), className)}
    >
      <SliderRootContextProvider value={contextValue}>
        <TestIdProvider value={testId}>{children}</TestIdProvider>
      </SliderRootContextProvider>
    </ArkSlider.Root>
  );
};

Slider.displayName = 'Slider';
