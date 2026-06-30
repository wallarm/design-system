import type { FC, HTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react';
import { Check, Pencil } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import { useAttributeEdit } from './AttributeEditContext';

export interface AttributeEditPreviewProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Trailing affordance icon shown on hover/focus in read mode. */
  triggerIcon?: ReactNode;
  children?: ReactNode;
}

export const AttributeEditPreview: FC<AttributeEditPreviewProps> = ({
  ref,
  triggerIcon = <Pencil size='sm' />,
  children,
  className,
  onClick,
  onFocus,
  onKeyDown,
  ...props
}) => {
  const testId = useTestId('edit-preview');
  const { editing, status, disabled, readOnly, activationMode, edit } = useAttributeEdit();

  if (editing) return null;

  const activatable = !disabled && !readOnly && activationMode !== 'none';

  const handleClick: HTMLAttributes<HTMLDivElement>['onClick'] = event => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (activatable && activationMode === 'click') edit();
  };

  const handleFocus: HTMLAttributes<HTMLDivElement>['onFocus'] = event => {
    onFocus?.(event);
    if (event.defaultPrevented) return;
    if (activatable && activationMode === 'focus') edit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (activatable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      edit();
    }
  };

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-edit-preview'
      role={activatable ? 'button' : undefined}
      tabIndex={activatable ? 0 : undefined}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={cn(
        'group -my-4 flex w-full min-w-0 items-center gap-4 rounded-8 px-6 py-4 transition-colors',
        activatable &&
          'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
        className,
      )}
    >
      <span className='min-w-0 flex-1 truncate'>{children}</span>
      {status === 'loading' ? (
        <Loader type='circle' size='sm' background={false} />
      ) : status === 'saved' ? (
        <Check size='sm' className='text-icon-success' />
      ) : activatable ? (
        <span className='text-icon-secondary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
          {triggerIcon}
        </span>
      ) : null}
    </div>
  );
};

AttributeEditPreview.displayName = 'AttributeEditPreview';
