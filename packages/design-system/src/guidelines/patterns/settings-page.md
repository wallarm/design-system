---
title: Settings page
description: Use when building a page of independent settings (profile, preferences, appearance) where each value saves on its own and a toast confirms it.
components: [Page, PageHeader, PageHeaderGroup, PageContent, PageTitle, RemoteShellBreadcrumb, Heading, Text, Field, FieldLabel, FieldError, Input, Select, SelectInput, SegmentedControl, RadioGroup, Radio, Switch, Button, Avatar, FileUpload, Separator, Tooltip, Toast, Dialog, PasswordInput, PasswordComplexity, ThemeProvider, ImageCropper, Slider, NavRail]
keywords: [settings, settings page, profile, preferences, account settings, user settings, appearance, theme picker, label value row, settings row, settings section, autosave, save on blur, danger zone, delete account, change password, change email, timezone, date format, time format, sidebar style, form page]
order: 70
---

# Settings page

A 640px column of sections. Each row saves itself and a toast confirms it. No Save button.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Independent values of one account or org | This pattern | One form with a Save button |
| Values saved together (a provider config) | [Create and edit forms](./create-edit-forms.md) in a `Drawer` | Rows that autosave |
| A list of entities | [Resource list page](./resource-list-page.md) | A row per entity |
| An events × channels matrix | `Table` with `Switch` cells ([Entity table](./entity-table.md)) | A row per cell |
| Email or password change | A `Dialog` opened from the row | Editing the value in place |
| Deleting the account | Type-to-confirm `Dialog` ([Confirmation dialogs](./confirmation-dialogs.md)) | Deleting at once |

Pick the row kind by the control:

| Control | Row |
| --- | --- |
| `Input`, `Select`, `Switch` | Field row: `Field orientation='horizontal'` › `FieldLabel` + a `w-[320px] shrink-0` wrapper |
| `SegmentedControl` | Action row with `aria-label` on the control |
| `Button`, `Avatar` | Action row: `Text` + control |
| `RadioGroup variant='card'` | No row; the section `Heading` labels it through `aria-labelledby` |

## Rules

**Layout and spacing** (spacing counts in pixels, `gap-16` = 16px):

- Use `Page fullSize fixedHeight` › `PageHeader` › `PageContent`. **Never** add `PageActions`, `PageToolbar` or `PageDescription`.
- `PageHeader` › `PageHeaderGroup` › `PageTitle`. The trail is the Settings section's `RemoteShellBreadcrumb` ([Application layout](./app-layout.md)); **never** put `Breadcrumbs` in `PageHeader`.
- `PageContent` owns the 24px gutter. **Never** add padding around it.
- Put the sections in one `div className='flex max-w-[640px] flex-col gap-16'`. **Never** wrap it in a `Card` or padded box. **Never** give it `mx-auto`; it stays left-aligned.
- Section: `flex flex-col gap-16` › `Heading as='h2' size='xl' weight='medium' color='primary'` + a `flex flex-col` row list.
- Put `Separator spacing={16}` after every row, including a section's last row, except in the last section.
- **Never** add `gap-*` to the row list. The separators carry the rhythm.
- Wrap `Input` and `Select` in `w-[320px] shrink-0`. Leave compact controls unwrapped.
- Give action rows `flex min-h-36 items-center justify-between gap-16`. Use the default `Button` size (36px).
- Put card radios in `div className='grid grid-cols-3 gap-8'` inside the `RadioGroup`.
- **Never** pass `className` to `Field`, `FieldLabel`, `Heading`, `Text`, `RadioGroup` or `Radio`. Size them through a wrapper `div`.

**Controls:**

- Save text on blur and choices on change. **Never** save per keystroke or an unchanged value.
- Use `SelectInput` as the trigger. Over ~10 options, add `SelectHeader` › `SelectSearchInput` with `useSelectSearch`.
- Use `SegmentedControl` for 2–4 short options. Its `onChange` gets `(value: string)`.
- Use `RadioGroup variant='card'` only when options carry a picture or description (theme).
- Use `Button variant='outline' color='neutral'` for a row action that opens a dialog ("Change password").
- Make the avatar the upload trigger: `FileUploadTrigger asChild` › `Avatar as='button'` with `AvatarOverlay`.
- If a value needs confirming (email, password), open a 560 `Dialog` that asks for the current password. **Never** edit it in the row.
- If two values only make sense together, put them in one dialog. **Never** autosave half a pair.
- Put the danger zone last: text (`max-w-[320px]`) left, `Button color='destructive'` right.

**Copy:**

- Page title = rail item ("Profile"); breadcrumbs "Settings › Profile". Section titles are one noun ("Preferences"). Labels are sentence case, no colon.
- Write the toast as "<Label> updated" with `type: 'success'`, one per saved value. This overrides `'default'` from [Feedback toasts](./feedback-toasts.md).

There is no `SettingsPage`, `SettingsSection` or `SettingsRow`, no `className` on `Field`, no `label` on `Separator`, no `loading` on `Switch` or `Input`, no `'system'` theme value, and no theme preview tile.

## Examples

The page frame: a title in the header, sections straight in `PageContent`.

```story
Default
```

A field row saves on blur and shows an inline error; a failed save keeps the typed value.

```story
InvalidValue
```

An action row labels with `Text` and `aria-label`, not `FieldLabel`.

```story
ActionRow
```

An org-locked value puts the tooltip on `Lock`; a disabled `Switch` never opens one.

```story
LockedValue
```

A read-only email opens its dialog on click or Enter.

```story
ReadOnlyValue
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Saved | Success toast "<Label> updated" | `useToast().create({ type: 'success' })` |
| Save failed | Error toast; keep the typed value | `useToast().create({ type: 'error' })` |
| Invalid value | Message inside the 320 wrapper; no save, no toast | `Input error` + `FieldError` |
| Saving a select | Disabled until the request ends | `Select disabled` |
| Saving a button action | Loading button; never disable the page | `Button loading` |
| Saving a switch | Disabled until the request ends | `Switch disabled` |
| Locked by the org | Disabled control + `Lock` tooltip; keep the row | `Tooltip` › `TooltipTrigger` |
| Opens a dialog | Read-only value | `Input readOnly` |

Pass `error` to `Input`; `Field invalid` alone does not mark it.

While a value saves, only its own control changes.

```story
Saving
```

## What your app owns

| Concern | Recipe |
| --- | --- |
| Saving, validation, toasts | Call your API, then `useToast().create(...)` |
| Email and password dialogs | `Dialog` from `@wallarm-org/design-system/Dialog`; `PasswordInput` with `PasswordComplexity` and `passwordValidators` for the new password. See [Create and edit forms](./create-edit-forms.md) |
| Avatar crop | `Dialog` with `ImageCropper` and `Slider`; `FileUpload` only holds the file |
| "System" theme | `useTheme().setTheme` takes `'light'` or `'dark'`. Store `'system'` yourself and resolve it with `matchMedia('(prefers-color-scheme: dark)')` |
| Theme previews | Pass your own image in `RadioDescription` |
| Sidebar style | `useTheme().frameStyle` / `setFrameStyle('neutral' \| 'branded')` |
| Sidebar mode | Store it yourself; pass `mode` (`'expanded'`, `'collapsed'`, `'compact'`) to `NavRail`. "Adaptive" is your logic |
| Date and time formats | Option labels built from the current date |
| Org locks | Which values are locked |
| Delete account | Type-to-confirm `Dialog`, then sign the user out |

## Related

- [Application layout](./app-layout.md)
- [Spacing](../foundations/spacing.md)
- [Typography](../foundations/typography.md)
- [Resource list page](./resource-list-page.md)
- [Create and edit forms](./create-edit-forms.md)
- [Confirmation dialogs](./confirmation-dialogs.md)
- [Feedback toasts](./feedback-toasts.md)
- [Entity table](./entity-table.md)
