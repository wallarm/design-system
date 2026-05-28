import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { NavPanel, NavPanelHeader, NavPanelSkeleton } from '../NavPanel';
import { useRemoteShellContext } from './model';
import {
  DRILL_ANIMATION_DURATION,
  DRILL_ANIMATION_EASING,
  useDrillTransition,
} from './model/useDrillTransition';
import { NavPanelContent } from './NavPanelContent';

export interface RemoteShellPanelProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  resizable?: boolean;
  isLoading?: boolean;
  loaderCount?: number;
}

export const RemoteShellPanel: FC<RemoteShellPanelProps> = ({
  ref,
  className,
  resizable,
  isLoading,
  loaderCount = 6,
  ...props
}) => {
  const testId = useTestId('panel');
  const { config, drillLevel } = useRemoteShellContext();
  const { transition, clearTransition } = useDrillTransition(drillLevel);

  if (isLoading)
    return (
      <div
        {...props}
        ref={ref}
        data-slot='remote-shell-panel'
        data-testid={testId}
        className={cn('[grid-area:panel] min-h-0', className)}
      >
        <NavPanel>
          <NavPanelHeader>{config.productLabel}</NavPanelHeader>
          <NavPanelSkeleton count={loaderCount} />
        </NavPanel>
      </div>
    );

  if (transition) {
    const isForward = transition.direction === 'forward';
    const slideAnim = isForward ? 'ds-nav-drill-forward' : 'ds-nav-drill-backward';
    const timing = `${DRILL_ANIMATION_DURATION} ${DRILL_ANIMATION_EASING} both`;

    return (
      <div
        {...props}
        ref={ref}
        data-slot='remote-shell-panel'
        data-testid={testId}
        className={cn('[grid-area:panel] min-h-0', className)}
      >
        <NavPanel resizable={resizable}>
          <div className='min-h-0 flex-1 overflow-hidden'>
            <div
              className='flex motion-reduce:animate-none'
              style={{ animation: `${slideAnim} ${timing}` }}
              onAnimationEnd={clearTransition}
            >
              <div
                className='flex w-full shrink-0 flex-col gap-2 motion-reduce:animate-none'
                style={{
                  animation: `${isForward ? 'ds-nav-blur-out' : 'ds-nav-blur-in'} ${timing}`,
                }}
              >
                <NavPanelContent level={isForward ? transition.fromLevel : drillLevel} />
              </div>
              <div
                className='flex w-full shrink-0 flex-col gap-2 motion-reduce:animate-none'
                style={{
                  animation: `${isForward ? 'ds-nav-blur-in' : 'ds-nav-blur-out'} ${timing}`,
                }}
              >
                <NavPanelContent level={isForward ? drillLevel : transition.fromLevel} />
              </div>
            </div>
          </div>
        </NavPanel>
      </div>
    );
  }

  return (
    <div
      {...props}
      ref={ref}
      data-slot='remote-shell-panel'
      data-testid={testId}
      className={cn('[grid-area:panel] min-h-0', className)}
    >
      <NavPanel resizable={resizable}>
        <NavPanelContent level={drillLevel} />
      </NavPanel>
    </div>
  );
};

RemoteShellPanel.displayName = 'RemoteShellPanel';
