import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { useScrollSpy } from '../../hooks';
import { SegmentedTabs, SegmentedTabsList, SegmentedTabsTrigger } from '../SegmentedTabs';
import { Text } from '../Text';
import { TableOfContents, TableOfContentsItem, type TableOfContentsProps } from '.';

const DESCRIPTION = [
  'Lists the sections of one long page, such as a report, shows which one is being read and jumps to a section on click — reach for `Tabs` or `SegmentedTabs` when only one section shows at a time, and `Stepper` when the sections are steps of a flow.',
  'It never tracks scrolling itself: the page passes the active `value`, usually from the `useScrollSpy` hook, and the corner button switches to the Minimized view of dashes, whose popover opens on hover or tap.',
].join(' ');

const meta = {
  title: 'Navigation/TableOfContents',
  component: TableOfContents,
  subcomponents: { TableOfContentsItem },
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    value: { control: 'text', description: 'The active item’s value. Controlled only.' },
    view: {
      control: 'inline-radio',
      options: ['full', 'minimized'],
      description: 'Controlled view.',
    },
    defaultView: {
      control: 'inline-radio',
      options: ['full', 'minimized'],
      description: 'Uncontrolled initial view. Default `full`.',
    },
    title: { control: 'text', description: 'Header label and the nav’s accessible name.' },
  },
} satisfies Meta<typeof TableOfContents>;

export default meta;

type Story = StoryFn<typeof meta>;

const SECTIONS = [
  { id: 'tldr', label: 'TL;DR' },
  { id: 'findings', label: 'Findings' },
  { id: 'impact', label: 'Impact' },
  { id: 'remediation', label: 'Remediation' },
  { id: 'appendix', label: 'Appendix' },
] as const;

const LONG_LIST = Array.from({ length: 30 }, (_, i) => ({
  id: `section-${i + 1}`,
  label: `Section ${i + 1}`,
}));

const SECTION_IDS = SECTIONS.map(section => section.id);

/** The smallest set — one row per section, the active row marked on the rail; a click moves it. */
export const Basic: Story = (args: TableOfContentsProps) => {
  const [value, setValue] = useState('findings');
  return (
    <TableOfContents {...args} value={value} onValueChange={setValue} data-testid='toc'>
      {SECTIONS.map(section => (
        <TableOfContentsItem key={section.id} value={section.id}>
          {section.label}
        </TableOfContentsItem>
      ))}
    </TableOfContents>
  );
};

/** The page passes each `number` itself — nothing is counted — and it stays on the first line. */
export const Numbered: Story = () => {
  const [value, setValue] = useState('findings');
  return (
    <TableOfContents value={value} onValueChange={setValue} data-testid='toc'>
      <TableOfContentsItem value='tldr'>TL;DR</TableOfContentsItem>
      <TableOfContentsItem value='findings' number='1'>
        Findings
      </TableOfContentsItem>
      <TableOfContentsItem value='impact' number='2'>
        Impact
      </TableOfContentsItem>
      <TableOfContentsItem value='remediation' number='3'>
        Remediation
      </TableOfContentsItem>
    </TableOfContents>
  );
};

/** Two levels at most: `level={2}` indents a subsection under its parent on the same rail. */
export const Levels: Story = () => {
  const [value, setValue] = useState('critical');
  return (
    <TableOfContents value={value} onValueChange={setValue} data-testid='toc'>
      <TableOfContentsItem value='findings' number='1'>
        Findings
      </TableOfContentsItem>
      <TableOfContentsItem value='critical' number='1.1' level={2}>
        Critical
      </TableOfContentsItem>
      <TableOfContentsItem value='high' number='1.2' level={2}>
        High
      </TableOfContentsItem>
      <TableOfContentsItem value='impact' number='2'>
        Impact
      </TableOfContentsItem>
      <TableOfContentsItem value='scope' number='2.1' level={2}>
        Scope
      </TableOfContentsItem>
    </TableOfContents>
  );
};

/** A dash per section, longest for the active one; hover or tap the dashes to read the rows in a popover. */
export const Minimized: Story = () => {
  const [value, setValue] = useState('findings');
  return (
    <TableOfContents
      defaultView='minimized'
      value={value}
      onValueChange={setValue}
      data-testid='toc'
    >
      <TableOfContentsItem value='tldr'>TL;DR</TableOfContentsItem>
      <TableOfContentsItem value='findings' number='1'>
        Findings
      </TableOfContentsItem>
      <TableOfContentsItem value='critical' number='1.1' level={2}>
        Critical
      </TableOfContentsItem>
      <TableOfContentsItem value='impact' number='2'>
        Impact
      </TableOfContentsItem>
    </TableOfContents>
  );
};

/** Labels wrap to two lines, then end in an ellipsis; the rail grows with the row. */
export const LongLabels: Story = () => {
  const [value, setValue] = useState('short');
  return (
    <TableOfContents value={value} onValueChange={setValue} data-testid='toc'>
      <TableOfContentsItem value='short'>Summary</TableOfContentsItem>
      <TableOfContentsItem value='two-lines' number='1'>
        Attacks blocked by the filtering node
      </TableOfContentsItem>
      <TableOfContentsItem value='clamped' number='1.1' level={2}>
        Requests from the top ten source addresses that hit the API in the last thirty days
      </TableOfContentsItem>
    </TableOfContents>
  );
};

/** The list scrolls inside the height its parent gives it, while the header stays put. */
export const LongList: Story = () => {
  const [value, setValue] = useState('section-1');
  return (
    <div className='flex h-240'>
      <TableOfContents value={value} onValueChange={setValue} data-testid='toc'>
        {LONG_LIST.map(section => (
          <TableOfContentsItem key={section.id} value={section.id}>
            {section.label}
          </TableOfContentsItem>
        ))}
      </TableOfContents>
    </div>
  );
};

/** The usual wiring: `useScrollSpy` reads the scrolling container and feeds `value` and `scrollTo` back in. */
export const WithScrollSpy: Story = () => {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const { activeId, scrollTo } = useScrollSpy({ ids: SECTION_IDS, root, offset: 16 });
  return (
    <div className='flex h-320 gap-24'>
      <TableOfContents value={activeId} onValueChange={scrollTo} data-testid='toc'>
        {SECTIONS.map(section => (
          <TableOfContentsItem key={section.id} value={section.id}>
            {section.label}
          </TableOfContentsItem>
        ))}
      </TableOfContents>
      <div
        ref={setRoot}
        data-testid='toc-content'
        className='flex-1 overflow-y-auto rounded-8 border border-border-primary p-16'
      >
        {SECTIONS.map(section => (
          <section key={section.id} id={section.id} className='min-h-200 pb-16'>
            <Text size='lg' weight='medium'>
              {section.label}
            </Text>
            <Text color='secondary'>Body of the {section.label} section.</Text>
          </section>
        ))}
      </div>
    </div>
  );
};

/** The same hook drives any control that takes a `value` — here `SegmentedTabs` across the top of the page. */
export const WithSegmentedTabs: Story = () => {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const { activeId, scrollTo } = useScrollSpy({ ids: SECTION_IDS, root, offset: 16 });
  return (
    <div className='flex h-320 flex-col gap-12'>
      <SegmentedTabs value={activeId} onChange={scrollTo} data-testid='toc-tabs'>
        <SegmentedTabsList>
          {SECTIONS.map(section => (
            <SegmentedTabsTrigger key={section.id} value={section.id}>
              {section.label}
            </SegmentedTabsTrigger>
          ))}
        </SegmentedTabsList>
      </SegmentedTabs>
      <div
        ref={setRoot}
        data-testid='toc-content'
        className='flex-1 overflow-y-auto rounded-8 border border-border-primary p-16'
      >
        {SECTIONS.map(section => (
          <section key={section.id} id={section.id} className='min-h-200 pb-16'>
            <Text size='lg' weight='medium'>
              {section.label}
            </Text>
            <Text color='secondary'>Body of the {section.label} section.</Text>
          </section>
        ))}
      </div>
    </div>
  );
};
