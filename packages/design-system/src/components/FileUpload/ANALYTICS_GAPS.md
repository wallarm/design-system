# FileUpload — Analytics Gaps

Single source of truth for `FileUpload`'s analytics decisions, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md). Every interactive target is an
exported part whose `{...rest}` lands on the real DOM node:

| Target | Part | Node |
|---|---|---|
| Drop Area (click / Enter / Space / drop) | `FileUploadDropzone` | `div[role=button]` |
| "Select file" | `FileUploadTrigger` | `button` |
| Replace | `FileUploadItemReplaceTrigger` | `button` |
| Delete / Cancel | `FileUploadItemDeleteTrigger` | `button` |
| Download (and any other row action) | `FileUploadItemAction` | `button` |

## Known gaps (wrapper-level decisions)

- **Drag-and-drop is not a click.** Click-capture SDKs see the Area's click / Enter,
  not a drop. Consumers that need drop analytics listen for `drop` on the Area themselves
  (`onDrop` is forwarded and composed) or use `onValueChange` / `onFileReject`.
- **The native file input is not a target.** `input[type=file]` is hidden and
  `aria-hidden`; analytics never land on it (asserted in `FileUpload.analytics.test.tsx`). The
  multi-mode Replace uses its own internal hidden input, same rule.
- **`FileUploadError` owns its `id`.** The pickers reference it via `aria-describedby`,
  so a consumer `id` is overwritten. It is not interactive.

Owner: Design System team. Revisit when a consumer asks for drop-level events.
