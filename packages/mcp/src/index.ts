import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadMetadata } from './metadata';
import { getComponentListContent } from './resources/components';
import { getTokensContent } from './resources/tokens';
import { formatComponentDetails, getComponent } from './tools/get-component';
import { formatTokenCategory, getTokenCategory } from './tools/get-token-category';
import { searchComponents } from './tools/search-component';
import { searchTokens } from './tools/search-token';

async function main() {
  // All non-protocol output goes to stderr (critical for stdio transport)
  const log = (...args: unknown[]) => console.error('[wallarm-ds-mcp]', ...args);

  log('Loading metadata...');
  const metadata = await loadMetadata();
  log(
    `Loaded v${metadata.version}: ${metadata.components.length} components, ${metadata.tokens.length} token categories`,
  );

  const server = new McpServer({
    name: 'wallarm-design-system',
    version: metadata.version,
  });

  // ── Tools ──

  server.registerTool(
    'search_component',
    {
      description:
        'Search for components by name, description, props, or variants. Returns matched components sorted by relevance.',
      inputSchema: {
        query: z.string().describe('Search query — component name, prop name, variant, or keyword'),
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
        'Get full details for a specific component: props, variants, sub-components, and import path.',
      inputSchema: {
        name: z
          .string()
          .describe('Component name (case-insensitive), e.g. "Button", "Alert", "Select"'),
      },
    },
    async ({ name }) => {
      const component = getComponent(metadata, name);
      if (!component) {
        const suggestion = searchComponents(metadata, name).slice(0, 3);
        const hint =
          suggestion.length > 0
            ? `\n\nDid you mean: ${suggestion.map(s => s.name).join(', ')}?`
            : '';
        return { content: [{ type: 'text', text: `Component "${name}" not found.${hint}` }] };
      }
      return { content: [{ type: 'text', text: formatComponentDetails(component) }] };
    },
  );

  server.registerTool(
    'search_token',
    {
      description:
        'Search for design tokens by name, value, or category. Returns matched tokens sorted by relevance.',
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
        .map(r => `- \`${r.name}\`: \`${r.value}\`  _(${r.category})_`)
        .join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'get_token_category',
    {
      description:
        'Get all tokens in a specific category (e.g. "spacing", "colors-primary", "typography").',
      inputSchema: {
        name: z
          .string()
          .describe('Category name (case-insensitive), e.g. "spacing", "colors-primary", "shadow"'),
      },
    },
    async ({ name }) => {
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
      return { content: [{ type: 'text', text: formatTokenCategory(category) }] };
    },
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
          { uri: uri.href, text: formatComponentDetails(component), mimeType: 'text/markdown' },
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
