# Task 12
Added claude-design job to deploy-site.yml (guard step output gates later steps, contents:write, tar layout project/file-hashes.json/summary.json, gh release upload --clobber, summary to step summary). Rewrote SKILL.md (9 steps). actionlint: clean. pnpm test:harness: 12/12 pass.

## Fix round 1
SKILL step 6 now drops unapproved remove paths and explains the expected check output; artifactUrl and base_version chaining stated; deploy-site guard uses env TAG; release existence checked via gh release view before upload.
Commands: actionlint .github/workflows/deploy-site.yml -> clean; pnpm test:harness -> pass 12, fail 0.
