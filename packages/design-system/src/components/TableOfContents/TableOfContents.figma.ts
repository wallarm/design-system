// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=13000-7596
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/TableOfContents/TableOfContents.tsx
// component=TableOfContents
import figma from 'figma';

const instance = figma.selectedInstance;

const minimized = instance.getEnum('Type', { Mini: true }) ?? false;

// Only the toc-item instances, matched by Code Connect id (layer names can be renamed).
interface ItemProps {
  value: string;
  active: boolean;
}
const nodes = (instance.getSlot('Slot')?.connectedInstances ?? []).filter(
  node => node.codeConnectId() === 'toc-item',
);
const value = nodes
  .map(node => node.executeTemplate().metadata?.props as ItemProps | undefined)
  .find(props => props?.active)?.value;
const items = nodes.map(
  node => figma.code`
  ${node.executeTemplate().example}`,
);

export default {
  id: 'toc-progress',
  example: figma.code`<TableOfContents${value ? figma.code` value='${value}'` : ''}${
    minimized ? figma.code` defaultView='minimized'` : ''
  } onValueChange={scrollTo}>${items}
</TableOfContents>`,
  imports: [
    "import { TableOfContents, TableOfContentsItem } from '@wallarm-org/design-system/TableOfContents';",
  ],
  metadata: { nestable: true },
};
