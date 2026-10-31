---
name: new-migration
description: Use when a design-system breaking change needs a consumer migration in @wallarm-org/migrator, including report-only migrations for changes requiring no consumer edits.
---

# New Migration

Write the `@wallarm-org/migrator` migration for a design-system breaking change, so consumer apps upgrade via Renovate and still render the same.

Background (don't duplicate it here): [`packages/migrator/README.md`](../../../packages/migrator/README.md) and the spec [`docs/superpowers/specs/2026-10-22-migrator-design.md`](../../../docs/superpowers/specs/2026-10-22-migrator-design.md). The migrator's rule: **never guess** — anything not provably safe is reported with an in-code `/* @wds-migration(<id>): … */` marker.

## Usage

```
/new-migration [ref]
```

- No `ref` — migrate the current branch: `git diff main...HEAD -- packages/design-system/src packages/design-system/package.json`.
- `ref` — a commit SHA or range, to migrate an older change: `git show <sha> -- packages/design-system/src packages/design-system/package.json` (or `git diff <a>..<b> -- …`).
- `<base>` below = the code before the change: `<sha>~1` for a single SHA, `<a>` for a range, `$(git merge-base main HEAD)` for the current branch. Read old files with `git show <base>:<path>`; never check the old commit out.

## Instructions

### 1. Find the breaking changes

In `packages/design-system/src/**` (components, hooks, utils, theme/CSS tokens) and `packages/design-system/package.json`, look for:

- removed / renamed props, sub-components or exports (`index.ts`, `src/index.ts`);
- removed / renamed CVA variant keys or values in `classes.ts` — diff the old vs new `cva(...)` blocks, **including `compoundVariants` and any new `cva` the classes moved into** (a value can disappear from the root block and reappear in a layer block, e.g. `avatarPlateVariants`);
- changed `defaultVariants` and changed destructuring defaults in the component (`size = 'lg'`);
- changed public types (`*Props`, exported unions), hook/util signatures, renamed or removed theme tokens / CSS variables;
- `package.json`: `engines` (Node), `peerDependencies` (React etc.), `exports` (removed subpaths).

Also read the `BREAKING CHANGE:` lines of the commits (`git log --format=%B main..HEAD`) / PR body and the `!` in the title. Write the list of changes down before writing code.

### 2. Classify each change

- **Mechanical** → codemod: value rename, prop rename, prop split into two props, component/export rename.
- **Behavioural, ambiguous, or visual with no prop to change** → report-only migration: the transform only calls `ctx.report(el, …)` on each usage, with a message saying what to check.
- **No JSX usage** (hook/util signature, token/CSS rename, removed subpath, Node/peer requirement) → still a report-only migration (every breaking change ships one). There is no element to mark, so report on imports: walk `file.getImportDeclarations()`, keep those whose `getModuleSpecifierValue()` is `@wallarm-org/design-system` or `…/<subpath>`, and
  - for a symbol: `ctx.report(spec, …)` on each `decl.getNamedImports()` entry with `spec.getName() === 'useFoo'`, and on `decl.getNamespaceImport()` (can't tell which members are used);
  - for a repo-wide requirement (Node, peers): report **once per file, on the first DS import declaration** — transforms run per file with no run-level hook, a report needs a node, and every scanned file has a DS import.

  Reports on non-JSX nodes get **no in-code marker** (the runner only marks JSX elements); they land in `wds-migration.md` with file:line, which still trips the consumer's `@wds-migration` CI gate. Their fixture output equals the input, so assert the reports inline (step 6).

One migration per logical breaking change. Id = kebab `<component>-<change>` (e.g. `avatar-size-rename`, `numeric-badge-type-color`); file name = id.

### 3. Golden rule — preserve today's look

After migration the consumer must render the same as before the upgrade; opting into the new look is their call.

- **Derive every value mapping from the old vs new CVA classes** (`git show <base>:packages/design-system/src/components/<C>/classes.ts`), never from the names. Match on the classes that define the value (dimensions, colors), wherever they live now. Example: NumericBadge `type='destructive'` was `bg-bg-fill-danger text-text-primary-alt`; the new compound variant with those classes is `type='solid' color='danger'` — that's how the `type`→`type`+`color` table was built.
- Classes that **no new value reproduces** (e.g. Avatar's fallback text became a fixed `text-xs`, so old `xs`'s `text-2xs` is gone) can't be preserved by any mapping: match on the defining classes (dimensions, radius, colors) and mention the rest in the PR, not in the codemod.
- **Default changed?** On usages that omit the prop, insert the old value explicitly — unless the old default and the new default render the same. Prove that from the classes (Avatar: old default `sm` = `size-32 rounded-12`, new default `lg` = `size-32 rounded-12` → absent `size` stays absent).
- A mapping that isn't 1:1, or depends on runtime data → report, don't guess.

### 4. Write the migration

Create `packages/migrator/src/migrations/<id>.ts` exporting `migration: Migration` (`{ id, title, transform(file, ctx) }`, types in `src/lib/types.ts`). Copy the shape of `avatar-size-rename.ts` (value rename) or `numeric-badge-type-color.ts` (prop split). Use the helpers in `src/lib/jsx.ts`:

- `findComponentElements(file, 'Component')` — usages imported from `@wallarm-org/design-system` or `@wallarm-org/design-system/<Component>`, incl. aliased and namespace imports; a same-named local component is never matched;
- `getAttribute(el, name)`, `readStaticString(attr)` (string / `{'x'}` / `` {`x`} `` literal, else `undefined`), `replaceStaticString(attr, value)` (keeps the quote style);
- `hasSpread(el)`, `hasSpreadAfter(el, attr)`.

Edits with no helper yet (plain ts-morph 28):

- **Insert the old default**: `el.insertAttribute(0, { name: 'size', initializer: "'sm'" })` — at the front, so a later spread still wins; if `hasSpread(el)`, also report (the spread may already set it).
- **Rename a prop**: `attr.setName('newName')` (keeps the value).
- **Rename a component/export**: on each matching `decl.getNamedImports()` entry, `spec.setName('NewName')`; without an alias also rename the JSX tags (`findComponentElements`, then `el.getTagNameNode().replaceWithText(…)`, and the closing tag), or `spec.setName('NewName').setAlias('OldName')` to keep local usages valid.

Rules:

- One rename map, applied in **one pass** (never chained: `xs→md` and `sm→lg` must not turn `xs` into `lg`). Use `Object.hasOwn(MAP, value)`.
- Report (with a message starting with one shared `HINT` that names the change): non-literal values, a spread without the prop (`hasSpread`), a spread after the prop (`hasSpreadAfter`), an existing attribute that conflicts with what you'd insert.
- Idempotent on its own output: running it on migrated code changes nothing. Values that exist in both old and new APIs need care (NumericBadge `outline` + an existing `color` = already migrated).
- Edit the smallest node; don't reformat.

Register it in `packages/migrator/src/migrations/index.ts`: array order = release order, a new migration goes **last**. `registry.test.ts` checks that ids are unique and match file basenames.

### 5. Never edit `packages/migrator/versions.json`

The design-system release stamps the new id with its major automatically. Until then the migration is "pending" and only runs for a prerelease `--to` — that's how RC builds exercise it.

### 6. Tests

- **Fixtures** for every rewrite and every reported case: `src/migrations/__fixtures__/<id>/<case>.input.tsx` + `<case>.output.tsx` (output shows the `@wds-migration(<id>)` markers). `__tests__/fixtures.test.ts` runs each case and re-runs the output to prove idempotence.
- **Inline tests** in `src/migrations/__tests__/<id>.test.ts` (with `apply()` from `harness.ts`) only for exact report messages/counts and what fixtures can't express (CRLF, etc.).
- Must cover: aliased import (`{ Avatar as A }`), subpath import (`@wallarm-org/design-system/<Component>`), namespace import (`DS.Avatar`), a same-named local component left untouched, non-literal value, spread before/after the prop, idempotence (automatic via fixtures).

### 7. Verify

```bash
pnpm --filter @wallarm-org/migrator test:run
pnpm --filter @wallarm-org/migrator typecheck
pnpm biome check packages/migrator
pnpm --filter @wallarm-org/migrator build
```

Then smoke the built CLI from a scratch dir (in the scratchpad, not the repo: `wds-migration.md` is written to the cwd) holding a file that imports the component; explicit paths need no git:

```bash
node <repo>/packages/migrator/dist/index.js --from <last-stable> --to <new>-rc.1 <file>
```

`--from` must be the last stable version (a prerelease `--from` is rejected); prerelease `--to` so the pending migration runs. Check the rewritten file and `wds-migration.md`.

### 8. PR

- Title must be breaking (`feat(<scope>)!: …`) or the body must have a `BREAKING CHANGE: …` line — otherwise semantic-release won't cut a major and `require-migration` (`.github/workflows/pr-title.yml`) won't check.
- The migration goes in the **same PR** as the breaking change.

## Checklist

- [ ] Every breaking change listed (props, exports, CVA values incl. `compoundVariants` and moved blocks, defaults, types, hooks/utils/tokens, `package.json` engines/peers/exports, `BREAKING CHANGE:` lines)
- [ ] No-JSX changes still get a report-only migration (reports on DS imports)
- [ ] Each classified: codemod or report-only; one migration per change; id = file name = `<component>-<change>`
- [ ] Mappings derived from old vs new CVA classes, not names; non-1:1 or runtime-dependent → reported
- [ ] Changed default handled: old value inserted on usages without the prop, or proven identical from classes
- [ ] Uses `src/lib/jsx.ts` helpers; one-pass map; reports non-literal / spread / spread-after / conflicting attribute
- [ ] Registered last in `src/migrations/index.ts`
- [ ] `versions.json` untouched
- [ ] Fixtures for every rewrite and report (with markers); aliased, subpath, namespace import and local same-named component covered
- [ ] `test:run`, `typecheck`, `biome check`, `build` pass; CLI smoke with `--to <new>-rc.1` done
- [ ] PR is breaking (`!` or `BREAKING CHANGE:`) and contains the migration
