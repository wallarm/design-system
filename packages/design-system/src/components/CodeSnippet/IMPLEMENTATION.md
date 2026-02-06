# CodeSnippet - Remaining Tasks

**Figma:** [WADS-Components - CodeSnippet](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev)

---

## Completed Components

| Component | Status |
|-----------|--------|
| CodeSnippetRoot | ✅ |
| CodeSnippetContent | ✅ |
| CodeSnippetCode | ✅ |
| CodeSnippetLineNumbers | ✅ |
| CodeSnippetContext | ✅ |
| CodeSnippetAdapterProvider | ✅ |
| InlineCodeSnippet | ✅ |
| Plain Adapter | ✅ |
| Hooks (useCodeSnippet, useAdapter) | ✅ |

---

## Header Components

### CodeSnippetHeader
Container for title, tabs and actions.

```tsx
export type CodeSnippetHeaderProps = HTMLAttributes<HTMLDivElement> & {
    ref?: Ref<HTMLDivElement>;
};
```

Styles: `flex items-center justify-between px-12 py-8 bg-states-primary-hover border-b border-border-primary`

### CodeSnippetTitle
Simple title text display.

```tsx
export type CodeSnippetTitleProps = HTMLAttributes<HTMLSpanElement> & {
    ref?: Ref<HTMLSpanElement>;
};
```

Styles: `text-sm font-medium text-text-primary`

### CodeSnippetTabs
Tab container using existing `Tabs` component or custom implementation.

```tsx
export type CodeSnippetTabsProps = {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
};
```

### CodeSnippetTab
Individual tab item.

```tsx
export type CodeSnippetTabProps = {
    value: string;
    disabled?: boolean;
    children: ReactNode;
};
```

### CodeSnippetActions
Container for action buttons (right side of header).

```tsx
export type CodeSnippetActionsProps = HTMLAttributes<HTMLDivElement> & {
    ref?: Ref<HTMLDivElement>;
};
```

Styles: `flex items-center gap-4`

---

## Action Buttons

### CodeSnippetCopyButton
Copy code to clipboard. Use `useCodeSnippet()` to get `copyToClipboard`.

```tsx
export type CodeSnippetCopyButtonProps = Omit<ButtonProps, 'children'> & {
    copyLabel?: string;
    copiedLabel?: string;
};
```

- Use `Copy` and `Check` icons
- Show "Copied" state for 2 seconds

### CodeSnippetWrapButton
Toggle line wrapping. Use `useCodeSnippet()` to get `wrapLines` and `setWrapLines`.

```tsx
export type CodeSnippetWrapButtonProps = Omit<ButtonProps, 'children'>;
```

### CodeSnippetFullscreenButton
Toggle fullscreen mode. Requires adding `isFullscreen` and `setIsFullscreen` to context.

```tsx
export type CodeSnippetFullscreenButtonProps = Omit<ButtonProps, 'children'>;
```

### CodeSnippetShowMore
Expand/collapse for long code blocks.

```tsx
export type CodeSnippetShowMoreProps = {
    maxLines?: number;
    showMoreLabel?: string;
    showLessLabel?: string;
};
```

---

## Annotation Components

### CodeSnippetAnnotations
Container that positions annotations relative to line numbers.

### CodeSnippetAnnotation
Annotation marker on a specific line.

```tsx
export type CodeSnippetAnnotationProps = {
    line: number;
    type?: 'info' | 'warning' | 'error';
    children: ReactNode;
};
```

---

## Optional Adapters

### Prism Adapter
```bash
yarn add prism-react-renderer
```
Create `adapters/prism.ts` with `createPrismAdapter()`.

### Shiki Adapter
```bash
yarn add shiki
```
Create `adapters/shiki.ts` with `createShikiAdapter()`.

### Highlight.js Adapter
```bash
yarn add highlight.js
```
Create `adapters/highlightjs.ts` with `createHighlightJsAdapter()`.

---

## Additional Tasks

### CodeSnippetField
Form field wrapper using existing `Field` component pattern.

### Storybook Stories
Create `CodeSnippet.stories.tsx` with examples:
- Basic usage
- With line numbers
- With header and actions
- Multi-file tabs
- Line highlighting
- Diff view
- Collapsible
- Inline code

---

## Current File Structure

```
src/shared/ds/components/CodeSnippet/
├── adapters/
│   ├── index.ts              ✅
│   ├── types.ts              ✅
│   └── plain.ts              ✅
├── hooks/
│   ├── index.ts              ✅
│   ├── useAdapter.ts         ✅
│   └── useCodeSnippet.ts     ✅
├── CodeSnippetAdapterProvider.tsx  ✅
├── CodeSnippetCode.tsx             ✅
├── CodeSnippetContent.tsx          ✅
├── CodeSnippetContext.ts           ✅
├── CodeSnippetLineNumbers.tsx      ✅
├── CodeSnippetRoot.tsx             ✅
├── InlineCodeSnippet.tsx           ✅
├── lineStyles.ts                   ✅
├── index.ts                        ✅
└── IMPLEMENTATION.md
```
