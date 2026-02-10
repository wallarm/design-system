# CodeSnippet - Implementation Plan

**Figma:** [WADS-Components - CodeSnippet](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev)

---

## Remaining Tasks

### CodeSnippetAnnotations / CodeSnippetAnnotation
Planned but not implemented. Current line annotations work via `lines` prop on Root with `LineConfig` (color, prefix, textStyle, className, style). A dedicated annotation component pattern may be added later if needed.

---

## Testing Plan

**Status: No tests exist yet.**

### Unit Tests

#### CodeSnippetRoot
- [ ] Renders children within context provider
- [ ] Tokenizes code via adapter on mount
- [ ] Falls back to plain tokens on adapter error
- [ ] Re-highlights when code or language changes
- [ ] `wrapLines` prop initializes state correctly
- [ ] `maxLines > 0` renders ShowMoreButton
- [ ] `maxLines={0}` does not render ShowMoreButton
- [ ] Fullscreen state: Escape key exits fullscreen
- [ ] Fullscreen state: renders portal to document.body
- [ ] `onCopy` callback fires on copy

#### CodeSnippetCode
- [ ] Renders plain text lines when tokens are loading
- [ ] Renders tokenized lines when tokens are ready
- [ ] Clips to `maxLines` when not expanded
- [ ] Shows all lines when expanded

#### CodeSnippetLineNumbers
- [ ] Renders correct line numbers starting from `startingLineNumber`
- [ ] Applies line color styling
- [ ] Returns null when tokens are not ready

#### CodeSnippetContent
- [ ] Renders gutter column in non-wrap mode with line numbers
- [ ] Renders inline gutter in wrap mode
- [ ] Hides gutter when no highlights, line numbers, or prefixes
- [ ] Supports native scroll mode

#### CodeSnippetActions
- [ ] Renders children in flex container
- [ ] Accepts className override

#### CodeSnippetCopyButton
- [ ] Copies code to clipboard on click
- [ ] Shows "Copied" tooltip after copy
- [ ] Resets copied state on click outside
- [ ] Returns null when clipboard API unsupported

#### CodeSnippetWrapButton
- [ ] Toggles wrapLines state on click
- [ ] Shows active state when wrapping enabled
- [ ] Tooltip shows "Wrap lines" / "Unwrap lines"

#### CodeSnippetFullscreenButton
- [ ] Toggles fullscreen state on click
- [ ] Shows Maximize icon normally, Minimize when fullscreen
- [ ] Tooltip shows "Enter full screen" / "Exit full screen"

#### ShowMoreButton (internal)
- [ ] Shows "Show more (N lines)" with correct count
- [ ] Shows "Show less" when expanded
- [ ] Returns null when no hidden lines

#### InlineCodeSnippet
- [ ] Renders code text
- [ ] Copies on click when copyable
- [ ] Does not copy when `copyable={false}`
- [ ] Renders correct size variant
- [ ] Supports `asChild` rendering

### Adapter Tests

#### Plain Adapter
- [ ] Returns plain tokens for any input
- [ ] Splits code by newlines correctly

#### Prism Adapter
- [ ] Highlights JavaScript code with correct token types
- [ ] Handles unknown language gracefully
- [ ] Returns supported languages list

#### Shiki Adapter
- [ ] Highlights TypeScript code with correct token types
- [ ] Lazy-loads highlighter on first use
- [ ] Falls back to plain on error

#### Highlight.js Adapter
- [ ] Highlights HTML code with correct token types
- [ ] Decodes HTML entities correctly
- [ ] Falls back to plain on error

### Integration Tests

- [ ] Full composition: Root + Header + Tabs + Actions + Content + LineNumbers + Code
- [ ] Tab switching updates displayed code
- [ ] Copy button copies correct code for active tab
- [ ] Wrap toggle changes code layout
- [ ] ShowMore expands/collapses code
- [ ] Floating actions positioned correctly without header

### Screenshot Tests (E2E)

- [ ] Default
- [ ] WithLineNumbers
- [ ] Sizes (sm, md, lg)
- [ ] LineAnnotations
- [ ] LineColors (all 7)
- [ ] TextStyles
- [ ] LineWithPrefix (diff)
- [ ] LineWrapping
- [ ] WithBothScrolls
- [ ] CustomStartingLine
- [ ] JSONWithShiki
- [ ] TypescriptWithPrism
- [ ] BashWithPrism
- [ ] HTMLWithHighlightJs
- [ ] WithHeader
- [ ] WithTabsAndActions
- [ ] WithFloatingActions
- [ ] ShowMore
- [ ] InlineCodeSnippet - Default
- [ ] InlineCodeSnippet - Sizes
- [ ] InlineCodeSnippet - NonCopyable
- [ ] InlineCodeSnippet - VariousContent

