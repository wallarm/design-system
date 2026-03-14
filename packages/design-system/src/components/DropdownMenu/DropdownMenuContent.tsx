import {
  Children,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type Ref,
} from 'react';
import { Menu } from '@ark-ui/react/menu';
import { Portal } from '@ark-ui/react/portal';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
} from '../ScrollArea';
import { dropdownMenuClassNames } from './classes';
import { DropdownMenuFooter } from './DropdownMenuFooter';

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuContent: FC<DropdownMenuContentProps> = ({
  className,
  children,
  ref,
  ...props
}) => {
  const testId = useTestId('content');
  const childArray = Children.toArray(children);
  const footerChildren = childArray.filter(
    child => isValidElement(child) && child.type === DropdownMenuFooter,
  );
  const menuChildren = childArray.filter(
    child => !(isValidElement(child) && child.type === DropdownMenuFooter),
  );

  return (
    <Portal>
      <Menu.Positioner>
        <Menu.Content
          ref={ref}
          data-testid={testId}
          className={cn(
            dropdownMenuClassNames,
            'max-h-(--available-height)',
            'origin-[--transform-origin]',
            className,
          )}
          {...props}
        >
          <ScrollArea className={cn('flex flex-col min-h-0')} style={{ position: 'static' }}>
            <ScrollAreaViewport>
              <ScrollAreaContent className={cn('flex flex-col gap-1')}>
                {menuChildren}
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar />
            <ScrollAreaCorner />
          </ScrollArea>
          {footerChildren}
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  );
};

DropdownMenuContent.displayName = 'DropdownMenuContent';
