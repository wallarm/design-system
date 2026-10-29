import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import {
  Avatar,
  AvatarContent,
  AvatarDescription,
  AvatarFallback,
  AvatarImage,
  AvatarName,
  AvatarOverlay,
  type AvatarProps,
} from '.';
import { Activity, RefreshCcw, Trash2 } from '../../icons';
import { Button } from '../Button';
import { FieldDescription, FieldLabel } from '../Field';
import { FileUpload, FileUploadError, FileUploadTrigger, useFilePreviewUrl } from '../FileUpload';
import { Loader } from '../Loader';
import { HStack, VStack } from '../Stack';

// Deterministic "photo": no network, identical pixels in every screenshot run.
const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#8ec5fc'/><circle cx='32' cy='26' r='12' fill='#f6d5b8'/><rect x='14' y='42' width='36' height='22' rx='11' fill='#4b6cb7'/></svg>",
)}`;

const ACCEPT = 'image/png,image/jpeg,image/webp';
const MAX_SIZE = 512 * 1024;

const DESCRIPTION = [
  "A person's photo on a rounded plate, falling back to initials or an icon while it loads, when it fails, or when there is none.",
  'It is decorative beside a visible name; standing alone, give it `aria-label` so it reads as an image.',
  'Add `AvatarContent` with `AvatarName` (and an optional `AvatarDescription`) for the user item: plate and name in one row.',
  "To let people change it, make the avatar the `FileUploadTrigger` (`asChild`) and give it `as='button'` — picking only previews, and your form uploads.",
].join(' ');

const meta = {
  title: 'Data Display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

/** A photo with an initials fallback — the fallback also covers the moment before the photo arrives. */
export const Basic: StoryFn<AvatarProps> = args => (
  <Avatar data-testid='avatar' {...args}>
    <AvatarImage src={PHOTO} />
    <AvatarFallback name='Ada Lovelace' />
  </Avatar>
);

const SIZES = ['sm', 'md', 'lg'] as const;

/**
 * `sm` (20px) and `md` (24px, the nav-rail plate) are the compact sizes for user items; `lg` (32px,
 * the default) is for rows and forms. Each row shows a photo, initials and the icon, then the same
 * three inside a Branded frame.
 */
export const Sizes: StoryFn<AvatarProps> = () => (
  <VStack gap={16} align='start' data-testid='avatar'>
    {SIZES.map(size => (
      <HStack key={size} gap={12} align='center' data-testid={`avatar-${size}`}>
        <Avatar size={size} data-testid={`avatar-${size}-photo`}>
          <AvatarImage src={PHOTO} />
          <AvatarFallback name='Ada Lovelace' />
        </Avatar>
        <Avatar size={size} data-testid={`avatar-${size}-initials`}>
          <AvatarFallback name='Ada Lovelace' />
        </Avatar>
        <Avatar size={size} data-testid={`avatar-${size}-icon`}>
          <AvatarFallback />
        </Avatar>
        <HStack gap={12} align='center' data-frame-style='branded'>
          <Avatar size={size} data-testid={`avatar-${size}-branded-photo`}>
            <AvatarImage src={PHOTO} />
            <AvatarFallback name='Ada Lovelace' />
          </Avatar>
          <Avatar size={size} data-testid={`avatar-${size}-branded-initials`}>
            <AvatarFallback name='Ada Lovelace' />
          </Avatar>
          <Avatar size={size} data-testid={`avatar-${size}-branded-icon`}>
            <AvatarFallback />
          </Avatar>
        </HStack>
        <span className='sb-annotation'>{size}</span>
      </HStack>
    ))}
  </VStack>
);

/**
 * The user item (Figma 12557:5856): the plate and the name in one row, 6px apart. The name is
 * `text-sm` at every size and truncates with an ellipsis when the row is narrow.
 */
export const WithName: StoryFn<AvatarProps> = () => (
  <VStack gap={16} align='start' data-testid='avatar'>
    {(['sm', 'md'] as const).map(size => (
      <VStack key={size} gap={8} align='start' data-testid={`avatar-${size}`}>
        <Avatar size={size} data-testid={`avatar-${size}-photo`}>
          <AvatarImage src={PHOTO} />
          <AvatarFallback name='Artem Miskevich' />
          <AvatarContent>
            <AvatarName>Artem Miskevich</AvatarName>
          </AvatarContent>
        </Avatar>
        <Avatar size={size} data-testid={`avatar-${size}-initials`}>
          <AvatarFallback name='Artem Miskevich' />
          <AvatarContent>
            <AvatarName>Artem Miskevich</AvatarName>
          </AvatarContent>
        </Avatar>
        <div data-frame-style='branded'>
          <Avatar size={size} data-testid={`avatar-${size}-branded`}>
            <AvatarFallback name='Artem Miskevich' />
            <AvatarContent>
              <AvatarName>Artem Miskevich</AvatarName>
            </AvatarContent>
          </Avatar>
        </div>
        <div className='w-120'>
          <Avatar size={size} data-testid={`avatar-${size}-truncated`}>
            <AvatarFallback name='Maximilian Alexander-Montgomery' />
            <AvatarContent>
              <AvatarName>Maximilian Alexander-Montgomery</AvatarName>
            </AvatarContent>
          </Avatar>
        </div>
      </VStack>
    ))}
  </VStack>
);

/** `AvatarDescription` adds a secondary line under the name — the email in the account menu. Both lines truncate. */
export const WithDescription: StoryFn<AvatarProps> = () => (
  <VStack gap={16} align='start' data-testid='avatar'>
    <Avatar data-testid='avatar-photo'>
      <AvatarImage src={PHOTO} />
      <AvatarFallback name='Artem Miskevich' />
      <AvatarContent>
        <AvatarName>Artem Miskevich</AvatarName>
        <AvatarDescription>admin@wallarm.com</AvatarDescription>
      </AvatarContent>
    </Avatar>
    <Avatar size='md' data-testid='avatar-md'>
      <AvatarFallback name='Artem Miskevich' />
      <AvatarContent>
        <AvatarName>Artem Miskevich</AvatarName>
        <AvatarDescription>admin@wallarm.com</AvatarDescription>
      </AvatarContent>
    </Avatar>
    <div className='w-160'>
      <Avatar data-testid='avatar-truncated'>
        <AvatarFallback />
        <AvatarContent>
          <AvatarName>Maximilian Alexander-Montgomery</AvatarName>
          <AvatarDescription>maximilian.alexander-montgomery@wallarm.com</AvatarDescription>
        </AvatarContent>
      </Avatar>
    </div>
  </VStack>
);

/** Initials are the first letters of the first and last word of `name`; without a name the person icon shows, whether the photo is missing or failed to load. */
export const Fallback: StoryFn<AvatarProps> = () => (
  <HStack gap={12} align='center' data-testid='avatar'>
    <Avatar>
      <AvatarFallback name='Grace Hopper' />
    </Avatar>
    <Avatar>
      <AvatarFallback />
    </Avatar>
    <Avatar data-testid='avatar-broken-initials'>
      <AvatarImage src='/does-not-exist.png' />
      <AvatarFallback name='Alan Turing' />
    </Avatar>
    <Avatar data-testid='avatar-broken-icon'>
      <AvatarImage src='/does-not-exist.png' />
      <AvatarFallback />
    </Avatar>
  </HStack>
);

/** `icon` replaces the default person glyph whenever `name` gives no initials. */
export const CustomIcon: StoryFn<AvatarProps> = () => (
  <Avatar data-testid='avatar'>
    <AvatarFallback icon={Activity} />
  </Avatar>
);

/** Inside a Branded frame the empty plate takes the brand tint and stroke, initials and the icon take the brand colour, and a photo is unchanged. */
export const Branded: StoryFn<AvatarProps> = () => (
  <HStack gap={12} align='center' data-frame-style='branded' data-testid='avatar'>
    <Avatar>
      <AvatarFallback />
    </Avatar>
    <Avatar>
      <AvatarFallback name='Ada Lovelace' />
    </Avatar>
    <Avatar data-testid='avatar-branded-photo'>
      <AvatarImage src={PHOTO} />
      <AvatarFallback />
    </Avatar>
  </HStack>
);

const useAvatarUpload = (initial?: string) => {
  const [stored, setStored] = useState(initial);
  const [files, setFiles] = useState<File[]>([]);
  const preview = useFilePreviewUrl(files[0]);
  const remove = () => {
    setStored(undefined);
    setFiles([]);
  };
  return { src: preview ?? stored, files, setFiles, remove };
};

/**
 * Click the avatar, or focus it and press Enter, to pick a photo — hover and focus show the edit
 * icon, and the pick only previews until your form saves.
 */
export const ClickToUpload: StoryFn = () => {
  const { src, files, setFiles } = useAvatarUpload();
  return (
    <FileUpload
      data-testid='avatar-upload'
      accept={ACCEPT}
      maxFileSize={MAX_SIZE}
      value={files}
      onValueChange={setFiles}
    >
      <FileUploadTrigger asChild data-analytics-id='AVATAR_CHANGE'>
        <Avatar as='button' aria-label='Change avatar'>
          <AvatarImage src={src} />
          <AvatarFallback />
          <AvatarOverlay />
        </Avatar>
      </FileUploadTrigger>
      <FileUploadError />
    </FileUpload>
  );
};

/** The settings-row pattern: explicit Remove and Replace buttons beside a plain avatar, with the accepted formats and size spelled out. */
export const WithActions: StoryFn = () => {
  const { src, files, setFiles, remove } = useAvatarUpload(PHOTO);
  return (
    <FileUpload
      data-testid='avatar-upload'
      accept={ACCEPT}
      maxFileSize={MAX_SIZE}
      value={files}
      onValueChange={setFiles}
    >
      <HStack gap={12} align='center' className='w-[480px] justify-between'>
        <VStack gap={0} align='start'>
          <FieldLabel>Avatar</FieldLabel>
          <FieldDescription>PNG, JPEG, or WebP · up to 512 KB</FieldDescription>
        </VStack>
        <HStack gap={12} align='center'>
          {src && (
            <Button
              variant='ghost'
              color='neutral'
              size='small'
              aria-label='Remove avatar'
              data-testid='avatar-remove'
              onClick={remove}
            >
              <Trash2 />
            </Button>
          )}
          <FileUploadTrigger
            variant='ghost'
            color='neutral'
            size='small'
            aria-label='Replace avatar'
          >
            <RefreshCcw />
          </FileUploadTrigger>
          <Avatar data-testid='avatar'>
            <AvatarImage src={src} />
            <AvatarFallback />
          </Avatar>
        </HStack>
      </HStack>
      <FileUploadError />
    </FileUpload>
  );
};

/** While the new photo uploads, disable the trigger and force the overlay with `visible` so it holds a `Loader`. */
export const Uploading: StoryFn = () => (
  <FileUpload data-testid='avatar-upload' accept={ACCEPT}>
    <FileUploadTrigger asChild disabled>
      <Avatar as='button' aria-label='Change avatar' aria-busy>
        <AvatarImage src={PHOTO} />
        <AvatarFallback />
        <AvatarOverlay visible>
          <Loader size='md' />
        </AvatarOverlay>
      </Avatar>
    </FileUploadTrigger>
  </FileUpload>
);
