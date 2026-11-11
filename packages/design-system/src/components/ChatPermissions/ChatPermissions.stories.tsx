import { useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { Separator } from '../Separator';
import {
  ChatPermissions,
  ChatPermissionsContent,
  ChatPermissionsItem,
  type ChatPermissionsItemCheckedChangeDetails,
  ChatPermissionsTrigger,
} from './index';

const DESCRIPTION = [
  'The settings button in the chat composer that lists which Wally tools may run without asking first in this conversation.',
  'Each row is a switch and takes effect the moment it is flipped — there is no Save, and the popover stays open so several tools can be changed in one go.',
  'The app owns the list and its order: enabled tools first, then a `Separator` and the disabled ones.',
].join(' ');

interface Tool {
  name: string;
  description: string;
}

const TOOLS: Tool[] = [
  { name: 'propose_add_to_denylist', description: 'Suggest IPs to add to the denylist' },
  { name: 'search_attacks', description: 'Search detected attacks and incidents' },
  {
    name: 'get_api_inventory',
    description: 'Read the discovered API endpoints, their parameters, owners and risk scores',
  },
  { name: 'create_rule', description: 'Draft a mitigation rule for review' },
];

const meta = {
  title: 'AI/ChatPermissions',
  component: ChatPermissions,
  subcomponents: { ChatPermissionsTrigger, ChatPermissionsContent, ChatPermissionsItem },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof ChatPermissions>;

export default meta;

/** Every tool is allowed. Open the popover with the settings button; the tooltip names it until then. */
export const AllOn: StoryFn<typeof meta> = () => {
  const [allowed, setAllowed] = useState<Record<string, boolean>>({
    propose_add_to_denylist: true,
    search_attacks: true,
    get_api_inventory: true,
    create_rule: true,
  });
  const enabled = TOOLS.filter(tool => allowed[tool.name]);
  const disabled = TOOLS.filter(tool => !allowed[tool.name]);

  const handleCheckedChange = ({ checked, name }: ChatPermissionsItemCheckedChangeDetails) => {
    setAllowed(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className='flex h-[360px] w-[400px] items-end'>
      <ChatPermissions data-testid='permissions'>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent>
          {enabled.map(tool => (
            <ChatPermissionsItem
              key={tool.name}
              name={tool.name}
              data-testid={`permission-${tool.name}`}
              title={tool.name}
              description={tool.description}
              checked
              onCheckedChange={handleCheckedChange}
            />
          ))}
          {enabled.length > 0 && disabled.length > 0 && <Separator spacing={4} />}
          {disabled.map(tool => (
            <ChatPermissionsItem
              key={tool.name}
              name={tool.name}
              data-testid={`permission-${tool.name}`}
              title={tool.name}
              description={tool.description}
              checked={false}
              onCheckedChange={handleCheckedChange}
            />
          ))}
        </ChatPermissionsContent>
      </ChatPermissions>
    </div>
  );
};

/** Two tools switched off sit below a separator. The order is decided by the app, not the component. */
export const SomeOff: StoryFn<typeof meta> = () => {
  const [allowed, setAllowed] = useState<Record<string, boolean>>({
    propose_add_to_denylist: true,
    search_attacks: true,
    get_api_inventory: false,
    create_rule: false,
  });
  const enabled = TOOLS.filter(tool => allowed[tool.name]);
  const disabled = TOOLS.filter(tool => !allowed[tool.name]);

  const handleCheckedChange = ({ checked, name }: ChatPermissionsItemCheckedChangeDetails) => {
    setAllowed(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className='flex h-[360px] w-[400px] items-end'>
      <ChatPermissions data-testid='permissions'>
        <ChatPermissionsTrigger />
        <ChatPermissionsContent>
          {enabled.map(tool => (
            <ChatPermissionsItem
              key={tool.name}
              name={tool.name}
              data-testid={`permission-${tool.name}`}
              title={tool.name}
              description={tool.description}
              checked
              onCheckedChange={handleCheckedChange}
            />
          ))}
          {enabled.length > 0 && disabled.length > 0 && <Separator spacing={4} />}
          {disabled.map(tool => (
            <ChatPermissionsItem
              key={tool.name}
              name={tool.name}
              data-testid={`permission-${tool.name}`}
              title={tool.name}
              description={tool.description}
              checked={false}
              onCheckedChange={handleCheckedChange}
            />
          ))}
        </ChatPermissionsContent>
      </ChatPermissions>
    </div>
  );
};

/**
 * `data-analytics-id` lands on the real trigger `<button>` and on each switch row's `<label>`, so
 * a click anywhere on the row resolves to the row's id.
 */
export const Analytics: StoryFn<typeof meta> = () => {
  const [checked, setChecked] = useState(true);

  const handleCheckedChange = (details: ChatPermissionsItemCheckedChangeDetails) => {
    setChecked(details.checked);
  };

  return (
    <div className='flex h-[360px] w-[400px] items-end'>
      <ChatPermissions data-testid='permissions'>
        <ChatPermissionsTrigger data-analytics-id='CHAT_PERMISSIONS_OPEN' />
        <ChatPermissionsContent>
          <ChatPermissionsItem
            name='search_attacks'
            data-testid='permission-search_attacks'
            data-analytics-id='CHAT_PERMISSION_TOGGLE'
            data-analytics-props='{"tool":"search_attacks"}'
            title='search_attacks'
            description='Search detected attacks and incidents'
            checked={checked}
            onCheckedChange={handleCheckedChange}
          />
        </ChatPermissionsContent>
      </ChatPermissions>
    </div>
  );
};
