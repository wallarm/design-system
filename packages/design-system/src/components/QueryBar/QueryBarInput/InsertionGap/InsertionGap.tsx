import type { FC } from 'react';
import { insertionGapButton, insertionGapDivider } from './classes';

interface InsertionGapProps {
  onClick: () => void;
}

/** Thin clickable zone between chips for caret placement. */
export const InsertionGap: FC<InsertionGapProps> = ({ onClick }) => (
  <button
    type='button'
    className={insertionGapButton}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    tabIndex={-1}
    aria-hidden='true'
  >
    <div className={insertionGapDivider} />
  </button>
);

InsertionGap.displayName = 'InsertionGap';
