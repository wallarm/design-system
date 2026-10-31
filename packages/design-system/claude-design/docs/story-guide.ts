import type { ExampleMetadata } from '@wallarm-org/mcp-core';

export const README_CAP_BYTES = 64_000;

export interface StoryGuideInput {
  name: string;
  description?: string;
  /** Props table and sub-components, from `componentReadme`. */
  reference: string;
  stories: ExampleMetadata[];
  /** Story files and their shipped local imports, in order; paths relative to src/components. */
  modules: { path: string; text: string }[];
}

/** A fence longer than any backtick run in the text, so verbatim sources never close it early. */
const fence = (text: string): string =>
  '`'.repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map(match => match[0].length + 1)));

/** One component guide: Storybook's prose and story sources, copied verbatim. */
export const storyGuide = ({
  name,
  description,
  reference,
  stories,
  modules,
}: StoryGuideInput): { readme: string; overflow?: string } => {
  const head = [description, reference.trim()].filter((part): part is string => Boolean(part));
  const storyList = stories.length
    ? [
        '## Stories',
        ...stories.map(story =>
          [`### ${story.name}`, story.description, `Source: ${story.storyFile}#${story.name}`]
            .filter(Boolean)
            .join('\n\n'),
        ),
      ]
    : [];
  const sources = modules.map(module => {
    const text = module.text.endsWith('\n') ? module.text : `${module.text}\n`;
    const marks = fence(text);
    return `### ${module.path}\n\n${marks}tsx\n${text}${marks}`;
  });
  const join = (parts: string[]): string => `${parts.join('\n\n')}\n`;
  const readme = join([
    ...head,
    ...storyList,
    ...(sources.length ? ['## Story sources', ...sources] : []),
  ]);
  if (!sources.length || Buffer.byteLength(readme) <= README_CAP_BYTES) return { readme };
  return {
    readme: join([
      ...head,
      ...storyList,
      '## Story sources',
      'The story files and their local imports are in [stories.md](./stories.md), verbatim.',
    ]),
    overflow: join([`# ${name} story sources`, ...sources]),
  };
};
