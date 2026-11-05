# Update Wallarm Design System to {{version}} in Claude Design

This guide updates a Wallarm Design System artifact the person installed in Claude Design to {{version}}. Work through the steps in order and run each check before moving on.

## 0. Find the system

The person's message gives the system's link, `https://claude.ai/artifact/<id>`: the link Claude gave at the end of the install. If they gave a canvas or project link instead, or no link, find the system yourself: the Artifact tool's `list` (`scope: "all"`) shows their artifacts with titles; pick the one titled `Wallarm Design System`, show the person its link and ask them to confirm it. Ask them for the link only if the list has none or several.

If the link is Wallarm's shared system, {{sharedArtifact}}, stop. Its maintainers update it from the repository; tell the person to ask them, or to install their own copy with the install prompt.

Check: the artifact's title is `Wallarm Design System` (as `list` shows it, or the header of a `read` with the link; a `read` leaves out the type's page, so don't look for the title in its content), and the `read` header says the person can edit it ("writer"). If not, tell them and stop.

## 1. Save the file list

List the artifact's files (the Artifact tool's `list` with the system's `url` and `scope: "files"`) and save their paths as a JSON array in `current-files.json`, for example `["project/tokens.css", "project/design-system.json"]`.

Check: `current-files.json` is a JSON array that has `project/design-system.json`.

## 2. Export the release

Run this command; it pins {{version}}, the release of this guide:

```bash
npx -y @wallarm-org/claude-design@{{version}} export --overwrite --existing current-files.json
```

Exit 0 or 3 are both done; on 3 the output names the manual step, which is removing the paths in `wallarm-design-system/removed.json` (steps 3 and 6). Any other exit: show the person the output and stop.

Check: `wallarm-design-system/files.json` and `wallarm-design-system/SETUP.md` exist, and `wallarm-design-system/SETUP.md` is for {{version}}. The steps below point into it.

## 3. Confirm removals

If `wallarm-design-system/removed.json` lists any path, show the person the list and ask them to confirm the removal. Remove nothing yet: step 6 removes what they confirm, after the new index is live.

## 4. Publish the files

Publish `wallarm-design-system/project/` to the same artifact link: every file except `project/design-system.json`, in batches as SETUP.md step 1 says, {{textPlainFiles}} as `text/plain`.

## 5. Icons, logos and the index

1. Read `project/design-system.json` from the artifact (the Artifact tool's `read` with `path: "project/design-system.json"`). Copy the file the read saved to `current-index.json`, or, if the read returned it inline, save that text unchanged. Don't retype it.
2. Run this exact command, and use it unchanged on every run below:

   ```bash
   npx -y @wallarm-org/claude-design@{{version}} index --blobs wallarm-design-system/blobs.json --index current-index.json
   ```

   It reuses the blob id of every SVG whose sha256 the current index already has, so `upload.json` lists only the new and changed SVGs. Exit 3: upload them and add their urls to `blobs.json` as SETUP.md step 1's "Icons and logos" says (items 2 and 3), then run the command again. Exit 0: nothing (more) needs uploading.
3. Right before publishing, read `project/design-system.json` again into `current-index.json` as in item 1 (the system's page may have saved it meanwhile), and run the command again: it exits 0 and merges this release into the index just read.
4. Publish `project/design-system.json` at once, last and alone.

Check: every `project/` path in `wallarm-design-system/files.json` ({{files}} files) is in the artifact, `project/design-system.json` has a `lastChange.note` that starts with `v{{version}}:`, and the page shows {{assetGroups}} with no broken image. `project/manifest.json` and files under `project/api/` are written by the system's page: they don't count and stay.

## 6. Remove dropped files

If the person confirmed removals in step 3, publish with the system's `url` and `files` mapping each confirmed path to `null`, and no other file in that call.

Check: no confirmed path is in the artifact's file list.

## 7. Reinstall on canvases

Ask the person which canvases use the system and wait for their links. On each one, install the system again from the system link, exactly as SETUP.md step 2 does, and run its checks, including copying `index.d.ts` again if it is missing. A canvas keeps its old copy until you do.

## 8. Refresh the sampler

On one canvas you reinstalled in step 7:

1. Read `project/{{samplerFile}}` from the canvas. If it differs from `wallarm-design-system/{{samplerFile}}`, the person may have built on it: ask them whether to replace it. If they say no, keep it, skip the rest of this step and tell them the new sampler is in `wallarm-design-system/{{samplerFile}}`.
2. Publish the new sampler to `project/{{samplerFile}}` as SETUP.md step 4 says. Read `project/canvas.json` right before merging into it (the canvas writes it when boards move), keep its board's `x` and `y` and its place in `order`.
3. Run the checks in SETUP.md step 5.

When every check passes, tell the person the system is on {{version}}, give them the system link, and wait for their request.

## When something looks wrong

| You see | Do this |
| --- | --- |
| The export command fails or can't reach npm | Show the person its output and stop. |
| The `index` command exits 3 | Upload the paths in `upload.json`, add their urls to `blobs.json` and run the step 5 command again. |
| Publishing `project/design-system.json` is refused as stale | The system's page saved a newer index. Save the version the refusal hands back as `current-index.json` (copy it; don't retype it), run the step 5 command and publish the index again. Nothing needs uploading again. |
| The gallery is empty or shows broken images | `project/design-system.json` was published before the `index` command exited 0, or with a wrong url. Fix `blobs.json`, run `index` again and publish the index again. |
| A canvas shows an older version | Install the system again on that canvas. |

Anything else: see "When something looks wrong" in `wallarm-design-system/SETUP.md`. Never edit a file in the system artifact or under a canvas's `project/ds/` folder to make a check pass. If a check still fails, tell the person which check, what you saw and the version ({{version}}). Problems go to https://github.com/wallarm/design-system/issues.
