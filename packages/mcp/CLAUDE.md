# @wallarm-org/mcp

Standalone MCP (Model Context Protocol) server for Wallarm Design System. Provides component metadata, props, variants, design tokens, and search to AI assistants (Claude Code, Cursor, Windsurf, etc.) via stdio transport.

## Structure

```
src/
├── index.ts              # Entry point: McpServer setup, tools & resources registration, stdio transport
├── metadata.ts           # Metadata resolver: CLI arg → import.meta.resolve → node_modules walk
├── tools/
│   ├── search-component.ts   # search_component tool: substring search with scoring
│   └── get-component.ts      # get_component tool: full details + markdown formatting
├── resources/
│   ├── components.ts     # ds://components resource: markdown table of all components
│   └── tokens.ts         # ds://tokens resource: all design tokens by category
└── __tests__/
    ├── fixtures/components.json  # Minimal test fixture (Button, Alert, Badge)
    ├── metadata.test.ts
    ├── tools.test.ts
    └── resources.test.ts
```

## MCP Capabilities

### Tools (registered via `server.registerTool`)

| Tool | Input | Description |
|---|---|---|
| `search_component` | `{ query: string }` | Search by name, description, props, variants. Returns top 10 sorted by relevance score |
| `get_component` | `{ name: string }` | Full component details as markdown: props, variants, sub-components, examples, import path |

### Resources (registered via `server.registerResource`)

| URI | Description |
|---|---|
| `ds://components` | Markdown table listing all components with import paths |
| `ds://tokens` | All design tokens organized by category |
| `ds://components/{name}` | ResourceTemplate — detailed metadata for a specific component |

## Metadata Resolution

The server resolves `components.json` in this order (see `metadata.ts`):

1. `--metadata-path <path>` CLI argument (explicit)
2. `import.meta.resolve('@wallarm-org/design-system/metadata')` (installed package)
3. Walk up from `cwd` looking for `node_modules/@wallarm-org/design-system/dist/metadata/components.json`

## MCP SDK API

Uses `@modelcontextprotocol/sdk` v1.12+. The server uses the **non-deprecated** APIs:
- `server.registerTool()` with `{ description, inputSchema }` config object
- `server.registerResource()` with `ResourceTemplate` for URI templates
- `StdioServerTransport` for stdio communication

**Important**: All non-protocol output MUST go to `stderr` — this is critical for stdio transport. Use the `log()` helper in `index.ts`.

## Commands

```bash
pnpm build       # Build with rslib
pnpm dev         # Build in watch mode
pnpm test        # Run tests in watch mode
pnpm test:run    # Run tests once
pnpm typecheck   # Type-check without emitting
```

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

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server SDK
- `@wallarm-org/mcp-core` — shared Zod schemas and types
- `@wallarm-org/design-system` — peerDependency (optional), source of `components.json`
- `zod` — devDependency, used for tool input schemas in `index.ts`

## Usage

```json
{
  "mcpServers": {
    "wallarm-ds": {
      "command": "npx",
      "args": ["@wallarm-org/mcp"]
    }
  }
}
```

With custom metadata path (e.g. local development):

```json
{
  "mcpServers": {
    "wallarm-ds": {
      "command": "node",
      "args": [
        "./packages/mcp/dist/index.js",
        "--metadata-path",
        "./packages/design-system/dist/metadata/components.json"
      ]
    }
  }
}
```
