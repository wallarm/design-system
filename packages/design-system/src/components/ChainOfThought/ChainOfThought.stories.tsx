import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import {
  Activity,
  BadgeCheck,
  Bot,
  Brain,
  CircleDashed,
  Database,
  Download,
  FilePlus,
  FileText,
  Filter,
  GitBranch,
  Globe,
  Link,
  ListChecks,
  Pencil,
  Plug,
  Radar,
  Search,
  ShieldAlert,
  Terminal,
  Wrench,
} from '../../icons';
import { Button } from '../Button';
import { InlineCodeSnippet } from '../CodeSnippet';
import { ChainOfThought, ChainOfThoughtStep } from './index';

const DESCRIPTION = [
  'A read-only log of what Wally did while answering — searches, tool calls, its own reasoning — so the user can see how it got there without the steps crowding the answer.',
  'Each `ChainOfThoughtStep` is one line: a type icon, a label and an optional right-aligned metric, joined to the next step by a thin connector.',
  'A step with children becomes a collapsible trigger, and children can be another `ChainOfThought`, so runs nest as deep as the agent did.',
  'The app owns the mapping from step type to icon (see **Type Icons**); the DS only draws the row.',
].join(' ');

const meta = {
  title: 'AI/ChainOfThought',
  component: ChainOfThought,
  subcomponents: { ChainOfThoughtStep },
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  decorators: [
    Story => (
      <div className='max-w-[400px]'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChainOfThought>;

export default meta;

/** Icon steps joined by connectors; the last step drops its line. */
export const Basic: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s' />
    <ChainOfThoughtStep icon={<Search />} label='Searched for blocked requests' />
    <ChainOfThoughtStep icon={<Database />} label='Queried attack events' />
    <ChainOfThoughtStep icon={<FileText />} label='Read the policy for api.example.com' />
  </ChainOfThought>
);

/** Steps with children toggle open; a nested chain can hold its own collapsible steps. */
export const Nested: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s' />
    <ChainOfThoughtStep
      icon={<Bot />}
      label='Ran the triage subagent'
      defaultOpen
      data-testid='cot-subagent'
    >
      <ChainOfThought>
        <ChainOfThoughtStep icon={<Search />} label='Searched for ABC' />
        <ChainOfThoughtStep icon={<Wrench />} label='Called get_attacks' data-testid='cot-tool'>
          <p>Returned 42 attacks over the last 24 hours.</p>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep icon={<ListChecks />} label='Made a plan' />
      </ChainOfThought>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep
      icon={<FilePlus />}
      label='Created a rule draft'
      data-testid='cot-collapsed'
    >
      <p>Draft rule blocks SQL injection on /api/v1/login.</p>
    </ChainOfThoughtStep>
  </ChainOfThought>
);

/** `icon={null}` gives the Figma "Simple" row: no icon cell, no connector, 16px apart. */
export const SimpleRows: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={null} label='Checked 3 applications' />
    <ChainOfThoughtStep icon={null} label='Compared rule sets' />
    <ChainOfThoughtStep icon={null} label='Found 2 overlapping rules' />
  </ChainOfThought>
);

/** `metric` adds a right-aligned mono value — the Figma "Simple-result" row. */
export const SimpleResult: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={null} label='Scanned endpoints' metric='1,204' />
    <ChainOfThoughtStep icon={null} label='Matched attacks' metric='42' />
    <ChainOfThoughtStep icon={null} label='Elapsed' metric='3m 45s' />
  </ChainOfThought>
);

/** `status='running'` shimmers the label while the step is in progress. */
export const Working: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={<Search />} label='Searched for ABC' />
    <ChainOfThoughtStep icon={<Globe />} label='Searching the web...' status='running' />
  </ChainOfThought>
);

const HISTORY_STEPS = [
  { icon: <Search />, label: 'Searched for ABC' },
  { icon: <Globe />, label: 'Searched the web' },
];

const STREAMING_STEPS = [
  { icon: <Brain />, label: 'Thinking...', done: 'Thought for 5s' },
  {
    icon: <Search />,
    label: 'Searching for blocked requests...',
    done: 'Searched for blocked requests',
  },
  { icon: <Database />, label: 'Querying attack events...', done: 'Queried attack events' },
  { icon: <FilePlus />, label: 'Creating a rule draft...', done: 'Created a rule draft' },
];

/**
 * A step that mounts as `running` fades in and settles 4px; the previous step's connector grows
 * toward it; on `done` the shimmer fades into the plain label. Steps that mount `done` (history)
 * appear instantly. All of it is off under `prefers-reduced-motion`.
 */
export const Streaming: StoryFn<typeof meta> = () => {
  const [count, setCount] = useState(1);
  const finished = count > STREAMING_STEPS.length;

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className='flex flex-col gap-12'>
      <ChainOfThought data-testid='cot'>
        {HISTORY_STEPS.map(step => (
          <ChainOfThoughtStep key={step.label} icon={step.icon} label={step.label} />
        ))}
        {STREAMING_STEPS.slice(0, count).map((step, i) => {
          const running = i === count - 1;
          return (
            <ChainOfThoughtStep
              key={step.done}
              icon={step.icon}
              label={running ? step.label : step.done}
              status={running ? 'running' : 'done'}
            />
          );
        })}
      </ChainOfThought>
      <div>
        <Button
          variant='secondary'
          color='neutral'
          size='small'
          disabled={finished}
          onClick={handleClick}
          data-testid='next-step'
        >
          {count === STREAMING_STEPS.length ? 'Finish' : 'Next step'}
        </Button>
      </div>
    </div>
  );
};

/**
 * `status='error'` tints the label and the type icon danger, for a step that failed. Word the
 * label as a failure too (color alone is not enough); put the detail in the step's children.
 * Not in Figma yet; pending design review.
 */
export const ErrorStep: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={<Search />} label='Searched for ABC' />
    <ChainOfThoughtStep
      icon={<Plug />}
      label='get_attacks failed'
      status='error'
      defaultOpen
      data-testid='cot-error'
    >
      <p>Request failed: 503 Service Unavailable.</p>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep icon={<Plug />} label='get_rules failed' status='error' />
  </ChainOfThought>
);

/** The whole run folded under one "Worked for …" step with the Activity icon. */
export const WorkedSummary: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep
      icon={<Activity />}
      label='Worked for 3m 45s'
      defaultOpen
      data-testid='cot-summary'
    >
      <ChainOfThought>
        <ChainOfThoughtStep icon={<Brain />} label='Thought for 5s' />
        <ChainOfThoughtStep icon={<Terminal />} label='Ran wallarm-cli status' />
        <ChainOfThoughtStep icon={<Radar />} label='Scanned 12 hosts' />
        <ChainOfThoughtStep icon={<BadgeCheck />} label='Created a mitigation rule' />
      </ChainOfThought>
    </ChainOfThoughtStep>
  </ChainOfThought>
);

/** Nested content can be prose: paragraphs, bullets and inline code. */
export const RichTextContent: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={<Brain />} label='Thought for 12s' defaultOpen>
      <p>
        The user wants to know why requests to{' '}
        <InlineCodeSnippet
          code='/api/login'
          copyable={false}
          size='sm'
          className='text-text-secondary'
        />{' '}
        were blocked.
      </p>
      <ul>
        <li>Check recent attacks on that path.</li>
        <li>Compare them with the active rules.</li>
      </ul>
      <p>Then suggest the narrowest rule change.</p>
    </ChainOfThoughtStep>
  </ChainOfThought>
);

/** The recommended step-type → icon mapping. The app owns it; this is documentation only. */
export const TypeIcons: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep icon={<Brain />} label='thinking' />
    <ChainOfThoughtStep icon={<ListChecks />} label='plan' />
    <ChainOfThoughtStep icon={<GitBranch />} label='decision' />
    <ChainOfThoughtStep icon={<Bot />} label='subagent' />
    <ChainOfThoughtStep icon={<Wrench />} label='tool' />
    <ChainOfThoughtStep icon={<Terminal />} label='command' />
    <ChainOfThoughtStep icon={<Globe />} label='web search' />
    <ChainOfThoughtStep icon={<Search />} label='query' />
    <ChainOfThoughtStep icon={<Database />} label='datastore' />
    <ChainOfThoughtStep icon={<Plug />} label='api' />
    <ChainOfThoughtStep icon={<FileText />} label='read' />
    <ChainOfThoughtStep icon={<Download />} label='fetch' />
    <ChainOfThoughtStep icon={<Filter />} label='filter' />
    <ChainOfThoughtStep icon={<FilePlus />} label='create' />
    <ChainOfThoughtStep icon={<Pencil />} label='edit' />
    <ChainOfThoughtStep icon={<Link />} label='cite' />
    <ChainOfThoughtStep icon={<ShieldAlert />} label='threat' />
    <ChainOfThoughtStep icon={<Radar />} label='scan' />
    <ChainOfThoughtStep icon={<CircleDashed />} label='pending / default' />
    <ChainOfThoughtStep icon={<Activity />} label='summary' />
    <ChainOfThoughtStep icon={<BadgeCheck />} label='"Created" example' />
  </ChainOfThought>
);

/** `open` + `onOpenChange` drive the step from outside. */
export const Controlled: StoryFn<typeof meta> = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className='flex flex-col gap-12'>
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep
          icon={<Brain />}
          label='Thought for 5s'
          open={open}
          onOpenChange={setOpen}
        >
          <p>Reasoning goes here.</p>
        </ChainOfThoughtStep>
      </ChainOfThought>
      <code className='text-xs text-text-secondary'>open: {String(open)}</code>
    </div>
  );
};

/** `data-analytics-*` on a collapsible step lands on the row `<button>`, not the `<li>`. */
export const Analytics: StoryFn<typeof meta> = () => (
  <ChainOfThought data-testid='cot'>
    <ChainOfThoughtStep
      icon={<Brain />}
      label='Thought for 5s'
      data-analytics-id='COT_STEP_TOGGLE'
      data-analytics-props='{"type":"thinking"}'
    >
      <p>Reasoning goes here.</p>
    </ChainOfThoughtStep>
  </ChainOfThought>
);
