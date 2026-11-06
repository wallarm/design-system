import { type FC, type HTMLAttributes, type ReactNode, type Ref, useContext, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import {
  pieChartCenterClasses,
  pieChartCenterLabelClasses,
  pieChartCenterValueClasses,
} from './classes';
import { PieChartActiveContext, PieChartDataContext, type PieChartDatum } from './PieChartContext';

export interface PieChartCenterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export const PieChartCenter: FC<PieChartCenterProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('center');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='pie-chart-center'
      data-testid={testId}
      aria-hidden='true'
      className={cn(pieChartCenterClasses, className)}
    />
  );
};

PieChartCenter.displayName = 'PieChartCenter';

const defaultFormatHoveredValue = (datum: PieChartDatum): ReactNode => datum.value.toLocaleString();

export interface PieChartCenterValueProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /**
   * When `true` (default), hovering a slice or legend row replaces `children` with the
   * hovered datum's value (formatted via `formatHoveredValue`). Set to `false` to keep
   * `children` visible regardless of hover state — useful when the centre value should
   * always reflect the unfiltered total.
   */
  hoverSync?: boolean;
  /**
   * Formatter applied to the hovered datum when `hoverSync` is enabled. Defaults to
   * `datum.value.toLocaleString()`. Pass a custom formatter to keep the hover format
   * aligned with whatever formatter produced `children` (e.g. compact notation, units).
   */
  formatHoveredValue?: (datum: PieChartDatum) => ReactNode;
}

export const PieChartCenterValue: FC<PieChartCenterValueProps> = ({
  hoverSync = true,
  formatHoveredValue = defaultFormatHoveredValue,
  className,
  children,
  ref,
  ...props
}) => {
  const testId = useTestId('center-value');
  const dataCtx = useContext(PieChartDataContext);
  const { activeName } = useContext(PieChartActiveContext);

  const hoveredDatum =
    hoverSync && activeName !== null ? (dataCtx?.byName.get(activeName) ?? null) : null;

  const content = hoveredDatum ? formatHoveredValue(hoveredDatum) : children;

  return (
    <span
      {...props}
      ref={ref}
      data-slot='pie-chart-center-value'
      data-testid={testId}
      data-hovered={hoveredDatum ? 'true' : undefined}
      className={cn(pieChartCenterValueClasses, className)}
    >
      {content}
    </span>
  );
};

PieChartCenterValue.displayName = 'PieChartCenterValue';

/**
 * CLDR plural categories supported by `Intl.PluralRules`. `other` is required as the
 * fallback for any category the rules object does not define.
 */
export interface PieChartCenterLabelPluralRules {
  zero?: ReactNode;
  one?: ReactNode;
  two?: ReactNode;
  few?: ReactNode;
  many?: ReactNode;
  other: ReactNode;
  /** BCP-47 locale tag forwarded to `Intl.PluralRules`. Defaults to `'en'`. */
  locale?: string;
}

export interface PieChartCenterLabelProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  /**
   * When `true` (default), the label tracks the hovered slice/legend row — so a
   * `pluralize` rules object picks the form for the hovered datum's value rather than
   * the chart total. Has no effect when `pluralize` is omitted.
   */
  hoverSync?: boolean;
  /**
   * Optional pluralization rules. When provided, the label content is selected from
   * the rules using `Intl.PluralRules` for the currently visible count (the hovered
   * datum's value when `hoverSync` is on, otherwise the chart total). When omitted,
   * `children` renders unchanged.
   */
  pluralize?: PieChartCenterLabelPluralRules;
}

export const PieChartCenterLabel: FC<PieChartCenterLabelProps> = ({
  hoverSync = true,
  pluralize,
  className,
  children,
  ref,
  ...props
}) => {
  const testId = useTestId('center-label');
  const dataCtx = useContext(PieChartDataContext);
  const { activeName } = useContext(PieChartActiveContext);

  // Scope the dep to `locale` + presence so callers can pass an inline
  // `pluralize={{ one, other }}` literal without recreating the formatter on
  // every render. The rules object itself is read inline below — that lookup
  // is a single property access, not worth memoizing.
  const hasPluralize = !!pluralize;
  const pluralLocale = pluralize?.locale ?? 'en';
  const pluralRules = useMemo(
    () => (hasPluralize ? new Intl.PluralRules(pluralLocale) : null),
    [hasPluralize, pluralLocale],
  );

  let content: ReactNode = children;
  if (pluralize && pluralRules) {
    const hoveredValue =
      hoverSync && activeName !== null ? (dataCtx?.byName.get(activeName)?.value ?? null) : null;
    const count = hoveredValue ?? dataCtx?.total ?? 0;
    const matched = pluralize[pluralRules.select(count)];
    content = matched !== undefined ? matched : pluralize.other;
  }

  return (
    <span
      {...props}
      ref={ref}
      data-slot='pie-chart-center-label'
      data-testid={testId}
      className={cn(pieChartCenterLabelClasses, className)}
    >
      {content}
    </span>
  );
};

PieChartCenterLabel.displayName = 'PieChartCenterLabel';
