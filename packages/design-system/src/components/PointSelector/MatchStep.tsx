import { type FC, type RefObject, useEffect, useId, useRef, useState } from 'react';
import { type ConditionType, conditionLabel } from '@wallarm-org/rules-lib/ui';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '../Checkbox';
import { Input } from '../Input';
import { Loader } from '../Loader';
import { Text } from '../Text';
import { StepMenu } from './StepMenu';
import type { PointSelectorModel } from './usePointSelector';

interface Props {
  model: PointSelectorModel;
  conditionInputRef: RefObject<HTMLInputElement | null>;
  valueInputRef: RefObject<HTMLInputElement | null>;
  conditionChipRef: RefObject<HTMLButtonElement | null>;
  condition: ConditionType | null;
  value: string;
  ignoreCase: boolean;
}

/** Step 2: a numbered list of conditions, then the value. */
export const MatchStep: FC<Props> = ({
  model,
  conditionInputRef,
  valueInputRef,
  conditionChipRef,
  condition,
  value,
  ignoreCase,
}) => {
  const testId = useTestId('match');
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const { ui, actions, keys } = model;
  const choosing = ui.stage === 'condition';

  // Live regex validation state
  const [regexError, setRegexError] = useState<string | null>(null);
  const [validatingRegex, setValidatingRegex] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced regex validation (300ms)
  useEffect(() => {
    // Only validate for regexp and nregexp conditions
    const isRegexCondition = condition === 'regexp' || condition === 'nregexp';

    if (!isRegexCondition || !value) {
      setRegexError(null);
      setValidatingRegex(false);
      return;
    }

    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Show loading state
    setValidatingRegex(true);

    // Debounce validation by 300ms
    validationTimeoutRef.current = setTimeout(() => {
      try {
        // Try to compile the regex pattern
        new RegExp(value);
        setRegexError(null);
      } catch (error) {
        setRegexError(error instanceof Error ? error.message : 'Invalid regex pattern');
      } finally {
        setValidatingRegex(false);
      }
    }, 300);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [condition, value]);

  // The list asks to close when focus leaves it, which also happens for a
  // moment when it opens (the where bar it replaces held the focus). Close
  // only when focus went somewhere else, and stay on this step: leaving it
  // would reopen the where menu and pull focus away from what was clicked.
  const handleListClose = () =>
    requestAnimationFrame(() => {
      if (conditionInputRef.current !== document.activeElement) actions.closeConditionList();
    });

  return (
    <div data-slot='match-step' data-testid={testId} className='flex flex-col gap-8'>
      <Text size='sm' weight='medium'>
        2. {model.conditionTitle}
      </Text>
      {choosing ? (
        <div ref={anchorRef} className='w-[460px] max-w-full'>
          <Input
            ref={conditionInputRef}
            role='combobox'
            aria-haspopup='menu'
            aria-controls={menuId}
            aria-expanded
            aria-label='type to filter, or the number of a condition'
            placeholder='type to filter, or a number'
            value={ui.conditionQuery}
            spellCheck={false}
            autoComplete='off'
            onChange={e => actions.setConditionQuery(e.target.value)}
            onKeyDown={keys.handleConditionKey}
          />
          <StepMenu
            open
            contentId={menuId}
            anchorRef={anchorRef}
            focusRef={conditionInputRef}
            title='Choose a condition'
            rows={model.conditionRows}
            highlightedId={model.conditionHighlightedId}
            footer='list'
            escLabel='to go back'
            onHighlight={actions.highlightCondition}
            onChoose={actions.chooseCondition}
            onClose={handleListClose}
          />
        </div>
      ) : (
        <div className='flex flex-col gap-6'>
          <div className='flex items-center gap-8'>
            <Button
              ref={conditionChipRef}
              variant='outline'
              color='neutral'
              size='large'
              onClick={actions.editCondition}
            >
              {condition ? `${conditionLabel(condition)} ✎` : 'Choose a condition'}
            </Button>
            {model.conditionTakesValue && (
              <div className='relative flex-1'>
                <Input
                  ref={valueInputRef}
                  aria-label='value'
                  className='font-mono'
                  placeholder='the value; * stands for any text'
                  value={value}
                  spellCheck={false}
                  autoComplete='off'
                  onChange={e => actions.setValue(e.target.value)}
                  onKeyDown={keys.handleValueKey}
                  aria-invalid={regexError !== null}
                  aria-describedby={regexError ? `${testId}--regex-error` : undefined}
                />
                {validatingRegex && (
                  <div className='absolute right-12 top-1/2 -translate-y-1/2'>
                    <Loader size='sm' background={false} data-testid={`${testId}--regex-loading`} />
                  </div>
                )}
              </div>
            )}
          </div>
          {regexError && (
            <Text
              id={`${testId}--regex-error`}
              size='xs'
              color='danger'
              data-testid={`${testId}--regex-error`}
            >
              Regex compilation error: {regexError}
            </Text>
          )}
          {model.conditionTakesValue && (
            <div className='flex items-center justify-between gap-12'>
              <Text size='xs' color='secondary'>
                {model.readAs}
              </Text>
              <Checkbox
                checked={ignoreCase}
                onCheckedChange={d => actions.setIgnoreCase(d.checked === true)}
              >
                <CheckboxIndicator />
                <CheckboxLabel>Ignore letter case (⌥C)</CheckboxLabel>
              </Checkbox>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

MatchStep.displayName = 'MatchStep';
