# @wallarm-org/mcp

MCP (Model Context Protocol) server for Wallarm Design System. Provides component metadata, props, variants, design tokens, design guidelines (foundations and patterns), and search capabilities to AI assistants via stdio transport.

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
| `search_component` | `{ query: string }` | Word-based search over names, descriptions, prop names, variants and an alias map (`modal` → `Dialog`). Prop types are not searched. Top 10 by relevance |
| `get_component` | `{ name: string, section?: string, page?: number }` | Overview by default (import, compact props, variants, sub-component and example names, usage docs, related guidelines). `section`: `props`, `subcomponents`, `examples`, `docs/<Name>` or a sub-component name for full detail |
| `get_example` | `{ component: string, example: string, page?: number }` | One example's code. Keys are story names, `<Story file>/<name>` when a name repeats; fuzzy match, lists names on a miss |
| `search_token` | `{ query: string }` | Search design tokens by name, Tailwind class, value, or category; results include the utility classes. Top 20 by relevance |
| `get_token_category` | `{ name: string, page?: number }` | All tokens in a category (case-insensitive) with Tailwind classes, e.g. `spacing`, `colors-primary` |
| `list_guidelines` | `{ kind?: 'foundation' \| 'pattern' }` | Guidelines with slug, title, description and the components they use |
| `get_guideline` | `{ slug: string, section?: string }` | A guideline as markdown, or one section (`rules`, `example`, …). Unknown slugs get the nearest slugs |

`get_component` also lists the guidelines that use the component.

Responses stay under 40,000 characters (`RESPONSE_LIMIT`, below Claude Code's 25k-token MCP output limit). Props tables drop `undefined` from types, collapse long unions to `…(+K)`, omit empty columns, and list props shared by most sub-components (forwarded HTML attributes) once. Anything longer is paginated at headings with a `Page i/N` footer naming the next call.

### Instructions

On `initialize` the server sends `instructions`: the design-system rules digest (`guidelines/rules.md`) followed by which tool to use for what and the metadata source (installed design system or bundled snapshot, with its version). When the installed design system has no `guidelines.json` (versions before guidelines shipped), the digest bundled into this package is used and the guideline tools say so.

### Resources

| URI | Description |
|---|---|
| `ds://components` | Markdown table listing all components with import paths |
| `ds://tokens` | All design tokens organized by category |
| `ds://components/{name}` | Overview of a specific component (same as `get_component` without `section`) |

## 📦 Metadata Resolution

The server automatically resolves `components.json` in this order:

1. `--metadata-path <path>` CLI argument
2. `import.meta.resolve('@wallarm-org/design-system/metadata')`
3. Walk up from `cwd` looking for `node_modules/@wallarm-org/design-system/dist/metadata/components.json`
4. `<cwd>/apps/*/node_modules` and `<cwd>/packages/*/node_modules` (monorepos that install the design system in one app)
5. The snapshot of `components.json` and `guidelines.json` bundled into this package's `dist/metadata/` at build time

`guidelines.json` is read from the same directory as the resolved `components.json`; it is optional. With the bundled snapshot, the instructions and every `get_component` footer say `bundled snapshot vX — may differ from your installed version`; otherwise `installed @wallarm-org/design-system vX`.

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
