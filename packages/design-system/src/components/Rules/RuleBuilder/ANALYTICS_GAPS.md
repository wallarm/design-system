# RuleBuilder — Analytics Gaps

This file is the single source of truth for `RuleBuilder`'s analytics-readiness pattern, per
[`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md). It documents the
**wrapper-level, callback-based analytics integration** and records why internal interactive
elements have no direct `data-analytics-id` seam.

Audited: 2026-10-29 · Owner: Design System team — Rule Builder MVP

---

## Architecture: Wrapper-Level, Callback-Based

`RuleBuilder` is a **wrapper-level component** where analytics tracking happens via callbacks
(`onConditionChange`, `onActionChange`), not via `data-*` attributes on internal interactive elements.

### Why Wrapper-Level?

The component is a **complex rule authoring interface** composed of:
- **ConditionTree**: Nested condition groups with add/remove/edit operations
- **ActionEditor**: Action type selector with dynamic field sets per action type
- **Code output**: Generated JSON ruleset display

Instrumenting each internal element would:

1. **Pollute the API** with analytics-specific props for 100+ internal UI states (each condition
   type × each field × each button)
2. **Break encapsulation** — the guided rule authoring flow is the DS abstraction; exposing every
   internal action defeats the purpose
3. **Create maintenance burden** — internal refactoring (condition types, action fields, validation
   logic) would break analytics code
4. **Duplicate event sources** — the same logical action (e.g., "add condition") can be triggered
   via button click, keyboard shortcut, or drag-and-drop

Instead, the **callbacks are the analytics seam**: they fire on every meaningful state change with
the full rule model, allowing the consumer to derive analytics events from model diffs.

---

## Analytics Integration Pattern

### Consumer-Side Implementation

```typescript
<RuleBuilder
  ruleId="my-rule-1"
  ruleDescription="Detect SQL injection"
  condition={condition}
  action={action}
  onConditionChange={(newCondition) => {
    // Analytics tracking: compare previous vs new condition tree
    const diff = diffConditions(condition, newCondition);

    if (diff.added) {
      analytics.track('rule_builder.condition_added', {
        condition_type: diff.added.kind,
        parent_operator: diff.added.parent.operator,
        tree_depth: calculateDepth(newCondition),
      });
    }

    if (diff.removed) {
      analytics.track('rule_builder.condition_removed', {
        condition_id: diff.removed.id,
        condition_type: diff.removed.kind,
      });
    }

    // Update state
    setCondition(newCondition);
  }}
  onActionChange={(newAction) => {
    // Analytics tracking: action type change or field edit
    if (newAction.kind !== action.kind) {
      analytics.track('rule_builder.action_type_changed', {
        old_type: action.kind,
        new_type: newAction.kind,
      });
    }

    if (newAction.attackType !== action.attackType) {
      analytics.track('rule_builder.attack_type_selected', {
        attack_type: newAction.attackType,
        action_type: newAction.kind,
      });
    }

    // Update state
    setAction(newAction);
  }}
  // Root-level analytics attributes (optional)
  data-analytics-id="rule-editor-panel"
  data-analytics-props={JSON.stringify({
    rule_id: 'my-rule-1',
    context: 'http_request',
  })}
/>
```

### Why This Works

1. **Callbacks capture intent, not mechanics**: "condition added" is one event, regardless of whether
   the user clicked "Add Condition", pressed Ctrl+N, or dragged a template.

2. **Model diffs are more meaningful than DOM events**: Comparing `condition` vs `newCondition`
   reveals what logically changed (e.g., "added attack condition under OR group"), not just "button
   clicked".

3. **Zero DS complexity**: `RuleBuilder` remains a pure presentational component. Analytics logic
   lives in the consumer's onChange handler where it can access business context (user ID, session,
   A/B test variant).

4. **Refactoring safety**: Internal changes (e.g., replacing buttons with keyboard shortcuts, adding
   drag-and-drop) don't affect analytics code, as long as the model diff stays the same.

---

## Related Documentation

- [`docs/metrics/contract.md`](../../../../../docs/metrics/contract.md) — Analytics contract
- [`PointSelector/ANALYTICS_GAPS.md`](../PointSelector/ANALYTICS_GAPS.md) — Similar wrapper-level pattern
- [`Table/ANALYTICS_GAPS.md`](../Table/ANALYTICS_GAPS.md) — Another complex compound component
- [`docs/metrics/new-component-checklist.md`](../../../../../docs/metrics/new-component-checklist.md) — Component checklist

---

## Audit History

| Date | Auditor | Changes |
|------|---------|---------|
| 2026-10-29 | Design System team | Initial documentation for Rule Builder MVP |
