# HoverCard: user and agent (WDS-206)

Status: design spec, 2026-11-12. Paths are under `packages/design-system/src/` unless marked otherwise.

## Goal

Build one hover card shell for people and agents on Ark `HoverCard` (`@ark-ui/react/hover-card`, zag 1.43.3, already installed). It has media, a name, a status badge, a subtitle, attribute rows and at most one footer action. The product supplies the data and leaves out any row or action that does not apply. Use it in read contexts only: tables, attributes, timeline and history. Never use it in menus, selects or filters.

The DS adds three generic overlay parts (root, trigger, content) and four small layout parts (header, title, description, action). Everything else is an existing DS component, used unchanged.

## Figma summary

Source: `u-figma.md`. The cards are instances of the DS `popover` component. Figma has no dedicated HoverCard component.

| Element | Value | Code |
|---|---|---|
| Surface | 320 wide, p-12, Popover surface, shadow-md | `w-320 max-w-(--available-width)` + the Popover surface recipe |
| Placement | below the trigger, start-aligned, about 12–17 px away | `{ placement: 'bottom-start', offset: { mainAxis: 12 } }` |
| Header | flex, items-center, gap 12; media 56×56 | grid with gap-x-8, plus mr-4 on the media |
| Agent media | 56 px 3D character, live, no shadow | `<AgentAvatar size={56} live …/>` (new `PLACES.hoverCard`) |
| Person media | 56 px plate, radius about 16 | new `Avatar size='xl'` |
| Name | 20/28 text-primary. Agent: Geist Pixel Square. Person: Geist display, heading/xl | `text-xl leading-xl`. Agent: `font-pixel`. Person: `font-sans-display font-normal tracking-xl` |
| Name to badge | gap 8, Badge `dotted` / `secondary` | the consumer's `<Badge>` |
| Subtitle | text-sm (14/20) regular, text-secondary | `text-sm text-text-secondary` |
| Divider | 12 px space, 1 px line, 12 px space | `<Separator spacing={6} />` inside the content's `gap-6` (6 gap + 6 margin on each side) |
| Rows | flex-col gap 6; horizontal Attribute; label 100 | `<Attribute orientation='horizontal'>` (default label width 100) |
| Row inset and gap | Figma: 8 px x-inset, 4 px label-to-value gap | code Attribute: no inset, gap-12 (⚑ see decision 1) |
| Footer | Button secondary/neutral/small, full width 296, gap 6 above | `HoverCardAction` preset |

Designer notes that the code must honour:
- The card opens after a pause and stays open while hovered.
- The agent character is live and has no shadow.
- Approvals appear only for some agents.
- Width is at most 320 and long values end with "…".
- Tags wrap.
- Agents use pixel type and people use Geist.
- People keep the plate. Agents never sit on a plate.
- "View user" appears only with access.
- The exact time shows in a tooltip.

## Component tree & files

Pattern 4 (Ark UI wrapper), built like Popover. It has no custom context: Ark's context and the TestIdProvider cascade are all it needs.

```
HoverCard                    Ark HoverCard.Root + TestIdProvider. Renders no DOM.
├── HoverCardTrigger         always asChild, onto the consumer's Link / router link / <button>
└── HoverCardContent         Portal > Positioner > Content. 320 px surface, flex-col gap-6
    ├── HoverCardHeader      grid: media | title + status | description
    │   ├── <AgentAvatar size={56} live …/>  or  <Avatar size='xl'>…</Avatar>  or  <Skeleton/>
    │   ├── HoverCardTitle         one line, ellipsis + OverflowTooltip; variant person | agent
    │   ├── <Badge variant='dotted' type='secondary' …/>    (optional)
    │   └── HoverCardDescription   one line, ellipsis + OverflowTooltip      (optional)
    ├── <Separator spacing={6} />                            (left out for a header-only card)
    ├── <Attribute orientation='horizontal'>…</Attribute>    0..n, one per fact
    └── HoverCardAction        the single footer action; the product leaves it out without permission
```

Reused unchanged: Attribute/AttributeLabel/AttributeValue, Badge, Tag, HStack (`gap={4} wrap='wrap'`; it takes `className`), Link `size='md'`, FormatDateTime `format='relative'`, Separator, Skeleton (`rounded={16}` exists), OverflowTooltip, Button, AgentAvatar and Avatar.

Not added: HoverCardMedia, HoverCardBody, HoverCardFooter, HoverCardRow, User/Agent header presets, a `loading` prop, `positioning`, `defaultOpen`, `openDelay`/`closeDelay`, and `disabled`. Each can be added once a second product needs it.

New files in `components/HoverCard/`:
- `HoverCard.tsx`
- `HoverCardTrigger.tsx`
- `HoverCardContent.tsx`
- `HoverCardHeader.tsx`
- `HoverCardTitle.tsx`: the cva `variant` lives in this file
- `HoverCardDescription.tsx`
- `HoverCardAction.tsx`
- `index.ts`
- `HoverCard.stories.tsx`
- `HoverCard.test.tsx`
- `HoverCard.e2e.ts`, plus snapshots generated in CI

No `classes.ts` in this folder. The one shared recipe is the overlay surface, which moves to `Popover/classes.ts` (see Registration points). There is no `.figma.ts`, because Figma has no dedicated component and Code Connect already maps the `popover` instance.

## Props API

```ts
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';
import type { TestableProps } from '../../utils/testId';
import type { ButtonProps } from '../Button';

/**
 * Root. Renders no DOM. Pinned: openDelay 600 (0 while the exit animation still plays, so coming
 * back reopens the fading card), closeDelay 300, lazyMount, unmountOnExit,
 * positioning { placement: 'bottom-start', offset: { mainAxis: 12 } }.
 * While the card is up, every Tooltip under the root outside HoverCardContent is held closed (an
 * open one fades out as the card fades in), so a tooltip on the trigger never covers it. Put the
 * `<Tooltip>` root inside `<HoverCard>`, or it is not held. AvatarName on the trigger side drops
 * its overflow tooltip: the card shows the full name.
 */
export interface HoverCardProps extends TestableProps {
  children: ReactNode;
  /** Controlled. Pass `open` only together with `onOpenChange` feeding it back, or the card never moves (zag controlled mode). */
  open?: boolean;
  /** Ark's details are unwrapped to a boolean, as in Popover. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Override the trigger element's id. Pass the same id to a `Tooltip`'s `ids.trigger` to
   * compose both triggers on one element via nested `asChild` without an extra wrapper node —
   * otherwise the outer trigger's id wins and the other component can't find its own anchor.
   */
  ids?: ArkUiHoverCard.RootProps['ids'];
}

/**
 * Always asChild. The child is the item's real interactive element: a DS Link, a router link,
 * <a href> or <button>. Analytics attributes, aria-*, id, ref and handlers go on the child.
 * Ark composes its focus, blur and pointer handlers with the child's own; it never replaces them.
 * data-testid: useTestId('trigger', override). Pass it explicitly when the trigger sits inside
 * Avatar or AgentItem, because they re-provide the cascade (Avatar.tsx:84, AgentItem.tsx).
 * On an element that already has a Tooltip, nest the two asChild triggers in either order and pass
 * the same id to both roots' `ids.trigger`. Props and the ref an outer asChild passes in are
 * forwarded to Ark, which composes them with its own.
 */
export interface HoverCardTriggerProps
  extends Omit<ComponentPropsWithoutRef<typeof ArkUiHoverCard.Trigger>, 'asChild' | 'children'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  children: ReactElement;
}

/** Portal > Positioner > Content. data-slot='hover-card-content', testid --content. */
export interface HoverCardContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'style'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/** Children: [media, HoverCardTitle, Badge?, HoverCardDescription?]. data-slot='hover-card-header', testid --header. */
export interface HoverCardHeaderProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * The name. Classes: 'min-w-0 truncate text-xl leading-xl text-text-primary'.
 * person: font-sans-display font-normal tracking-xl. agent: font-pixel (one weight; never font-bold).
 * data-slot='hover-card-title', testid --title.
 */
export interface HoverCardTitleProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  ref?: Ref<HTMLSpanElement>;
  variant?: 'person' | 'agent'; // default 'person'
  children: ReactNode;
}

/** Role or email: 'min-w-0 truncate text-sm text-text-secondary' + OverflowTooltip. data-slot='hover-card-description', testid --description. */
export interface HoverCardDescriptionProps extends HTMLAttributes<HTMLSpanElement>, TestableProps {
  ref?: Ref<HTMLSpanElement>;
  children: ReactNode;
}

/**
 * Button preset: variant='secondary' color='neutral' size='small' fullWidth. asChild and as pass
 * through, so <HoverCardAction asChild><a href>…</a></HoverCardAction> renders an <a>.
 * data-slot='hover-card-action', testid --action.
 */
export type HoverCardActionProps = Omit<ButtonProps, 'variant' | 'color' | 'size' | 'fullWidth'>;
```

Implementation notes:
- The root follows `Popover.tsx`: `testIdProp ?? useTestId()`, then `<TestIdProvider>`, then `<HoverCard.Root openDelay={600} closeDelay={300} positioning={HOVER_CARD_POSITIONING} lazyMount unmountOnExit>`.
- `HoverCardContent` follows `PopoverContent.tsx`: `ArkUiPortal` from `lib/portal/Portal`, `useLayerZIndexRef(ref)`, and `id` from `useHoverCardContext().getContentProps()`. Its classes are `cn(popoverSurfaceClassNames, 'w-320 max-w-(--available-width) flex flex-col gap-6 motion-reduce:animate-none!', className)`. Do not copy PopoverContent's `useMemo` or its `style` vars.
- `HoverCardHeader` classes: `grid grid-cols-[auto_minmax(0,max-content)_auto] justify-start items-center gap-x-8 [&>:first-child]:row-span-2 [&>:first-child]:mr-4`. Title goes in `col-start-2`, the Badge auto-places into column 3, and `[&>[data-slot=hover-card-description]]` gets `col-start-2 col-span-2 row-start-2`.
- `HoverCardTitle` and `HoverCardDescription` wrap themselves in `OverflowTooltip > OverflowTooltipTrigger` as `AvatarName` does.

Additive changes to existing APIs:

```ts
// Avatar/classes.ts
avatarVariants.size            += { xl: 'rounded-16' }
avatarPlateVariants.size       += { xl: 'size-56 rounded-16' }
avatarNameVariants.size        += { xl: 'text-sm' }   // keeps the variant map total
avatarDescriptionVariants.size += { xl: 'text-xs' }
avatarFallbackVariants         += size variant: sm–lg 'text-xs', xl 'text-lg'   // initials
// AvatarFallback.tsx: <Icon size={size === 'xl' ? 'xl' : 'md'} />
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

// lib/agent-characters/places.ts
hoverCard: { size: 56, renderer: '3d', live: true, shadow: false }, // the user/agent hover card
```

## Usage

### Agent card (timeline, history, attributes)

```tsx
<HoverCard data-testid='agent-card'>
  <AgentItem agent='radar' size={20}>
    <AvatarContent>
      <AvatarName>
        <HoverCardTrigger data-testid='agent-card--trigger'>
          <Link asChild size='md'>
            <RouterLink {...agentLink(agent.id)} data-analytics-id='history.agent'>Radar</RouterLink>
          </Link>
        </HoverCardTrigger>
      </AvatarName>
    </AvatarContent>
  </AgentItem>
  <HoverCardContent>
    <HoverCardHeader>
      <AgentAvatar agent='radar' size={56} state='working' live seed={agent.id} />
      <HoverCardTitle variant='agent'>Radar</HoverCardTitle>
      <Badge variant='dotted' type='secondary' color='blue'>Working</Badge>
      <HoverCardDescription>Attack Anomaly Investigator</HoverCardDescription>
    </HoverCardHeader>
    <Separator spacing={6} />
    <Attribute orientation='horizontal' data-testid='agent-card--runs'>
      <AttributeLabel>Runs</AttributeLabel>
      <AttributeValue>
        <HStack gap={4} wrap='wrap' className='min-w-0'>{agent.events.map(renderEventTag)}</HStack>
      </AttributeValue>
    </Attribute>
    <Attribute orientation='horizontal' isEmpty={!agent.lastRun}>
      <AttributeLabel>Latest run</AttributeLabel>
      <AttributeValue>{agent.lastRun && <Link href={runHref} size='md'>Run at 00:00</Link>}</AttributeValue>
    </Attribute>
    {agent.approvalRequired && (
      <Attribute orientation='horizontal'>
        <AttributeLabel>Approvals</AttributeLabel>
        <AttributeValue><Link href={approvalsHref} size='md'>5 pending</Link></AttributeValue>
      </Attribute>
    )}
    {canViewAgent && (
      <HoverCardAction asChild data-analytics-id='agent-card.view'>
        <RouterLink {...agentLink(agent.id)}>View agent</RouterLink>
      </HoverCardAction>
    )}
  </HoverCardContent>
</HoverCard>
```

### User card body (written once, in the product)

```tsx
<HoverCardHeader>
  <Avatar size='xl'>
    <AvatarImage src={user.avatarUrl ?? undefined} />
    <AvatarFallback name={user.name} />
  </Avatar>
  <HoverCardTitle>{user.name}</HoverCardTitle>
  <UserStatusBadge status={user.status} />
  <HoverCardDescription>{user.email}</HoverCardDescription>
</HoverCardHeader>
<Separator spacing={6} />
<Attribute orientation='horizontal' isEmpty={user.roles.length === 0}>
  <AttributeLabel>Roles</AttributeLabel>
  <AttributeValue><HStack gap={4} wrap='wrap' className='min-w-0'>{user.roles.map(renderRoleTag)}</HStack></AttributeValue>
</Attribute>
<Attribute orientation='horizontal'>
  <AttributeLabel>Last active</AttributeLabel>
  <AttributeValue><FormatDateTime value={user.lastActive} format='relative' /></AttributeValue>
</Attribute>
{canSeeAllUsers && <HoverCardAction onClick={handleOpenUser}>View user</HoverCardAction>}
```

### Loading: fetch inside the content

The content is lazy-mounted, so a product component inside `HoverCardContent` mounts when the card opens. Its `useQuery` therefore fetches on open, with no `open` state and no `onOpenChange` wiring. Prefetching on the trigger's `onPointerEnter` is optional, and the 600 ms open delay usually hides the fetch. While loading, the card keeps the known name and the real row labels, and only the values become skeletons, so the card keeps its shape.

```tsx
const UserCardBody: FC<{ userId: string; name: string }> = ({ userId, name }) => {
  const { data, isPending } = useQuery(userCardQuery(userId));
  if (isPending) {
    return (
      <>
        <HoverCardHeader>
          <Skeleton width='56px' height='56px' rounded={16} />
          <HoverCardTitle>{name}</HoverCardTitle>
          <HoverCardDescription><Skeleton width='160px' height='16px' /></HoverCardDescription>
        </HoverCardHeader>
        <Separator spacing={6} />
        <Attribute orientation='horizontal'>
          <AttributeLabel>Roles</AttributeLabel>
          <AttributeValue><Skeleton width='100%' height='16px' /></AttributeValue>
        </Attribute>
        <Attribute orientation='horizontal'>
          <AttributeLabel>Last active</AttributeLabel>
          <AttributeValue><Skeleton width='100%' height='16px' /></AttributeValue>
        </Attribute>
      </>
    );
  }
  if (!data) {
    // Deleted principal or failed fetch: header only. No separator, rows or action.
    return (
      <HoverCardHeader>
        <Avatar size='xl'><AvatarFallback /></Avatar>
        <HoverCardTitle>{name}</HoverCardTitle>
        <HoverCardDescription>No longer available</HoverCardDescription>
      </HoverCardHeader>
    );
  }
  return <UserCardFields user={data} />; // the user card body above
};
```

While loading, show no action, because the permission is not known yet. The width is fixed, so only the height changes, and zag's `autoUpdate` (`elementResize`) keeps the card anchored.

### Table-cell trigger (core-frontend UserNameCell)

```tsx
<span>{/* cells force their direct child to block */}
  <HoverCard data-testid={`user-card-${row.id}`}>
    <Avatar size='sm'>
      <AvatarImage src={row.avatarUrl ?? undefined} />
      <AvatarFallback name={row.name} />
      <AvatarContent>
        <AvatarName>
          <HoverCardTrigger data-testid={`user-card-${row.id}--trigger`}>
            <Link type='table' size='md' asChild>
              <button type='button' onClick={handleOpenUser} data-analytics-id='users.row-name'>{row.name}</button>
            </Link>
          </HoverCardTrigger>
        </AvatarName>
      </AvatarContent>
    </Avatar>
    <HoverCardContent><UserCardBody userId={row.id} name={row.name} /></HoverCardContent>
  </HoverCard>
</span>
```

Only `HoverCardTrigger` goes inside `AvatarName`, never the whole `HoverCard`. Under a HoverCard root (outside the content) `AvatarName` renders no OverflowTooltip: the card shows the full name, and the tooltip would repeat its children, the trigger included (a second element with the trigger's id), and flash just before the card replaced it.

### Trigger that already has a Tooltip

```tsx
const triggerId = useId();

<HoverCard ids={{ trigger: triggerId }}>
  <Tooltip ids={{ trigger: triggerId }}>
    <HoverCardTrigger data-testid='user-card--trigger'>
      <TooltipTrigger asChild>
        <Link href={`/users/${user.id}`} size='md'>{user.name}</Link>
      </TooltipTrigger>
    </HoverCardTrigger>
    <TooltipContent>Signed in 5 minutes ago</TooltipContent>
  </Tooltip>
  <HoverCardContent>{/* … */}</HoverCardContent>
</HoverCard>
```

The `<Tooltip>` root goes inside `<HoverCard>` (outside `HoverCardContent`): HoverCard holds only tooltips below its root. The two asChild triggers on one element nest in either order. Ark merges the outer trigger's props over the inner one's, so the outer id wins; the shared `ids.trigger` makes both machines find the element by id. The tooltip opens first (its 400 ms delay); at 600 ms the card opens and the tooltip fades out as the card fades in (a cross-fade, never an empty frame), and is held closed while the card is up — no `open` / `disabled` wiring, unlike Popover's WithTooltip. `HoverCardTrigger` forwards the props and ref an outer asChild passes in. With the tooltip outer, the tooltip trigger's `data-testid` reaches the element, so put the HoverCard outer when tests locate the trigger by the card's testid.

## Behavior

Open and close come from zag 1.43.3, verified in `hover-card.machine.mjs` and `connect.mjs`. The DS adds only the re-hover-during-exit delay and the trigger-side tooltip suppression below.
- **Pointer:** resting on the trigger for 600 ms opens the card. Leaving the trigger or the card starts a 300 ms close. Re-entering either one cancels the close, so the card stays open while the pointer is on it.
- **Keyboard focus:** focusing the trigger opens the card after the same 600 ms.
- **Blur:** blur closes a focus-opened card unless the pointer has entered it. Once the pointer enters, `isPointer` is set and blur no longer closes the card.
- **Esc:** Esc closes the card when it is the topmost dismissable layer. Inside a Drawer, the first Esc closes the card and the second closes the drawer. Esc cannot be turned off. Focus stays on the trigger.
- **Outside:** an outside pointerdown closes the card. Focus moving outside does not, because zag calls `preventDefault` on focus-outside.
- **Touch:** zag returns early on `pointerType === 'touch'` and the trigger has no click handler, so a tap follows the link or runs the button's `onClick` natively. The focus a tap gives can start the 600 ms timer. `TRIGGER_BLUR` in `opening` cancels it when `isPointer` is false, so navigation, or a drawer that takes focus, cancels it. A stray card is possible only when a tap leaves focus on the trigger. Esc or an outside tap closes it.
- **Reduced motion:** `AgentAvatar` falls back to `StaticAvatar`, the static frame of `state`, through `useAgentMotion`, and it follows the media query live. The surface adds `motion-reduce:animate-none!`: the `!` is needed because plain `animate-none` loses to `data-[state=closed]:animate-out`, which left the close fading.
- **Re-hover during the exit:** after the close delay zag is `closed`, but the content still plays its 150 ms exit. HoverCard tracks that window (from `onOpenChange(false)` with the content mounted to `onExitComplete`) and drops `openDelay` to 0 in it, so coming back reopens the card at once instead of letting it vanish and return 600 ms later. zag calls `onOpenChange(true)` before React renders `data-state=open`, so the root reads the content's computed opacity and transform there (the content is found by its id; the root sets `ids.content`), HoverCardContent turns its CSS enter off (`animate-none!`), and a layout effect animates the content from that frame to opacity 1 with WAAPI. A CSS transition cannot do it: Chrome starts no transition from an animated value.
- **Tooltips on the trigger side:** the root provides `SuppressTooltipsContext` (internal, `Tooltip/Tooltip.tsx`) as `open || exiting`. Every `Tooltip` under it is held closed (controlled `open={false}`, not `disabled`: a disabled zag tooltip ignores the pointer leaving, keeps `hasPointerMoveOpened` set and never opens on that trigger again), and an open one plays its normal exit while the card enters. `HoverCardContent` resets it to `false`, so the title, description and FormatDateTime tooltips inside the card work.
- **Live motion:** `lazyMount` and `unmountOnExit` are always on. The character's engine is created when the content mounts on open and disposed (`ch.dispose()`) when it unmounts after the exit animation. No `live={open}` wiring is needed. A `state` change while the card is open animates in the engine without a remount.
- **Layering:** the content uses Popover's layer-aware z-index and `useLayerZIndexRef`, because hover-card joins the dismissable stack and gets `--layer-index`. Tooltips inside the card (title, description, FormatDateTime) use `--tooltip-z-index` and stack above it. They are React descendants of the content, so moving onto them does not fire the content's `onPointerLeave`; verify this in e2e.
- **Positioning:** `{ placement: 'bottom-start', offset: { mainAxis: 12 } }`. zag popper computes `offset.mainAxis ?? gutter` (`get-placement.mjs:43`), so the effective gap is 12, the same as Popover's `{ gutter: 8, offset: { mainAxis: 12 } }`. Flip and slide stay on.
- **ARIA:** none is added, and zag adds none either. The trigger keeps its native link or button role and its accessible name. The content keeps zag's `tabIndex=-1` and has no role. Media is decorative next to the visible name: AgentAvatar without `label` is `aria-hidden`, and the Avatar plate gets no role.
- **Keyboard reach:** focus never moves into the card. Tab from the trigger goes to the next element in the page, and blur closes the card. The footer action and row links are therefore not keyboard-reachable. That is acceptable only under the authoring rule stated in the story description: everything in the card must also be reachable at the trigger's destination (decision 5).

| Key | Result |
|---|---|
| Tab onto the trigger | The card opens after 600 ms. |
| Tab / Shift+Tab off the trigger | The card closes, unless the pointer entered it. |
| Enter / Space | The trigger element's native action. The card does not intercept it. |
| Esc | The card closes. Focus stays on the trigger. |

Analytics targets:

| Target | Element | Reached via | Attribute type | Gap |
|---|---|---|---|---|
| Name (trigger) | the consumer's `<a>`, router link or `<button>` | the child of `HoverCardTrigger` | the child's own type | None |
| Footer action | `<button>`, or `<a>` / router link with asChild | `HoverCardAction` | `ButtonProps` (polymorphic) | None |
| Row links | `<a>` | the consumer's `Link` | `AnchorHTMLAttributes` | None |
| Tags | `<div tabIndex=0>` | the consumer's `Tag` | Tag props | None |
| Content | `<div>` (not interactive) | `HoverCardContent` `{...rest}` | `HTMLAttributes<HTMLDivElement>` | None |

Nothing calls `stopPropagation`, and `data-analytics-props` is forwarded verbatim.

Test IDs:
- The root's `data-testid=X` derives `X--trigger`, `X--content`, `X--header`, `X--title`, `X--description` and `X--action`. The title and description re-provide the cascade, so their overflow tooltips are `X--title--content` and `X--description--content` and never collide with `X--content`.
- Inside `Avatar` or `AgentItem` the cascade is reset, so pass the trigger's ID explicitly.
- Attribute rows are their own roots, so pass `X--<row>` on each one.
- With no root ID, nothing is rendered.

## Decisions on open questions

1. **Figma values.** Applied as listed in the Figma summary. Two points differ from Figma. **Row inset and gap:** Figma shows an 8 px row inset and a 4 px label-to-value gap. Code Attribute has no inset and a 12 px gap. Keep the code Attribute and never fork it inside the card. If design wants Figma's values, change Attribute globally in a separate ticket. **Divider:** it is `<Separator spacing={6} />` inside `gap-6`, which gives exactly 12 + 1 + 12 and uses Separator's `bg-border-primary` token, the same as the Figma Separator instance. **⚑ SIGN-OFF** (row inset and gap).
2. **56 px person plate.** Add a public `Avatar size='xl'`: `size-56 rounded-16`, initials `text-lg` and fallback icon `xl`. Figma's Code Connect already maps the user-avatar plate to `Avatar`, and a card-local override would fight `avatarPlateVariants` on every layer. The radius, initials size and icon size are estimates from the screenshot. **⚑ SIGN-OFF** (radius, initials and icon size).
3. **AgentAvatar place.** Add `PLACES.hoverCard = { size: 56, renderer: '3d', live: true, shadow: false }`. The ticket and the Figma note ("56 px 3D character, live… no shadow") are the design source. `peopleRow` stays `live: false`. This place differs because only the open card mounts a character, one at a time.
4. **Keyboard opening.** Keep zag's behavior: any focus opens the card after 600 ms, with no `:focus-visible` gate. A gate would need a forked trigger, because zag's `onFocus` ignores `defaultPrevented`. Zag already cancels the timer on blur when the pointer has not entered (`opening.TRIGGER_BLUR`, guarded by `not('isPointer')`), so normal tap and navigation flows show no card. The upgrade path, if products report stray cards on touch, is an internal gate in controlled mode. The facts it would rely on are verified: `setOpen` is a no-op in `opening`, because that state carries the closed tag, and a controlled `opening` state returns to `closed` when `toggleVisibility` sends `CONTROLLED.CLOSE`.
5. **Keyboard reach of the card.** Blur and Esc close the card. There is no Tab into the portal and no focus management. The card is a supplementary preview, and the authoring rule in the story docs is: never put the only path to an action or a fact in the card. The footer action goes to the same place as the trigger, and row links (Latest run, Approvals) exist at the destination. A card with a unique action needs a different pattern, such as a Popover or Tab-into-content. **⚑ SIGN-OFF**, because keyboard users see the card but cannot reach its links.
6. **ARIA.** None. The content mounts 600 ms after focus, so an `aria-describedby` would point at an element that does not exist yet. `aria-haspopup` and `aria-expanded` would misdescribe a trigger that navigates. The trigger's visible name is its announcement.
7. **Trigger contract.** `HoverCardTrigger` is always asChild and takes `children: ReactElement`. It has no attribute surface of its own, apart from the testid override. There is no `asChild=false` default, so a Link can never end up nested in Ark's `<button>`. It works with a DS `Link`, a router link, `<a>`, or the `Link asChild > <button onClick>` from UserNameCell. Place it inside `AvatarName`, and keep the table cell's `<span>` wrapper. The root renders no DOM, so `<HoverCard>` can wrap the whole item. A plain-text principal name (rules-frontend, flow-management) must become a link or button before it can have a card.
8. **Loading.** Product-owned, with no `loading` prop. The main recipe puts the product's data component inside `HoverCardContent`, where lazyMount makes it fetch on open. While loading, the header keeps the known name with a 56 px `rounded={16}` Skeleton and a Skeleton description, and the rows keep their real labels with Skeleton values. There is no action until the permission is known. The "Loading" story is the reference.
9. **Empty values.**
   - A row that does not apply is left out by the product. Examples: Approvals for Lens and Bard, and an action without permission.
   - A row that applies but has no value shows Attribute's em dash. The product must pass `isEmpty` for `''`, `0` or `[]`, because `Children.count('')` is 1.
   - FormatDateTime with `null` already shows an em dash with a "No data" tooltip.
   - Never write "None".
   - A deleted principal or a failed fetch gets a header-only card: the known name, a product description, and no separator, rows or action.
10. **Status badge colours.** The DS has no mapping. The product passes a `Badge variant='dotted' type='secondary'`. The stories document the colours:
    - People, from core-frontend `UserStatusBadge`: Active green, Invited blue, Invite expired w-orange, Deactivated gray.
    - Agents, with labels from `STATES`: On duty green, Working blue, Needs you amber, Failed red, Deactivated or Not set up gray, Inviting blue.
    Promote the mapping to a helper only if a second product copies it. **⚑ SIGN-OFF** (agent mapping).
11. **Root API.** `open`, `onOpenChange` and `ids`, as in Popover, so HoverCard goes in claude-design `CONTROLLED_OPEN`. Stories pass neither and start closed; the e2e screenshot tests open the card by hover. `ids` is there so the trigger can sit on an element that already has a Tooltip: both roots take the same `ids.trigger` (Usage → Trigger that already has a Tooltip). There is no `positioning` (the ticket fixes bottom-start), no `openDelay` or `closeDelay` (the ticket fixes 600/300, pinned explicitly), no `defaultOpen` and no `disabled`.
12. **Tags.** Use `Tag` unchanged. A read-only Tag being a tab stop with `cursor-pointer` is existing DS-wide debt, and the Attribute Composition story already has it. Inside the card it never enters the keyboard path (decision 5). File a follow-up: Tag should be focusable and pointer-styled only when it has `onClick` or `asChild`.
13. **Pixel font.** Use the explicit `HoverCardTitle variant='agent'`, which applies `font-pixel`. Do not infer it from a `has-[…agent-avatar]` selector, which breaks silently when the media is wrapped in an element. Consumers never write `font-pixel` themselves. Change `guidelines/foundations/typography.md:37` to: "**Never** use `font-pixel` yourself (decorative: `EmptyState` titles and `HoverCardTitle variant='agent'` only)…". The change must stay within the 700-word budget. Update the `theme/Pixel.stories.tsx` description to match. **⚑ SIGN-OFF** (relaxes a typography rule).
14. **Approvals.** Product data (`AgentDto.approvalRequired`). The product renders or omits a plain optional Attribute row. The DS has no flag for it.
15. **Long values.** The title and description truncate and show an OverflowTooltip. FormatDateTime has its own tooltip. Tags wrap. The Figma rows have no long plain-text value, so `AttributeValue` stays unchanged. The "Long Values" story shows the recipe for a plain string: `OverflowTooltip > OverflowTooltipTrigger > <span className='truncate'>`. If products repeat it, give horizontal `AttributeValue` a global OverflowTooltip for string children, as a follow-up.
16. **Footer preset.** Keep `HoverCardAction`. It pins the Figma footer (secondary, neutral, small, full width), so products cannot drift from it, and it is typed as `Omit<ButtonProps, …>`, so asChild and polymorphism come from Button.

## Registration points & docs/guidelines changes

- `src/index.ts`: an alphabetical `HoverCard` block, placed before Icons and Input. It exports all seven components and their `*Props` types.
- `components/Popover/classes.ts` (new, internal, not exported from `Popover/index.ts`): `popoverSurfaceClassNames`, which holds the surface, layer-aware z-index, `overscroll-contain` and animation classes. `PopoverContent.tsx` uses it. The origin is `origin-(--transform-origin)` (Tailwind v4 syntax, as main's #475 set it for every overlay), so the card scales from the trigger.
- `components/Avatar/classes.ts`, `AvatarFallback.tsx`, `Avatar.stories.tsx` (Sizes includes xl) and the Avatar snapshots: the `xl` size. `Avatar.figma.ts` maps the 56 px plate to `size='xl'` only if that Figma variant exists.
- `lib/agent-characters/places.ts` and `__tests__/places.test.ts` (exact-match table): the `hoverCard` place. Also the JSDoc for `size` and `live` in `AgentAvatar.tsx`, and the snapshot of the AgentAvatar places story.
- `guidelines/foundations/typography.md:37` and `theme/Pixel.stories.tsx`: the pixel-font exception (decision 13).
- `guidelines/foundations/layering.md`: add `HoverCard` to the frontmatter `components:` list and the overlay row, since it shares Popover's layer. The change must stay within the budget.
- `packages/claude-design/src/docs/consuming.ts`: add `'HoverCard'` to `CONTROLLED_OPEN`. `build-docs.test.ts` checks that it has `open` and `onOpenChange` and no `defaultOpen`.
- `packages/mcp/src/tools/search-component.ts` `ALIASES`: 'hover card', 'user card', 'agent card' and 'profile card' → HoverCard. `budget.test.ts` checks the aliases. The internal `ChartHoverCard` is not public, so it does not collide.
- `docs/storybook-docs-coverage.md` (repo root): an `Overlay/HoverCard` row and the updated header count.
- Stories: `title: 'Overlay/HoverCard'`, `subcomponents`, `satisfies Meta<typeof HoverCard>`. The meta description carries:
  - the read-contexts-only rule;
  - the supplementary-card authoring rule;
  - one action, and that the product leaves out rows and the action;
  - fetching inside the content;
  - where `data-analytics-id` goes;
  - the status colour mapping;
  - the Tooltip composition rule (shared `ids.trigger`, no `open` wiring).

  Stories, with spaced names: `Agent`, `User`, `Without Action`, `Loading`, `Unavailable`, `Long Values`, `In Table`, `With Tooltip`, `Analytics`. Each story has a `data-testid`. No local wrapper components, and handlers are named before the return.
- No changes needed: `package.json` exports (`./*` already covers the folder), the rslib config, the metadata generator, the claude-design config and apps/website. Everything is additive, so the commit is `feat(hover-card): … (WDS-206)` with no migration.

## Tests

Unit (`HoverCard.test.tsx`, Rstest, fake timers):
- The content is not mounted before open. It mounts 600 ms after `pointerenter` or focus on the trigger, and unmounts after leave, Esc and the close delay. An `AgentAvatar` in the content is gone after close.
- The consumer's `onFocus`, `onPointerEnter` and `onClick` on the trigger child still fire, because handlers are composed.
- `HoverCardTitle variant='agent'` has `font-pixel` and the default variant has `font-sans-display`.
- `HoverCardAction asChild` renders an `<a>` with the preset classes.

Test IDs:
- The cascade derives `--trigger`, `--content`, `--header`, `--title`, `--description` and `--action`.
- An explicit trigger ID works inside `Avatar` and `AgentItem`.
- With no root ID, no `data-testid` attributes are rendered.

Analytics (`captureAnalyticsClicks`, mirroring `Popover.nesting.test.tsx`):
- `data-analytics-id` on the trigger child survives the asChild merge.
- `HoverCardAction`, with and without asChild, and a row `Link` resolve `closest('[data-analytics-id]')`, and their clicks do not dismiss the card.
- A Tooltip inside the content stacks above it.

Other unit tests:
- `places.test.ts` includes the `hoverCard` place.
- Avatar `xl` renders `size-56` and `text-lg` initials.

E2E (`HoverCard.e2e.ts`, `createStoryHelper('overlay-hovercard', ['Agent', 'User', 'Without Action', 'Loading', 'Unavailable', 'Long Values', 'In Table'] as const)`):
- Visual: Agent, User, Loading, Unavailable and Long Values, opened through `open`. Take Agent under `page.emulateMedia({ reducedMotion: 'reduce' })` so the frame is static and stable.
- Interactions:
  - The card opens after hovering the trigger.
  - It stays when the pointer moves onto the card or onto a tooltip inside it (uncontrolled In Table card, fake clock past the close delay).
  - It closes after leaving.
  - It opens on Tab focus and closes on Tab away.
  - Esc closes it.
  - A touch tap (`hasTouch`) follows the link, and a touch pointer opens no card. The tap's focus can still open the card when it stays on a `#` trigger (Behavior → Touch), so the e2e asserts the touch pointer and the link, not the focus path.
  - In Table: a truncated name shows no AvatarName tooltip on the trigger side, before or after the card opens, and the trigger exists once.
  - With Tooltip: the tooltip shows at 400 ms; at 600 ms the card opens under the trigger (not at the viewport origin) and the tooltip is hidden, and it stays hidden while the card is up.
- Accessibility: axe on the open Agent and User stories. The repo's e2e has no axe tooling, so explicit ARIA checks replace it: the trigger keeps an accessible name and gets no `aria-haspopup` / `aria-expanded`, and the content has no role and `tabindex=-1`.
- Baselines come only from CI through `[update-screenshots]`. Check the bot commit for unrelated flaky baselines.
- Also run `tsc --build tsconfig.app.json --noEmit` and `pnpm --filter @wallarm-org/design-system compiler:audit`, which must report no bailouts.

## Out of scope

- A Tab-into-card keyboard model and a `:focus-visible` gate (upgrade paths are in decisions 4 and 5).
- The global Attribute changes: Figma's row inset and gap, and a tooltip on string values.
- A non-interactive Tag mode.
- Moving products onto the card: core-frontend UserNameCell, and agentic-console, which pins DS 4.5.1 and still puts agents on plates.
- User or agent preset components, a status-to-colour helper, and Ark's multi-trigger `triggerValue` for large tables.
- `HoverCard.figma.ts`.
