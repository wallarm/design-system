/**
 * How an answer should be put together, beyond what each entry's description says: the rules a
 * model is prompted with (`compositionPrompt`) and the check for the ones a node tree shows
 * (`checkComposition`). The rules come from the catalog and the recorded answers in `fixtures/`;
 * every recorded answer passes the check with no warning.
 */
import type { AnswerNode, GenUiIssue } from './check';

/** One rule per line, the reason after the dash. Pass them as extra prompt rules. */
export const COMPOSITION_RULES: readonly string[] = [
  'Answer with one root Section: a title saying what the page is and a one-line subtitle with its scope or period (a short chat reply may be a column Stack with a Heading). — The reader knows at once what they are looking at.',
  'Order a page top-down: an optional one-line summary (Text, or one Alert), then the KPIs as Metric tiles in a Grid (3-4 columns), then the charts in a Grid (2-3 columns), then the detail Table, then the action Buttons in a row Stack. — The headline comes before the detail.',
  'Put a Metric in a Grid or a row Stack with its peers, never alone in a column. — A tile is sized to sit in a row.',
  'Pick the chart by the shape of the data: values over time are a LineChart (a trend) or an AreaChart (volumes; stacked when the series add up to a total), counts per time bucket a ColumnChart; a ranked top-N is a BarList; the parts of one total (2-6 parts) a PieChart or HorizontalBarStack; one number is a Metric. — The wrong chart hides the answer: a pie of 15 slices, a line of categories.',
  'Several comparable records are a Table; one record (an attack, a host, a rule) is a KeyValueList; an ordered history is a Timeline; a hierarchy is a Tree; short plain items are a List. — A one-row table is harder to read than label-value lines.',
  'Never put a Card inside a Card, and never wrap a Metric or a chart in a Card: they draw their own card. Use Card for plain content only (a Heading with a List, a KeyValueList, a form). — A box in a box is noise.',
  'Give a Grid two or more children and Tabs two or more panes that are real alternatives; otherwise put the blocks straight into the Section. — A one-cell grid or a single tab is layout with nothing to lay out.',
  'When there is nothing to show, answer with an EmptyState that says why (with a button that widens the search when it can), never an empty Table or chart. — An empty chart looks broken.',
  'Use an Alert for a finding the user must act on, at most three on a page; an explanation is Text. — When everything is highlighted, nothing is.',
  "Bind every figure, row and series to the app's data path; never write a number you computed or guessed. — The app's data is right, and stays live.",
  'Keep text short: titles of 1-4 words, a one-line subtitle, Text of 1-2 sentences, no markdown. — The components carry the content; prose repeats it.',
  'A form is its fields in a Card or Section, two short fields side by side in a 2-column Grid, then the submit Button in a row Stack whose action context reads every field path. — The user fills it top to bottom and sends it once.',
  'Keep the tree shallow (at most 6 levels) and do not wrap one component in a Stack, Grid or Card just to group it. — Every level adds spacing the reader has to parse.',
];

/** The rules as one prompt section, for a prompt that takes free text (`a2uiPrompt` adds it). */
export const compositionPrompt = (): string =>
  ['## Composition', ...COMPOSITION_RULES.map(rule => `- ${rule}`)].join('\n');

/** Entries that draw their own card: a Card around them is a card in a card. */
const CARDED = new Set([
  'Card',
  'Metric',
  'LineChart',
  'AreaChart',
  'ColumnChart',
  'BarList',
  'PieChart',
  'HorizontalBarStack',
]);
/** Overlays: what they hold opens in its own layer, so it starts a new card and depth. */
const OVERLAYS = new Set(['Dialog', 'Drawer']);
const MAX_DEPTH = 6;
const MAX_ALERTS = 3;

/**
 * The composition rules a node tree shows, as warnings: the answer renders, but reads worse. An
 * answer that passes `checkNodes` and this check still may break a rule only a reader can judge
 * (which chart fits the data), which is what the evals score.
 */
export const checkComposition = (
  nodes: readonly AnswerNode[],
  rootId: string | undefined,
): GenUiIssue[] => {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const parentOf = new Map<string, AnswerNode>();
  for (const node of nodes) for (const child of node.children) parentOf.set(child, node);
  const issues: GenUiIssue[] = [];
  const warn = (node: AnswerNode, message: string) =>
    issues.push({ id: node.id, component: node.type, message, severity: 'warning' });

  const root = rootId === undefined ? undefined : byId.get(rootId);
  if (
    root &&
    !(root.type === 'Section' || (root.type === 'Stack' && root.props.direction !== 'row'))
  )
    warn(root, 'Put the answer in a Section with a title (or a column Stack for a short reply).');

  /** Every node under `node`, not looking inside overlays. */
  const below = (node: AnswerNode, seen = new Set<string>()): AnswerNode[] =>
    node.children.flatMap(id => {
      const child = byId.get(id);
      if (!child || seen.has(id)) return [];
      seen.add(id);
      return [child, ...(OVERLAYS.has(child.type) ? [] : below(child, seen))];
    });

  for (const node of nodes) {
    const parent = parentOf.get(node.id);
    if (node.type === 'Card') {
      const inner = below(node).find(n => CARDED.has(n.type));
      if (inner)
        warn(
          node,
          `${inner.type} "${inner.id}" draws its own card; drop this Card or put plain content in it.`,
        );
    }
    if ((node.type === 'Grid' || node.type === 'Tabs') && node.children.length < 2)
      warn(
        node,
        `${node.type} has ${node.children.length} ${node.type === 'Tabs' ? 'pane' : 'child'}; give it two or more, or drop it.`,
      );
    if (
      node.type === 'Metric' &&
      !(
        parent &&
        (parent.type === 'Grid' ||
          parent.type === 'GridItem' ||
          (parent.type === 'Stack' && parent.props.direction === 'row'))
      )
    )
      warn(node, 'Put the Metric in a Grid or a row Stack with the other KPIs.');
    if (node.type === 'Separator' && parent) {
      const at = parent.children.indexOf(node.id);
      const next = [parent.children[at - 1], parent.children[at + 1]];
      if (next.some(id => id !== undefined && byId.get(id)?.type === 'Section'))
        warn(node, 'A Separator goes inside a block, not between Sections.');
    }
  }

  const alerts = nodes.filter(node => node.type === 'Alert');
  const lastAlert = alerts[MAX_ALERTS];
  if (lastAlert)
    warn(
      lastAlert,
      `${alerts.length} Alerts: keep Alert for the findings to act on (at most ${MAX_ALERTS}), the rest is Text.`,
    );

  if (root) {
    const deepest = (node: AnswerNode, depth: number, seen: Set<string>): [AnswerNode, number] =>
      node.children.reduce<[AnswerNode, number]>(
        (best, id) => {
          const child = byId.get(id);
          if (!child || seen.has(id)) return best;
          seen.add(id);
          const found = deepest(child, OVERLAYS.has(node.type) ? 1 : depth + 1, seen);
          return found[1] > best[1] ? found : best;
        },
        [node, depth],
      );
    const [node, depth] = deepest(root, 1, new Set([root.id]));
    if (depth > MAX_DEPTH)
      warn(node, `Nested ${depth} levels deep; flatten the layout to ${MAX_DEPTH} levels or less.`);
  }
  return issues;
};
