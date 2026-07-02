# SplashScreen — usage

> The full-screen **first-load entrance** — the brand `Logo` over an indeterminate progress bar, shown *once* while the app boots, then it fades out or morphs into the app. It is **not** a general-purpose loading screen.

## Reach for it when
The app's **cold start** — first open, or a full browser / tab reload — while the shell bootstraps. Mount it with `visible`, then flip **`visible={false}`** the moment the app is ready. Once per app entry, and only there.

## Don't use it for
- **Between pages / route changes** → **never.** There is no splash on navigation; in-app transitions are instant (or use the loading family below for a loading *region*).
- **In-app / section / data loading** → `Loader` (spinner), `Skeleton` (layout placeholder), or `Progress` (a measurable task) — the in-context loading family.
- **A blocking wait for one action** → a `Loader` inside a `Dialog`, not a full-screen splash.
- It's a branded *entrance*, not a "show it whenever something is slow" veil.

## How it runs
- **You drive only `visible`** — `true` during boot, `false` when ready. The multi-phase animation (enter → fade → shrink → settle) is internal; don't try to step it.
- **Timing is your orchestration, not the component's** — it enforces no minimum on-screen time and no boot timeout. Drive `visible` from real readiness (a hardcoded timer / flag is fine in a prototype), and guarding against a flash on a fast load or a hang if readiness never arrives is the consumer's job.
- **Two exits.** With a **`shrinkTarget`** (`{ width, height, borderRadius }`) the splash **shrinks / morphs into that box and reveals `children`** inside it (the splash *becomes* the first view — e.g. a login card). Without one, it simply **fades out and unmounts** — and `children` aren't shown.

## Locked — don't override
- **Full-screen, and the brand moment is built in** — a centered `Logo` + an indeterminate `Progress`. Don't rebuild it or swap in your own spinner; that composition *is* the component.
- **The phase machinery is internal** — only `visible` (+ the optional `shrinkTarget` / `children`) is yours to set.

## Pairs with
- `AppShell` — the shell the splash precedes. **It ships its own first-load `reveal`, so pick one, don't run both:** prefer AppShell's `reveal` when you're already inside an AppShell; reach for `SplashScreen` for a pre-shell boot (e.g. a login screen) or when you want the shrink-into-a-view morph.
- `Loader` / `Skeleton` / `Progress` — for everything that *isn't* first boot (sections, data, tasks).
- `Logo` / `Progress` — composed inside; you don't place them yourself.
