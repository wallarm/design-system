# Metrics Plan Migration

Analytics-readiness work is split into permanent documentation and an ephemeral rollout plan.

## Documentation (permanent)

- [docs/metrics/README.md](./docs/metrics/README.md)
- [docs/metrics/contract.md](./docs/metrics/contract.md)
- [docs/metrics/new-component-checklist.md](./docs/metrics/new-component-checklist.md)
- [docs/metrics/testing-examples.md](./docs/metrics/testing-examples.md)

## Migration Notes

- Canonical doc set created on 2026-05-22 in `docs/metrics/`.
- Plan and documentation were separated on 2026-05-22 so the rollout plan can be deleted without losing the contract or component inventory.
- Root `METRICS-PLAN.md` is a redirect / status page only.
- Component-local `packages/design-system/src/components/*/METRICS-PLAN.md` files were retired in the same migration.
