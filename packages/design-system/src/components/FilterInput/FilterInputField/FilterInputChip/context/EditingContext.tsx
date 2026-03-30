import {
  createContext,
  type FC,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useContext,
} from 'react';
import type { ChipSegment } from '../FilterInputChip';

export interface EditingContextValue {
  editingChipId: string | null;
  editingSegment: ChipSegment | null;
  segmentFilterText: string;
  onSegmentFilterChange: (text: string) => void;
  onSegmentEditKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onSegmentEditBlur: (e: FocusEvent<HTMLInputElement>) => void;
}

const EditingCtx = createContext<EditingContextValue | null>(null);

export const EditingProvider: FC<EditingContextValue & { children: ReactNode }> = ({
  children,
  ...value
}) => <EditingCtx.Provider value={value}>{children}</EditingCtx.Provider>;

export const useEditingContext = () => useContext(EditingCtx);
