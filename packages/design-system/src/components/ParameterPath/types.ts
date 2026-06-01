import type { HTMLAttributes, Ref } from 'react';
import type { TestableProps } from '../../utils/testId';
import type { HttpMethodName } from '../HttpMethod';

export interface CopyFormatData {
  method?: HttpMethodName;
  segments: string[];
  encoding?: string;
}

// Cmd/Ctrl+C uses the native onCopy handler, which needs a real text selection.
// Do not place ParameterPath inside a `user-select: none` ancestor or copy
// silently falls back to the empty browser default.
export interface ParameterPathProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onCopy'>,
    TestableProps {
  ref?: Ref<HTMLDivElement>;
  method?: HttpMethodName;
  segments: string[];
  encoding?: string;
  attack?: boolean;
  /**
   * Opt in to click-to-expand. When `true`, a *truncated* path becomes
   * interactive: clicking the `…` collapse indicator (or the path) expands it
   * inline to show every segment, and clicking again collapses it back to
   * `first … last`. No effect when the path already fits without truncation.
   *
   * `expandable` only controls the affordance (whether the user can toggle);
   * the open/closed state is owned by `expanded` / `defaultExpanded`.
   */
  expandable?: boolean;
  /**
   * Controlled expanded state. When provided, the component does not manage its
   * own state — pair it with {@link onExpandedChange}.
   */
  expanded?: boolean;
  /**
   * Initial expanded state for the uncontrolled case. Ignored when `expanded`
   * is provided. Defaults to `false`.
   */
  defaultExpanded?: boolean;
  /**
   * Called with the next expanded state whenever the user toggles the path.
   * Required for controlled usage; also useful for analytics in the
   * uncontrolled case.
   */
  onExpandedChange?: (expanded: boolean) => void;
  copyFormat?: (data: CopyFormatData) => string;
}
