import {
  type FC,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  useEffect,
  useRef,
} from 'react';
import type { CheckError } from '@wallarm-org/rules-lib';
import { Lightbulb } from '../../../icons/Lightbulb';
import { cn } from '../../../utils/cn';
import type { TestableProps } from '../../../utils/testId';
import {
  Alert,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../Alert';
import { Badge } from '../../Badge';
import { Button } from '../../Button';
import type { ErrorFix } from './types';

export interface PointSelectorErrorProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  /** Ref forwarding to root element */
  ref?: Ref<HTMLDivElement>;
  /** Validation error from SDK */
  error: CheckError;
  /** True = valid prefix, show info instead of error */
  incomplete?: boolean;
  /** True = transport/SDK failure, show different icon */
  transport?: boolean;
  /** Called when user clicks a fix suggestion */
  onApplyFix?: (fix: ErrorFix) => void;
  /** Called when user dismisses the error */
  onDismiss?: () => void;
}

/**
 * Point Selector Error Component
 *
 * Displays validation errors with layer badges, fix suggestions, and span highlighting.
 *
 * Error States:
 * - Incomplete (blue info): Valid prefix, keep typing
 * - Grammar (red error): Syntax error in point string
 * - Tree (red error): Point structure violates grammar
 * - Value (red error): Point doesn't match value profile
 * - Transport (red error): Network/SDK failure
 */
export const PointSelectorError: FC<PointSelectorErrorProps> = ({
  ref,
  error,
  incomplete = false,
  transport = false,
  onApplyFix,
  onDismiss,
  className,
  'data-testid': testId,
  ...props
}) => {
  // Refs for Arrow key navigation between fixes
  const fixButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle Arrow Left/Right navigation between fixes
  const handleFixKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const fixes = error.fixes || [];
    if (e.key === 'ArrowRight' && index < fixes.length - 1) {
      e.preventDefault();
      fixButtonRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      fixButtonRefs.current[index - 1]?.focus();
    }
  };

  // Handle Ctrl+1, Ctrl+2, ... keyboard shortcuts for applying fixes
  useEffect(() => {
    if (!onApplyFix || !error.fixes || error.fixes.length === 0) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Only handle Ctrl+Number (or Cmd+Number on Mac)
      if (!(e.ctrlKey || e.metaKey) || !e.key.match(/^[1-9]$/)) return;

      const fixIndex = parseInt(e.key, 10) - 1;
      const fix = error.fixes?.[fixIndex];
      if (fix) {
        e.preventDefault();
        onApplyFix(fix);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [error.fixes, onApplyFix]);

  // Determine severity and color
  // - Incomplete: info (blue) - valid prefix, keep typing
  // - Warning: warning (amber) - works but not recommended
  // - Error: destructive (red) - invalid, must fix
  const isWarning = error.code === 'HEADER_CASE_WARNING';
  const color = incomplete ? 'info' : isWarning ? 'warning' : 'destructive';
  const title = incomplete
    ? 'Keep typing...'
    : isWarning
      ? 'Header Case Recommendation'
      : transport
        ? 'Connection Error'
        : error.layer === 'grammar'
          ? 'Syntax Error'
          : error.layer === 'tree'
            ? 'Invalid Point'
            : 'Not a Value Point';

  // Map SDK error layer to human-readable badge
  const layerBadge = !incomplete && !transport && (
    <Badge size='small' color={error.layer === 'grammar' ? 'danger' : 'warning'}>
      {error.layer === 'grammar' ? 'Grammar' : error.layer === 'tree' ? 'Tree' : 'Value'}
    </Badge>
  );

  // Profile-specific guidance for value errors
  const profileGuidance =
    !incomplete &&
    !transport &&
    error.layer === 'value' &&
    (error.code === 'not_a_value'
      ? 'This point addresses a container, not a value. Continue to pick a specific field.'
      : error.code === 'not_single'
        ? 'This point matches multiple nodes. Refine your point to address a single node.'
        : null);

  return (
    <Alert
      {...props}
      ref={ref}
      color={color}
      className={className}
      data-slot='point-selector-error'
      data-testid={testId}
    >
      <AlertIcon />
      <AlertContent>
        <div className='flex items-center gap-8'>
          <AlertTitle>{title}</AlertTitle>
          {layerBadge}
        </div>
        <AlertDescription>
          {error.message}
          {error.span && !incomplete && (
            <span className='ml-4 text-text-tertiary'>
              (characters {error.span[0]}–{error.span[1]})
            </span>
          )}
          {profileGuidance && (
            <>
              <br />
              <span>{profileGuidance}</span>
            </>
          )}
        </AlertDescription>
        {/* Fix suggestions as clickable buttons */}
        {error.fixes && error.fixes.length > 0 && onApplyFix && !incomplete && (
          <div className='mt-8 flex flex-col gap-6'>
            <p className='text-sm font-medium text-text-secondary'>Quick fixes:</p>
            <div className='flex flex-wrap gap-6' role='list' aria-label='Fix suggestions'>
              {error.fixes.map((fix, i) => (
                <Button
                  key={i}
                  ref={el => (fixButtonRefs.current[i] = el)}
                  size='small'
                  variant='outline'
                  color='neutral'
                  onClick={() => onApplyFix(fix)}
                  onKeyDown={e => handleFixKeyDown(e, i)}
                  aria-label={`Fix ${i + 1} of ${error.fixes!.length}: ${fix.label}`}
                  data-testid={testId ? `${testId}--fix-${i}` : undefined}
                >
                  <Lightbulb className='size-16' />
                  <span>
                    {i < 9 && <span className='text-text-tertiary'>[Ctrl+{i + 1}] </span>}
                    {fix.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </AlertContent>
      {onDismiss && <AlertClose onClick={onDismiss} />}
    </Alert>
  );
};

PointSelectorError.displayName = 'PointSelectorError';
