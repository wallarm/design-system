import { type FC, useState } from 'react';
import { Eye, EyeOff } from '../../icons';
import { Input, type InputProps } from '../Input';
import { InputGroup } from '../InputGroup/InputGroup';
import { InputGroupAddon } from '../InputGroup/InputGroupAddon';
import { Tooltip } from '../Tooltip/Tooltip';
import { TooltipContent } from '../Tooltip/TooltipContent';
import { TooltipTrigger } from '../Tooltip/TooltipTrigger';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {}

export const PasswordInput: FC<PasswordInputProps> = ({
  disabled = false,
  size = 'default',
  error = false,
  className,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  const toggle = () => setVisible(prev => !prev);

  return (
    <InputGroup size={size} className={className} data-slot='password-input' data-testid={testId}>
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        size={size}
        error={error}
        ref={ref}
      />
      <InputGroupAddon align='inline-end'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              tabIndex={-1}
              disabled={disabled}
              aria-label={visible ? 'Hide password' : 'Show password'}
              onClick={toggle}
              className='cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
            >
              {visible ? <EyeOff /> : <Eye />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{visible ? 'Hide password' : 'Show password'}</TooltipContent>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  );
};

PasswordInput.displayName = 'PasswordInput';
