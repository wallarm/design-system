import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { List } from './List';
import { ListIcon } from './ListIcon';
import { ListItem } from './ListItem';

const meta = {
  title: 'Data Display/List',
  component: List,
  subcomponents: {
    ListItem,
    ListIcon,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Semantic list primitive for presenting items as ordered or unordered lists. ' +
          'Compose with ListItem for each entry and optionally ListIcon for a leading icon slot. ' +
          'No opinionated styling — consumers provide their own content, icons, and colours.',
      },
    },
  },
} satisfies Meta<typeof List>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <List>
    <ListItem>First item</ListItem>
    <ListItem>Second item</ListItem>
    <ListItem>Third item</ListItem>
  </List>
);

export const Ordered: StoryFn<typeof meta> = () => (
  <List variant='ordered' marker='decimal'>
    <ListItem>First step</ListItem>
    <ListItem>Second step</ListItem>
    <ListItem>Third step</ListItem>
  </List>
);

export const WithDisc: StoryFn<typeof meta> = () => (
  <List marker='disc'>
    <ListItem>Apples</ListItem>
    <ListItem>Bananas</ListItem>
    <ListItem>Cherries</ListItem>
  </List>
);

export const WithIcons: StoryFn<typeof meta> = () => (
  <List>
    <ListItem>
      <ListIcon className='text-text-success'>&#10003;</ListIcon>
      Completed task
    </ListItem>
    <ListItem>
      <ListIcon className='text-text-warning'>&#9888;</ListIcon>
      Pending review
    </ListItem>
    <ListItem>
      <ListIcon className='text-text-error'>&#10007;</ListIcon>
      Failed check
    </ListItem>
  </List>
);

export const Spacing: StoryFn<typeof meta> = () => (
  <div className='flex gap-48'>
    <div>
      <p className='mb-8 text-text-secondary text-sm'>spacing=0</p>
      <List spacing={0}>
        <ListItem>Item A</ListItem>
        <ListItem>Item B</ListItem>
        <ListItem>Item C</ListItem>
      </List>
    </div>
    <div>
      <p className='mb-8 text-text-secondary text-sm'>spacing=8</p>
      <List spacing={8}>
        <ListItem>Item A</ListItem>
        <ListItem>Item B</ListItem>
        <ListItem>Item C</ListItem>
      </List>
    </div>
    <div>
      <p className='mb-8 text-text-secondary text-sm'>spacing=16</p>
      <List spacing={16}>
        <ListItem>Item A</ListItem>
        <ListItem>Item B</ListItem>
        <ListItem>Item C</ListItem>
      </List>
    </div>
  </div>
);
