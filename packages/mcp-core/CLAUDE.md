# @wallarm-org/mcp-core

Shared contract between the metadata generator (in `design-system`) and the MCP server (in `mcp`). Contains Zod schemas and TypeScript types inferred from them.

## Structure

```
src/
├── schema.ts   # Zod schemas + inferred types (single source of truth)
└── index.ts    # Re-exports schemas and types
```

## Key Types

| Type | Description |
|---|---|
| `DesignSystemMetadata` | Root: version, generatedAt, components[], tokens[] |
| `ComponentMetadata` | Component: name, description, importPath, props, variants, subComponents, examples |
| `PropMetadata` | Prop: name, type, required, description?, defaultValue? |
| `VariantMetadata` | CVA variant: name, options[], defaultValue? |
| `SubComponentMetadata` | Sub-component: name, description?, props[] |
| `ExampleMetadata` | Usage example: name, code, description? |
| `TokenCategory` | Token group: name, description?, tokens[] |
| `TokenMetadata` | Single token: name, value |

## Design Decisions

- **Types are derived from Zod schemas** via `z.infer<typeof schema>` — no separate `types.ts` file. The schema is the single source of truth for both runtime validation and compile-time types.
- **No runtime dependencies** besides `zod`. This package is intentionally minimal.
- The Zod schemas are used by:
  - The metadata generator (`design-system/scripts/metadata/generate.ts`) to validate output
  - The MCP server (`mcp/src/metadata.ts`) to validate loaded JSON

## Commands

```bash
pnpm build       # Build with rslib
pnpm typecheck   # Type-check without emitting
```

## Consumers

- `@wallarm-org/design-system` — devDependency, uses schemas in metadata generator
- `@wallarm-org/mcp` — dependency, uses schemas for runtime validation + types for server code
