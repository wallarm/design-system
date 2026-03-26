# Feedback Pulse — Data Storage & Operations

## Overview

Where the feedback goes, how it's stored, who gets notified, and how to act on it.

---

## Architecture: Three Layers

```
User submits feedback
        │
        ▼
┌─────────────────┐
│   1. DATABASE    │  ← source of truth, every response stored
│   (PostgreSQL)   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌──────────────┐
│2. SLACK│  │ 3. JIRA      │
│ (live  │  │ (actionable  │
│  feed) │  │  items only) │
└────────┘  └──────────────┘
```

Each layer has a different purpose. Not everything goes everywhere.

---

## Layer 1: Database (Source of Truth)

### What to store

Every single response, no exceptions. This is your analytics source.

**Table: `feedback_pulse_responses`**

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `feature_id` | VARCHAR | Identifies the feature release (e.g., `filtering-v2`, `dashboard-threats`) |
| `feature_name` | VARCHAR | Human-readable feature name ("Advanced Filtering") |
| `score` | INTEGER | 1–5 CES rating |
| `comment` | TEXT | Free-form text, nullable |
| `user_id` | VARCHAR | Internal user ID |
| `user_email` | VARCHAR | For follow-up if needed |
| `account_id` | VARCHAR | Company/tenant ID |
| `account_name` | VARCHAR | Company name |
| `plan` | VARCHAR | Free / Pro / Enterprise — useful for segmenting |
| `role` | VARCHAR | User's role (admin, viewer, etc.) |
| `created_at` | TIMESTAMP | When the response was submitted |
| `session_url` | VARCHAR | Link to session replay if available (FullStory, LogRocket, etc.) |
| `page_url` | VARCHAR | Where the pulse was shown |
| `trigger_event` | VARCHAR | What action triggered the pulse |
| `time_to_respond_ms` | INTEGER | Time between pulse shown and rating submitted |
| `dismissed` | BOOLEAN | True if user closed without rating |
| `environment` | VARCHAR | Production / staging |

**Table: `feedback_pulse_config`**

| Column | Type | Description |
|---|---|---|
| `feature_id` | VARCHAR | Primary key |
| `feature_name` | VARCHAR | Human-readable name |
| `question_text` | VARCHAR | The question shown to users |
| `enabled` | BOOLEAN | Kill switch per feature |
| `started_at` | TIMESTAMP | When the pulse started showing |
| `ended_at` | TIMESTAMP | When to stop showing (auto-expire) |
| `target_responses` | INTEGER | Stop after N responses (optional cap) |
| `cooldown_days` | INTEGER | Override global cooldown if needed |

### Querying

Common queries the team will need:

```sql
-- Average score per feature
SELECT feature_id, feature_name,
       AVG(score) as avg_score,
       COUNT(*) as responses
FROM feedback_pulse_responses
WHERE dismissed = false
GROUP BY feature_id, feature_name
ORDER BY created_at DESC;

-- Low scores with comments (action items)
SELECT * FROM feedback_pulse_responses
WHERE score <= 2 AND comment IS NOT NULL
ORDER BY created_at DESC;

-- Response rate per feature
SELECT feature_id,
       COUNT(*) FILTER (WHERE dismissed = false) as rated,
       COUNT(*) FILTER (WHERE dismissed = true) as dismissed,
       ROUND(100.0 * COUNT(*) FILTER (WHERE dismissed = false) / COUNT(*), 1) as response_rate
FROM feedback_pulse_responses
GROUP BY feature_id;
```

---

## Layer 2: Slack (Live Feed)

### Purpose
Real-time visibility. The team sees feedback as it comes in — no need to check a dashboard.

### Setup
- Create a dedicated channel: **`#feedback-pulse`**
- Bot posts every response in near real-time (via webhook or Slack app)

### Message Format

**For ratings with comments:**
```
🟢 Feedback Pulse — Advanced Filtering

Score: ★★★★☆ (4/5)
Comment: "Love the new date range picker, but the tag selector is confusing"

User: jane@acme.com (Acme Corp, Enterprise)
Submitted: 2026-03-26 14:32 UTC
```

**For ratings without comments:**
```
🟡 Feedback Pulse — Advanced Filtering

Score: ★★★☆☆ (3/5)
No comment

User: john@startup.io (Startup Inc, Pro)
Submitted: 2026-03-26 14:45 UTC
```

**For low scores (1–2), make it loud:**
```
🔴 Low Score Alert — Advanced Filtering

Score: ★☆☆☆☆ (1/5)
Comment: "Completely broken on Safari, filters reset every time I switch tabs"

User: mike@bigcorp.com (BigCorp, Enterprise)
Submitted: 2026-03-26 15:01 UTC

→ Jira ticket auto-created: FP-42
```

### Slack Rules
- All responses go to `#feedback-pulse`
- Scores 1–2 also get cross-posted to `#product-alerts` (or wherever urgent product issues go)
- Weekly summary digest posted every Monday: avg score, total responses, top comments

---

## Layer 3: Jira (Actionable Items Only)

### Purpose
Not every response needs a ticket. Only create Jira issues for feedback that requires action.

### Project Setup
- **Project key**: `FP` (Feedback Pulse)
- **Issue type**: Task
- **Default assignee**: Product Owner or PM for the feature area

### Auto-Create Ticket When:
1. **Score is 1 or 2** AND **comment is not empty** — something is clearly wrong, with context
2. **Score is 1 or 2** AND **account is Enterprise tier** — high-value customer friction, even without comment

### Do NOT Auto-Create Ticket When:
- Score is 3+ (that's decent — analyze in aggregate, not per-ticket)
- Score is 1–2 but no comment (nothing actionable — track in aggregate)
- Duplicate — same user, same feature, same week

### Ticket Template

```
Title: [FP] {feature_name} — Score {score}/5 from {account_name}

Description:
Feature: {feature_name} ({feature_id})
Score: {score}/5
Comment: "{comment}"

User: {user_email}
Account: {account_name} ({plan})
Page: {page_url}
Submitted: {created_at}

---
Auto-created by Feedback Pulse.
Review and triage within 48 hours.
```

### Labels
- `feedback-pulse`
- `score-1` or `score-2`
- Feature-specific label (e.g., `filtering`, `dashboard`)

### Workflow
1. Ticket created → lands in **Triage** column
2. PM reviews within 48 hours
3. Either:
   - **Link to existing issue** if it's a known problem
   - **Create follow-up** if it's a new insight
   - **Close as noted** if it's subjective/not actionable

---

## Weekly Review Ritual

Every Monday, auto-generate and post to `#feedback-pulse`:

```
📊 Feedback Pulse — Weekly Summary (Mar 19–26)

Features active: 3
Total responses: 47
Overall avg score: 3.8/5

Feature breakdown:
• Advanced Filtering: 4.1/5 (23 responses) ✅
• Threat Dashboard: 3.2/5 (18 responses) ⚠️
• API Sessions v2: 4.5/5 (6 responses) ✅

Top comments (most frequent themes):
1. "Filtering is fast but tag selector needs work" (×4)
2. "Dashboard loading time is noticeable" (×3)

Action items created: 2 Jira tickets
```

This can be a scheduled script that queries the database and posts to Slack.

---

## Privacy & Retention

- **No PII in Slack messages beyond email** — no session recordings, no IP addresses
- **Jira tickets**: include email for follow-up context, but not full user metadata
- **Database retention**: keep responses for 12 months, then anonymize (remove user_email, replace user_id with hash)
- **GDPR**: if a user requests data deletion, remove their entries from `feedback_pulse_responses`
- **Opt-out**: respect any future "disable in-app surveys" user setting

---

## Implementation Priority

| Phase | What | Effort |
|---|---|---|
| **Phase 1** | Database table + API endpoint to receive responses | Backend, ~2 days |
| **Phase 2** | Slack webhook integration (post every response) | Backend, ~1 day |
| **Phase 3** | Jira auto-creation for low scores | Backend, ~1 day |
| **Phase 4** | Weekly summary script | Backend, ~0.5 day |
| **Phase 5** | Config table + admin UI to enable/disable per feature | Full-stack, ~2 days |

Total: ~6.5 dev days for the full pipeline. Phase 1 + 2 gets you 80% of the value.
