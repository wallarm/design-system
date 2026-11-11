# Agent characters: Phase 0 decision record (WDS-196)

Date: 2026-11-05. Reference: look v14, the handoff's `reference/agent-characters.html` (2,537 lines). Handoff:
https://claude.ai/artifact/DaxA77RBheCmk1MtQELbGp. The work landed on `feat/WDS-195-agent-avatars`
with WDS-196…204.

This record covers the calls the handoff leaves to engineering for Phase 0 (09 «Phase 0 › Decide and record»). It cites
the handoff rather than restating it.

## What the spike proved

Our TypeScript port (`packages/design-system/src/lib/agent-characters/`) was injected into the reference page and
compared with the page's own output in the same browser:

| Check | Chrome 156 (DPR 1 / 1.5 / 2) | WebKit 26.6 (DPR 2) | Firefox 153 (DPR 2) |
|---|---|---|---|
| `geom()` per shape (top, 240 half-width rows, foot), `optY()` | 12/12 identical | 12/12 | 12/12 |
| Baked layers: 6 presets × 40/48/56/72/120 px × body, parts, props, veil (110 layers) | 110/110 pixel-identical, main thread and worker | 110/110 | 110/110 |
| `region()` per layer | identical | identical | identical |
| Static characters, 6 presets × 6 states × 40/72/120 px, with every baked layer swapped for ours | identical within raster noise* | 108/108 exact | 108/108 exact |

\* Chrome's long batch runs show ±1–2 levels (±8 at DPR 1.5) on a few dozen pixels. A control run gives the same noise:
it swaps in the page's *own* bytes as blob URLs. Isolated reruns of the worst case give 0 px. This is Chrome
re-rasterising images, not a port difference.

Pure parts are unit-tested against fixtures captured from the page (`scripts/agent-avatars/capture-fixtures.ts`):
- `eyesPath`: 144 cases (4 styles × 10 states × 3 shapes, plus Hello pop and gaze);
- `propDef`: every prop on every shape (180 cases);
- `glyph`: 350 strings (cast × 10 states × 16/20/24/32/17.5 px, plus five looks outside the cast);
- the bake math: the page's own masks in, the page's own pixels out, for felt, a holed outline and vinyl.

The tests also check against the handoff's `data/cast.json` «resolved». Mutating one constant fails them.

Glyph pixel parity follows from string identity.

## Decisions

| Call | Decision | Evidence |
|---|---|---|
| Package layout | The core sits inside `@wallarm-org/design-system`, framework-free, under `src/lib/agent-characters/` (an internal library the metadata scan skips). React wrappers come in WDS-198/199. A separate package only if P15 brings a non-React consumer (07 §6.1). | The port is plain TS with no React. The host shares DS subpaths per version (H1 below). |
| Document runtime | One runtime per document on `globalThis[Symbol.for('wallarm.agent-characters')]`, keyed by protocol (07 §6.5). It owns the frame loop, the bake queue, the caches, the behaviour budget, the inviter slot, the id counter and the off switch. | H1: the host shares the DS exact-version and non-singleton, so two DS versions on one page are normal. |
| Worker bake | **Default from Phase 1.** One blob-URL worker per document runs the same `solveField`/`shade` source with OffscreenCanvas. Any failure falls back to the main thread: no `Worker` or `OffscreenCanvas`, a CSP that blocks `blob:` workers (reported as an async `error`), a crash, or a job error. Pending jobs are re-run there, and later jobs go straight there (unit-tested). The shared functions use no spread or destructuring, so a transpiler injects no module helpers into the worker source. | Pixel-identical to the page in all three engines. The worker path ran natively in each, not via the fallback. The main thread is blocked for ≤ 6.6 ms per layer (27.6 ms on the first call, which starts the worker). The page's bake blocks 34–56 ms. |
| Cache | PNG blobs as object URLs, never data-URL strings. LRU of 256 baked layers and 64 height fields; evicted URLs are revoked (06 §9). The key is `LOOK_VERSION`, path, colour, pixel size and material. `LOOK_VERSION` hashes the shading source. | `src/lib/agent-characters/bake.ts`, `queue.ts`; LRU unit-tested. |
| SVG rendering | **Core-built, React-rendered** (revised in WDS-199). The core builds the markup as a node tree (`charTree`, `glyphTree`) and React renders it; the root is the `<svg>` with `ref: Ref<SVGSVGElement>`, like `AgentGlyph` (07 §6.2's span root was a proposal, «Your call»). Live motion (WDS-201) writes attributes on the rendered nodes outside React render. Previously: **Core-rendered.** The core builds the reference's markup (the `makeChar` template, ported verbatim) and owns every per-frame attribute write. The React wrapper only mounts the node, passes the config and disposes. Final in WDS-199. | Markup ported from strings keeps pixel parity trivial, as the composites above show. Per-frame writes stay outside React render, which the React Compiler needs. |
| Test runners | Rstest (jsdom) for the pure port, against fixtures captured from the page. Playwright with real browsers for canvas work (`geom`, mask, bake, worker) and side-by-side composites. | jsdom has no canvas or `getBBox`. CI Playwright is Chromium-only in Docker, so WebKit/Firefox parity is a pre-merge manual run of the harness. |
| Closed sizes | Glyph: 16, 20, 24, 32. 3D: 40, 48, 56, 72, 120, 256. Each place sets liveness and shadow (05 §2.1, D1/D2). | 05 §2.1. No place uses 33–39 px. |
| Bake scheduling | The page's queue: 14 ms slices, 16 ms apart, dead nodes skipped, front priority. Worker bakes run outside the slices. | `src/lib/agent-characters/queue.ts`, unit-tested. |

## Requirements from the Phase 0 review, and where they landed

- **No unfinished code in the package:** the core lives in `src/lib/agent-characters/` (the metadata scan skips it) and
  ships only behind `AgentGlyph`, `AgentAvatar` and `AgentLookBuilder` (WDS-197, WDS-198).
- **Geometry as data:** `GEOMS` and `PRESET_PROPS` are generated from the page; `glyph()` needs no canvas (WDS-197,
  WDS-204). A test keeps `data.gen.ts` equal to the generator's output.
- **Glyph clip ids:** named by shape (`agent-glyph-crown-<shape>`), so duplicates across DS copies resolve to identical
  geometry (WDS-198).
- **Document runtime:** caches, the measuring path, the queue, the worker and the id counter live on one
  `globalThis[Symbol.for('wallarm.agent-characters')]` object; listeners start on the first live mount and stop after
  the last unmount (WDS-200).
- **Revoke only layers nobody references:** shown bakes are retained and the LRU skips pinned entries (WDS-199).
- **Pixel size:** P = ⌈R × size / 136 × min(2, devicePixelRatio)⌉, read at bake time (`bakeSize`, WDS-199).
- **Worker by default:** `useBakedLayers` bakes through the worker runner; its fallback runs through the 14 ms queue
  (WDS-199).
- **`LOOK_VERSION`:** a hand-bumped revision (`'v14.1'`), not a hash of function source (WDS-199).

## Measurements (this machine)

Apple M1 Max, Chrome 156, under heavy unrelated load (load average 17–60). Times are 1.5–2× the handoff's M4 Air figures,
so they are **not** used for budgets.

- **The handoff's scripts reproduce.**
  - `data/export.cjs` gives identical JSON.
  - `measurements/bake-cost.cjs` gives identical counts and sizes: 98 textures, 147 layers, 53 characters, 1.86 MB of data URLs, and the same data-URL KB per size.
- **`frame-cost.cjs`:** 12 live, 59.9 fps, 0.28–0.33 ms of JS per frame, about 30 renders per character per second (consistent with N9).
- **`perf/lab.cjs team`:** 15 live at CPU 1× / 4× / 6× gives 60.8 / 57.8 / 35.7 fps (handoff: 60 / 60 / 60). Static views stay at ~0% busy.
- **Port, per dome layer:**
  - solve 25–41 ms, mask ~2 ms;
  - shade 1.4 ms at P 87, 20.5 ms at P 347;
  - PNG encode 8–20 ms of wall time, async.
- Raw numbers: kept with the spike's scratch scripts, outside the repository.

**Not measured:**
- the low-end machine (P18 unnamed);
- a cold open of 15 *port* cards, which needs the component and runtime (WDS-199);
- Safari outside Playwright's WebKit build.

## H1: new platform host

Read from `core-frontend` `origin/main` at 42849d1:
- **DS sharing:** `apps/host/rsbuild.config.ts` shares DS subpaths through `sharedDesignSystem`: `singleton: false`, `strictVersion: true`, exact version. The DS is **4.6.1** (the handoff says 4.5.1).
- **CSP:** none anywhere in `core-frontend` (`nginx.conf`, `index.html`, rsbuild config). `worker-src blob:` and `img-src blob:` are restricted only if an edge or ingress adds a CSP. That is unknown, so it is recorded as a **Phase 4 risk**. The worker falls back to the main thread if blocked. Blob image URLs would need `img-src blob:`.
- **`ai-assistant-remote`:** its repository was not available, so whether it receives the host's DS is unverified.

## Corrections to the handoff

1. README: the scripts also run with `playwright-core` 1.63.0 (README pins 1.58.2), with identical output.
2. 07 §6.5 / 03 §13 note 1: the worker bake is now **reproduced on look v14** as pixel-identical in Chrome, WebKit and Firefox at DPR 1/1.5/2 (110 layers). The «reported, not reproduced» caveat can go.
3. 07 §3: the host's DS is 4.6.1 on `origin/main` (2026-11-04), not 4.5.1.
4. The published page and the offline copy differ only in the `<head>` wrapper; the code is identical.

## Questions back

1. **Product (P18):** which low-end machine or profile do the budgets target? Without one, Phase 1 uses a named CI runner profile.
2. **Platform (H1):** does any edge or ingress in front of the new platform set a CSP? If so, we need `worker-src blob:` and `img-src blob:`.
3. **Consumer:** access to `ai-assistant-remote`, to confirm it receives the host's shared DS.

## Cast as of 10.11 (WDS-205, 2026-11-11)

The reference is now look v17 (the look page artifact), exported with the handoff's `data/export.cjs`. Against v14 it
adds Lens (mochi, mint, tall eyes, periscope), Bard (cloud, powder, oval eyes, quill) and the quill prop, and rewords
the agents' descriptions. Shapes, colours, eyes, states and every other prop are unchanged, and so is the bake, so
`LOOK_VERSION` stays.

The shipped cast follows the ticket, which is later than the page:

- **Acquit** ships with Mend's look and template (`fp-resolver`). `agent='mend'` is gone.
- **Probe** has no live agent and leaves the presets. `agent='probe'` now gets its default look, like any other id.
- **Tune** is a new agent with no character yet. It gets its default look until one lands (P10).

The data files and every fixture keep the page's ids. `scripts/agent-avatars/export-data.ts` renames and drops
presets only for the module it generates, and the parity tests look fixtures up in the page's presets
(`__tests__/pageCast.ts`). `default-look.json` was re-run against the shipped cast, so a custom agent can now draw
Probe's egg in olive but not Lens's or Bard's look.
