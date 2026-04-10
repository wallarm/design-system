# SplitButton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a SplitButton wrapper component that visually attaches exactly 2 Button children into a single group (primary action + chevron dropdown).

**Architecture:** Pure CSS wrapper using flex layout with `gap-1` and `:first-child`/`:last-child` selectors to override border-radius on children. No context for variant propagation — consumers pass fully configured Button children. TestIdProvider cascades `data-testid`.

**Tech Stack:** React 19, CVA, Tailwind CSS, Storybook (storybook-react-rsbuild), Playwright E2E

**Spec:** `docs/superpowers/specs/2026-04-09-split-button-design.md`

---

### Task 1: Create classes.ts with CVA base styles

**Files:**
- Create: `packages/design-system/src/components/SplitButton/classes.ts`

- [ ] **Step 1: Create the CVA class definition**

```ts
import { cva } from 'class-variance-authority'

export const splitButtonVariants = cva([
  'inline-flex items-center gap-1',
  '[&>:first-child]:rounded-r-none',
  '[&>:last-child]:rounded-l-none',
])
```

Note: `gap-1` in this project's Tailwind config maps to 1px (matching the Figma `--spacing-1`). The `:first-child`/`:last-child` selectors have specificity 0-1-1, which overrides ButtonBase's `rounded-8` (specificity 0-1-0). No `[data-slot=button]` targeting because ButtonBase does not set `data-slot`.

- [ ] **Step 2: Commit**

```bash
git add packages/design-system/src/components/SplitButton/classes.ts
git commit -m "feat(split-button): add CVA base styles [WDS-101]"
```

---

### Task 2: Create SplitButton.tsx component

**Files:**
- Create: `packages/design-system/src/components/SplitButton/SplitButton.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ComponentPropsWithRef, FC, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { type TestableProps, TestIdProvider } from '../../utils/testId'
import { splitButtonVariants } from './classes'

export interface SplitButtonProps
  extends ComponentPropsWithRef<'div'>,
    TestableProps {
  children: ReactNode
}

export const SplitButton: FC<SplitButtonProps> = ({
  'data-testid': testId,
  className,
  children,
  ref,
  ...props
}) => (
  <TestIdProvider value={testId}>
    <div
      {...props}
      ref={ref}
      role="group"
      data-slot="split-button"
      data-testid={testId}
      className={cn(splitButtonVariants(), className)}
    >
      {children}
    </div>
  </TestIdProvider>
)

SplitButton.displayName = 'SplitButton'
```

- [ ] **Step 2: Commit**

```bash
git add packages/design-system/src/components/SplitButton/SplitButton.tsx
git commit -m "feat(split-button): add SplitButton component [WDS-101]"
```

---

### Task 3: Create index.ts and wire up root exports

**Files:**
- Create: `packages/design-system/src/components/SplitButton/index.ts`
- Modify: `packages/design-system/src/index.ts`

- [ ] **Step 1: Create the barrel export**

```ts
export { SplitButton, type SplitButtonProps } from './SplitButton'
```

- [ ] **Step 2: Add SplitButton to the root index.ts**

In `packages/design-system/src/index.ts`, find the alphabetically sorted exports and add after the `Select` exports (or wherever `S` section is):

```ts
export { SplitButton, type SplitButtonProps } from './components/SplitButton'
```

- [ ] **Step 3: Verify build compiles**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/SplitButton/index.ts packages/design-system/src/index.ts
git commit -m "feat(split-button): add exports [WDS-101]"
```

---

### Task 4: Create Storybook stories

**Files:**
- Create: `packages/design-system/src/components/SplitButton/SplitButton.stories.tsx`

- [ ] **Step 1: Create the stories file**

```tsx
import type { Meta, StoryFn } from 'storybook-react-rsbuild'
import { ChevronDown, CircleDashed } from '../../icons'
import { Button } from '../Button'
import { Heading } from '../Heading'
import { HStack, VStack } from '../Stack'
import { SplitButton } from './SplitButton'

const meta = {
  title: 'Actions/SplitButton',
  component: SplitButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SplitButton>

export default meta

export const Default: StoryFn<typeof meta> = () => (
  <SplitButton data-testid="split-button">
    <Button variant="primary" color="brand">
      Button
    </Button>
    <Button variant="primary" color="brand">
      <ChevronDown />
    </Button>
  </SplitButton>
)

export const Variants: StoryFn<typeof meta> = () => (
  <VStack>
    <Heading>Primary / Brand</Heading>
    <HStack>
      <SplitButton>
        <Button variant="primary" color="brand">Button</Button>
        <Button variant="primary" color="brand"><ChevronDown /></Button>
      </SplitButton>
    </HStack>

    <Heading>Outline / Neutral</Heading>
    <HStack>
      <SplitButton>
        <Button variant="outline" color="neutral">Button</Button>
        <Button variant="outline" color="neutral"><ChevronDown /></Button>
      </SplitButton>
    </HStack>

    <Heading>Secondary / Neutral</Heading>
    <HStack>
      <SplitButton>
        <Button variant="secondary" color="neutral">Button</Button>
        <Button variant="secondary" color="neutral"><ChevronDown /></Button>
      </SplitButton>
    </HStack>

    <Heading>Ghost / Neutral</Heading>
    <HStack>
      <SplitButton>
        <Button variant="ghost" color="neutral">Button</Button>
        <Button variant="ghost" color="neutral"><ChevronDown /></Button>
      </SplitButton>
    </HStack>

    <Heading>Secondary / Brand</Heading>
    <HStack>
      <SplitButton>
        <Button variant="secondary" color="brand">Button</Button>
        <Button variant="secondary" color="brand"><ChevronDown /></Button>
      </SplitButton>
    </HStack>

    <Heading>Ghost / Brand</Heading>
    <HStack>
      <SplitButton>
        <Button variant="ghost" color="brand">Button</Button>
        <Button variant="ghost" color="brand"><ChevronDown /></Button>
      </SplitButton>
    </HStack>
  </VStack>
)

export const Sizes: StoryFn<typeof meta> = () => (
  <HStack align="end" justify="center">
    <SplitButton>
      <Button variant="primary" color="brand" size="small">Small</Button>
      <Button variant="primary" color="brand" size="small"><ChevronDown /></Button>
    </SplitButton>
    <SplitButton>
      <Button variant="primary" color="brand" size="medium">Medium</Button>
      <Button variant="primary" color="brand" size="medium"><ChevronDown /></Button>
    </SplitButton>
    <SplitButton>
      <Button variant="primary" color="brand" size="large">Large</Button>
      <Button variant="primary" color="brand" size="large"><ChevronDown /></Button>
    </SplitButton>
  </HStack>
)

export const WithIcon: StoryFn<typeof meta> = () => (
  <VStack>
    <Heading>With left icon</Heading>
    <HStack>
      <SplitButton>
        <Button variant="primary" color="brand">
          <CircleDashed />
          Button
        </Button>
        <Button variant="primary" color="brand"><ChevronDown /></Button>
      </SplitButton>
      <SplitButton>
        <Button variant="outline" color="neutral">
          <CircleDashed />
          Button
        </Button>
        <Button variant="outline" color="neutral"><ChevronDown /></Button>
      </SplitButton>
    </HStack>

    <Heading>Icon only action</Heading>
    <HStack>
      <SplitButton>
        <Button variant="primary" color="brand">
          <CircleDashed />
        </Button>
        <Button variant="primary" color="brand"><ChevronDown /></Button>
      </SplitButton>
      <SplitButton>
        <Button variant="outline" color="neutral">
          <CircleDashed />
        </Button>
        <Button variant="outline" color="neutral"><ChevronDown /></Button>
      </SplitButton>
    </HStack>
  </VStack>
)
```

- [ ] **Step 2: Verify stories render**

Run: `pnpm --filter @wallarm-org/design-system storybook dev` (or the project's storybook command)
Navigate to `Actions/SplitButton` and verify all stories render correctly — buttons are visually attached with no inner border-radius and 1px gap.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/SplitButton/SplitButton.stories.tsx
git commit -m "feat(split-button): add Storybook stories [WDS-101]"
```

---

### Task 5: Create E2E tests

**Files:**
- Create: `packages/design-system/src/components/SplitButton/SplitButton.e2e.ts`

- [ ] **Step 1: Create the E2E test file**

```ts
import { expect, test } from '@playwright/test'
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook'

const splitButtonStory = createStoryHelper('actions-splitbutton', [
  'Default',
  'Variants',
  'Sizes',
  'With Icon',
] as const)

test.describe('Component: SplitButton', () => {
  test.describe('Visual', () => {
    test('Should render default split button correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default')
      await expect(page).toHaveScreenshot()
    })

    test('Should render all variant combinations correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'Variants')
      await expect(page).toHaveScreenshot()
    })

    test('Should render all sizes correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'Sizes')
      await expect(page).toHaveScreenshot()
    })

    test('Should render with icons correctly', async ({ page }) => {
      await splitButtonStory.goto(page, 'With Icon')
      await expect(page).toHaveScreenshot()
    })
  })

  test.describe('Interactions', () => {
    test('Should allow clicking each button independently', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default')
      const splitButton = page.getByTestId('split-button')
      await expect(splitButton).toBeVisible()

      const buttons = splitButton.getByRole('button')
      await expect(buttons).toHaveCount(2)
      await buttons.first().click()
      await buttons.last().click()
    })

    test('Should show focus ring when buttons are focused', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default')
      const splitButton = page.getByTestId('split-button')
      const buttons = splitButton.getByRole('button')

      await buttons.first().focus()
      await expect(buttons.first()).toBeFocused()
      await expect(page).toHaveScreenshot()
    })
  })

  test.describe('Accessibility', () => {
    test('Should have group role', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default')
      const group = page.getByTestId('split-button')
      await expect(group).toHaveRole('group')
    })

    test('Should support keyboard navigation between buttons', async ({ page }) => {
      await splitButtonStory.goto(page, 'Default')
      const splitButton = page.getByTestId('split-button')
      const buttons = splitButton.getByRole('button')

      await buttons.first().focus()
      await expect(buttons.first()).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(buttons.last()).toBeFocused()
    })
  })
})
```

- [ ] **Step 2: Run E2E tests to generate initial screenshots**

Run: `pnpm e2e --grep "SplitButton"` (or the project's E2E command)
Expected: Tests pass, screenshot baselines are generated.

- [ ] **Step 3: Commit**

```bash
git add packages/design-system/src/components/SplitButton/SplitButton.e2e.ts
git commit -m "test(split-button): add E2E tests [WDS-101]"
```

---

### Task 6: Lint, format, final verification

- [ ] **Step 1: Run linter and formatter**

```bash
npx biome check --write packages/design-system/src/components/SplitButton/
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm --filter @wallarm-org/design-system typecheck
```
Expected: No TypeScript errors.

- [ ] **Step 3: Run unit tests**

```bash
pnpm --filter @wallarm-org/design-system test
```
Expected: All tests pass.

- [ ] **Step 4: Commit any formatting changes**

```bash
git add -u
git commit -m "style(split-button): apply biome formatting [WDS-101]"
```
