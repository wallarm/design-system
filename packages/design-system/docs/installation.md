# Installation

Complete guide for installing and setting up Wallarm Design System in your project.

## 📋 Requirements

Before you begin, make sure you have:

- **Node.js** version 18 or higher
- One of the package managers: **npm**, **pnpm** (recommended), or **yarn**

## 📦 Installation

### Step 1: Install the main library

```bash
# npm
npm install @wallarm-org/design-system

# yarn
yarn add @wallarm-org/design-system

# pnpm
pnpm add @wallarm-org/design-system
```

### Step 2: Install required peer dependencies

The library requires the following packages:

```bash
# npm
npm install react@^19.0.0 react-dom@^19.0.0 tailwindcss@^4.0.0 tw-animate-css@^1.0.0

# yarn
yarn add react@^19.0.0 react-dom@^19.0.0 tailwindcss@^4.0.0 tw-animate-css@^1.0.0

# pnpm
pnpm add react@^19.0.0 react-dom@^19.0.0 tailwindcss@^4.0.0 tw-animate-css@^1.0.0
```

⚠️ **Important**: All peer dependencies are required for the library to work correctly:

- `react` and `react-dom` - foundation for React components
- `tailwindcss` - styling system
- `tw-animate-css` - animations

## ⚙️ Project Setup

### Step 3: Import styles

Create a CSS file for your application:

```css
/* App.css */
@import 'tailwindcss';
@import 'tw-animate-css';
@import '@wallarm-org/design-system/theme';
```

### Step 4: Set up ThemeProvider and import styles

Wrap your application with `ThemeProvider`:

```tsx
// App.tsx
import { ThemeProvider } from '@wallarm-org/design-system/ThemeProvider';
import { Button } from '@wallarm-org/design-system/Button';
import './App.css';

export const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="wallarm-theme">
      <Button variant="primary">Hello, world!</Button>
    </ThemeProvider>
  );
};
```

## 🚨 Troubleshooting

### Problem: Styles are not applied

**Solution**: Make sure that:

1. Theme file `@wallarm-org/design-system/theme` is imported
2. Application is wrapped in `ThemeProvider`
3. CSS imports are in the correct order

### Problem: TypeScript import errors

**Solution**:

1. Check TypeScript version (should be 5.0+)
2. Add `"skipLibCheck": true` to `tsconfig.json`
3. Restart TypeScript server in your IDE

### Problem: React version conflict

**Solution**:

1. Ensure you're using React 19+
2. Clear node_modules and lock file
3. Reinstall dependencies

### Problem: Font not loading

**Solution**:

1. Ensure `@wallarm-org/design-system/theme` is imported — the Geist fonts are bundled with it
2. Check the Network tab in DevTools for the bundled Geist font requests

## 📚 Additional Configuration

### Bundle Optimization

The library supports tree-shaking. Import only the components you need:

```tsx
// ✅ Good - imports only Button
import { Button } from '@wallarm-org/design-system/Button';

// ❌ Bad - imports entire library
import { Button } from '@wallarm-org/design-system';
```

## 🎉 Done!

You can now use the design system components in your project.
