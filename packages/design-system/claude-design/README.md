# Claude Design exporter: nxds reference

The user selected [nxds](https://github.com/nexuslabs-ai/nxds) as the implementation
reference on 2026-10-29. This comparison uses commit
[`72b81753a4e57044b84cf77c347f19db3623529d`](https://github.com/nexuslabs-ai/nxds/tree/72b81753a4e57044b84cf77c347f19db3623529d/packages/claude-design)
(MIT) and Wallarm commit `3259ecc8`. It records the adoption direction and remaining
differences; the changes described below have not been implemented by this review.

What Storybook does not show, and so Claude Design cannot learn: [CLAUDE_DESIGN_GAP.md](./CLAUDE_DESIGN_GAP.md).

## Current priority: publish and prototype

The user clarified on 2026-10-29 that the immediate goal is to give Claude Code the
existing build and generate Claude Design prototypes/artifacts using the real Wallarm
components. Keep the current type generation, catalogue and Rslib build. The comparison
below is reference material; its proposed improvements are deferred and do not block
trying the current build on the canvas.

The workflow is:

1. Prepare the existing build with
   `pnpm --filter @wallarm-org/design-system build:claude-design`, or reuse an already
   prepared build. The upload root is `packages/design-system/.claude-design`, containing
   `project/`, `file-hashes.json` and `summary.json`. If using the ZIP, extract it locally
   and give Claude Code that directory; the ZIP itself is transport, not a confirmed
   native Claude Design import format.
2. Ask Claude Code, signed into Claude with the Artifact tool available, to publish
   the prepared `project/` as a Design System artifact using the configured target.
   Use the generated bundle, CSS, tokens, fonts, assets and guides. Do not regenerate
   the components or run another source sync merely to upload the prepared files.
   Reconcile the remote index and asset references as described in the sync skill.
3. Give `/design` the published system's URL and the screen brief. Ask it to use
   `WallarmDS` components, read their guides and wrap artboards with `WallarmDS.Root`.
   Once published, reuse that system for subsequent prototypes; publish a new library
   snapshot only when the library changes.
4. Check one small prototype on the real canvas: Button/Input, a themed Root and an
   opening Dialog. Confirm that the result mounts the supplied components and that
   the interactive states work. Address concrete failures before expanding scope.

The build from `3259ecc8` (904 project files) was published on 2026-10-31 to a new
artifact, now the `artifactUrl` in `config.ts`: 583 SVG assets matched by source
SHA-256, 320 project files matched by SHA-256, and the index was written last. A
two-artboard smoke-test canvas (Button, Field/Input, Dialog inside `WallarmDS.Root`,
light and dark) was created from it; its live rendering has not yet been checked.

nxds is a reference implementation, not the authority for Claude's format. Confirm
platform requirements against the target artifact's `artifact-type/reference/` files
when available. Check the result on a real canvas before claiming compatibility.

## Architecture to follow

Build a complete `project/` from repository source, validate it, and produce a content
hash manifest. Preparing files and publishing them are separate operations. The
publisher consumes the prepared output and applies a reviewed diff to an existing
artifact; it does not ask the model to recreate the components.

Keep Wallarm's shared Rslib IIFE build, SWC React Compiler target 18, `WallarmDS`
namespace, canvas Root and current npm isolation. nxds uses esbuild and a separately
published package; those implementation choices do not replace the user's Rslib and
unchanged npm-package requirements. Keep deterministic commit-based timestamps too:
the inspected nxds builder uses the current time.

## Source map and comparison

All nxds paths below are relative to the pinned repository root.

| Concern | nxds reference | Wallarm today / direction |
| --- | --- | --- |
| Build and hashes | `packages/claude-design/scripts/build.ts` validates the finished project before writing `files.json`. | `build.ts` already writes SHA-256 hashes and enforces budgets; `verify.ts` checks repeatability. Keep these and add cross-file contract checks. Renaming the manifest is unnecessary. |
| Canvas prop types | `packages/claude-design/src/props.ts` resolves component props and emits a flat `<Name>Props` interface per exported component part. | `docs/build-docs.ts` concatenates npm declarations. Replace this for the canvas with resolved interfaces, including canvas helpers and icons. Keep the npm declarations intact. |
| Prop coverage | The same module writes `coverage.md` describing props without sidebar controls. | Generate an equivalent report from the resolved types. Distinguish a missing sidebar control from a value that works through `renderVals()`; callbacks, arrays and objects may still be usable on the canvas. |
| Card catalogue | `scripts/build.ts` derives component folders; `src/bundle.ts` uses those folders for the bundle header. | `bundle/build-bundle.ts` treats uppercase exports as catalogue entries. Derive the catalogue from actual component families/cards, while retaining subcomponents and utilities in the runtime namespace. |
| Validation | `packages/claude-design/src/validate.ts` cross-checks the index, tokens/CSS, classic script, types, examples and cards. | Existing checks cover many individual outputs. Add consistency checks between the catalogue, guides, previews, exported components and prop interfaces. Keep explicit exemptions for guides without cards. |
| Updating an index | `packages/claude-design/src/system-index.ts` preserves the current title, creation marker and page additions. | The builder creates a fresh index and the sync skill checks identity. Prepare updates using the existing creation marker and identity; reconcile Wallarm's generated asset records with real uploaded blob IDs. Do not copy nxds's merge wholesale, which preserves all existing asset records. |
| Removed paths | `packages/cli/src/commands/export.ts` writes `removed.json` and excludes page-generated paths using `isPageGenerated()`. | The sync skill computes removals manually. Make the diff reproducible from local hashes and a remote snapshot; preserve platform-owned files, including `project/manifest.json` and `project/api/` after confirming ownership in the platform reference. |
| Publication | The CLI exports files and tells the operator to publish them in Claude. | Retain the separate publication step. This reference does not establish a public upload API or a manual ZIP import flow. |

## Evidence from the existing Wallarm build

The generated output at `3259ecc8` was inspected without rebuilding:

- `components/index.d.ts` is 1,393,950 bytes, contains 2,934 lines beginning with
  `import ` and 318 occurrences of unresolved utility-type expressions such as
  `VariantProps<...>` or `Omit<...>`. `ButtonProps` and `InputProps` remain type
  intersections; there is no `RootProps` declaration for the canvas helper.
- The bundle header lists 606 entries. 506 have no standalone component README
  and 508 have no standalone preview. Some are legitimate subcomponents documented
  with their parent; others are constants such as `ALERT_MAX_WIDTH`. These counts
  describe a catalogue mismatch, not 508 broken runtime components.
- The index declares React/ReactDOM version `18`; nxds pins `18.3.1`, matching our
  local harness. Aligning preview declarations with the tested runtime is worth
  checking against the platform's supported library versions.

The prop and catalogue differences are confirmed in local output. Their effects on
Claude's current sidebar/parser have not been reproduced in a live canvas.

## Deferred improvement candidates

These are optional follow-ups after the publish-and-prototype workflow is verified,
not the current implementation plan. Revisit a candidate sooner only if a concrete
canvas failure shows it is needed for that workflow.

1. Resolve canvas props, emit flat interfaces and a coverage report. Test inherited
   Ark props, CVA boolean/literal variants, polymorphic defaults, subcomponents,
   helpers and icons without changing published metadata.
2. Share one catalogue between the bundle header and component cards. Validate
   correspondence between exported runtime parts, guides, cards and prop types.
3. Prepare a machine-readable publication diff from the complete local manifest and
   remote snapshot, preserving identity, uploaded assets and platform-owned paths.
4. Keep the existing React 18 harness, repeatability and npm no-impact checks; verify
   prop controls and compound components on a live canvas after publication.

No nxds source was copied and no nxds package was installed for this comparison.
If code is copied later, retain its MIT copyright and license notice.
