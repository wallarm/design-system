import { type FC, Fragment, type Ref, useId } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { Slider as ArkSlider } from '@ark-ui/react/slider';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { Input } from '../Input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import {
  sliderControlClassNames,
  sliderInputBoxClassNames,
  sliderInputRowClassNames,
  sliderMarkerClassNames,
  sliderMarkerGroupClassNames,
  sliderRangeClassNames,
  sliderThumbClassNames,
  sliderTrackClassNames,
  sliderVariants,
} from './classes';

/** The live Ark slider api exposed through `Slider.Context` (value, setThumbValue, …). */
type SliderApi = Parameters<ArkSlider.ContextProps['children']>[0];

/** A tick mark: a position on the scale with an optional text label. */
export interface SliderMark {
  /** The value this tick sits at (within `[min, max]`). */
  value: number;
  /**
   * Optional label rendered below the tick. For ordinal scales (e.g.
   * `Low` / `Medium` / `High`) the label also becomes the thumb's
   * `aria-valuetext` unless a custom `getAriaValueText` is supplied.
   */
  label?: string;
}

/** Index of the thumb whose value is closest to `target` (for tick click-to-jump). */
const nearestThumbIndex = (values: number[], target: number): number => {
  let nearest = 0;
  let smallest = Number.POSITIVE_INFINITY;
  values.forEach((v, i) => {
    const distance = Math.abs(v - target);
    if (distance < smallest) {
      smallest = distance;
      nearest = i;
    }
  });
  return nearest;
};

/**
 * Ark/Zag machine-config props forwarded to `Slider.Root` (the headless state
 * owner). Range config (`minStepsBetweenThumbs` for a gap, `thumbCollisionBehavior`
 * for cross/push/swap) is live; `orientation` / `origin` stay deferred past v1
 * (requirements §9).
 */
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

/**
 * Consumer pass-through surface. These props land on the PRIMARY THUMB
 * (`index={0}`) — the real interactive node (`role="slider"`) — per
 * `docs/metrics/contract.md`, never on the Ark Root wrapper (the gap
 * `NumberInput` has). `aria-label` / `aria-labelledby` are pulled out (they are
 * per-thumb arrays on the root — see `SliderOwnProps`); everything else
 * (`data-*` / `id` / events) forwards verbatim. Range per-thumb attribution
 * beyond the primary thumb is the documented gap `ANALYTICS_GAPS.md` CG-1.
 */
type SliderThumbPassThrough = Omit<
  ArkSlider.ThumbProps,
  // `value` / `defaultValue` belong to the Root machine config (above), never the
  // thumb. The thumb is a `<div>` whose HTML `defaultValue` (`string | number |
  // readonly string[]`) would otherwise intersect the Root's `number[]` in
  // `SliderProps` and collapse the element type to `never`.
  | 'index'
  | 'name'
  | 'children'
  | 'className'
  | 'asChild'
  | 'aria-label'
  | 'aria-labelledby'
  | 'value'
  | 'defaultValue'
>;

interface SliderOwnProps {
  /** Error state → maps to Ark Root `invalid` (`data-invalid` styles the control). */
  error?: boolean;
  /** Class names for the Slider root wrapper. */
  className?: string;
  /**
   * Accessible name(s) for the thumb(s). A string labels a single-value slider;
   * an array labels each thumb of a range. Range defaults to
   * `['Minimum', 'Maximum']` when omitted. Ark distributes these onto the
   * `role="slider"` thumb node(s).
   */
  'aria-label'?: string | string[];
  /** As `aria-label`, but referencing the id(s) that label each thumb. */
  'aria-labelledby'?: string | string[];
  /**
   * Tick marks. Each entry places a tick at `value`; an optional `label`
   * renders below it (and drives `aria-valuetext` for ordinal scales). Provide
   * marks for discrete or labeled scales — align `step` to the marks so drag
   * and arrow-keys snap onto them.
   */
  marks?: SliderMark[];
  /**
   * Show an on-drag value bubble above each thumb (requirements §6.6). Mutually
   * exclusive with a persistent value readout (the field's `labelValue`) — never
   * enable both.
   */
  tooltip?: boolean;
  /**
   * Pair the slider with inline numbers-only `Input`(s) for precise entry,
   * two-way bound to the slider value. Single → one input (right); range → two
   * (min left, max right). Typing clamps to `[min, max]` and snaps to `step`.
   */
  input?: boolean;
  /** Fires live during drag with the current value array (`[n]` single, `[low, high]` range). */
  onValueChange?: (value: number[]) => void;
  /** Fires once on drag release with the committed value array. */
  onValueChangeEnd?: (value: number[]) => void;
  /** Ref to the primary thumb — the real interactive node (`role="slider"`). */
  ref?: Ref<HTMLDivElement>;
}

export type SliderProps = SliderRootConfig &
  SliderThumbPassThrough &
  SliderOwnProps &
  TestableProps;

/** Normalise a `string | string[]` accessible-name prop to the per-thumb array Ark expects. */
const toThumbLabels = (
  label: string | string[] | undefined,
  fallback: string[] | undefined,
): string[] | undefined => {
  if (label === undefined) return fallback;
  return Array.isArray(label) ? label : [label];
};

/**
 * One inline value `Input` two-way bound to the slider thumb at `index`: a plain
 * numbers-only box (the DS `Input` — no stepper, matches Figma `_text-box`). It
 * shows the live value and writes back through `setThumbValue`, which clamps to
 * `[min, max]`, snaps to `step`, and enforces the range no-cross — so the box
 * needs no bounds of its own. Module-scoped (stable identity) so typing never
 * remounts it. See requirements §6.5.
 */
const SliderValueInput: FC<{
  api: SliderApi;
  index: number;
  id: string;
  disabled?: boolean;
  error?: boolean;
  'aria-label': string;
  'data-testid'?: string;
}> = ({ api, index, id, disabled, error, 'aria-label': ariaLabel, 'data-testid': testId }) => (
  <Input
    // A regular box restricted to numbers — `inputMode` for the numeric
    // keypad; the slider machine owns clamping/snapping, so we just commit
    // any valid number the consumer types.
    inputMode='numeric'
    // Explicit id: the DS `Input` reads `Field` context, so without one it would
    // inherit the field's control id — two boxes in a range would then collide on
    // a duplicate id, and `FieldLabel`'s `htmlFor` would land on a box instead of
    // leaving the thumb (the real control) to own the label via `aria-labelledby`.
    id={id}
    value={String(api.value[index] ?? '')}
    disabled={disabled}
    error={error}
    aria-label={ariaLabel}
    data-testid={testId}
    className={sliderInputBoxClassNames}
    onChange={event => {
      const next = Number(event.target.value);
      if (event.target.value !== '' && !Number.isNaN(next)) api.setThumbValue(index, next);
    }}
  />
);

SliderValueInput.displayName = 'SliderValueInput';

/**
 * Slider — pick an approximate, bounded value (or range) by dragging a handle
 * along a track. Built on `@ark-ui/react/slider`.
 *
 * Single vs range is driven by the length of `value` / `defaultValue`: `[n]`
 * renders one thumb, `[low, high]` renders a two-thumb range (Figma `Double`).
 * Thumbs never cross (`thumbCollisionBehavior` defaults to `'none'`); set
 * `minStepsBetweenThumbs` to enforce a gap. `marks` add ticks/labels, `tooltip`
 * shows an on-drag bubble, and `input` pairs it with a numbers-only `Input`.
 *
 * When an exact figure matters, pair with `NumberInput`; for 2–7 fixed options
 * use `SegmentedControl`. See `docs/slider-design-spec.md`.
 */
export const Slider: FC<SliderProps> = ({
  // — Ark Root machine config —
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
  // — DS-owned —
  marks,
  tooltip = false,
  input = false,
  error = false,
  className,
  onValueChange,
  onValueChangeEnd,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'data-testid': testId,
  // — everything else → the primary thumb (real interactive node) —
  ...thumbProps
}) => {
  // Consume a wrapping `<Field>` (like Input/Textarea) so label / invalid /
  // disabled / description auto-wire. Consumer props take precedence; the field
  // fills the gaps. This is the gap NumberInput leaves (requirements §3, §6).
  const field = useFieldContext();
  const isInvalid = error || Boolean(field?.invalid);
  const isDisabled = disabled ?? field?.disabled;
  const isReadOnly = readOnly ?? field?.readOnly;

  // Stable id base for the inline value Input(s) so each gets a unique explicit
  // id (see SliderValueInput) instead of inheriting the wrapping field's id.
  const inputBaseId = useId();

  // Thumb COUNT is value-driven (Ark-native): controlled `value` wins, else
  // `defaultValue`. One entry → single; two → range.
  const thumbValues = value ?? defaultValue;
  const isRange = thumbValues.length > 1;

  // Label the thumb(s): explicit `aria-label` wins; else explicit
  // `aria-labelledby`; else (single value in a Field) the field label; else the
  // range Minimum/Maximum default. `aria-describedby` (field help + error) lands
  // on the thumb — the `role="slider"` node that announces it.
  const fieldLabelledBy =
    field && ariaLabel === undefined && ariaLabelledby === undefined && !isRange
      ? [field.ids.label]
      : undefined;
  const resolvedAriaLabel = toThumbLabels(
    ariaLabel,
    isRange && !fieldLabelledBy ? ['Minimum', 'Maximum'] : undefined,
  );
  const resolvedAriaLabelledby = toThumbLabels(ariaLabelledby, fieldLabelledBy);

  // Single keeps the clean `--thumb` slot; range disambiguates per index.
  const slotId = (slot: string, index: number) =>
    testId ? (isRange ? `${testId}--${slot}-${index}` : `${testId}--${slot}`) : undefined;

  // Display a value as its mark label (ordinal scale) or the raw number.
  const displayValue = (v: number): string =>
    marks?.find(mark => mark.value === v)?.label ?? String(v);
  const hasLabels = marks?.some(mark => mark.label != null) ?? false;

  // Ordinal scale: announce the mark label as `aria-valuetext` (requirements
  // §7.1) unless the consumer supplies their own formatter.
  const resolvedGetAriaValueText =
    getAriaValueText ??
    (hasLabels ? ({ value: v }: { value: number; index: number }) => displayValue(v) : undefined);

  const inputLabel = (index: number) =>
    isRange ? (index === 0 ? 'Minimum value' : 'Maximum value') : 'Value';

  return (
    <ArkSlider.Root
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={isDisabled}
      readOnly={isReadOnly}
      invalid={isInvalid}
      getAriaValueText={resolvedGetAriaValueText}
      name={name}
      form={form}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      thumbCollisionBehavior={thumbCollisionBehavior}
      aria-label={resolvedAriaLabel}
      aria-labelledby={resolvedAriaLabelledby}
      onValueChange={onValueChange ? details => onValueChange(details.value) : undefined}
      onValueChangeEnd={onValueChangeEnd ? details => onValueChangeEnd(details.value) : undefined}
      data-slot='slider'
      data-testid={testId}
      // Reserve room below the track for the tick-label band (overlaid absolutely).
      className={cn(sliderVariants(), marks && marks.length > 0 && 'pb-28', className)}
    >
      <ArkSlider.Context>
        {api => {
          const control = (
            <ArkSlider.Control data-slot='slider-control' className={sliderControlClassNames}>
              <ArkSlider.Track data-slot='slider-track' className={sliderTrackClassNames}>
                <ArkSlider.Range data-slot='slider-range' className={sliderRangeClassNames} />
              </ArkSlider.Track>
              {thumbValues.map((thumbValue, index) => {
                const thumbEl = (
                  <ArkSlider.Thumb
                    // Primary thumb (index 0) carries the consumer pass-through + ref;
                    // additional range thumbs are managed internally (CG-1).
                    {...(index === 0 ? thumbProps : {})}
                    ref={index === 0 ? ref : undefined}
                    index={index}
                    // Field help/error text announced on the real interactive node.
                    aria-describedby={field?.ariaDescribedby}
                    data-slot='slider-thumb'
                    data-testid={slotId('thumb', index)}
                    className={sliderThumbClassNames}
                  >
                    <ArkSlider.HiddenInput />
                  </ArkSlider.Thumb>
                );

                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: thumbs never reorder — index IS the stable identity (Ark addresses thumbs by index); keying by value would remount mid-drag.
                  <Fragment key={`thumb-${index}`}>
                    {tooltip ? (
                      // The DS Tooltip owns the bubble look, the gap, and the
                      // fade + slide-up animation. Driven by the slider, not
                      // hover: open ONLY while dragging (the spec's on-drag
                      // affordance). NOT `api.focused` — Ark keeps the thumb
                      // focused after a drag, which would leave the bubble
                      // lingering for seconds after release.
                      <Tooltip
                        open={api.dragging}
                        closeOnPointerDown={false}
                        closeDelay={0}
                        disabled={isDisabled}
                        positioning={{
                          placement: 'top',
                          offset: { mainAxis: 6 },
                          overflowPadding: 8,
                        }}
                      >
                        <TooltipTrigger asChild>{thumbEl}</TooltipTrigger>
                        {/* The DS Tooltip's built-in slide keys on `data-side`, but
                            this Ark version emits `data-placement` — so we add the
                            Figma 4px slide-up here, on the attribute that's live. */}
                        <TooltipContent className='data-[placement=top]:slide-in-from-bottom-[4px] data-[placement=bottom]:slide-in-from-top-[4px]'>
                          {displayValue(api.value[index] ?? thumbValue)}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      thumbEl
                    )}
                  </Fragment>
                );
              })}
              {marks && marks.length > 0 && (
                <ArkSlider.MarkerGroup
                  data-slot='slider-marker-group'
                  className={sliderMarkerGroupClassNames}
                >
                  {marks.map(mark => (
                    <ArkSlider.Marker
                      key={mark.value}
                      value={mark.value}
                      data-slot='slider-marker'
                      className={sliderMarkerClassNames}
                      // Click-to-jump: move the nearest thumb onto this tick
                      // (requirements §6.3). Keyboard equivalent is arrow-stepping
                      // through values (§7.2), so ticks are not separate tab stops.
                      onClick={() =>
                        api.setThumbValue(nearestThumbIndex(api.value, mark.value), mark.value)
                      }
                    >
                      {mark.label}
                    </ArkSlider.Marker>
                  ))}
                </ArkSlider.MarkerGroup>
              )}
            </ArkSlider.Control>
          );

          if (!input) return control;

          // Inline value Input(s): single → right; range → min left, max right.
          return (
            <div data-slot='slider-input-row' className={sliderInputRowClassNames}>
              {isRange && (
                <SliderValueInput
                  api={api}
                  index={0}
                  id={`${inputBaseId}-0`}
                  disabled={isDisabled}
                  error={isInvalid}
                  aria-label={inputLabel(0)}
                  data-testid={slotId('input', 0)}
                />
              )}
              {control}
              <SliderValueInput
                api={api}
                index={isRange ? 1 : 0}
                id={`${inputBaseId}-${isRange ? 1 : 0}`}
                disabled={isDisabled}
                error={isInvalid}
                aria-label={inputLabel(isRange ? 1 : 0)}
                data-testid={slotId('input', isRange ? 1 : 0)}
              />
            </div>
          );
        }}
      </ArkSlider.Context>
    </ArkSlider.Root>
  );
};

Slider.displayName = 'Slider';
