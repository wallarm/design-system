import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tag } from '../Tag';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { ResizableHandle } from './ResizableHandle';
import { ResizablePanel } from './ResizablePanel';
import { ResizablePanelGroup, type ResizablePanelGroupProps } from './ResizablePanelGroup';

const DESCRIPTION =
  'A layout primitive that splits a view into resizable panels separated by draggable handles. Wraps `react-resizable-panels` with design-system styling.';

const meta = {
  title: 'Layout/Resizable',
  component: ResizablePanelGroup,
  subcomponents: {
    ResizablePanel,
    ResizableHandle,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;

/** Two panels side by side with a resizable divider. */
export const Horizontal: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[320px] w-[600px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='left' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Panel A</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='right' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Panel B</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

/** Two panels stacked vertically. */
export const Vertical: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[400px] w-[400px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='vertical'>
      <ResizablePanel id='top' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Top</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='bottom' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Bottom</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

/** Three panels with two resize handles. */
export const ThreePanels: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[320px] w-[800px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='left' defaultSize='25%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='center' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Content</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='right' defaultSize='25%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Inspector</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

/** A horizontal group with a vertical sub-group nested inside one panel. */
export const Nested: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[400px] w-[700px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='left' defaultSize='40%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='right' defaultSize='60%'>
        <ResizablePanelGroup orientation='vertical'>
          <ResizablePanel id='top' defaultSize='60%'>
            <div className='flex h-full items-center justify-center p-24'>
              <span className='text-text-secondary'>Editor</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id='bottom' defaultSize='40%'>
            <div className='flex h-full items-center justify-center p-24'>
              <span className='text-text-secondary'>Terminal</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

/** A panel that can be collapsed by dragging past its minimum size. Double-click the handle to reset. */
export const Collapsible: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[320px] w-[600px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='sidebar' defaultSize='30%' collapsible minSize='15%' collapsedSize='0%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Collapsible</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='content' defaultSize='70%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

/** Panels with minimum and maximum size constraints. */
export const WithConstraints: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[320px] w-[600px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='constrained' defaultSize='40%' minSize='20%' maxSize='60%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Min 20% / Max 60%</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='flexible' defaultSize='60%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Flexible</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

const OVERFLOW_TAGS = [
  'api-abuse',
  'account-takeover',
  'credential-stuffing',
  'XSS',
  'SQL Injection',
  'CSRF',
  'scanner',
  'brute-force',
  'data-exfiltration',
];

const renderOverflow = (items: string[]) => (
  <Popover>
    <PopoverTrigger asChild>
      <Tag>+{items.length}</Tag>
    </PopoverTrigger>
    <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
      <div className='flex flex-col gap-4'>
        {items.map(item => (
          <Tag key={item}>{item}</Tag>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

/** A "Drag to resize" tooltip appears on hover, like the Drawer resize handle. */
export const WithTooltip: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[320px] w-[600px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='left' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Panel A</span>
        </div>
      </ResizablePanel>
      <Tooltip positioning={{ placement: 'right' }}>
        <TooltipTrigger asChild>
          <ResizableHandle />
        </TooltipTrigger>
        <TooltipContent>Drag to resize</TooltipContent>
      </Tooltip>
      <ResizablePanel id='right' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Panel B</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);

/** Resizing with content that reflows — the tag list adapts live as the panel width changes. Overflow items appear in a popover. */
export const WithOverflowList: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[320px] w-[600px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='tags' defaultSize='50%' minSize='20%'>
        <div className='flex h-full items-center p-16'>
          <OverflowList
            className='gap-4'
            items={OVERFLOW_TAGS}
            itemRenderer={item => <Tag key={item}>{item}</Tag>}
            overflowRenderer={renderOverflow}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id='content' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);
