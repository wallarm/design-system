import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { routePathToMdPath, withBase, withSiteOrigin } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme-original';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Button } from '@wallarm-org/design-system/Button';
import { Card } from '@wallarm-org/design-system/Card';
import { ArrowRight } from '@wallarm-org/design-system/icons/ArrowRight';
import { Maximize2 } from '@wallarm-org/design-system/icons/Maximize2';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { cn } from '@wallarm-org/design-system/utils/cn';
// Internal DS seams (as in claude-design's Root): DS imports resolve to src, so these are the same
// context instances the template's components read.
import { OverlayBoundaryContext } from '../../../../packages/design-system/src/lib/portal/OverlayBoundaryContext';
import { PortalContainerContext } from '../../../../packages/design-system/src/lib/portal/PortalContainerContext';
import { FILL_APP_SHELL, FULLSCREEN_FRAME, LoadedStory } from './StoryPreview';
import type { PreviewTemplate } from './TemplatePreviewDialog';
import { parsePreviewParams, withPreviewParams } from './templatePreview';
import { useInView } from './useInView';
import type { StoryLoader } from './useStory';

// Lazy: the dialog stays out of every page's bundle until a preview opens.
const TemplatePreviewDialog = lazy(() =>
  import('./TemplatePreviewDialog').then(m => ({ default: m.TemplatePreviewDialog })),
);

export interface TemplateGalleryProps {
  /** In page order; `link` is the template's docs page. */
  templates: (PreviewTemplate & { description: string; link: string })[];
}

const pageName = (slug: string): string => slug.split('/').at(-1) ?? slug;

/**
 * Every template, in page order, from the rspress.config.ts define (unset under Rstest). Built once
 * at module scope: useStory reloads whenever its loader changes identity.
 */
export const TEMPLATES: TemplateGalleryProps['templates'] = (import.meta.env.TEMPLATES ?? []).map(
  t => ({
    ...t,
    link: `/${t.slug}`,
    load: () =>
      import(
        `../../../../packages/design-system/src/guidelines/templates/${pageName(t.slug)}.stories.tsx`
      ),
  }),
);

/**
 * The template's default story, live and interactive, zoomed to 80% so its 1440px design fits.
 * Zoom (not a transform) keeps layout and hit-testing real. Everything the story portals (drawers,
 * menus, tooltips, bulk bars) renders into a host inside the zoomed box instead of the page body, and
 * the box contains layout and paint, so `position: fixed` resolves against the card: overlays open,
 * pin and clip inside it. Overlays pinned to the viewport's edge (the table action bar) pin to the
 * box's edge instead, through OverlayBoundaryContext. The story scrolls in its own layer, so pinned
 * bars stay put. The frame keeps the desktop 1440:900 proportion and mounts near the viewport.
 */
function LiveTemplate({ load, name, title }: { load: StoryLoader; name: string; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const boundary = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, '200px');
  return (
    <section
      ref={ref}
      aria-label={`${title}, live`}
      className='relative aspect-[1440/900] overflow-hidden bg-bg-page-bg'
    >
      <PortalContainerContext.Provider value={host}>
        <OverlayBoundaryContext.Provider value={boundary}>
          <div ref={boundary} className={ZOOMED}>
            <div className={cn(FULLSCREEN_FRAME, FILL_APP_SHELL, 'size-full overflow-auto')}>
              {inView ? (
                <LoadedStory load={load} name={name} />
              ) : (
                <Skeleton width='100%' height='100%' transparent={false} rounded='none' />
              )}
            </div>
            <div ref={host} />
          </div>
        </OverlayBoundaryContext.Provider>
      </PortalContainerContext.Provider>
    </section>
  );
}

/** 80% zoom; percentages inside a zoomed box resolve in its zoomed space, so `size-full` lays the
 *  screen out at 125% of the frame and still fills it. `contain` makes it the containing block of
 *  the overlays' `position: fixed`. */
const ZOOMED = 'absolute inset-0 size-full [zoom:0.8] [contain:layout_paint]';

type GalleryTemplate = TemplateGalleryProps['templates'][number];

interface CardProps {
  template: GalleryTemplate;
  preview: () => void;
}

/** Heading, description and actions above the card; the heading is an anchor (`#<page>`). */
function TemplateCard({ template, preview }: CardProps) {
  const states = template.stories.length;
  const anchor = pageName(template.slug);
  return (
    <li id={anchor} className='flex list-none scroll-mt-80 flex-col gap-12'>
      <div className='flex items-end justify-between gap-16'>
        <div className='flex min-w-0 flex-col gap-6'>
          <div className='group/heading flex items-center gap-8'>
            <h2 className='m-0 border-none p-0 text-xl font-medium text-text-primary'>
              {template.title}
            </h2>
            <a
              href={`#${anchor}`}
              aria-label={`Link to ${template.title}`}
              className='text-lg text-text-secondary no-underline opacity-0 group-hover/heading:opacity-100 focus-visible:opacity-100 hover:text-text-link-default'
            >
              #
            </a>
            <Badge type='secondary' color='slate' size='small'>
              {states} {states === 1 ? 'state' : 'states'}
            </Badge>
          </div>
          <p className='m-0 text-sm text-text-secondary'>{template.description}</p>
        </div>
        <div className='flex shrink-0 items-center gap-12'>
          <Link
            href={withBase(template.link)}
            className='flex items-center gap-4 text-sm font-medium text-text-link-default hover:underline'
          >
            Read the docs
            <ArrowRight size='sm' />
          </Link>
          <Button
            variant='outline'
            color='neutral'
            size='medium'
            onClick={preview}
            aria-label={`Open ${template.title} full screen`}
          >
            <Maximize2 />
            Full screen
          </Button>
        </div>
      </div>
      <Card className='gap-0 overflow-hidden p-0'>
        <LiveTemplate
          load={template.load}
          name={template.stories[0] ?? 'Default'}
          title={template.title}
        />
      </Card>
    </li>
  );
}

const GRID = 'rp-not-doc m-0 my-24 grid grid-cols-1 gap-48 p-0';

interface PreviewState {
  index: number;
  story: string;
  open: boolean;
}

/** Marks history entries pushed by the gallery, so closing the preview can go back over them. */
const HISTORY_MARK = 'templatePreview';

/** `?preview=<page>&state=<Story>` for `next`; the default story leaves `state` out. */
const previewParams = (templates: GalleryTemplate[], next: PreviewState) => {
  const t = templates[next.index];
  return next.open && t
    ? { preview: pageName(t.slug), state: next.story === t.stories[0] ? null : next.story }
    : { preview: null, state: null };
};

const writeUrl = (templates: GalleryTemplate[], next: PreviewState, push: boolean) => {
  const search = withPreviewParams(window.location.search, previewParams(templates, next));
  const url = `${window.location.pathname}${search}${window.location.hash}`;
  // Only a pushed entry is marked; a replace keeps the entry's own state (and mark).
  if (push) window.history.pushState({ ...window.history.state, [HISTORY_MARK]: true }, '', url);
  else window.history.replaceState(window.history.state, '', url);
};

function Gallery({ templates }: TemplateGalleryProps) {
  const [preview, setPreview] = useState<PreviewState>({ index: 0, story: '', open: false });
  // The dialog loads on the first open and then stays mounted, so it can animate out.
  const [dialogLoaded, setDialogLoaded] = useState(false);
  if (preview.open && !dialogLoaded) setDialogLoaded(true);
  const current = templates[preview.index] ?? templates[0];

  const show = (next: PreviewState, push: boolean) => {
    setPreview(next);
    writeUrl(templates, next, push);
  };

  // The URL is the source of truth on load and on back/forward: ?preview=<page>&state=<Story>.
  useEffect(() => {
    const fromUrl = () => {
      const params = parsePreviewParams(window.location.search);
      const index = templates.findIndex(t => pageName(t.slug) === params.preview);
      const t = templates[index];
      const next: PreviewState = t
        ? {
            index,
            story:
              params.state && t.stories.includes(params.state)
                ? params.state
                : (t.stories[0] ?? ''),
            open: true,
          }
        : { index: 0, story: '', open: false };
      setPreview(p => (t ? next : { ...p, open: false }));
      // An unknown template or state is dropped from the URL, so it isn't shared on.
      const shown = previewParams(templates, next);
      if (shown.preview !== params.preview || shown.state !== params.state)
        writeUrl(templates, next, false);
    };
    fromUrl();
    window.addEventListener('popstate', fromUrl);
    return () => window.removeEventListener('popstate', fromUrl);
  }, [templates]);

  const open = (index: number) =>
    show({ index, story: templates[index]?.stories[0] ?? '', open: true }, true);

  // Stepping replaces the entry, so Back always closes the preview.
  const step = (delta: number) => {
    const index = (preview.index + delta + templates.length) % templates.length;
    show({ index, story: templates[index]?.stories[0] ?? '', open: true }, false);
  };

  const close = () => {
    setPreview(p => ({ ...p, open: false }));
    // Opened here: go back over our entry. Opened from a shared link: drop the params in place.
    if (window.history.state?.[HISTORY_MARK]) window.history.back();
    else writeUrl(templates, { ...preview, open: false }, false);
  };

  return (
    <>
      <ul className={GRID}>
        {templates.map((t, index) => (
          <TemplateCard key={t.slug} template={t} preview={() => open(index)} />
        ))}
      </ul>
      {current && dialogLoaded && (
        <Suspense fallback={null}>
          <TemplatePreviewDialog
            open={preview.open}
            template={current}
            story={preview.story || (current.stories[0] ?? '')}
            onStoryChange={story => show({ ...preview, story }, false)}
            onClose={close}
            onPrev={templates.length > 1 ? () => step(-1) : undefined}
            onNext={templates.length > 1 ? () => step(1) : undefined}
          />
        </Suspense>
      )}
    </>
  );
}

/** Templates landing page: one live, clickable template per row, each with a full-screen preview. */
export function TemplateGallery({ templates = TEMPLATES }: Partial<TemplateGalleryProps>) {
  // Truthy check: a boolean define in builds, a string env var under Rstest. Links point at the
  // pages' markdown, like the ones Rspress rewrites in MDX.
  if (import.meta.env.SSG_MD) {
    return (
      <ul>
        {templates.map(t => (
          <li key={t.slug}>
            <a href={withSiteOrigin(routePathToMdPath(t.link))}>{t.title}</a>: {t.description}
          </li>
        ))}
      </ul>
    );
  }
  return <Gallery templates={templates} />;
}

// Rspress injects markdown.globalComponents as default imports.
export default TemplateGallery;
