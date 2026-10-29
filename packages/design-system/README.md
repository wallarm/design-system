# Wallarm Design System

Modern React component library for building user interfaces.

## 📚 Documentation

All documentation is available in:

- [Docs site](https://wallarm.github.io/design-system/) - Guides, component docs and API reference
- [Storybook](https://wallarm.github.io/design-system/storybook/) - Interactive component examples
- [Installation Guide](docs/installation.md) - Setup instructions
- [Getting Started](docs/getting-started.md) - Introduction and overview

Run Storybook locally:

```bash
pnpm storybook
```

## 🚀 Quick Start

See [Installation Guide](docs/installation.md) for detailed setup instructions.

### Basic Example

```tsx
// App.tsx
import { ThemeProvider } from '@wallarm-org/design-system/ThemeProvider';
import { Button } from '@wallarm-org/design-system/Button';
import './App.css';

export const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <Button variant="primary">Hello, World!</Button>
    </ThemeProvider>
  );
};
```

`ThemeProvider` also controls the Frame style (`useTheme().setFrameStyle`, `'neutral' | 'branded'`) - see [Installation Guide](docs/installation.md) for details.

```css
/* App.css */
@import 'tailwindcss';
@import 'tw-animate-css';
@import '@wallarm-org/design-system/theme';

body {
    background-color: var(--color-bg-surface-1)
}
```

## ✨ Features

- **100+ components** - Complete set of UI elements
- **React 19** - Latest React version
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Modern styling system
- **Geist font** - Modern typography (bundled, self-hosted)
- **Animations** - Built-in animations (tw-animate-css)
- **Theming** - Light and dark themes
- **Accessibility** - ARIA compliance
- **Tree-shaking** - Optimal bundle size

## 📦 Core Components

- **Buttons and controls** - Button, Link, ToggleButton
- **Forms** - Input, Select, Checkbox, Radio, Switch
- **Feedback** - Alert, Toast, Tooltip, Loader
- **Modals** - Dialog, Drawer, Popover
- **Navigation** - Tabs, Breadcrumbs, SegmentedControl
- **Layout** - Stack, Flex, ScrollArea
- **Data Display** - Badge, Tag, Code

## 🛠 Development

```bash
# Clone repository
git clone https://github.com/wallarm/design-system.git
cd design-system

# Install dependencies
pnpm install

# Run Storybook
pnpm storybook

# Run tests
pnpm test

# Build library
pnpm build
```

### Icons from Figma

Icons in `src/icons/` are generated from the [WADS-Iconography](https://www.figma.com/design/ezgUqbCqEBXqC4ViRausYIAN/WADS-Iconography?node-id=5702-845) Figma page — don't edit them by hand.

To get a `FIGMA_ACCESS_TOKEN`:

1. Sign in to Figma with the account that can open WADS-Iconography (your Wallarm account, not a personal one).
2. Account menu (top left) → **Settings** → **Security** → **Personal access tokens** → **Generate new token**.
3. Name it (e.g. `wallarm-icons-sync`), pick an expiration, and set the scopes: **File content → Read-only**. Leave every other scope at **No access** — the sync only reads the page and exports SVGs.
4. Copy the token right away — Figma shows it only once.
5. Add `FIGMA_ACCESS_TOKEN=figd_…` to the repo-root `.env.local` (git-ignored). Never commit it or paste it into chats or PRs. If it leaks, revoke it on the same Settings page.

Then:

```bash
pnpm --filter @wallarm-org/design-system icons:sync --dry-run             # what's new in Figma
pnpm --filter @wallarm-org/design-system icons:sync --category 'Edit & Text'  # add new icons, refresh the rest
pnpm --filter @wallarm-org/design-system icons:sync --only Bell,BellOff    # refresh just these
```

The command writes the component files, `src/icons/index.ts`, the gallery category (`module/const.ts`) and Code Connect (`module/Icons.figma.batch.json` + its `Icons.figma.batch.ts` template). `scripts/icons/manifest.json` maps Figma nodes to component names, and also holds excluded nodes and the `keep` list of hand-maintained icons. When a new layer's name collides with an existing icon, map it there. Brand icons without a Neutral variant in Figma get a generated `*Neutral` twin. Commit with `[update-screenshots]` so CI refreshes the icon gallery baselines.

## Claude Design

Choose **Wallarm Design System** in Claude Design to prototype with the generated component
bundle, tokens, fonts and icons. See the [designer guide](../../apps/docs/docs/ai/claude-design.mdx).
After the normal package build, run `pnpm --filter @wallarm-org/design-system build:claude-design`
to generate the ignored `.claude-design/project/` folder. The repository's `/claude-design-sync`
skill previews and manually publishes release changes; the first sync and remote deletions
require confirmation. The npm package remains React 19; the separate canvas bundle uses React 18.

## 📖 Resources

- [Docs site](https://wallarm.github.io/design-system/) - Guides and component docs
- [Storybook](https://wallarm.github.io/design-system/storybook/) - Interactive examples
- [NPM](https://www.npmjs.com/package/@wallarm-org/design-system) - NPM package
- [GitHub](https://github.com/wallarm/design-system) - Source code

## 📄 License

MIT © Wallarm
