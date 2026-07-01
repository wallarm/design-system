# Alert

> Persistent, inline message that communicates status, warnings, errors, or informational context within a section — without interrupting the workflow.

## Category
messaging

## When NOT to Use
- Page title or heading with description → use Heading + Text
- Transient feedback after an action (success, saved, deleted) → use Toast
- Blocking confirmation that requires a decision → use Dialog
- Major system-wide failure or outage → use Banner or Dialog
- Inline field validation error below an input → use Field error text
- Floating notification unrelated to current content → use Toast
- Auto-dismissing message with a timer → use Toast. Alert has no auto-dismiss capability — it is always persistent.

## When to Use
- Persistent in-context message within a section, form, or dialog
- Warning about irreversible consequences before an action (e.g., "You won't be able to edit this after creation")
- Informational context about an object's state (e.g., "This attack was marked as false positive by @user")
- Emphasis inside confirmation/delete dialogs to highlight critical information
- Configuration messages, long-running process notes, or important hints that must stay visible

## Anatomy

Alert is a compound component. The parts and their roles:

| Sub-component | Required | Role |
|---------------|----------|------|
| **AlertIcon** | Recommended | Displays a semantic icon matching the color variant. Auto-selects the correct icon — do not override. |
| **AlertContent** | Required | Container for title, description, and bottom actions. Provides spacing and flex layout. |
| **AlertTitle** | Required | Main message text. Supports `lineClamp` with overflow tooltip. |
| **AlertDescription** | Optional | Secondary explanatory text. Supports `lineClamp` with overflow tooltip. |
| **AlertControls** | Optional | Container for action buttons. Placement determines layout (see Composition Patterns). |
| **AlertClose** | Optional (rare) | Dismissal button with X icon and "Close" tooltip. Most alerts should not be dismissable. |

**Ordering inside Alert:** `AlertIcon` → `AlertContent` → `AlertControls` (top-right) → `AlertClose`

## Variants & Options

| Prop | Options | Default | When to use |
|------|---------|---------|-------------|
| color | `primary`, `destructive`, `info`, `warning`, `success` | `primary` | Must match the semantic intent of the message (see Color Rules) |
| minWidth | number (px) | 256 | Rarely changed — ensures minimum readability |
| maxWidth | number (px) | 980 | Rarely changed — prevents overly wide alerts |

### Color Rules

Colors are semantic — each carries a fixed meaning and a fixed icon. Never pick a color for aesthetics.

| Color | Meaning | Icon | Example |
|-------|---------|------|---------|
| **info** (blue) | Informational, defined/repeatable messages | Info (i) | "This attack was marked as false positive by @admin" |
| **warning** (yellow) | Caution about limitations or consequences | TriangleAlert | "You won't be able to edit this object after creation" |
| **destructive** (red) | Irreversible or dangerous consequences | OctagonAlert | "This object cannot be restored after deletion" |
| **success** (green) | Positive confirmation — **rare**, prefer Toast | CircleCheckBig | "Action completed" — but Toast is usually better |
| **primary** (neutral) | Side notes, promotional, or custom messages that don't fit a semantic category | CircleDashed | Catch-all when no semantic label applies |

**Icons are locked to their color.** Do not override AlertIcon for semantic variants (info, warning, destructive, success). The `icon` prop exists only for `primary` (neutral) alerts where you need a custom visual — e.g., a promotional or branded message. For all semantic colors, the icon is non-negotiable.

## Composition Patterns

### Basic Alert (most common)
Every alert must have AlertIcon + AlertContent with AlertTitle. AlertDescription is optional.
```tsx
<Alert color='info'>
  <AlertIcon />
  <AlertContent>
    <AlertTitle>This attack was marked as false positive</AlertTitle>
    <AlertDescription>Marked by @admin on Mar 15, 2026</AlertDescription>
  </AlertContent>
</Alert>
```

### Alert with Top-Right Actions
Use when the alert is wider than ~450px and buttons won't squeeze the text. AlertControls is placed as a sibling of AlertContent.
```tsx
<Alert color='info'>
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Alert with actions</AlertTitle>
    <AlertDescription>Description text here.</AlertDescription>
  </AlertContent>
  <AlertControls>
    <Button variant='secondary' color='neutral' size='small'>Learn more</Button>
  </AlertControls>
  <AlertClose />
</Alert>
```

### Alert with Bottom Actions
Use when the alert is narrower than ~450px and top-right buttons would compress the text. AlertControls is placed *inside* AlertContent.
```tsx
<Alert color='destructive'>
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Destructive alert with actions</AlertTitle>
    <AlertDescription>This requires your attention.</AlertDescription>
    <AlertControls>
      <Button variant='secondary' color='destructive' size='small'>Delete</Button>
      <Button variant='secondary' color='neutral' size='small'>Cancel</Button>
    </AlertControls>
  </AlertContent>
</Alert>
```

### Alert with Code Output
For error messages that include technical details. Embed a Code component inside AlertContent.
```tsx
<Alert color='destructive'>
  <AlertIcon />
  <AlertContent>
    <AlertTitle>Syntax Error in Configuration</AlertTitle>
    <AlertDescription>An error occurred while parsing the configuration file.</AlertDescription>
    <div className='pt-8'>
      <Code size='s' color='destructive'>
        Error: Unexpected token at line 42, column 15
      </Code>
    </div>
  </AlertContent>
  <AlertClose />
</Alert>
```

## Accessibility
- **ARIA:** Root element has `role="alert"` — screen readers announce it immediately
- **Close button:** Has `aria-label="close"` and a "Close" tooltip
- **Overflow text:** When title or description is truncated via `lineClamp`, a tooltip shows the full text on hover

## Content Guidelines

Text inside alerts follows the same principles as Toast (WIP — will be governed by UX copywriting skill later):

- **Title is a statement** — clear, short, sentence case. Best case: up to 3 words.
- **No trailing punctuation** in titles
- **No articles** — avoid "the", "an", "a" where possible
- **No assertive politeness** — avoid "please", "note", "successfully"
- **Description explains** — accompanies the title with additional context. Free-form but short and concise.
- **Button labels respond to the title** — e.g., title "Event was shared with you" → button "Open event"

## Do's and Don'ts

| Do | Don't |
|----|-------|
| Match color to semantic intent of the message | Pick a color for visual aesthetics |
| Set alert width to match its container (form, dialog, section) | Use a fixed arbitrary width that doesn't align with the layout |
| Use AlertIcon with every alert — icons are fixed per color | Override the icon for semantic color variants |
| Place actions bottom when alert is narrow, top-right when wide | Always default to one placement without considering layout |
| Keep most alerts permanent (non-dismissable) | Add AlertClose to every alert by default |
| Write titles as short statements in sentence case | Use title case, trailing punctuation, or "please"/"note" |

## Related Components

| Component | Relationship | When to prefer |
|-----------|-------------|----------------|
| Toast | Alternative | Transient feedback that auto-dismisses (success messages, quick confirmations) |
| Dialog | Alternative | Blocking messages that require a user decision before continuing |
| Field (error) | Alternative | Inline validation errors tied to a specific input field |
| Banner | Alternative | Page-level or system-wide announcements (not implemented yet) |
| Code | Companion | Embed inside AlertContent for technical error details |
| Button | Companion | Use inside AlertControls with `variant='secondary'` and `size='small'` |

## Multiple Alerts

When several alerts appear in the same section, stack them vertically with `gap-16` (16px) between them. Order by severity: destructive first, then warning, then info, then primary.

## Platform Context

In the Wallarm Console:
- **Delete confirmation dialogs** use `destructive` Alert inside Dialog to emphasize that the object cannot be restored
- **Object creation forms** use `warning` Alert on top of the form when there are post-creation limitations (e.g., "You won't be able to edit this rule after creation")
- **Object detail pages** use `info` Alert at the top of the page content area to show state information (e.g., "This attack was marked as false positive by @admin")
- **Success alerts are rare** — transient success feedback goes through Toast instead

## Tags
alert, message, notification, inline-message, status, warning, error, info, success, feedback, persistent-message, compound
