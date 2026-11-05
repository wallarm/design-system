---
title: Create and edit forms
description: Use when building a form that creates or edits an entity, and you must choose between a Dialog, a Drawer with Timeline sections, or a Drawer with a Stepper.
components: [Dialog, Drawer, Field, Input, Textarea, SelectInput, RadioGroup, Timeline, Stepper, Button, VStack, Tooltip, Alert, Table, InlineEdit, Attribute, Toaster]
keywords: [form, create, edit, new, add, wizard, steps, stepper, multi-step, sections, timeline, drawer form, modal form, dialog form, field, label, required, optional, validation, error, submit, cancel, unsaved changes]
order: 60
---

# Create and edit forms

A create or edit form lives in a `Dialog` or a `Drawer`. The size of the form picks the container.

## When to use

| Need | Use | Not |
| --- | --- | --- |
| Up to 6 fields about one concern (create user, rename group) | `Dialog` with no `width` (560) | A `Drawer` for three inputs |
| Several dependent sections that all stay visible (create provider, channel, permission) | `Drawer width={700}` + `Timeline` with numbered sections | A `Stepper` that hides sections the user must compare |
| A gated multi-part entity where each part needs the previous one (create policy) | `Drawer` with no `width` (640) + `Stepper` | One long `Timeline` with 20 fields |
| Pick many rows from a list ("Add users to group") | `Dialog width={960}` with a selectable `Table` | A form with a multi-select of 200 users |
| Edit one value in place on a detail view | `InlineEdit` on the `Attribute` | A drawer that opens for one field |
| A settings page with many independent values | A settings page, see [Settings page](settings-page.md) | A drawer opened from the page |
| A yes/no question before an action | A confirmation dialog, see [Confirmation dialogs](confirmation-dialogs.md) | A form dialog with no fields |

- If the form has 6 fields or fewer and no sections, use a `Dialog`.
- If later fields depend on earlier ones and the user must see all of them, use a `Drawer` with a `Timeline`.
- If each part is long and must be valid before the next one makes sense, use a `Drawer` with a `Stepper`.
- If you edit an existing entity, use the same container as its create form.

There is no `Form`, `FormDialog`, `FormDrawer` or `Wizard` component. Compose the parts as shown in the Example section.

## Anatomy

### Dialog form

| Part | Component | Content |
| --- | --- | --- |
| Root | `Dialog` | `open`, `onOpenChange`; omit `width` for 560 |
| Surface | `DialogContent` | Portal, overlay and panel |
| Header | `DialogHeader` | `DialogTitle` + `DialogDescription`. Adds the close X by itself |
| Form element | `<form className='flex min-h-0 flex-1 flex-col'>` | Wraps body and footer so Enter submits |
| Title | `DialogTitle` | Verb + entity: "Create user" |
| Description | `DialogDescription` | What happens after submit: "We send an invitation link to this email." |
| Body | `DialogBody` | `<VStack gap={24}>` of `Field`s |
| Footer | `DialogFooter` | `DialogClose asChild` ghost Cancel, then the submit `Button` |

### Drawer form with Timeline sections

| Part | Component | Content |
| --- | --- | --- |
| Root | `Drawer` | `width={700}`, controlled `open`, `onOpenChange` |
| Surface | `DrawerContent` | Portal, overlay and panel |
| Header | `DrawerHeader` | `DrawerTitle`. Adds the close X by itself |
| Form element | `<form className='flex min-h-0 flex-1 flex-col'>` | Wraps body and footer |
| Body | `DrawerBody` | One `Timeline` |
| Section | `TimelineItem` | `TimelineConnector` (`TimelineIndicator` + `TimelineSeparator`) and `TimelineContent` |
| Section number | `TimelineIndicator` | `1`, `2`, `3` |
| Section title | `TimelineTitle` | Noun phrase: "Identity provider", "Configure GitHub" |
| Section fields | `<VStack gap={12}>` inside `TimelineContent` | `Field`s |
| Footer | `DrawerFooter` | `DrawerClose asChild` ghost Cancel, then the submit `Button` |

### Drawer form with a Stepper

| Part | Component | Content |
| --- | --- | --- |
| Root | `Drawer` | No `width` (640) |
| Header | `DrawerHeader` | `DrawerTitle` |
| Form element | `<form className='flex min-h-0 flex-1 flex-col'>` | Wraps the whole `Stepper` |
| Stepper root | `Stepper` | `count`, `step`, `onStepChange`, `className='flex min-h-0 flex-1 flex-col'` |
| Step bar | `StepperList` | `aria-label`; one `StepperItem` per step |
| Step | `StepperItem index={i} status={…}` | `StepperTrigger` (`StepperIndicator` + `StepperTitle`) and `StepperSeparator` |
| Step body | `StepperContent index={i}` inside `DrawerBody` | That step's `Field`s |
| Footer, left | `DrawerFooterControls placement='left'` | Ghost Cancel |
| Footer, right | `DrawerFooterControls placement='right'` | `StepperPrevTrigger asChild` Back, then `StepperNextTrigger asChild` Next; the last step shows the submit `Button` instead |

`Stepper` is a descendant-only context. Put `StepperPrevTrigger` and `StepperNextTrigger` inside `Stepper`, so the `Stepper` must wrap `DrawerBody` and `DrawerFooter`.

### Field

| Part | Component | Content |
| --- | --- | --- |
| Root | `Field` | `required` when the value is mandatory |
| Label | `FieldLabel` | Label text, then `FieldIndicator` |
| Required marker | `FieldIndicator` | Renders `*` when `Field` is `required`, `(Optional)` when it is not |
| Helper | `FieldDescription` | One line about the consequence of the value |
| Control | `Input`, `Textarea`, `SelectInput`, `RadioGroup` | Pass `error` when the value is invalid |
| Error | `FieldError` | Render only while the value is invalid |

Order the parts as `FieldLabel`, `FieldDescription`, control, `FieldError`. Figma puts the helper under the label, before the control.

## Layout and spacing

The containers own their padding. Put fields straight into the body.

| Element | Value | Source |
| --- | --- | --- |
| Dialog width | 560 (default); 400 and 960 are the other presets | `Dialog` |
| Drawer width, Timeline form | 700 | Figma; not a preset, write `width={700}` |
| Drawer width, Stepper form | 640 (default) | `Drawer` |
| Width limits for both | 400 to 1130 | `Dialog`, `Drawer` |
| `DialogHeader` padding | `pt-20 pb-16 px-24` | Built in |
| `DrawerHeader` padding | `pt-16 pb-12 pl-24 pr-16` | Built in |
| Body padding | `px-24 pt-8`; `pb-24`, or `pb-8` when a footer exists | Built in |
| Footer padding | `px-24 py-16`, `gap-8` between buttons | Built in |
| `StepperList` padding | `px-24 pb-12` | Built in |
| Gap inside one `Field` | 4px between label, helper, control and error | Built in |
| `Input` height | 36 (`h-36`) | Built in, `size='default'` |
| Field gap in a dialog | `<VStack gap={24}>` | You add it |
| Field gap in a drawer section | `<VStack gap={12}>` | You add it |
| Gap between Timeline sections | 16px (`pb-16` on `TimelineContent`) | Built in |
| Step body inset | `className='py-16'` on `StepperContent` | You add it |
| Two short fields in one row | `<div className='grid grid-cols-2 gap-12'>` | You add it |

- If two related fields are short (name and ID, port and protocol), put them in a two-column grid.
- If a field holds a URL, a secret, a JSON pointer or free text, give it the full width.
- **Never** add `px-*`, `py-*` or `p-*` around the content of `DialogBody` or `DrawerBody`.
- **Never** pass `className` to `DrawerHeader`, `DrawerBody`, `DrawerFooter` or their `Dialog*` aliases. They accept only `children` and `ref`.
- **Never** pass `className` to `Field`. Its type omits it. Size the control or the grid cell instead.
- **Never** rely on `className` on `FieldGroup`, `FieldLabel` or `FieldDescription`. The component class overwrites it.
- If you use `FieldGroup`, its gap is fixed at 16px. Use `VStack` when you need 12 or 24.

There is no `size` prop on `Dialog` or `Drawer`; use `width`. `DIALOG_SIZES` and `DRAWER_SIZES` are not exported; write the number. There is no `gap` prop on `Field` or `TimelineContent`.

## States

| State | What the user sees | How |
| --- | --- | --- |
| Pristine | Submit enabled or disabled per the rule below; no errors | `Button disabled={!canSubmit}` |
| Invalid field | Red border and an error line under the control | `error` on the control + `<FieldError>` |
| Submitting | Spinner on the submit button; the button is disabled | `Button loading={pending}`. `loading` also disables it |
| Submit failed (server) | An error `Alert` at the top of the body; the form stays open | `<Alert color='destructive'>` |
| Test result ("Test connection") | An `Alert` in the section; never a toast | `<Alert color='success'>` or `color='destructive'` |
| Later section not ready | The section shows why: "Select a service first" | Disable its controls; render a one-line `FieldDescription` |
| Field fixed after create | The control is disabled in edit mode, with a tooltip | `disabled` on the control, wrapped in `TooltipTrigger asChild` with a `span` |
| Dirty close | The unsaved changes dialog | Variant D in [Confirmation dialogs](confirmation-dialogs.md) |
| Success | The container closes, then a toast | `useToast().create({ title: 'User created', type: 'success' })` |

- If a required field is empty, keep the submit button disabled. Show the `FieldError` only after the user leaves the field or submits.
- If the server rejects one field, attach the message to that field with `error` and `FieldError`.
- If the server rejects the whole request, show an `Alert color='destructive'` in the body. Keep every value.
- If a control is disabled, pass `disabled` to the control itself. `Field disabled` does not disable `Input` or `Textarea`.
- If a control is invalid, pass `error` to the control itself. `Input` and `Textarea` set `aria-invalid` from `error` only.

## Rules

### Copy

| Element | Write | Not |
| --- | --- | --- |
| Title, create | "Create identity provider" | "New", "Add new provider", "Provider" |
| Title, edit | "Edit identity provider" | "Identity provider settings" |
| Submit, create | Same verb + entity as the title: "Create identity provider" | "Submit", "OK", "Save", "Done" |
| Submit, edit | "Save changes" | "Update", "Apply" |
| Stepper Next | "Next" | "Continue →", "Proceed" |
| Stepper last step | The create verb: "Create policy" | "Finish", "Next" |
| Cancel | "Cancel" | "Close", "Discard" |
| Helper | The consequence: "Shown on the sign-in button." | A restatement of the label: "Enter the name." |
| Error | A sentence-case instruction: "Enter a client ID." | "Invalid", "Field is required!" |
| Optional marker | `FieldIndicator` | "(optional)" typed into the label |

### Buttons

- Put the submit button last, on the right. It uses `variant='primary'`, the default.
- Make Cancel `variant='ghost' color='neutral'`. Wrap it in `DialogClose asChild` or `DrawerClose asChild`.
- In a Stepper footer, put Cancel on the left. Put Back and Next on the right.
- Make Back `variant='outline' color='neutral'`. It is disabled on the first step by itself.
- On the last step, render the submit `Button type='submit'` instead of `StepperNextTrigger`. `StepperNextTrigger` is disabled on the last step.
- Omit `size` on footer buttons. The default `large` is the Figma 36.
- **Never** put the submit button in `DrawerHeader` or `DialogHeader`.
- **Never** add a second primary button to the footer.

### Fields

- Wrap every control in a `Field`. **Never** write a bare `<label>` next to an `Input`.
- Put `required` on `Field`, not only on the control. `FieldIndicator` reads it from `Field`.
- Add `FieldIndicator` to every label, even when every field is required.
- Write at most one helper line per field. If you need a paragraph, the field needs a redesign.
- Put the matching brand or provider icon in both the select option and the select trigger.

### Behavior

- Use a `<form>` with `onSubmit` and a submit button with `type='submit'`. Call `event.preventDefault()` in the handler.
- Keep the container open while the request runs. Close it only after success.
- If you edit, prefill every field from the entity. Disable the submit button until a value changes.
- If the user closes a dirty form, intercept `onOpenChange(false)` and open the unsaved changes dialog.
- If a `Stepper` step has errors, set `status='danger'` on its `StepperItem`. Set `status='completed'` on valid finished steps.
- Let the user move to any step. `Stepper` never blocks a step; the page owns validation.

There is no `linear`, `isStepValid` or `orientation` prop on `Stepper`. The design supports up to 6 steps. There is no vertical `Stepper`; numbered vertical sections are a `Timeline`, even where Figma names them "stepper".

## Example

### Dialog form

```tsx
import { type FormEvent, useState } from 'react';
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  VStack,
} from '@wallarm-org/design-system';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@wallarm-org/design-system/Dialog';
import { FieldIndicator } from '@wallarm-org/design-system/Field';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (user: { name: string; email: string }) => Promise<void>;
}

export const CreateUserDialog = ({ open, onOpenChange, onCreate }: CreateUserDialogProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [pending, setPending] = useState(false);

  const emailInvalid = emailTouched && !email.includes('@');
  const canSubmit = name.trim() !== '' && email.includes('@');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      await onCreate({ name, email });
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  const handleEmailBlur = () => setEmailTouched(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>We send an invitation link to this email.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <DialogBody>
            <VStack gap={24}>
              <Field required>
                <FieldLabel>
                  Full name
                  <FieldIndicator />
                </FieldLabel>
                <Input value={name} onChange={event => setName(event.target.value)} />
              </Field>
              <Field required>
                <FieldLabel>
                  Email
                  <FieldIndicator />
                </FieldLabel>
                <FieldDescription>The invitation link expires in 7 days.</FieldDescription>
                <Input
                  type='email'
                  value={email}
                  error={emailInvalid}
                  onChange={event => setEmail(event.target.value)}
                  onBlur={handleEmailBlur}
                />
                {emailInvalid && <FieldError>Enter an email address.</FieldError>}
              </Field>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='ghost' color='neutral'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' disabled={!canSubmit} loading={pending}>
              Create user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### Drawer form with Timeline sections

```tsx
import type { FormEvent } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
  VStack,
} from '@wallarm-org/design-system';
import { FieldIndicator } from '@wallarm-org/design-system/Field';

interface CreateProviderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  pending: boolean;
  onSubmit: () => void;
}

export const CreateProviderDrawer = ({
  open,
  onOpenChange,
  canSubmit,
  pending,
  onSubmit,
}: CreateProviderDrawerProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Drawer width={700} open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create provider</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <DrawerBody>
            <Timeline>
              <TimelineItem>
                <TimelineConnector>
                  <TimelineIndicator>1</TimelineIndicator>
                  <TimelineSeparator />
                </TimelineConnector>
                <TimelineContent>
                  <TimelineTitle>Identity provider</TimelineTitle>
                  <VStack gap={12}>
                    <Field required>
                      <FieldLabel>
                        Name
                        <FieldIndicator />
                      </FieldLabel>
                      <FieldDescription>Shown on the sign-in button.</FieldDescription>
                      <Input />
                    </Field>
                  </VStack>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineConnector>
                  <TimelineIndicator>2</TimelineIndicator>
                  <TimelineSeparator />
                </TimelineConnector>
                <TimelineContent>
                  <TimelineTitle>Configure GitHub</TimelineTitle>
                  <VStack gap={12}>
                    <Field required>
                      <FieldLabel>
                        Client ID
                        <FieldIndicator />
                      </FieldLabel>
                      <Input />
                    </Field>
                    <Field required>
                      <FieldLabel>
                        Client secret
                        <FieldIndicator />
                      </FieldLabel>
                      <FieldDescription>We store it encrypted and never show it again.</FieldDescription>
                      <Input type='password' />
                    </Field>
                  </VStack>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='ghost' color='neutral'>
                Cancel
              </Button>
            </DrawerClose>
            <Button type='submit' disabled={!canSubmit} loading={pending}>
              Create identity provider
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
```

To guard unsaved changes, wrap `onOpenChange` as in variant D of [Confirmation dialogs](confirmation-dialogs.md).

### Drawer form with a Stepper

```tsx
import type { FormEvent, ReactNode } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerFooterControls,
  DrawerHeader,
  DrawerTitle,
  Stepper,
  StepperContent,
  type StepperItemStatus,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNextTrigger,
  StepperPrevTrigger,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@wallarm-org/design-system';

const STEPS = ['Phase', 'Details', 'Configuration', 'Code'];

interface CreatePolicyDrawerProps {
  step: number;
  statuses: StepperItemStatus[];
  onStepChange: (step: number) => void;
  pending: boolean;
  onSubmit: () => void;
  renderStep: (index: number) => ReactNode;
}

export const CreatePolicyDrawer = ({
  step,
  statuses,
  onStepChange,
  pending,
  onSubmit,
  renderStep,
}: CreatePolicyDrawerProps) => {
  const last = step === STEPS.length - 1;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleStepChange = (details: { step: number }) => onStepChange(details.step);

  return (
    <Drawer>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create policy</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <Stepper
            count={STEPS.length}
            step={step}
            onStepChange={handleStepChange}
            className='flex min-h-0 flex-1 flex-col'
          >
            <StepperList aria-label='Create policy steps'>
              {STEPS.map((title, index) => (
                <StepperItem key={title} index={index} status={statuses[index]}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>{title}</StepperTitle>
                  </StepperTrigger>
                  <StepperSeparator />
                </StepperItem>
              ))}
            </StepperList>
            <DrawerBody>
              {STEPS.map((title, index) => (
                <StepperContent key={title} index={index} className='py-16'>
                  {renderStep(index)}
                </StepperContent>
              ))}
            </DrawerBody>
            <DrawerFooter>
              <DrawerFooterControls placement='left'>
                <DrawerClose asChild>
                  <Button variant='ghost' color='neutral'>
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooterControls>
              <DrawerFooterControls placement='right'>
                <StepperPrevTrigger asChild>
                  <Button variant='outline' color='neutral'>
                    Back
                  </Button>
                </StepperPrevTrigger>
                {last ? (
                  <Button type='submit' loading={pending}>
                    Create policy
                  </Button>
                ) : (
                  <StepperNextTrigger asChild>
                    <Button>Next</Button>
                  </StepperNextTrigger>
                )}
              </DrawerFooterControls>
            </DrawerFooter>
          </Stepper>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
```

`FieldIndicator` and the `Dialog*` parts import from subpaths. They are not exported from the package root.

## What your app owns

| Concern | Owned by | Recipe with the current API |
| --- | --- | --- |
| Form values, validation and dirty tracking | App | `useState` or your form library |
| Submit request, `pending` and server errors | App | `Button loading`; `Alert color='destructive'` or `FieldError` |
| When to show a field error | App | Track "touched" per field; render `FieldError` and `error` together |
| Keeping values when the container closes | App | Lift state out of the `Drawer`. `Drawer` and `Dialog` unmount their content on close |
| Unsaved changes guard | App | Controlled `open` + `onOpenChange`, variant D in [Confirmation dialogs](confirmation-dialogs.md) |
| Step statuses and which step is current | App | `Stepper step`, `onStepChange`, `StepperItem status` |
| Focus on the first invalid field after submit | App | A `ref` on the control and `ref.current.focus()` in the submit handler |
| Tooltip on a disabled control | App | Wrap the control in a `span`, use it as `TooltipTrigger asChild` |
| The success toast | App | `useToast` from `@wallarm-org/design-system/Toast`, one `Toaster` at the root |

Gaps in the design system today:

- Figma draws Timeline form drawers at 700 (some at 716). `Drawer` presets are 640, 960 and 1130. Write `width={700}`; it is inside the 400 to 1130 limits.
- Figma's Stepper footer puts Cancel left and Back + Next right. The `Stepper` `InDrawer` story puts Back on the left and has no Cancel. Follow Figma, as in the Example section.
- Figma's SSO form shows a live preview next to the Name input ("Continue with …"). There is no preview component. Build it from `Button` in a `grid grid-cols-2 gap-12` row.
- There is no form-level validation, schema or error summary component.
- `Field disabled` and `Field invalid` do not reach `Input` or `Textarea`. Pass `disabled` and `error` to the control.

## Related

- [Confirmation dialogs](confirmation-dialogs.md): the unsaved changes guard for a dirty form.
- [Feedback toasts](feedback-toasts.md): the toast shown after a successful submit.
- [Detail drawer](detail-drawer.md): the read-only drawer that opens the edit form.
- [Settings page](settings-page.md): forms that save per value on a page instead of in a container.
- [Spacing](../foundations/spacing.md): the built-in padding of the dialog and drawer parts.
- [Layering](../foundations/layering.md): how a `Dialog` nests inside a `Drawer`.
