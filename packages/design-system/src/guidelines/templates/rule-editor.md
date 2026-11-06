---
title: Rule editor
description: Use when building a create or edit flow for a custom security rule, with scope, a condition written as code, an action and a review step.
components: [Page, PageHeader, PageToolbar, PageContent, Table, SearchInput, Drawer, Stepper, Field, Input, Select, Checkbox, CheckboxGroup, HttpMethod, CodeEditorRoot, CodeEditorContent, CodeSnippetRoot, InlineCodeSnippet, RadioGroup, Radio, Attribute, Badge, Alert, Button, Toaster]
keywords: [rule, custom rule, security rule, policy, wizard, stepper, multi-step, condition, code editor, yaml, scope, host, path, methods, block, monitor, review, create rule]
order: 50
---

# Rule editor

A custom rules page whose "Create rule" button opens a create drawer: four steps take the user from where the rule applies to what it does, with a review before anything is saved.

## What it shows

- A [Resource list page](../patterns/resource-list-page.md) behind the drawer, with `HttpMethod`, `InlineCodeSnippet` and `Badge` cells.
- A four-step `Stepper` drawer from [Create and edit forms](../patterns/create-edit-forms.md).
- Scope: `Input`, a `Select` for the host and a `CheckboxGroup` of methods.
- Condition: a `CodeEditor` with YAML highlighting, shown again as a read-only `CodeSnippet` on review.
- Action: `RadioGroup variant='card'` for block or monitor.
- Review: `Attribute` rows and a section as in the [Detail drawer](../patterns/detail-drawer.md).
- Errors after a submit attempt and a toast after create, from [Feedback toasts](../patterns/feedback-toasts.md).

## Examples

The rules list. Press "Create rule" to open the drawer and walk Scope, Condition, Action and Review; press "Create rule" on Review with gaps to see the drawer jump back to the first invalid step.

```story
Default
```

The rules request still in flight: skeleton rows, with "Create rule" still available.

```story
Loading
```

## Related

- [Create and edit forms](../patterns/create-edit-forms.md)
- [Resource list page](../patterns/resource-list-page.md)
- [Detail drawer](../patterns/detail-drawer.md)
- [Confirmation dialogs](../patterns/confirmation-dialogs.md): guard a dirty drawer on close.
- [Feedback toasts](../patterns/feedback-toasts.md)
