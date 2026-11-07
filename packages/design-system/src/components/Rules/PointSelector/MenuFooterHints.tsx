import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { Kbd, KbdGroup } from '../../Kbd';
import { menuFooterHintsClasses } from './classes';

export interface MenuFooterHintsProps extends HTMLAttributes<HTMLDivElement> {
  /** Ref forwarding to root element */
  ref?: Ref<HTMLDivElement>;
  /** Variant determines which shortcuts to show */
  variant: 'list' | 'pick' | 'name';
  /** Label for Escape key */
  escLabel?: string;
}

const Hint: FC<{ keys: string[]; children: ReactNode }> = ({ keys, children }) => (
  <span className='flex items-center gap-4'>
    <KbdGroup>
      {keys.map(k => (
        <Kbd key={k}>{k}</Kbd>
      ))}
    </KbdGroup>
    {children}
  </span>
);

/**
 * MenuFooterHints Component
 *
 * Keyboard hints in the menu footer, matching FilterInput style.
 * Based on rules-frontend MenuFooterHints pattern.
 */
export const MenuFooterHints: FC<MenuFooterHintsProps> = ({
  ref,
  variant,
  escLabel = 'to close',
  className,
  ...props
}) => {
  const testId = useTestId('hints');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='menu-footer-hints'
      data-testid={testId}
      className={cn(menuFooterHintsClasses, className)}
    >
      <Hint keys={['↑', '↓']}>to navigate</Hint>
      {variant === 'pick' ? (
        <>
          <Hint keys={['1', '2']}>or space to tick</Hint>
          <Hint keys={['↵']}>to apply</Hint>
        </>
      ) : (
        <Hint keys={['↵']}>to select</Hint>
      )}
      {variant === 'list' && (
        <>
          <Hint keys={['1', '2']}>to choose by number</Hint>
          <Hint keys={['tab']}>Next</Hint>
        </>
      )}
      <Hint keys={['esc']}>{escLabel}</Hint>
    </div>
  );
};

MenuFooterHints.displayName = 'MenuFooterHints';
