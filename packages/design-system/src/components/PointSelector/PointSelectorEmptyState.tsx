import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Text } from '../Text';

export interface PointSelectorEmptyStateProps {
  /** Called when example is clicked - receives canonical point string to parse */
  onSelectExample?: (point: string) => void;
}

interface Example {
  label: string;
  description: string;
  /** Canonical point string in Star notation */
  point: string;
}

/**
 * Example points demonstrating common patterns.
 * These are canonical Star notation strings that SDK can parse.
 */
const EXAMPLES: Example[] = [
  {
    label: 'Request header value',
    description: 'Match Authorization header',
    point: "[http:header]['authorization']",
  },
  {
    label: 'JSON body field',
    description: 'Match user.email in request body',
    point: "[http:body][format:json]['user']['email']",
  },
  {
    label: 'Query parameter',
    description: 'Match ?id= value',
    point: "[http:query][format:form]['id']",
  },
  {
    label: 'Path segment',
    description: 'Match /api/users/[id]',
    point: '[http:path][1]',
  },
];

/**
 * PointSelectorEmptyState Component
 *
 * Rich empty state with examples shown when no segments chosen.
 * Helps users understand where to start.
 */
export const PointSelectorEmptyState: FC<PointSelectorEmptyStateProps> = ({ onSelectExample }) => {
  const testId = useTestId('empty-state');

  return (
    <div
      data-slot='point-selector-empty-state'
      data-testid={testId}
      className='flex flex-col gap-12 p-8'
    >
      <div className='flex flex-col gap-8 px-4'>
        <Text size='sm' weight='semibold'>
          Build a point to match values in requests
        </Text>
        <Text size='xs' color='secondary'>
          Choose where the value is located in the request (header, body, query, path, etc.)
        </Text>
      </div>

      <div className='flex flex-col gap-8'>
        <Text size='xs' weight='medium' color='secondary' className='px-4'>
          Common patterns:
        </Text>
        <div className='grid gap-6'>
          {EXAMPLES.map((example, i) => (
            <div
              key={example.point}
              className='flex items-start justify-between gap-12 rounded-8 border border-border-primary-light bg-bg-canvas p-12 hover:bg-bg-surface-1'
            >
              <div className='flex flex-col gap-4'>
                <Text size='sm' weight='medium'>
                  {example.label}
                </Text>
                <Text size='xs' color='secondary'>
                  {example.description}
                </Text>
                <code className='font-mono text-xs text-text-brand'>{example.point}</code>
              </div>
              {onSelectExample && (
                <Button
                  variant='outline'
                  color='neutral'
                  size='small'
                  onClick={() => onSelectExample(example.point)}
                  data-testid={`example-${i}`}
                >
                  Try
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='flex items-center justify-between border-t border-border-primary-light pt-12 px-4'>
        <Text size='xs' color='secondary'>
          Start typing to filter options
        </Text>
        <div className='flex items-center gap-4'>
          <Text size='xs' color='secondary'>
            Press
          </Text>
          <kbd className='rounded-4 bg-bg-surface-1 px-6 py-2 font-mono text-xs'>?</kbd>
          <Text size='xs' color='secondary'>
            for keyboard shortcuts
          </Text>
        </div>
      </div>
    </div>
  );
};

PointSelectorEmptyState.displayName = 'PointSelectorEmptyState';
