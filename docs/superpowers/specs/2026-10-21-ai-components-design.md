# Wally AI components: final spec (v1)

> **Superseded in part by** [`2026-10-21-ai-chat-architecture-v2.md`](./2026-10-21-ai-chat-architecture-v2.md) and [`2026-10-22-ai-chat-markdown-addendum.md`](./2026-10-22-ai-chat-markdown-addendum.md). Where they disagree, the later doc wins.

**Winner:** P1, the composition-first proposal. Pieces from P2 and P3 are grafted on, along with fixes found by checking the repo and the CopilotKit 1.79.1 tarballs.

**Size:** 8 folders, 29 exported parts, one new CSS utility, no new dependencies *(Amended by addendum A: `marked`, `remend`)*. There are no CopilotKit or AG-UI types in the DS.

**Integration model:** CopilotKit is used **only through its headless hooks, in the app**. The app reads data and callbacks from the hooks and passes them into these presentational components as props (section 5).


## ⚠️ User decisions (2026-10-21), override anything below

1. **ChainOfThought** is its own component (`<ol>`/`<li>` + `utils/Collapse`), not built on Tree, TreeBase or the Ark tree-view. **Tree, TreeBase and TreeView are not touched at all.**
2. **Send button** is disabled when the trimmed value is empty (and while `disabled`).
3. **UserMessage** toggles **Show more / Show less** both ways. Add a `showLessLabel` prop next to `showMoreLabel`, and update `aria-expanded` on the toggle. "Show less" is removed from the out-of-scope list.
4. **Animated background:** add a **separate chat colour variant** for the background, sourced from Figma chat-bg 67:1254 (`Property 1=Main` / `Property 1=Chat`). Add it as a new variant/prop of BlurBackground, or as a chat-specific component in the `Chat` folder.
   - The **existing BlurBackground default look must stay pixel-identical**, so its screenshot baselines don't change.
   - The `--lg-frame-bg` fix stays backward compatible.
5. **Defaults for the remaining open questions** (no further user input needed):
   - **Reasoning:** use the new 409:3853 CoT-row variant.
   - **Message actions:** thumbs show `aria-pressed` with a `bg-states-primary-active` background. Copy swaps to Check through `Copyable`.
   - **ApprovalCard:** has no outer margins. Stories show it both inline and docked above the input.
   - **Esc** stops the stream only while the ChatInput textarea is focused.
   - **Timestamps** are the app's job (`metadata.createdAt`). `WallyAssistant` formats it through `formatTimestamp`, which defaults to DS `formatRelativeTime`. *(Amended by v2 §14.)*
   - **Drawer-trigger mascot:** out of scope; use the existing `WallyIcon`.
   - **ChatInput `context` bar** is included, as in Figma Variant2.
   - **Code Connect** uses Figma fileKey `bsqgrzkpIB2yPVlNpgU8jN` (Wally — AI Assistant). URL format: `https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=<id-with-dash>`.

6. **AI Assistant trigger button (Figma 101:1034, "button to trigger drawer")** is now **in scope**, as `ChatTrigger` in the `Chat` folder.
   - It is a ghost small icon `Button` (24px) that holds the Wally mascot (`WallyIcon`).
   - It is wrapped in a `Tooltip` whose text is **"Ask Wally"**. The `label` prop defaults to `'Ask Wally'` and is used as both the tooltip text and the `aria-label`.
   - It is dumb: `onClick` and the open state belong to the consumer (`aria-expanded` passes through via rest props).
   - It shares a trigger id, so it composes under `DrawerTrigger asChild`.

---

## 0. Decisions and verified fixes

| # | Decision | Evidence (checked in the repo or the npm tarballs) |
|---|---|---|
| 1 | `ChainOfThought` is a separate component. `Tree` stays as it is. | `Tree.tsx`, `TreeItem.tsx` and `TreeItemIcon.tsx` set geometry with inline `style` (gap, left, paddingLeft). The rail is one full-height line masked with `bg-bg-page-bg`, so it breaks over the chat background. The collapsible `TreeItemHeader` spreads `{...props}`/`ref` on a wrapper div, and its inner `<button>` has no `aria-expanded`/`aria-controls`. Every item calls `useTestId('item')`. Tree's only consumer is the `src/index.ts` export, and it has 7 screenshot baselines. `TreeBase` is neither exported nor imported anywhere. |
| 2 | Header separators are sized with `*:data-[orientation=vertical]:…`. | `Separator` renders `data-orientation` and has **no** `data-slot`. |
| 3 | The background is `BlurBackground` inside an absolutely positioned wrapper, with a new `--lg-frame-bg` variable. | `.lg-frame { position: relative; background: #ffffff }` is unlayered CSS in `theme/components/animated-background.css`, so it overrides Tailwind's `absolute` and `bg-*` utilities. With opacity applied, the white frame would cover the dark theme with a 12% white veil. |
| 4 | Permissions use Popover + Switch rows (from P2). | A Switch inside `role=menuitem` is nested interactive content. `DropdownMenuCheckboxItem` can only show a Check indicator. Popover supports `ids` for the shared trigger. |
| 5 | Tooltip + Popover/DropdownMenu triggers share one trigger id. | Precedent in `Table/TableColumnMenu.tsx`. Without it, the tooltip opens at the viewport origin (warning in the `Tooltip.tsx` docs). |
| 6 | The app imports some helpers from subpaths, not the barrel. | `formatRelativeTime` only exists at `@wallarm-org/design-system/utils/formatDateTime`. `CodeSnippet*` and `InlineCodeSnippet` only exist at `@wallarm-org/design-system/CodeSnippet`. Neither is in `src/index.ts`. |
| 7 | Story ids look like `ai-chatinput`, `ai-chainofthought`, and so on. | Existing helpers follow the same form: `actions-splitbutton`, `inputs-inputgroup`. |
| 8 | CopilotKit facts used by the adapter. | See the list below this table. |
| 9 | No `flex-col-reverse` pinning (P2's approach). | A short greeting sinks to the bottom, and content shifts under someone reading during streaming. `ChatBody` exposes `ref` instead; stick-to-bottom ships in `Conversation` (v2 §4.1, amended by v2 §14). |
| 10 | Reasoning ("Thought for 5s") is a `ChainOfThoughtStep`. | In the newer Figma 409:3853 it is a CoT nested row. The 91:1011 header (Brain + label + trailing chevron) and the 31:483 dot bullets are superseded. |

CopilotKit facts behind row 8:
- `/v2/headless` exports useAgent, useCopilotKit, useSuggestions, useConfigureSuggestions, useHumanInTheLoop, useInterrupt, useRenderTool, useRenderToolCall, useThreads, useAgentContext and useFrontendTool. It does **not** export `useDefaultRenderTool`.
- The HITL `render` is a `React.ComponentType`.
- `useHumanInTheLoop` goes through `useFrontendTool` into `copilotkit.renderToolCalls`, so `useRenderToolCall()` returns the HITL element without CopilotChat.
- `ToolCallRenderer` adds no wrapper DOM.
- `useInterrupt` defaults to `renderInChat: true`, so the app needs `false`.
- `copilotkit.runAgent({agent})` and `copilotkit.stopAgent({agent})`.
- `agent.isRunning`, `agent.addMessage()`, and `agent.subscribe({...})`, which returns `.unsubscribe`.
- `ToolCallStatus` and `CopilotKitProvider` are exported from `@copilotkit/react-core/v2`.

---

## 1. Shared conventions (every new folder)

**Files**
- Location: `packages/design-system/src/components/<Family>/`.
- One `<Part>.tsx` per exported part.
- `classes.ts` holds one `cva` per part (Timeline style), with variants only where listed below.
- `index.ts`: `export { X, type XProps } from './X'`.
- `<Family>.stories.tsx`, `<Family>.test.tsx`, `<Family>.analytics.test.tsx` (as in FileUpload), `<Family>.e2e.ts`, and `<Family>Context.ts` where noted.
- `.figma.ts` files come in unit U11.

**Parts**
- Each part has a kebab-case `data-slot`, a `displayName` and a `ref` prop (React 19, no forwardRef).
- Use `cn()` and named exports.
- Tokens only. No inline styles; the only style writes are the existing `useAutoResize` height and BlurBackground internals.
- Defaults are written before `{...rest}` so consumers can override them (`aria-label`, `placeholder`).

**Test ids**
- `Chat` is the only plain root: it renders `data-testid` and wraps children in `TestIdProvider`.
- Sub-roots can render on their own or inside another cascade. Each one does `const testId = useTestId('<slot>', props['data-testid'])`, renders it, and re-provides it, as TimelineItem does:
  - `ChatInput` → `input`
  - `ChatPermissions` → `permissions`
  - `ApprovalCard` → `approval-card`
  - `UserMessage` → `user-message`
  - `AssistantMessage` → `assistant-message`
  - `MessageActions` → `actions`
  - `ChainOfThought` → `chain-of-thought`
  - `ChainOfThoughtStep` → `step` (re-provided around its nested content only)
- So inside `<Chat data-testid='chat'>` the textarea is `chat--input--textarea`; a standalone `<ChatInput data-testid='composer'>` gives `composer--textarea`.
- Leaves call `useTestId('<slot>', props['data-testid'])`, so a consumer-supplied id wins.
- Repeated parts (pills, actions, steps, messages) share the derived id. Stories and tests pass a per-instance `data-testid`.

**Analytics** (rules in `docs/metrics/contract.md`)
- Every interactive target is either the root or an exported part.
- Props use the element-specific attribute type.
- `{...rest}` and `ref` land on the real node.
- Internal handlers run **after** the consumer's handler and return early on `event.defaultPrevented` (as in FilterCascade and FileUpload).
- No `stopPropagation`, no analytics props, no slotProps.
- The one auto-rendered interactive default has a seam: `UserMessageBubble.showMore`.
- No `ANALYTICS_GAPS.md` is needed in the L1 folders. The closed `WallyAssistant` has one: `WallyAssistant/ANALYTICS_GAPS.md` (v2 §6.5). *(Amended by v2 §14.)*

**React Compiler**
- No ref reads in render.
- DOM measurement and focus only in effects or handlers.
- Controlled/uncontrolled uses `open ?? internalOpen` with `useState` (the TreeItem pattern), not `useControlled`.

**State**
- Only UI-local state: `UserMessageBubble` expanded/overflowing, `ChainOfThoughtStep` open.
- Everything else comes in as props.
- No `message`, `respond`, `agent`, zod or AG-UI shapes.

**Storybook**
- Title is `AI/<Family>`.
- `import type { Meta, StoryFn } from 'storybook-react-rsbuild'` with `satisfies Meta<typeof X>`.
- A `DESCRIPTION` constant plus a one-line JSDoc per story.
- `data-testid` on every root.
- An `Analytics` story per family showing where `data-analytics-id` lands.

---

## 2. Foundation: theme and docs (unit U1)

1. **`src/theme/utilities/shimmer-text.css`.** Import it in `theme/index.css` after `code-snippet-bg.css`. This is the only new CSS.
```css
@utility shimmer-text {
  background-image: linear-gradient(90deg, var(--color-text-secondary) 0%, --alpha(var(--color-text-secondary) / 20%) 50%, var(--color-text-secondary) 100%);
  background-size: 200% 100%;
  background-clip: text;
  color: transparent;
  animation: ds-shimmer-text 2s linear infinite;
  @media (prefers-reduced-motion: reduce), (forced-colors: active) {
    animation: none;
    background-image: none;
    color: var(--color-text-secondary);
  }
}
@keyframes ds-shimmer-text { from { background-position: 200% 0; } to { background-position: -200% 0; } }
```
   - Matches the Figma 469:341 gradient (#62748e → 20% → #62748e, which is the text-secondary token).
   - Timing follows the 21st.dev hextaui shining-text default.

2. **`theme/components/animated-background.css`.** Change the frame background to `.lg-frame { background: var(--lg-frame-bg, #ffffff); }`. This is backward compatible and changes no existing baselines.

3. **Docs.**
   - `docs/e2e-test-rules.md`: add an Epic row `| AI | AI |`.
   - `.claude/skills/new-component/SKILL.md`: add a category row `| AI | Wally assistant: chat panel, messages, chain of thought |`.

---

## 3. Components

### 3.1 `Chat` (folder `Chat`)

Figma: 2:42, 44:1464, 44:1738, 8:3101, 91:1167, 67:1254.

| Part | Element | data-slot | testId |
|---|---|---|---|
| Chat | `<section aria-label='Wally chat'>`; its first child is the decorative background | chat | root |
| ChatHeader | `<header>` | chat-header | header |
| ChatHeaderTitle | `<div>` with WallyIcon built in | chat-header-title | title |
| ChatHeaderActions | `<div>` (Figma SLOT 8:3078 / 44:1517) | chat-header-actions | actions |
| ChatBody | `<div role='log' aria-label='Chat messages'>`, the scroll element | chat-body | body |
| ChatFooter | `<div>`, the panel gutter for suggestions, a docked approval card and the input | chat-footer | footer |
| ChatGreeting | `<div>` | chat-greeting | greeting |
| ChatSuggestions | `<div role='group'>`; provides `{ size }` through `ChatSuggestionsContext.ts` | chat-suggestions | suggestions |
| ChatSuggestion | `<button type='button'>` (interactive) | chat-suggestion | suggestion |

```ts
interface ChatProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
  /** Figma chat-bg 67:1254: 'strong' = Main (12%, empty chat), 'subtle' = Chat (5%). Default 'subtle'. */
  background?: 'strong' | 'subtle' | 'none';
}
interface ChatHeaderProps extends HTMLAttributes<HTMLElement> { ref?: Ref<HTMLElement> }
/** No children → Figma Default ("Ask Wally"). Children → Figma Variant2: WallyIcon + '/' + children (e.g. thread Select). */
interface ChatHeaderTitleProps extends HTMLAttributes<HTMLDivElement> { ref?: Ref<HTMLDivElement> }
interface ChatHeaderActionsProps extends HTMLAttributes<HTMLDivElement> { ref?: Ref<HTMLDivElement> }
/** Consumer passes aria-busy={isRunning}. For stick-to-bottom use Conversation/ConversationContent, which render ChatBody (v2 §4.1). API unchanged. */
interface ChatBodyProps extends HTMLAttributes<HTMLDivElement> { ref?: Ref<HTMLDivElement> }
interface ChatFooterProps extends HTMLAttributes<HTMLDivElement> { ref?: Ref<HTMLDivElement> }
interface ChatGreetingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> { ref?: Ref<HTMLDivElement>; title: ReactNode }
interface ChatSuggestionsProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** 'footer' (default) = 91:1167, right-aligned Medium pills. 'greeting' = 44:1706, centered Large pills. */
  placement?: 'footer' | 'greeting';
  /** Visible label (Figma 'Suggestions'); also the group's accessible name. */
  label?: ReactNode;
}
interface ChatSuggestionProps extends ButtonHTMLAttributes<HTMLButtonElement>, TestableProps { ref?: Ref<HTMLButtonElement> }
```

`classes.ts` (exact):
- **chatVariants:** `relative isolate flex h-full min-h-0 flex-col overflow-hidden bg-bg-page-bg`.
  - No border: the host owns the panel edge (Figma `border-l border-primary-light`).
- **chatBackgroundVariants:** base `pointer-events-none absolute inset-0 -z-1`; `background: { strong: 'opacity-12', subtle: 'opacity-5' }`.
  - Markup: `<div aria-hidden data-slot='chat-background' className=…><BlurBackground className='size-full [--lg-frame-bg:transparent]' /></div>`.
  - Import from `../AnimatedBackground/blur`.
  - The existing `.lg-blob` rule already pauses the animation under reduced motion.
  - `isolate` on the root plus `-z-1` keeps the background under all in-flow content.
- **chatHeaderVariants:** `flex h-48 shrink-0 items-center justify-between gap-8 border-b border-border-primary-light bg-bg-page-bg pl-16 pr-12`.
  - The header is opaque, so the background bleeding under it doesn't show through.
- **chatHeaderTitleVariants:** `flex min-w-0 items-center`. Content:
  - Always `<WallyIcon variant='simple' size='md' aria-hidden className='shrink-0' />` (24px).
  - No children: `<span className='ml-8 truncate text-sm text-text-primary'>Ask <span className='font-mono font-medium text-text-brand'>Wally</span></span>`.
    - "Ask " is Sans 14/20 primary. "Wally" is Mono medium in #ff441c, which is the text-brand token.
  - With children: `<span aria-hidden className='pl-12 pr-4 text-sm font-medium text-text-secondary'>/</span>{children}`.
    - This is the Figma `_bc-joint`, with a 0 gap before the select.
- **chatHeaderActionsVariants:** `flex shrink-0 items-center gap-4 *:data-[orientation=vertical]:mx-2 *:data-[orientation=vertical]:h-16 *:data-[orientation=vertical]:self-center`.
  - A plain `<Separator orientation='vertical' />` then matches the Figma 5×16 box.
- **chatBodyVariants:** `flex min-h-0 flex-1 flex-col overflow-y-auto px-16 pt-12 pb-16`.
  - No gap between messages: the 30px actions row is the gap (Figma y 60 → 134).
  - Resulting edges: UserMessage's `pr-16` puts the bubble 32px from the panel edge, and AssistantMessage's `px-8` puts the text 24px from it.
- **chatFooterVariants:** `flex shrink-0 flex-col gap-16 px-20 pb-4`.
  - Figma: 20px input gutter, 16px between suggestions and the input, 4px under the disclaimer.
- **chatGreetingVariants:** `flex flex-col items-center gap-24 pt-103`.
  - The block top lands at 163px: 48 header + 12 body padding + 103.
  - Content: `<div className='flex flex-col items-center gap-12'><WallyIcon variant='circle' size='xl' aria-hidden /><Text asChild size='xl' weight='medium' color='primary' align='center'><h2>{title}</h2></Text></div>{children}`.
  - Text xl is 18/28 Sans-display. The DS medium weight is 450, against Figma's 500; use the token.
- **chatSuggestionsVariants:** base `flex flex-col`; `placement: { footer: 'items-end gap-8', greeting: 'items-center gap-12' }`.
  - When `label` is set, render `<p id={labelId} className="font-mono text-xs text-text-secondary [font-feature-settings:'liga'_0]">` and point the root's `aria-labelledby` at it.
  - Without a label, the root gets `aria-label='Suggestions'` (overridable).
- **chatSuggestionVariants:**
  - Base: `inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-border-primary bg-transparent font-mono font-normal text-text-primary outline-none transition-colors [font-feature-settings:'liga'_0] not-disabled:hover:border-border-brand not-disabled:hover:bg-bg-light-brand not-disabled:hover:text-text-brand focus-visible:ring-3 focus-visible:ring-focus-brand disabled:cursor-not-allowed disabled:opacity-50`.
  - Sizes: `size: { md: 'rounded-8 px-8 py-2 text-xs', lg: 'rounded-12 px-12 py-4 text-sm' }`. `md` is Figma Medium (h20, 12/16); `lg` is Large (h28, 14/20).
  - The size comes from context: greeting → `lg`; footer or standalone → `md`.
  - Hover is Figma 8:3102 / 52:809. Focus isn't drawn in Figma, so it uses brand to match the hover.
- Write class strings that contain `'liga'` in double quotes, as `Stepper/classes.ts` does.

Recipes (stories; the consumer composes these):
- **Header actions:** Figma Default (2:42) is History, Ellipsis (with a DropdownMenu), `<Separator orientation='vertical'/>`, Close. Variant2 (44:1465) is Plus, Separator, History, Ellipsis, Separator, Close.
  - Every action is `<Button variant='ghost' color='neutral' size='small' aria-label>` with an icon from `src/icons`.
  - When the chat is hosted in a DS Drawer, Close can be `<DrawerClose />`.
- **Variant2 title:** `<ChatHeaderTitle><Select …><SelectButton variant='ghost' size='small' placeholder='New chat' /><SelectPositioner>…</SelectPositioner></Select></ChatHeaderTitle>`.
- **Host:** DS `Drawer` on the right, 480 wide, with `<Chat>` filling `DrawerContent`.
- **App-header trigger** (101:1034): `Tooltip 'Ask Wally'` > `Button ghost neutral small aria-label='Ask Wally'` > `WallyIcon size='md'`.

### 3.2 `ChatInput` (folder `ChatInput`)

Figma: 26:602 (Default and Variant2), 74:1822 states, 26:540, 26:656.

| Part | Element | data-slot | testId |
|---|---|---|---|
| ChatInput | `<form>` | chat-input | `input` (sub-root) |
| context bar (internal, only when `context` is set) | `<div>` | chat-input-context | context |
| box (internal) | `<div>` | chat-input-box | box |
| disclaimer (internal) | `<p id>` | chat-input-disclaimer | disclaimer |
| ChatInputTextarea | `<textarea rows={1}>` | chat-input-textarea | textarea |
| ChatInputSubmit | DS `Button` inside a Tooltip | chat-input-submit | submit |

**Children order inside the box:**
1. `ChatInputTextarea`
2. Optional left-hand actions, such as `ChatPermissions` or a future mode button
3. `ChatInputSubmit`

The box is `flex-wrap`, so the textarea (`basis-full`) takes row 1, the actions sit on row 2, and the submit is pushed right with `ms-auto`. No Footer or Actions parts are needed.

```ts
interface ChatInputProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>, TestableProps {
  ref?: Ref<HTMLFormElement>;
  value: string;                              // controlled only — the app owns the draft
  onValueChange: (value: string) => void;
  /** Receives value.trim(). Not called when empty / isRunning / disabled. Root preventDefaults and refocuses the textarea. */
  onSubmit: (value: string) => void;
  /** Stop-button click, and Esc in the textarea while isRunning. */
  onStop?: () => void;
  /** Send ↔ stop swap; blocks submit. CopilotKit: agent.isRunning. */
  isRunning?: boolean;
  disabled?: boolean;
  /** Attached-context chips → Figma Variant2 (blue bar behind the box). Pass undefined when there are none. */
  context?: ReactNode;
  /** Default 'Wally can make mistakes; always verify.'; null hides it. */
  disclaimer?: ReactNode;
}
interface ChatInputTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue'>, TestableProps {
  ref?: Ref<HTMLTextAreaElement>;   // defaults: placeholder 'Ask Wally...', aria-label 'Message Wally'
}
interface ChatInputSubmitProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children' | 'color'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
  sendLabel?: string;   // 'Send'
  stopLabel?: string;   // 'Stop response' (Figma tooltip 87:1038)
}
```

`ChatInputContext.ts` provides `{ value, onValueChange, isRunning, disabled, onStop, disclaimerId }`.

`classes.ts`:
- **chatInputVariants:** `flex flex-col gap-4`. The disclaimer sits 4px under the box (Figma 90 → 94).
- **chatInputContextVariants:** `flex flex-col rounded-16 border border-border-info bg-bg-light-info`.
  - Chips row: `flex flex-wrap items-center gap-6 px-12 pt-8 pb-6`, a 34px strip (Figma 26:656).
  - The box is the bar's last child.
- **chatInputBoxVariants:**
  - Base: `flex flex-wrap items-center gap-x-6 gap-y-24 rounded-16 border border-border-primary px-11 pt-9 pb-11 transition-[border-color,box-shadow] motion-reduce:transition-none hover:border-component-border-input-hover has-[textarea:focus]:border-component-border-input-hover has-[textarea:focus]:shadow-none has-[textarea:focus]:ring-3 has-[textarea:focus]:ring-focus-primary`.
  - Empty height is 1 + 9 + 20 + 24 + 24 + 11 + 1 = **90**, matching Figma.
  - The ring shows only while the textarea is focused, so tabbing to a button doesn't double the ring (as in InputGroup).
  - `withContext` is derived from `context != null`: `{ false: 'bg-component-input-bg shadow-xs', true: '-mx-px -mb-px bg-bg-surface-1 shadow-sm' }`.
  - `disabled: { true: 'pointer-events-none opacity-50' }`.
- **chatInputTextareaVariants:** `w-full basis-full resize-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary disabled:cursor-not-allowed [scrollbar-width:thin]` (14/20 regular).
- **chatInputDisclaimerVariants:** `text-center text-xs text-text-secondary` (12/16).

**Submit button.** DS `Button size='small'`, icon-only (24×24, rounded-8), `className='ms-auto'`.
- Idle: `variant='primary' color='brand'`, icon `ArrowUp`, `type='submit'`, `aria-label={sendLabel}`, `disabled={disabled || !value.trim()}`.
- Running: `variant='secondary' color='neutral'`, icon `CircleStop`, `type='button'`, `aria-label={stopLabel}`.
- Always wrapped in `<Tooltip disabled={!isRunning}>` with content `{stopLabel} <Kbd>Esc</Kbd>`. This is the DrawerClose precedent, and TooltipContent already styles a Kbd. Because the wrapper is always there, the button keeps its DOM node and focus across the swap.

**Behaviour**

Textarea:
- Auto-grows with `useAutoResize(true, 1, 8, value)` from `../Textarea/useAutoResize`, using `composeRefs(autoRef, ref)`.
- `onChange`: run the consumer's handler, then `onValueChange(e.target.value)`.
- `onKeyDown`: run the consumer's handler first.
  - Return early when `e.defaultPrevented`, `e.nativeEvent.isComposing`, or `e.keyCode === 229` (Safari IME).
  - Enter without Shift: `preventDefault()`, then `e.currentTarget.form?.requestSubmit()`.
  - Escape while running: `onStop?.()`.
  - Shift+Enter keeps the native newline.
- `aria-describedby` points at the disclaimer id, merged with any consumer value.

Submit:
- `onClick`: run the consumer's handler, then `if (!e.defaultPrevented && isRunning) onStop?.()`.

Form:
- `onSubmit`:
  1. `preventDefault()`.
  2. `text = value.trim()`.
  3. Return if `!text || isRunning || disabled`.
  4. Call `onSubmit(text)`.
  5. Run `e.currentTarget.querySelector('textarea')?.focus()`, so focus isn't lost when the cleared value disables Send.
- Don't nest `ChatInput` inside another `<form>`.

**Recipes**
- **Settings:** `<ChatPermissions>` (3.3) as a child between the textarea and the submit. Render it only when the allow-list is non-empty (172:1846).
- **Context chip** (26:657): `<Badge type='secondary' color='blue'><Quote />Attacks<TagClose aria-label='Remove Attacks' className='rounded-4 focus-visible:ring-3 focus-visible:ring-focus-primary' onClick={…} /></Badge>`. Badge medium is h20 with 12px icons; TagClose renders `X size='sm'`.

### 3.3 `ChatPermissions` (folder `ChatPermissions`)

Figma: 172:1851, 174:2164, 26:538, 174:2055.

| Part | Element | data-slot | testId |
|---|---|---|---|
| ChatPermissions | No DOM. `Popover` root plus context `{ triggerId }` | — | `permissions`, passed to Popover, so its trigger/content get `--trigger` / `--content` |
| ChatPermissionsTrigger | `<button>` | chat-permissions-trigger | trigger |
| ChatPermissionsContent | PopoverContent (`role=dialog`) | chat-permissions-content | content |
| ChatPermissionsItem | Switch root `<label>` (interactive) | chat-permissions-item | item |

```ts
interface ChatPermissionsProps extends TestableProps { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }
interface ChatPermissionsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;   // aria-label default 'Permission settings' (= tooltip text); children default <Settings2 />
}
interface ChatPermissionsContentProps extends Omit<PopoverContentProps, 'minWidth' | 'maxWidth'> {
  label?: ReactNode;              // 'Always allowed in this conversation'
}
interface ChatPermissionsItemProps extends Omit<SwitchProps, 'children'> {
  title: ReactNode;               // tool name, e.g. 'propose_add_to_denylist'
  description?: ReactNode;
}
```

- **Root.**
  - `const triggerId = useId();`
  - Render `<Popover data-testid={testId} ids={{ trigger: triggerId }} positioning={{ placement: 'top-start', gutter: 8 }} open={open} onOpenChange={onOpenChange}>`.
- **Trigger.**
  - `const { open } = usePopoverContext()` (from Ark).
  - Render `<Tooltip disabled={open} ids={{ trigger: triggerId }}><PopoverTrigger asChild><TooltipTrigger asChild><Button {...rest} ref={ref} variant='ghost' color='neutral' size='small' aria-label={ariaLabel}>{children ?? <Settings2 />}</Button></TooltipTrigger></PopoverTrigger><TooltipContent>{ariaLabel}</TooltipContent></Tooltip>`.
  - The nesting order follows TableColumnMenu.
- **Content.**
  - Render `<PopoverContent minWidth='320px' maxWidth='320px' aria-labelledby={labelId} className={cn('gap-1 p-8', className)}><p id={labelId} className={dropdownMenuLabelVariants()}>{label}</p>{children}</PopoverContent>`.
  - Import `dropdownMenuLabelVariants` from `../DropdownMenu/classes`. It gives px-8 pt-8 pb-2 xs medium secondary, which is the 26px Figma label row.
  - PopoverContent already provides rounded-12, shadow-md, border and bg-surface-2.
- **Item.**
  - Render `<Switch {...rest} data-testid={useTestId('item', rest['data-testid'])} className={cn('w-full items-start justify-between gap-4 rounded-6 px-8 py-6 hover:bg-states-primary-hover', className)}><span className='flex min-w-0 flex-1 flex-col'><SwitchLabel>{title}</SwitchLabel>{description != null && <span className='truncate text-xs text-text-secondary'>{description}</span>}</span><SwitchControl /></Switch>`.
  - The row is 48px. Title is 14/20 primary; description is 12/16 secondary and truncates. The switch is 34×20.
  - Because there's no `[data-part=description]`, the DS Switch's grid branch stays off and the flex overrides merge.
  - Changes apply immediately, with no Save button (181:2603). The popover stays open.
- **Disabled tools** go below `<Separator spacing={4} />`, rendered by the consumer (the 9px Figma separator item). The app owns the order: enabled first, disabled after.

### 3.4 `ApprovalCard` (folder `ApprovalCard`)

Figma: 171:1673 (Default / Approved / Rejected), 171:1647, 171:1670, 168:2721, 182:4099.

| Part | Element | data-slot | testId |
|---|---|---|---|
| ApprovalCard | `<div role='group' aria-labelledby={captionId}>` | approval-card | `approval-card` (sub-root) |
| caption (internal) | `<p id>` | approval-card-caption | caption |
| pending surface (internal, wraps children) | `<div>` | approval-card-surface | surface |
| resolved status (internal) | `<div role='status'>` | approval-card-status | status |
| ApprovalCardContent | `<div>` | approval-card-content | content |
| ApprovalCardActions | `<div>` | approval-card-actions | actions |

```ts
type ApprovalCardStatus = 'pending' | 'approved' | 'rejected';
interface ApprovalCardProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  status?: ApprovalCardStatus;        // default 'pending'
  caption?: ReactNode;                // 'Requires your approval' — shown in every state (Figma)
  approvedLabel?: ReactNode;          // 'Approved'
  rejectedLabel?: ReactNode;          // 'Rejected'
}
interface ApprovalCardContentProps extends HTMLAttributes<HTMLDivElement> { ref?: Ref<HTMLDivElement> }
interface ApprovalCardActionsProps extends HTMLAttributes<HTMLDivElement> { ref?: Ref<HTMLDivElement> }
```

- **Gating.** The root renders `children` only while pending. Once resolved, it renders the status surface instead, so the parts need no gating of their own.
- **No horizontal padding.** The Figma `px-20` is the panel gutter (ChatFooter / ChatBody).
- **No loading variant.** During `inProgress` the consumer disables its own buttons.

`classes.ts`:
- **approvalCardVariants:** `flex flex-col`.
- **approvalCardCaptionVariants:** `px-16 py-2 font-mono text-xs text-text-secondary [font-feature-settings:'liga'_0]` (h20, code/sm).
- **approvalCardSurfaceVariants:** base `rounded-16 border border-border-primary-light`.
  - `status.pending`: `bg-bg-surface-2`.
  - `status.approved` / `status.rejected`: `flex h-44 items-center gap-8 bg-bg-light-primary px-12 text-sm text-text-secondary`.
- **approvalCardStatusIconVariants:** `status: { approved: 'text-icon-success', rejected: 'text-icon-danger' }`, applied to `<Check size='md'/>` and `<X size='md'/>`.
- **approvalCardContentVariants:** `flex flex-col gap-8 px-16 pt-12 text-sm text-text-primary break-words`. Text and an optional CodeSnippet sit 8px apart.
- **approvalCardActionsVariants:** `flex flex-wrap items-center gap-8 px-16 py-12`.
- Pending height is 12 + 20 + 12 + 36 + 12 = 92, plus the 2px CSS border.

**Actions recipe** (182:4099; same DropdownMenu-around-SplitButton nesting as SplitButton.stories):
```tsx
<ApprovalCardActions>
  <DropdownMenu positioning={{ placement: 'bottom-end' }}>
    <SplitButton>
      <Button onClick={allowSession}>Always allow in this session</Button>
      <DropdownMenuTrigger asChild><Button aria-label='More approval options'><ChevronDown /></Button></DropdownMenuTrigger>
    </SplitButton>
    <DropdownMenuContent><DropdownMenuItem onSelect={allowOnce}>Allow once</DropdownMenuItem></DropdownMenuContent>
  </DropdownMenu>
  <Button variant='secondary' color='neutral' onClick={reject}>Reject</Button>
</ApprovalCardActions>
```
- `Button` defaults to primary / brand / large, which is the 36px Figma height.
- **Content recipe** (171:1790): text, then `<CodeSnippetRoot code={…}><CodeSnippetContent><CodeSnippetCode /></CodeSnippetContent></CodeSnippetRoot>` from `@wallarm-org/design-system/CodeSnippet`.

### 3.5 `UserMessage` (folder `UserMessage`)

Figma: 26:737 (Default / Show more), 26:711, 299:1888, 300:1973.

| Part | Element | data-slot | testId |
|---|---|---|---|
| UserMessage | `<article aria-label='You'>` | user-message | `user-message` (sub-root) |
| UserMessageBubble | `<div>` | user-message-bubble | bubble |
| text (internal) | `<div id tabIndex={-1}>` | user-message-text | text |
| fade strip (internal) | `<div>` | user-message-fade | — |
| UserMessageShowMore | `<button type='button'>` | user-message-show-more | show-more |

```ts
interface UserMessageProps extends HTMLAttributes<HTMLElement>, TestableProps { ref?: Ref<HTMLElement> }
interface UserMessageBubbleProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Rendered over the fade when text overflows 11 lines. Default <UserMessageShowMore />; pass your own instance for data-* (analytics seam); null = none. */
  showMore?: ReactNode;
}
interface UserMessageShowMoreProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;      // children default 'Show more'
}
```

`classes.ts`:
- **userMessageVariants:** `group/message flex flex-col items-end pr-16`. The `pr-16` is part of the Figma component.
- **userMessageBubbleVariants:** `relative max-w-375 rounded-16 bg-bg-light-brand px-16 text-sm text-text-primary`, with `clamped: { true: 'pt-12 pb-28', false: 'py-12' }`.
  - A single line is 44px tall. The long collapsed example is 12 + 220 + 28 = 260.
- **userMessageTextVariants:** `whitespace-pre-wrap break-words outline-none`, plus `clamped: { true: 'line-clamp-11' }`.
- **userMessageFadeVariants:** `pointer-events-none absolute inset-x-0 bottom-0 h-36 rounded-b-16 bg-linear-to-t from-bg-light-brand from-60% to-transparent`. It uses the token, so dark mode works.
- **userMessageShowMoreVariants:** `pointer-events-auto absolute top-8 left-16 cursor-pointer rounded-4 text-xs text-text-secondary outline-none transition-colors hover:text-text-primary focus-visible:ring-3 focus-visible:ring-focus-primary`.

**Behaviour**
- **State.** `UserMessageBubble` holds `expanded` (default false) and `overflowing` in `useState`.
- **Measuring.** While `!expanded`, an effect checks `el.scrollHeight > el.clientHeight` immediately and again on every `ResizeObserver` callback. Its deps are `[expanded, children]`.
- **Clamping.** `clamped = overflowing && !expanded`. When clamped, the bubble renders the fade strip containing `showMore`.
- **Context.** The bubble provides `{ contentId, expand }`. `expand()` calls `setExpanded(true)` and then focuses the text element with `{ preventScroll: true }`, so focus isn't lost when the button unmounts.
- **ShowMore.**
  - Renders `aria-expanded={false}` and `aria-controls={contentId}`.
  - `onClick` runs the consumer's handler first, then `if (!e.defaultPrevented) expand()`.
  - Outside the bubble's context it renders nothing.
- There is no "Show less" (open question).
- The actions row is a sibling `<MessageActions>` (3.7). Figma Type=User is Timestamp + Copy.

### 3.6 `AssistantMessage` (folder `AssistantMessage`)

Figma: 91:1156, 21:4517.

| Part | Element | data-slot | testId |
|---|---|---|---|
| AssistantMessage | `<article aria-label='Wally'>` | assistant-message | `assistant-message` (sub-root) |
| AssistantMessageContent | `<div>` | assistant-message-content | content |

```ts
interface AssistantMessageProps extends HTMLAttributes<HTMLElement>, TestableProps { ref?: Ref<HTMLElement> }   // consumer sets aria-busy while streaming
interface AssistantMessageContentProps extends HTMLAttributes<HTMLDivElement> { ref?: Ref<HTMLDivElement> }
```

- **assistantMessageVariants:** `group/message flex flex-col items-start gap-4 px-8 [&>[data-slot=chain-of-thought]]:mb-8 [&>[data-slot=message-actions]]:-ms-4`.
  - Chain of thought → answer: 12px. Answer → actions: 4px.
  - The `-ms-4` lines the 24px button's icon up with the text (Figma: actions at x 19, text at x 24).
- **assistantMessageContentVariants:** prose styles for markdown that the consumer has already rendered. There is no markdown engine in the DS. The whole class string is `self-stretch break-words text-sm leading-base text-text-primary [&_:is(h1,h2,h3,h4)]:font-sans-display [&_:is(h1,h2,h3,h4)]:text-base [&_:is(h1,h2,h3,h4)]:font-medium [&>*+*]:mt-8 [&>:is(h1,h2,h3,h4)+*]:mt-4 [&_ul]:list-disc [&_ol]:list-decimal [&_:is(ul,ol)]:ps-21 [&_li]:leading-sm [&_li+li]:mt-4`. What it gives:
  - Paragraphs 14/24.
  - Headings 16/24 medium.
  - 4px from a heading to the next block, 8px between other blocks.
  - Lists 14/20, indented 21px, 4px between items.
- The consumer maps inline code to `InlineCodeSnippet size='sm'` and fenced code to `CodeSnippet`.
- **Composition order** *(amended by v2 §14)*:
  1. Optional `<ChainOfThought>` (reasoning and tools)
  2. Optional `<ApprovalCard>`
  3. `<AssistantMessageContent>`
  4. Optional `<AssistantMessageError>`
  5. `<MessageActions>`
  - `<AssistantMessageLoader>` stands alone, before the first output.

### 3.7 `MessageActions` (folder `MessageActions`)

Figma: 26:726 (User / Wally / None × Default / Hover), 307:2184.

| Part | Element | data-slot | testId |
|---|---|---|---|
| MessageActions | `<div role='group' aria-label='Message actions'>` | message-actions | `actions` (sub-root) |
| MessageAction | DS `Button` inside a Tooltip | message-action | action |
| MessageTimestamp | `<time>` | message-timestamp | timestamp |

```ts
interface MessageActionsProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Force-show (latest answer per 91:1011). Default: revealed on parent hover/focus-within; always shown on hover:none devices. */
  visible?: boolean;
}
interface MessageActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, TestableProps {
  ref?: Ref<HTMLButtonElement>;
  'aria-label': string;              // required: accessible name AND tooltip text
  children: ReactNode;               // icon
}
interface MessageTimestampProps extends TimeHTMLAttributes<HTMLTimeElement>, TestableProps {
  ref?: Ref<HTMLTimeElement>;        // children = pre-formatted text; set dateTime (ISO)
}
```

- **messageActionsVariants:** base `flex h-30 items-center gap-4`.
  - `visible: { false: 'opacity-0 transition-opacity motion-reduce:transition-none group-hover/message:opacity-100 group-focus-within/message:opacity-100 [@media(hover:none)]:opacity-100', true: 'opacity-100' }`.
  - Opacity keeps the 30px row reserved, as in the Figma Default state, so the layout doesn't jump.
  - Hidden buttons stay tabbable, and keyboard focus reveals the row.
  - Alignment comes from the parent: `items-end` in UserMessage, `items-start` in AssistantMessage.
- **MessageAction.** `const autoId = useId(); const triggerId = id ?? autoId;`, then `<Tooltip ids={{ trigger: triggerId }}><TooltipTrigger asChild><Button {...rest} ref={ref} id={triggerId} variant='ghost' color='neutral' size='small' aria-label={ariaLabel} className={cn('aria-pressed:bg-states-primary-active', className)}>{children}</Button></TooltipTrigger><TooltipContent>{ariaLabel}</TooltipContent></Tooltip>`. Composition:
  - An outer `DropdownMenuTrigger asChild` passes its own id, so an Ellipsis menu just works.
  - Copy: wrap in `<Copyable text={…}>` with `<CopyableIcon/>` as the child. Copyable's Slot composes `onClick`, and CopyableIcon swaps Copy → Check.
  - Thumbs up/down: pass `aria-pressed`.
- **messageTimestampVariants:** `whitespace-nowrap font-mono text-xs leading-sm text-text-secondary [font-feature-settings:'liga'_0]`. That is Figma code/sm: 12px with a 20px line-height.
  - `FormatDateTime` isn't reused because it is fixed at sm, has a dashed underline, and takes no className.
  - The app formats the text with `formatRelativeTime` from `/utils/formatDateTime`.
- **Figma order:**
  - User: Timestamp, Copy.
  - Wally: Copy, ThumbsUp, ThumbsDown, Ellipsis, Timestamp.
  - None: render nothing.

### 3.8 `ChainOfThought` (folder `ChainOfThought`)

Figma: 201:1660 chain-item, 206:2189 chain-spacer, 409:3812 layouts, 469:341 shimmer, 483:1899 icon table.

| Part | Element | data-slot | testId |
|---|---|---|---|
| ChainOfThought | `<ol>` | chain-of-thought | `chain-of-thought` (sub-root) |
| ChainOfThoughtStep | `<li>`, plus a row that is a `<button>` when collapsible and a `<div>` otherwise | li: chain-of-thought-step; row: chain-of-thought-step-row | `step` on the **row**; re-provided around nested content |
| nested body (internal) | `Collapse` | chain-of-thought-step-content | — |
| connector (internal) | `<span aria-hidden>` | chain-of-thought-connector | — |

```ts
interface ChainOfThoughtProps extends OlHTMLAttributes<HTMLOListElement>, TestableProps { ref?: Ref<HTMLOListElement> }
interface ChainOfThoughtStepProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'>, TestableProps {
  /** ...rest / ref / className / data-testid land on the ROW (<button> when the step has children, else <div>). Pass ref through mergeRefs(ref) so one callback types-checks on both. */
  ref?: Ref<HTMLElement>;
  label: ReactNode;                  // 'Searched for ABC', 'Working...', 'Thought for 5s', 'Worked for 3m 45s'
  /** 16px type icon. Default <CircleDashed/>. null = Figma "Simple" row (no icon cell, no connector). */
  icon?: ReactNode;
  /** Right-aligned mono slot = Figma "Simple-result". */
  metric?: ReactNode;
  /** 'running' → shimmering label (Figma "Working" / "Verb+ing..."). Default 'done'. */
  status?: 'running' | 'done';
  open?: boolean;
  defaultOpen?: boolean;             // false
  onOpenChange?: (open: boolean) => void;
  /** Nested content (nested <ChainOfThought>, text, inline code). Presence makes the row a collapsible trigger. */
  children?: ReactNode;
}
```

How the Figma `chain-item` variants map to props:
- Type=Nested: give the step `children` and an icon.
- Expanded: `open`.
- Hover: handled by CSS.
- Simple: `icon={null}`.
- Simple-result: `icon={null}` plus `metric`.
- Working: `status='running'`.
- The braille spinner (206:2480) is dropped.
- The "Worked for …" summary row is a step with `icon={<Activity/>}`.

`classes.ts`:
- **chainOfThoughtVariants:** `flex w-full flex-col self-stretch text-xs leading-xs text-text-secondary` (all text 12/16 regular secondary).
- **chainOfThoughtStepVariants:** base `group/step flex flex-col`; `simple: { true: 'not-first:mt-16' }`, so Simple siblings sit 16px apart.
- **chainOfThoughtRowVariants:** base `group/row flex w-full items-start gap-6 text-left`; `interactive: { true: 'cursor-pointer rounded-4 outline-none focus-visible:ring-3 focus-visible:ring-focus-primary' }`.
  - The row is 16px tall. The label wraps, and the icon stays aligned with the first line.
  - The whole line is the trigger (designer annotation). Hover doesn't change the background (Figma).
- **chainOfThoughtIconVariants:** `flex size-16 shrink-0 items-center justify-center text-icon-secondary [&_svg]:icon-md`. Contents depend on state (the TreeItemIcon trick):
  - Collapsible and closed: the type icon inside `inline-flex group-hover/row:hidden group-focus-visible/row:hidden`, followed by `<ChevronDown className='hidden -rotate-90 transition-transform motion-reduce:transition-none group-hover/row:block group-focus-visible/row:block'/>`. Rotated -90°, it reads as chevron-right.
  - Open: `<ChevronDown/>` only, unrotated.
  - Collapsible with `icon={null}`: the chevron is always visible.
- **chainOfThoughtLabelVariants:** base `min-w-0 flex-1`; `status: { running: 'shimmer-text', done: '' }`.
- **chainOfThoughtMetricVariants:** `ms-auto shrink-0 text-right font-mono [font-feature-settings:'liga'_0]`.
- **chainOfThoughtLineVariants:** `flex w-16 shrink-0 justify-center py-2 before:w-px before:bg-border-primary`.
  - A 1px `border-primary` line (Figma; Tree used primary-light), centered under the 16px icon with a 2px gap at each end.
  - **Connector:** `cn(line, 'h-20 group-last/step:hidden')`.
    - Rendered only when `icon !== null` and the step is not both collapsible and open.
    - Row pitch is 16 + 20 = 36. The last step hides it via `last-child`, as Timeline does.
    - There's no background masking, so it works over the animated background.
  - **Nested body:** `<Collapse id={contentId} open={isOpen} inertWhenClosed data-slot='chain-of-thought-step-content'><div className='flex'><span aria-hidden className={line} /><div className={body}><TestIdProvider value={testId}>{children}</TestIdProvider></div></div></Collapse>`.
- **chainOfThoughtBodyVariants:** `flex min-w-0 flex-1 flex-col gap-16 py-12 pl-6 [&_ul]:list-disc [&_ul]:ps-18 [&_:is(h1,h2,h3,h4)]:font-medium`.
  - Nested content is indented 16 + 6 = 22px, matching Figma.
  - For inline code inside nested text, the consumer uses `InlineCodeSnippet copyable={false} size='sm' className='text-text-secondary'` (Figma note 494:4292).

**Behaviour**
- `isOpen = open ?? internalOpen`.
- Row `onClick` (collapsible rows only): run the consumer's handler, then `if (!e.defaultPrevented) { if (open === undefined) setInternalOpen(!isOpen); onOpenChange?.(!isOpen); }`.
- The row carries `aria-expanded` and `aria-controls={contentId}`.
- The `<li>` carries `data-status` and `data-state` (open or closed).
- Nesting is unlimited: pass a `<ChainOfThought>` as a step's children.
- **Each `<li>` must be a direct child of the `<ol>`** for the connector's `last-child` logic to work. Keep HITL cards outside the list.

- Step `status` is `'running' | 'done' | 'error'`. *(Amended by v2 §14.)*

**Type → icon table** (WallyAssistant's internal default since v2; still not exported, and WallyAssistant's `icons` overrides it). Every icon exists in `src/icons`.

| Type | Icon |
|---|---|
| thinking | Brain |
| plan | ListChecks |
| decision | GitBranch |
| subagent | Bot |
| tool | Wrench |
| command | Terminal |
| web search | Globe |
| query | Search |
| datastore | Database |
| api | Plug |
| read | FileText |
| fetch | Download |
| filter | Filter |
| create | FilePlus |
| edit | Pencil |
| cite | Link |
| threat | ShieldAlert |
| scan | Radar |
| pending / default | CircleDashed |
| summary | Activity |
| "Created" example | BadgeCheck |

---

## 4. Tree decision

**Build `ChainOfThought` as its own component. Do not touch `Tree`.** Reasons:
- **Inline styles.** Tree sets its geometry with inline `style`.
- **Masked rail.** Tree draws one full-height line and hides it behind each icon with `bg-bg-page-bg`. That mask fails over the chat's animated background, and the line color doesn't match Figma.
- **Analytics and a11y.** The collapsible header spreads `...props` and `ref` onto a wrapper div. The real `<button>` has no `aria-expanded` or `aria-controls`, which breaks both the metrics contract and a11y.
- **Missing features.** There is no metric slot, no Simple row and no running state.
- **Test ids.** The test-id cascade is flat: every item gets the same `--item` suffix.
- **Cost.** Restyling Tree would churn 7 screenshot baselines for a component with no consumers.

What carries over from Tree:
- `utils/Collapse`, imported directly. Tree, TreeView and CoT now share it.
- The CSS trick that swaps the icon for a rotated chevron on hover.
- The `controlled ?? useState` pattern.

The line is drawn per step, as Timeline does. TreeView is the wrong model too: it is built for selection and keyboard tree navigation, not a read-only log.

Marking Tree `@deprecated` needs your confirmation first. (Update: the dead `TreeBase` has since been removed, with the `tree-base-removed` migration.)

---

## 5. CopilotKit: headless hooks only → DS props (app side)

> *Amended by v2 §14:* the v2 §10.1 mapper (`ChatSnapshot` → `WallyAssistant`) is the default path for the closed panel. The §5.2 adapter below stays valid for custom layouts. The §5.1 rule `toolMessage ? 'done' : isRunning ? 'running' : 'done'` is wrong for HITL tools, because `isRunning` is false during the wait; use v2 §10.1's `toolStatus`.

### 5.1 Mapping table

| CopilotKit headless source | DS prop / part |
|---|---|
| `useAgent().agent.isRunning` | `ChatInput.isRunning`; `ChatBody aria-busy`; `status='running'` on live CoT steps; `MessageActions.visible = isLast && !isRunning` |
| `useAgent().isReady` | `ChatInput.disabled={!isReady}` |
| `agent.messages.length === 0` | render `ChatGreeting` and `Chat background='strong'`; otherwise `'subtle'` |
| `agent.messages[role='user'].content` (string or ContentPart[]) | `UserMessageBubble` children (text parts joined); `Copyable.text` |
| `agent.messages[role='assistant'].content` | `AssistantMessageContent` children (app markdown); `Copyable.text` |
| `assistant.toolCalls[]` + the `role='tool'` message with the matching `toolCallId` | one `ChainOfThoughtStep` per call: `icon` (app map on `function.name`), `label`, `status` (`toolMessage ? 'done' : isRunning ? 'running' : 'done'`), `metric` (derived from the tool `content`) |
| `agent.messages[role='reasoning'].content` | `ChainOfThoughtStep icon={<Brain/>}` with content as children; label `Thinking...` while live, else `Thought for Xs` |
| `subagentRunId` / parent ids | a nested `<ChainOfThought>` as a step's children |
| `message.metadata.createdAt` (stamped by the app or runtime) | `MessageTimestamp` children = `formatRelativeTime(date)`, `dateTime` = ISO |
| `agent.addMessage({role:'user',…})` + `copilotkit.runAgent({agent})` | `ChatInput.onSubmit(value)` and `ChatSuggestion.onClick` |
| `copilotkit.stopAgent({agent})` | `ChatInput.onStop` (button and Esc) |
| app `useState` draft | `ChatInput.value` / `onValueChange` |
| `useSuggestions().suggestions[i].title` | `ChatSuggestion` children |
| `useSuggestions().suggestions[i].message` | sent by `ChatSuggestion.onClick` |
| `useSuggestions().suggestions[i].isLoading` | the app filters these out |
| `useConfigureSuggestions(config)` | availability; the app decides when to show `ChatSuggestions` |
| `useThreads({agentId}).threads[].id/name` | `Select` items inside `ChatHeaderTitle` |
| `useHumanInTheLoop({ render })`, render props `{ name, status, args, respond, result }` | see the HITL breakdown below |
| `useRenderToolCall()({ toolCall, toolMessage })` | returns the registered HITL element; place it in the message (inline) or in `ChatFooter` (docked). `null` means no renderer, so fall back to a `ChainOfThoughtStep` |
| `useInterrupt({ renderInChat: false, render: ({ interrupt, resolve, cancel }) => … })` | the same `ApprovalCard` with `resolve({approved})`; the hook returns the element for the app to place |
| `agent.subscribe({ onRunStartedEvent, onRunFinishedEvent, onReasoningStartEvent, onReasoningEndEvent })` | durations for `ChainOfThoughtStep.label` ("Worked for 3m 45s", "Thought for 5s") |
| app allow-list state, seeded by "Always allow in this session" | `ChatPermissionsItem.checked/onCheckedChange`; render `ChatPermissions` only when the list is non-empty; the HITL card auto-responds for allowed tools |
| app feedback map | `MessageAction aria-pressed` + `onClick` |
| app open-state map (optional) | `ChainOfThoughtStep.open/onOpenChange` |

**HITL breakdown** (`useHumanInTheLoop` render props → `ApprovalCard`):
- **`status`:**
  - `ToolCallStatus.Complete` → `'approved'` or `'rejected'`, from `JSON.parse(result).approved`.
  - Any other status → `'pending'`.
- **`args`** → `ApprovalCardContent`.
- **`respond`:**
  - Every button gets `disabled={!respond}`.
  - "Always allow in this session" → `respond({approved:true, scope:'session'})`.
  - "Allow once" → `respond({approved:true, scope:'once'})`.
  - "Reject" → `respond({approved:false})`.

### 5.2 Sample adapter (app code, not in the DS)

```tsx
// apps/<console>/src/wally/WallyChat.tsx
// App root, once: <CopilotKitProvider runtimeUrl='/api/copilotkit' enableInspector={false} showIntelligenceIndicator={false}>
//   (from '@copilotkit/react-core/v2'; context only). Never import CopilotChat*/CopilotSidebar/CopilotPopup/
//   CopilotThreadsDrawer or '@copilotkit/react-core/v2/styles.css'.
import { type ComponentProps, createContext, useContext, useEffect, useState } from 'react';
import type { AbstractAgent } from '@ag-ui/client';
import type { ToolMessage } from '@ag-ui/core';
import { type ReactHumanInTheLoop, ToolCallStatus } from '@copilotkit/react-core/v2';
import { useAgent, useCopilotKit, useHumanInTheLoop, useRenderToolCall, useSuggestions } from '@copilotkit/react-core/v2/headless';
import { z } from 'zod';
import {
  ApprovalCard, ApprovalCardActions, ApprovalCardContent, AssistantMessage, AssistantMessageContent, Button,
  ChainOfThought, ChainOfThoughtStep, Chat, ChatBody, ChatFooter, ChatGreeting, ChatHeader, ChatHeaderActions,
  ChatHeaderTitle, ChatInput, ChatInputSubmit, ChatInputTextarea, ChatPermissions, ChatPermissionsContent,
  ChatPermissionsItem, ChatPermissionsTrigger, ChatSuggestion, ChatSuggestions, Copyable, CopyableIcon,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, MessageAction, MessageActions,
  MessageTimestamp, Separator, SplitButton, UserMessage, UserMessageBubble,
} from '@wallarm-org/design-system';
import { Activity, Brain, ChevronDown, History, ThumbsDown, ThumbsUp, Wrench, X } from '@wallarm-org/design-system/icons';
import { formatRelativeTime } from '@wallarm-org/design-system/utils/formatDateTime';
import { Markdown } from './Markdown';                        // app renderer: `code` → InlineCodeSnippet, ``` → CodeSnippet ('@wallarm-org/design-system/CodeSnippet')
import { TOOL_ICON, toolLabel, toolMetric } from './tools';  // app tables: Figma 483:1899 type→icon, -ing/-ed wording

const HITL_TOOLS = new Set(['propose_add_to_denylist']);
const Permissions = createContext({ allowed: {} as Record<string, boolean>, allow: (_tool: string) => {} });

const textOf = (c: string | { type: string; text?: string }[]) =>
  typeof c === 'string' ? c : c.flatMap(p => (p.type === 'text' && p.text ? [p.text] : [])).join('\n');
const isApproved = (result: string) => { try { return JSON.parse(result)?.approved === true; } catch { return false; } };
// AG-UI messages carry no time: stamp metadata.createdAt on addMessage (ask the runtime to do the same for replies).
const timeOf = (m: { metadata?: Record<string, unknown> }) => formatRelativeTime(new Date(Number(m.metadata?.createdAt ?? Date.now())));

// HITL card. CopilotKit's `render` is a React component → hooks are allowed; keep it module-level (stable identity).
const DenylistArgs = z.object({ ip: z.string(), reason: z.string() });
type DenylistProps = ComponentProps<ReactHumanInTheLoop<z.infer<typeof DenylistArgs>>['render']>;

function DenylistApproval({ name, status, args, respond, result }: DenylistProps) {
  const { allowed, allow } = useContext(Permissions);
  const auto = allowed[name] === true;                      // "Always allow in this session" already granted
  useEffect(() => { if (auto) void respond?.({ approved: true, scope: 'session' }); }, [auto, respond]);
  const cardStatus = status === ToolCallStatus.Complete ? (isApproved(result) ? 'approved' : 'rejected') : auto ? 'approved' : 'pending';
  return (
    <ApprovalCard status={cardStatus}>
      <ApprovalCardContent>Add {args.ip} to denylist on all applications — reason: {args.reason}</ApprovalCardContent>
      <ApprovalCardActions>
        <DropdownMenu positioning={{ placement: 'bottom-end' }}>
          <SplitButton>
            <Button disabled={!respond} data-analytics-id='wally.approval.allow-session'
              onClick={() => { allow(name); void respond?.({ approved: true, scope: 'session' }); }}>
              Always allow in this session
            </Button>
            <DropdownMenuTrigger asChild>
              <Button disabled={!respond} aria-label='More approval options'><ChevronDown /></Button>
            </DropdownMenuTrigger>
          </SplitButton>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => void respond?.({ approved: true, scope: 'once' })}>Allow once</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant='secondary' color='neutral' disabled={!respond} onClick={() => void respond?.({ approved: false })}>Reject</Button>
      </ApprovalCardActions>
    </ApprovalCard>
  );
}

// "Worked for …": no durations on the protocol → measure in the app (extend with onReasoningStart/EndEvent for "Thought for Xs").
function useRunSeconds(agent: AbstractAgent) {
  const [seconds, setSeconds] = useState<number>();
  useEffect(() => {
    let startedAt = 0;
    return agent.subscribe({
      onRunStartedEvent: () => { startedAt = Date.now(); setSeconds(undefined); },
      onRunFinishedEvent: () => setSeconds(Math.round((Date.now() - startedAt) / 1000)),
    }).unsubscribe;
  }, [agent]);
  return seconds;
}

export function WallyChat({ onClose }: { onClose: () => void }) {
  const { agent, isReady } = useAgent({ throttleMs: 50 });
  const { copilotkit } = useCopilotKit();
  const { suggestions } = useSuggestions();
  const renderToolCall = useRenderToolCall();
  const runSeconds = useRunSeconds(agent);
  const [draft, setDraft] = useState('');
  const [allowed, setAllowed] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});

  useHumanInTheLoop({ name: 'propose_add_to_denylist', description: 'Add an IP to the denylist', parameters: DenylistArgs, render: DenylistApproval });

  const { messages, isRunning } = agent;
  const lastId = messages.at(-1)?.id;
  const ready = suggestions.filter(s => !s.isLoading);
  const resultOf = (id: string) => messages.find((m): m is ToolMessage => m.role === 'tool' && m.toolCallId === id);
  const send = (text: string) => {
    agent.addMessage({ id: crypto.randomUUID(), role: 'user', content: text, metadata: { createdAt: Date.now() } });
    setDraft('');
    void copilotkit.runAgent({ agent });
  };
  const tools = Object.keys(allowed);
  const toggle = (t: string) => ({ checked }: { checked: boolean }) => setAllowed(a => ({ ...a, [t]: checked }));

  return (
    <Permissions.Provider value={{ allowed, allow: t => setAllowed(a => ({ ...a, [t]: true })) }}>
      <Chat background={messages.length ? 'subtle' : 'strong'} data-testid='wally'>
        <ChatHeader>
          <ChatHeaderTitle />
          <ChatHeaderActions>
            <Button variant='ghost' color='neutral' size='small' aria-label='History'><History /></Button>
            <Separator orientation='vertical' />
            <Button variant='ghost' color='neutral' size='small' aria-label='Close' onClick={onClose}><X /></Button>
          </ChatHeaderActions>
        </ChatHeader>

        <ChatBody aria-busy={isRunning}>
          {messages.length === 0 ? (
            <ChatGreeting title='Hi Artem! How can I assist you?'>
              <ChatSuggestions placement='greeting' label='Suggestions'>
                {ready.map(s => <ChatSuggestion key={s.title} onClick={() => send(s.message)}>{s.title}</ChatSuggestion>)}
              </ChatSuggestions>
            </ChatGreeting>
          ) : messages.map(m => {
            const isLast = m.id === lastId;
            if (m.role === 'user') {
              const text = textOf(m.content);
              return (
                <UserMessage key={m.id} data-testid={`msg-${m.id}`}>
                  <UserMessageBubble>{text}</UserMessageBubble>
                  <MessageActions>
                    <MessageTimestamp>{timeOf(m)}</MessageTimestamp>
                    <Copyable text={text}><MessageAction aria-label='Copy'><CopyableIcon /></MessageAction></Copyable>
                  </MessageActions>
                </UserMessage>
              );
            }
            if (m.role === 'reasoning') {
              const thinking = isRunning && isLast;
              return (
                <AssistantMessage key={m.id}>
                  <ChainOfThought>
                    <ChainOfThoughtStep icon={<Brain />} status={thinking ? 'running' : 'done'} label={thinking ? 'Thinking...' : 'Thought'}>
                      <Markdown>{m.content}</Markdown>
                    </ChainOfThoughtStep>
                  </ChainOfThought>
                </AssistantMessage>
              );
            }
            if (m.role !== 'assistant') return null;            // 'tool' results are folded into their step
            const calls = m.toolCalls ?? [];
            const steps = calls.filter(tc => !HITL_TOOLS.has(tc.function.name));
            return (
              <AssistantMessage key={m.id}>
                {steps.length > 0 && (
                  <ChainOfThought>
                    {steps.map(tc => {
                      const res = resultOf(tc.id);
                      const done = Boolean(res) || !isRunning;
                      return (
                        <ChainOfThoughtStep key={tc.id} icon={TOOL_ICON[tc.function.name] ?? <Wrench />}
                          status={done ? 'done' : 'running'} label={toolLabel(tc.function.name, done)}
                          metric={res ? toolMetric(res.content) : undefined} />
                      );
                    })}
                    {isLast && (isRunning
                      ? <ChainOfThoughtStep label='Working...' status='running' />
                      : <ChainOfThoughtStep icon={<Activity />} label={`Worked for ${runSeconds ?? 0}s`} />)}
                  </ChainOfThought>
                )}
                {calls.filter(tc => HITL_TOOLS.has(tc.function.name))   /* or collect pending ones and dock them in ChatFooter (Figma) */
                  .map(tc => renderToolCall({ toolCall: tc, toolMessage: resultOf(tc.id) }))}
                {m.content && <AssistantMessageContent><Markdown>{m.content}</Markdown></AssistantMessageContent>}
                {m.content && (
                  <MessageActions visible={isLast && !isRunning}>
                    <Copyable text={m.content}><MessageAction aria-label='Copy'><CopyableIcon /></MessageAction></Copyable>
                    <MessageAction aria-label='Good response' aria-pressed={feedback[m.id] === 'up'} data-analytics-id='wally.feedback.up'
                      onClick={() => setFeedback(f => ({ ...f, [m.id]: 'up' }))}><ThumbsUp /></MessageAction>
                    <MessageAction aria-label='Bad response' aria-pressed={feedback[m.id] === 'down'}
                      onClick={() => setFeedback(f => ({ ...f, [m.id]: 'down' }))}><ThumbsDown /></MessageAction>
                    <MessageTimestamp>{timeOf(m)}</MessageTimestamp>
                  </MessageActions>
                )}
              </AssistantMessage>
            );
          })}
        </ChatBody>

        <ChatFooter>
          {messages.length > 0 && !isRunning && ready.length > 0 && (
            <ChatSuggestions>
              {ready.map(s => <ChatSuggestion key={s.title} onClick={() => send(s.message)}>{s.title}</ChatSuggestion>)}
            </ChatSuggestions>
          )}
          <ChatInput value={draft} onValueChange={setDraft} onSubmit={send} isRunning={isRunning}
            onStop={() => copilotkit.stopAgent({ agent })} disabled={!isReady}>
            <ChatInputTextarea data-analytics-id='wally.input' />
            {tools.length > 0 && (
              <ChatPermissions>
                <ChatPermissionsTrigger />
                <ChatPermissionsContent>
                  {tools.filter(t => allowed[t]).map(t => <ChatPermissionsItem key={t} title={t} checked onCheckedChange={toggle(t)} />)}
                  {tools.some(t => allowed[t]) && tools.some(t => !allowed[t]) && <Separator spacing={4} />}
                  {tools.filter(t => !allowed[t]).map(t => <ChatPermissionsItem key={t} title={t} checked={false} onCheckedChange={toggle(t)} />)}
                </ChatPermissionsContent>
              </ChatPermissions>
            )}
            <ChatInputSubmit data-analytics-id='wally.send' />
          </ChatInput>
        </ChatFooter>
      </Chat>
    </Permissions.Provider>
  );
}
```

### 5.3 Adapter gotchas (all verified in 1.79.1)

- **Provider.** `CopilotKitProvider` is context only. Set `enableInspector={false}` (the dev Inspector is on by default on localhost) and `showIntelligenceIndicator={false}`.
- **Interrupts.** `useInterrupt` defaults to `renderInChat: true`, which publishes into the CopilotChat we don't mount. Use `false`.
- **Status comparisons.** Statuses are values of the `ToolCallStatus` enum. Compare against the enum; TypeScript rejects string literals.
- **`useRenderToolCall` results.** It returns `null` for unrendered tools, and it adds no DOM wrapper.
- **Keep `render` stable.** Unstable `render` references re-register the tool. Use a module-level component plus app context.
- **Re-renders.** `useAgent` re-renders on every update. Use `throttleMs` during streaming.
- **Grouping.** Grouping a whole run (reasoning, tool calls and text between two user messages) into one `AssistantMessage` is app logic. The sample maps per message.

---

## 6. Analytics forwarding (per interactive target)

| Target | Real node | Seam | Test |
|---|---|---|---|
| ChatSuggestion | `<button>` | the part itself | id on the button + verbatim props |
| ChatInputTextarea | `<textarea>` | the part | id + props; consumer `onKeyDown`/`onChange` still fire; `preventDefault` stops Enter-submit |
| ChatInputSubmit | `<button>` | the part | id survives the send→stop swap (state persistence); consumer `onClick` composed |
| ChatPermissionsTrigger | `<button>` | the part | id + props; `asChild` chain (Tooltip + PopoverTrigger) keeps it on the button |
| ChatPermissionsItem | Switch root `<label>` | the part | label-root click resolution with `captureAnalyticsClicks`; negative check that the id is not on the hidden input |
| UserMessageShowMore | `<button>` | auto-rendered, substituted through `UserMessageBubble.showMore` | custom instance's id lands on the button; consumer `preventDefault` cancels the expand |
| MessageAction | `<button>` | the part (also works inside `Copyable` and `DropdownMenuTrigger asChild`) | id on the button; polymorphic `asChild` case |
| ChainOfThoughtStep (collapsible) | row `<button>` | the part (rest goes on the row) | id on the button, **not** the `<li>`; survives open/close |
| ApprovalCard actions, header buttons, Select, Tag/TagClose | consumer DS components | composition | covered by those components |

---

## 7. Stories (all `AI/*`, `data-testid` on roots, JSDoc per story)

| Title | Stories |
|---|---|
| AI/MessageActions | User, Wally (with Ellipsis DropdownMenu), Visible, Pressed feedback, Analytics |
| AI/UserMessage | Short, Multiline (preserved whitespace), Long collapsed (Show more), With actions, Custom show more (Analytics) |
| AI/AssistantMessage | Answer prose (heading, paragraph, list with InlineCodeSnippet), With reasoning (collapsed and expanded), With actions visible, Streaming (`aria-busy`) |
| AI/ChainOfThought | Basic (icon steps + connectors), Nested (collapsible, nested-in-nested), Simple rows, Simple result (metric), Working (shimmer), Worked summary (whole run collapsed under "Worked for 3m 45s"), Rich text content (paragraphs, bullets, inline code), Type icons (docs table), Controlled, Analytics |
| AI/ChatInput | Default, Typing, Streaming (stop + tooltip), Disabled, With context (Variant2 chips), With settings (ChatPermissions trigger), No disclaimer, Analytics |
| AI/ChatPermissions | All on, Some off (separator), Analytics |
| AI/ApprovalCard | Pending, Pending long text, Pending with code snippet, Allow once menu, Loading (buttons disabled), Approved, Rejected, Analytics |
| AI/Chat (U8) | Header default, Header with thread select, Greeting, Suggestions (footer and greeting), Backgrounds (strong, subtle, none), Analytics |
| AI/Chat (U10) | Empty panel, Conversation, Streaming, Approval docked, Approval resolved, Permissions, In Drawer |

---

## 8. Tests

**Unit tests** (Rstest + RTL + user-event; locate by `data-testid`, use `getByRole` only for a11y assertions)
- **MessageActions**
  - Role and label.
  - Tooltip shows the `aria-label` on hover.
  - `aria-pressed` passes through.
  - Inside `Copyable`, a click copies, the icon swaps, and the consumer `onClick` still fires.
  - As `DropdownMenuTrigger asChild`, the menu opens and the tooltip trigger id equals the button id.
  - Test-id cascade (`--actions--action`, `--actions--timestamp`).
  - `<time dateTime>`.
- **UserMessage**
  - No show-more when content fits.
  - With mocked overflow (`scrollHeight > clientHeight`), show-more renders and `aria-controls` points at the text.
  - Clicking expands, removes the clamp and the button, and moves focus to the text.
  - Consumer `preventDefault` cancels the expand.
  - A custom `showMore` instance is used.
  - `showMore={null}` renders nothing.
- **AssistantMessage**
  - `data-slot`, test id, default `aria-label` and override.
  - Children render.
- **ChainOfThought**
  - A static step renders a `div` row with no button.
  - A step with children renders a button with `aria-expanded=false` and `aria-controls` pointing at the content.
  - Toggling works: controlled `open` with `onOpenChange`, `defaultOpen`, and inert collapsed content.
  - `icon={null}` renders no icon cell and no connector.
  - The metric renders.
  - `status='running'` sets `data-status` and the shimmer class.
  - No connector on an open step.
  - Nested test ids cascade as `{step}--chain-of-thought--step`.
  - Consumer `preventDefault` stops the toggle.
- **ChatInput**
  - Typing calls `onValueChange`.
  - Enter submits the trimmed value and refocuses the textarea.
  - Shift+Enter does not submit. IME composition (`isComposing` and keyCode 229) does not submit.
  - An empty value disables the button, and Enter is a no-op.
  - When `isRunning`: the button is Stop (`aria-label`, `type=button`), a click calls `onStop`, Enter doesn't submit, and Esc calls `onStop`.
  - Consumer `onKeyDown` runs first, and its `preventDefault` suppresses DS handling.
  - Disclaimer: default text, `aria-describedby`, and `null` hides it.
  - `context` renders the bar.
  - `disabled` works.
  - Test-id cascade.
- **ChatPermissions**
  - The trigger opens the popover.
  - The tooltip is disabled while open.
  - Clicking a row calls `onCheckedChange({checked})` and the popover stays open.
  - Test ids `permissions--trigger`, `--content`, `--item`.
- **ApprovalCard**
  - Pending renders the caption and children.
  - Approved and rejected render the status with the right icon and label, and no children.
  - Custom labels work.
  - `role=group` labelled by the caption; resolved state is `role=status`.
  - Test ids.
- **Chat**
  - Section with `aria-label`.
  - Background layer is `aria-hidden` and absent for `'none'`.
  - Title shows "Ask Wally" by default, or children after "/".
  - `ChatBody` has `role=log`.
  - The `greeting` placement renders the label and `lg` pills.
  - `ChatSuggestion` is a `type=button`.
  - Flat test-id cascade (`chat--header`, `--title`, `--actions`, `--body`, `--footer`, `--greeting`, `--suggestions`, `--suggestion`).
- **Analytics files** (`<Family>.analytics.test.tsx`): the cases in section 6, copied from `docs/metrics/testing-examples.md`.

**E2E** (`createStoryHelper` ids `ai-chat`, `ai-chatinput`, `ai-chatpermissions`, `ai-approvalcard`, `ai-usermessage`, `ai-assistantmessage`, `ai-messageactions`, `ai-chainofthought`; `describe 'Component: X'` → Visual / Interactions / Accessibility). Opacity-hidden actions count as visible in Playwright, so assert reveal with `toHaveCSS('opacity','1')` or a screenshot.
- **Chat**
  - Visual: empty, conversation, streaming, approval docked, thread header.
  - Interactions: suggestion click.
  - Accessibility: Tab order header → body → input.
- **ChatInput**
  - Visual: default, focused ring, typing (multi-row growth), streaming, stop-hover tooltip, with context, with settings.
  - Interactions: submit when Enter is pressed; newline when Shift+Enter; stop when Esc.
  - Accessibility: submit name toggles Send / Stop response.
- **ChatPermissions**
  - Visual: open all on, open some off.
  - Interactions: toggle keeps the popover open.
  - Accessibility: tooltip "Permission settings" on focus.
- **ApprovalCard**
  - Visual: pending, long text, code snippet, approved, rejected, menu open.
  - Interactions: "Allow once" menu opens from the chevron.
  - Accessibility: the group is named by the caption.
- **UserMessage**
  - Visual: short, long collapsed, hover actions.
  - Interactions: expand when Show more is clicked.
  - Accessibility: actions revealed via keyboard focus.
- **AssistantMessage**
  - Visual: prose, reasoning collapsed and expanded, actions visible.
  - Interactions: actions revealed when the message is hovered.
- **MessageActions**
  - Visual: user, wally, pressed.
  - Interactions: tooltip on hover; Ellipsis menu opens with the tooltip anchored.
- **ChainOfThought**
  - Visual: basic, nested, simple, simple-result, working, worked summary, rich text. Playwright disables animations in screenshots.
  - Interactions: chevron on hover; expand on click.
  - Accessibility: toggled via keyboard Enter and Space; `aria-expanded` updates.

**Quality gates** for every unit:
- `pnpm --filter @wallarm-org/design-system lint`.
- `tsc --build tsconfig.app.json --noEmit`, because the package's `typecheck` script is a no-op.
- `test`.
- `compiler:audit`, with no new bailouts.
- Screenshot baselines only in CI, via a commit containing `[update-screenshots]`. Never run `e2e:docker` locally.

---

## 9. `src/index.ts` additions (unit U10; alphabetical, Biome-sorted)

```ts
export { ApprovalCard, ApprovalCardActions, type ApprovalCardActionsProps, ApprovalCardContent, type ApprovalCardContentProps, type ApprovalCardProps, type ApprovalCardStatus } from './components/ApprovalCard';
export { AssistantMessage, AssistantMessageContent, type AssistantMessageContentProps, type AssistantMessageProps } from './components/AssistantMessage';
export { ChainOfThought, type ChainOfThoughtProps, ChainOfThoughtStep, type ChainOfThoughtStepProps } from './components/ChainOfThought';
export { Chat, ChatBody, type ChatBodyProps, ChatFooter, type ChatFooterProps, ChatGreeting, type ChatGreetingProps, ChatHeader, ChatHeaderActions, type ChatHeaderActionsProps, type ChatHeaderProps, ChatHeaderTitle, type ChatHeaderTitleProps, type ChatProps, ChatSuggestion, type ChatSuggestionProps, ChatSuggestions, type ChatSuggestionsProps } from './components/Chat';
export { ChatInput, type ChatInputProps, ChatInputSubmit, type ChatInputSubmitProps, ChatInputTextarea, type ChatInputTextareaProps } from './components/ChatInput';
export { ChatPermissions, ChatPermissionsContent, type ChatPermissionsContentProps, ChatPermissionsItem, type ChatPermissionsItemProps, type ChatPermissionsProps, ChatPermissionsTrigger, type ChatPermissionsTriggerProps } from './components/ChatPermissions';
export { MessageAction, type MessageActionProps, MessageActions, type MessageActionsProps, MessageTimestamp, type MessageTimestampProps } from './components/MessageActions';
export { UserMessage, UserMessageBubble, type UserMessageBubbleProps, type UserMessageProps, UserMessageShowMore, type UserMessageShowMoreProps } from './components/UserMessage';
```

*Amended by v2 §14:* the v2 §9 barrel entries are added too (AssistantMessageError/Loader, the `WallyAssistant` folder, the `Conversation` folder).

Subpath exports (`@wallarm-org/design-system/Chat` and the rest) work automatically through the `./*` wildcard. Units don't edit the barrel; that avoids merge conflicts between parallel worktrees.

---

## 10. Implementation order

| Wave | Units (parallel within a wave) | Dependency |
|---|---|---|
| 0 | U1 Foundations; U2 MessageActions; U3 ChatInput; U4 ChatPermissions; U5 ApprovalCard | none |
| 1 | U6 ChainOfThought | U1 (shimmer-text) |
| 1 | U7 UserMessage | U2 (its "With actions" story) |
| 1 | U8 Chat shell | U1 (`--lg-frame-bg`) |
| 2 | U9 AssistantMessage | U2 + U6, for its stories |
| 3 | U10 Integration: barrel exports, composed AI/Chat stories (ChatPermissions inside ChatInput, docked ApprovalCard, In Drawer) and their e2e, full quality gates | U1–U9 |
| 4 | U11 Code Connect `.figma.ts`: chat-header 44:1464, greeting 44:1738, ChatPill 8:3101, chat-input 26:602, approval-card 171:1673 (State → status, content slot), user-message 26:737, bubble-actions 26:726, chain-item 201:1660 (Type / Expanded / ic / chainItem) | U10, plus the Figma file URL |

---

## 11. Out of scope

- **CopilotKit inside the DS.** No CopilotKit or AG-UI dependencies, types or adapter package. No CopilotChat, CopilotSidebar or CopilotPopup slot integration. No `v2/styles.css`.
- **Engine logic, which stays in the app:**
  - message state and threads
  - run and reasoning timers
  - grouping messages into turns
  - tool → icon and tool → label mapping
  - the session allow-list and auto-respond
  - persisting feedback
- **Rendering and scrolling.** No markdown renderer (app), no virtualization. *(Amended by v2 §14: stick-to-bottom and the scroll-to-bottom button now ship in `Conversation`. Amended by addendum A: `AssistantMessageMarkdown` ships a built-in renderer.)*
- **Features not designed in Figma:**
  - attachments and file upload, voice and transcription
  - edit, branch, regenerate and read-aloud
  - the hidden "Ask" mode button 26:537
  - the hidden extra user-actions button 307:2058
  - a suggestion loading state, an approval loading variant *(a CoT error status ships since v2)*
  - "Show less"
  - an exported type → icon map
  - a timestamp tooltip, suggestion icons
  - uncontrolled ChatInput; `maxRows` / `maxLines` props
- **Still out of scope after v2 §14:** branches, sources, attachments, edit, regenerate, read-aloud and loading older history. They can arrive later as minor releases, via `custom` parts and slots.
- **Superseded Figma variants:** the braille spinner (206:2480), the 20px icon frames (74:1451…), the reasoning dot bullets (31:483), and the Brain + label + trailing-chevron header (91:1030).
- **Brand and theme work:** new WallyIcon variants for the drawer trigger, and retuning BlurBackground's blob colors to Figma chat-bg.
- **Tree:** deprecating it needs your confirmation (`TreeBase` has been removed).
- **Generic DS gaps:** an IconButton-with-tooltip or DropdownMenuSwitchItem.

---

## 12. Open questions

1. Tree: mark `Tree` `@deprecated`? (`TreeBase` is already removed — `tree-base-removed` migration.)
2. Send when the input is empty: the spec disables it, but Figma draws it enabled.
3. UserMessage:
   - Is a "Show less" control needed after expanding?
   - Keep Figma's fixed 375px max width with an 11-line clamp, or switch to percentages for a resizable Drawer?
4. Reasoning header style and chevron direction: the spec uses the newer 409:3853 CoT row.
5. Thumbs pressed state and copied feedback: the spec uses `bg-states-primary-active` and the Copy → Check icon swap.
6. Background:
   - Retune the blob colors to Figma chat-bg? This would churn the existing blur baselines.
   - Is the dark-mode treatment acceptable (transparent frame, blobs at 12% / 5% over the dark page)?
7. Approval card placement: docked above ChatInput (as in Figma) or inline in the stream? Does the resolved card stay docked?
8. Esc to stop: only from the textarea (the spec), or from anywhere in the panel?
9. Can the runtime stamp `metadata.createdAt` on messages?
10. Figma file URL for Code Connect (U11)?
11. The mascot icon for the drawer trigger.
12. Is the context bar (Variant2) needed in v1, and where do the chips come from?
