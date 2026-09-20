import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useCopyable } from './CopyableContext';

export interface CopyableLabelProps {
  /** Label shown in the idle state */
  idle: string;
  /** Label shown after a successful copy (default: "Copied") */
  copied?: string;
  className?: string;
}

/**
 * Width-stable label swap driven by the parent `<Copyable>` state.
 *
 * Both labels are rendered in the same CSS-grid cell so the element always
 * occupies the width of the wider string. The inactive label is visually
 * hidden but still contributes to layout.
 *
 * Must be rendered inside a `<Copyable>` tree.
 */
export const CopyableLabel: FC<CopyableLabelProps> = ({
  idle,
  copied: copiedText = 'Copied',
  className,
}) => {
  const { copied } = useCopyable();

  return (
    <span
      data-slot='copyable-label'
      className={cn('inline-grid [&>*]:col-start-1 [&>*]:row-start-1', className)}
    >
      <span aria-hidden={copied || undefined} className={copied ? 'invisible' : undefined}>
        {idle}
      </span>
      <span aria-hidden={!copied || undefined} className={!copied ? 'invisible' : undefined}>
        {copiedText}
      </span>
    </span>
  );
};

CopyableLabel.displayName = 'CopyableLabel';
