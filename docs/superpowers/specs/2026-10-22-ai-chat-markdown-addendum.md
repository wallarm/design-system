# AI chat architecture v2, Addendum A: built-in markdown (`AssistantMessageMarkdown`)

> Status: implemented in #370 (41bf6370); proposed 2026-10-22.
> - **Extends** `docs/superpowers/specs/2026-10-21-ai-chat-architecture-v2.md`.
> - **Reverses** its decision 14 ("no new dependencies… the markdown engine stays in the app").
> - **Prototype:** everything here was built outside the repo and checked there:
>   - strict `tsc` (the DS `base.json` flags, `noUncheckedIndexedAccess` included);
>   - SSR and jsdom runs;
>   - size builds.
> - **Reference code:** §9. The paths of the checked copy are in §13.


## ⚠️ User answers (2026-10-22), override anything below

1. **Deps approved:** `marked` and `remend`, **latest versions** (marked 18.1.1, remend 1.4.0), pinned exactly. Decision 14 of spec v2 is amended accordingly.
2. **Inline code** in answers and approvals is click-to-copy. In the chain of thought and inside links it stays non-interactive (Q1 = proposal).
3. **Prism:** **WallyAssistant mounts the lazy Prism adapter itself.** The chunk (~25 KB) loads only when the first code block renders. If the app already provides a `CodeSnippetAdapterProvider`, that provider wins and no second one is mounted.
4. **Images** are blocked by default and render as alt text only. Enable them through the `img` override (Q6 = proposal).
6. **Tables (user, 2026-10-22):** every cell is right-aligned by default, headers included (`text-right`). An explicit GFM column alignment (`:---` / `:---:`) still wins for that column.
5. **Other open questions** use the proposals as specified:
   - Q2: a floating copy button once the fence closes; no header or height cap.
   - Q4: tables use the DS Table frame look; the other elements follow the proposed design and go to design review later.
   - Q5: bold is `font-semibold`.
   - Q7: raw HTML shows as text, except `<br>`.
   - Q9: no `markdownComponents` shortcut; document the recipe instead.
   - Q10: the mapper fences JSON tool output only via `renderStepContent` recipes; no default.

## 0. Decisions

| # | Decision | Evidence |
|---|---|---|
| A1 | The DS ships a presentational GFM renderer, `AssistantMessageMarkdown`, in `src/components/AssistantMessage/`. It replaces `PlainMarkdown` as the default `ChatViewConfig.markdown`. The `markdown` prop stays as the engine escape hatch. | User request. CopilotKit hands us one markdown string per message (§1), so every app would otherwise rebuild the same renderer. |
| A2 | **Engine:** `marked@18.1.1`, called only as `Lexer.lex` (never `marked.parse`, never HTML output), plus `remend@1.4.0` to repair unfinished markdown, plus our own ~150-line token→React walker. **22.2 KB gzip total.** | §2 measurements: react-markdown + gfm + remend is 53.4 KB; Streamdown is 161.8 KB. Lexing 8.4 KB takes 0.67 ms. |
| A3 | **The data model does not change.** `ChatTextPart.text` stays a GFM string, with no `format` field. | AG-UI carries no format flag, and plain text is valid markdown. User text stays unparsed. |
| A4 | **The renderer outputs blocks only**, with no wrapper element. | Three contexts already space and style their *direct children*: `AssistantMessageContent` (`[&>*+*]:mt-8`), the `ChainOfThoughtStep` body (`flex-col gap-16`) and `ApprovalCardContent` (`flex-col gap-8`). A wrapper would break all three. Precedent: `ChatViewProvider` renders no DOM, and both `PlainMarkdown` and `StoryMarkdown` already return bare blocks. Each default part has its own `data-slot`. |
| A5 | **Compound by default.** A typed `components` override map covers every element. Its prop types belong to the DS, so no marked or hast types leak. Four parts are exported: `…InlineCode`, `…CodeBlock`, `…Link` and `…Table`. | It has the same shape as react-markdown's `components` and CopilotKit's `markdownTagRenderers`. The exported parts are the analytics seam required by `docs/metrics/contract.md`. Swapping the engine later stays an internal change. |
| A6 | **Streaming rules:** <ul><li>Only the last block is repaired.</li><li>Three things are hidden for a frame: a dangling marker run, a half-typed table header and an empty fence.</li><li>An open fence stays unhighlighted.</li><li>Finished blocks are memoized on their source text.</li></ul> | Over all 668 prefixes of a full answer, only the last block's source ever changed. No frame showed a literal `**`, a stray backtick or an empty block. Running remend on the whole text leaked closers into later blocks (§5.3). |
| A7 | **Safety rules:** <ul><li>No `dangerouslySetInnerHTML`.</li><li>Raw HTML is shown as text, except `<br>`.</li><li>Links go through a WHATWG-parser allow-list and get `rel="noopener noreferrer"`.</li><li>Images are off by default.</li></ul> | Assistant text is untrusted because of prompt injection, and auto-loading image URLs is the classic data-exfiltration channel. |
| A8 | **Highlighting is opt-in** through the app's `CodeSnippetAdapterProvider` (Prism, loaded lazily, 25.2 KB). The DS mounts no adapter. | The app's root provider already serves the other CodeSnippets. Prism resolves the `yml`, `sh`, `shell`, `js`, `ts`, `py` and `md` aliases by itself (verified), so we need no alias map. |
| A9 | **Inline code is click-to-copy** in answers and approvals. It is plain in the chain of thought and inside links. | Figma 494:4292 marks only the CoT chip as "not interactive", and `StoryMarkdown` behaved the same way. A copy chip inside a link would nest two interactive targets. Open question Q1. |

## 1. What CopilotKit hands us (`@copilotkit/react-core` 1.79.1 → `@ag-ui/core` 1.0.2/1.0.3)

These come from the headless `useAgent().agent.messages`.

| AG-UI message | Field | What arrives | DS target (§10.1 mapper) | Rendered as |
|---|---|---|---|---|
| `AssistantMessage` | `content?: string` | <ul><li>GFM markdown: the whole text so far</li><li>absent on turns that only call tools</li></ul> | `ChatTextPart.text`; a turn's messages are joined with `\n\n` | `variant='answer'`, `streaming` while it is the running tail |
| `ReasoningMessage` | `content: string` | Reasoning text, roughly markdown; grows the same way | reasoning `ChatStep.content` | `variant='chain-of-thought'`, `streaming` while the step is live |
| `ToolMessage` | `content: string or ContentPart[]` | Usually JSON text | **Not markdown.** Use `metric` or `renderStepContent`, or have the mapper wrap it in a ```` ```json ```` fence | `codeBlock` only if fenced |
| `AssistantMessage.toolCalls[].function.arguments` | `string` | Partial JSON while streaming | The mapper writes `ChatApprovalPart.content`: inline code plus a fenced args block | `variant='approval'`, `streaming=false` |
| `UserMessage` | `content: string or ContentPart[]` | What the user typed | user `ChatTextPart` | Plain in `UserMessageBubble`; never parsed |
| `ActivityMessage` | `content: Record<string, any>` | Structured progress | a `custom` part via `renderPart` | — |

**Delivery facts the renderer depends on**
- **Snapshots, not deltas.** Each `TEXT_MESSAGE_CONTENT {delta}` is appended to `content`, so the view always receives the whole string. A `delta` can be `''` as a keep-alive; the text is then unchanged and nothing re-renders.
- **No stable object identity.** The AG-UI reducer `structuredClone`s every message on every event. Memoization therefore keys on strings:
  - `MarkdownView` already passes only primitives;
  - blocks compare their source text (§5.2).
- **Throttling.** `useAgent({ throttleMs: 50 })`, already used in §10.1, caps renders at about 20 per second. Without it you get roughly one render per token.
- **Rewrites.** `MESSAGES_SNAPSHOT` can rewrite any text. The renderer is a pure function of `text`, so that is fine.
- **CopilotKit's own UI is out of scope.** It renders `<Streamdown>{content}</Streamdown>` in v2, and react-markdown + rehype-raw + sanitize in v1. We use neither; we only use the headless hooks.

**Fixtures.** These are mid-stream snapshots, with `streaming` on. They double as unit-test and story data.

| # | `text` | Renders |
|---|---|---|
| t1 | reasoning ``Looking at hits for `/api/lo`` | `<p>Looking at hits for <code>/api/lo</code></p>`, muted, not copyable |
| t4 | `Found **3 att` | `Found <strong>3 att</strong>` |
| t4b | `Found **` | `Found`; the dangling `**` waits one frame |
| t5 | `Found:\n\n\| IP \| Type \| Hits \|\n\|---\|` | only `Found:`; the table appears once its delimiter row is complete |
| t5c | the table header, the full delimiter row, then `\| 1.2.3.4 \| sq` | the table with one row; its last cell is empty |
| t6 | ``2. Add a rule:\n\n```yaml\nrule: block\nip: 1`` | `<ol start="2">` plus a code block: plain text, no copy button |
| t6b | ``…\n\n```ya`` | nothing for the fence yet |
| t7 | `See [docs](https` | `See docs` as text, with no anchor |

## 2. Engine (measured)

How I measured: esbuild 0.28.2 with `--bundle --minify --format=esm --target=es2022`, React external, `gzip -9`. "Own code" is the DS-shaped files in §9.

| Option | min | gzip | Notes |
|---|---|---|---|
| **marked 18.1.1** | 46.5 KB | 13.8 KB | Importing only `Lexer` does not tree-shake the parser out. MIT, zero deps, ESM, GFM built in. 51M downloads/week, npm provenance, 4 maintainers. |
| **remend 1.4.0** | 16.3 KB | 5.75 KB | Apache-2.0, zero deps. From Vercel's streamdown monorepo, with npm provenance. One npm maintainer. |
| **Own code** (walker, 4 parts, `classes.ts`, `lib/markdown.ts`) | 7.7 KB | 2.9 KB | |
| **Total new JS** | **70.6 KB** | **22.2 KB** | 20.1 KB with brotli |
| DS parts newly reachable from WallyAssistant (CodeSnippet root/content/code/actions/copy, `Table/classes`, `Link`) | | +7.7 KB | WallyAssistant standalone: 121.6 → 129.3 KB gz, then ≈151 KB with the engine. This is an estimate built from source without the compiler transform. Most of it is shared with the rest of the console. |
| react-markdown 10.1 + remark-gfm 4.0.1 (+ remend) | | 47.8 KB (53.4 KB) | <ul><li>no streaming support</li><li>re-parsing 8.4 KB takes ~14 ms</li><li>its `Components` type leaks hast `node`</li></ul> |
| markdown-to-jsx 9.10.3 | | 28.3 KB | Parses raw HTML into elements unless `disableParsingRawHTML` is set |
| streamdown 2.7.1 (without shiki) | | 161.8 KB | <ul><li>rehype-raw/parse5 can't be removed</li><li>ships its own UI chrome and Tailwind</li><li>~80% of the 200 KB goal</li></ul> |
| Prism adapter (lazy, opt-in, unchanged) | | 25.2 KB | The JSDoc in `adapters/index.ts` says "~15KB"; that needs fixing |

**Per-update parse cost** of `lexMarkdown(text, true)` on node 24, M1 Max:

| Text size | Time per update |
|---|---|
| 2 KB | 0.22 ms |
| 8.4 KB | 0.67 ms |
| 50 KB | 4.0 ms |

**Pins:** add `"marked": "18.1.1"` and `"remend": "1.4.0"` to the `dependencies` of `packages/design-system/package.json`. Pin exact versions (the repo has `save-exact=true`).
- Both packages use only ES2018 regex features and no APIs newer than ES2022 (I grepped for them).
- marked 18.1.1 was published 2026-10-12. If you want a release at least two weeks old, 18.1.0 (2026-10-05) is the previous patch.

## 3. Component catalog

| Part | Exported | Element | data-slot | Test-id slot | Props |
|---|---|---|---|---|---|
| `AssistantMessageMarkdown` | yes | none: it renders blocks | none (parts carry their own) | none (parts cascade from the nearest `TestIdProvider`) | `text`, `streaming?` (false), `variant?` ('answer'), `components?` |
| `AssistantMessageMarkdownInlineCode` | yes | `InlineCodeSnippet` → `<code>` | `inline-code-snippet` (kept) | `inline-code` | `InlineCodeSnippetProps` minus `size`/`asChild`/`children`, plus `variant?`; `copyable` defaults to `variant !== 'chain-of-thought'` |
| `AssistantMessageMarkdownCodeBlock` | yes | `div` > `CodeSnippetRoot` | `assistant-message-markdown-code-block` | `code-block`, set on the snippet. It cascades to `--copy-button`, `--content` and `--code`. | `code`, `language?`, `complete?` (true), div attributes, `ref` |
| `AssistantMessageMarkdownLink` | yes | `Link` → `<a>` | `assistant-message-markdown-link` | `link` | `LinkProps` minus `href`/`size`/`asChild`, plus `href` (already allow-listed) and `variant?` |
| `AssistantMessageMarkdownTable` | yes | `div` > `table` | `assistant-message-markdown-table` | `table` | div attributes, `ref` |
| Defaults for `p`, `h1`–`h6`, `strong`, `em`, `del`, `blockquote`, `ul`, `ol`, `li`, `hr`, `thead`, `tbody`, `tr`, `th`, `td`, `img` | no (internal) | native tags, plus `Separator` and `Checkmark` | — | — | see the map type in §9.3 |

**Exported types:**
- `AssistantMessageMarkdownProps`
- `AssistantMessageMarkdownComponents`
- `AssistantMessageMarkdownVariant` (`'answer' | 'chain-of-thought' | 'approval'`; `'approval'` renders exactly like `'answer'`)
- each part's `…Props`

**Test-id examples**
- `<AssistantMessage data-testid='m'>` gives `m--inline-code`, `m--link`, `m--table`, `m--code-block` and `m--code-block--copy-button`.
- Inside WallyAssistant: `wally--assistant-message-1--code-block`.
- In a step body: `…--step-0--inline-code`.
- Several elements share a slot, so tests use `getAllByTestId(…)[n]` or `.nth(n)`.

**Documented rule exception.** The root renders no element. It therefore has no `data-slot`, `ref`, `data-testid` or rest spread, the same as `ChatViewProvider`. It also does not extend `TestableProps`.

## 4. Element → DS mapping

**Context typography is unchanged.** It comes from the parent; the renderer never sets font sizes.

| Context | Parent component | Styles | Figma |
|---|---|---|---|
| Answer | `AssistantMessageContent` | <ul><li>text: `text-sm leading-base text-text-primary` (14/24)</li><li>spacing: blocks `mt-8`, `mt-4` after a heading</li><li>headings: `font-sans-display text-base font-medium` (16/24)</li><li>lists: `ps-21`, `li leading-sm` (20), `li+li mt-4`</li></ul> | 91:1011, 21:4517 |
| Chain of thought | `ChainOfThought` + step body | <ul><li>text: `text-xs leading-xs text-text-secondary` (12/16)</li><li>body: `gap-16`, `ul` disc `ps-18`</li><li>headings: `font-medium` (12/16)</li></ul> | 494:4292 |
| Approval | `ApprovalCardContent` | `text-sm text-text-primary`, `gap-8` | 171:1790 |

**The only context class change:** in `assistantMessageContentVariants`, change `:is(h1,h2,h3,h4)` to `:is(h1,h2,h3,h4,h5,h6)`. It appears 3 times.

| Markdown | Default | Classes / DS component | Figma | Status |
|---|---|---|---|---|
| paragraph, soft break | `<p>` | inherits from the context | 91:1011, 494:4292 | designed |
| `#`–`######` | `<h1>`…`<h6>` | context rules (all headings 16/24 medium in answers) | 91:1011 (one level) | h1/h2 sizes provisional |
| `**strong**` | `<strong class="font-semibold">` | 600 | — | provisional (Q5) |
| `*em*`, `~~del~~` | `<em>`, `<del>` | UA italic and line-through | — | provisional |
| `` `code` `` | `AssistantMessageMarkdownInlineCode` → `InlineCodeSnippet size='sm'` (`text-xs px-4 py-2 rounded-6 code-snippet-bg text-syntax-no-syntax`) | <ul><li>adds `max-w-full wrap-anywhere`, because `inline-flex` chips overflowed with long hashes</li><li>CoT: `text-text-secondary`, `copyable={false}`</li><li>inside links: `copyable={false}`</li></ul> | 91:1011, 494:4292 note | designed |
| fenced code | `AssistantMessageMarkdownCodeBlock`: `div` > `CodeSnippetRoot` (default size `sm` = mono 12/20, `code-snippet-bg rounded-6`, content `py-8 px-12`) > `CodeSnippetContent` > `CodeSnippetCode`; a floating `CodeSnippetActions` > `CodeSnippetCopyButton` only when `complete` | wrapper `[li>&]:mt-4`. The wrapper is required: `CodeSnippetRoot`'s outer node is `display: contents`, so prose margins ignore it. | 181:3500 (no header, no line numbers) | copy button provisional (Q2) |
| `-` / `1.` lists | `<ul class="list-disc ps-18">`, `<ol start class="list-decimal ps-18">`, `<li>` | <ul><li>The parts carry their own markers, because the CoT body styles only `ul`. An `ol` rule there would also hit nested ChainOfThought `<ol>`s.</li><li>`ApprovalCardContent` styles no lists at all.</li><li>In answers the context's `ps-21` wins on specificity (0,1,1 beats 0,1,0).</li></ul> | 21:4517 (14/20, gap 4, ~22px indent) | designed (`ol` provisional) |
| task item | `<li class="flex list-none items-start gap-8">` + sr-only `<input type=checkbox disabled readOnly>` + `Checkmark aria-hidden` + `<div class="min-w-0">` | — | — | provisional |
| link / autolink | `AssistantMessageMarkdownLink` → `Link size='md'` (`'sm'` in CoT) | <ul><li>`inline rounded-2 focus-visible:ring-3 focus-visible:ring-focus-primary`. `Link` is `inline-flex`, so long links would not wrap, and it has `outline-none` with no focus ring.</li><li>Absolute URLs get `target=_blank rel="noopener noreferrer"`.</li></ul> | — | provisional (Q4) |
| `> quote` | `<blockquote>` | `border-s-2 border-border-primary ps-12 text-text-secondary [&>*+*]:mt-8` | — | provisional |
| `---` | `Separator decorative={false}` (`role=separator`) | `h-[1px] bg-border-primary` | — | provisional |
| GFM table | `AssistantMessageMarkdownTable`: `div` (`tableContainerVariants()` + `overflow-x-auto`) > `table` (`w-full border-separate border-spacing-0 [&>tbody>tr:last-child>td]:border-b-0`) | <ul><li>`th scope=col`: `tableHeadCellVariants()`</li><li>`td`: `tableBodyCellVariants()`</li><li>alignment through `assistantMessageMarkdownCellVariants`; `th` defaults to start</li></ul> | none in chat (the DS Table look) | provisional (Q4) |
| image | alt text only | — | — | security decision (Q6) |
| raw HTML | literal text; a bare `<br>` becomes a line break | — | — | security decision (Q7) |

## 5. Streaming

### 5.1 Pipeline (`lib/markdown.ts`, `lexMarkdown(text, streaming)`)

1. **`streaming=false`.** The text goes straight to `Lexer.lex(text, { gfm: true })`, which is plain marked and identical to a standard renderer. History renders exactly as written.
2. **`streaming=true`.** Five steps:
   1. Strip a dangling marker run at the very end (`/(^|\s)(?:[*_~`#>+-]+|\d+[.)])\s*$/`). It covers `**`, `` ` ``, `~~`, a half fence, `#`, `-`, `>` and `1.`. remend can't close an empty span, so these would otherwise flash for a frame as a literal or as an empty heading or bullet.
   2. Lex the stripped text.
   3. Take the last block. Unless it is `code` or `html`, re-lex `remend(tail.raw, { linkMode:'text-only', katex:false, htmlTags:false, italic:false })` and splice the result in its place.
   4. If the new last block is a table header that marked still lexes as a paragraph, or a fence with no code yet, drop it for now.
   5. Return the blocks.
3. **Fresh options on every call.** marked's defaults are global, so an app-level `marked.use()` would otherwise leak in. The lexer also writes a tokenizer onto the options object it is given.

### 5.2 Rendering
- Each top-level block is a `memo` component keyed by index. Its comparator checks `token.raw`, `streaming`, `variant` and the `components` identity.
- Every lex creates new token objects, so identity never matches. The source text does match, so finished blocks skip rendering.
- With jsdom over 223 frames, the first `h2` rendered 8 times while it was the tail and once more when `streaming` flipped. Finished blocks never re-rendered.
- That one extra render at the end also resolves a reference-link definition that arrived after its use.
- Index keys are correct here: blocks are positional and only the tail changes. One `biome-ignore-all lint/suspicious/noArrayIndexKey` comment covers the file.

### 5.3 Why only the tail, why `italic:false` (measured)
- **remend counts markers across its whole input.**
  - `remend('Path /var/log/*.log\n\nNext para')` returns `…Next para*`.
  - Run on the full text, one stray `*` in a finished block leaks a closer into every later frame.
  - On finished text it also rewrites legitimate content: `glob *.yaml` becomes `*.yaml*`, and `use *args and **kwargs` becomes `…***`.
- **So remend runs only while streaming, and only on the tail.**
- **Italic repair is off.** An unpaired `*` in prose, such as `(*.example.com)`, otherwise italicised the rest of the block for 47 of 64 frames.
  - The cost: a real `*italic*` shows its opening `*` until the closer arrives, about 1–2 throttled frames.
  - `**bold**`, `***bold-italic***`, `` `code` ``, `~~strike~~`, links, images, setext headings, `- > 25` and `20~25` are still repaired.

### 5.4 Behaviour

| Case | While streaming | When `streaming` ends |
|---|---|---|
| Open `**`, `` ` ``, `~~` | closed by remend | as written |
| Dangling `**`, `#`, `-`, `1.` at the very end | hidden until the next token | as written |
| Half link `[docs](https` | `docs` as text | as written |
| Half image | alt text (the placeholder src fails `safeHref`) | alt text |
| Table header without a full delimiter row | hidden (no paragraph→table jump) | rendered |
| Table with a partial row | the table, with empty cells | — |
| Open ```` ```lang ```` | `CodeSnippet` with `language='text'` and no copy button; highlighted once the fence closes | highlighted, even if the closing fence never came |
| ```` ``` ```` with no code yet | hidden | — |
| Unknown token | its raw text | its raw text |

**Why plain text while the fence is open.** `CodeSnippetRoot` sets `isLoading` on every `code` change and renders plain lines until its async highlight resolves, so a highlighted block would flicker on every token. A separate, optional DS fix is to keep the previous tokens on screen while re-highlighting.

### 5.5 Verification (prototype)
- **Stability.** For every prefix of the 668-char Wally fixture, every block except the last equals the final lex.
- **No flashes.** 0 frames showed a literal `**` or backtick outside code, an empty code block, or an empty `h1`–`h6`/`p`/`blockquote`.
- **No crashes.** 0 throws across 23,785 streaming frames: the sloppy LLM fixture plus 200 random markdown-ish strings, typed one character at a time.
- **Known leftover.** Typing a task box (`- [`) shows an empty bullet for up to 3 frames.

## 6. Security (assistant content is untrusted)
- **No HTML output.** `dangerouslySetInnerHTML` is never used and `marked.parse` is never imported. Every node is a React text node or a DS element, so React escapes everything.
- **Raw HTML** (`html` tokens) is rendered as visible text: `<script>…</script>` and `<img src=x onerror=…>` appear literally. A bare `<br>`, `<br/>` or `<br />` is the one exception and becomes a line break, because LLMs put it in table cells. `html` is not a key in the components map, so an override can't turn it back into injection.
- **`safeHref`** parses with `new URL(href, 'https://base.invalid')`, the browser's own WHATWG parser.
  - Allowed: `http:`, `https:`, `mailto:`, and relative URLs (`/x`, `./x`, `x/y`, `#x`, `//host`).
  - Everything else (`javascript:` in any casing, `data:`, `vbscript:`, `file:`, `blob:`) renders as its plain children, and the `a` override is never called.
  - Leading spaces, tabs and control characters resolve the same way they do in the browser.
  - Hrefs are **never** entity-decoded. React writes attributes verbatim, so `javascript&colon;x` stays a harmless relative path.
- **Images** are never rendered as `<img>` by default; only the alt text shows. An untrusted URL loads as soon as it renders, which is a tracking pixel or data exfiltration through the query string (prompt injection). An `img` override receives only an allow-listed `src`, and the app owns that decision.
- **External links** get `target=_blank rel="noopener noreferrer"`. Consumer props spread before that, so an override can change it.
- **Entities.** marked decodes numeric entities itself. We decode only `&amp; &lt; &gt; &quot; &nbsp;`, and only into text nodes.
- **No marked extensions** are registered, and every call passes fresh options, so a global `marked.use()` in the app can't add token types.

**Unit-test matrix.** No `script`, `img`, `iframe` or `[onerror]` element may appear, and every `a[href]` must pass `safeHref`. Inputs:
- `[a](javascript:alert(1))`
- `JaVaScRiPt:`
- `data:text/html…`
- `vbscript:`
- `<javascript:alert(1)>`
- `[l](<javascript:alert(1)>)`
- `[e](javascript&colon;alert(1))`
- `[b](&#106;avascript:…)`
- `file:///etc/passwd`
- `blob:`
- `![k](javascript:…)`
- `![p](https://evil/p.gif)`
- `<script>`
- `<img onerror>`
- `<a href="javascript:…">`

## 7. Integration
- **`AssistantMessageContent`.** Its JSDoc changes to: "The answer body: spaces and styles markdown blocks (14/24 paragraphs, 16/24 headings, lists). Put `AssistantMessageMarkdown` inside it (WallyAssistant's default), or your own renderer's blocks." Plus the h5/h6 selector from §4. Existing stories that hand-write `<h3>/<p>/<ul>` are unaffected.
- **`ChatViewContext.ts`:**
  - import `AssistantMessageMarkdown` and `type AssistantMessageMarkdownVariant` from `'../AssistantMessage'` (L2 → L1, the allowed direction);
  - type `ChatMarkdownProps.variant` as `AssistantMessageMarkdownVariant`;
  - delete `PlainMarkdown`, which is not in the public barrel;
  - set `DEFAULT_VALUE.markdown: AssistantMessageMarkdown`;
  - change the `ChatViewConfig.markdown` JSDoc to: "The markdown renderer, at module scope (never inline). Default: the DS `AssistantMessageMarkdown` (GFM, streaming-safe, no raw HTML, http/https/mailto/relative links only, no images). A replacement owns its own sanitizing. To change one element, wrap it at module scope: `const WallyMarkdown: FC<ChatMarkdownProps> = p => <AssistantMessageMarkdown {...p} components={MAP} />`."
  - `MarkdownView` is unchanged; it still passes only primitives, so unchanged messages are never re-parsed.
- **`ChatViewProvider.tsx`:** `markdown = AssistantMessageMarkdown`.
- **No change needed** in `WallyAssistant.tsx`, `ChatPartView`, `ChainOfThoughtView` or `ApprovalCardView`. They already pass `text`, `streaming`, `variant`, `messageId` and `partId`. `AssistantMessageMarkdown`'s props are a subset of those and fit `ComponentType<ChatMarkdownProps>`; this was type-checked. The extra `messageId` and `partId` are ignored.
- **`WallyAssistant/ANALYTICS_GAPS.md`**, closed-target gaps, gets a new row: "Links, inline-code copy and code-block copy inside markdown | — | `markdown` with `AssistantMessageMarkdown components={{ a, inlineCode, codeBlock }}` wrapping the exported parts". The `AssistantMessage` folder needs no gaps file: every target is reachable through the map and the parts.
- **Highlighting** is documented in the JSDoc and in §10.1: wrap the app, or WallyAssistant, in `<CodeSnippetAdapterProvider adapter={loadPrismAdapter}>`. Prism maps few YAML token types (keys come out plain); prefer `json`/`bash`/`http` fences in examples.
- **Copy (MessageActions)** still copies the raw markdown (`copyText ?? joined text`). Override it with `copyText` if that matters.

## 8. Data model and mapper
- **Types:** no change.
- **`model/model.ts` JSDoc:** `ChatTextPart` should read "Assistant text is GFM markdown, rendered by `markdown` (default `AssistantMessageMarkdown`); user text is plain, whitespace kept." `ChatStep.content` and `ChatApprovalPart.content` stay "markdown".
- **§10.1 mapper:** no logic change.
  - Delete the app's `WallyMarkdown` and `CotInlineCode`, the `InlineCodeSnippet` import, and the `markdown={WallyMarkdown}` prop.
  - Keep `useAgent({ throttleMs: 50 })`.
  - If raw tool output should show in a step body, write it as ```` ```json\n<pretty JSON, truncated>\n``` ```` in `content`. Never put the bare JSON string in `content`.
- **System prompt hint for Wally:** wrap IPs, paths, rule ids, globs and tokens in backticks. They render as chips, and `*`/`_` inside them is never treated as emphasis.

## 9. Code (implementation-ready)

**New files** in `src/components/AssistantMessage/`:
- `lib/markdown.ts`, the only file that imports the engine
- `AssistantMessageMarkdown.tsx`
- `AssistantMessageMarkdownInlineCode.tsx`
- `AssistantMessageMarkdownCodeBlock.tsx`
- `AssistantMessageMarkdownLink.tsx`
- `AssistantMessageMarkdownTable.tsx`

**Edited:** `classes.ts` and `index.ts`.

### 9.1 `lib/markdown.ts`
```ts
import { Lexer, type MarkedToken, type Token } from 'marked';
import remend from 'remend';

// The only file that imports the engine. No marked extensions are registered, so marked never emits its
// `Tokens.Generic` (an `any` index signature): every token is a `MarkedToken`.
export const asTokens = (tokens: Token[] | undefined): MarkedToken[] => (tokens ?? []) as MarkedToken[];

/** Fresh options per call: marked's defaults are global (an app's `marked.use()` would leak in) and the lexer
 *  writes a tokenizer onto the options object it gets. */
const lexBlocks = (src: string): MarkedToken[] =>
  asTokens(Lexer.lex(src, { gfm: true })).filter(t => t.type !== 'space' && t.type !== 'def');

// ponytail: heuristic. Hides a marker run the tail can't close yet (`**`, `` ` ``, `~~`, `#`, `-`, `>`, `1.`) for
// the frame or two until the next token; remend can't close an empty span. Extend the class when the
// prefix-flash test finds a new flash (known leftover: `- [` shows an empty bullet for ≤3 frames).
const DANGLING = /(^|\s)(?:[*_~`#>+-]+|\d+[.)])\s*$/;
// italic: false — an unpaired `*` (a glob like `*.example.com` in prose) would italicize the rest of the block.
const REMEND = { linkMode: 'text-only', katex: false, htmlTags: false, italic: false } as const;

/** A table header that marked still lexes as a paragraph (no full delimiter row yet). */
const isHalfTable = (t: MarkedToken): boolean =>
  t.type === 'paragraph' &&
  /^ {0,3}\|.*\|/.test(t.raw) &&
  t.raw
    .split('\n')
    .slice(1)
    .every(line => /^[\s|:-]*$/.test(line));

/**
 * The top-level blocks of untrusted GFM. While `streaming`, only the last block can be unfinished, so only it is
 * repaired (remend counts markers across its whole input: run on the full text, one stray `*` in a finished
 * block leaks a closer into every later frame), and a tail that would flash — a half-typed table header, a fence
 * with no code yet — is held back.
 */
export const lexMarkdown = (text: string, streaming: boolean): MarkedToken[] => {
  if (!streaming) return lexBlocks(text);
  const blocks = lexBlocks(text.replace(DANGLING, '$1'));
  const tail = blocks.pop();
  if (tail) {
    blocks.push(...(tail.type === 'code' || tail.type === 'html' ? [tail] : lexBlocks(remend(tail.raw, REMEND))));
  }
  const last = blocks[blocks.length - 1];
  if (last && (isHalfTable(last) || (last.type === 'code' && !last.text))) blocks.pop();
  return blocks;
};

/** The closing fence has arrived (indented code has none and is always closed). */
export const isClosedFence = (raw: string): boolean => {
  const open = /^ {0,3}(`{3,}|~{3,})/.exec(raw)?.[1];
  if (!open) return true;
  const lines = raw.trimEnd().split('\n');
  const close = lines.length > 1 ? /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[lines.length - 1] ?? '')?.[1] : undefined;
  return !!close && close[0] === open[0] && close.length >= open.length;
};

const BASE = 'https://base.invalid';
/**
 * http(s), mailto and relative URLs pass; javascript:, data:, vbscript:, file:, blob: and anything unparsable
 * don't. The WHATWG parser is the browser's own, so case, whitespace and control-character tricks resolve the
 * same way here. Never entity-decode an href: React writes attributes verbatim, so `javascript&colon;x` stays
 * a harmless relative path.
 */
export const safeHref = (href: string | null | undefined): string | undefined => {
  if (!href) return undefined;
  try {
    return /^(?:https?|mailto):$/.test(new URL(href, BASE).protocol) ? href : undefined;
  } catch {
    return undefined;
  }
};

const ENTITIES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' };
/** marked decodes numeric entities but keeps these named ones in text tokens. Text nodes only. */
export const decodeEntities = (s: string): string =>
  s.replace(/&(amp|lt|gt|quot|nbsp);/g, (m, name: string) => ENTITIES[name] ?? m);
```

### 9.2 `classes.ts` (append)
```ts
/** Not in Figma (provisional): a muted rule on the start edge. */
export const assistantMessageMarkdownBlockquoteVariants = cva(
  'border-s-2 border-border-primary ps-12 text-text-secondary [&>*+*]:mt-8',
);
/** Lists carry their own markers: the chain-of-thought body only styles `ul` (its nested chains are `ol`s) and
 *  ApprovalCardContent styles none. 18px = the CoT indent; AssistantMessageContent's `ps-21` wins in answers. */
export const assistantMessageMarkdownListVariants = cva('ps-18', {
  variants: { ordered: { true: 'list-decimal', false: 'list-disc' } },
  defaultVariants: { ordered: false },
});
/** GFM task item: the Checkmark takes the bullet's place (provisional). */
export const assistantMessageMarkdownTaskItemVariants = cva('flex list-none items-start gap-8');
/** GFM column alignment; headers default to start (a UA `th` centers). */
export const assistantMessageMarkdownCellVariants = cva('', {
  variants: { align: { left: 'text-left', center: 'text-center', right: 'text-right' } },
  defaultVariants: { align: 'left' },
});
/** Long hashes and tokens wrap instead of overflowing the 444px column; muted in the chain of thought
 *  (Figma 494:4292: color → text-secondary). */
export const assistantMessageMarkdownInlineCodeVariants = cva('max-w-full wrap-anywhere', {
  variants: { muted: { true: 'text-text-secondary', false: '' } },
  defaultVariants: { muted: false },
});
/** `Link` is inline-flex (a long link wouldn't wrap) and has outline-none with no ring. */
export const assistantMessageMarkdownLinkVariants = cva(
  'inline rounded-2 focus-visible:ring-3 focus-visible:ring-focus-primary',
);
/** A real block for the prose margins (CodeSnippetRoot's outer node is display: contents). */
export const assistantMessageMarkdownCodeBlockVariants = cva('[li>&]:mt-4');
/** Scrolls sideways in the narrow panel; the frame is `tableContainerVariants`. */
export const assistantMessageMarkdownTableVariants = cva('overflow-x-auto');
export const assistantMessageMarkdownTableGridVariants = cva(
  'w-full border-separate border-spacing-0 [&>tbody>tr:last-child>td]:border-b-0',
);
```
Also change `:is(h1,h2,h3,h4)` to `:is(h1,h2,h3,h4,h5,h6)` in the three heading rules of `assistantMessageContentVariants`.

### 9.3 `AssistantMessageMarkdown.tsx`
```tsx
// biome-ignore-all lint/suspicious/noArrayIndexKey: markdown blocks and spans are positional; while streaming only the tail changes
import { type ComponentType, type FC, Fragment, memo, type ReactNode } from 'react';
import type { MarkedToken, Token } from 'marked';
import { cn } from '../../utils/cn';
import { Checkmark } from '../Checkmark';
import { Separator } from '../Separator';
import { tableBodyCellVariants, tableHeadCellVariants } from '../Table/classes';
import { AssistantMessageMarkdownCodeBlock, type AssistantMessageMarkdownCodeBlockProps } from './AssistantMessageMarkdownCodeBlock';
import { AssistantMessageMarkdownInlineCode, type AssistantMessageMarkdownInlineCodeProps } from './AssistantMessageMarkdownInlineCode';
import { AssistantMessageMarkdownLink, type AssistantMessageMarkdownLinkProps } from './AssistantMessageMarkdownLink';
import { AssistantMessageMarkdownTable } from './AssistantMessageMarkdownTable';
import {
  assistantMessageMarkdownBlockquoteVariants,
  assistantMessageMarkdownCellVariants,
  assistantMessageMarkdownListVariants,
  assistantMessageMarkdownTaskItemVariants,
} from './classes';
import { asTokens, decodeEntities, isClosedFence, lexMarkdown, safeHref } from './lib/markdown';

/** Same literals as `ChatMarkdownProps.variant`. 'approval' renders like 'answer'. */
export type AssistantMessageMarkdownVariant = 'answer' | 'chain-of-thought' | 'approval';
type Align = 'left' | 'center' | 'right';
interface WithChildren {
  children?: ReactNode;
}

/** One entry per element. The renderer passes only these props; `href` and `src` are already allow-listed. */
export interface AssistantMessageMarkdownComponents {
  p: ComponentType<WithChildren>;
  h1: ComponentType<WithChildren>;
  h2: ComponentType<WithChildren>;
  h3: ComponentType<WithChildren>;
  h4: ComponentType<WithChildren>;
  h5: ComponentType<WithChildren>;
  h6: ComponentType<WithChildren>;
  strong: ComponentType<WithChildren>;
  em: ComponentType<WithChildren>;
  del: ComponentType<WithChildren>;
  blockquote: ComponentType<WithChildren>;
  ul: ComponentType<WithChildren>;
  ol: ComponentType<WithChildren & { start?: number }>;
  /** `checked` is set for GFM task items only. */
  li: ComponentType<WithChildren & { checked?: boolean }>;
  hr: ComponentType;
  table: ComponentType<WithChildren>;
  thead: ComponentType<WithChildren>;
  tbody: ComponentType<WithChildren>;
  tr: ComponentType<WithChildren>;
  th: ComponentType<WithChildren & { align?: Align }>;
  td: ComponentType<WithChildren & { align?: Align }>;
  a: ComponentType<AssistantMessageMarkdownLinkProps>;
  inlineCode: ComponentType<AssistantMessageMarkdownInlineCodeProps>;
  codeBlock: ComponentType<AssistantMessageMarkdownCodeBlockProps>;
  /** Default: the alt text. An untrusted image URL loads on render (tracking pixel, data exfiltration). */
  img: ComponentType<{ src: string; alt: string; title?: string }>;
}

export interface AssistantMessageMarkdownProps {
  /** Untrusted GFM: the whole text so far (a snapshot, never a delta). */
  text: string;
  /** The text is still growing: repair the unfinished last block, hold back a half-typed table or an empty fence,
   *  keep an open fence unhighlighted. Default false. */
  streaming?: boolean;
  /** Where it renders. 'chain-of-thought': muted, non-copyable inline code and 12px links. Default 'answer'. */
  variant?: AssistantMessageMarkdownVariant;
  /** Element overrides merged over the defaults. Module scope: a new object re-renders every block. */
  components?: Partial<AssistantMessageMarkdownComponents>;
}

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
const cell = (base: string, align: Align | undefined) => cn(base, assistantMessageMarkdownCellVariants({ align }));

const DEFAULTS: AssistantMessageMarkdownComponents = {
  p: ({ children }) => <p>{children}</p>,
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  h4: ({ children }) => <h4>{children}</h4>,
  h5: ({ children }) => <h5>{children}</h5>,
  h6: ({ children }) => <h6>{children}</h6>,
  strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  del: ({ children }) => <del>{children}</del>,
  blockquote: ({ children }) => <blockquote className={assistantMessageMarkdownBlockquoteVariants()}>{children}</blockquote>,
  ul: ({ children }) => <ul className={assistantMessageMarkdownListVariants()}>{children}</ul>,
  ol: ({ start, children }) => (
    <ol start={start} className={assistantMessageMarkdownListVariants({ ordered: true })}>
      {children}
    </ol>
  ),
  li: ({ checked, children }) =>
    checked === undefined ? (
      <li>{children}</li>
    ) : (
      <li className={assistantMessageMarkdownTaskItemVariants()}>
        <input type='checkbox' checked={checked} disabled readOnly className='sr-only' />
        <Checkmark checkedState={checked} aria-hidden='true' />
        <div className='min-w-0'>{children}</div>
      </li>
    ),
  hr: () => <Separator decorative={false} />,
  table: AssistantMessageMarkdownTable,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ align, children }) => (
    <th scope='col' className={cell(tableHeadCellVariants(), align)}>
      {children}
    </th>
  ),
  td: ({ align, children }) => <td className={cell(tableBodyCellVariants(), align)}>{children}</td>,
  a: AssistantMessageMarkdownLink,
  inlineCode: AssistantMessageMarkdownInlineCode,
  codeBlock: AssistantMessageMarkdownCodeBlock,
  img: ({ alt }) => alt,
};

interface Walk {
  c: AssistantMessageMarkdownComponents;
  variant: AssistantMessageMarkdownVariant;
  streaming: boolean;
  /** Inside a link: inline code must not become a second interactive target. */
  inLink: boolean;
}

const renderInline = (tokens: Token[] | undefined, w: Walk): ReactNode[] =>
  asTokens(tokens).map((t, i) => {
    const { c } = w;
    switch (t.type) {
      case 'text':
        return t.tokens ? <Fragment key={i}>{renderInline(t.tokens, w)}</Fragment> : decodeEntities(t.text);
      case 'escape':
        return t.text;
      case 'strong':
        return <c.strong key={i}>{renderInline(t.tokens, w)}</c.strong>;
      case 'em':
        return <c.em key={i}>{renderInline(t.tokens, w)}</c.em>;
      case 'del':
        return <c.del key={i}>{renderInline(t.tokens, w)}</c.del>;
      case 'codespan':
        return <c.inlineCode key={i} code={t.text} variant={w.variant} copyable={!w.inLink && w.variant !== 'chain-of-thought'} />;
      case 'br':
        return <br key={i} />;
      case 'link': {
        const href = safeHref(t.href);
        const children = renderInline(t.tokens, { ...w, inLink: true });
        return href ? (
          <c.a key={i} href={href} title={t.title ?? undefined} variant={w.variant}>
            {children}
          </c.a>
        ) : (
          <Fragment key={i}>{children}</Fragment>
        );
      }
      case 'image': {
        const src = safeHref(t.href);
        return src ? <c.img key={i} src={src} alt={t.text} title={t.title ?? undefined} /> : t.text;
      }
      case 'html': // raw HTML shows as typed; only a bare <br> (LLMs put it in table cells) breaks the line
        return /^<br\s*\/?>$/i.test(t.raw) ? <br key={i} /> : t.raw;
      case 'checkbox':
        return null;
      default:
        return t.raw;
    }
  });

const renderBlocks = (tokens: Token[] | undefined, w: Walk): ReactNode[] => asTokens(tokens).map((t, i) => renderBlock(t, i, w));

const renderBlock = (t: MarkedToken, key: number, w: Walk): ReactNode => {
  const { c } = w;
  switch (t.type) {
    case 'paragraph':
      return <c.p key={key}>{renderInline(t.tokens, w)}</c.p>;
    case 'text': // a tight list item's line
      return <Fragment key={key}>{t.tokens ? renderInline(t.tokens, w) : decodeEntities(t.text)}</Fragment>;
    case 'heading': {
      const H = c[HEADINGS[t.depth - 1] ?? 'h6'];
      return <H key={key}>{renderInline(t.tokens, w)}</H>;
    }
    case 'code':
      return <c.codeBlock key={key} code={t.text} language={t.lang || undefined} complete={!w.streaming || isClosedFence(t.raw)} />;
    case 'blockquote':
      return <c.blockquote key={key}>{renderBlocks(t.tokens, w)}</c.blockquote>;
    case 'list': {
      const items = t.items.map((item, j) => (
        <c.li key={j} checked={item.task ? item.checked : undefined}>
          {renderBlocks(item.tokens, w)}
        </c.li>
      ));
      return t.ordered ? (
        <c.ol key={key} start={t.start === '' || t.start === 1 ? undefined : t.start}>
          {items}
        </c.ol>
      ) : (
        <c.ul key={key}>{items}</c.ul>
      );
    }
    case 'table':
      return (
        <c.table key={key}>
          <c.thead>
            <c.tr>
              {t.header.map((h, j) => (
                <c.th key={j} align={h.align ?? undefined}>
                  {renderInline(h.tokens, w)}
                </c.th>
              ))}
            </c.tr>
          </c.thead>
          <c.tbody>
            {t.rows.map((row, j) => (
              <c.tr key={j}>
                {row.map((d, k) => (
                  <c.td key={k} align={d.align ?? undefined}>
                    {renderInline(d.tokens, w)}
                  </c.td>
                ))}
              </c.tr>
            ))}
          </c.tbody>
        </c.table>
      );
    case 'hr':
      return <c.hr key={key} />;
    case 'html': // a raw HTML block shows as typed
      return t.raw.trim() ? <c.p key={key}>{t.raw.trim()}</c.p> : null;
    case 'space':
    case 'def':
    case 'checkbox':
      return null;
    default:
      return <c.p key={key}>{t.raw}</c.p>;
  }
};

interface BlockProps {
  token: MarkedToken;
  streaming: boolean;
  variant: AssistantMessageMarkdownVariant;
  components?: Partial<AssistantMessageMarkdownComponents>;
}

/**
 * One top-level block. Every lex makes new token objects, so it compares the block's source: finished blocks skip
 * rendering while the tail streams, and every block renders once more when `streaming` ends (a reference-link
 * definition that arrived after its use resolves then).
 */
const Block = memo<BlockProps>(
  ({ token, streaming, variant, components }) =>
    renderBlock(token, 0, { c: components ? { ...DEFAULTS, ...components } : DEFAULTS, variant, streaming, inLink: false }),
  (a, b) => a.token.raw === b.token.raw && a.streaming === b.streaming && a.variant === b.variant && a.components === b.components,
);
Block.displayName = 'AssistantMessageMarkdownBlock';

/**
 * Untrusted GFM (an AG-UI `AssistantMessage.content` snapshot) as DS elements. It renders no wrapper: its blocks
 * are direct children of `AssistantMessageContent`, a `ChainOfThoughtStep` body or `ApprovalCardContent`, which
 * space and style them. No raw HTML, http/https/mailto/relative links only, no images. The default
 * `ChatViewConfig.markdown`; its props are a subset of `ChatMarkdownProps`.
 */
export const AssistantMessageMarkdown: FC<AssistantMessageMarkdownProps> = ({ text, streaming = false, variant = 'answer', components }) =>
  lexMarkdown(text, streaming).map((token, i) => (
    <Block key={i} token={token} streaming={streaming} variant={variant} components={components} />
  ));

AssistantMessageMarkdown.displayName = 'AssistantMessageMarkdown';
```

### 9.4 Parts
```tsx
// AssistantMessageMarkdownInlineCode.tsx
export interface AssistantMessageMarkdownInlineCodeProps
  extends Omit<InlineCodeSnippetProps, 'size' | 'asChild' | 'children'>, TestableProps {
  /** 'chain-of-thought' mutes the colour and turns copy off (Figma 494:4292). Default 'answer'. */
  variant?: AssistantMessageMarkdownVariant;
}
/** Markdown inline code: `InlineCodeSnippet size='sm'`. The renderer also turns copy off inside a link. */
export const AssistantMessageMarkdownInlineCode: FC<AssistantMessageMarkdownInlineCodeProps> = ({
  variant = 'answer', copyable = variant !== 'chain-of-thought', className, 'data-testid': testIdProp, ...props
}) => (
  <InlineCodeSnippet {...props} size='sm' copyable={copyable} data-testid={useTestId('inline-code', testIdProp)}
    className={cn(assistantMessageMarkdownInlineCodeVariants({ muted: variant === 'chain-of-thought' }), className)} />
);

// AssistantMessageMarkdownLink.tsx
export interface AssistantMessageMarkdownLinkProps extends Omit<LinkProps, 'href' | 'size' | 'asChild'> {
  /** Already allow-listed by the renderer: http(s), mailto or relative. */
  href: string;
  /** 'chain-of-thought' → 12px, otherwise 14px. Default 'answer'. */
  variant?: AssistantMessageMarkdownVariant;
}
/** Markdown link: the DS `Link`, inline so it wraps. Absolute URLs open in a new tab without opener or referrer.
 *  For in-app paths override `a` with your router's link: a plain href reloads the page. */
export const AssistantMessageMarkdownLink: FC<AssistantMessageMarkdownLinkProps> = ({
  href, variant = 'answer', className, 'data-testid': testIdProp, ...props
}) => {
  const external = /^(?:https?:)?\/\//i.test(href);
  return (
    <Link target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} {...props}
      href={href} size={variant === 'chain-of-thought' ? 'sm' : 'md'} data-slot='assistant-message-markdown-link'
      data-testid={useTestId('link', testIdProp)} className={cn(assistantMessageMarkdownLinkVariants(), className)} />
  );
};

// AssistantMessageMarkdownCodeBlock.tsx
export interface AssistantMessageMarkdownCodeBlockProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  code: string;
  /** The fence info string (`yaml`, `json`, `bash`, `http`…). The app's adapter resolves aliases; unknown → plain. */
  language?: string;
  /** false while the fence is still open in a streaming answer: plain text (no re-highlight per token) and no
   *  copy button. Default true. */
  complete?: boolean;
}
/** Markdown fenced code (Figma 181:3500: no header, no line numbers, mono 12/20) with a floating copy button.
 *  Highlighting follows the app's `CodeSnippetAdapterProvider`; without one the code is plain.
 *  The test id goes on the snippet, so its parts cascade: `…--code-block--copy-button`. */
export const AssistantMessageMarkdownCodeBlock: FC<AssistantMessageMarkdownCodeBlockProps> = ({
  ref, code, language, complete = true, className, 'data-testid': testIdProp, ...props
}) => (
  <div {...props} ref={ref} data-slot='assistant-message-markdown-code-block'
    className={cn(assistantMessageMarkdownCodeBlockVariants(), className)}>
    <CodeSnippetRoot code={code} language={complete && language ? language : 'text'} data-testid={useTestId('code-block', testIdProp)}>
      {complete && (
        <CodeSnippetActions>
          <CodeSnippetCopyButton />
        </CodeSnippetActions>
      )}
      <CodeSnippetContent>
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </div>
);

// AssistantMessageMarkdownTable.tsx
export interface AssistantMessageMarkdownTableProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
}
/** Markdown table: the DS table frame and cells (`Table/classes`) on a plain `<table>`. Not in Figma. */
export const AssistantMessageMarkdownTable: FC<AssistantMessageMarkdownTableProps> = ({
  ref, className, children, 'data-testid': testIdProp, ...props
}) => (
  <div {...props} ref={ref} data-slot='assistant-message-markdown-table' data-testid={useTestId('table', testIdProp)}
    className={cn(tableContainerVariants(), assistantMessageMarkdownTableVariants(), className)}>
    <table className={assistantMessageMarkdownTableGridVariants()}>{children}</table>
  </div>
);
```
- **Imports, all relative inside the DS:** `../CodeSnippet`, `../Link`, `../Table/classes`, `../../utils/cn` and `../../utils/testId`.
- **Each part** sets `displayName`.
- **Type-only import cycle.** The parts import `type AssistantMessageMarkdownVariant` from `./AssistantMessageMarkdown`. That cycle is type-only, so it is erased at runtime.

### 9.5 Exports and dependencies
- **`AssistantMessage/index.ts`:**
  - `AssistantMessageMarkdown`, plus the types `AssistantMessageMarkdownComponents`, `AssistantMessageMarkdownProps` and `AssistantMessageMarkdownVariant`;
  - the four parts, each with its `…Props` type.
- **`src/index.ts`:** the same names, in the barrel unit (§13). The `@wallarm-org/design-system/AssistantMessage` subpath comes for free.
- **`package.json`:** `"marked": "18.1.1"` and `"remend": "1.4.0"` under `dependencies`, then run `pnpm install` at the repo root.
- **Other edits:**
  - In `CodeSnippet/adapters/index.ts`, change the Prism size comment to "~25KB".
  - `metadata` is regenerated by `build`.

### 9.6 React Compiler
- **Render is pure.** No refs are read or written during render, and nothing mutates props. `lexMarkdown` pops from a fresh local array, so it changes nothing it was given.
- **`memo` with a comparator is allowed.** Precedents: `TableRow` and `OverflowList`.
- **What the compiler sees.** The module-level `renderBlock`/`renderInline` are plain functions, so the compiler doesn't compile them. The compiler memoizes the root and `Block` (the merged map keys on `components`). The comparator keeps the behaviour correct even without the compiler, because it compares the consumer's `components` identity rather than the merged map.
- **Overrides render as components.** Elements are created as `<c.x>`, so hooks inside overrides are legal.
- **No `'use no memo'`.** `compiler:audit` must report no bailouts in the new files.

## 10. Tests (Rstest + RTL; find elements by `data-testid`; `getByRole` only for a11y)

**`AssistantMessage/lib/markdown.test.ts`** (pure):
1. **Only the tail changes.** For every prefix of `WALLY_ANSWER`, every block except the last equals `lexMarkdown(full, false)` at the same index.
2. **Pending tail.**
   - Dropped: `| a | b |`, `| a | b |\n|--`, `` ``` `` and `` ```ya ``.
   - Becomes a `table` token: a full delimiter row.
   - Becomes `code`: a fence followed by at least one character of code.
3. **Repair is tail-only and streaming-only.**
   - `'Path /var/log/*.log\n\nNext **bo'`: the first block is unchanged and the last block becomes `Next **bo**`.
   - `streaming=false` repairs nothing: `glob *.yaml` stays as written.
   - `(*.example.com)` produces no `em` token.
4. **`isClosedFence`:**

   | Input | Result |
   |---|---|
   | ```` ```yaml\nx ```` | false |
   | ```` ```yaml\nx\n``` ```` | true |
   | ```` ````\nx\n``` ```` | false (closing fence too short) |
   | `~~~\nx\n~~~` | true |
   | indented code | true |
   | ```` ```\nx\n```js ```` | false |
5. **`safeHref`:** the §6 matrix, plus the allowed `#x`, `./x`, `x/y`, `//host`, `mailto:a@b.co` and `https://…` with surrounding spaces.
6. **`decodeEntities`:** `&amp; &lt;b&gt; &quot; &nbsp;` are decoded; `&copy;` is left untouched.

**`AssistantMessage/AssistantMessageMarkdown.test.tsx`:**
1. **Elements.** Render `<AssistantMessage data-testid='m'><AssistantMessageContent><AssistantMessageMarkdown text={WALLY_ANSWER} />…` and check:
   - `h2`, `strong`, `em` and `del`;
   - every `m--inline-code`;
   - `m--table` with 3 `th[scope=col]` and the alignment classes;
   - `ol[start]` and a nested `ul`;
   - task items: the sr-only checkbox `checked` and the Checkmark `data-state`;
   - `blockquote` and `role=separator`;
   - `m--link` with `target`/`rel`, and an autolink;
   - `m--code-block` and `m--code-block--copy-button`.
2. **Streaming snapshots.** An `it.each` over t1, t4, t4b, t5, t5c, t6, t6b and t7 (§1) asserts the "Renders" column. A second pass with `streaming={false}` shows t4 as a literal `**3 att`, which proves repair happens only while streaming.
3. **No flash.** For every prefix of `WALLY_ANSWER` with `streaming` on:
   - no literal `**` or backtick appears outside `code`/`pre`;
   - there is no empty `h1`–`h6`, `p` or `blockquote`, and no empty code block. Empty `li` is excluded (the known `- [` leftover).
4. **Memo.** Use a module-scope `components` map with counting `h2` and `blockquote` overrides and re-render more than 200 growing prefixes. The `h2` renders only while it is the tail, plus exactly once after `streaming={false}`.
5. **Open fence.** A spy on `codeBlock` receives `complete=false` until the closing fence arrives, then `true`. The copy button is absent while the fence is open and present after it closes.
6. **Variant.** With `chain-of-thought`, inline code has no `data-ds-suppress-parent-click` (it is not copyable) and has the `text-text-secondary` class. The link has the `text-xs` class.
7. **Link + code.** In ``[`x`](https://a.example)``, the inline code inside the anchor is not copyable.
8. **XSS (DOM).** The §6 matrix: no `script`, `img`, `iframe` or `[onerror]`; every `a[href]` passes `safeHref`; `<script>`/`<img…>` show as text. A `<br>` in a table cell becomes a `br`.
9. **Overrides.**
   - A spy `a` receives the allow-listed `href`, the children and `variant`.
   - The other defaults keep their slots.
   - An `img` override receives only a safe `src`.
10. **Parts.** Each part's `ref` reaches its root element, and a consumer `data-testid` replaces the slot id.

**`WallyAssistant/views/ChatViews.test.tsx`:**
- Replace "uses the default labels and plain-text markdown without a provider" with "…and the DS markdown without a provider". Use `approval({ content: 'Run **x**' })` and assert that `card--content` contains a `strong` with text `x`.
- Add a test: with the provider default, assistant text `**a**` renders a `strong`, and a custom `markdown` still takes precedence.
- The existing 300-message perf test (with its counting `markdown`) stays as it is.

**`AssistantMessage/AssistantMessage.analytics.test.tsx`:**
- An `a` override that wraps `AssistantMessageMarkdownLink` puts `data-analytics-id` and a byte-identical `data-analytics-props` on the `<a>`.
- Same check for `inlineCode`, landing on the `<code>`.

**Gates** (all run with `pnpm --filter @wallarm-org/design-system`):
- `exec rstest run src/components/AssistantMessage src/components/WallyAssistant`
- `exec tsc --build tsconfig.app.json --noEmit` (the `typecheck` script is a no-op)
- `lint`
- `compiler:audit`
- Run E2E in CI only: push with `[update-screenshots]`, then check the bot commit for unrelated flaky baselines and restore them from main.

## 11. Stories and e2e (no wrapper components; the story source is the MCP example)

**`AssistantMessage.stories.tsx`.** Fixtures `WALLY_ANSWER`, `COT_TEXT` and `HOSTILE` are module-level string constants: data, not components.

| Story | What it renders |
|---|---|
| `Markdown` | `<CodeSnippetAdapterProvider adapter={loadPrismAdapter}><AssistantMessage data-testid='markdown'><AssistantMessageContent><AssistantMessageMarkdown text={WALLY_ANSWER} /></AssistantMessageContent></AssistantMessage></CodeSnippetAdapterProvider>`. The answer has an h2, bold/italic/strike, inline code (IPs, paths, rule ids), an IP/Type/Hits table with alignment, nested ordered and unordered lists, a task list, a ```` ```json ```` fence, a quote, an hr, a docs link and an autolink. |
| `MarkdownStreaming` | Four static `<AssistantMessage aria-busy>` blocks, using the t4, t5c, t6 and t7 strings with `streaming` on. Test ids: `streaming-bold`, `streaming-table`, `streaming-fence`, `streaming-link`. No timers. |
| `MarkdownInChainOfThought` | `<ChainOfThought data-testid='cot-markdown'><ChainOfThoughtStep label='Thought for 5s' icon={<Brain />} defaultOpen><AssistantMessageMarkdown variant='chain-of-thought' text={COT_TEXT} /></ChainOfThoughtStep></ChainOfThought>`, per Figma 494:4292: paragraphs, a medium sub-heading, a list, muted inline code. |
| `MarkdownUnsafeContent` | `HOSTILE` rendered inert. |
| `MarkdownCustomElements` | A module-scope `components` map with two entries: `a` wraps `AssistantMessageMarkdownLink` and adds `data-analytics-id='wally.answer.link'`; `img` renders `<img>` only for one allow-listed host. |

Also update `DESCRIPTION`: "`AssistantMessageContent` spaces and styles markdown blocks; put `AssistantMessageMarkdown` inside it (WallyAssistant's default) or your own renderer's output."

**`WallyAssistant.stories.tsx`:**
- Delete `StoryMarkdown`, its three `markdown={StoryMarkdown}` props, and the sentence about it in the description.
- The panel now renders with the default renderer, so the approval's ```` ```json ```` mock becomes a CodeSnippet.

**`AssistantMessage.e2e.ts`.** Add `'Markdown'`, `'Markdown Streaming'`, `'Markdown In Chain Of Thought'`, `'Markdown Unsafe Content'` and `'Markdown Custom Elements'` to `createStoryHelper('ai-assistantmessage', …)`.

| Group | Tests |
|---|---|
| Visual | <ul><li>"Should render the markdown elements correctly": first wait for `markdown--code-block` to contain a visible `.text-syntax-string`, as the CodeSnippet Prism stories do.</li><li>"Should render partial markdown while streaming correctly"</li><li>"Should render markdown in the chain of thought correctly"</li><li>"Should render unsafe markdown as inert text correctly": also assert 0 `img` elements.</li></ul> |
| Interactions | "Should copy the code block when the copy button is clicked" (`markdown--code-block--copy-button`) |
| Accessibility | <ul><li>"Should be reachable via Tab key for links and the copy button": the focus ring is visible on `markdown--link`.</li><li>"Should expose table headers via the columnheader role"</li></ul> |

The WallyAssistant e2e baselines will change, because the approval fence is now a CodeSnippet. Regenerate them in CI.

## 12. Amendments to spec v2
- **Header "Unchanged: … no new dependencies":** this now has an exception, marked and remend, for the DS renderer.
- **Decision 14:** "No new dependencies, except `marked@18.1.1` and `remend@1.4.0` for the DS markdown renderer (22.2 KB gz). `use-stick-to-bottom` is still not added. The DS owns presentational markdown; the app can still replace `markdown`."
- **§1 owner table:** the App no longer owns "markdown parsing" by default.
- **§2.2:** in the row "Message (assistant) / MessageResponse (Streamdown)", the right-hand side becomes "`AssistantMessageMarkdown` (the default `markdown`)". In the "Sources, InlineCitation" row, citations stay app-side through `markdown` + `messageId`/`partId`.
- **§5.1:** the defaults list says `AssistantMessageMarkdown` instead of "plain-text Markdown", and the new `ChatViewConfig.markdown` JSDoc goes in.
- **§10.1:** drop `WallyMarkdown`, `CotInlineCode` and `markdown={WallyMarkdown}`.
- **§11.1:** drop `StoryMarkdown`.
- **§12:** the rows for 91:1156/21:4517 and 494:4292 now say `AssistantMessageMarkdown` (`variant='chain-of-thought'`) instead of "app renderer".
- **§14 (§11 out of scope):** remove "no markdown renderer" from the kept list.

## 13. Work plan, gates and prototype
| Unit | Scope | When |
|---|---|---|
| M1 | Both deps; `lib/markdown.ts` and its tests; the renderer, parts and classes, with unit and analytics tests; `AssistantMessage/index.ts`; the h5/h6 selector | It can run in parallel with the in-flight workflow in its own worktree, because it touches no `*.stories.tsx` and nothing in `WallyAssistant/`. |
| M2 | `views/ChatViewContext.ts`/`views/ChatViewProvider.tsx` wiring; `views/ChatViews.test.tsx`; the `model/model.ts` JSDoc; the `ANALYTICS_GAPS.md` row | After the ChatPanel→WallyAssistant rename lands |
| M3 | Stories (AssistantMessage, WallyAssistant); e2e; the `src/index.ts` barrel (only this unit edits it, as in spec v2); the spec v2 amendments; the Prism size comment; a CI `[update-screenshots]` run | After the stories workflow lands |

**Prototype (scratch, outside the repo):**
- DS-shaped source, checked with strict `tsc`, including `ComponentType<ChatMarkdownProps>` compatibility: `/private/tmp/claude-501/-Users-ilyapashkov-orca-workspaces-wallarm-design-system-feat-ai-components/346510f7-388f-4f71-8314-5045e2b1ded3/scratchpad/md-research/spec-proto/ds/src/components/AssistantMessage/`
- Checks (prefix stability, flash counts, memo counts, XSS, fuzz, bench): `/private/tmp/claude-501/-Users-ilyapashkov-orca-workspaces-wallarm-design-system-feat-ai-components/346510f7-388f-4f71-8314-5045e2b1ded3/scratchpad/md-research/spec-proto/ds/check/`
- CopilotKit / AG-UI sources: `/private/tmp/claude-501/-Users-ilyapashkov-orca-workspaces-wallarm-design-system-feat-ai-components/346510f7-388f-4f71-8314-5045e2b1ded3/scratchpad/md-research/src-client/src__apply__default.ts`, `…/src-core/src__v2__components__chat__CopilotChatAssistantMessage.tsx`, `…/ag-ui-core-1.0.2/package/dist/version-DEKfpZNa.d.ts`

## 14. Risks
- **Bundle.** WallyAssistant gets about +30 KB gz: 22.2 KB for the engine and about 7.7 KB of DS parts the default renderer reaches. Apps that pass their own `markdown` still ship marked and remend, because the default is a static import. A lazy default would flash plain text on the first message, so I rejected it.
- **Heuristics.** The dangling strip and the pending-tail holdback can each hide content for 1–3 frames. The prefix-flash test pins this down, and the ceiling is noted in a `ponytail:` comment.
  - With italic repair off, a real `*italic*` shows its opening `*` until the closer arrives.
  - remend still repairs `**`, which can bold the rest of the tail block in exotic prose like `2**10`, until that block finishes.
- **Upstream changes.**
  - A marked major release can change the token shape. Mitigations: an exact pin, the walker's switch is typed against `MarkedToken`, and the DOM test suite.
  - remend is Vercel-owned with a single npm maintainer, though it has provenance. The fallback is a hand-written `repairTail` (P1) behind `lexMarkdown`, with no API change.
- **Edge cases.**
  - A reference link whose definition arrives after its use stays literal until the stream ends.
  - A table cell with an unescaped `|` inside backticks splits the cell, per the GFM spec.
  - A paragraph made only of pipe-delimited lines is hidden while streaming.
- **CodeSnippet weight.** Each code block mounts a portal host plus a ScrollArea, and each copyable inline chip mounts a Tooltip. Long threads with dozens of code blocks or chips cost DOM nodes and memory; the cost is paid once per block, thanks to memoization.
- **Design gaps** (provisional styles): h1/h2 sizes, `strong` weight, links, blockquote, table, task list, hr, the code-block copy button and language label. Figma 20:258 lists "tables / text styles / code snippet / separator" only as a to-do.
- **Existing DS issues this exposes, to fix separately:**
  - `Link` has `outline-none` and no focus ring, DS-wide;
  - `CodeSnippetRoot` flickers while re-highlighting;
  - the Prism size JSDoc is wrong;
  - the Prism adapter maps no YAML key tokens;
  - copyable inline code isn't reachable by keyboard (`<code>` isn't focusable).
- **Navigation.** Relative links do a full page load unless the app overrides `a` with its router's link.

## 15. Open questions
Q1–Q9 are listed in the `openQuestions` field.

## Appendix: why not the other options
- **Streamdown:** 161.8 KB, because rehype-raw/parse5 can't be dropped. It also ships its own chrome (copy/download, table menus, link-safety modal) and Tailwind classes that clash with the DS.
- **react-markdown:** 53.4 KB with remend. It has no streaming support, its public override types are hast types, and re-parsing is about 20× slower (14 ms against 0.67 ms on 8.4 KB).
- **markdown-to-jsx:** 28.3 KB. It parses raw HTML into elements by default, has loosely typed overrides, and a single maintainer.
- **A hand-written parser:** rejected. CommonMark nesting, lazy continuation and GFM tables are exactly what marked does in 13.8 KB.
