import { type FC, type KeyboardEvent, type Ref, useEffect, useRef, useState } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { Check, Pencil } from '../../icons';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { Input } from '../Input';
import { Loader } from '../Loader';
import { Text } from '../Text';

type EditStatus = 'idle' | 'editing' | 'saving' | 'error';

export interface AttributeEditableValueProps extends TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Controlled value. Omit and use `defaultValue` for uncontrolled. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /**
   * Called when the user commits (Enter or blur). Return a Promise to surface
   * the `saving` state; reject it to roll back the optimistic value and show an
   * inline error. Sync/void return commits immediately with a brief "Saved" tick.
   */
  onCommit?: (next: string) => void | Promise<void>;
  /** Inline validation — return an error message to block the commit, or `null` when valid. */
  validate?: (next: string) => string | null;
  /** Placeholder for the input while editing. */
  placeholder?: string;
  /** Accessible label for the editor (usually the attribute's label text). */
  'aria-label'?: string;
}

/**
 * Seamless inline-edit value slot for `Attribute`. Place inside `AttributeValue`.
 * Read → click (or Enter/Space) → edit in place → commit on Enter / blur,
 * cancel on Esc, empty commits as cancel. Optimistic with rollback on failure.
 *
 * Spike: `text` only. Select / date / tags follow once the API is signed off.
 */
export const AttributeEditableValue: FC<AttributeEditableValueProps> = ({
  ref,
  value: valueProp,
  defaultValue = '',
  onCommit,
  validate,
  placeholder,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const [value, setValue] = useControlled<string>({ controlled: valueProp, default: defaultValue });
  const [status, setStatus] = useState<EditStatus>('idle');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const current = value ?? '';
  const isEditing = status === 'editing' || status === 'error';

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const flashSaved = () => {
    setSavedFlash(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedFlash(false), 1400);
  };

  const beginEdit = () => {
    setDraft(current);
    setError(null);
    setStatus('editing');
  };

  const cancel = () => {
    setError(null);
    setStatus('idle');
  };

  const commit = () => {
    const next = draft.trim();
    if (next === '') return cancel(); // empty commits as cancel
    if (validate) {
      const message = validate(next);
      if (message) {
        setError(message);
        setStatus('error');
        return;
      }
    }
    setError(null);
    if (next === current) return setStatus('idle'); // unchanged

    const previous = current;
    setValue(next); // optimistic
    const result = onCommit?.(next);

    if (result && typeof (result as Promise<void>).then === 'function') {
      setStatus('saving');
      (result as Promise<void>).then(
        () => {
          setStatus('idle');
          flashSaved();
        },
        () => {
          setValue(previous); // roll back
          setDraft(next);
          setError('Couldn’t save. Check your connection and try again.');
          setStatus('error');
        },
      );
    } else {
      setStatus('idle');
      flashSaved();
    }
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  };

  const onReadKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      beginEdit();
    }
  };

  if (isEditing) {
    return (
      <div
        className='flex w-full min-w-0 flex-col gap-4'
        data-slot='attribute-editable-value'
        data-state='editing'
      >
        <Input
          ref={inputRef}
          value={draft}
          placeholder={placeholder}
          aria-label={ariaLabel}
          error={status === 'error'}
          data-testid={testId}
          onChange={event => {
            const v = event.target.value;
            setDraft(v);
            if (status === 'error' && validate && !validate(v)) setError(null);
          }}
          onKeyDown={onInputKeyDown}
          onBlur={commit}
        />
        {error ? (
          <Text size='xs' color='danger'>
            {error}
          </Text>
        ) : null}
      </div>
    );
  }

  const saving = status === 'saving';

  return (
    <div
      ref={ref}
      role='button'
      tabIndex={saving ? -1 : 0}
      aria-label={ariaLabel ? `Edit ${ariaLabel}` : 'Edit value'}
      data-testid={testId}
      data-slot='attribute-editable-value'
      data-state={saving ? 'saving' : 'idle'}
      onClick={saving ? undefined : beginEdit}
      onKeyDown={saving ? undefined : onReadKeyDown}
      className={cn(
        // Mirrors the locked AttributeActionsTarget recipe so the band, radius
        // and focus ring match the rest of the component.
        'group -my-4 flex w-full min-w-0 items-center gap-6 rounded-8 px-6 py-4 transition-colors',
        !saving && 'cursor-pointer hover:bg-states-primary-hover',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
      )}
    >
      <Text
        size='sm'
        truncate
        color={current ? 'primary' : 'secondary'}
        className={cn('min-w-0', saving && 'opacity-50')}
      >
        {current || '—'}
      </Text>
      <span className='ml-auto flex shrink-0 items-center'>
        {saving ? (
          <Loader size='sm' color='primary' />
        ) : savedFlash ? (
          <span className='flex items-center gap-2 text-icon-success'>
            <Check className='size-14' />
            <Text size='xs' color='secondary'>
              Saved
            </Text>
          </span>
        ) : (
          <Pencil className='size-14 text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100' />
        )}
      </span>
    </div>
  );
};

AttributeEditableValue.displayName = 'AttributeEditableValue';
