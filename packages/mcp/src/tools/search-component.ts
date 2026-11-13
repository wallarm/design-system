import type { ComponentMetadata, DesignSystemMetadata } from '@wallarm-org/mcp-core';

interface SearchResult {
  name: string;
  description?: string;
  importPath: string;
  score: number;
}

/**
 * Words people type for a UI concept → the DS components that implement it. Keys are normalized
 * phrases (see `words`); every target must be a real component (checked by tests).
 */
export const ALIASES: Record<string, string[]> = {
  modal: ['Dialog'],
  popup: ['Dialog', 'Popover'],
  confirm: ['Dialog'],
  confirmation: ['Dialog'],
  sidebar: ['RemoteShell', 'NavRail', 'AppShell', 'Drawer'],
  'side panel': ['Drawer'],
  sheet: ['Drawer'],
  flyout: ['Drawer', 'Popover'],
  navigation: ['NavRail', 'RemoteShell', 'TopHeader', 'Breadcrumbs'],
  nav: ['NavRail', 'RemoteShell'],
  header: ['TopHeader', 'Heading'],
  layout: ['Page', 'AppShell', 'Stack', 'Flex'],
  toast: ['Toast'],
  snackbar: ['Toast'],
  notification: ['Toast', 'Alert', 'Banner', 'NotificationCenter'],
  callout: ['Alert', 'Banner'],
  dropdown: ['Select', 'DropdownMenu'],
  combobox: ['Select'],
  autocomplete: ['Select'],
  'context menu': ['DropdownMenu'],
  menu: ['DropdownMenu'],
  'empty state': ['EmptyState'],
  'no data': ['EmptyState'],
  'date picker': ['DateInput', 'DateRangeInput', 'Calendar'],
  datepicker: ['DateInput', 'DateRangeInput', 'Calendar'],
  'date range': ['DateRangeInput'],
  'time picker': ['TimeInput'],
  grid: ['Table'],
  bulk: ['Table'],
  'action bar': ['Table'],
  'row selection': ['Table'],
  'data table': ['Table'],
  datagrid: ['Table'],
  chart: ['SimpleCharts'],
  graph: ['SimpleCharts'],
  spinner: ['Loader'],
  toggle: ['Switch', 'ToggleButton'],
  upload: ['FileUpload'],
  dropzone: ['FileUpload'],
  hint: ['Tooltip'],
  'hover card': ['HoverCard'],
  'user card': ['HoverCard'],
  'agent card': ['HoverCard'],
  'profile card': ['HoverCard'],
  chip: ['Tag', 'Badge'],
  pill: ['Tag', 'Badge'],
  label: ['Tag', 'Badge'],
  form: ['Field', 'Input'],
  'form field': ['Field'],
  'text field': ['Input'],
  multiline: ['Textarea'],
  search: ['SearchInput', 'SearchModal'],
  'command palette': ['SearchModal'],
  'code block': ['CodeSnippet', 'CodeEditor'],
  copy: ['Copyable'],
  wizard: ['Stepper'],
  collapse: ['Accordion'],
  collapsible: ['Accordion'],
  disclosure: ['Accordion'],
  paginator: ['Pagination'],
  otp: ['InputOTP'],
  divider: ['Separator'],
  'keyboard shortcut': ['Kbd'],
  hotkey: ['Kbd'],
  filter: ['FilterInput', 'FilterDropdown', 'FilterCascade'],
  status: ['Badge', 'Indicator'],
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'for',
  'with',
  'of',
  'to',
  'in',
  'and',
  'or',
  'component',
  'ui',
]);

const singular = (w: string) =>
  w.length > 4 && w.endsWith('ies')
    ? `${w.slice(0, -3)}y`
    : w.length > 3 && w.endsWith('s') && !w.endsWith('ss')
      ? w.slice(0, -1)
      : w;

/** `EmptyStates`, `empty-state`, `empty states` → `['empty', 'state']`. */
export const words = (text: string): string[] =>
  text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(w => w && !STOP_WORDS.has(w))
    .map(singular);

/** Share of query words found in `field` (prefix match for words of 4+ letters). */
const coverage = (query: string[], field: string[]): number => {
  if (query.length === 0 || field.length === 0) return 0;
  const hits = query.filter(q => field.some(f => f === q || (q.length >= 4 && f.startsWith(q))));
  return hits.length / query.length;
};

function scoreComponent(
  component: ComponentMetadata,
  query: string,
  aliasHits: Set<string>,
): number {
  const q = query.trim().toLowerCase();
  const name = component.name.toLowerCase();

  if (name === q || words(component.name).join(' ') === words(query).join(' ')) return 100;
  if (aliasHits.has(component.name)) return 90;
  if (q && name.startsWith(q)) return 80;
  if (q.length >= 3 && name.includes(q)) return 60;

  const qw = words(query);
  const nameScore = 60 * coverage(qw, words(component.name));
  const descScore = 40 * coverage(qw, words(component.description ?? ''));
  const propScore =
    30 *
    coverage(
      qw,
      component.props.flatMap(p => words(p.name)),
    );
  const variantScore =
    20 *
    coverage(
      qw,
      component.variants.flatMap(v => [...words(v.name), ...v.options.flatMap(words)]),
    );
  const subScore =
    15 *
    coverage(
      qw,
      component.subComponents.flatMap(s => words(s.name)),
    );

  return Math.round(Math.max(nameScore, descScore, propScore, variantScore, subScore));
}

/** Components whose alias phrase appears (as whole words) in the query. */
function aliasMatches(query: string): Set<string> {
  const q = ` ${words(query).join(' ')} `;
  const hits = new Set<string>();
  for (const [phrase, targets] of Object.entries(ALIASES))
    if (q.includes(` ${words(phrase).join(' ')} `)) for (const t of targets) hits.add(t);
  return hits;
}

/**
 * Word-based search over component names, descriptions, prop names, variants and sub-component
 * names, plus the `ALIASES` map. Prop types are not searched (they matched almost anything).
 */
export function searchComponents(metadata: DesignSystemMetadata, query: string): SearchResult[] {
  const aliasHits = aliasMatches(query);
  return metadata.components
    .map(c => ({
      name: c.name,
      description: c.description,
      importPath: c.importPath,
      score: scoreComponent(c, query, aliasHits),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
