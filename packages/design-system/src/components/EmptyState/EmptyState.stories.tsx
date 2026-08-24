import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Circle, Zap } from '../../icons';
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

const DESCRIPTION = [
  'Says what an empty region is missing and what to do next — reach for `Skeleton` or `Loader` while the data is still loading, and an `Alert` or an error page when the page failed rather than came back empty.',
  '`type` follows why the region is empty: `collection-empty` for a first-use or genuinely empty collection, where a create button belongs; `no-results` for a search or filter that matched nothing, where the only useful action is clearing it.',
].join(' ');

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
        component: DESCRIPTION,
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

/** The full form, 256–560px wide: illustration, title, description, actions, and a learn-more `EmptyStateLink`. Titles read as an invitation rather than an accusation — 'Explore your APIs', not 'You have no APIs'. */
export const CollectionEmpty: StoryFn<EmptyStateProps> = args => (
  <EmptyState {...args}>
    <EmptyStateIllustration>
      <Circle size='lg' />
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

/** The compact 240px form for a search or filter that matched nothing — its action clears or widens the query, and never offers to create something instead. */
export const NoResults: StoryFn<EmptyStateProps> = args => (
  <EmptyState {...args}>
    <EmptyStateIllustration>
      <Zap size='lg' />
    </EmptyStateIllustration>
    <EmptyStateMessage>
      <EmptyStateTitle>No attacks found</EmptyStateTitle>
      <EmptyStateDescription>Try to apply different filter or reset it.</EmptyStateDescription>
    </EmptyStateMessage>
    <EmptyStateActions>
      <Button size='medium' variant='outline' color='neutral'>
        Reset filters
      </Button>
    </EmptyStateActions>
  </EmptyState>
);
NoResults.args = {
  type: 'no-results',
};

/** Title and description alone. The illustration is decorative, so drop it wherever room is short: the message has to stand on its own anyway. */
export const Minimal: StoryFn<EmptyStateProps> = args => (
  <EmptyState {...args}>
    <EmptyStateMessage>
      <EmptyStateTitle>Nothing here</EmptyStateTitle>
      <EmptyStateDescription>This collection is empty.</EmptyStateDescription>
    </EmptyStateMessage>
  </EmptyState>
);

const emptyCollection = createListCollection({ items: [] });

/** The compact form in its real homes — a chart card with no data, and a `Select` whose option list came back empty. An empty inside a container stays action-light however it got that way. */
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
