import { Fragment } from 'react';
import { capitalize } from 'lodash-es';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Check, CircleCheck, Info, PenTool, X } from '../../icons';
import { HStack } from '../Stack';
import { Badge } from './Badge';
import { BadgeColorEnum, BadgeTypeEnum } from './constants';
import { badgeColorsMuted } from './generateBadgeVariants';
import type { BadgeType } from './types';

const meta = {
  title: 'Status Indication/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'large'],
    },
    type: {
      control: 'select',
      options: Object.values(BadgeTypeEnum),
    },
    color: {
      control: 'select',
      options: Object.values(BadgeColorEnum),
    },
    textVariant: {
      control: 'select',
      options: ['default', 'code'],
    },
    muted: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

export const Basic: StoryFn<typeof meta> = ({ ...args }) => <Badge {...args}>Badge</Badge>;

export const Dotted: StoryFn<typeof meta> = ({ ...args }) => (
  <Badge {...args} variant='dotted'>
    Badge
  </Badge>
);

export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align='center' gap={8}>
    <Badge {...args} size='medium'>
      Medium
    </Badge>
    <Badge {...args} size='large'>
      Large
    </Badge>
  </HStack>
);

export const Types: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={8}>
    <Badge {...args} type='solid'>
      Solid
    </Badge>
    <Badge {...args} type='secondary'>
      Secondary
    </Badge>
    <Badge {...args} type='outline'>
      Outline
    </Badge>
    <Badge {...args} type='text'>
      Text
    </Badge>
    <Badge {...args} type='text-color'>
      Text Color
    </Badge>
  </HStack>
);

export const TextVariants: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={8}>
    <Badge {...args} textVariant='default'>
      Default Text
    </Badge>
    <Badge {...args} textVariant='code'>
      Code Text
    </Badge>
  </HStack>
);

export const WithIconsLeft: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={8}>
    <Badge {...args}>
      <Check size='sm' />
      Success
    </Badge>
    <Badge {...args}>
      <X size='sm' />
      Error
    </Badge>
    <Badge {...args}>
      <Info size='sm' />
      Info
    </Badge>
    <Badge {...args}>
      <CircleCheck size='sm' />
      Verified
    </Badge>
    <Badge {...args}>
      <Check size='sm' />
      Complete
    </Badge>
  </HStack>
);

export const WithIconsRight: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={8}>
    <Badge {...args}>
      Success
      <Check size='sm' />
    </Badge>
    <Badge {...args}>
      Error
      <X size='sm' />
    </Badge>
    <Badge {...args}>
      Info
      <Info size='sm' />
    </Badge>
    <Badge {...args}>
      Verified
      <CircleCheck size='sm' />
    </Badge>
    <Badge {...args}>
      Complete
      <Check size='sm' />
    </Badge>
  </HStack>
);

export const IconsOnly: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack gap={8}>
    <Badge {...args}>
      <Check size='sm' />
    </Badge>
    <Badge {...args}>
      <X size='sm' />
    </Badge>
    <Badge {...args}>
      <Info size='sm' />
    </Badge>
    <Badge {...args}>
      <CircleCheck size='sm' />
    </Badge>
    <Badge {...args}>
      <Check size='sm' />
    </Badge>
  </HStack>
);

export const ColorVariants: StoryFn<typeof meta> = () => (
  <table className='w-full'>
    <thead>
      <tr>
        {Object.keys(BadgeTypeEnum).map(type => (
          <th key={type} className='p-8 text-left'>
            {type}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Object.entries(BadgeColorEnum).map(([label, color]) => (
        <tr key={color}>
          {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
            <td key={type} className='p-8'>
              <Badge type={type} color={color}>
                {label}
              </Badge>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const MutedVariants: StoryFn<typeof meta> = () => (
  <table className='w-full'>
    <thead>
      <tr>
        {Object.keys(BadgeTypeEnum).map(type => (
          <th key={type} className='p-8 text-left'>
            {type}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {badgeColorsMuted.map(color => (
        <tr key={color}>
          {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
            <td key={type} className='p-8'>
              {(type === 'outline' && color === 'slate') || type === 'solid' ? (
                <Badge type={type} color={color} muted>
                  {capitalize(color)}
                </Badge>
              ) : null}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const ContentVariants: StoryFn<typeof meta> = () => (
  <table className='w-full'>
    <thead>
      <tr>
        {Object.keys(BadgeTypeEnum).map(type => (
          <th key={type} className='p-8 text-left'>
            {type}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Object.entries(BadgeColorEnum).map(([label, color]) => (
        <Fragment key={color}>
          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color}>
                  {label}
                </Badge>
              </td>
            ))}
          </tr>

          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color}>
                  {label}

                  <X />
                </Badge>
              </td>
            ))}
          </tr>

          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color}>
                  <PenTool />
                  {label}
                </Badge>
              </td>
            ))}
          </tr>

          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color}>
                  <PenTool />
                  {label}
                  <X />
                </Badge>
              </td>
            ))}
          </tr>

          <tr />
          {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
            <td key={type} className='p-8'>
              <Badge type={type} color={color} variant='dotted'>
                {label}
              </Badge>
            </td>
          ))}

          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color} variant='dotted'>
                  {label}
                  <X />
                </Badge>
              </td>
            ))}
          </tr>

          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color}>
                  {label}
                  <Info />
                </Badge>
              </td>
            ))}
          </tr>

          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color}>
                  <PenTool />
                </Badge>
              </td>
            ))}
          </tr>

          {badgeColorsMuted.includes(color) && (
            <tr key={color}>
              {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
                <td key={type} className='p-8'>
                  {(type === 'outline' && color === 'slate') || type === 'solid' ? (
                    <Badge type={type} color={color} muted>
                      {capitalize(color)}
                    </Badge>
                  ) : null}
                </td>
              ))}
            </tr>
          )}
        </Fragment>
      ))}
    </tbody>
  </table>
);
