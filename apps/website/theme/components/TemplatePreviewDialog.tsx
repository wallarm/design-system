import { useEffect, useRef, useState } from 'react';

import { useFrontmatter, usePage, withBase } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme-original';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Button } from '@wallarm-org/design-system/Button';
import { Copyable, CopyableIcon, CopyableLabel } from '@wallarm-org/design-system/Copyable';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@wallarm-org/design-system/Dialog';
import { ChevronLeft } from '@wallarm-org/design-system/icons/ChevronLeft';
import { ChevronRight } from '@wallarm-org/design-system/icons/ChevronRight';
import { ExternalLink } from '@wallarm-org/design-system/icons/ExternalLink';
import { Maximize2 } from '@wallarm-org/design-system/icons/Maximize2';
import { Kbd } from '@wallarm-org/design-system/Kbd';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@wallarm-org/design-system/Tooltip';
import { cn } from '@wallarm-org/design-system/utils/cn';

import { FILL_APP_SHELL, FULLSCREEN_FRAME, LoadedStory } from './StoryPreview';
import { ownsArrowKeys, storybookStoryUrl, storyLabel } from './templatePreview';
import type { StoryLoader } from './useStory';

export interface PreviewTemplate {
  /** Guideline slug (`templates/security-dashboard`): keys the story code and the Storybook link. */
  slug: string;
  title: string;
  description?: string;
  /** Docs page (`/templates/security-dashboard`); left out when the dialog opens from that page. */
  link?: string;
  load: StoryLoader;
  /** Story export names; the first is the default state. */
  stories: string[];
}

export interface TemplatePreviewDialogProps {
  open: boolean;
  template: PreviewTemplate;
  /** The shown story export name. */
  story: string;
  onStoryChange?: (story: string) => void;
  onClose: () => void;
  /** Both set: edge arrows and ArrowLeft/ArrowRight step through the templates. */
  onPrev?: () => void;
  onNext?: () => void;
}

type StoryCode = Record<string, string>;

const storyCode = new Map<string, Promise<StoryCode>>();

/** A guideline's story source by story name (generate.ts), fetched once per guideline. */
function loadStoryCode(slug: string): Promise<StoryCode> {
  let code = storyCode.get(slug);
  if (!code) {
    code = fetch(withBase(`/story-code/${slug}.json`)).then(res => {
      if (!res.ok) throw new Error(`story-code/${slug}.json: HTTP ${res.status}`);
      return res.json() as Promise<StoryCode>;
    });
    // A failed fetch is retried on the next open.
    code.catch(() => storyCode.delete(slug));
    storyCode.set(slug, code);
  }
  return code;
}

/** The story's source once fetched; `null` while loading or when it is missing. */
function useStoryCode(slug: string, story: string, enabled: boolean): string | null {
  const key = `${slug}#${story}`;
  const [code, setCode] = useState<{ key: string; code: string } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    loadStoryCode(slug)
      .then(index => {
        if (active) setCode({ key, code: index[story] ?? '' });
      })
      .catch((cause: unknown) => {
        // oxlint-disable-next-line no-console -- Copy code stays disabled; keep the reason visible
        console.error(cause);
      });
    return () => {
      active = false;
    };
  }, [key, slug, story, enabled]);

  return code?.key === key && code.code ? code.code : null;
}

function StepButton({ direction, onClick }: { direction: 'prev' | 'next'; onClick: () => void }) {
  const label = direction === 'prev' ? 'Previous template' : 'Next template';
  return (
    // In the controls row on small screens; on the dialog's side edges from md up. The wrapper is
    // positioned, not the Button: its hover overlay sets `position: relative`, which outranks
    // `md:absolute`, so a positioned Button jumped back into the row under the cursor.
    <div
      className={cn(
        'shrink-0 md:absolute md:top-1/2 md:z-10 md:-translate-y-1/2',
        direction === 'prev' ? 'md:left-8' : 'md:right-8',
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            color='neutral'
            aria-label={label}
            onClick={onClick}
            className='rounded-full shadow-md'
          >
            {direction === 'prev' ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {label} <Kbd>{direction === 'prev' ? '←' : '→'}</Kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/** Near-fullscreen live preview of a template or pattern story, with its states and code. */
export function TemplatePreviewDialog({
  open,
  template,
  story,
  onStoryChange,
  onClose,
  onPrev,
  onNext,
}: TemplatePreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const code = useStoryCode(template.slug, story, open);
  const stepping = !!onPrev && !!onNext;

  useEffect(() => {
    if (!open || !onPrev || !onNext) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      // Only keys from the dialog itself: a story's drawer or dialog is portalled outside it.
      const inDialog = event.target instanceof Node && contentRef.current?.contains(event.target);
      if (event.shiftKey || !inDialog || ownsArrowKeys(event.target)) return;
      if (event.key === 'ArrowLeft') onPrev();
      else if (event.key === 'ArrowRight') onNext();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onPrev, onNext]);

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} width='100%'>
      <DialogContent ref={contentRef}>
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
          {template.description && <DialogDescription>{template.description}</DialogDescription>}
          <DialogClose aria-label='Close preview' />
        </DialogHeader>
        {/* Before the body, so the step buttons come right after the header in the focus order. */}
        <div className='flex shrink-0 items-center gap-8 px-24 pb-12'>
          {stepping && <StepButton direction='prev' onClick={onPrev} />}
          {template.stories.length > 1 && onStoryChange ? (
            <div className='min-w-0 flex-1 overflow-x-auto'>
              <SegmentedControl
                value={story}
                onChange={onStoryChange}
                aria-label='State'
                className='w-max'
              >
                {template.stories.map(name => (
                  <SegmentedControlItem key={name} value={name} className='whitespace-nowrap'>
                    {storyLabel(name)}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>
          ) : (
            <div className='flex-1'>
              <Badge type='secondary' color='slate'>
                {storyLabel(story)}
              </Badge>
            </div>
          )}
          {stepping && <StepButton direction='next' onClick={onNext} />}
        </div>
        {/* Not DialogBody: its scroll area has no definite height, and whole-page roots (AppShell)
            must fill the frame, which scrolls the story itself like a browser window. */}
        <div className={cn('flex min-h-0 flex-1 flex-col px-24 pb-24', stepping && 'md:px-48')}>
          <div
            data-preview-frame=''
            className='flex min-h-0 flex-1 overflow-auto rounded-12 border border-border-primary-light bg-bg-page-bg'
          >
            <div className={cn(FULLSCREEN_FRAME, FILL_APP_SHELL, 'flex-1')}>
              <LoadedStory key={`${template.slug}#${story}`} load={template.load} name={story} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className='flex w-full flex-wrap items-center justify-end gap-8'>
            {stepping && (
              <span className='mr-auto hidden items-center gap-6 text-sm text-text-secondary md:flex'>
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
                to switch templates
              </span>
            )}
            <Copyable text={code ?? ''}>
              <Button variant='outline' color='neutral' size='medium' disabled={!code}>
                <CopyableIcon />
                <CopyableLabel idle='Copy code' />
              </Button>
            </Copyable>
            <Button asChild variant='outline' color='neutral' size='medium'>
              <a
                href={storybookStoryUrl(template.slug, template.title, story)}
                target='_blank'
                rel='noopener noreferrer'
              >
                Open in Storybook
                <ExternalLink />
              </a>
            </Button>
            {template.link && (
              <Button asChild size='medium'>
                <Link href={withBase(template.link)}>Open docs page</Link>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** StoryPreview's Expand button on pattern and template pages: the story alone in the dialog. */
export function ExpandStory({ load, name }: { load: StoryLoader; name: string }) {
  const { page } = usePage();
  const { frontmatter } = useFrontmatter();
  const [open, setOpen] = useState(false);
  const template: PreviewTemplate = {
    slug: page.routePath.replace(/^\/|\/$/g, ''),
    title: page.title,
    description: frontmatter.description,
    load,
    stories: [name],
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            color='neutral'
            size='medium'
            aria-label='Expand preview'
            className='ml-auto'
            onClick={() => setOpen(true)}
          >
            <Maximize2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Expand</TooltipContent>
      </Tooltip>
      <TemplatePreviewDialog
        open={open}
        template={template}
        story={name}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
