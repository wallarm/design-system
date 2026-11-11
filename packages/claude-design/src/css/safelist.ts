const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'];
const CONTAINERS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];
const FRACTIONS = ['1/2', '1/3', '2/3', '1/4', '3/4'];
const PADDING = ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl'];
const LAYOUT = ['hidden', 'block', 'flex', 'grid', 'flex-row', 'flex-col', 'flex-wrap'];

/** Utilities used by canvas-authored markup, in addition to scanned components. */
export function canvasSafelist(tokenNames: Set<string>): string[] {
  const classes = new Set([
    'block',
    'inline-block',
    'inline',
    'hidden',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'flex-row',
    'flex-col',
    'flex-row-reverse',
    'flex-col-reverse',
    'flex-wrap',
    'flex-nowrap',
    'flex-1',
    'flex-auto',
    'flex-none',
    'grow',
    'grow-0',
    'shrink',
    'shrink-0',
    'items-start',
    'items-center',
    'items-end',
    'items-stretch',
    'items-baseline',
    'justify-start',
    'justify-center',
    'justify-end',
    'justify-between',
    'justify-around',
    'justify-evenly',
    'self-start',
    'self-center',
    'self-end',
    'self-stretch',
    'place-items-center',
    'col-span-full',
    'row-span-full',
    'grid-flow-row',
    'grid-flow-col',
    'auto-rows-auto',
    'relative',
    'absolute',
    'fixed',
    'sticky',
    'inset-0',
    'top-0',
    'right-0',
    'bottom-0',
    'left-0',
    'w-full',
    'h-full',
    'w-screen',
    'h-screen',
    'w-auto',
    'h-auto',
    'w-fit',
    'h-fit',
    'min-w-0',
    'min-h-0',
    'min-h-screen',
    'max-w-full',
    'max-w-none',
    'max-w-screen',
    'overflow-hidden',
    'overflow-auto',
    'overflow-x-auto',
    'overflow-y-auto',
    'mx-auto',
    'ml-auto',
    'mr-auto',
    'mt-auto',
    'mb-auto',
    'font-sans',
    'font-sans-display',
    'font-mono',
    'font-pixel',
    'text-left',
    'text-center',
    'text-right',
    'truncate',
    'whitespace-nowrap',
    'break-words',
    'border',
    'border-t',
    'border-r',
    'border-b',
    'border-l',
    'border-0',
  ]);
  for (let index = 1; index <= 12; index++) {
    classes.add(`grid-cols-${index}`);
    classes.add(`col-span-${index}`);
    classes.add(`row-span-${index}`);
  }
  for (const fraction of FRACTIONS) classes.add(`w-${fraction}`);
  for (const size of CONTAINERS) classes.add(`max-w-${size}`);
  for (const size of BREAKPOINTS) classes.add(`max-w-screen-${size}`);
  classes.add('divide-x');
  classes.add('divide-y');
  const spacing: string[] = ['0'];
  const borders: string[] = [];
  const surfaces: string[] = [];
  for (const property of tokenNames) {
    const name = property.replace(/^--/, '');
    if (name.startsWith('spacing-')) spacing.push(name.slice(8));
    if (name.startsWith('color-border-')) borders.push(name.slice(6));
    if (/^color-bg-(surface-|page-bg$|light-)/.test(name)) surfaces.push(name.slice(6));
  }
  // The author layout kit: what page structure needs, on our scale only.
  for (const size of spacing) {
    classes.add(`space-x-${size}`);
    classes.add(`space-y-${size}`);
  }
  for (const color of borders) classes.add(`divide-${color}`);
  const responsive = [
    ...LAYOUT,
    ...Array.from({ length: 12 }, (_, index) => [
      `grid-cols-${index + 1}`,
      `col-span-${index + 1}`,
    ]).flat(),
    ...spacing.flatMap(size =>
      [...PADDING, 'gap', 'gap-x', 'gap-y'].map(prefix => `${prefix}-${size}`),
    ),
  ];
  for (const breakpoint of BREAKPOINTS.slice(0, 4)) {
    for (const name of responsive) classes.add(`${breakpoint}:${name}`);
  }
  const edges = ['border-0', 'border-t-0', 'border-r-0', 'border-b-0', 'border-l-0'];
  for (const variant of ['hover', 'first', 'last']) {
    for (const color of surfaces) classes.add(`${variant}:bg-${color}`);
    for (const color of borders) classes.add(`${variant}:border-${color}`);
    if (variant === 'hover') continue;
    for (const edge of edges) classes.add(`${variant}:${edge}`);
    for (const size of spacing) {
      for (const prefix of ['pt', 'pr', 'pb', 'pl']) classes.add(`${variant}:${prefix}-${size}`);
    }
  }
  for (const property of tokenNames) {
    const name = property.replace(/^--/, '');
    if (name.startsWith('color-')) {
      const color = name.slice(6);
      // Include every semantic color even when no current component uses it.
      for (const prefix of ['bg', 'text', 'border']) classes.add(`${prefix}-${color}`);
    }
    if (name.startsWith('spacing-')) {
      const size = name.slice(8);
      for (const prefix of [
        'p',
        'px',
        'py',
        'pt',
        'pr',
        'pb',
        'pl',
        'm',
        'mx',
        'my',
        'mt',
        'mr',
        'mb',
        'ml',
        'gap',
        'gap-x',
        'gap-y',
        'w',
        'h',
        'max-w',
        'max-h',
        'min-w',
        'min-h',
      ]) {
        classes.add(`${prefix}-${size}`);
      }
    }
    if (name.startsWith('radius-')) classes.add(`rounded-${name.slice(7)}`);
    if (name.startsWith('shadow-')) classes.add(name);
  }
  return [...classes].sort();
}
