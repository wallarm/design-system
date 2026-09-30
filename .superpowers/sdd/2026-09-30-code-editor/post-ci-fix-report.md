# Post-CI fixes
1. Fullscreen 0x0: ChromeFrame FULLSCREEN_CLASSES `max-w-none max-h-none` -> `max-w-[none] max-h-[none]` (only occurrence in src). CodeSnippet.fullscreen test updated (asserts new classes, old absent, consumer max-w-[600px] removed).
   Probe (1280x720, editing-workflow, click fullscreen): editing rect = 1248 x 688.
2. Search highlight: search.ts theme uses warning-indicator color-mix 24% / 48% + 1px outline; new search.theme.test.ts (red first). Spec 7.10 row updated.
   Probe: .cm-searchMatch bg oklab(... / 0.24); .cm-searchMatch-selected bg oklab(... / 0.48), outline rgb(225,113,0) solid 1px.
Checks: vitest 80 files / 741 pass; tsc clean; biome 0 errors (12 pre-existing warnings); turbo lint ok.
