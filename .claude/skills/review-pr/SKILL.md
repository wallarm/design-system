# Pull Request Review

Review a pull request for code quality, design system compliance, and CI/CD readiness.

## Usage

```
/review-pr [PR number or URL]
```

If no PR number is provided, review the current branch's diff against main.

## Instructions

### Step 1: Gather Context

1. If PR number provided: `gh pr view <number> --json title,body,files,additions,deletions,commits`
2. If no PR: `git diff main...HEAD` and `git log main..HEAD --oneline`
3. Read all changed files to understand the full scope

### Step 2: Review Checklist

For each changed file, evaluate against these categories:

#### Code Quality
- [ ] No `any` types in TypeScript
- [ ] No unused imports or variables
- [ ] Proper error handling
- [ ] No hardcoded values that should be tokens
- [ ] Functions are reasonably sized and focused

#### Design System Compliance (for component changes)
- [ ] Uses CVA for variant definitions
- [ ] Uses `cn()` for className merging
- [ ] Has `data-slot` attribute on root element
- [ ] Has `displayName` set
- [ ] Supports `ref` forwarding
- [ ] Supports `className` prop
- [ ] Types are exported from `index.ts`
- [ ] Registered in main `src/index.ts` (new components)
- [ ] Uses design tokens, not hardcoded colors/spacing

#### Storybook Stories (for component changes)
- [ ] Stories exist for all variants
- [ ] Correct Storybook category in `title`
- [ ] Props have appropriate `argTypes` controls
- [ ] Stories use `satisfies Meta<typeof Component>`

#### Testing
- [ ] Unit tests for utilities and logic
- [ ] E2E tests for visual regression (new components)
- [ ] Tests follow naming conventions from `docs/e2e-test-rules.md`

#### Accessibility
- [ ] Semantic HTML elements used
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient

#### Commit Conventions
- [ ] PR title follows conventional commits format
- [ ] Commit messages are descriptive

### Step 3: Output Format

Provide a structured review with:

1. **Summary** — What the PR does in 1-2 sentences
2. **Verdict** — APPROVE / REQUEST_CHANGES / COMMENT
3. **Issues** — Categorized list of problems found (if any)
   - 🔴 **Blockers** — Must fix before merge
   - 🟡 **Suggestions** — Should fix, but not blocking
   - 🟢 **Nits** — Optional improvements
4. **Positive** — What was done well (always include at least one)

### Step 4: Verification (if changes are local)

Run quality checks:
```bash
pnpm typecheck
pnpm lint
pnpm test:run
```

Report any failures as blockers.
