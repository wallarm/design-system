# Wallarm Design System

Modern React component library for building user interfaces.

## 📚 Documentation

All documentation is available in:

- [Storybook](https://wallarm.github.io/wallarm-design-system/) - Interactive component examples
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
import { ThemeProvider } from '@wallarm/design-system/ThemeProvider';
import { Button } from '@wallarm/design-system/Button';
import 'non.geist';
import 'non.geist/mono';
import './App.css';

export const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <Button variant="primary">Hello, World!</Button>
    </ThemeProvider>
  );
};
```

## ✨ Features

- **40+ components** - Complete set of UI elements
- **React 19** - Latest React version
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Modern styling system
- **Geist font** - Modern typography (non.geist)
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
- **Data display** - Badge, Tag, Code

## 🛠 Development

```bash
# Clone repository
git clone https://github.com/wallarm/design-system.git
cd wallarm-design-system

# Install dependencies
pnpm install

# Run Storybook
pnpm storybook

# Run tests
pnpm test

# Build library
pnpm build
```

## 📖 Resources

- [Storybook](https://wallarm.github.io/design-system/) - Interactive examples
- [NPM](https://www.npmjs.com/package/@wallarm/design-system) - NPM package
- [GitHub](https://github.com/wallarm/design-system) - Source code

## 📄 License

MIT © Wallarm
