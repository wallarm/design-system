import { CHIP_ID_PATTERN } from './constants';

/** Map a chip ID (e.g. "chip-2") back to condition index */
export const chipIdToConditionIndex = (chipId: string): number | null => {
  const match = chipId.match(CHIP_ID_PATTERN);
  return match ? Number(match[1]) : null;
};
