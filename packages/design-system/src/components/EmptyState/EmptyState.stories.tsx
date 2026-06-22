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
          'EmptyStateDescription, EmptyStateActions, EmptyStateLink.',
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

export const Minimal: StoryFn<EmptyStateProps> = args => (
  <EmptyState {...args}>
    <EmptyStateMessage>
      <EmptyStateTitle>Nothing here</EmptyStateTitle>
      <EmptyStateDescription>This collection is empty.</EmptyStateDescription>
    </EmptyStateMessage>
  </EmptyState>
);

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
