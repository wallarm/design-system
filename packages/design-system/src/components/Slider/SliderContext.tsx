import { createContext, useContext } from 'react';
import type { SliderMark } from './types';

export interface SliderRootContextValue {
  /** True when the value has 2+ entries (range) — drives slot-naming + label defaults. */
  isRange: boolean;
  /** Expected thumb count (`value`/`defaultValue` length) — for the dev thumb-count guard. */
  thumbCount: number;
  /** Resolved invalid state (own `error` || Field `invalid`) — for sub-part error styling. */
  invalid: boolean;
  /** Resolved disabled state (own `disabled` ?? Field `disabled`). */
  disabled: boolean;
  /** Field help/error id to announce on the thumb (`aria-describedby`). */
  ariaDescribedby?: string;
  /** Field label id — fallback accessible name for a single thumb with no explicit label. */
  fieldLabelId?: string;
  /**
   * Marks published by `<SliderMarks>`, mirrored into root state so `getAriaValueText`
   * (and `SliderValue` / the thumb tooltip) resolve ordinal labels. Empty when there
   * are no marks.
   */
  marks: SliderMark[];
  /** Called by `<SliderMarks>` to publish its marks to the root (no-op if unchanged). */
  registerMarks: (marks: SliderMark[]) => void;
}

const SliderRootContext = createContext<SliderRootContextValue | null>(null);

export const SliderRootContextProvider = SliderRootContext.Provider;

export const useSliderRootContext = (): SliderRootContextValue => {
  const context = useContext(SliderRootContext);
  if (!context) throw new Error('Slider sub-components must be rendered inside <Slider>.');
  return context;
};
