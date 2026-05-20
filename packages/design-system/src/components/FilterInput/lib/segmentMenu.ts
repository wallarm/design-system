import {
  SEGMENT_VARIANT,
  type SegmentVariant,
} from '../FilterInputField/FilterInputChip/segmentVariant';
import type { MenuState } from '../types';

/** Open-menu state for each chip segment (segment click, Backspace cascade). */
export const SEGMENT_TO_MENU: Record<SegmentVariant, MenuState> = {
  [SEGMENT_VARIANT.attribute]: 'field',
  [SEGMENT_VARIANT.operator]: 'operator',
  [SEGMENT_VARIANT.value]: 'value',
};
