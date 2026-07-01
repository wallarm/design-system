import {
  type ChangeEventHandler,
  type FC,
  type FocusEventHandler,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type Ref,
  useCallback,
  useId,
  useState,
} from 'react';
import { useSliderContext } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Input } from '../Input';
import { sliderInputBoxClassNames } from './classes';
import { useSliderRootContext } from './SliderContext';

export interface SliderInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  /** Which thumb this box is bound to (0 = single/low, 1 = high). */
  index?: number;
  /** Ref to the real `<input>` node (analytics / focus management). */
  ref?: Ref<HTMLInputElement>;
}

/**
 * Inline numbers-only `Input` two-way bound to the thumb at `index`: a plain box (no
 * stepper, fixed width — the DS `Input`, matching Figma `_text-box`). The slider machine
 * owns clamp/snap/no-cross, so the box needs no bounds of its own.
 *
 * Editing uses a local draft buffer: while focused, the box shows exactly what the user
 * typed (so an empty field, a leading `-`, a trailing `.`, or a value that would snap/clamp
 * survive the keystroke) and commits to `setThumbValue` on blur / Enter — then drops the
 * draft so the box re-syncs to the machine's clamped + snapped value. Binding `value`
 * straight to the snapped machine value instead would fight every intermediate keystroke.
 *
 * It is the real interactive node, so arbitrary consumer `data-*` / `aria-*` / `id` / `ref`
 * (canonically `data-analytics-id` / `data-analytics-props`) forward straight to the
 * `<input>` (see `docs/metrics/contract.md`).
 *
 * Explicit `useId` default so two range boxes never collide on the wrapping field's control
 * id (and `FieldLabel`'s `htmlFor` keeps naming the thumb, not a box); a consumer `id` wins.
 */
export const SliderInput: FC<SliderInputProps> = ({
  index = 0,
  'aria-label': ariaLabel,
  id: idProp,
  className,
  ref,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  onKeyDown: onKeyDownProp,
  ...rest
}) => {
  const { isRange, disabled, invalid, readOnly } = useSliderRootContext();
  const api = useSliderContext();
  const autoId = useId();
  const id = idProp ?? autoId;
  const testId = useTestId(isRange ? `input-${index}` : 'input');

  const defaultLabel = isRange ? (index === 0 ? 'Minimum value' : 'Maximum value') : 'Value';

  // While editing, the box shows the raw draft; otherwise it mirrors the machine value.
  const machineText = String(api.value[index] ?? '');
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? machineText;

  const commit = useCallback(() => {
    if (draft === null) return;
    const next = Number(draft);
    // Empty / non-numeric drafts (a lone '-' or '.') simply don't move the thumb; dropping
    // the draft re-syncs the box to the machine value (which clamps + snaps).
    if (draft !== '' && !Number.isNaN(next)) api.setThumbValue(index, next);
    setDraft(null);
  }, [api, draft, index]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    event => {
      onChangeProp?.(event);
      if (readOnly) return;
      setDraft(event.target.value);
    },
    [onChangeProp, readOnly],
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    event => {
      onBlurProp?.(event);
      commit();
    },
    [onBlurProp, commit],
  );

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    event => {
      onKeyDownProp?.(event);
      if (event.key === 'Enter') commit();
    },
    [onKeyDownProp, commit],
  );

  return (
    <Input
      {...rest}
      ref={ref}
      // A regular box restricted to numbers — `inputMode` for the numeric keypad.
      inputMode='numeric'
      id={id}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      error={invalid}
      aria-label={ariaLabel ?? defaultLabel}
      data-testid={testId}
      className={cn(sliderInputBoxClassNames, className)}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

SliderInput.displayName = 'SliderInput';
