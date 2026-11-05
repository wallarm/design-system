import type { Guideline, GuidelineKind, GuidelinesMetadata } from '@wallarm-org/mcp-core';

export const ROUTING = [
  "Tools: `search_component` / `get_component` for components — `get_component` returns an overview, pass `section` for full props, sub-components or examples, and `get_example` for one example's code;",
  '`search_token` / `get_token_category` for design tokens;',
  '`list_guidelines` / `get_guideline` for foundations (spacing, color, typography, …) and patterns (screens and flows).',
  'Read the matching pattern with `get_guideline` before composing a screen.',
].join(' ');

/** Server instructions: the rules digest first (its first line must stand alone), then tool routing and the metadata source. */
export function buildInstructions(rules: string, source?: string): string {
  return `${rules.trim()}\n\n${ROUTING}${source ? `\n\n${source}.` : ''}`;
}

export function listGuidelines(guidelines: GuidelinesMetadata, kind?: GuidelineKind): Guideline[] {
  return guidelines.guidelines.filter(g => !kind || g.kind === kind);
}

export function formatGuidelineList(list: Guideline[]): string {
  if (list.length === 0) return 'No guidelines found.';
  return list
    .map(g => {
      const components =
        g.components.length > 0 ? `\n  Components: ${g.components.join(', ')}` : '';
      return `- **${g.slug}** — ${g.title}: ${g.description}${components}`;
    })
    .join('\n');
}

/** `../foundations/spacing.md#rules` → `{ slug: 'foundations/spacing', anchor: 'rules' }`. */
const splitLink = (link: string) => {
  const [path = '', anchor] = link.trim().split('#');
  return { path, anchor: anchor || undefined };
};

const normalizeSlug = (slug: string) =>
  splitLink(slug)
    .path.toLowerCase()
    .replace(/^(\.{1,2}\/)+/, '')
    .replace(/\.md$/, '')
    .replace(/^\/+|\/+$/g, '');

const baseName = (slug: string) => slug.slice(slug.lastIndexOf('/') + 1);

/** Accepts `patterns/empty-states`, `empty-states`, `patterns/empty-states.md` or a relative link (`../patterns/empty-states.md#rules`). */
export function findGuideline(guidelines: GuidelinesMetadata, slug: string): Guideline | undefined {
  const s = normalizeSlug(slug);
  return (
    guidelines.guidelines.find(g => g.slug === s) ??
    guidelines.guidelines.find(g => baseName(g.slug) === s)
  );
}

export const levenshtein = (a: string, b: string): number => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = row;
  }
  return prev[b.length] ?? 0;
};

/** Closest slugs by edit distance on the slug's last segment; keyword hits rank first. */
export function nearestSlugs(guidelines: GuidelinesMetadata, slug: string, limit = 3): string[] {
  const s = baseName(normalizeSlug(slug));
  return guidelines.guidelines
    .map(g => {
      const keywordHit = g.keywords.some(
        k => k.toLowerCase().includes(s) || s.includes(k.toLowerCase()),
      );
      return { slug: g.slug, distance: levenshtein(s, baseName(g.slug)) - (keywordHit ? 100 : 0) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(r => r.slug);
}

export function getGuidelineText(
  guidelines: GuidelinesMetadata,
  slug: string,
  section?: string,
): string {
  const guideline = findGuideline(guidelines, slug);
  if (!guideline) {
    const hint = nearestSlugs(guidelines, slug);
    return `Guideline "${slug}" not found.${hint.length > 0 ? `\n\nDid you mean: ${hint.join(', ')}?` : ''}`;
  }
  // A link's `#anchor` selects the section unless one is passed.
  section ??= splitLink(slug).anchor;
  if (!section) return guideline.markdown;

  const id = section
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const match = guideline.sections.find(s => s.id === id);
  if (!match) {
    return `Section "${section}" not found in ${guideline.slug}.\n\nAvailable sections: ${guideline.sections.map(s => s.id).join(', ')}`;
  }
  return `# ${guideline.title} — ${match.heading}\n\n${match.markdown}`;
}

/** Guidelines whose `components` reference the component (case-insensitive). */
export function relatedGuidelines(
  guidelines: GuidelinesMetadata,
  componentName: string,
): Guideline[] {
  const name = componentName.toLowerCase();
  return guidelines.guidelines.filter(g => g.components.some(c => c.toLowerCase() === name));
}

export function formatRelatedGuidelines(related: Guideline[]): string {
  if (related.length === 0) return '';
  return `\n\nRelated guidelines (read with \`get_guideline\`): ${related.map(g => `${g.slug} (${g.title})`).join(', ')}`;
}
