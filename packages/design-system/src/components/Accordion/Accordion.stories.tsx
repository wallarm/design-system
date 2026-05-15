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
    docs: {
      description: {
        component:
          'Accordion compound component built on Ark UI. Use `primary`/`secondary` for lightweight inline collapse, `section` for bordered panels. Pair `section` with `AccordionActions` to render buttons next to the toggle without nesting them inside the trigger.',
      },
    },
  },
  args: { onValueChange: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'section'],
    },
    multiple: { control: 'boolean' },
    collapsible: { control: 'boolean' },
  },
} satisfies Meta<typeof Accordion>;

export default meta;

const sampleText =
  'The accordion component delivers large amounts of content in a small space through progressive disclosure. The user gets key details about the underlying content and can choose to expand that content within the constraints of the accordion.';

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

export const LongTitle: StoryFn<AccordionProps> = args => (
  <div className='w-320'>
    <Accordion {...args} variant='section' data-testid='accordion-long-title'>
      <AccordionItem value='1'>
        <AccordionTrigger>
          A really long title that should truncate gracefully without breaking the layout
        </AccordionTrigger>
        <AccordionContent>
          <Text>{sampleText}</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

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
