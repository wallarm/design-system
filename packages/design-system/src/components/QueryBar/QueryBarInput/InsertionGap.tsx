import type { FC } from 'react';

interface InsertionGapProps {
  onClick: () => void;
}

/** Thin clickable zone between chips for caret placement. */
export const InsertionGap: FC<InsertionGapProps> = ({ onClick }) => (
  <button
    type='button'
    className='group relative z-20 flex h-28 w-8 shrink-0 cursor-text items-center justify-center'
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    tabIndex={-1}
    aria-hidden='true'
  >
    <div className='h-16 w-1 rounded-full bg-transparent transition-colors group-hover:bg-border-primary/50' />
  </button>
);

InsertionGap.displayName = 'InsertionGap';
