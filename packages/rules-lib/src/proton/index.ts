/**
 * Proton SDK wrapper
 *
 * Provides TypeScript types and initialization helpers for proton-new-js WebAssembly SDK.
 * @packageDocumentation
 */

export { initProton, useProton } from './init';
export type {
  CheckError,
  CheckOptions,
  CheckResult,
  CheckResultError,
  CheckResultSuccess,
  CompleteOptions,
  Completion,
  CompletionItem,
  Fix,
  Profile,
  Proton,
  ProtonPoint,
  RuleContext,
  Segment,
  SegmentConstructors,
  Step,
  VersionInfo,
  Vocabulary,
} from './types';
