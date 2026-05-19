import {
  SEGMENT_VARIANT,
  type SegmentVariant,
} from '../FilterInputField/FilterInputChip/segmentVariant';
import type { MenuState } from '../types';

/**
 * Open-menu state that corresponds to each chip segment. Used wherever an
 * inline-edit transition needs to (re)open the matching menu — segment
 * click, Backspace cascade, and the building-flow step-back from the main
 * input. Kept here so the mapping is defined once.
 */
export const SEGMENT_TO_MENU: Record<SegmentVariant, MenuState> = {
  [SEGMENT_VARIANT.attribute]: 'field',
  [SEGMENT_VARIANT.operator]: 'operator',
  [SEGMENT_VARIANT.value]: 'value',
};
