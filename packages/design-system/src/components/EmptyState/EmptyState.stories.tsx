import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ScanLine, Shapes, Zap } from '../../icons';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Field } from '../Field/Field';
import { FieldLabel } from '../Field/FieldLabel';
import { Select, SelectButton, SelectContent, SelectPositioner } from '../Select';
import { HStack, VStack } from '../Stack';
import { EmptyState, type EmptyStateProps } from './EmptyState';
import { EmptyStateActions } from './EmptyStateActions';
import { EmptyStateDescription } from './EmptyStateDescription';
import { EmptyStateIllustration } from './EmptyStateIllustration';
import { EmptyStateLink } from './EmptyStateLink';
import { EmptyStateMessage } from './EmptyStateMessage';
import { EmptyStateTitle } from './EmptyStateTitle';

const meta = {
  title: 'Pages/EmptyState',
  component: EmptyState,
  subcomponents: {
    EmptyStateIllustration,
    EmptyStateMessage,
    EmptyStateTitle,
    EmptyStateDescription,
    EmptyStateActions,
    EmptyStateLink,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'EmptyState communicates that a space has no content — whether because a collection is empty, ' +
          'a search returned no matches, or a filter is too narrow. ' +
          'Use compound components: EmptyStateIllustration, EmptyStateMessage, EmptyStateTitle, ' +
          'EmptyStateDescription, EmptyStateActions, EmptyStateLink.\n\n' +
          '`type` picks the scale, and every slot follows it from context — no need to restate it on ' +
          'children. `collection-empty` is the page-level treatment: a medallion (a 36px raised tile ' +
          'holding a 20px icon), a pixel title, and room for actions plus a link. `no-results` is the ' +
          'compact inline treatment for a card, dropdown or select menu: 240px wide, with a 14px ' +
          'secondary title. An illustration always carries the medallion — there is no bare glyph.\n\n' +
          'Scale is not the same question as cause. A page-level "no filter matches" state still uses ' +
          '`collection-empty` — it just drops the create CTA and offers a neutral one instead.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['collection-empty', 'no-results'],
    },
    children: {
      control: false,
    },
    ref: {
      control: false,
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

export const CollectionEmpty: StoryFn<EmptyStateProps> = args => (
  <EmptyState {...args}>
    <EmptyStateIllustration>
      <Shapes />
    </EmptyStateIllustration>
    <EmptyStateMessage>
      <EmptyStateTitle>Title text goes here</EmptyStateTitle>
      <EmptyStateDescription>
        Description text explains what happened and what the user can do next.
        <br />
        One to two sentences maximum.
      </EmptyStateDescription>
    </EmptyStateMessage>
    <EmptyStateActions>
      <Button size='medium'>Reset filters</Button>
      <Button size='medium' variant='outline' color='neutral'>
        Refresh
      </Button>
    </EmptyStateActions>
    <EmptyStateLink href='#'>Link</EmptyStateLink>
  </EmptyState>
);
CollectionEmpty.args = {
  type: 'collection-empty',
};

/**
 * The page-level state for a search or filter that matched nothing. Same
 * `collection-empty` scale as an untouched collection — the difference is the
 * CTA: a neutral "get back to something" action, never a create action, because
 * the data exists and the query is what needs changing.
 */
export const NoFilterResults: StoryFn<EmptyStateProps> = args => (
  <EmptyState {...args}>
    <EmptyStateIllustration>
      <Zap />
    </EmptyStateIllustration>
    <EmptyStateMessage>
      <EmptyStateTitle>No attacks found</EmptyStateTitle>
      <EmptyStateDescription>Try to apply different filter or reset it.</EmptyStateDescription>
    </EmptyStateMessage>
    <EmptyStateActions>
      <Button size='medium' variant='outline' color='neutral'>
        Refresh
      </Button>
    </EmptyStateActions>
  </EmptyState>
);
NoFilterResults.args = {
  type: 'collection-empty',
};

/**
 * The compact state at its spec default: no icon, no actions — just the title
 * and subtitle. This is the shape most in-app empty states take.
 */
export const Minimal: StoryFn<EmptyStateProps> = args => (
  <EmptyState {...args}>
    <EmptyStateMessage>
      <EmptyStateTitle>No results</EmptyStateTitle>
      <EmptyStateDescription>Short description</EmptyStateDescription>
    </EmptyStateMessage>
  </EmptyState>
);
Minimal.args = {
  type: 'no-results',
};

const emptyCollection = createListCollection({ items: [] });

export const NoResultsExamples: StoryFn<EmptyStateProps> = () => (
  <HStack gap={32} align='start'>
    {/* In a chart card */}
    <Card className='w-[340px]'>
      <CardHeader>
        <CardTitle>Bar chart</CardTitle>
      </CardHeader>
      <CardContent className='flex items-center justify-center py-48'>
        <EmptyState type='no-results'>
          <EmptyStateMessage>
            <EmptyStateDescription>No data found for selected period</EmptyStateDescription>
          </EmptyStateMessage>
        </EmptyState>
      </CardContent>
    </Card>

    {/* In a select dropdown */}
    <VStack gap={4} className='w-[260px]'>
      <Field>
        <FieldLabel>Label</FieldLabel>
        <Select collection={emptyCollection}>
          <SelectButton placeholder='Select' />
          <SelectPositioner className='w-[260px]'>
            <SelectContent />
          </SelectPositioner>
        </Select>
      </Field>
    </VStack>
  </HStack>
);

/**
 * The medallion reads as a lit surface: a top-down gradient, a hairline border,
 * a soft drop shadow and an inner top highlight. Every layer resolves through
 * `--color-component-empty-state-medallion-*` and
 * `--shadow-empty-state-medallion`, so it holds up on both the card surface and
 * the slightly darker page surface it sits on — shown here side by side. Use the
 * toolbar theme switcher to check it in dark.
 */
export const Medallion: StoryFn<EmptyStateProps> = () => (
  <HStack gap={0} className='w-[330px] overflow-hidden rounded-16 border border-border-primary'>
    {(['bg-bg-surface-1', 'bg-bg-light-primary'] as const).map(surface => (
      <div key={surface} className={cn('flex flex-1 justify-center py-28', surface)}>
        <EmptyStateIllustration>
          <ScanLine />
        </EmptyStateIllustration>
      </div>
    ))}
  </HStack>
);
