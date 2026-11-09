import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { routePathToMdPath, withBase, withSiteOrigin } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme-original';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Card } from '@wallarm-org/design-system/Card';
import { ArrowRight } from '@wallarm-org/design-system/icons/ArrowRight';
import { Maximize2 } from '@wallarm-org/design-system/icons/Maximize2';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { cn } from '@wallarm-org/design-system/utils/cn';
import { FILL_APP_SHELL, FULLSCREEN_FRAME, StoryError } from './StoryPreview';
import type { PreviewTemplate } from './TemplatePreviewDialog';
import { parsePreviewParams, withPreviewParams } from './templatePreview';
import { useInView } from './useInView';
import { type StoryLoader, useStory } from './useStory';

// Lazy: the dialog stays out of every page's bundle until a preview opens.
const TemplatePreviewDialog = lazy(() =>
  import('./TemplatePreviewDialog').then(m => ({ default: m.TemplatePreviewDialog })),
);

export interface TemplateGalleryProps {
  /** In page order; `link` is the template's docs page. */
  templates: (PreviewTemplate & { description: string; link: string })[];
}

/** Templates are designed for a desktop screen; cards show that screen scaled down. */
const DESIGN_WIDTH = 1440;

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

function ScaledStory({ load, name, scale }: { load: StoryLoader; name: string; scale: number }) {
  const { Story, error } = useStory(load, name);
  if (error) return <StoryError error={error} />;
  if (!Story) return <Skeleton width='100%' height='100%' transparent={false} rounded='none' />;
  return (
    <div
      // A thumbnail is a still: no CSS animation or transition inside it (none, not paused —
      // paused freezes enter animations on their first, often invisible, frame).
      className='absolute top-0 left-0 h-[900px] w-[1440px] origin-top-left **:animate-none **:transition-none'
      // The scale is measured from the card width, so it can't be a class.
      style={{ transform: `scale(${scale})` }}
    >
      <div className={cn(FULLSCREEN_FRAME, FILL_APP_SHELL, 'h-full')}>
        <Story />
      </div>
    </div>
  );
}

/** The template's default story at its design size, scaled to the card; mounted near the viewport. */
function Thumbnail({ load, name }: { load: StoryLoader; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, '200px');
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / DESIGN_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      // Decorative and non-interactive: the card's button is the way in.
      inert
      aria-hidden='true'
      className='pointer-events-none relative aspect-[1440/900] overflow-hidden bg-bg-page-bg select-none'
    >
      {inView && scale > 0 ? (
        <ScaledStory load={load} name={name} scale={scale} />
      ) : (
        <Skeleton width='100%' height='100%' transparent={false} rounded='none' />
      )}
      <div className='absolute inset-0 flex items-center justify-center bg-bg-strong-primary/30 opacity-0 group-hover:opacity-100 group-has-[[data-card-link]:focus-visible]:opacity-100'>
        <span className='flex items-center gap-6 rounded-full bg-bg-surface-1 px-12 py-6 text-sm font-medium text-text-primary shadow-lg'>
          <Maximize2 size='sm' />
          Preview
        </span>
      </div>
    </div>
  );
}

type GalleryTemplate = TemplateGalleryProps['templates'][number];

interface CardProps {
  template: GalleryTemplate;
  preview: () => void;
}

// Stretched over the card, so the whole card opens the preview.
export const STRETCHED =
  'cursor-pointer bg-transparent p-0 text-left font-sans-display text-inherit outline-none after:absolute after:inset-0';

/** The card's focus ring (foundations/focus), drawn while its stretched `data-card-link` has focus. */
const CARD_FOCUS = cn(
  'has-[[data-card-link]:focus-visible]:border-border-strong-primary',
  'has-[[data-card-link]:focus-visible]:ring-3 has-[[data-card-link]:focus-visible]:ring-focus-primary',
);

/** A card opened by its stretched link: brand border on hover, a ring on focus, no transition. */
export const CARD = cn('relative transition-none hover:border-border-brand', CARD_FOCUS);

function TemplateCard({ template, preview }: CardProps) {
  const states = template.stories.length;
  const label = `Preview ${template.title}`;
  return (
    <li className='list-none'>
      <Card className={cn(CARD, 'group gap-0 py-0 hover:shadow-lg')}>
        <Thumbnail load={template.load} name={template.stories[0] ?? 'Default'} />
        <div className='flex flex-1 flex-col gap-6 border-t border-border-primary-light p-16'>
          <div className='flex items-center justify-between gap-8'>
            <h3 className='m-0 text-lg font-medium text-text-primary'>
              <button
                type='button'
                onClick={preview}
                aria-label={label}
                data-card-link
                className={STRETCHED}
              >
                {template.title}
              </button>
            </h3>
            <Badge type='secondary' color='slate' size='small'>
              {states} {states === 1 ? 'state' : 'states'}
            </Badge>
          </div>
          <p className='m-0 line-clamp-2 text-sm text-text-secondary'>{template.description}</p>
          <Link
            href={withBase(template.link)}
            className='relative mt-auto flex w-fit items-center gap-4 pt-6 text-sm font-medium text-text-link-default hover:underline'
          >
            Read the docs
            <ArrowRight size='sm' />
          </Link>
        </div>
      </Card>
    </li>
  );
}

const GRID = 'rp-not-doc m-0 my-24 grid grid-cols-1 gap-24 p-0 md:grid-cols-2';

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

/** Templates landing page: live, scaled-down previews that open a full preview dialog. */
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
