import type { FC } from 'react';
import * as z from 'zod';
import { Button } from '@wallarm-org/design-system/Button';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateMessage,
  EmptyStateTitle,
  type EmptyStateType,
} from '@wallarm-org/design-system/EmptyState';
import { Shapes } from '@wallarm-org/design-system/icons/Shapes';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { allOf, defineComponent } from '../core/define';

/** The View picks the picture, never the agent; the compact `no-results` form has none (DS spec). */
const ILLUSTRATION: Record<EmptyStateType, FC | null> = {
  'collection-empty': Shapes,
  'no-results': null,
};

export const EmptyStateComponent = defineComponent({
  name: 'EmptyState',
  description:
    'Says a list, table, chart or search has nothing to show and why. Use it instead of an empty ' +
    'Table or chart. type: "collection-empty" (default) when there is no data yet or a page-level ' +
    'filter matched nothing; "no-results" for a compact inline empty inside a card. actionLabel ' +
    'adds a button that fires press, e.g. to reset filters.',
  props: z.object({
    title: z.string().refine(s => s.trim() !== '', 'title must not be blank'),
    description: z.string().optional(),
    type: z.enum(allOf<EmptyStateType>()(['collection-empty', 'no-results'])).optional(),
    actionLabel: z.string().optional(),
  }),
  events: ['press'],
  Skeleton: () => <Skeleton width='320px' height='160px' rounded={12} transparent={false} />,
  View: ({ props, emit }) => {
    const type = props.type ?? 'collection-empty';
    const Icon = ILLUSTRATION[type];
    return (
      <EmptyState type={type}>
        {Icon && (
          <EmptyStateIllustration>
            <Icon />
          </EmptyStateIllustration>
        )}
        <EmptyStateMessage>
          <EmptyStateTitle>{props.title}</EmptyStateTitle>
          {props.description && <EmptyStateDescription>{props.description}</EmptyStateDescription>}
        </EmptyStateMessage>
        {props.actionLabel?.trim() && (
          <EmptyStateActions>
            <Button size='medium' variant='outline' color='neutral' onClick={() => emit('press')}>
              {props.actionLabel}
            </Button>
          </EmptyStateActions>
        )}
      </EmptyState>
    );
  },
});
