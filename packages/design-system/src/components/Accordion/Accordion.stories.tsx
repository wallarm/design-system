import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { NumericBadge } from '../NumericBadge';
import { Text } from '../Text';
import { Accordion, type AccordionProps } from './Accordion';
import { AccordionActions } from './AccordionActions';
import { AccordionContent } from './AccordionContent';
import { AccordionItem } from './AccordionItem';
import { AccordionTrigger } from './AccordionTrigger';

const DESCRIPTION = [
  'Stacks sections behind their own headers and opens each on demand — reach for `Tabs` when a few primary sections get switched between often, and leave content on the page when people read most of it anyway.',
  '`primary` and `secondary` are inline rows for grouping; `section` is the bordered panel, and the only variant with room for `AccordionActions`.',
].join(' ');

const meta = {
  title: 'Data Display/Accordion',
  component: Accordion,
  subcomponents: {
    AccordionItem,
    AccordionTrigger,
    AccordionActions,
    AccordionContent,
  },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  args: { onValueChange: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'section'],
    },
    multiple: { control: 'boolean' },
    collapsible: { control: 'boolean' },
    disabled: { control: 'boolean' },
    defaultValue: { control: 'object' },
  },
} satisfies Meta<typeof Accordion>;

export default meta;

const sampleText =
  'The accordion component delivers large amounts of content in a small space through progressive disclosure. The user gets key details about the underlying content and can choose to expand that content within the constraints of the accordion.';

/**
 * The default variant — a 40px row with the chevron ahead of the title and a hover
 * fill across the full width. Opening one section closes the other: `multiple` is
 * off unless you ask for it.
 */
export const Primary: StoryFn<AccordionProps> = args => (
  <div className='w-440'>
    <Accordion {...args} variant='primary' data-testid='accordion-primary'>
      <AccordionItem value='1'>
        <AccordionTrigger>Title</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='2'>
        <AccordionTrigger>Title</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

/**
 * A 24px row in small medium-weight muted type with no hover fill, for dense or
 * nested groups where the header should sit behind the content it labels.
 */
export const Secondary: StoryFn<AccordionProps> = args => (
  <div className='w-440'>
    <Accordion {...args} variant='secondary' data-testid='accordion-secondary'>
      <AccordionItem value='1'>
        <AccordionTrigger>Title</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='2'>
        <AccordionTrigger>Title</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

/**
 * `section` draws each item as a bordered panel row — title left, chevron right —
 * and the title takes inline content, here a `NumericBadge` carrying a count.
 */
export const Section: StoryFn<AccordionProps> = args => (
  <div className='w-440'>
    <Accordion {...args} variant='section' defaultValue={['1']} data-testid='accordion-section'>
      <AccordionItem value='1'>
        <AccordionTrigger>
          Title <NumericBadge>2</NumericBadge>
        </AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='2'>
        <AccordionTrigger>
          Title <NumericBadge>2</NumericBadge>
        </AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

/**
 * `AccordionActions` renders beside the trigger rather than inside it, so buttons in
 * the header act on the section without toggling it open.
 */
export const SectionWithActions: StoryFn<AccordionProps> = args => (
  <div className='w-560'>
    <Accordion
      {...args}
      variant='section'
      defaultValue={['1']}
      data-testid='accordion-section-actions'
    >
      <AccordionItem value='1'>
        <AccordionTrigger>
          Title <NumericBadge>2</NumericBadge>
        </AccordionTrigger>
        <AccordionActions>
          <Button variant='ghost' size='small'>
            Delete
          </Button>
          <Button variant='outline' size='small'>
            Edit
          </Button>
        </AccordionActions>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='2'>
        <AccordionTrigger>
          Title <NumericBadge>2</NumericBadge>
        </AccordionTrigger>
        <AccordionActions>
          <Button variant='ghost' size='small'>
            Delete
          </Button>
          <Button variant='outline' size='small'>
            Edit
          </Button>
        </AccordionActions>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

const longTitleText =
  'A really long title that should truncate gracefully without breaking the layout';

/**
 * Titles truncate to one line rather than wrapping — the row is a fixed height, so
 * reword a long header instead of relying on the ellipsis.
 */
export const LongTitlePrimary: StoryFn<AccordionProps> = args => (
  <div className='w-320'>
    <Accordion {...args} variant='primary' data-testid='accordion-long-title-primary'>
      <AccordionItem value='1'>
        <AccordionTrigger>{longTitleText}</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

/**
 * The same 320px column at `secondary` size, where smaller type and no row padding
 * leave a little more of the title visible before the ellipsis.
 */
export const LongTitleSecondary: StoryFn<AccordionProps> = args => (
  <div className='w-320'>
    <Accordion {...args} variant='secondary' data-testid='accordion-long-title-secondary'>
      <AccordionItem value='1'>
        <AccordionTrigger>{longTitleText}</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

/**
 * `multiple` keeps several sections open at once, for when people reference sections
 * on their own terms — not when the sections have to be read side by side, which is
 * a layout rather than an accordion.
 */
export const Multiple: StoryFn<AccordionProps> = args => (
  <div className='w-440'>
    <Accordion
      {...args}
      variant='section'
      multiple
      defaultValue={['1', '2']}
      data-testid='accordion-multiple'
    >
      <AccordionItem value='1'>
        <AccordionTrigger>Section A</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='2'>
        <AccordionTrigger>Section B</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='3'>
        <AccordionTrigger>Section C</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

/**
 * `disabled` on a single `AccordionItem` fades the row and blocks its toggle while the
 * rest stay live; the same prop on `Accordion` locks every row at once.
 */
export const Disabled: StoryFn<AccordionProps> = args => (
  <div className='w-440'>
    <Accordion {...args} variant='primary' data-testid='accordion-disabled'>
      <AccordionItem value='1'>
        <AccordionTrigger>Available</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='2' disabled>
        <AccordionTrigger>Disabled item</AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);
