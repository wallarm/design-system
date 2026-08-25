import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronDown, CircleDashed, Home } from '../../icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Breadcrumbs, BreadcrumbsEllipsis, BreadcrumbsItem } from './index';

const DESCRIPTION = [
  'The location trail for a page that sits deep in a hierarchy — each ancestor links up, and the last item is the page you are on.',
  'Skip it in a flat app of one or two levels, and never use it to move between peers at the same level: that is `Tabs`. It shows vertical hierarchy only, and complements the sidebar rather than replacing it.',
].join(' ');

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  subcomponents: { BreadcrumbsItem, BreadcrumbsEllipsis },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
    },
    children: {
      control: false,
    },
  },
};

export default meta;

/** The plain trail. The root inserts the chevrons and marks the last item as the current page, so you list only your own items. */
export const Basic: StoryFn<typeof Breadcrumbs> = args => {
  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args} data-testid='breadcrumbs'>
        <BreadcrumbsItem href='#home'>Home</BreadcrumbsItem>
        <BreadcrumbsItem href='#products'>Products</BreadcrumbsItem>
        <BreadcrumbsItem href='#current'>Current Page</BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

Basic.args = {};

/** One item is the current page and nothing more — which is the case where a breadcrumb has stopped earning its space. */
export const SingleItem: StoryFn<typeof Breadcrumbs> = args => {
  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args}>
        <BreadcrumbsItem href='#current'>Current Page</BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

SingleItem.args = {};

/** An icon inside an item, for a level whose type is worth showing as well as naming. */
export const WithIcons: StoryFn<typeof Breadcrumbs> = args => {
  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args}>
        <BreadcrumbsItem href='#home'>
          <Home size='md' />
          Home
        </BreadcrumbsItem>
        <BreadcrumbsItem href='#category'>
          <CircleDashed size='md' />
          Category
        </BreadcrumbsItem>
        <BreadcrumbsItem href='#subcategory'>
          Subcategory
          <CircleDashed size='md' />
        </BreadcrumbsItem>
        <BreadcrumbsItem onClick={() => alert('Current page clicked')}>
          <CircleDashed size='md' />
          Current Page
          <CircleDashed size='md' />
        </BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

WithIcons.args = {};

/** Items that call a handler instead of following an `href`, for a trail wired to a router rather than to URLs. */
export const WithInteractiveItems: StoryFn<typeof Breadcrumbs> = args => {
  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args}>
        <BreadcrumbsItem href='#home'>Home</BreadcrumbsItem>
        <BreadcrumbsItem onClick={() => alert('Category dropdown clicked')}>
          <CircleDashed size='md' />
          Category
          <ChevronDown size='md' />
        </BreadcrumbsItem>
        <BreadcrumbsItem href='#current'>Current Page</BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

WithInteractiveItems.args = {};

/** Icons with no text. Each item needs its own `aria-label`, since the icon is then the only thing naming the level. */
export const IconsOnly: StoryFn<typeof Breadcrumbs> = args => {
  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args}>
        <BreadcrumbsItem href='#home' aria-label='Home'>
          <Home size='md' />
        </BreadcrumbsItem>
        <BreadcrumbsItem href='#dashboard' aria-label='Dashboard'>
          <CircleDashed size='md' />
        </BreadcrumbsItem>
        <BreadcrumbsItem href='#projects' aria-label='Projects'>
          <CircleDashed size='md' />
        </BreadcrumbsItem>
        <BreadcrumbsItem href='#settings' aria-label='Settings'>
          <CircleDashed size='md' />
        </BreadcrumbsItem>
        <BreadcrumbsItem href='#security' aria-label='Security'>
          <CircleDashed size='md' />
        </BreadcrumbsItem>
        <BreadcrumbsItem aria-label='Current page' onClick={() => alert('Current page clicked')}>
          <CircleDashed size='md' />
        </BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

IconsOnly.args = {};

/** A long trail folded behind a `BreadcrumbsEllipsis`, which expands the middle on click. The first and current items always stay. */
export const WithTruncation: StoryFn<typeof Breadcrumbs> = args => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args}>
        <BreadcrumbsItem href='#home'>Home</BreadcrumbsItem>
        <BreadcrumbsItem href='#level1'>Level 1</BreadcrumbsItem>
        {!showAll ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <BreadcrumbsEllipsis onClick={() => setShowAll(true)} />
            </TooltipTrigger>
            <TooltipContent>WIP</TooltipContent>
          </Tooltip>
        ) : (
          [
            <BreadcrumbsItem key='level2' href='#level2'>
              Level 2
            </BreadcrumbsItem>,
            <BreadcrumbsItem key='level3' href='#level3'>
              Level 3
            </BreadcrumbsItem>,
          ]
        )}
        <BreadcrumbsItem href='#penultimate'>Penultimate</BreadcrumbsItem>
        <BreadcrumbsItem href='#current'>Current Page</BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

WithTruncation.args = {};

/** What a trail of long labels actually does today: it runs on. Per-item truncation is drawn in Figma but not shipped, so keep labels short. */
export const LongBreadcrumbs: StoryFn<typeof Breadcrumbs> = args => {
  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args}>
        <BreadcrumbsItem href='#home'>Home</BreadcrumbsItem>
        <BreadcrumbsItem href='#products'>Products & Services</BreadcrumbsItem>
        <BreadcrumbsItem href='#category'>Technology Category</BreadcrumbsItem>
        <BreadcrumbsItem href='#subcategory'>Software Development</BreadcrumbsItem>
        <BreadcrumbsItem href='#area'>Web Development Tools</BreadcrumbsItem>
        <BreadcrumbsItem onClick={() => alert('Current page clicked')}>
          Frontend Frameworks and Libraries
        </BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

LongBreadcrumbs.args = {};
