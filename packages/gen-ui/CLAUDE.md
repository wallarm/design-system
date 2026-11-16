# gen-ui — AI Assistant Rules

Read [README.md](./README.md) first: the folder map, how a render works and how to add a component.

## Hard rules

- One file per catalog entry in `src/components/`, listed in `src/components/index.ts`.
- Every DS component has a decision in `src/tests/coverage.test.ts`: the entries that render it, or
  why an agent never places it. A new DS component without one fails the test.
- Enum values come from DS types through `subsetOf` / `allOf` / a typed map; no `as` casts in
  `src/components/` (a test fails on them).
- Props are data only; no prop named `id`, `component`, `children` or `child`; events carry no
  arguments.
- Format-specific code stays in `src/a2ui/`, `src/json-render/` or `src/openui/`; `src/core/`
  imports no format library, and React only as types.
- Agent output is untrusted: actions go through the app's allowlist, and nothing from a spec is
  rendered as HTML.
- Every behaviour change gets a test in `src/tests/` that renders through every format (A2UI,
  json-render, OpenUI), and the site page `apps/website/docs/ai/generative-ui.mdx` is updated with it.
