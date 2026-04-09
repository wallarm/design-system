# Feedback Pulse — When & How to Use

## Guiding Principle

Show the pulse **once**, at the **right moment**, for **meaningful releases only**. The user should feel like we genuinely care about their opinion — not like we're pestering them.

---

## What Qualifies for a Feedback Pulse

### Show it for:
- **New pages or views** — new dashboard, new report screen, new settings section
- **New workflows** — new filtering flow, new rule creation wizard, new onboarding sequence
- **Major feature additions** — new attack type detection, new integration, new API capability
- **Significant UX overhauls** — redesigned navigation, reworked data tables, new visualization type

### Do NOT show it for:
- Bug fixes
- Copy/text changes
- Performance improvements (invisible to user)
- Minor UI tweaks (icon swap, color adjustment, spacing fix)
- Backend-only changes
- Incremental iterations on already-pulsed features

### Grey area (use judgment):
- Feature enhancements that meaningfully change how the user interacts with an existing flow — yes, if the change is noticeable
- New settings or configuration options — only if it's a standalone experience, not just a new toggle

**Rule of thumb**: if the release has its own changelog entry with a title and description, it probably qualifies. If it's a bullet point under "improvements" — it doesn't.

---

## When to Trigger

### The Moment

Show the feedback pulse after the **first successful completion** of the new feature's core action. Not on page load. Not on hover. After the user has actually done the thing.

| Feature type | Trigger moment |
|---|---|
| New filtering flow | User applies a filter and sees results |
| New dashboard | User has been on the dashboard for 15+ seconds (enough to scan) |
| New rule creation | User successfully saves a new rule |
| New integration | User completes the integration setup |
| New report/view | User interacts with the content (scroll, click, expand) |

### Why "after first success"
- The user has enough context to give meaningful feedback
- They've experienced the value (or lack of it)
- It doesn't interrupt their task — they just completed something
- It feels natural, not intrusive

### Positioning
- Bottom-right corner of the viewport, floating above content
- Appears with a subtle slide-up animation
- Does not block any UI elements or CTAs

---

## Frequency Rules

### Per feature
- Show **once per user per feature release**
- If the user dismisses (X) without rating — do not show again for this feature
- If the user rates but doesn't submit text — that's fine, count it as complete
- If the user submits — done, never show again for this feature

### Global cooldown
- **Maximum 1 feedback pulse per user per 7 days**
- If multiple features ship in the same week, prioritize the most impactful one
- Queue others for the following week (if still relevant)

### Session rules
- Do not show on the user's first session ever (they're still orienting)
- Do not show within the first 2 minutes of a session (let them settle in)
- Do not show if the user is in the middle of a multi-step flow (wait until completion)
- Do not show if another modal, dialog, or popover is already visible

---

## User Segments

### Who sees it
- All active users who have access to the new feature
- Both free and paid tiers (feedback from both is valuable)

### Who doesn't see it
- Users who haven't logged in since the feature shipped (they haven't used it)
- Users whose role doesn't have access to the feature
- Users who have opted out of in-app surveys (if such a setting exists)

---

## Lifecycle of a Feedback Pulse

```
Feature ships
    │
    ▼
User accesses the feature area
    │
    ▼
User completes core action (first success)
    │
    ├── Cooldown check: was a pulse shown in the last 7 days?
    │       │
    │       YES → Queue for later / skip
    │       │
    │       NO ──▼
    │
    ▼
Show feedback-pulse (State=Rating)
    │
    ├── User clicks X → Dismiss. Mark as "declined". Do not show again for this feature.
    │
    ├── User selects a number → Transition to State=Feedback
    │       │
    │       ├── User types feedback + clicks Send → Submit. Transition to State=Submitted (auto-dismiss).
    │       │
    │       ├── User clicks Send without typing → Submit rating only. Transition to State=Submitted.
    │       │
    │       └── User clicks X → Submit rating only (they already voted). Mark as complete.
    │
    └── User ignores it (no interaction for 30 seconds) → Auto-dismiss quietly. Mark as "seen, no action".
            Do not show again for this feature.
```

---

## Data to Capture

| Field | Type | Required |
|---|---|---|
| `feature_id` | string | yes — identifies which release |
| `score` | integer (1–5) | yes — the CES rating |
| `comment` | string | no — free-form text |
| `user_id` | string | yes — who gave feedback |
| `timestamp` | datetime | yes |
| `session_context` | string | no — what page/action triggered it |
| `dismissed` | boolean | yes — if user closed without rating |
| `time_to_respond` | integer (ms) | no — how long between showing and rating |

---

## Integration Checklist for Engineers

When shipping a new feature with a feedback pulse:

1. **Tag the feature** with a unique `feature_id` in the feedback pulse config
2. **Define the trigger event** — what constitutes "first successful completion"
3. **Set the question text** (or use the default "How easy was it to use this feature?")
4. **Verify cooldown** — ensure the 7-day global cooldown is respected
5. **Test the flow**: trigger → rate → send → submitted → auto-dismiss
6. **Test edge cases**: dismiss, ignore, multiple features queued
7. **Verify analytics** — score + comment are logged correctly

---

## Measuring Success

### Per feature
- **Response rate**: % of users who saw the pulse and rated (target: >30%)
- **Average CES score**: 1–5 scale (target: >3.5 for new features)
- **Comment rate**: % who also left a text comment (target: >15%)

### Overall program health
- **Dismiss rate**: if >60% of users dismiss without rating, the pulse is too frequent or poorly timed
- **Opt-out rate**: if users ask to disable surveys, reduce frequency
- **Score trends**: track CES over time per feature to see if iteration improves it
