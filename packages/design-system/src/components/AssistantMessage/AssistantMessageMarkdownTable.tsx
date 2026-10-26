import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { tableContainerVariants } from '../Table/classes';
import {
  assistantMessageMarkdownTableGridVariants,
  assistantMessageMarkdownTableVariants,
} from './classes';

export interface AssistantMessageMarkdownTableProps
  extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}

/** Markdown table: the DS table frame and cells (`Table/classes`) on a plain `<table>`. Not in Figma. */
export const AssistantMessageMarkdownTable: FC<AssistantMessageMarkdownTableProps> = ({
  ref,
  className,
  children,
  'data-testid': testIdProp,
  ...props
}) => (
  <div
    {...props}
    ref={ref}
    data-slot='assistant-message-markdown-table'
    data-testid={useTestId('table', testIdProp)}
    className={cn(tableContainerVariants(), assistantMessageMarkdownTableVariants(), className)}
  >
    <table className={assistantMessageMarkdownTableGridVariants()}>{children}</table>
  </div>
);

AssistantMessageMarkdownTable.displayName = 'AssistantMessageMarkdownTable';
