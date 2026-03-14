import { createContext, useContext } from 'react';

/**
 * Base interface for components that support `data-testid` cascading.
 *
 * Root compound components should extend this interface in their props type.
 * This ensures `data-testid` can be destructured and passed to `TestIdProvider`.
 */
export interface TestableProps {
  'data-testid'?: string;
}

const TestIdContext = createContext<string | undefined>(undefined);

/**
 * Provider that sets the base `data-testid` for compound component trees.
 *
 * Root components extract `data-testid` from props and wrap children
 * with this provider. Sub-components call `useTestId('slot')` to derive
 * their own `data-testid` automatically.
 *
 * @example
 * ```tsx
 * // Root component
 * <TestIdProvider testId={props['data-testid']}>
 *   {children}
 * </TestIdProvider>
 *
 * // Sub-component
 * const testId = useTestId('close') // "my-alert--close"
 * ```
 */
export const TestIdProvider = TestIdContext.Provider;

/**
 * Returns a derived `data-testid` for a sub-component slot.
 *
 * Format: `{baseTestId}--{slot}` (e.g. `"login-error--close"`)
 *
 * Returns `undefined` when no parent `TestIdProvider` exists or
 * when no `data-testid` was passed to the root component,
 * keeping the DOM clean.
 */
export function useTestId(slot: string): string | undefined {
  const base = useContext(TestIdContext);
  return base ? `${base}--${slot}` : undefined;
}
