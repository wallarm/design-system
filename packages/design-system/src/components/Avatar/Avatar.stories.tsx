import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Activity, RefreshCcw, Trash2 } from '../../icons';
import { Button } from '../Button';
import { FieldDescription, FieldLabel } from '../Field';
import { FileUpload, FileUploadError, FileUploadTrigger, useFilePreviewUrl } from '../FileUpload';
import { Loader } from '../Loader';
import { HStack, VStack } from '../Stack';
import { Avatar, AvatarFallback, AvatarImage, AvatarOverlay, type AvatarProps } from '.';

// Deterministic "photo": no network, identical pixels in every screenshot run.
const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#8ec5fc'/><circle cx='32' cy='26' r='12' fill='#f6d5b8'/><rect x='14' y='42' width='36' height='22' rx='11' fill='#4b6cb7'/></svg>",
)}`;

const ACCEPT = 'image/png,image/jpeg,image/webp';
const MAX_SIZE = 512 * 1024;

const DESCRIPTION = [
  "A person's photo on a rounded plate, falling back to initials or an icon while it loads, when it fails, or when there is none.",
  'It is decorative beside a visible name; standing alone, give it `aria-label` so it reads as an image.',
  'To let people change it, make the avatar the `FileUploadTrigger` (`asChild`) — picking only previews, and your form uploads.',
].join(' ');

const meta = {
  title: 'Data Display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm'] },
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

/** `xs` (24px) is the nav-rail plate; `sm` (32px, the default) is for rows and forms. */
export const Sizes: StoryFn<AvatarProps> = () => (
  <VStack gap={16} align='start' data-testid='avatar'>
    {(['xs', 'sm'] as const).map(size => (
      <HStack key={size} gap={12} align='center'>
        <Avatar size={size}>
          <AvatarImage src={PHOTO} />
          <AvatarFallback name='Ada Lovelace' />
        </Avatar>
        <Avatar size={size}>
          <AvatarFallback name='Ada Lovelace' />
        </Avatar>
        <Avatar size={size}>
          <AvatarFallback />
        </Avatar>
        <span className='sb-annotation'>{size}</span>
      </HStack>
    ))}
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
    <Avatar>
      <AvatarImage src='/does-not-exist.png' />
      <AvatarFallback name='Alan Turing' />
    </Avatar>
    <Avatar>
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

/** Inside a Branded frame the empty plate takes the brand tint and stroke, while initials keep the body text colour and a photo is unchanged. */
export const Branded: StoryFn<AvatarProps> = () => (
  <HStack gap={12} align='center' data-frame-style='branded' data-testid='avatar'>
    <Avatar>
      <AvatarFallback />
    </Avatar>
    <Avatar>
      <AvatarFallback name='Ada Lovelace' />
    </Avatar>
    <Avatar>
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
        <Avatar asChild>
          <button type='button' aria-label='Change avatar'>
            <AvatarImage src={src} />
            <AvatarFallback />
            <AvatarOverlay />
          </button>
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
      <Avatar asChild>
        <button type='button' aria-label='Change avatar' aria-busy>
          <AvatarImage src={PHOTO} />
          <AvatarFallback />
          <AvatarOverlay visible>
            <Loader size='md' />
          </AvatarOverlay>
        </button>
      </Avatar>
    </FileUploadTrigger>
  </FileUpload>
);
