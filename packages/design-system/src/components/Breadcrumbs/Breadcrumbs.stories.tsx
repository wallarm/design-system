import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronDown, CircleDashed, Home } from '../../icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Breadcrumbs, BreadcrumbsEllipsis, BreadcrumbsItem } from './index';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  subcomponents: { BreadcrumbsItem, BreadcrumbsEllipsis },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Navigation breadcrumbs component that shows the current page location within a navigational hierarchy.',
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

export const Basic: StoryFn<typeof Breadcrumbs> = args => {
  return (
    <div className='flex items-center justify-center w-full p-8 min-h-[400px]'>
      <Breadcrumbs {...args}>
        <BreadcrumbsItem href='#home'>Home</BreadcrumbsItem>
        <BreadcrumbsItem href='#products'>Products</BreadcrumbsItem>
        <BreadcrumbsItem href='#current'>Current Page</BreadcrumbsItem>
      </Breadcrumbs>
    </div>
  );
};

Basic.args = {};

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
