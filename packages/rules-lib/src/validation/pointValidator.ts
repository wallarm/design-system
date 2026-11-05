/**
 * Point Validator
 *
 * Thin wrapper over Proton SDK for point validation and canonicalization.
 * All validation logic lives in the SDK (same WASM code as proton engine).
 */

import type { CheckOptions, CheckResult, Proton } from '../proton/types';

/**
 * Validate point using proton SDK
 *
 * Simple wrapper for type safety. All logic in SDK.
 *
 * @example
 * ```typescript
 * const proton = await initProton();
 * const result = validatePoint(proton, "[http:header]['authorization']", {
 *   profile: 'tree',
 *   context: 'http_request'
 * });
 *
 * if (result.ok) {
 *   console.log('Valid point:', result.canonical);
 * } else {
 *   console.error('Invalid:', result.error.message);
 * }
 * ```
 */
export function validatePoint(
  proton: Proton,
  point: string,
  options: CheckOptions = {},
): CheckResult {
  return proton.point.check(point, options);
}

/**
 * Get canonical form (returns null if invalid)
 *
 * @example
 * ```typescript
 * const canonical = canonicalizePoint(proton, "[http:body][json]['role'|'name']", {
 *   context: 'http_request'
 * });
 * // → "[http:body][format:json]['name'|'role']" (sorted alternation)
 * ```
 */
export function canonicalizePoint(
  proton: Proton,
  point: string,
  options: CheckOptions = {},
): string | null {
  const result = proton.point.check(point, options);
  return result.ok ? result.canonical : null;
}

/**
 * Check if point is exact (one node shape, no wildcards/alternations/ordinals)
 *
 * @example
 * ```typescript
 * isExactPoint(proton, "[http:header]['cookie']") // → true
 * isExactPoint(proton, "[http:header][*]") // → false (wildcard)
 * isExactPoint(proton, "[http:header]['a'|'b']") // → false (alternation)
 * ```
 */
export function isExactPoint(proton: Proton, point: string, options: CheckOptions = {}): boolean {
  const result = proton.point.check(point, options);
  return result.ok && result.exact;
}
