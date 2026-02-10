import type { FC, ReactNode } from 'react';
import { TabsTrigger } from '../Tabs';

export type CodeSnippetTabProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
};

export const CodeSnippetTab: FC<CodeSnippetTabProps> = ({ value, disabled, children }) => (
  <TabsTrigger value={value} disabled={disabled}>
    {children}
  </TabsTrigger>
);

CodeSnippetTab.displayName = 'CodeSnippetTab';
