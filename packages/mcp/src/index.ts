import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
// Fallback digest for design-system versions that predate guidelines.json.
import bundledRules from '../../design-system/guidelines/rules.md?raw';
import { describeSource, loadGuidelines, loadMetadata } from './metadata';
import { getComponentListContent } from './resources/components';
import { getTokensContent } from './resources/tokens';
import { paginate } from './tools/format';
import { formatComponent, getComponent } from './tools/get-component';
import { getExampleText } from './tools/get-example';
import { formatTokenCategory, getTokenCategory } from './tools/get-token-category';
import {
  buildInstructions,
  formatGuidelineList,
  formatRelatedGuidelines,
  getGuidelineText,
  listGuidelines,
  relatedGuidelines,
} from './tools/guidelines';
import { searchComponents } from './tools/search-component';
import { searchTokens } from './tools/search-token';

async function main() {
  // All non-protocol output goes to stderr (critical for stdio transport)
  const log = (...args: unknown[]) => console.error('[wallarm-ds-mcp]', ...args);

  log('Loading metadata...');
  const { metadata, metadataPath, source } = await loadMetadata();
  const guidelines = loadGuidelines(metadataPath);
  const sourceLine = describeSource(source, metadata.version);
  log(sourceLine, `(${metadataPath})`);
  log(
    `Loaded v${metadata.version}: ${metadata.components.length} components, ${metadata.tokens.length} token categories, ${guidelines ? `${guidelines.guidelines.length} guidelines` : 'no guidelines.json (bundled rules)'}`,
  );
  const noGuidelines = `Guidelines are not available: @wallarm-org/design-system v${metadata.version} ships no guidelines.json. Upgrade the design system to get foundations and patterns.`;

  const server = new McpServer(
    { name: 'wallarm-design-system', version: metadata.version },
    { instructions: buildInstructions(guidelines?.rules ?? bundledRules, sourceLine) },
  );

  // ── Tools ──

  const notFound = (name: string) => {
    const suggestion = searchComponents(metadata, name).slice(0, 3);
    const hint =
      suggestion.length > 0 ? `\n\nDid you mean: ${suggestion.map(s => s.name).join(', ')}?` : '';
    return { content: [{ type: 'text' as const, text: `Component "${name}" not found.${hint}` }] };
  };

  server.registerTool(
    'search_component',
    {
      description:
        'Use when you need a UI element and do not know which DS component provides it (e.g. "modal", "date picker", "empty state", "sidebar"). Word-based search over names, descriptions, prop names, variants and common aliases; returns up to 10 components by relevance.',
      inputSchema: {
        query: z
          .string()
          .describe(
            'What you need — a component name, a UI concept ("toast", "dropdown") or a prop name',
          ),
      },
    },
    async ({ query }) => {
      const results = searchComponents(metadata, query);
      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No components found for "${query}"` }] };
      }
      const text = results
        .slice(0, 10)
        .map(r => {
          const desc = r.description ? ` — ${r.description}` : '';
          return `- **${r.name}**${desc}\n  Import: \`${r.importPath}\``;
        })
        .join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'get_component',
    {
      description:
        "Use when you know the component and need its API before writing code. Without `section` returns an overview: import, props, variants, sub-component names, example names, usage docs and related guidelines. Pass `section` for full detail: 'props', 'subcomponents', 'examples', 'docs/<Name>' or a sub-component name (e.g. 'TableColumnMenu'). Long sections are paginated — pass `page`.",
      inputSchema: {
        name: z
          .string()
          .describe('Component name (case-insensitive), e.g. "Button", "Alert", "Select"'),
        section: z
          .string()
          .optional()
          .describe(
            "Omit for the overview; or 'props', 'subcomponents', 'examples', 'docs/<Name>', or a sub-component name",
          ),
        page: z.number().int().min(1).optional().describe('Page of a paginated response, from 1'),
      },
    },
    async ({ name, section, page }) => {
      const component = getComponent(metadata, name);
      if (!component) return notFound(name);
      const related = guidelines
        ? formatRelatedGuidelines(relatedGuidelines(guidelines, component.name))
        : '';
      const text = formatComponent(component, { section, page, related, source: sourceLine });
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'get_example',
    {
      description:
        'Use when you want working code for one usage of a component — copy the pattern instead of guessing composition. Example names come from the `get_component` overview; close names are matched, and a miss lists every example.',
      inputSchema: {
        component: z.string().describe('Component name, e.g. "Table", "SimpleCharts"'),
        example: z
          .string()
          .describe(
            'Example name from get_component, e.g. "WithPagination" or "AreaChart/Default"',
          ),
        page: z.number().int().min(1).optional().describe('Page of a paginated response, from 1'),
      },
    },
    async ({ component: name, example, page }) => {
      const component = getComponent(metadata, name);
      if (!component) return notFound(name);
      return { content: [{ type: 'text', text: getExampleText(component, example, page) }] };
    },
  );

  server.registerTool(
    'search_token',
    {
      description:
        'Use when styling needs a colour, spacing, radius, shadow or type value — find the token and the Tailwind class to write (e.g. "text-primary", "surface", "spacing-8", "#ff6633", "bg-bg-surface-2"). Returns up to 20 tokens with value and utility classes.',
      inputSchema: {
        query: z
          .string()
          .describe(
            'Search query — token name (e.g. "spacing-8"), value (e.g. "#ff6633"), or category (e.g. "colors-primary")',
          ),
      },
    },
    async ({ query }) => {
      const results = searchTokens(metadata, query);
      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No tokens found for "${query}"` }] };
      }
      const text = results
        .slice(0, 20)
        .map(r => {
          const utilities =
            r.utilities.length > 0 ? ` → ${r.utilities.map(u => `\`${u}\``).join(' ')}` : '';
          return `- \`${r.name}\`: \`${r.value}\`${utilities}  _(${r.category})_`;
        })
        .join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'get_token_category',
    {
      description:
        'Use when you need the whole scale of one token category (e.g. all spacing steps, all semantic colours) with values and Tailwind classes. Large categories are paginated — pass `page`.',
      inputSchema: {
        name: z
          .string()
          .describe('Category name (case-insensitive), e.g. "spacing", "colors-primary", "shadow"'),
        page: z.number().int().min(1).optional().describe('Page of a paginated response, from 1'),
      },
    },
    async ({ name, page = 1 }) => {
      const category = getTokenCategory(metadata, name);
      if (!category) {
        const categories = metadata.tokens.map(c => c.name);
        return {
          content: [
            {
              type: 'text',
              text: `Category "${name}" not found.\n\nAvailable categories: ${categories.join(', ')}`,
            },
          ],
        };
      }
      const text = paginate(
        formatTokenCategory(category),
        page,
        next => `\`{ name: '${category.name}', page: ${next} }\``,
      );
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'list_guidelines',
    {
      description:
        'Use when starting a screen or flow, or unsure about spacing, colour or typography rules — lists foundations and patterns with slug, title, description and components.',
      inputSchema: {
        kind: z
          .enum(['foundation', 'pattern'])
          .optional()
          .describe('Only list foundations or only patterns; omit for both'),
      },
    },
    async ({ kind }) => ({
      content: [
        {
          type: 'text',
          text: guidelines ? formatGuidelineList(listGuidelines(guidelines, kind)) : noGuidelines,
        },
      ],
    }),
  );

  server.registerTool(
    'get_guideline',
    {
      description:
        'Use when composing a screen (read the matching pattern first) or applying a foundation — returns the guideline as markdown. Pass `section` to get one section only.',
      inputSchema: {
        slug: z
          .string()
          .describe(
            'Guideline slug from list_guidelines, e.g. "patterns/entity-table" or "foundations/spacing"',
          ),
        section: z
          .string()
          .optional()
          .describe('Section id or heading, e.g. "rules", "example", "layout-and-spacing"'),
      },
    },
    async ({ slug, section }) => ({
      content: [
        {
          type: 'text',
          text: guidelines ? getGuidelineText(guidelines, slug, section) : noGuidelines,
        },
      ],
    }),
  );

  // ── Resources ──

  server.registerResource(
    'component-list',
    'ds://components',
    {
      description: 'List of all Wallarm Design System components with import paths',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        {
          uri: 'ds://components',
          text: getComponentListContent(metadata),
          mimeType: 'text/markdown',
        },
      ],
    }),
  );

  server.registerResource(
    'design-tokens',
    'ds://tokens',
    {
      description: 'All design tokens organized by category (colors, spacing, typography, etc.)',
      mimeType: 'text/markdown',
    },
    async () => ({
      contents: [
        { uri: 'ds://tokens', text: getTokensContent(metadata), mimeType: 'text/markdown' },
      ],
    }),
  );

  server.registerResource(
    'component-details',
    new ResourceTemplate('ds://components/{name}', { list: undefined }),
    { description: 'Detailed metadata for a specific component', mimeType: 'text/markdown' },
    async (uri, variables) => {
      const name = variables.name as string;
      const component = getComponent(metadata, name);
      if (!component) {
        return {
          contents: [
            { uri: uri.href, text: `Component "${name}" not found`, mimeType: 'text/plain' },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            text: formatComponent(component, { source: sourceLine }),
            mimeType: 'text/markdown',
          },
        ],
      };
    },
  );

  // ── Start ──

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('MCP server started on stdio');
}

main().catch(err => {
  console.error('[wallarm-ds-mcp] Fatal error:', err.message);
  process.exit(1);
});
