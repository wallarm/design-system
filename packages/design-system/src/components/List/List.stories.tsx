import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { List } from './List';
import { ListIcon } from './ListIcon';
import { ListItem } from './ListItem';

const DESCRIPTION = [
  'A semantic `ul` or `ol` with its spacing and markers under control — reach for `ordered` only when the sequence matters, and for a `Table` as soon as each item carries fields of its own.',
  'Markers are off by default and `role="list"` is set either way, so a list without bullets is still a list to a screen reader.',
].join(' ');

const meta = {
  title: 'Data Display/List',
  component: List,
  subcomponents: {
    ListItem,
    ListIcon,
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof List>;

export default meta;

/**
 * The default: unordered, no marker, 4px between items — a plain vertical group that
 * still announces itself as a list.
 */
export const Basic: StoryFn<typeof meta> = () => (
  <List>
    <ListItem>First item</ListItem>
    <ListItem>Second item</ListItem>
    <ListItem>Third item</ListItem>
  </List>
);

/**
 * `variant='ordered'` changes the element to `ol`; the numbers themselves come from
 * `marker='decimal'`, which is a separate decision from the element.
 */
export const Ordered: StoryFn<typeof meta> = () => (
  <List variant='ordered' marker='decimal'>
    <ListItem>First step</ListItem>
    <ListItem>Second step</ListItem>
    <ListItem>Third step</ListItem>
  </List>
);

/**
 * `marker='disc'` turns the bullets on and indents the list by 24px to make room for them.
 */
export const WithDisc: StoryFn<typeof meta> = () => (
  <List marker='disc'>
    <ListItem>Apples</ListItem>
    <ListItem>Bananas</ListItem>
    <ListItem>Cherries</ListItem>
  </List>
);

/**
 * `ListIcon` puts a meaningful glyph where the marker would be, coloured by what the row
 * says; `ListItem` is a flex row, so the icon and its text share a baseline.
 */
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

/**
 * Three of the seven spacing steps. The gap sits between items only, so a wrapped item
 * keeps its own lines tight while the list stays loose.
 */
export const Spacing: StoryFn<typeof meta> = () => (
  <div className='flex gap-48'>
    <div>
      <p className='sb-annotation mb-8'>spacing=0</p>
      <List spacing={0}>
        <ListItem>Item A</ListItem>
        <ListItem>Item B</ListItem>
        <ListItem>Item C</ListItem>
      </List>
    </div>
    <div>
      <p className='sb-annotation mb-8'>spacing=8</p>
      <List spacing={8}>
        <ListItem>Item A</ListItem>
        <ListItem>Item B</ListItem>
        <ListItem>Item C</ListItem>
      </List>
    </div>
    <div>
      <p className='sb-annotation mb-8'>spacing=16</p>
      <List spacing={16}>
        <ListItem>Item A</ListItem>
        <ListItem>Item B</ListItem>
        <ListItem>Item C</ListItem>
      </List>
    </div>
  </div>
);
