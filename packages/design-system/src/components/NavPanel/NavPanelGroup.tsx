import {
  createContext,
  type FC,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useId,
  useState,
} from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

interface NavPanelGroupContextValue {
  expanded: boolean;
  toggle: () => void;
  contentId: string;
}

const NavPanelGroupContext = createContext<NavPanelGroupContextValue>({
  expanded: false,
  toggle: () => {},
  contentId: '',
});

export function useNavPanelGroupContext(): NavPanelGroupContextValue {
  return useContext(NavPanelGroupContext);
}

const NavPanelDepthContext = createContext(0);

export function useNavPanelDepth(): number {
  return useContext(NavPanelDepthContext);
}

export { NavPanelDepthContext };

export interface NavPanelGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}

export const NavPanelGroup: FC<NavPanelGroupProps> = ({
  ref,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
  children,
  ...props
}) => {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : uncontrolledExpanded;
  const contentId = useId();
  const testId = useTestId('group');

  const toggle = useCallback(() => {
    const next = !expanded;
    if (!isControlled) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  }, [expanded, isControlled, onExpandedChange]);

  return (
    <NavPanelGroupContext.Provider value={{ expanded, toggle, contentId }}>
      <div
        {...props}
        ref={ref}
        data-slot='nav-panel-group'
        data-testid={testId}
        className={cn('flex flex-col', className)}
      >
        {children}
      </div>
    </NavPanelGroupContext.Provider>
  );
};

NavPanelGroup.displayName = 'NavPanelGroup';
