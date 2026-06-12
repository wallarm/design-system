# How to write a component's AI usage file

*A short guide for designers. You don't need to be technical — the AI does the heavy lifting; you bring the judgment.*

## What you're doing, and why

Each design-system component gets one short usage file — `<Component>.llm.md` — that tells AI coding tools **when to use it, when not, and what's locked**: the design judgment they can't read from the code. With these in place, when a PM or engineer builds UI with AI and no designer is in the room, the result comes out on-brand. (Background: the [strategy doc](./ai-ready-ds-strategy.md).)

You won't write these by hand. A skill drafts each one from the code and asks you only the few things it can't figure out on its own.

## One-time setup

1. Open the `design-system` repo in **Claude Code**.
2. Get on the shared branch — tell Claude: *"switch me to the `llm-design-context` branch and pull latest."*
   *(The skill lives on this branch for now, so you must be on it for `/describe-component` to work.)*
3. From the [coverage tracker](./ai-ready-ds-coverage.md), pick a component nobody else has claimed and put your name on it.

## For each component — a fresh chat each time

1. **Start a new chat.** One component per chat keeps things clean.
2. **Trigger the skill:** type `/describe-component ComponentName` (e.g. `/describe-component ResponseCode`).
3. **Work with the skill.** The **bold** steps are the only ones that need you:
   - It may ask *"Figma URL? (optional)"* — **paste one if you have it**, or say *skip*.
   - It reads the code and writes a first draft — *just wait.*
   - **It asks you a few questions** — the boundaries ("where should this NOT be used?"), the gotchas, the non-obvious calls. **Answer in plain words.** It asks a couple at a time and keeps going until the file is solid. *This is the real work — a few minutes of your judgment.*
   - It runs a quick **self-test** (hands a blank AI the draft + trick prompts) and shows you the score.
   - **It shows you the finished file** — read it, then say *"good"* or *"change X."*
4. **Save & share:** tell Claude *"commit this and push to the branch."* It writes the file, commits, and pushes to `llm-design-context`. Tick the component off the tracker.
5. **Next component → new chat.**

## What "good" looks like

- **Short** — around 25 lines. It captures *judgment*, not props or colors (the code already has those).
- Read the reference example: [`HttpMethod.llm.md`](../packages/design-system/src/components/HttpMethod/HttpMethod.llm.md).
- The shape is fixed by the [template](../.claude/skills/describe-component/references/llm-md-template.md) — you don't need to memorize it; the skill follows it.

## A few tips

- **Lead with boundaries.** "Where would you NOT use this?" is the single most valuable thing you can answer.
- **Don't describe props or colors.** If the code already says it, leave it out.
- **Partial is fine.** If you're unsure about something, the skill marks it `TODO` and you move on — an 80% file beats none.
- **Skip the obvious ones.** Commodity primitives (Button, Badge, Stack) the AI already half-knows — focus on the Wallarm-specific components.

## When the whole batch is done

The team opens one pull request — `llm-design-context` → `main` — and the lead frontend engineer reviews and merges. From then on, every covered component teaches the AI how to use it.
