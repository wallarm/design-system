import type { ComponentMetadata, DesignSystemMetadata } from '@wallarm-org/mcp-core';

interface SearchResult {
  name: string;
  description?: string;
  importPath: string;
  score: number;
}

function scoreComponent(component: ComponentMetadata, query: string): number {
  const q = query.toLowerCase();
  const name = component.name.toLowerCase();

  // Exact match
  if (name === q) return 100;

  // Name starts with query
  if (name.startsWith(q)) return 80;

  // Name contains query
  if (name.includes(q)) return 60;

  // Description contains query
  if (component.description?.toLowerCase().includes(q)) return 40;

  // Props contain query
  const propsMatch = component.props.some(
    p => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q),
  );
  if (propsMatch) return 30;

  // Variants contain query
  const variantsMatch = component.variants.some(
    v => v.name.toLowerCase().includes(q) || v.options.some(o => o.toLowerCase().includes(q)),
  );
  if (variantsMatch) return 20;

  // Sub-component names match
  const subMatch = component.subComponents.some(sc => sc.name.toLowerCase().includes(q));
  if (subMatch) return 15;

  return 0;
}

export function searchComponents(metadata: DesignSystemMetadata, query: string): SearchResult[] {
  return metadata.components
    .map(c => ({
      name: c.name,
      description: c.description,
      importPath: c.importPath,
      score: scoreComponent(c, query),
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
