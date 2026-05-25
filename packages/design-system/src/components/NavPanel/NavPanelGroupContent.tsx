import { type FC, type HTMLAttributes, type ReactNode, type Ref, useRef } from 'react';
import { cn } from '../../utils/cn';
import { NavPanelDepthContext, useNavPanelDepth, useNavPanelGroupContext } from './NavPanelGroup';

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
  const depth = parentDepth + 1;
  const innerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      ref={ref}
      id={contentId}
      role='group'
      data-slot='nav-panel-group-content'
      className={cn(
        'relative grid transition-[grid-template-rows] duration-150 ease-out',
        expanded ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div
        className='absolute top-0 bottom-0 w-px bg-border-primary-light'
        style={{ left: depth * 16 + parentDepth * 8 }}
      />
      <NavPanelDepthContext.Provider value={depth}>
        <div ref={innerRef} className='flex flex-col gap-2 overflow-hidden'>
          {children}
        </div>
      </NavPanelDepthContext.Provider>
    </div>
  );
};

NavPanelGroupContent.displayName = 'NavPanelGroupContent';
