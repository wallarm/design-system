---
title: Settings page
description: Use when building a page of independent settings (profile, preferences, appearance) where each value saves on its own and a toast confirms it.
components: [Page, Breadcrumbs, Heading, Text, Field, Input, Select, SegmentedControl, Radio, Switch, Button, Avatar, FileUpload, Separator, Tooltip, Toast, Dialog, PasswordInput, PasswordComplexity, ThemeProvider, ImageCropper, Slider, NavRail]
keywords: [settings, settings page, profile, preferences, account settings, user settings, appearance, theme picker, label value row, settings row, settings section, autosave, save on blur, danger zone, delete account, change password, change email, timezone, date format, time format, sidebar style, form page]
order: 70
---

# Settings page

A settings page is `Page` with a title and a 640px column of sections. Each row saves its own value.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Many independent values of one account or org | This pattern | One big form with a Save button |
| Values that must be saved together (a provider config) | [Create and edit forms](./create-edit-forms.md) in a `Drawer` | Rows that autosave one by one |
| A list of entities (users, channels) | [Resource list page](./resource-list-page.md) | Settings rows, one per entity |
| A matrix of events × channels with on/off cells | `Table` with `Switch` cells, see [Entity table](./entity-table.md) | Settings rows, one per cell |
| Email or password change | A 560 `Dialog` opened from the row | Editing the value in place |
| Deleting the account | A type-to-confirm `Dialog`, see [Confirmation dialogs](./confirmation-dialogs.md) | A button that deletes at once |

- If a value needs a password or a second value to confirm it, open a `Dialog`. **Never** edit it in the row.
- If two values only make sense together, put them in one dialog. **Never** autosave half a pair.

## Anatomy

| # | Part | Component | Import |
| --- | --- | --- | --- |
| 1 | Page frame | `Page` with `fullSize` and `fixedHeight` | `@wallarm-org/design-system` |
| 2 | Header | `PageHeader` with `Breadcrumbs` and `PageHeaderGroup` › `PageTitle` | `@wallarm-org/design-system` |
| 3 | Scrolling body | `PageContent` | `@wallarm-org/design-system` |
| 4 | Column | `div className='flex max-w-[640px] flex-col gap-16'` | Plain markup |
| 5 | Section | `section className='flex flex-col gap-16'` | Plain markup |
| 6 | Section title | `Heading as='h2' size='xl' weight='medium' color='primary'` | `@wallarm-org/design-system` |
| 7 | Row list | `div className='flex flex-col'` holding rows and separators | Plain markup |
| 8 | Field row | `Field orientation='horizontal'` › `FieldLabel` + a `w-[320px]` control wrapper | `@wallarm-org/design-system` |
| 9 | Action row | `div className='flex min-h-36 items-center justify-between gap-16'` › `Text` + control | `@wallarm-org/design-system` |
| 10 | Row divider | `Separator spacing={16}` after every row | `@wallarm-org/design-system` |
| 11 | Card choice | `RadioGroup variant='card'` with `Radio` items in a 3-column grid | `@wallarm-org/design-system` |
| 12 | Danger zone | Last section; title and description on the left, `Button color='destructive'` on the right | `@wallarm-org/design-system` |
| 13 | Save result | `useToast().create(...)` | `@wallarm-org/design-system/Toast` |

The page has no `PageActions`, no `PageToolbar` and no `PageDescription`. There is no Save button.

Pick the row kind by the control:

| Control | Row kind | Why |
| --- | --- | --- |
| `Input`, `Select`, `Switch` | Field row | They read the `Field` context, so `FieldLabel` labels them |
| `SegmentedControl` | Action row, `aria-label` on the control | It does not read the `Field` context |
| `Button`, `Avatar` | Action row | They are not form controls. A `<label>` would point at nothing |
| `RadioGroup variant='card'` | No row; the section title labels it | Pass `aria-labelledby` with the `Heading` id |

## Layout and spacing

Spacing utilities count in pixels: `gap-16` is 16px. See [Spacing](../foundations/spacing.md).

### Figma frame

| Element | Figma | Code |
| --- | --- | --- |
| Breadcrumbs, title | Same as the list page | `PageHeader className='flex-wrap gap-y-6'`, `Breadcrumbs className='basis-full -ml-4'` |
| Title to first section | About 12 | `PageHeader` `pb-6` + `PageContent` `pt-6`, automatic |
| Column | 640 wide, no card, left-aligned | `max-w-[640px]` on the column `div` |
| Section title | 20 / 28, medium | `Heading size='xl' weight='medium'` (`text-xl`, line height 28px) |
| Section title to first row | 16 | `gap-16` on the `section` |
| Row | 36 high | `Input`, `SelectInput`, `SegmentedControl` and `Button` are all 36 high by default. Action rows add `min-h-36` |
| Label column | 320 | `FieldLabel` grows (`flex-auto` in a horizontal `Field`) |
| Control column | 320 | `div className='w-[320px] shrink-0'` around `Input` or `Select` |
| Compact control | Content width, right-aligned | No wrapper. The growing label pushes it right |
| Row divider | 1px, 16 on each side | `Separator spacing={16}` (`my-16`) |
| Last divider to next section title | 32 | `Separator` `mb-16` + column `gap-16` |
| Card grid | 3 × 208, gap 8 | `div className='grid grid-cols-3 gap-8'` inside `RadioGroup` |
| Card padding | 12 / 12 / 16 | Built into `RadioGroup variant='card'` (`py-12 pl-12 pr-16`) |
| Danger zone description | Wraps at about 320 | `div className='flex max-w-[320px] flex-col'` |

### Built-in spacing

| Component | Classes | Notes |
| --- | --- | --- |
| `Field` with `orientation='horizontal'` | `flex flex-row items-center gap-4 w-full` | The direct `FieldLabel` child gets `flex-auto` |
| `FieldLabel` | `w-fit text-sm font-medium leading-snug text-text-primary` | Same size, weight and color as `Text size='sm' weight='medium' color='primary'` |
| `Separator` | `h-[1px] w-full bg-border-primary`; `spacing={16}` adds `my-16` | No padding of its own |
| `Heading` | Defaults `size='xl'`, `weight='bold'`, `color='inherit'` | Pass `weight='medium'` and `color='primary'` |
| `RadioGroup` | `flex flex-col gap-8` | Wrap the items in your own grid for columns |
| `PageContent` | `px-24 pt-8 pb-24`, `pt-6` after `PageHeader` | The column aligns to the 24px gutter |

- Put a `Separator spacing={16}` after every row, including the last row of a section.
- If the section is the last one, put no `Separator` after its last row.
- **Never** add `gap-*` to the row list. The separators carry the 16 + 1 + 16 rhythm.
- **Never** pass `className` to `Field`, `FieldLabel`, `Heading`, `Text`, `RadioGroup` or `Radio`. Their types omit it or the component overrides it. Size them through a wrapper `div`.
- **Never** wrap the column in a `Card` or a padded box. Figma draws no surface.
- **Never** give the column `mx-auto`. It is left-aligned to the gutter.

## States

| State | Do | Not |
| --- | --- | --- |
| Text value edited | Save on blur if the value changed, then fire the toast | A Save button per row; saving on every keystroke |
| Choice changed (`Select`, `SegmentedControl`, `RadioGroup`, `Switch`) | Save on change, then fire the toast | Waiting for blur |
| Saved | `toast.create({ title: 'Name updated', type: 'success' })` | `Alert` in the row; a toast for an unchanged value |
| Save failed | `toast.create({ title: 'Name update failed', type: 'error' })`; keep the typed value | Reverting the input silently |
| Invalid value | `Input error` + `FieldError` under the input, inside the 320 wrapper; do not save | A toast; a red label |
| Saving a `Select` | `Select loading` | A `Loader` beside the row |
| Saving a `Button` action | `Button loading` | Disabling the whole page |
| Saving a `Switch` | `disabled` on `Switch` until the request ends | A toast before the request ends |
| Locked by the organization | `disabled` on the control + `Lock` icon in a `TooltipTrigger`, `TooltipContent` "Enabled by your organization" | A tooltip on the disabled control; hiding the row |
| Read-only value that opens a dialog (email) | `Input readOnly` with `onClick` and Enter in `onKeyDown` opening the dialog | Editing the email in place |

- If the row shows an error, the row grows. The label stays centred on the control block.
- Pass `error` to `Input` to show the red border. `Input` sets `aria-invalid` from `error` only, so `Field invalid` does not style it.
- `Switch` has no `loading` prop. `Input` has no `loading` prop. `Select` and `Button` do.
- A disabled `Switch` has `pointer-events-none`, so a tooltip on it never opens. Put the tooltip on the `Lock` icon.

## Rules

- Title the page with the 2nd-rail item: "Profile". Start the breadcrumbs at the section: "Settings › Profile".
- Title each section with one noun: "About", "Preferences", "Appearance", "Danger zone".
- Write labels in sentence case with no colon: "Time zone", not "Time Zone:".
- Write the toast as "<Label> updated": "Name updated", "Time zone updated".
- Use `type: 'success'` for save toasts. The Profile Figma shows the green check on every one. This overrides `'default'` from [Feedback toasts](./feedback-toasts.md), which covers button-driven mutations.
- Fire one toast per saved value. **Never** fire a toast when the value did not change.
- Use `SelectInput` as the trigger for a settings select. It looks like a field. `SelectButton` looks like a button.
- If the list has more than about ten options (time zones), add `SelectHeader` › `SelectSearchInput` with `useSelectSearch`.
- Use `SegmentedControl` for 2 to 4 short options. Its `onChange` gets `(value: string)`.
- Use `RadioGroup variant='card'` only when each option carries a picture or a description (theme).
- Use `Button variant='outline' color='neutral'` for a row action that opens a dialog ("Change password").
- Use `Button color='destructive'` for the danger zone action. It keeps `variant='primary'`, the default.
- Use the default `Button` size (`large`, 36 high) in rows. It matches the 36 row.
- Make the avatar the upload trigger: `FileUploadTrigger asChild` › `Avatar as='button'` with `AvatarOverlay`.
- Edit email and password only in a `Dialog` at the default width (560). Use `PasswordInput` and `PasswordComplexity` for a new password.
- Ask for the current password in the email and password dialogs.
- Put the danger zone last. Confirm it with type-to-confirm (variant C in [Confirmation dialogs](./confirmation-dialogs.md)).

There is no `SettingsSection`, `SettingsRow` or `SettingsPage` component. There is no `className` on `Field`. There is no `label` prop on `Separator`. There is no `loading` prop on `Switch`. There is no `'system'` value in the DS `Theme` type; it is `'light' | 'dark'`. There is no theme preview tile component.

## Example

```tsx
import { type KeyboardEvent, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarOverlay,
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  createListCollection,
  Field,
  FieldError,
  FieldLabel,
  FileUpload,
  FileUploadTrigger,
  type FrameStyle,
  Heading,
  Input,
  Page,
  PageContent,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
  Radio,
  RadioDescription,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectContent,
  SelectEmptyState,
  SelectHeader,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
  SelectSearchInput,
  Separator,
  Text,
  useSelectSearch,
  useTheme,
} from '@wallarm-org/design-system';
import { RefreshCcw } from '@wallarm-org/design-system/icons';
import { useToast } from '@wallarm-org/design-system/Toast';

type Appearance = 'light' | 'dark' | 'system';

interface Profile {
  name: string;
  email: string;
  avatarUrl?: string;
  timezone: string;
  appearance: Appearance;
}

interface ProfilePageProps {
  profile: Profile;
  timezones: { value: string; label: string }[];
  appearancePreviews: Record<Appearance, string>;
  onSave: (patch: Partial<Profile>) => Promise<void>;
  onEditEmail: () => void;
  onChangePassword: () => void;
  onAvatarPick: (files: File[]) => void;
  onDeleteAccount: () => void;
}

export const ProfilePage = ({
  profile,
  timezones,
  appearancePreviews,
  onSave,
  onEditEmail,
  onChangePassword,
  onAvatarPick,
  onDeleteAccount,
}: ProfilePageProps) => {
  const toast = useToast();
  const { frameStyle, setFrameStyle } = useTheme();
  const [name, setName] = useState(profile.name);
  const [nameError, setNameError] = useState<string | null>(null);

  const collection = createListCollection({ items: timezones });
  const { searchValue, onSearchChange, filteredCollection } = useSelectSearch(collection);

  const save = async (patch: Partial<Profile>, label: string) => {
    try {
      await onSave(patch);
      toast.create({ title: `${label} updated`, type: 'success' });
    } catch {
      toast.create({ title: `${label} update failed`, type: 'error' });
    }
  };

  const handleNameBlur = () => {
    const value = name.trim();
    if (!value.includes(' ')) {
      setNameError('Enter your first and last name.');
      return;
    }
    setNameError(null);
    if (value === profile.name) return;
    void save({ name: value }, 'Name');
  };

  const handleEmailKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onEditEmail();
  };

  const handleTimezoneChange = ({ value }: { value: string[] }) => {
    const [timezone] = value;
    if (timezone) void save({ timezone }, 'Time zone');
  };

  const handleAppearanceChange = ({ value }: { value: string | null }) => {
    if (value) void save({ appearance: value as Appearance }, 'Appearance');
  };

  const handleFrameStyleChange = (value: string) => {
    setFrameStyle(value as FrameStyle);
    toast.create({ title: 'Sidebar style updated', type: 'success' });
  };

  return (
    <Page name='settings-profile' fullSize fixedHeight>
      <PageHeader className='flex-wrap gap-y-6'>
        <Breadcrumbs className='basis-full -ml-4'>
          <BreadcrumbsItem href='/settings'>Settings</BreadcrumbsItem>
          <BreadcrumbsItem>Profile</BreadcrumbsItem>
        </Breadcrumbs>
        <PageHeaderGroup>
          <PageTitle>Profile</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <div className='flex max-w-[640px] flex-col gap-16'>
          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              About
            </Heading>
            <div className='flex flex-col'>
              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Avatar
                </Text>
                <FileUpload accept='image/*' onValueChange={onAvatarPick}>
                  <FileUploadTrigger asChild>
                    <Avatar as='button' aria-label='Change avatar'>
                      <AvatarImage src={profile.avatarUrl} />
                      <AvatarFallback name={profile.name} />
                      <AvatarOverlay />
                    </Avatar>
                  </FileUploadTrigger>
                </FileUpload>
              </div>
              <Separator spacing={16} />

              <Field orientation='horizontal'>
                <FieldLabel>Name</FieldLabel>
                <div className='flex w-[320px] shrink-0 flex-col gap-4'>
                  <Input
                    value={name}
                    error={nameError !== null}
                    onChange={event => setName(event.target.value)}
                    onBlur={handleNameBlur}
                  />
                  {nameError && <FieldError>{nameError}</FieldError>}
                </div>
              </Field>
              <Separator spacing={16} />

              <Field orientation='horizontal'>
                <FieldLabel>Email</FieldLabel>
                <div className='w-[320px] shrink-0'>
                  <Input
                    readOnly
                    value={profile.email}
                    onClick={onEditEmail}
                    onKeyDown={handleEmailKeyDown}
                  />
                </div>
              </Field>
              <Separator spacing={16} />

              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Password
                </Text>
                <Button variant='outline' color='neutral' onClick={onChangePassword}>
                  <RefreshCcw />
                  Change password
                </Button>
              </div>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              Preferences
            </Heading>
            <div className='flex flex-col'>
              <Field orientation='horizontal'>
                <FieldLabel>Time zone</FieldLabel>
                <div className='w-[320px] shrink-0'>
                  <Select
                    collection={collection}
                    value={[profile.timezone]}
                    onValueChange={handleTimezoneChange}
                  >
                    <SelectInput />
                    <SelectPositioner>
                      <SelectHeader>
                        <SelectSearchInput value={searchValue} onChange={onSearchChange} />
                      </SelectHeader>
                      <SelectContent>
                        {filteredCollection.size === 0 ? (
                          <SelectEmptyState description={`No results for "${searchValue}"`} />
                        ) : (
                          filteredCollection.items.map(item => (
                            <SelectOption key={item.value} item={item}>
                              <SelectOptionText>{item.label}</SelectOptionText>
                              <SelectOptionIndicator />
                            </SelectOption>
                          ))
                        )}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </div>
              </Field>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading id='appearance-heading' as='h2' size='xl' weight='medium' color='primary'>
              Appearance
            </Heading>
            <div className='flex flex-col'>
              <RadioGroup
                variant='card'
                aria-labelledby='appearance-heading'
                value={profile.appearance}
                onValueChange={handleAppearanceChange}
              >
                <div className='grid grid-cols-3 gap-8'>
                  {(['light', 'dark', 'system'] as const).map(value => (
                    <Radio key={value} value={value}>
                      <RadioIndicator />
                      <RadioLabel>{value.charAt(0).toUpperCase() + value.slice(1)}</RadioLabel>
                      <RadioDescription>
                        <img src={appearancePreviews[value]} alt='' className='h-76 w-full' />
                      </RadioDescription>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
              <Separator spacing={16} />

              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Sidebar style
                </Text>
                <SegmentedControl
                  aria-label='Sidebar style'
                  value={frameStyle}
                  onChange={handleFrameStyleChange}
                >
                  <SegmentedControlItem value='neutral'>Neutral</SegmentedControlItem>
                  <SegmentedControlItem value='branded'>Branded</SegmentedControlItem>
                </SegmentedControl>
              </div>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              Danger zone
            </Heading>
            <div className='flex items-center justify-between gap-16'>
              <div className='flex max-w-[320px] flex-col'>
                <Text size='sm' weight='medium' color='primary'>
                  Delete your profile
                </Text>
                <Text size='sm' color='secondary'>
                  Deleting your account removes your access to Acme.
                </Text>
              </div>
              <Button color='destructive' onClick={onDeleteAccount}>
                Delete account
              </Button>
            </div>
          </section>
        </div>
      </PageContent>
    </Page>
  );
};
```

## What your app owns

| Concern | Owner | Recipe with the current API |
| --- | --- | --- |
| Settings section and row blocks | App | No `SettingsSection` or `SettingsRow` exists. Build rows from `Field orientation='horizontal'` plus a `w-[320px]` wrapper, as in the example |
| Breadcrumbs placement | App | No slot exists. Put `Breadcrumbs className='basis-full -ml-4'` first in `PageHeader className='flex-wrap gap-y-6'` |
| Saving and the toast | App | Call your API on blur or change, then `useToast().create(...)`. The DS does not wrap promises |
| Validation | App | Validate before saving. Show `Input error` and `FieldError`; skip the save |
| Email and password dialogs | App | `Dialog` from `@wallarm-org/design-system/Dialog`, default width 560. Body: `Field` rows with `Input` or `PasswordInput`; `PasswordComplexity` with `passwordValidators` under the new password. See [Create and edit forms](./create-edit-forms.md) |
| Avatar crop | App | `FileUpload` only holds the picked file. Open a `Dialog` with `ImageCropper` and `Slider`, then upload |
| Theme with a "System" option | App | `useTheme().setTheme` takes `'light'` or `'dark'` only. Store `'system'` yourself and resolve it with `matchMedia('(prefers-color-scheme: dark)')` |
| Theme preview pictures | App | No preview tile exists. Pass your own image in `RadioDescription`. It indents by the indicator (24); Figma draws it full card width |
| Sidebar style | DS + app | `useTheme().frameStyle` / `setFrameStyle('neutral' \| 'branded')` stores it |
| Sidebar mode | Host shell | Store the choice yourself. Pass `mode` (`'expanded'`, `'collapsed'`, `'compact'`) to `NavRail`. "Adaptive" is your own logic |
| Date and time formats | App | Build the option labels from the current date. No format list exists in the DS |
| Org lock | App | Know which values are locked. Render `disabled` plus the `Lock` tooltip |
| Delete account | App | Type-to-confirm `Dialog`, then sign the user out |

## Related

- [Spacing](../foundations/spacing.md)
- [Typography](../foundations/typography.md)
- [Resource list page](./resource-list-page.md)
- [Create and edit forms](./create-edit-forms.md)
- [Confirmation dialogs](./confirmation-dialogs.md)
- [Feedback toasts](./feedback-toasts.md)
- [Entity table](./entity-table.md)
