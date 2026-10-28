// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=6816-5072
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Card/Card.tsx
// component=Card
import figma, { type SlotResult } from 'figma';

// An empty slot comes back as a guid-less SLOT section that renders "Missing snippet".
const filled = (slot?: SlotResult) => !!slot?.some(s => s.type !== 'SLOT' || s.guid);

const instance = figma.selectedInstance;

const color = instance.getEnum('Color', { Secondary: 'secondary' });
const disabled = instance.getEnum('State', { Disabled: true });

// Header lives in the private `_header` sub-component; read its props directly.
// `_header` 'Subtitle' / 'Text' are intentionally unmapped: code has no CardSubtitle.
const header = instance.findInstance('_header');
const isHeader = header.type === 'INSTANCE';
const title = isHeader ? header.getString('Title') : 'Card title';
// Searches below don't traverse nested instances, so only `_header`'s own layers
// (title icon + badge) are visited; the badge is excluded by name.
const headerIcon =
  isHeader && header.getBoolean('Header icon')
    ? header.findConnectedInstances(n => n.name !== 'badge').map(i => i.executeTemplate().example)
    : [];
const badgeLayer =
  isHeader && header.getBoolean('Show badge') ? header.findInstance('badge') : null;
const badge = badgeLayer?.type === 'INSTANCE' ? badgeLayer.executeTemplate().example : undefined;

const hasContent = instance.getBoolean('Content');
const slot = instance.getSlot('Slot');
// One variant group names the body text layer 'Description Text'.
const descriptionLayer = instance.findText('Description');
const descriptionFallback =
  descriptionLayer.type === 'TEXT' ? descriptionLayer : instance.findText('Description Text');
const description =
  descriptionFallback.type === 'TEXT' ? descriptionFallback.textContent : 'Card description';

// Side-action Buttons are plain frame children of the body; nested instances
// (`_header`, `_footer`) are not traversed, so only those Buttons match.
const sideActions = instance.getBoolean('Side actions')
  ? instance.findConnectedInstances(n => n.name === 'Button').map(i => i.executeTemplate().example)
  : [];

const footer = instance.findInstance('_footer');
const footerActions =
  instance.getBoolean('Bottom actions') && footer.type === 'INSTANCE'
    ? footer.findConnectedInstances(n => n.name === 'Button').map(i => i.executeTemplate().example)
    : [];

const body = filled(slot) ? slot : description;

const example = figma.code`<Card${figma.helpers.react.renderProp('color', color)}${figma.helpers.react.renderProp('disabled', disabled)}>
  <CardHeader>
    <CardTitle${headerIcon.length ? figma.code` icon={${headerIcon[0]}}` : ''}>${title}</CardTitle>${
      badge
        ? figma.code`
    ${badge}`
        : ''
    }
  </CardHeader>${
    hasContent
      ? sideActions.length
        ? figma.code`
  <CardContent>
    ${body}
    ${sideActions}
  </CardContent>`
        : figma.code`
  <CardContent>${body}</CardContent>`
      : ''
  }${
    footerActions.length
      ? figma.code`
  <CardFooter>
    ${footerActions}
  </CardFooter>`
      : ''
  }
</Card>`;

export default {
  id: 'card',
  example,
  imports: [
    "import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@wallarm-org/design-system/Card';",
  ],
  metadata: { nestable: true },
};
