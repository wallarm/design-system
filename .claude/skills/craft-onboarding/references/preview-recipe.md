# Preview recipe — give the requester something to SEE

A PM/designer shouldn't have to read `.tsx` to know what they're getting. The no-code
analog of "preview on staging" is a **runnable Storybook story whose `play` function
auto-runs the tour**, which you then render and hand back as a screenshot/URL.

Two artifacts, in this order:
1. **`FeatureTour.stories.tsx`** — the previewable demo (the requester's deliverable).
2. The raw wiring (`steps` + `useTour` + `<Tour/>`) — the engineering-facing artifact
   (from `tour-recipes.md`).

## The story skeleton
Render the target screen (or a light mock of it if the real screen isn't importable in
isolation) with the tour wired, and drive it in `play` so it demos itself.

```tsx
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { FeatureTour } from './FeatureTour' // the component the skill wired in Step 7

const meta = {
  title: 'Onboarding/<Feature> Tour',
  component: FeatureTour,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FeatureTour>
export default meta
type Story = StoryObj<typeof meta>

// Auto-plays the tour so a reviewer sees it run without clicking anything.
export const Walkthrough: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByTestId('tour-start')) // or the on-demand trigger
    // step through a couple of beats so the demo advances; keep it a smoke demo, not a test suite
    await waitFor(() => expect(canvas.getByText(/* first step title */ '')).toBeVisible())
    // for read-and-Next steps: press ArrowRight / click "Next"; for waitForStepEvent steps, perform the real action
  },
}
```
- Use `storybook/test` (`within` / `userEvent` / `waitFor` / `expect`) — the repo's
  Storybook stories already import from `storybook-react-rsbuild`; match that.
- Keep `play` a **smoke demo** (start → advance a beat or two → finish), not a full
  interaction-test — assertions belong in the component's `*.e2e.ts`.
- For `waitForStepEvent` steps, `play` performs the real action (click/type) so the
  tour advances exactly as a user would drive it.

## Render it (so the requester gets a visual)
After writing the story, render and capture it — confirm the exact entry point in this
environment (the research flagged it as present but unverified):
- **Storybook MCP** if available — generate/preview the story, grab the URL.
- Else **`Claude_Preview`** (`preview_start` → navigate to the story → `preview_screenshot`),
  or the Playwright MCP against the running Storybook.
- Hand back: a screenshot and/or the Storybook story URL, plus a one-line "here's what
  it does."

## If you can't render
Don't block. Deliver the story file + the wiring, and say "open
`FeatureTour.stories.tsx` in Storybook to preview" — then **park the preview gap in
`FIELD_NOTES.md`** so the harvest can make rendering reliable.
