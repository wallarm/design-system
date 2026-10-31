# Dark component audit — 2026-10-31

The Foundation values match the repository: 257 palette colours and 218 semantic
colour tokens outside syntax highlighting. Component-level checks nevertheless
found incorrect inheritance and example composition.

Sources: [WADS Foundations](https://www.figma.com/design/AfxTvEJd0kugrKqpyVigN4/WADS-Foundations?node-id=2841-3722)
and [WADS Components](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components).

## Confirmed fixes

| Component | Problem | Change |
| --- | --- | --- |
| Toast | Default/loading custom icons inherited page text: `#f8fafc` on the dark theme's light `#f1f5f9` toast. | Root now supplies `text-text-primary-alt`; explicit and status icon colours retain precedence. |
| Badge, muted Slate outline | References to nonexistent `badge-slate-muted` utilities caused the label and border to inherit the host colour. | Uses Figma's `text-badge-slate-dark` and `border-border-primary`. |
| OverflowTooltip example | Rich content used `text-text-secondary`, a pale colour on the inverted tooltip surface in dark mode. | Uses `text-text-secondary-alt`. |
| Button examples | `neutral-alt` examples sat on the normal page surface, obscuring their inverted text. They also showed an Outline combination absent from the Figma set. | Ghost/Secondary examples now sit on an inverted surface in normal, disabled and loading stories. The public Button API is unchanged. |

References: [Toast](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1576-14412),
[muted Slate Badge](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1098-93215),
[neutral-alt Ghost](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1576-8723),
[neutral-alt Secondary](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1576-8730).

## Design discrepancies left visible

- **Tooltip opacity:** the [dark example frame](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7128-136544)
  contains two different fills. The plain instance `7128:136546` has an unbound
  `slate-100 / 80%` fill; the keyboard instance `7128:136542` uses
  `component/tooltip-bg`, resolving to `slate-100 / 93%`. The implementation follows
  the latter token for both variants. The main text, radius, and absence of
  border/shadow agree. Changing the global token to match the local override would
  make the keyboard example disagree. No opacity changes were made.
- **Primary Banner:** the [source component](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7688-3742)
  is marked “No dark-ui”. Its actual bindings combine the inverted toast surface
  with ordinary tertiary description text and ordinary neutral outline controls.
  Those bindings are reproduced in code, but in dark mode the description and
  close icon become nearly invisible. A dark Banner design is still needed;
  this audit does not invent a replacement mapping.
- **Toast loading reference:** Figma's loading spinner references
  `icon/primary-alt-fixed`, which stays white. The implementation already uses
  the adaptive `primary-alt` colour, keeping the spinner visible on the light
  dark-theme toast. This existing choice was preserved.

Syntax highlighting remains unchanged, as requested. Unsupported muted Badge
combinations were not assigned invented mappings.

## Checked states and limits

| Sample | Evidence |
| --- | --- |
| Tooltip: plain, description, keyboard shortcut | Figma bindings and the explicit dark example; browser colours and dimensions. |
| Toast: default/loading custom icons, status and explicit icon colours | Figma foreground/surface bindings; browser checks in both themes. |
| Badge: muted Slate outline | Figma label, border and fill bindings; both themes on a coloured host. |
| Button: primary Brand, neutral outline, neutral-alt Ghost/Secondary | Figma bindings; dark browser rendering and corrected example context. |
| Popover, Dialog, DropdownMenu: basic open state | Figma uses `surface-2` + `border-primary-light`; browser resolves `#141829` + `#314158` with `#f8fafc` primary text. |
| Input: basic empty state | Figma background, border and placeholder bindings; browser colours match. |
| Select: basic open state | Browser surface, border and text token check; not a full Figma variant/layout comparison. |
| Banner: primary with description and close | Browser reproduction of the design limitation above. |

Apart from Tooltip, the inspected component pages do not contain explicit Dark
example frames. Their existing variable bindings were evaluated against
Foundations' Dark mode, then compared with browser output. No Figma file edits
were made. This is a targeted colour/contrast audit of the listed states, not an
exhaustive screenshot audit of every component, variant, interaction or viewport.

## Regression coverage

`ToastTheme.e2e.ts` checks default/loading custom-icon inheritance and preservation
of explicit/status colours in light and dark. `Badge.theme.e2e.ts` checks label,
border and background on a contrasting host in both themes. Each reproduced the
bug before its fix. Three Button visual baselines were regenerated with
Playwright 1.63.0 in Linux; the existing Badge baselines passed unchanged.

Verification: workspace lint, typecheck and unit tests passed (design system:
3,339 passed, 37 skipped). A fresh Linux run passed all 13 selected checks: eight
new light/dark regressions and five existing Button/Badge screenshot tests.
The full repository E2E suite was not run.
