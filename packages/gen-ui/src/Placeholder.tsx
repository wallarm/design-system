import type { FC } from 'react';

/**
 * Stands in for a component that isn't renderable yet, so a streaming layout keeps its shape: one
 * the agent referenced but hasn't sent, or one whose props don't match its schema yet (data still
 * on its way, or a mistake). A dashed box labelled with the id; the reasons go in a tooltip.
 */
export const Placeholder: FC<{ id: string; detail?: readonly string[] }> = ({ id, detail }) => (
  <div
    data-gen-ui-placeholder={id}
    aria-busy='true'
    title={detail?.join('\n')}
    className='flex min-h-80 w-full items-start rounded-12 border border-dashed border-border-primary p-8 font-mono text-xs text-text-secondary'
  >
    {id}
  </div>
);
