// Ported from nxds (packages/claude-design/src/wrapper-css.ts).
// A Design canvas mounts every component it places inside
// `<div class="sc-host-x" data-dc-tpl="N" style="display: contents">`, so a
// part such as a Button inside a ButtonGroup sits one or more wrappers deeper
// than our CSS expects. This rewrite gives every structural selector in
// bundle.css a branch that reaches its element through any chain of those
// wrappers, at the specificity the original has. The CSS only loads on the
// canvas, and the branch it starts from still matches a page without
// wrappers exactly as before.
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

/** The class on the `display: contents` div a Design canvas mounts each x-import in. */
export const CANVAS_WRAPPER_CLASS = 'sc-host-x';

const W = `.${CANVAS_WRAPPER_CLASS}`;
const IS_W = `:where(${W})`;
const NOT_W = `:where(:not(${W}))`;
const STRUCTURAL = /[>~+]|:(?:first|last|only)-child|:nth-|-of-type/;
const POSITIONS = new Set([':first-child', ':last-child', ':nth-child']);
const UNSUPPORTED = new Set([
  ':only-child',
  ':nth-last-child',
  ':first-of-type',
  ':last-of-type',
  ':only-of-type',
  ':nth-of-type',
  ':nth-last-of-type',
]);

type Node = selectorParser.Node;
type Specificity = [ids: number, classes: number, types: number];

/** One complex selector as its compounds and the combinators between them. */
interface Complex {
  compounds: Node[][];
  combinators: string[];
}

function fail(selector: string, reason: string): never {
  throw new Error(
    `bundle.css: can't make \`${selector}\` reach through a canvas wrapper: ${reason}.`,
  );
}

// A descendant combinator's value is its whitespace, so it reads back as `' '`.
function combinatorOf(node: selectorParser.Combinator) {
  return node.value.trim() || ' ';
}

function text(nodes: readonly Node[]) {
  return nodes
    .map(node => (node.type === 'combinator' ? spaced(combinatorOf(node)) : String(node).trim()))
    .join('');
}

function parse(selector: string) {
  return selectorParser().astSync(selector).nodes;
}

function split(selector: selectorParser.Selector): Complex {
  let compound: Node[] = [];
  const complex: Complex = { compounds: [compound], combinators: [] };
  for (const node of selector.nodes) {
    if (node.type === 'comment') continue;
    if (node.type !== 'combinator') {
      compound.push(node);
      continue;
    }
    complex.combinators.push(combinatorOf(node));
    compound = [];
    complex.compounds.push(compound);
  }
  return complex;
}

function spaced(combinator: string) {
  return combinator === ' ' ? ' ' : ` ${combinator} `;
}

// Compounds `from` up to `to`, with the combinator before `from` when there is one.
function join(complex: Complex, from = 0, to = complex.compounds.length) {
  return complex.compounds
    .slice(from, to)
    .map((compound, offset) => {
      const combinator = complex.combinators[from + offset - 1];
      return `${combinator === undefined ? '' : spaced(combinator)}${text(compound)}`;
    })
    .join('');
}

// The compounds before `index`, and the combinator that joins them to it.
function lead(complex: Complex, index: number) {
  const combinator = complex.combinators[index - 1];
  if (combinator === undefined) return '';
  return `${join(complex, 0, index)}${spaced(combinator)}`;
}

// `:first-child`, `:last-child`, `:nth-child(…)`, or `:not()` of only those,
// with or without `*` (Tailwind's `not-first:` is `:not(*:first-child)`).
function isPosition(node: Node): boolean {
  if (node.type !== 'pseudo') return false;
  if (POSITIONS.has(node.value)) return true;
  if (node.value !== ':not') return false;
  return node.nodes.every(selector => {
    const [position, ...more] = selector.nodes.filter(inner => inner.type !== 'universal');
    return position !== undefined && more.length === 0 && isPosition(position);
  });
}

function isPseudoElement(node: Node) {
  return node.type === 'pseudo' && node.value.startsWith('::');
}

// A `:has()` target has no child or sibling relation and no position:
// wrappers only add ancestors, so they leave descendant relations unchanged,
// but not which element is a child, a sibling or in a position.
function assertPlainTarget(nodes: readonly Node[], whole: string) {
  for (const node of nodes) {
    if (node.type === 'combinator') {
      const combinator = combinatorOf(node);
      if (combinator !== ' ') fail(whole, `\`${combinator}\` inside :has()`);
      continue;
    }
    if (node.type !== 'pseudo') continue;
    if (node.value === ':has') fail(whole, ':has() inside :has()');
    if (POSITIONS.has(node.value) || UNSUPPORTED.has(node.value)) {
      fail(whole, `${node.value} inside :has()`);
    }
    for (const selector of node.nodes) assertPlainTarget(selector.nodes, whole);
  }
}

function hasPosition(compound: readonly Node[]) {
  return compound.some(isPosition);
}

function positionsOf(compound: readonly Node[]) {
  return text(compound.filter(isPosition));
}

function withoutPositions(compound: readonly Node[]) {
  return text(compound.filter(node => !isPosition(node))) || '*';
}

// `:has(X)` → it. `:has(> X)` → it, or X behind wrappers only.
function relativeHas(pseudo: selectorParser.Pseudo, whole: string) {
  const [argument, ...more] = pseudo.nodes;
  if (!argument || more.length > 0) fail(whole, ':has() with a selector list');
  const [first, ...rest] = argument.nodes.filter(node => node.type !== 'comment');
  if (first?.type !== 'combinator') {
    assertPlainTarget(argument.nodes, whole);
    return pseudo;
  }
  const combinator = combinatorOf(first);
  if (combinator !== '>') fail(whole, `:has(${combinator} …)`);
  assertPlainTarget(rest, whole);
  const target = text(rest);
  const [replaced] = parse(
    `:is(:has(> ${target}), :has(> ${IS_W} ${target}):where(:not(:has(> ${IS_W} :not(${W}) ${target}))))`,
  );
  return replaced?.nodes[0] ?? fail(whole, `\`${target}\` doesn't parse`);
}

// Rewrites the selectors inside `:is`, `:where`, `:not` and `:has`.
function rewriteArguments(compound: Node[], whole: string): Node[] {
  return compound.map(node => {
    if (node.type !== 'pseudo') return node;
    if (node.value === ':has') return relativeHas(node, whole);
    if (![':is', ':where', ':not'].includes(node.value)) return node;
    if (isPosition(node)) return node;
    const copy = node.clone({ nodes: [] });
    for (const selector of node.nodes) {
      for (const branch of alternatives(selector, whole)) {
        for (const parsed of parse(branch)) copy.append(parsed);
      }
    }
    return copy;
  });
}

// `A > B` → it, or B behind wrappers only. A position on B moves to the
// outermost wrapper, which holds B's place among A's children.
function childBranches(complex: Complex, index: number) {
  const parent = text(complex.compounds[index] ?? []);
  const child = complex.compounds[index + 1] ?? [];
  const target = `${withoutPositions(child)}${NOT_W}`;
  const outer = `${IS_W}${positionsOf(child)}`;
  const guard = `:where(:not(${parent} > ${IS_W} :not(${W}) ${target}))`;
  const head = join(complex, 0, index + 1);
  const tail = join(complex, index + 2);
  return [`${head} > ${text(child)}${NOT_W}${tail}`, `${head} > ${outer} ${target}${guard}${tail}`];
}

// A part's own position, such as `tr:last-child`: when the part is wrapped,
// the outermost wrapper holds its place among its parent's children. Compounds
// after it, such as the `button` in `td:first-child button`, stay attached.
function positionBranches(complex: Complex, index: number, whole: string) {
  const own = complex.compounds[index] ?? [];
  const target = withoutPositions(own);
  if (target === '*') fail(whole, 'a position on a part with nothing to find it by');
  if (target.includes(':has(')) fail(whole, ':has() on a positioned part');
  const outermost = `${IS_W}${positionsOf(own)}:where(:not(${W} > *)):where(:not(:has(:not(${W}) ${target})))`;
  const before = lead(complex, index);
  const tail = join(complex, index + 1);
  return [
    `${before}${text(own)}:where(:not(${W} > *))${tail}`,
    `${before}${outermost} ${target}${tail}`,
  ];
}

// `A ~ B` (Tailwind's peer variant) or `A + B`, as the selector's last
// relation: either sibling, or both, can sit behind wrappers. A path before A,
// such as AvatarGroup's `G >`, then leads to A's outermost wrapper.
function siblingBranches(complex: Complex, whole: string) {
  const last = complex.compounds.length - 1;
  const combinator = complex.combinators[last - 1] ?? '~';
  const before = text(complex.compounds[last - 1] ?? []);
  const after = `${text(complex.compounds[last] ?? [])}${NOT_W}`;
  if (before.includes(':has(')) fail(whole, ':has() on a sibling');
  const wrappedBefore = `${IS_W}:has(${before}):where(:not(:has(:not(${W}) ${before})))`;
  return [before, wrappedBefore].flatMap(sibling => {
    const prefix = `${lead(complex, last - 1)}${sibling} ${combinator}`;
    return [
      `${prefix} ${after}`,
      `${prefix} ${IS_W} ${after}:where(:not(${prefix} ${IS_W} :not(${W}) ${after}))`,
    ];
  });
}

/** `selector` and the branches that reach its element through wrappers. */
function alternatives(selector: selectorParser.Selector, whole: string): string[] {
  const parts = split(selector);
  const complex: Complex = {
    compounds: parts.compounds.map(compound => rewriteArguments(compound, whole)),
    combinators: parts.combinators,
  };
  const { compounds, combinators } = complex;
  const siblings = combinators.filter(combinator => /[~+]/.test(combinator));
  const children = combinators.flatMap((combinator, index) => (combinator === '>' ? [index] : []));
  const positioned = compounds.flatMap((compound, index) => (hasPosition(compound) ? [index] : []));
  const structural = siblings.length + children.length + positioned.length > 0;
  if (structural && compounds.flat().some(isPseudoElement)) {
    fail(whole, 'a pseudo-element on a wrapped part');
  }
  if (siblings.length > 1) fail(whole, 'more than one sibling relation');
  if (siblings.length === 1) {
    if (!/[~+]/.test(combinators.at(-1) ?? '')) {
      fail(whole, 'a sibling relation before another relation');
    }
    if (positioned.length > 0) {
      fail(whole, 'a position with a sibling relation');
    }
    return siblingBranches(complex, whole);
  }
  if (children.length > 1) fail(whole, 'more than one `>`');
  const [child] = children;
  if (child !== undefined) {
    if (positioned.some(index => index !== child + 1)) {
      fail(whole, 'a position away from the `>` child');
    }
    return childBranches(complex, child);
  }
  const [own, ...others] = positioned;
  if (own === undefined) return [join(complex)];
  if (others.length > 0) fail(whole, 'positions on two compounds');
  return positionBranches(complex, own, whole);
}

function compare(a: Specificity, b: Specificity) {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function specificityOf(nodes: readonly Node[]): Specificity {
  const total: Specificity = [0, 0, 0];
  for (const node of nodes) {
    const [ids, classes, types] = nodeSpecificity(node);
    total[0] += ids;
    total[1] += classes;
    total[2] += types;
  }
  return total;
}

function nodeSpecificity(node: Node): Specificity {
  if (node.type === 'id') return [1, 0, 0];
  if (node.type === 'class' || node.type === 'attribute') return [0, 1, 0];
  if (node.type === 'tag') return [0, 0, 1];
  if (node.type !== 'pseudo') return [0, 0, 0];
  if (node.value === ':where') return [0, 0, 0];
  if (node.value.startsWith('::')) return [0, 0, 1];
  if (![':is', ':not', ':has'].includes(node.value)) return [0, 1, 0];
  const branches = node.nodes.map(selector => specificityOf(selector.nodes));
  return branches.sort(compare).at(-1) ?? [0, 0, 0];
}

function hasOf(argument: selectorParser.Selector) {
  return argument.nodes.some(node => node.type === 'tag' && node.value.toLowerCase() === 'of');
}

// Positions a wrapper changes and no branch can restore.
function assertSupported(selector: selectorParser.Selector, whole: string) {
  selector.walkPseudos(pseudo => {
    if (UNSUPPORTED.has(pseudo.value)) {
      fail(whole, `${pseudo.value} has no wrapper-tolerant form`);
    }
    if (pseudo.value === ':nth-child' && pseudo.nodes.some(hasOf)) {
      fail(whole, ':nth-child(… of …) has no wrapper-tolerant form');
    }
  });
}

function rewriteSelector(selector: string) {
  return parse(selector).flatMap(parsed => {
    assertSupported(parsed, selector);
    const expected = specificityOf(parsed.nodes);
    return alternatives(parsed, selector).map(branch => {
      const [rewritten] = parse(branch);
      if (compare(specificityOf(rewritten?.nodes ?? []), expected) !== 0) {
        fail(selector, `\`${branch}\` changes its specificity`);
      }
      return branch;
    });
  });
}

// Wrappers pass their parent's corners on, so a part that inherits its radius
// (an avatar's image, a bubble's content) keeps it.
const WRAPPER_RULE = `${IS_W} { border-radius: inherit; }`;

function insideKeyframes(rule: postcss.Rule) {
  const { parent } = rule;
  return parent?.type === 'atrule' && (parent as postcss.AtRule).name.endsWith('keyframes');
}

/**
 * bundle.css with every structural selector reaching through canvas wrappers.
 * Our classes carry no prefix, so this walks every rule; a selector with no
 * wrapper-tolerant form keeps its original text and is reported in `skipped`.
 */
export function tolerateCanvasWrappers(css: string): { css: string; skipped: string[] } {
  const root = postcss.parse(css);
  const skipped: string[] = [];
  root.walkRules(rule => {
    if (insideKeyframes(rule) || !STRUCTURAL.test(rule.selector)) return;
    rule.selectors = rule.selectors.flatMap(selector => {
      try {
        return rewriteSelector(selector);
      } catch (error) {
        skipped.push((error as Error).message);
        return [selector];
      }
    });
  });
  root.append(postcss.parse(WRAPPER_RULE));
  return { css: root.toString(), skipped };
}
