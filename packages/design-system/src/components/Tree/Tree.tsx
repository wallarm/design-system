import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import {
  TREE_BASE_PADDING,
  TreeDepthProvider,
  useTreeDepth,
  useTreeGap,
  useTreeIndent,
} from './TreeContext';

export interface TreeProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  indent?: number;
  gap?: number;
}

export const Tree: FC<TreeProps> = ({
  ref,
  children,
  indent,
  gap,
  'data-testid': testId,
  className,
  style,
  ...props
}) => {
  const parentDepth = useTreeDepth();
  const parentIndent = useTreeIndent();
  const parentGap = useTreeGap();

  const isRoot = parentDepth === 0;
  const resolvedIndent = indent ?? parentIndent;
  const resolvedGap = gap ?? parentGap;
  const depth = isRoot ? 0 : parentDepth;
  const lineLeft = isRoot
    ? resolvedIndent - TREE_BASE_PADDING
    : resolvedIndent - TREE_BASE_PADDING * 2;

  const content = (
    <div
      ref={ref}
      data-slot='tree'
      data-testid={testId}
      className={cn('relative flex flex-col', className)}
      style={{ gap: resolvedGap, ...style }}
      {...props}
    >
      <div
        className='absolute top-0 bottom-0 w-px bg-border-primary-light'
        style={{ left: lineLeft }}
      />
      <TreeDepthProvider value={{ depth: depth + 1, indent: resolvedIndent, gap: resolvedGap }}>
        {children}
      </TreeDepthProvider>
    </div>
  );

  if (testId !== undefined) {
    return <TestIdProvider value={testId}>{content}</TestIdProvider>;
  }

  return content;
};

Tree.displayName = 'Tree';
