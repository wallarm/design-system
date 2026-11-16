import { DirectJsonFormat, ExpressFormat } from '@a2ui/agent';
import type { Catalog, ComponentApi } from '@a2ui/web_core';
import { compositionPrompt } from '../core/composition';
import type { GenUiAction } from '../core/define';

export interface A2uiPromptOptions {
  /** What the model writes: A2UI Express (compact, the default) or the v1.0 JSON messages. */
  format?: 'express' | 'json';
  /** The actions the app accepts: the model may fire only these. */
  actions: readonly GenUiAction[];
  /** Add the composition rules (`COMPOSITION_RULES`): how to lay out a page. Default true. */
  composition?: boolean;
}

/**
 * `@wallarm-org/gen-ui/a2ui/prompt`, meant for the server that calls the model.
 *
 * The system prompt for an A2UI agent: the format's rules and a signature per catalog entry (from
 * @a2ui/agent), plus the app's actions, which an A2UI catalog doesn't carry, and the composition
 * rules (`COMPOSITION_RULES`). Append your own instructions, e.g. which data paths the app fills.
 */
export const a2uiPrompt = (
  catalog: Catalog<ComponentApi>,
  { format = 'express', actions, composition = true }: A2uiPromptOptions,
): string => {
  const generator =
    format === 'express'
      ? new ExpressFormat([catalog], { version: '1.0' }).promptGenerator
      : new DirectJsonFormat([catalog]).promptGenerator;
  return [
    generator.generate(),
    '## Actions',
    'A button fires an action by name; the app ignores any name not listed here.',
    ...actions.map(a => `- ${a.name}: ${a.description}`),
    ...(composition ? [compositionPrompt()] : []),
  ].join('\n');
};
