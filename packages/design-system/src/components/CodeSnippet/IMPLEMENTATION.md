# CodeSnippet - Implementation Plan

**Figma:** [WADS-Components - CodeSnippet](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev)

---

## Remaining Tasks

### CodeSnippetAnnotations / CodeSnippetAnnotation
Planned but not implemented. Current line annotations work via `lines` prop on Root with `LineConfig` (color, prefix, textStyle, className, style). A dedicated annotation component pattern may be added later if needed.

---

## Testing Plan

### Unit Tests

#### lineUtils

**`splitTextByRanges`:**
- [ ] Splits text at range boundaries
- [ ] Handles empty ranges array
- [ ] Handles out-of-bounds ranges
- [ ] Handles overlapping ranges
- [ ] Applies line color as fallback when no range color

**`splitTokensByRanges`:**
- [ ] Splits tokens across range boundaries
- [ ] Handles multi-token ranges
- [ ] Preserves token types through splits

**`getLineTextStyles`:**
- [ ] Returns correct classes for color and textStyle
- [ ] Suppresses color class when ranges are present
- [ ] Merges custom className and style

#### Adapters

**Plain adapter:**
- [ ] Returns one plain token per line
- [ ] Splits code by newlines correctly

**Prism adapter:**
- [ ] Highlights known language with correct token types
- [ ] Handles unknown language gracefully
- [ ] Flattens nested tokens

**Shiki adapter:**
- [ ] Highlights code with correct token types
- [ ] Lazy-loads highlighter on first use
- [ ] Falls back to plain tokens on error

**Highlight.js adapter:**
- [ ] Highlights code with correct token types
- [ ] Decodes HTML entities correctly
- [ ] Falls back to plain tokens on error

### E2E Tests

**Screenshot tests (one per story):**
- [ ] Default
- [ ] WithLineNumbers
- [ ] Sizes (sm, md, lg)
- [ ] LineAnnotations
- [ ] LineColors
- [ ] LineRanges
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
- [ ] InlineCodeSnippet — Default
- [ ] InlineCodeSnippet — Sizes
- [ ] InlineCodeSnippet — NonCopyable
- [ ] InlineCodeSnippet — VariousContent

**Interaction tests:**
- [ ] Copy button: click copies code to clipboard, tooltip shows "Copied"
- [ ] Wrap button: click toggles line wrapping layout
- [ ] Fullscreen button: click enters fullscreen, Escape exits
- [ ] Show more/less: click expands, click again collapses, shows correct line count
- [ ] Tab switching: clicking tab changes displayed code
- [ ] InlineCodeSnippet: click copies when copyable, no copy when `copyable={false}`

