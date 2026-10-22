# @wallarm-org/mcp

Standalone MCP (Model Context Protocol) server for Wallarm Design System. Provides component metadata, props, variants, design tokens, and search to AI assistants (Claude Code, Cursor, Windsurf, etc.) via stdio transport.

## Structure

```
src/
├── index.ts              # Entry point: McpServer setup, tools & resources registration, stdio transport
├── metadata.ts           # Metadata resolver: CLI arg → import.meta.resolve → node_modules walk
├── tools/
│   ├── search-component.ts   # search_component tool: substring search with scoring
│   ├── get-component.ts      # get_component tool: full details + markdown formatting
│   ├── search-token.ts       # search_token tool: token search by name, value, or category
│   └── get-token-category.ts # get_token_category tool: full category details as markdown
├── resources/
│   ├── components.ts     # ds://components resource: markdown table of all components
│   └── tokens.ts         # ds://tokens resource: all design tokens by category
└── __tests__/
    ├── fixtures/components.json  # Minimal test fixture (Button, Alert, Badge)
    ├── metadata.test.ts
    ├── tools.test.ts
    └── resources.test.ts
```

Tools, resources, metadata resolution, client setup and commands are documented in [README.md](./README.md).

## MCP SDK API

Uses `@modelcontextprotocol/sdk` v1.12+. The server uses the **non-deprecated** APIs:
- `server.registerTool()` with `{ description, inputSchema }` config object
- `server.registerResource()` with `ResourceTemplate` for URI templates
- `StdioServerTransport` for stdio communication

**Important**: All non-protocol output MUST go to `stderr` — this is critical for stdio transport. Use the `log()` helper in `index.ts`.

## Search Scoring (search-component.ts)

| Match Type | Score |
|---|---|
| Exact name match | 100 |
| Name starts with query | 80 |
| Name contains query | 60 |
| Description contains query | 40 |
| Props match | 30 |
| Variants match | 20 |
| Sub-component match | 15 |

## Search Scoring (search-token.ts)

| Match Type | Score |
|---|---|
| Exact token name match | 100 |
| Token name starts with query | 80 |
| Token name contains query | 60 |
| Exact value match | 50 |
| Value contains query | 40 |
| Exact category match | 30 |
| Category contains query | 20 |

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server SDK
- `@wallarm-org/mcp-core` — devDependency (not published to npm), shared Zod schemas and types, bundled into `dist/index.js`
- `@wallarm-org/design-system` — peerDependency (optional), source of `components.json`
- `zod` — devDependency, used for tool input schemas in `index.ts`
