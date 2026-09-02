import type { Meta, StoryFn } from 'storybook-react-rsbuild';
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

/** A visible grip icon on the resize handle. */
export const WithHandle: StoryFn<ResizablePanelGroupProps> = () => (
  <div className='h-[320px] w-[600px] rounded-8 border border-border-primary'>
    <ResizablePanelGroup orientation='horizontal'>
      <ResizablePanel id='left' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Panel A</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id='right' defaultSize='50%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Panel B</span>
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
      <ResizableHandle withHandle />
      <ResizablePanel id='right' defaultSize='60%'>
        <ResizablePanelGroup orientation='vertical'>
          <ResizablePanel id='top' defaultSize='60%'>
            <div className='flex h-full items-center justify-center p-24'>
              <span className='text-text-secondary'>Editor</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
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
      <ResizableHandle withHandle />
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
      <ResizableHandle withHandle />
      <ResizablePanel id='flexible' defaultSize='60%'>
        <div className='flex h-full items-center justify-center p-24'>
          <span className='text-text-secondary'>Flexible</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
);
