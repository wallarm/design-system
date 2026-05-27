import type { ButtonHTMLAttributes, ComponentType, FC, ReactNode, Ref } from 'react';
import { ChevronRight } from '../../icons';
import type { SvgIconProps } from '../../icons/SvgIcon';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { useNavPanelDepth, useNavPanelGroupContext } from './NavPanelGroup';

export interface NavPanelGroupLabelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  icon?: ComponentType<SvgIconProps>;
  children: ReactNode;
}

export const NavPanelGroupLabel: FC<NavPanelGroupLabelProps> = ({
  ref,
  icon: Icon,
  className,
  children,
  ...props
}) => {
  const { expanded, toggle, contentId } = useNavPanelGroupContext();
  const depth = useNavPanelDepth();
  const testId = useTestId('group-label');

  return (
    <button
      {...props}
      ref={ref}
      type='button'
      aria-expanded={expanded}
      aria-controls={contentId}
      data-slot='nav-panel-group-label'
      data-testid={testId}
      onClick={toggle}
      style={{ paddingLeft: 8 + depth * 24 }}
      className={cn(
        'overlay flex h-32 shrink-0 w-full cursor-pointer items-center gap-8 rounded-6 py-8 pr-8 text-sm text-text-primary opacity-64 transition-colors outline-none hover:opacity-100 hover:overlay-states-primary-hover focus-visible:opacity-100 focus-visible:overlay-states-primary-hover active:overlay-states-primary-pressed',
        className,
      )}
    >
      {Icon && (
        <span className='flex shrink-0 items-center justify-center'>
          <Icon size='md' />
        </span>
      )}
      <Text size='sm' style={{ flex: 1 }} align='left' truncate>
        {children}
      </Text>
      <ChevronRight
        size='md'
        className={cn('shrink-0 transition-transform duration-150', expanded && 'rotate-90')}
      />
    </button>
  );
};

NavPanelGroupLabel.displayName = 'NavPanelGroupLabel';
