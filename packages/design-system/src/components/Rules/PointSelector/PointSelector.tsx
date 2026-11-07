import { type FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import { type Layer, useProton, type Verdict } from '@wallarm-org/rules-lib';
import { cn } from '../../../utils/cn';
import { TestIdProvider } from '../../../utils/testId';
import {
  Alert,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../Alert';
import { Button } from '../../Button';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '../../Checkbox';
import { DropdownMenuInput } from '../../DropdownMenu';
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from '../../SegmentedTabs';
import { Text } from '../../Text';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { MatchStep } from './MatchStep';
import { PointSelectorEmptyState } from './PointSelectorEmptyState';
import { PointSelectorError } from './PointSelectorError';
import { PointSelectorSkeleton } from './PointSelectorSkeleton';
import { SampleRequest } from './SampleRequest';
import { StepMenu } from './StepMenu';
import { sampleValueOf } from './sampleValue';
import { checkPoint, getVersion, needsRecanonalization } from './sdkBridge';
import type { PointSelectorProps } from './types';
import { usePointSelector } from './usePointSelector';
import { VersionWarning } from './VersionWarning';
import { WhereBar } from './WhereBar';

/**
 * Get description for a validation profile
 *
 * Descriptions based on point-sdk.md:13-54 profile semantics
 */
const getProfileDescription = (profile: Layer): string => {
  switch (profile) {
    case 'tree':
      return 'What can exist in traffic (wildcards, containers OK)';
    case 'value':
      return 'Single readable value (no wildcards, no containers)';
    case 'grammar':
      return 'Pure syntax check (allows impossible points)';
    default:
      return 'What can exist in traffic';
  }
};

/**
 * Writes the selector of a WAF rule without the point syntax: step 1 says
 * where the value is, in a guided query bar; step 2, behind Next, says how
 * the value should match.
 *
 * SDK Integration:
 * - Loads Proton SDK on mount (~75KB brotli, ~2ms compile)
 * - Validates points and stores canonical form
 * - Gracefully degrades if SDK fails to load
 *
 * @see {@link ../../../../docs/point-format.md} Complete point grammar specification (Star notation)
 * @see {@link ../../../../docs/tree-shape.md} What can exist under each point
 * @see {@link ./ANALYTICS_GAPS.md} Analytics integration pattern (wrapper-level, onChange-based)
 */
export const PointSelector: FC<PointSelectorProps> = ({
  'data-testid': testId,
  ref,
  className,
  context,
  value,
  onChange,
  initialStage,
  pointOnly,
  title,
  profile,
  onProfileChange,
  keys: keysProp,
  keysDebounceMs,
  ...restProps
}) => {

  // Initialize Proton SDK (cached singleton, safe to call multiple times)
  const protonResult = useProton();
  const proton = protonResult ? protonResult[0] : null;
  const sdkLoadError = protonResult ? protonResult[1] : null;
  const retryLoadingSdk = protonResult ? protonResult[2] : () => {};
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Track current profile (controlled by prop, default to 'tree')
  const currentProfile = profile ?? 'tree';

  // Handle profile change by re-validating current point
  const handleProfileChange = (newProfile: string) => {
    const profile = newProfile as Layer;

    // Call the callback if provided
    onProfileChange?.(profile);

    // Re-validate current point with new profile if we have one
    if (!proton || !value.canonical) return;

    const result = checkPoint(proton, value.canonical, {
      context: context,
      profile,
    });

    if (result.canonical) {
      onChange({
        ...value,
        canonical: result.canonical,
        canonicalVersion: proton.version().canonical,
      });
    }
  };

  // All hooks must be called before any conditional returns (Rules of React)
  // Get SDK version for compatibility checking
  const sdkVersion = useMemo(() => getVersion(proton), [proton]);

  const model = usePointSelector({
    context: context,
    value: value,
    onChange: onChange,
    initialStage: initialStage,
    pointOnly: pointOnly,
    profile: profile,
    keys: keysProp,
    keysDebounceMs,
    proton,
    onShowKeyboardHelp: () => setShowKeyboardHelp(true),
  });
  const { ui, actions, keys } = model;
  const barRef = useRef<HTMLDivElement | null>(null);
  const barInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const conditionInputRef = useRef<HTMLInputElement | null>(null);
  const valueInputRef = useRef<HTMLInputElement | null>(null);
  const conditionChipRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();

  // Safe wrappers for actions/keys that might be undefined
  const safeActions = {
    setQuery: actions?.setQuery ?? (() => {}),
    toggleNameCase: actions?.toggleNameCase ?? (() => {}),
    closeMenu: actions?.closeMenu ?? (() => {}),
    applyFix: actions?.applyFix ?? (() => {}),
    clearSdkError: actions?.clearSdkError ?? (() => {}),
    clearCanonicalInfo: actions?.clearCanonicalInfo ?? (() => {}),
    goMatch: actions?.goMatch ?? (() => {}),
    editPoint: actions?.editPoint ?? (() => {}),
    openMenu: actions?.openMenu ?? (() => false),
    truncateTo: actions?.truncateTo ?? (() => {}),
    applyPick: actions?.applyPick ?? (() => {}),
    highlight: actions?.highlight ?? (() => {}),
    chooseRow: actions?.chooseRow ?? (() => {}),
  };

  const safeKeys = {
    handleNameKey: keys?.handleNameKey ?? (() => {}),
    handleBarKey: keys?.handleBarKey ?? (() => {}),
  };

  // Auto-re-canonicalize when SDK version changes (point-sdk.md:341-349)
  useEffect(() => {
    if (!proton || !value.canonical) return;

    const currentVersion = proton.version().canonical;
    if (!needsRecanonalization(currentVersion, value.canonicalVersion ?? undefined)) {
      return; // No update needed
    }

    // Re-canonicalize point with current SDK version
    const result = checkPoint(proton, value.canonical, {
      context: context,
      profile: profile,
    });

    if (result.canonical && result.canonical !== value.canonical) {
      console.info('Point re-canonicalized due to SDK version change', {
        old: value.canonical,
        new: result.canonical,
        oldVersion: value.canonicalVersion,
        newVersion: currentVersion,
      });

      onChange({
        ...value,
        canonical: result.canonical,
        canonicalVersion: currentVersion,
      });
    }
    // Only run when SDK loads or value.canonical/canonicalVersion change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proton, value.canonical, value.canonicalVersion]);

  // Move keyboard focus where the last action asked for it. The frame delay
  // lets a menu that just opened settle, so it cannot take the focus back.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on each focus request only
  useEffect(() => {
    // On mount, the bar takes focus only for a just-added empty selector: on a
    // point the host seeded, focusing the bar would open its menu over the rest
    // of the form. A stored condition still focuses its value, as before.
    if (ui.focusTick === 0 && ui.focusTarget === 'bar' && value.segments.length > 0) return;

    const targets = {
      bar: barInputRef,
      name: nameInputRef,
      next: nextRef,
      condition: conditionInputRef,
      value: valueInputRef,
      conditionChip: conditionChipRef,
    } as const;

    const id = requestAnimationFrame(() => targets[ui.focusTarget].current?.focus());
    return () => cancelAnimationFrame(id);
  }, [ui.focusTick]);

  // Show error boundary if SDK fails to load
  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  if (sdkLoadError && !isTest) {
    return (
      <div data-slot='point-selector' data-testid={testId}>
        <Alert color='destructive'>
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Failed to load validation SDK</AlertTitle>
            <AlertDescription>
              {sdkLoadError.message}
              <div className='mt-8'>
                <Button variant='outline' color='neutral' size='small' onClick={retryLoadingSdk}>
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </AlertContent>
        </Alert>
      </div>
    );
  }

  // Show loading skeleton while SDK initializes (skip in test environment)
  // Tests should mock useProton or run without SDK dependency
  if (!proton && !isTest) {
    return <PointSelectorSkeleton data-testid={testId} />;
  }

  // The menu asks to close when focus leaves it, which also happens when a
  // name is chosen and typing moves back to the bar. Close only when focus
  // went somewhere else on the page.
  const handleMenuClose = () =>
    requestAnimationFrame(() => {
      const typing = [barInputRef, nameInputRef].some(
        r => r.current && r.current === document.activeElement,
      );
      if (!typing) safeActions.closeMenu();
    });

  const nameHeader = model.nameStep ? (
    <>
      <DropdownMenuInput
        ref={nameInputRef}
        aria-label={model.nameInputPlaceholder}
        placeholder={model.nameInputPlaceholder}
        value={ui.query}
        spellCheck={false}
        autoComplete='off'
        onChange={e => safeActions.setQuery(e.target.value)}
        onKeyDown={safeKeys.handleNameKey}
      />
      {(model.nameAllowsCase || model.nameShowsStarHint) && (
        <div className='flex items-center gap-12 px-8 pb-6'>
          {model.nameAllowsCase && (
            <span className='shrink-0 whitespace-nowrap'>
              <Checkbox checked={ui.nameIgnoreCase} onCheckedChange={safeActions.toggleNameCase}>
                <CheckboxIndicator />
                <CheckboxLabel>Ignore letter case (⌥C)</CheckboxLabel>
              </Checkbox>
            </span>
          )}
          {model.nameShowsStarHint && (
            <Text size='xs' color='secondary'>
              * stands for any text: *user* is any name containing user
            </Text>
          )}
        </div>
      )}
    </>
  ) : undefined;

  return (
    <div {...restProps} ref={ref} data-slot='point-selector' data-testid={testId} className={cn('flex flex-col gap-12', className)}>
      <TestIdProvider value={testId}>
        {/* Keyboard shortcuts dialog */}
        <KeyboardShortcutsDialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp} />

        {/* SDK version warning/info */}
        <VersionWarning version={sdkVersion} />

        {/* Profile selector - only show when onProfileChange callback is provided */}
        {onProfileChange && (
          <div className='flex flex-col gap-8'>
            <div className='flex items-center justify-between'>
              <Text size='sm' weight='medium'>
                Validation Profile
              </Text>
            </div>
            <SegmentedTabs
              value={currentProfile}
              onChange={handleProfileChange}
              data-testid={testId ? `${testId}--profile-selector` : undefined}
            >
              <SegmentedTabsList>
                <SegmentedTabsTrigger value='tree'>Tree</SegmentedTabsTrigger>
                <SegmentedTabsTrigger value='value'>Value</SegmentedTabsTrigger>
                <SegmentedTabsTrigger value='grammar'>Grammar</SegmentedTabsTrigger>
              </SegmentedTabsList>
              <SegmentedTabsContent value='tree'>
                <div className='py-8'>
                  <Text size='sm' color='secondary'>
                    {getProfileDescription('tree')}
                  </Text>
                </div>
              </SegmentedTabsContent>
              <SegmentedTabsContent value='value'>
                <div className='py-8'>
                  <Text size='sm' color='secondary'>
                    {getProfileDescription('value')}
                  </Text>
                </div>
              </SegmentedTabsContent>
              <SegmentedTabsContent value='grammar'>
                <div className='py-8'>
                  <Text size='sm' color='secondary'>
                    {getProfileDescription('grammar')}
                  </Text>
                </div>
              </SegmentedTabsContent>
            </SegmentedTabs>
          </div>
        )}

        {/* SDK validation error (includes grammar and runtime checks with fixes) */}
        {model.sdkError && (
          <PointSelectorError
            error={model.sdkError as Verdict}
            incomplete={model.incomplete}
            onApplyFix={safeActions.applyFix}
            onDismiss={safeActions.clearSdkError}
          />
        )}
        {/* Canonical form feedback */}
        {model.canonicalInfo && (
          <Alert
            color='info'
            data-testid={testId ? `${testId}--canonical-info` : undefined}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                e.preventDefault();
                safeActions.clearCanonicalInfo();
              }
            }}
            tabIndex={-1}
          >
            <AlertIcon />
            <AlertContent>
              <AlertTitle>Point Canonicalized</AlertTitle>
              <AlertDescription>
                <div className='space-y-8'>
                  <Text size='sm'>
                    Your point was automatically normalized to its canonical form. This ensures
                    consistency and helps detect duplicate rules.
                  </Text>
                  <div className='rounded-8 bg-bg-surface-1 p-12 font-mono text-xs'>
                    <div className='mb-4'>
                      <Text size='xs' weight='medium' color='secondary'>
                        Your form:
                      </Text>
                    </div>
                    <div className='mb-8 text-text-primary'>{model.canonicalInfo.built}</div>
                    <div className='mb-4'>
                      <Text size='xs' weight='medium' color='secondary'>
                        Canonical form:
                      </Text>
                    </div>
                    <div className='text-text-primary'>{model.canonicalInfo.canonical}</div>
                  </div>
                </div>
              </AlertDescription>
            </AlertContent>
            <AlertClose onClick={safeActions.clearCanonicalInfo} aria-label='Close (Esc)' />
          </Alert>
        )}
        <div className='flex flex-col gap-8 rounded-12 border border-border-primary-light bg-bg-surface-1 p-12'>
          <div className='flex items-center justify-between gap-12'>
            <Text size='sm' weight='medium'>
              {title ?? (pointOnly ? 'Where?' : '1. Where is the value?')}
            </Text>
            {pointOnly ? null : model.pointStage ? (
              <Button
                ref={nextRef}
                variant='primary'
                color='brand'
                size='medium'
                disabled={!model.canContinue}
                onClick={safeActions.goMatch}
              >
                Next: set the condition
              </Button>
            ) : (
              <Button
                variant='outline'
                color='neutral'
                size='medium'
                onClick={safeActions.editPoint}
              >
                Change where
              </Button>
            )}
          </div>
          {/* What the point reads, drawn as a request while it is being chosen:
            each step and the condition's value show up as they are picked.
            Above the bar, so the step menu, which opens below it, never
            covers it. */}
          {value.segments.length > 0 && (
            <SampleRequest
              segments={value.segments}
              context={context}
              value={pointOnly ? undefined : sampleValueOf(value)}
            />
          )}
          <WhereBar
            barRef={barRef}
            inputRef={barInputRef}
            segments={value.segments}
            proton={proton}
            pointString={value.canonical ?? undefined}
            pendingLabel={model.pointStage ? model.pendingLabel : ''}
            showInput={model.pointStage && !model.nameStep}
            editable={model.pointStage}
            query={model.nameStep ? '' : ui.query}
            placeholder={model.barPlaceholder}
            open={model.menuOpen}
            menuId={menuId}
            errorSpan={model.sdkError?.span}
            errorMessage={model.sdkError?.message}
            onQueryChange={safeActions.setQuery}
            onKeyDown={safeKeys.handleBarKey}
            onFocus={safeActions.openMenu}
            onChipClick={safeActions.truncateTo}
          />
          <div role='status' aria-live='polite' aria-atomic='true'>
            <Text size='sm' color='secondary'>
              {model.sentence ? `Reads as: ${model.sentence}` : 'Nothing chosen yet.'}
            </Text>
          </div>

          <StepMenu
            open={model.menuOpen}
            contentId={menuId}
            anchorRef={barRef}
            focusRef={model.nameStep ? nameInputRef : barInputRef}
            title={model.menuTitle}
            rows={model.rows}
            highlightedId={model.highlightedId ?? null}
            status={model.status}
            footer={model.menuFooter ?? 'list'}
            escLabel={model.menuFooter === 'list' ? 'to close' : 'to go back'}
            header={nameHeader}
            applyLabel={model.applyLabel ?? undefined}
            applyDisabled={ui.picked.length === 0}
            onApply={model.menuFooter === 'pick' ? safeActions.applyPick : undefined}
            onHighlight={safeActions.highlight}
            onChoose={safeActions.chooseRow}
            onClose={handleMenuClose}
            showExamples={value.segments.length === 0 && model.pointStage}
            onSelectExample={point => {
              // Parse example point string via SDK
              if (!proton) {
                safeActions.openMenu();
                return;
              }

              try {
                const segments = proton.point.parse(point) as typeof value.segments;

                // Update value with parsed segments
                onChange({
                  ...value,
                  segments,
                  canonical: point, // Store canonical form
                });

                // Open menu for next step
                safeActions.openMenu();
              } catch {
                // Failed to parse example point, fallback: just open menu
                safeActions.openMenu();
              }
            }}
          />
        </div>
        {!model.pointStage && !pointOnly && (
          <div className='rounded-12 border border-border-primary-light bg-bg-surface-1 p-12'>
            <MatchStep
              model={model}
              conditionInputRef={conditionInputRef}
              valueInputRef={valueInputRef}
              conditionChipRef={conditionChipRef}
              condition={value.condition}
              value={value.value}
              ignoreCase={value.ignoreCase}
            />
          </div>
        )}
      </TestIdProvider>
    </div>
  );
};

PointSelector.displayName = 'PointSelector';
