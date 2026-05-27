import type { FC, ReactNode } from 'react';
import { NavPanel, NavPanelBack, NavPanelDivider, NavPanelHeader } from '../NavPanel';
import { Text } from '../Text';
import { HeaderActions } from './HeaderActions';
import { NavItemsList } from './NavItemsList';
import { findDrillNode } from './navUtils';
import { useProductNavContext } from './ProductNavContext';
import {
  DRILL_ANIMATION_DURATION,
  DRILL_ANIMATION_EASING,
  useDrillTransition,
} from './useDrillTransition';

type ProductNavPanelProps = { resizable?: boolean };

export const ProductNavPanel: FC<ProductNavPanelProps> = ({ resizable }) => {
  const { config, navStack, effectiveActiveItemId, navigate, drillInto, goBack, drillLevel } =
    useProductNavContext();

  const { transition, clearTransition } = useDrillTransition(drillLevel);
  const hasHeaderActions = !!config.headerActions?.length;

  const renderContent = (level: number): ReactNode => {
    const entry = navStack[Math.min(level, navStack.length - 1)]!;

    if (level === 0) {
      return (
        <>
          {hasHeaderActions ? (
            <div className='sticky top-0 z-10 flex shrink-0 items-center justify-between p-4'>
              <Text size='sm' weight='medium'>
                {config.productLabel}
              </Text>
              <HeaderActions actions={config.headerActions!} />
            </div>
          ) : (
            <NavPanelHeader>{config.productLabel}</NavPanelHeader>
          )}

          <NavItemsList
            items={config.items}
            activeItemId={effectiveActiveItemId}
            onNavigate={navigate}
            onDrillClick={drillInto}
          />
        </>
      );
    }

    const parentEntry = navStack[level - 1]!;
    const drillNode = findDrillNode(parentEntry.items, parentEntry.activeItemId);
    const backLabel = drillNode?.label ?? 'Back';

    return (
      <>
        <div className='sticky top-0 z-10 flex flex-col gap-2 bg-bg-surface-1'>
          <NavPanelHeader>{entry.title}</NavPanelHeader>
          <NavPanelBack onClick={goBack}>{backLabel}</NavPanelBack>
          <NavPanelDivider />
        </div>

        <NavItemsList
          items={entry.items}
          activeItemId={effectiveActiveItemId}
          onNavigate={navigate}
          onDrillClick={drillInto}
        />
      </>
    );
  };

  if (transition) {
    const isForward = transition.direction === 'forward';
    const slideAnim = isForward ? 'ds-nav-drill-forward' : 'ds-nav-drill-backward';
    const timing = `${DRILL_ANIMATION_DURATION} ${DRILL_ANIMATION_EASING} both`;

    return (
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
              {renderContent(isForward ? transition.fromLevel : drillLevel)}
            </div>
            <div
              className='flex w-full shrink-0 flex-col gap-2 motion-reduce:animate-none'
              style={{
                animation: `${isForward ? 'ds-nav-blur-in' : 'ds-nav-blur-out'} ${timing}`,
              }}
            >
              {renderContent(isForward ? drillLevel : transition.fromLevel)}
            </div>
          </div>
        </div>
      </NavPanel>
    );
  }

  return <NavPanel resizable={resizable}>{renderContent(drillLevel)}</NavPanel>;
};

ProductNavPanel.displayName = 'ProductNavPanel';
