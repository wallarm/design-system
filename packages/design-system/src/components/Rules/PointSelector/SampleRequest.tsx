import type { FC } from 'react';
import {
  type RuleContext,
  type SampleToken,
  type SampleTokenRole,
  type SampleValue,
  type Segment,
  sampleMessage,
} from '@wallarm-org/rules-lib';
import { useTestId } from '../../../utils/testId';

export interface SampleRequestProps {
  segments: readonly Segment[];
  context: RuleContext;
  /** What the condition looks for; absent: the value as a placeholder. */
  value?: SampleValue;
}

const ROLE_CLASS: Record<SampleTokenRole, string> = {
  '': '',
  ph: 'italic text-syntax-comment',
  str: 'text-syntax-string',
  key: 'text-syntax-property',
  fn: 'text-syntax-function',
  hname: 'text-syntax-attr-name',
};

const tokenClass = (t: SampleToken): string =>
  t.highlight === 2
    ? 'rounded-4 bg-syntax-highlight-brand-highlight px-2 text-syntax-highlight-brand-code'
    : ROLE_CLASS[t.role];

/**
 * Where the value sits in a message, drawn as a sample request (or response):
 * only what the point names is written out, the rest are ‹placeholders›, and
 * the value the condition looks at is highlighted. Styled as a DS code snippet.
 */
export const SampleRequest: FC<SampleRequestProps> = ({ segments, context, value }) => {
  const testId = useTestId('sample');
  const lines = sampleMessage(segments, context, value);
  const title = context === 'http_response' ? 'Sample response' : 'Sample request';
  return (
    <figure
      data-slot='sample-request'
      data-testid={testId}
      className='code-snippet-bg m-0 flex flex-col overflow-hidden rounded-8 font-mono text-syntax-no-syntax'
      aria-label={title}
    >
      <figcaption className='border-b border-border-primary-light px-12 py-6 font-sans text-text-secondary text-xs'>
        {title}
      </figcaption>
      <div className='overflow-x-auto py-8 text-xs'>
        {lines.map((line, i) => (
          // Lines are positional: the sample is rebuilt whole, never reordered.
          // biome-ignore lint/suspicious/noArrayIndexKey: positional lines
          <div key={i} className='flex min-h-20 items-center'>
            <span className='w-32 shrink-0 select-none pr-12 text-right text-syntax-comment'>
              {i + 1}
            </span>
            <span className='whitespace-pre pr-12'>
              {line.map((t, k) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: positional tokens
                <span key={k} className={tokenClass(t)}>
                  {t.text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
};

SampleRequest.displayName = 'SampleRequest';
