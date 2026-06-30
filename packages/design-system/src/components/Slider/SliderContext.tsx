import { createContext, type RefObject, useContext } from 'react';
import type { SliderMark } from './types';

export interface SliderRootContextValue {
  /** True when the value has 2+ entries (range) — drives slot-naming + label defaults. */
  isRange: boolean;
  /** Resolved invalid state (own `error` || Field `invalid`) — for sub-part error styling. */
  invalid: boolean;
  /** Resolved disabled state (own `disabled` ?? Field `disabled`). */
  disabled: boolean;
  /** Field help/error id to announce on the thumb (`aria-describedby`). */
  ariaDescribedby?: string;
  /** Field label id — fallback accessible name for a single thumb with no explicit label. */
  fieldLabelId?: string;
  /** Live marks published by `<SliderMarks>`; read for ordinal display + `aria-valuetext`. */
  marksRef: RefObject<SliderMark[]>;
  /** Called by `<SliderMarks>` to publish its marks to the root. */
  registerMarks: (marks: SliderMark[]) => void;
}

const SliderRootContext = createContext<SliderRootContextValue | null>(null);

export const SliderRootContextProvider = SliderRootContext.Provider;

export const useSliderRootContext = (): SliderRootContextValue => {
  const context = useContext(SliderRootContext);
  if (!context) throw new Error('Slider sub-components must be rendered inside <Slider>.');
  return context;
};
