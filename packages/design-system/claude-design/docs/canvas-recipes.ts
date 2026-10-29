import type { ExampleMetadata } from '@wallarm-org/mcp-core';

// These small canvas compositions replace story-only routers, mocks and backend fixtures.
// Their source APIs are checked by mounting the emitted adapters against the real bundle.
const recipe = (name: string, code: string, description: string): ExampleMetadata => ({
  name,
  code,
  description,
});
const imports = (names: string): string => `import { ${names} } from '@wallarm-org/design-system';`;

const shell = (mode: 'expanded' | 'compact'): string => `
${imports('AppShell, AppShellHeader, AppShellRail, AppShellRemote, NavRail, NavRailBody, NavRailItem, TopHeader, TopHeaderLogo, Logo, Text')}
import { Search } from '@wallarm-org/design-system/icons';
export const CanvasShell = () => (
  <AppShell appeared={true} ambient={false}>
    <AppShellHeader><TopHeader><TopHeaderLogo href='#overview' aria-label='Wallarm overview'><Logo /></TopHeaderLogo></TopHeader></AppShellHeader>
    <AppShellRail><NavRail mode='${mode}'><NavRailBody><NavRailItem icon={Search} label='API inventory' href='#inventory' active={true} /></NavRailBody></NavRail></AppShellRail>
    <AppShellRemote><div className='p-24'><Text>API inventory</Text></div></AppShellRemote>
  </AppShell>
);`;

const rail = (mode: 'expanded' | 'compact'): string => `
import { useState } from 'react';
${imports('NavRail, NavRailBody, NavRailItem, NavRailFooter, Text')}
import { Search, Settings } from '@wallarm-org/design-system/icons';
export const CanvasRail = () => {
  const [active, setActive] = useState('inventory');
  return <div className='flex gap-16'>
    <NavRail mode='${mode}'>
      <NavRailBody><NavRailItem icon={Search} label='API inventory' href='#inventory' active={active === 'inventory'} onClick={event => { event.preventDefault(); setActive('inventory'); }} /></NavRailBody>
      <NavRailFooter><NavRailItem icon={Settings} label='Settings' href='#settings' active={active === 'settings'} onClick={event => { event.preventDefault(); setActive('settings'); }} /></NavRailFooter>
    </NavRail><Text>{active === 'inventory' ? 'API inventory' : 'Settings'}</Text>
  </div>;
};`;

const remote = (resizable: boolean): string => `
import { useState } from 'react';
${imports('RemoteShell, RemoteShellPanel, RemoteShellBreadcrumb, RemoteShellContent, Text')}
export const CanvasRemote = () => {
  const [pathname, setPathname] = useState('/rules');
  const config = {
    productLabel: 'Security', productPath: '/', items: [
      { type: 'link', id: 'rules', label: 'Rules', path: 'rules' },
      { type: 'link', id: 'events', label: 'Events', path: 'events' }
    ]
  };
  return <RemoteShell config={config} pathname={pathname} onNavigate={setPathname}>
    <RemoteShellPanel resizable={${resizable}} />
    <RemoteShellBreadcrumb />
    <RemoteShellContent><div className='p-24'><Text>{pathname === '/events' ? 'Events' : pathname === '/rules' ? 'Rules' : 'Security overview'}</Text></div></RemoteShellContent>
  </RemoteShell>;
};`;

const feedback = (showComment: boolean): string => `
import { useState } from 'react';
${imports('FeedbackPulse, Button, Text')}
export const CanvasFeedback = () => {
  const [open, setOpen] = useState(true);
  const [score, setScore] = useState(null);
  return <div className='flex flex-col gap-16'>
    <Button variant='outline' color='neutral' onClick={() => setOpen(true)}>Rate this feature</Button>
    <Text>{score === null ? 'Choose a score in the feedback card.' : 'Submitted score: ' + score}</Text>
    <FeedbackPulse open={open} onOpenChange={setOpen} showComment={${showComment}} onSubmit={result => setScore(result.score)} />
  </div>;
};`;

const assistant = (withHistory: boolean): string => `
import { useState } from 'react';
${imports('WallyAssistant')}
export const CanvasAssistant = () => {
  const [messages, setMessages] = useState(${
    withHistory
      ? `[
    { id: 'u1', role: 'user', parts: [{ id: 'u1-text', type: 'text', text: 'Show my security rules.' }] },
    { id: 'a1', role: 'assistant', parts: [{ id: 'a1-text', type: 'text', text: 'Choose a rule in the inventory to inspect it.' }] }
  ]`
      : '[]'
  });
  const send = text => setMessages(previous => {
    const id = 'message-' + previous.length;
    return [...previous,
      { id: id, role: 'user', parts: [{ id: id + '-text', type: 'text', text: text }] },
      { id: id + '-reply', role: 'assistant', parts: [{ id: id + '-reply-text', type: 'text', text: 'Prototype response. No request was sent to a service.' }] }
    ];
  });
  return <div className='h-screen'><WallyAssistant messages={messages} onSubmit={send} suggestions={[{ id: 'rules', label: 'Review security rules' }]} /></div>;
};`;

const scroll = (horizontal: boolean): string => `
${imports('ScrollArea, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaCorner, Text')}
export const CanvasScroll = () => (
  <div className='h-128 w-full overflow-hidden'><ScrollArea>
    <ScrollAreaViewport><ScrollAreaContent>
      ${
        horizontal
          ? `<Text className='whitespace-nowrap'>Request path /api/v1/security/events?environment=production&amp;status=blocked&amp;sort=first-detected&amp;direction=descending</Text>`
          : `<div className='flex flex-col gap-8'>${Array.from({ length: 12 }, (_, index) => `<Text>Security event ${index + 1}</Text>`).join('')}</div>`
      }
    </ScrollAreaContent></ScrollAreaViewport>
    <ScrollAreaScrollbar orientation='${horizontal ? 'horizontal' : 'vertical'}' /><ScrollAreaCorner />
  </ScrollArea></div>
);`;

export const canvasRecipes: Readonly<Record<string, ExampleMetadata[]>> = {
  AppShell: [
    recipe(
      'Canvas shell',
      shell('expanded'),
      'A complete shell with its header, rail and content regions. appeared skips entrance choreography for a static composition.',
    ),
    recipe(
      'Compact rail shell',
      shell('compact'),
      'The same shell using the compact navigation mode.',
    ),
  ],
  NavRail: [
    recipe(
      'Expanded navigation',
      rail('expanded'),
      'Local selection state keeps the prototype in the canvas and demonstrates the active item.',
    ),
    recipe(
      'Compact navigation',
      rail('compact'),
      'Compact mode retains readable labels beneath the icons.',
    ),
  ],
  TopHeader: ['full', 'icon'].map(type =>
    recipe(
      `${type} logo header`,
      `
    ${imports('TopHeader, TopHeaderLogo, TopHeaderActions, Logo, Text')}
    export const CanvasHeader = () => <TopHeader>
      <TopHeaderLogo href='#overview' aria-label='Wallarm overview'><Logo type='${type}' /></TopHeaderLogo>
      <TopHeaderActions><Text>Production workspace</Text></TopHeaderActions>
    </TopHeader>;`,
      'Compose the logo and right-side workspace context explicitly. In a full page, put TopHeader inside AppShellHeader.',
    ),
  ),
  RemoteShell: [
    recipe(
      'Local navigation',
      remote(false),
      'Navigation is controlled by local pathname state, without a router or browser history changes.',
    ),
    recipe(
      'Resizable navigation',
      remote(true),
      'The same complete navigation composition with a resizable panel.',
    ),
  ],
  FeedbackPulse: [
    recipe(
      'Rating and comment',
      feedback(true),
      'An open feedback card with real local submission state and a trigger to open it again.',
    ),
    recipe(
      'Rating only',
      feedback(false),
      'The shorter score-only flow; the submitted score stays visible in the prototype.',
    ),
  ],
  WallyAssistant: [
    recipe(
      'Local conversation',
      assistant(false),
      'A working prototype composer and suggestion. Replies are explicitly simulated; it makes no network requests.',
    ),
    recipe(
      'Conversation history',
      assistant(true),
      'The same local conversation with an existing user/assistant exchange.',
    ),
  ],
  Flex: ['row', 'column'].map(direction =>
    recipe(
      `${direction} layout`,
      `
    ${imports('Flex, Text')}
    export const CanvasFlex = () => <Flex direction='${direction}' gap={8}><Text>Requests</Text><Text>Blocked</Text><Text>Allowed</Text></Flex>;
  `,
      'Use element children and a spacing-scale gap; change direction to arrange the same content.',
    ),
  ),
  ScrollArea: [
    recipe(
      'Vertical content',
      scroll(false),
      'A bounded viewport with enough rows to overflow vertically.',
    ),
    recipe(
      'Horizontal content',
      scroll(true),
      'A no-wrap request path with a horizontal scrollbar.',
    ),
  ],
};
