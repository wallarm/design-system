# @wallarm-org/mcp

Standalone MCP (Model Context Protocol) server for Wallarm Design System. Provides component metadata, props, variants, design tokens, and search to AI assistants (Claude Code, Cursor, Windsurf, etc.) via stdio transport.

## Structure

```
src/
├── index.ts              # Entry point: McpServer setup, tools & resources registration, stdio transport
├── metadata.ts           # Metadata resolver: CLI arg → import.meta.resolve → node_modules walk → apps/*, packages/* → bundled snapshot; guidelines.json from the same dir (best-effort, bundled fallback)
├── env.d.ts              # `*.md?raw` module type (bundled rules.md fallback)
├── tools/
│   ├── format.ts             # Compact props tables, union collapsing, RESPONSE_LIMIT pagination
│   ├── search-component.ts   # search_component tool: word-based search with scoring + ALIASES map
│   ├── get-component.ts      # get_component tool: overview and sections (props, subcomponents, examples, docs/<Name>, a sub-component)
│   ├── get-example.ts        # get_example tool: one example's code, fuzzy name match
│   ├── search-token.ts       # search_token tool: token search by name, utility, value, or category; tokenUtilities()
│   ├── get-token-category.ts # get_token_category tool: full category details as markdown
│   └── guidelines.ts         # list_guidelines / get_guideline tools (incl. the `stories` section), server instructions, related guidelines
├── resources/
│   ├── components.ts     # ds://components resource: markdown table of all components
│   └── tokens.ts         # ds://tokens resource: all design tokens by category
└── __tests__/
    ├── fixtures/components.json  # Minimal test fixture (Button, Alert, Badge)
    ├── fixtures/guidelines.json  # Minimal guidelines fixture (one foundation, one pattern)
    ├── budget.test.ts            # Every component × every mode/example/page under RESPONSE_LIMIT, on the real design-system dist (skipped when not built)
    ├── guidelines.test.ts
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

Queries and fields are split into normalized words (camelCase and kebab-case split, lowercase, plurals singularized, stop words dropped). Word tiers score `weight × share of query words found` and the best tier wins. Prop **types** are not searched.

| Match Type | Score |
|---|---|
| Exact name match | 100 |
| `ALIASES` phrase in the query (`modal` → `Dialog`) | 90 |
| Name starts with query | 80 |
| Name contains query (3+ chars) / name words | 60 |
| Description words | 40 |
| Prop name words | 30 |
| Variant name/option words | 20 |
| Sub-component name words | 15 |

Every `ALIASES` target must be a real component — `budget.test.ts` checks it against the real metadata.

## Search Scoring (search-token.ts)

| Match Type | Score |
|---|---|
| Exact token name or utility class match | 100 |
| Token name starts with query | 80 |
| Token name or utility class contains query | 60 |
| Exact value match | 50 |
| Value contains query | 40 |
| Exact category match | 30 |
| Category contains query | 20 |

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server SDK
- `@wallarm-org/mcp-core` — devDependency (not published to npm), shared Zod schemas and types, bundled into `dist/index.js`
- `@wallarm-org/design-system` — peerDependency (optional), source of `components.json` and `guidelines.json` (also copied into `dist/metadata/` by `rslib.config.ts` `output.copy` as the fallback snapshot, so the design system must be built first — turbo's `^build` does it); its `src/guidelines/rules.md` is also bundled (`?raw`) as the instructions fallback for DS versions without `guidelines.json`
- `zod` — devDependency, used for tool input schemas in `index.ts`
