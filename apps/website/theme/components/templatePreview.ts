import { STORYBOOK_URL } from '../storybookRedirect';

const words = (name: string): string[] =>
  name.split(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);

/** Story export → state label: 'NoData' → 'No data'; acronyms ('API') keep their case. */
export const storyLabel = (name: string): string =>
  words(name)
    .map((w, i) => (i === 0 || /^[A-Z0-9]+$/.test(w) ? w : w.toLowerCase()))
    .join(' ');

const storyId = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * A guideline story in Storybook. Guideline stories are titled `Patterns/<title>` or
 * `Templates/<title>` (the mcp-core schema), and story ids come from the export name.
 */
export const storybookStoryUrl = (slug: string, title: string, story: string): string => {
  const section = slug.split('/')[0] ?? '';
  const kind = `${section.charAt(0).toUpperCase()}${section.slice(1)}/${title}`;
  return `${STORYBOOK_URL}?path=/story/${storyId(kind)}--${words(story).join('-').toLowerCase()}`;
};

export interface PreviewParams {
  /** Page name of the previewed template (`security-dashboard`), or `null` when closed. */
  preview: string | null;
  /** Story export name; `null` means the default (first) story. */
  state: string | null;
}

export const parsePreviewParams = (search: string): PreviewParams => {
  const params = new URLSearchParams(search);
  return { preview: params.get('preview') || null, state: params.get('state') || null };
};

/** `search` with the preview params set (or removed when `preview` is `null`); other params stay. */
export const withPreviewParams = (search: string, { preview, state }: PreviewParams): string => {
  const params = new URLSearchParams(search);
  params.delete('preview');
  params.delete('state');
  if (preview) params.set('preview', preview);
  if (preview && state) params.set('state', state);
  const query = params.toString();
  return query ? `?${query}` : '';
};

// The dialog's own state switcher, the story frame (anything in it may use the arrows) and, as a
// cheap guard, any text field.
const OWNS_ARROW_KEYS = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="radiogroup"]',
  '[data-preview-frame]',
].join(',');

/** Whether ArrowLeft/ArrowRight on `target` belongs to the focused widget, not template stepping. */
export const ownsArrowKeys = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest(OWNS_ARROW_KEYS) !== null;
