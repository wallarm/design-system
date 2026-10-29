# @wallarm-org/rules-lib

Proton SDK integration, point grammar types, and rule data models for Wallarm WADS.

## Overview

This package provides:

- **Proton SDK integration**: WebAssembly-based point validation and parsing
- **Point grammar types**: TypeScript definitions for point segments and validation
- **Rule data models**: Type-safe structures for Wallarm rules
- **UI components**: Point selector and rule builder components (exported from `@wallarm-org/design-system`)

## Installation

```bash
pnpm add @wallarm-org/rules-lib
```

## Proton SDK Integration

The package includes the Proton SDK for validating and parsing Wallarm points. The SDK is a WebAssembly module (~75KB brotli) that compiles on first load (~2ms).

### Basic Usage

```typescript
import { initProton } from '@wallarm-org/rules-lib';

// Initialize SDK (safe to call multiple times - returns cached instance)
const proton = await initProton();

// Validate a point
const result = proton.point.check('[http:header:authorization]');
if (result.ok) {
  console.log('Canonical form:', result.canonical);
  console.log('Exact match:', result.exact);
} else {
  console.log('Error:', result.error.message);
  console.log('Position:', result.error.span);
}
```

### React Hook

```typescript
import { useProton } from '@wallarm-org/rules-lib';

function PointEditor() {
  const [proton, error, retry] = useProton();

  if (error) {
    return (
      <div>
        Error loading SDK: {error.message}
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  if (!proton) {
    return <div>Loading SDK...</div>;
  }

  return <PointSelector proton={proton} />;
}
```

### WASM Loading

The SDK automatically detects the WASM file location in production builds (webpack, rslib).

For Vite development servers, you must pass the WASM URL explicitly:

```typescript
import { initProton } from '@wallarm-org/rules-lib';
import wasmUrl from 'proton-new-js/proton-point.wasm?url';

const proton = await initProton(wasmUrl);
```

### Performance

- **Bundle size**: ~75KB (brotli compressed)
- **Load time**: ~2ms WASM compilation on first call
- **Runtime**: Native speed validation and parsing
- **Caching**: Instance is cached - subsequent calls return immediately

### API Overview

```typescript
// Point validation
const result = proton.point.check('[http:header:*]', {
  profile: 'tree',           // 'tree' | 'grammar' | 'value'
  context: 'http_request',   // Rule context
});

// Autocomplete
const completion = proton.point.complete(
  '[http:',
  6,  // cursor position
  {
    keys: ['authorization', 'cookie', 'content-type'],  // Custom keys
  }
);

// Parse to segments
const segments = proton.point.parse('[http:header:authorization]');
// [{ kind: 'class', class: 'http', member: 'header' }, ...]

// Render segments back
const canonical = proton.point.render(segments);
// '[http:header:authorization]'

// Get SDK version
const version = proton.version();
console.log(version.canonical);  // '1.0.0'
```

### Testing

For unit tests, use the mock implementation instead of loading the real WASM:

```typescript
// In your test setup (vitest.config.ts, jest.config.js)
{
  moduleNameMapper: {
    '^@wallarm-org/rules-lib$': '@wallarm-org/rules-lib/src/__mocks__/proton'
  }
}
```

The mock provides basic validation without WASM compilation:

```typescript
import { getMockProton } from '@wallarm-org/rules-lib/src/__mocks__/proton';

test('validates points', () => {
  const proton = getMockProton();
  const result = proton.point.check('[http:header:authorization]');
  expect(result.ok).toBe(true);
});
```

## Point Grammar Types

```typescript
import type {
  CheckResult,
  CheckOptions,
  Completion,
  Segment,
  Proton,
} from '@wallarm-org/rules-lib';
```

See [`src/proton/types.ts`](./src/proton/types.ts) for full type definitions.

## Rule Data Models

```typescript
import type {
  RuleAction,
  RuleCheck,
  RuleDefinition,
  RuleTarget,
} from '@wallarm-org/rules-lib';
```

## UI Components

Point selector and rule builder components are exported from `@wallarm-org/design-system`:

```typescript
import { PointSelector, RuleBuilder } from '@wallarm-org/design-system';
```

See the [design system documentation](../design-system/README.md) for component usage.

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## License

MIT
