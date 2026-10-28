import type { ComponentMetadata } from '@wallarm-org/mcp-core';

import { paginate } from './format';
import { call, exampleEntries, formatExample } from './get-component';
import { levenshtein } from './guidelines';

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9/]/g, '');

/**
 * `get_example` text for one story. Matches the key (`AreaChart/Default`), then the bare story
 * name, then a substring, then the closest key by edit distance; lists the keys on a miss.
 */
export function getExampleText(c: ComponentMetadata, example: string, page = 1): string {
  const entries = exampleEntries(c);
  if (entries.length === 0) return `${c.name} has no examples.`;

  const q = normalize(example);
  const byName = entries.filter(e => normalize(e.example.name) === q);
  const candidates =
    [
      entries.filter(e => normalize(e.key) === q),
      byName,
      entries.filter(e => normalize(e.key).includes(q)),
    ].find(list => list.length > 0) ?? [];

  const keys = entries.map(e => `\`${e.key}\``).join(', ');
  if (candidates.length > 1) {
    return `"${example}" matches several ${c.name} examples: ${candidates.map(e => `\`${e.key}\``).join(', ')}. Pass one of them.`;
  }

  // Short queries ("xl") are within edit distance 2 of any short name — no fuzzy match for them.
  const fuzzy =
    candidates[0] || q.length < 4
      ? undefined
      : entries
          .map(e => {
            const key = normalize(e.key);
            return {
              e,
              d: Math.min(levenshtein(q, key), levenshtein(q, key.split('/').at(-1) ?? '')),
            };
          })
          .filter(({ d }) => d <= Math.max(2, Math.floor(q.length / 4)))
          .sort((a, b) => a.d - b.d)[0]?.e;
  const match = candidates[0] ?? fuzzy;

  if (!match) return `Example "${example}" not found in ${c.name}.\n\nAvailable examples: ${keys}`;

  const closest = fuzzy ? `Closest match for "${example}": \`${fuzzy.key}\`.\n\n` : '';
  return (
    closest +
    paginate(formatExample(match.key, match.example), page, next =>
      call({ component: c.name, example: match.key, page: next }),
    )
  );
}
