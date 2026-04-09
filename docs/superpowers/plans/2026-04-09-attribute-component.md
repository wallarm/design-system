# Attribute Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a compound `Attribute` component that displays a labeled read-only value, with loading state and flexible value slot.

**Architecture:** Compound component pattern (like Alert) with three sub-components: `Attribute` (root with loading), `AttributeLabel` (label with info/description/link), `AttributeValue` (slot with empty state). Uses TestIdProvider for cascading test IDs.

**Tech Stack:** React 19, TypeScript, CVA, Tailwind CSS, Storybook 10, Vitest, Playwright

**Spec:** `docs/superpowers/specs/2026-04-09-attribute-component-design.md`

---

## File Structure

```
packages/design-system/src/components/Attribute/
├── Attribute.tsx           # Root: flex-col, loading prop, TestIdProvider
├── AttributeLabel.tsx      # Label with description, info tooltip, link slot
├── AttributeValue.tsx      # Value slot with automatic empty state
├── index.ts                # Barrel exports
├── Attribute.stories.tsx   # Storybook stories
```

**Modified files:**
- `packages/design-system/src/index.ts` — add Attribute exports (alphabetically between Alert and Badge)

---

### Task 1: Scaffold Attribute root component

**Files:**
- Create: `packages/design-system/src/components/Attribute/Attribute.tsx`
- Create: `packages/design-system/src/components/Attribute/index.ts`

- [ ] **Step 1: Create `Attribute.tsx`**

```tsx
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '../../utils/cn'
import { type TestableProps, TestIdProvider } from '../../utils/testId'
import { Skeleton } from '../Skeleton'

export interface AttributeProps
  extends HTMLAttributes<HTMLDivElement>,
    TestableProps {
  ref?: Ref<HTMLDivElement>
  /** Show skeleton placeholders instead of children */
  loading?: boolean
  children?: ReactNode
}

export const Attribute: FC<AttributeProps> = ({
  ref,
  loading = false,
  children,
  className,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='attribute'
        className={cn('flex flex-col', className)}
      >
        {loading ? (
          <>
            <Skeleton width='82px' height='16px' rounded={6} />
            <div className='pt-4'>
              <Skeleton width='100%' height='24px' rounded={6} />
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </TestIdProvider>
  )
}

Attribute.displayName = 'Attribute'
```

- [ ] **Step 2: Create `index.ts`**

```tsx
export { Attribute, type AttributeProps } from './Attribute'
```

- [ ] **Step 3: Register in main barrel file**

In `packages/design-system/src/index.ts`, add the Attribute export between Alert and Badge:

```tsx
// After the Alert exports block, before Badge:
export {
  Attribute,
  type AttributeProps,
} from './components/Attribute'
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm --filter @aspect/design-system typecheck`
Expected: PASS, no type errors

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/ packages/design-system/src/index.ts
git add packages/design-system/src/components/Attribute/Attribute.tsx packages/design-system/src/components/Attribute/index.ts packages/design-system/src/index.ts
git commit -m "feat(attribute): scaffold root Attribute component with loading state"
```

---

### Task 2: Create AttributeLabel sub-component

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeLabel.tsx`
- Modify: `packages/design-system/src/components/Attribute/index.ts`
- Modify: `packages/design-system/src/index.ts`

- [ ] **Step 1: Create `AttributeLabel.tsx`**

```tsx
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '../../utils/cn'
import { useTestId } from '../../utils/testId'
import { Info } from '../../icons'
import { Text } from '../Text'
import { Tooltip } from '../Tooltip'
import { TooltipContent } from '../Tooltip/TooltipContent'
import { TooltipTrigger } from '../Tooltip/TooltipTrigger'

export interface AttributeLabelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
  /** Label text */
  children?: ReactNode
  /** Hint text below the label */
  description?: ReactNode
  /** Content for info tooltip with Info icon */
  info?: ReactNode
  /** Which side to place the info icon */
  infoSide?: 'left' | 'right'
  /** Slot for Link component after label text */
  link?: ReactNode
}

const InfoIcon: FC<{ info: ReactNode }> = ({ info }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button type='button' className='inline-flex text-text-secondary cursor-help'>
        <Info size='xs' />
      </button>
    </TooltipTrigger>
    <TooltipContent>{info}</TooltipContent>
  </Tooltip>
)

export const AttributeLabel: FC<AttributeLabelProps> = ({
  ref,
  children,
  description,
  info,
  infoSide = 'right',
  link,
  className,
  ...props
}) => {
  const testId = useTestId('label')

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-label'
      className={cn('flex flex-col', className)}
    >
      <div className='flex items-center gap-4'>
        {info && infoSide === 'left' && <InfoIcon info={info} />}
        <Text size='sm' color='secondary'>
          {children}
        </Text>
        {info && infoSide === 'right' && <InfoIcon info={info} />}
        {link}
      </div>
      {description && (
        <Text size='sm' color='secondary'>
          {description}
        </Text>
      )}
    </div>
  )
}

AttributeLabel.displayName = 'AttributeLabel'
```

- [ ] **Step 2: Update `index.ts` with AttributeLabel export**

```tsx
export { Attribute, type AttributeProps } from './Attribute'
export { AttributeLabel, type AttributeLabelProps } from './AttributeLabel'
```

- [ ] **Step 3: Update main barrel file**

In `packages/design-system/src/index.ts`, expand the Attribute export block:

```tsx
export {
  Attribute,
  AttributeLabel,
  type AttributeLabelProps,
  type AttributeProps,
} from './components/Attribute'
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm --filter @aspect/design-system typecheck`
Expected: PASS, no type errors

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/ packages/design-system/src/index.ts
git add packages/design-system/src/components/Attribute/AttributeLabel.tsx packages/design-system/src/components/Attribute/index.ts packages/design-system/src/index.ts
git commit -m "feat(attribute): add AttributeLabel with info tooltip, description, link"
```

---

### Task 3: Create AttributeValue sub-component

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeValue.tsx`
- Modify: `packages/design-system/src/components/Attribute/index.ts`
- Modify: `packages/design-system/src/index.ts`

- [ ] **Step 1: Create `AttributeValue.tsx`**

```tsx
import { Children, type FC, type HTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from '../../utils/cn'
import { useTestId } from '../../utils/testId'
import { Text } from '../Text'

export interface AttributeValueProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
  children?: ReactNode
}

function isEmpty(children: ReactNode): boolean {
  return (
    children === undefined ||
    children === null ||
    children === false ||
    Children.count(children) === 0
  )
}

export const AttributeValue: FC<AttributeValueProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('value')

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-value'
      className={cn('pt-4 min-h-[28px]', className)}
    >
      {isEmpty(children) ? (
        <Text size='sm' color='secondary'>
          &mdash;
        </Text>
      ) : (
        children
      )}
    </div>
  )
}

AttributeValue.displayName = 'AttributeValue'
```

- [ ] **Step 2: Update `index.ts` with AttributeValue export**

```tsx
export { Attribute, type AttributeProps } from './Attribute'
export { AttributeLabel, type AttributeLabelProps } from './AttributeLabel'
export { AttributeValue, type AttributeValueProps } from './AttributeValue'
```

- [ ] **Step 3: Update main barrel file**

In `packages/design-system/src/index.ts`, expand the Attribute export block:

```tsx
export {
  Attribute,
  AttributeLabel,
  type AttributeLabelProps,
  type AttributeProps,
  AttributeValue,
  type AttributeValueProps,
} from './components/Attribute'
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm --filter @aspect/design-system typecheck`
Expected: PASS, no type errors

- [ ] **Step 5: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/ packages/design-system/src/index.ts
git add packages/design-system/src/components/Attribute/AttributeValue.tsx packages/design-system/src/components/Attribute/index.ts packages/design-system/src/index.ts
git commit -m "feat(attribute): add AttributeValue with automatic empty state"
```

---

### Task 4: Create Storybook stories

**Files:**
- Create: `packages/design-system/src/components/Attribute/Attribute.stories.tsx`

- [ ] **Step 1: Create `Attribute.stories.tsx`**

```tsx
import type { Meta, StoryFn } from 'storybook-react-rsbuild'
import { Badge } from '../Badge'
import { Code } from '../Code'
import { Link } from '../Link'
import { Text } from '../Text'
import { Attribute, type AttributeProps } from './Attribute'
import { AttributeLabel } from './AttributeLabel'
import { AttributeValue } from './AttributeValue'

const meta = {
  title: 'Data Display/Attribute',
  component: Attribute,
  subcomponents: {
    AttributeLabel,
    AttributeValue,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays a labeled read-only value for a single object attribute. ' +
          'Used in detail panels, drawers, and forms to present structured information. ' +
          'The value slot accepts text, badges, tags, code snippets, links, and other display components.',
      },
    },
  },
} satisfies Meta<typeof Attribute>

export default meta

export const Default: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Request ID</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>abc-123-def-456</Text>
      </AttributeValue>
    </Attribute>
  </div>
)

export const WithDescription: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel description='The time when the request was first received'>
        Created at
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>April 9, 2026, 14:32</Text>
      </AttributeValue>
    </Attribute>
  </div>
)

export const WithInfoRight: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel info='Unique identifier assigned to each incoming request'>
        Request ID
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>abc-123-def-456</Text>
      </AttributeValue>
    </Attribute>
  </div>
)

export const WithInfoLeft: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel info='Unique identifier assigned to each incoming request' infoSide='left'>
        Request ID
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>abc-123-def-456</Text>
      </AttributeValue>
    </Attribute>
  </div>
)

export const WithLink: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel
        link={
          <Link href='#' size='md'>
            View docs
          </Link>
        }
      >
        Source
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>API Gateway</Text>
      </AttributeValue>
    </Attribute>
  </div>
)

export const Empty: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel description='Not yet assigned'>Region</AttributeLabel>
      <AttributeValue />
    </Attribute>
  </div>
)

export const Loading: StoryFn<AttributeProps> = () => (
  <div className='w-[400px] flex flex-col gap-0'>
    <Attribute loading>
      <AttributeLabel>Created at</AttributeLabel>
      <AttributeValue />
    </Attribute>
    <Attribute loading>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue />
    </Attribute>
  </div>
)

export const WithBadge: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='success'>Active</Badge>
      </AttributeValue>
    </Attribute>
  </div>
)

export const WithTags: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Tags</AttributeLabel>
      <AttributeValue>
        <div className='flex items-center gap-4'>
          <Badge color='slate'>production</Badge>
          <Badge color='slate'>us-east-1</Badge>
          <Badge color='slate'>critical</Badge>
        </div>
      </AttributeValue>
    </Attribute>
  </div>
)

export const WithCodeSnippet: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Payload</AttributeLabel>
      <AttributeValue>
        <Code size='s'>{'{ "action": "login", "user_id": 42 }'}</Code>
      </AttributeValue>
    </Attribute>
  </div>
)

export const WithLink_Value: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute>
      <AttributeLabel>Documentation</AttributeLabel>
      <AttributeValue>
        <Link href='#' size='md'>
          View full report
        </Link>
      </AttributeValue>
    </Attribute>
  </div>
)

export const Composition: StoryFn<AttributeProps> = () => (
  <div className='grid grid-cols-2 gap-x-8 gap-y-0 w-[874px]'>
    <Attribute>
      <AttributeLabel info='Request timestamp'>Created at</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>April 9, 2026, 14:32</Text>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Status</AttributeLabel>
      <AttributeValue>
        <Badge color='success'>Active</Badge>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Source IP</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>34.74.73.20</Text>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Country</AttributeLabel>
      <AttributeValue>
        <Text size='sm'>Poland</Text>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel description='Not yet assigned'>Region</AttributeLabel>
      <AttributeValue />
    </Attribute>

    <Attribute loading>
      <AttributeLabel>Processing time</AttributeLabel>
      <AttributeValue />
    </Attribute>

    <Attribute>
      <AttributeLabel>Tags</AttributeLabel>
      <AttributeValue>
        <div className='flex items-center gap-4'>
          <Badge color='slate'>production</Badge>
          <Badge color='slate'>us-east-1</Badge>
        </div>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel
        link={
          <Link href='#' size='md'>
            Docs
          </Link>
        }
      >
        Rule ID
      </AttributeLabel>
      <AttributeValue>
        <Text size='sm'>rule-7842</Text>
      </AttributeValue>
    </Attribute>
  </div>
)
```

- [ ] **Step 2: Run storybook build check**

Run: `pnpm --filter @aspect/design-system typecheck`
Expected: PASS, no type errors

- [ ] **Step 3: Commit**

```bash
npx biome check --write packages/design-system/src/components/Attribute/Attribute.stories.tsx
git add packages/design-system/src/components/Attribute/Attribute.stories.tsx
git commit -m "feat(attribute): add Storybook stories for all Attribute variants"
```

---

### Task 5: Visual verification in Storybook

- [ ] **Step 1: Start Storybook dev server**

Run: `pnpm storybook`

- [ ] **Step 2: Verify all stories render correctly**

Open Storybook and check each story under `Data Display/Attribute`:
- Default — plain text value renders
- WithDescription — description text appears below label
- WithInfoRight — info icon on the right with tooltip on hover
- WithInfoLeft — info icon on the left
- WithLink — link renders after label
- Empty — en-dash shown in secondary color
- Loading — two skeletons render
- WithBadge — Badge renders in value slot
- WithTags — multiple badges in a row
- WithCodeSnippet — Code component renders
- WithLink_Value — Link renders in value slot
- Composition — two-column grid layout with mixed content

- [ ] **Step 3: Fix any visual issues found**

If styles or spacing don't match the Figma design, adjust Tailwind classes in the component files.

- [ ] **Step 4: Commit any fixes**

```bash
npx biome check --write packages/design-system/src/components/Attribute/
git add packages/design-system/src/components/Attribute/
git commit -m "fix(attribute): adjust styles after visual review"
```
