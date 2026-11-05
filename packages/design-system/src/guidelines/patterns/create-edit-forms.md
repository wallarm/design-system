---
title: Create and edit forms
description: Use when building a form that creates or edits an entity, and you must choose between a Dialog, a Drawer with Timeline sections, or a Drawer with a Stepper.
components: [Dialog, Drawer, Field, Input, Textarea, Timeline, Stepper, Button, VStack, Tooltip, Alert, Table, InlineEdit, Attribute, Toaster]
keywords: [form, create, edit, new, add, wizard, steps, stepper, multi-step, sections, timeline, drawer form, modal form, dialog form, field, label, required, optional, validation, error, submit, cancel, unsaved changes]
order: 60
---

# Create and edit forms

Form size picks the container.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Up to 6 fields, one concern (create user) | `Dialog` with no `width` (560) | A `Drawer` for three inputs |
| Dependent sections seen together (create provider) | `Drawer width={700}` + `Timeline` with numbered sections | A `Stepper` hiding sections |
| Gated parts, each needs the previous (create policy) | `Drawer` with no `width` (640) + `Stepper` | One long `Timeline` with 20 fields |
| Pick many rows ("Add users to group") | `Dialog width={960}` with a selectable `Table` | A 200-item multi-select |
| Edit one value on a detail view | `InlineEdit` on the `Attribute` | A drawer for one field |
| Independent values saved one by one | [Settings page](settings-page.md) | A drawer opened from the page |
| A yes/no before an action | [Confirmation dialogs](confirmation-dialogs.md) | A form dialog with no fields |

- Edit uses the same container as create.
- There is no `Form`, `FormDialog`, `FormDrawer`, `Wizard`, vertical `Stepper` or form-level validation component.

## Rules

### Container and layout

- Wrap body and footer (or the whole `Stepper`) in `<form className='flex min-h-0 flex-1 flex-col'>` so Enter submits.
- Size with `width` (400 to 1130): `Dialog` 560 default, 400/960 presets; `Drawer` 640 default, `700` for Timeline forms. There is no `size` prop or exported size constant.
- Bodies own their padding. **Never** add `p-*`, `px-*` or `py-*` around their content.
- **Never** pass `className` to `DrawerHeader`, `DrawerBody`, `DrawerFooter`, their `Dialog*` aliases, or `Field`. Size the control or grid cell instead.
- **Never** add a close X; the header has one.
- Space fields with `<VStack gap={24}>` in a dialog and `<VStack gap={12}>` in a drawer section. Not `FieldGroup` (fixed 16px). There is no `gap` prop on `Field` or `TimelineContent`.
- **Never** style `FieldGroup`, `FieldLabel` or `FieldDescription` with `className`; it is ignored.
- Add `className='py-16'` to `StepperContent`.
- If two related fields are short (name and ID, port and protocol), put them in `grid grid-cols-2 gap-12`. URLs, secrets and free text get full width.
- Number `Timeline` sections in `TimelineIndicator`; title them with a noun phrase.
- `Stepper` wraps `DrawerBody` and `DrawerFooter`; its Prev/Next triggers work only inside it. Give it `className='flex min-h-0 flex-1 flex-col'`.
- Inside `Stepper`: `StepperList aria-label='…'` (one `StepperItem index status` per step), then `DrawerBody` holding one `StepperContent index` per step, then `DrawerFooter`.
- Max 6 `Stepper` steps. Vertical numbered sections are a `Timeline`, even if Figma says "stepper".

### Fields

- Wrap every control in `Field`; **never** a bare `<label>`.
- Order the parts: `FieldLabel` (with `FieldIndicator`), `FieldDescription`, control, `FieldError`.
- Put `required` on `Field` and `FieldIndicator` in every label (`*` or "(Optional)"). **Never** type "(optional)" yourself.
- Pass `error` and `disabled` to the control itself. `Field invalid` and `Field disabled` do not reach `Input` or `Textarea`.
- One helper line at most, stating the consequence.
- Show the provider icon in the select option and trigger.

### Buttons and copy

| Element | Write | Not |
| --- | --- | --- |
| Title | "Create identity provider" / "Edit identity provider" | "New", "Provider settings" |
| Submit | Title's verb + entity; edit: "Save changes" | "Submit", "OK", "Update" |
| Stepper | "Next"; last step: "Create policy" | "Continue →", "Finish" |
| Description | What happens after submit: "We send an invitation link to this email." | A restatement of the title |
| Cancel | "Cancel" | "Close", "Discard" |
| Error | "Enter a client ID." | "Invalid", "Field is required!" |

- Submit is the default primary `Button type='submit'`, last on the right. Cancel is `variant='ghost' color='neutral'` in `DialogClose`/`DrawerClose asChild`.
- Omit `size` on footer buttons.
- **Never** put submit in the header or add a second primary.
- Stepper footer: Cancel left; Back (`variant='outline' color='neutral'`) and Next right. Back disables itself on step 1; don't wire `disabled`.
- On the last step, render submit instead of `StepperNextTrigger` (disabled there).

### Behavior

- Call `event.preventDefault()`. Close only after success.
- Edit: prefill fields; disable submit until a change.
- Show `FieldError` only after blur or submit.
- `Stepper` never blocks steps. Set `status='danger'` on steps with errors, `'completed'` on valid ones. There is no `linear`, `isStepValid` or `orientation` prop.

## Examples

A dialog form with a 24px field stack.

```tsx
import { Button, Field, FieldLabel, Input, VStack } from '@wallarm-org/design-system';
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@wallarm-org/design-system/Dialog';
import { FieldIndicator } from '@wallarm-org/design-system/Field';

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create user</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
      <DialogBody>
        <VStack gap={24}>
          <Field required>
            <FieldLabel>Full name<FieldIndicator /></FieldLabel>
            <Input value={name} onChange={handleNameChange} />
          </Field>
        </VStack>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='ghost' color='neutral'>Cancel</Button>
        </DialogClose>
        <Button type='submit' disabled={!canSubmit} loading={pending}>Create user</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

An invalid field: `error` goes on the control, `FieldError` renders only while invalid.

```tsx
<Field required>
  <FieldLabel>Email<FieldIndicator /></FieldLabel>
  <FieldDescription>The invitation link expires in 7 days.</FieldDescription>
  <Input type='email' value={email} error={emailInvalid} onChange={handleEmailChange} onBlur={handleEmailBlur} />
  {emailInvalid && <FieldError>Enter an email address.</FieldError>}
</Field>
```

One numbered `Timeline` section inside a `Drawer width={700}` body.

```tsx
<Timeline>
  <TimelineItem>
    <TimelineConnector>
      <TimelineIndicator>1</TimelineIndicator>
      <TimelineSeparator />
    </TimelineConnector>
    <TimelineContent>
      <TimelineTitle>Configure GitHub</TimelineTitle>
      <VStack gap={12}>
        <Field required>
          <FieldLabel>Client ID<FieldIndicator /></FieldLabel>
          <Input />
        </Field>
      </VStack>
    </TimelineContent>
  </TimelineItem>
</Timeline>
```

A Stepper footer that swaps Next for submit on the last step.

```tsx
<DrawerFooter>
  <DrawerFooterControls placement='left'>
    <DrawerClose asChild>
      <Button variant='ghost' color='neutral'>Cancel</Button>
    </DrawerClose>
  </DrawerFooterControls>
  <DrawerFooterControls placement='right'>
    <StepperPrevTrigger asChild>
      <Button variant='outline' color='neutral'>Back</Button>
    </StepperPrevTrigger>
    {last ? (
      <Button type='submit' loading={pending}>Create policy</Button>
    ) : (
      <StepperNextTrigger asChild>
        <Button>Next</Button>
      </StepperNextTrigger>
    )}
  </DrawerFooterControls>
</DrawerFooter>
```

A field fixed after create, explained by a tooltip on a wrapping `span`.

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <span>
      <Input value={slug} disabled />
    </span>
  </TooltipTrigger>
  <TooltipContent>The ID can't change after the provider is created.</TooltipContent>
</Tooltip>
```

## States

| State | Show | Example component |
| --- | --- | --- |
| Pristine | Submit disabled until required filled | `Button disabled={!canSubmit}` |
| Invalid field | Red border and an error line | `error` on the control + `FieldError` |
| Submitting | Spinner on submit | `Button loading={pending}` (also disables) |
| Server rejects one field | Message on that field | `error` + `FieldError` |
| Server rejects the request | Error atop the body; values kept | `Alert color='destructive'` |
| "Test connection" result | In the section, never a toast | `Alert color='success'` / `'destructive'` |
| Later section not ready | Disabled, with why: "Select a service first" | `FieldDescription` |
| Field fixed after create | Disabled, with a tooltip | `TooltipTrigger asChild` on a `span` |
| Dirty close | Unsaved-changes dialog | Variant D in [Confirmation dialogs](confirmation-dialogs.md) |
| Success | Close, then a toast | `useToast().create({ title: 'User created', type: 'success' })` |

## What your app owns

- Values, validation, touched/dirty state, the request and server errors.
- Values across close: containers unmount content, so lift state out.
- The unsaved-changes guard: intercept `onOpenChange(false)`.
- Current step and statuses (`step`, `onStepChange`, `status`).
- Focusing the first invalid field after submit.
- The toast: `useToast` from `@wallarm-org/design-system/Toast`, one `Toaster` at the root.
- A live preview (SSO "Continue with …"): build it from `Button` in a `grid grid-cols-2 gap-12` row.

`FieldIndicator`, `Dialog*` and `useToast` import from subpaths. Where the `Stepper` story differs, follow this page.

## Related

- [Confirmation dialogs](confirmation-dialogs.md): unsaved-changes guard.
- [Feedback toasts](feedback-toasts.md): success toast.
- [Detail drawer](detail-drawer.md): opens the edit form.
- [Settings page](settings-page.md)
- [Spacing](../foundations/spacing.md)
- [Layering](../foundations/layering.md): a `Dialog` inside a `Drawer`.
