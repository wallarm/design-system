/** A tick mark: a position on the scale with an optional text label. */
export interface SliderMark {
  /** The value this tick sits at (within `[min, max]`). */
  value: number;
  /**
   * Optional label rendered below the tick. For ordinal scales (e.g. Low/Medium/High)
   * the label also becomes the thumb's `aria-valuetext` unless a custom
   * `getAriaValueText` is supplied.
   */
  label?: string;
}
