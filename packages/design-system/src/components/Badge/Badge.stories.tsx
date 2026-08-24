import { Fragment } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Check, CircleCheck, Info, PenTool, X } from '../../icons';
import { HStack } from '../Stack';
import { Badge } from './Badge';
import { BadgeColorEnum, BadgeTypeEnum } from './constants';
import { badgeColorsMuted } from './generateBadgeVariants';
import type { BadgeColor, BadgeType } from './types';

const isMutedSupported = (type: BadgeType, color: BadgeColor): boolean =>
  type === 'solid' || (type === 'outline' && color === 'slate');

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const DESCRIPTION = [
  'The status chip the rest of the family is built from — reach for the dedicated component when one exists (`HttpMethod`, `ResponseCode`, `Ip`, `Country`) rather than rebuilding it here, and for `Tag` when the chip is interactive.',
  'Colour carries the meaning, so choose it from what the value is rather than from what looks right on the page.',
].join(' ');

const meta = {
  title: 'Status Indication/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
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

/**
 * The default chip. Keep the text to a word or two — a badge is read at a glance, in a table
 * cell, alongside dozens of others.
 */
export const Basic: StoryFn<typeof meta> = ({ ...args }) => <Badge {...args}>Badge</Badge>;

/**
 * A leading dot in the current colour, for a status that reads faster as a mark than as a fill.
 */
export const Dotted: StoryFn<typeof meta> = ({ ...args }) => (
  <Badge {...args} variant='dotted'>
    Badge
  </Badge>
);

/**
 * Two heights. `medium` exists for dense rows; anything smaller stops being legible at a
 * glance, which is the only thing a badge is for.
 */
export const Sizes: StoryFn<typeof meta> = ({ ...args }) => (
  <HStack align='center' gap={8}>
    <Badge {...args} size='small'>
      Small
    </Badge>
    <Badge {...args} size='medium'>
      Medium
    </Badge>
    <Badge {...args} size='large'>
      Large
    </Badge>
  </HStack>
);

/**
 * The emphasis ladder from `solid` down to `text`. Drop the emphasis when badges are everywhere
 * — a table of solid chips is a table nobody can scan.
 */
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

/**
 * `text` and `text-color`, the two flattest types. They suit a value that must be read but
 * should not compete with the row it sits in.
 */
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

/**
 * An icon before the label, which is how a status reads without relying on colour alone.
 */
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

/**
 * An icon after the label, for a mark about the value rather than the value's own state.
 */
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

/**
 * No label at all. Only safe where the icon's meaning is already established elsewhere on the
 * page, since nothing here names it.
 */
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

/**
 * `muted` drops the saturation for a status that is true but not worth attention — the case for
 * everything that is merely fine.
 */
export const MutedVariants: StoryFn<typeof meta> = () => (
  <table className='w-full'>
    <thead>
      <tr>
        {Object.keys(BadgeTypeEnum).map(type => (
          <th key={type} className='sb-annotation p-8 text-left'>
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
              {isMutedSupported(type, color) ? (
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

/**
 * The full palette. Every colour already means something in the system, so borrowing one for
 * decoration teaches the reader the wrong thing.
 */
export const ColorVariants: StoryFn<typeof meta> = () => (
  <table className='w-full'>
    <thead>
      <tr>
        {Object.keys(BadgeTypeEnum).map(type => (
          <th key={type} className='sb-annotation p-8 text-left'>
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

/**
 * What happens as the content grows. A badge does not truncate, so long text widens the row
 * rather than being cut.
 */
export const ContentVariants: StoryFn<typeof meta> = () => (
  <table className='w-full'>
    <thead>
      <tr>
        {Object.keys(BadgeTypeEnum).map(type => (
          <th key={type} className='sb-annotation p-8 text-left'>
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

          <tr>
            {Object.values(BadgeTypeEnum).map((type: BadgeType) => (
              <td key={type} className='p-8'>
                <Badge type={type} color={color} variant='dotted'>
                  {label}
                </Badge>
              </td>
            ))}
          </tr>

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
                  {isMutedSupported(type, color) ? (
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
