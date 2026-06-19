import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import {
  NAV_PANEL_BASE_PADDING,
  NavPanelDepthProvider,
  useNavPanelDepth,
  useNavPanelIndent,
} from './NavPanelContext';
import { useNavPanelGroupContext } from './NavPanelGroup';

export interface NavPanelGroupContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const NavPanelGroupContent: FC<NavPanelGroupContentProps> = ({
  ref,
  className,
  children,
  ...props
}) => {
  const { expanded, contentId } = useNavPanelGroupContext();
  const parentDepth = useNavPanelDepth();
  const indent = useNavPanelIndent();
  const depth = parentDepth + 1;

  return (
    <div
      {...props}
      ref={ref}
      id={contentId}
      role='group'
      data-slot='nav-panel-group-content'
      className={cn(
        'grid transition-[grid-template-rows] duration-150 ease-out',
        expanded ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div className='relative flex flex-col gap-2 overflow-hidden'>
        <div
          className='absolute top-0 bottom-0 w-px bg-border-primary-light'
          style={{ left: indent * parentDepth + (indent - NAV_PANEL_BASE_PADDING) }}
        />
        <NavPanelDepthProvider value={{ depth, indent }}>{children}</NavPanelDepthProvider>
      </div>
    </div>
  );
};

NavPanelGroupContent.displayName = 'NavPanelGroupContent';
