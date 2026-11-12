// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12557-5856
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Avatar/AvatarContent.tsx
// component=AvatarContent
import figma from 'figma';

const instance = figma.selectedInstance;

// user-item Type = Agent: the agent's glyph in place of the plate (AgentItem), 20 px beside the text-sm name.
const kind = instance.getEnum('Type', { User: 'user', Agent: 'agent' });

const size = instance.getEnum('Size', { Small: 'sm', Medium: 'md' });
const nameLayer = instance.findText('Artem Miskevich');
const name = nameLayer.type === 'TEXT' ? nameLayer.textContent : 'Artem Miskevich';
// The nested user-avatar's Type decides photo vs initials; its own template emits a whole <Avatar>, so read the variant only.
const nested = instance.findInstance('user-avatar');
const type =
  nested.type === 'INSTANCE'
    ? nested.getEnum('Type', { Photo: 'photo', Nuetral: 'neutral', Branded: 'branded' })
    : 'photo';

const image =
  type === 'photo'
    ? figma.code`<AvatarImage src='/me.png' />
  `
    : '';

// Branded is not a prop: the plate takes the brand colour inside a data-frame-style='branded' frame.
const example =
  kind === 'agent'
    ? figma.code`<AgentItem agent='radar'>
  <AvatarContent>
    <AvatarName>Radar</AvatarName>
  </AvatarContent>
</AgentItem>`
    : type === 'branded'
      ? figma.code`<div data-frame-style='branded'>
  <Avatar size='${size}'>
    <AvatarFallback name='${name}' />
    <AvatarContent>
      <AvatarName>${name}</AvatarName>
    </AvatarContent>
  </Avatar>
</div>`
      : figma.code`<Avatar size='${size}'>
  ${image}<AvatarFallback name='${name}' />
  <AvatarContent>
    <AvatarName>${name}</AvatarName>
  </AvatarContent>
</Avatar>`;

export default {
  id: 'avatar-content',
  example,
  imports: [
    "import { AgentItem, Avatar, AvatarContent, AvatarFallback, AvatarImage, AvatarName } from '@wallarm-org/design-system/Avatar';",
  ],
  metadata: { nestable: true },
};
