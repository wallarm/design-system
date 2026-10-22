# @wallarm-org/mcp

MCP (Model Context Protocol) server for Wallarm Design System. Provides component metadata, props, variants, design tokens, and search capabilities to AI assistants via stdio transport.

Full guide: [wallarm.github.io/design-system/ai/mcp](https://wallarm.github.io/design-system/ai/mcp).

## 🚀 Quick Start

### Using npx (recommended)

Add the server to your AI assistant's MCP configuration:

```json
{
  "mcpServers": {
    "@wallarm-org/mcp": {
      "command": "npx",
      "args": ["-y", "@wallarm-org/mcp"]
    }
  }
}
```

### With custom metadata path

For local development or custom setups:

```json
{
  "mcpServers": {
    "@wallarm-org/mcp": {
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

## 🤖 Supported AI Assistants

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [Cursor](https://cursor.com)
- [Windsurf](https://windsurf.com)
- Any MCP-compatible client using stdio transport

## 🔧 MCP Capabilities

### Tools

| Tool | Input | Description |
|---|---|---|
| `search_component` | `{ query: string }` | Search by name, description, props, or variants. Returns top 10 results sorted by relevance |
| `get_component` | `{ name: string }` | Full component details: props, variants, sub-components, and import path |
| `search_token` | `{ query: string }` | Search design tokens by name, value, or category. Returns top 20 results sorted by relevance |
| `get_token_category` | `{ name: string }` | All tokens in a category (case-insensitive), e.g. `spacing`, `colors-primary` |

### Resources

| URI | Description |
|---|---|
| `ds://components` | Markdown table listing all components with import paths |
| `ds://tokens` | All design tokens organized by category |
| `ds://components/{name}` | Detailed metadata for a specific component |

## 📦 Metadata Resolution

The server automatically resolves `components.json` in this order:

1. `--metadata-path <path>` CLI argument
2. `import.meta.resolve('@wallarm-org/design-system/metadata')`
3. Walk up from `cwd` looking for `node_modules/@wallarm-org/design-system/dist/metadata/components.json`

## 🛠 Development

```bash
# Build
pnpm build

# Build in watch mode
pnpm dev

# Run tests
pnpm test

# Run tests once
pnpm test:run

# Type-check
pnpm typecheck
```

## 📄 License

MIT © Wallarm
