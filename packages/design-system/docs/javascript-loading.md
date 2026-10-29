# JavaScript loading and sharing

## Syntax adapters

Existing imports continue to work:

```ts
import { loadPrismAdapter } from '@wallarm-org/design-system/CodeSnippet';
```

Each loader lives in its own module. Re-exporting several functions containing
`import()` from one implementation module can leave the unused functions' async
chunks in a Rspack production build. Independent loader modules let the consumer
discard those graphs. A Prism consumer must not emit Shiki or highlight.js.

Shiki initializes on the first `highlight()` call and shares that initialization
across concurrent calls. It uses `shiki/core`, Oniguruma, the `github-light` theme
and the existing 21 language identifiers (20 grammars plus the `shell` alias).
Grammar modules include their embedded dependencies. The full Shiki registry is
excluded; unsupported languages still fall back to plain text.

`pnpm --filter @wallarm-org/design-system test:bundles` runs after the package is
built. CI runs it after `Build all packages`. It builds real consumers through
the published export map and checks **all emitted JS**, including async chunks,
for unwanted engines and size/file-count regressions. React is externalized,
minification is enabled and automatic splitChunks is disabled for reproducibility.
These totals describe output, not the bytes fetched on initial navigation.

Measured on the 4.3.3 source baseline with Rspack 2.2.8 (2026-10-29):

| Consumer | Before: JS files / gzip bytes | After: JS files / gzip bytes |
| --- | ---: | ---: |
| Button from root | 1 / 15,834 | 1 / 15,834 |
| loadPrismAdapter | 317 / 5,965,405 | 5 / 31,607 |
| loadHighlightJsAdapter | 317 / 5,965,408 | 3 / 310,452 |
| loadShikiAdapter | 317 / 5,965,404 | 4 / 470,266 |
| plainAdapter | 1 / 168 | 1 / 168 |

The highlight.js adapter still loads highlight.js's existing full entry. This
change isolates it from the other engines; narrowing its language set is separate
work. Whole-library icon namespace imports also retain the icon namespace.

## Sharing components between remotes without changing imports

A DS release alone cannot deduplicate independently bundled applications. The
host and remotes must agree on Module Federation share keys and compatible
versions. Their application imports can stay unchanged.

Start with an explicit allowlist of frequently reused component subpaths in the
common Rsbuild/Federation config. Host and remotes deploy independently, so the
default should allow multiple DS versions instead of enforcing a global DS
singleton:

```ts
const sharedDesignSystem = (installedDsVersion: string) => ({
  '@wallarm-org/design-system/Button': {
    singleton: false,
    eager: false,
    requiredVersion: installedDsVersion,
    strictVersion: true,
  },
});
// Merge into the host and each remote's Module Federation `shared` map.
```

Read the **actual installed version** at build time, not a dependency declaration
such as `^4.3.0`. Leave the default local import/fallback enabled; do not set
`import: false`. React remains a separate singleton. The common config wrapper
must accept general MF shared options: its current type inferred from singleton
presets only permits `singleton: true`.

An isolated three-container Node runtime probe using MF 2.4.0 and Rspack tested
real DS 3.2.0 and 4.3.3 builds with unchanged `/Button` imports:

1. The old host loads DS 3.2.0.
2. A newly registered remote requiring 4.3.3 loads its own compatible provider.
   Its Button is different from the host's; the host's Button stays unchanged.
3. Another remote requiring 4.3.3 reuses the first remote's Button. It loads only
   its expose wrapper, without its local Button/vendor fallback chunks.

This verifies version negotiation and reuse during gradual rollout, not browser
rendering or provider identity. Browser navigation and context coverage remain
necessary before enabling a production preset.

An exact root key only intercepts root imports. A trailing-slash key
`'@wallarm-org/design-system/'` intercepts all subpaths, assigning a distinct key
to each suffix. It also catches broad entries such as `/icons` and `/CodeSnippet`;
classic sharing provides all exports of each shared entry, weakening the normal
consumer-level tree shaking. Prefer an explicit component allowlist initially.

Constraints for the preset:

- Keep `eager: false` and an async bootstrap boundary. A shared component should
  load when needed. Local fallback chunks can remain in each build without being
  fetched during normal sharing; prefetching every manifest asset defeats that.
- Begin with exact-version, non-singleton sharing: identical releases deduplicate;
  different releases coexist without forcing coordinated deployments. Duplication
  naturally falls as applications upgrade. Different versions still cost bytes.
- After compatibility testing, agreed semver ranges can reuse providers across
  patch/minor versions. A shared major alone is not proof of compatibility.
  Version selection is per share key, so related contexts must not drift
  independently. Exact versions are the conservative default.
- A global `singleton: true` with `strictVersion: true` can block gradual rollout
  on version mismatch. Setting `strictVersion: false` may instead silently use an
  incompatible version after a warning; it is not a fallback to a private copy.
- Sharing `/Button` does not automatically share root `{ Button }` imports or
  internal relative imports. Sharing `/Drawer` and `/Dialog` separately does not
  guarantee deduplication of their common internals. Existing React and overlay
  state sharing remains necessary.
- Keep `/icons` and `/CodeSnippet` out of the initial blanket preset. Adapter
  loaders and per-icon entries need finer sharing boundaries or a measured
  tree-shaken shared build. Source imports can be preserved by a build-time
  transform if root/subpath normalization is needed later.
- Share context-bearing families and their providers consistently, and test
  provider/consumer identity across containers. CSS/theme loading needs its own
  policy; JS sharing does not deduplicate independently generated CSS.

MF 2.4.0 also exposes shared tree shaking. `runtime-infer` can fall back to a full
bundle when another remote needs additional exports; it does not guarantee one
minimal singleton across all remotes. `server-calc` aggregates usage across
deployments and is a larger CI/deployment change. Neither should be enabled for
the entire DS without measuring cross-remote transitions.

Suggested integration order: fix DS async graphs; pilot Button/Text/Stack sharing
on an old host and two gradually upgraded remotes; measure cold and cached
navigation in both orders; then expand the allowlist. Verify network initiators,
actual bytes, share-scope providers, standalone fallback and version coexistence.
Preserve application import syntax throughout.

References: [MF shared configuration](https://module-federation.io/configure/shared),
[shared tree shaking](https://module-federation.io/guide/advanced/shared-tree-shaking),
[Shiki fine-grained bundles](https://shiki.style/guide/bundles#fine-grained-bundle).
