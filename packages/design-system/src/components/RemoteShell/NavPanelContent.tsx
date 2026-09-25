import type { FC } from 'react';
import { NavPanelBack, NavPanelDivider, NavPanelHeader } from '../NavPanel';
import { Text } from '../Text';
import { HeaderActions } from './HeaderActions';
import type { NavStackEntry } from './model';
import { findDrillNode, useRemoteShellContext } from './model';
import { NavItemsList } from './NavItemsList';

interface NavigationSnapshot {
  navStack: NavStackEntry[];
  activeItemId: string | null;
}

interface NavPanelContentProps {
  level: number;
  navigationSnapshot?: NavigationSnapshot;
}

export const NavPanelContent: FC<NavPanelContentProps> = ({
  level: rawLevel,
  navigationSnapshot,
}) => {
  const {
    config,
    navStack: currentNavStack,
    effectiveActiveItemId: currentActiveItemId,
    navigate,
    drillInto,
    goBack,
  } = useRemoteShellContext();

  const navStack = navigationSnapshot?.navStack ?? currentNavStack;
  const effectiveActiveItemId = navigationSnapshot
    ? navigationSnapshot.activeItemId
    : currentActiveItemId;

  const level = Math.min(rawLevel, navStack.length - 1);
  const entry = navStack[level]!;
  const hasHeaderActions = !!config.headerActions?.length;

  if (level === 0)
    return (
      <>
        {hasHeaderActions ? (
          <div className='sticky top-0 z-10 flex shrink-0 items-center justify-between pt-2 pl-4 pb-4 bg-bg-page-bg'>
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

  const parentEntry = navStack[level - 1]!;
  const drillNode = findDrillNode(parentEntry.items, parentEntry.activeItemId);
  const backLabel = drillNode?.label ?? 'Back';

  return (
    <>
      <div className='sticky top-0 z-10 flex flex-col gap-2 bg-bg-page-bg'>
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

NavPanelContent.displayName = 'NavPanelContent';
