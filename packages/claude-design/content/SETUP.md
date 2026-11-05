# Install Wallarm Design System {{version}} in Claude Design

This guide ships with Wallarm Design System {{version}}. Work through the steps in order and run each check before moving on.

The export wrote `wallarm-design-system/`:

| Path | Contents | Publish it |
| --- | --- | --- |
| `project/` | The design system: {{files}} files | Yes: every file, unchanged |
| `SETUP.md` | This guide | No |
| `{{samplerFile}}` | The sampler artboard, for step 4 | To the canvas, in step 4 |
| `files.json` | Every file the export wrote, with its sha256 | No |
| `removed.json` | Paths an update drops. Written only with `--existing` | No |

If the person already has a Wallarm Design System artifact and gave you its link, skip to [Update to a new release](#update-to-a-new-release).

## 1. Publish the system

Create a new **Design System** artifact titled `{{title}}`, with the description "{{description}}". Publish the files of `wallarm-design-system/project/` to it, each at its path under `project/` (for example `project/tokens.css`). Don't add, rename, edit or skip a file.

- Send {{textPlainFiles}} with the content type `text/plain`; the artifact refuses it otherwise. Every other file's type follows its extension.
- A publish takes at most 255 files, so send the files in batches of up to 200.
- Send `project/design-system.json` last, alone, after every other batch has succeeded. It is the system's index; it already carries the marker a new system needs.
- Icons need no upload. They ship inside `components/bundle.js` as `WallarmDS.Icons.<Name>`, and the logo as `WallarmDS.Logo`. This export has no static SVG files and its index lists no asset groups, so don't upload any assets.

Check: every `project/` path in `wallarm-design-system/files.json` ({{files}} files) is in the artifact, its title is `{{title}}`, and `project/design-system.json` has a `lastChange.note` that starts with `v{{version}}:`. The page may add `project/manifest.json` and files under `project/api/`; they don't count. Give the person the artifact's link: they need it to install the system on other canvases and to update it.

If a publish is refused for a reason this step doesn't cover, show the person the error and stop. Don't edit or rename files to get past it.

## 2. Create a canvas and install the system

Create a Design canvas and install the system on it from the link in step 1.

The canvas copies the system into one folder under `project/ds/`. This guide expects `project/ds/{{folder}}/`. Check that the canvas has:

{{canvasFiles}}

If the folder has another name, use that name in place of `{{folder}}` from here on, and in step 4.

If `index.d.ts` is missing, copy `project/components/index.d.ts` from the system to `project/ds/{{folder}}/components/index.d.ts` unchanged. The props panel reads it; without it no prop gets a control.

## 3. Read the canvas rules

Read `wallarm-design-system/project/README.md`, at least {{readmeSections}}. They give the `WallarmDS` namespace, how to mount a component with `x-import`, how to pass props through `renderVals()` holes, the spacing scale and the dark theme. Follow them on every artboard you draw.

The README's paths, its load order and its `sampler.dc.html` are relative to the system, not to a canvas. An artboard sits in the canvas's `project/` folder, so start every new artboard's `<head>` with these lines, in this order, and add no other link lines for the system:

```html
{{canvasHead}}
```

When the README says to start a screen from the sampler, start from `project/{{samplerFile}}` on the canvas (step 4), not from the system's `sampler.dc.html`. Icons are `WallarmDS.Icons.<Name>` and the logo is `WallarmDS.Logo`; this export has no SVG files.

## 4. Add the sampler

`wallarm-design-system/{{samplerFile}}` is a Users settings screen built only from the system. It is also the install test. Put it on the canvas exactly as it is: don't retype, reformat or rename it, and don't add link lines or scripts; it has them. Its links point at `ds/{{folder}}/`. Only if step 2 found a different folder, replace `ds/{{folder}}/` with `ds/<that folder>/` in its three link lines and change nothing else.

A canvas keeps its files under `project/`. Its index is `project/canvas.json`, and each artboard is a `.dc.html` file in `project/`.

1. Publish the file to the canvas at `project/{{samplerFile}}`:
   - If the Artifact tool takes `files` as a map, map `project/{{samplerFile}}` to the local file `wallarm-design-system/{{samplerFile}}`.
   - If it takes a list of absolute paths, first copy the file unchanged into the canvas's `project/` folder: `cp wallarm-design-system/{{samplerFile}} /mnt/user-data/outputs/artifacts/<canvas id>/project/{{samplerFile}}`, then publish that path.
2. Merge this key into `boards` in `project/canvas.json`. `boards` is keyed by artboard file name, relative to `project/`; `x` and `y` place the board on an empty canvas.

   ```json
   {{boardEntry}}
   ```

   If the canvas has other boards, set `x` to the largest `x + w` among them plus 80. If `boards` already has `"{{samplerFile}}"`, keep its `x` and `y` and replace the rest.
3. Append `"{{samplerFile}}"` to `order` in `project/canvas.json` unless it is already there. Keep every other key and entry as it is.

Check: read `project/{{samplerFile}}` back from the canvas; it matches the export's copy. `project/canvas.json` has `"{{samplerFile}}"` in `boards` and exactly once in `order`. A board titled `{{boardTitle}}` shows on the canvas.

## 5. Check the sampler

If you can't see the canvas or its console, ask the person to check each item and tell you what they see.

- The console has no `[WallarmDS]` warning and no error. A `[WallarmDS] class "…" has no CSS` warning means a class is missing from `components/bundle.css`.
- Every part renders: the top header with the Wallarm logo, the navigation rail (Home, Security, Settings), the `Users` page header with its `Create user` button, the toolbar with the search field and the `All` / `Active` / `Invited` / `Deactivated` tabs, the users table with five rows (status badges, roles, last active, an actions menu on each row), and the `Ana Ruiz` drawer on the right with its `API tokens` section and the `No API tokens yet` empty state.
- The text is in Geist, not the system font.
- Nothing is cut off at the bottom of the board and nothing spills out of the table or drawer. If the bottom is cut off, raise the board's `h` in `project/canvas.json` until it fits.
- Type `zzz` in the search field: the table shows `No results found` with a `Reset filters` button. Click it and the five rows come back.
- Open a row's actions menu: `Edit user` and `Delete user` show. Press Escape to close it.
- Select the `Create user` button: the props panel shows its props with controls (for example `variant` as a dropdown).

The sampler is light only. For a dark artboard, set `theme="dark"` on its `WallarmDS.Root`, as the README says.

When every check passes, tell the person the Wallarm Design System is ready, give them the system link, and wait for their design request.

## Update to a new release

If the link is Wallarm's shared system, {{sharedArtifact}}, stop. Its maintainers update it from the repository; tell the person to ask them, or to install their own copy from step 1.

1. From the person's system artifact, save its file paths as a JSON array in `current-files.json`, and its `project/design-system.json` unchanged in `current-index.json`.
2. Export again:

   ```bash
   npx -y @wallarm-org/claude-design@latest export --overwrite --existing current-files.json --index current-index.json
   ```

   `--index` keeps what the system's page added to its index and replaces only what the release owns. If the command exits 3, carry on: the output names the manual step, which is removing the paths in `wallarm-design-system/removed.json`.
3. Read the new `wallarm-design-system/SETUP.md`; it belongs to the new release.
4. If `wallarm-design-system/removed.json` lists any path, show the person the list and ask them to confirm the removal. Remove nothing they don't confirm.
5. Publish `wallarm-design-system/project/` to the same artifact link: every file, in batches as in step 1, {{textPlainFiles}} as `text/plain`, `project/design-system.json` last. Then remove each confirmed path from `wallarm-design-system/removed.json`.
6. Check: every `project/` path in `wallarm-design-system/files.json` ({{files}} files) is in the artifact, no confirmed removed path is, and `project/design-system.json` has a `lastChange.note` that starts with `v{{version}}:`. `project/manifest.json` and files under `project/api/` are written by the system's page: they don't count and stay.
7. Install the system again on every canvas that uses it, then run the checks in step 2 there. A canvas keeps its old copy until you do.
8. On one canvas, replace `project/{{samplerFile}}` with the new release's sampler as step 4 says. Keep its board's `x` and `y` and its place in `order`. Then run the checks in step 5.

## When something looks wrong

| You see | Do this |
| --- | --- |
| The publish is refused for `index.d.ts` | Send `project/components/index.d.ts` as `text/plain`. |
| The publish is refused for too many files | Send smaller batches, as step 1 says. |
| No sampler board shows | The file isn't at `project/{{samplerFile}}`, or `project/canvas.json` has no `"{{samplerFile}}"` in `boards` or `order`. |
| Components render unstyled | The link lines don't reach `project/ds/{{folder}}/`. The artboard must sit directly in `project/`, and the folder name must match step 2. |
| `WallarmDS is not defined` | `components/bundle.js` isn't loaded: same cause as above. |
| Nothing renders and the console is empty | The sampler was changed. Publish the export's copy again, as step 4 says. |
| A `[WallarmDS] class "…" has no CSS` warning | The class doesn't exist on the canvas. Use one from `components/UTILITIES.md`; numeric utilities are in px (`p-16` is 16px). |
| A prop has no control | `project/ds/{{folder}}/components/index.d.ts` is missing. Copy it as step 2 says. |
| A canvas shows an older version | Install the system again on that canvas. |
| Text shows in the system font | The fonts in `project/fonts/` weren't published or installed. Check step 1's file check and step 2. |
| The export command fails or can't reach npm | Show the person its output and stop. |

Never edit a file in the system artifact or under `project/ds/{{folder}}/` on a canvas to make a check pass. If a check still fails, tell the person which check, what you saw and the version ({{version}}). Problems go to https://github.com/wallarm/design-system/issues.
