import { createContext, useContext } from 'react';

const TREE_DEFAULT_INDENT = 24;

export interface TreeDepthContextValue {
  depth: number;
  indent: number;
  gap: number | undefined;
}

const TreeDepthContext = createContext<TreeDepthContextValue>({
  depth: 0,
  indent: TREE_DEFAULT_INDENT,
  gap: undefined,
});

export const TreeDepthProvider = TreeDepthContext.Provider;

export function useTreeDepth(): number {
  return useContext(TreeDepthContext).depth;
}

export function useTreeIndent(): number {
  return useContext(TreeDepthContext).indent;
}

export function useTreeGap(): number | undefined {
  return useContext(TreeDepthContext).gap;
}

export { TREE_DEFAULT_INDENT };
