import type { ReactNode } from 'react';

export interface TreeViewNode {
  id: string;
  icon?: ReactNode;
  label: ReactNode;
  action?: ReactNode;
  content?: ReactNode;
  children?: TreeViewNode[];
  collapsible?: boolean;
}
