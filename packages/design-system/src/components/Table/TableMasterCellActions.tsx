import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface TableMasterCellActionsProps {
  children: ReactNode;
  onWidthChange?: (width: number) => void;
}

export const TableMasterCellActions = ({
  children,
  onWidthChange,
}: TableMasterCellActionsProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onWidthChange) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) onWidthChange(el.offsetWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onWidthChange]);

  return (
    <div
      ref={ref}
      className={cn('absolute top-0 right-0 h-full', 'flex items-start pt-6 pr-6 pl-4 gap-2')}
    >
      {children}
    </div>
  );
};

TableMasterCellActions.displayName = 'TableMasterCellActions';
