// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1671-4696
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Dialog/Dialog.tsx
// component=Dialog
import figma, { type SlotResult } from 'figma';

// An empty slot comes back as a guid-less SLOT section that renders "Missing snippet".
const filled = (slot?: SlotResult) => !!slot?.some(s => s.type !== 'SLOT' || s.guid);

const instance = figma.selectedInstance;

// Widths mirror DIALOG_SIZES (not exported). Medium (560) is the code default; Custom sizes use story placeholders.
const width = instance.getEnum('Size', {
  Small: 400,
  Large: 960,
  'Custom (%)': '50%',
  'Custom (fixed)': 1000,
});
// Type=Tour is the Tour component; Confirmation/Destructive are pure footer-button composition.
const isTour = instance.getEnum('Type', { Tour: true }) === true;

// Only Button / checkbox-item / switch-item are emitted; nested icons are rendered by their Button.
const ACTION_IDS = ['button', 'checkbox', 'switch-item'];
const isAction = (node: { codeConnectId(): string | null }) =>
  ACTION_IDS.includes(node.codeConnectId() ?? '');

// Title/description live in the private `_header`; read its props directly.
const header = instance.findInstance('_header');
const isHeader = header.type === 'INSTANCE';
const title = isHeader ? header.getString('Title') : "Dialog's title";
const description = isHeader && header.getBoolean('Description') ? header.getString('Text') : '';
// Extra header buttons (the close button is rendered by DialogHeader automatically).
const headerActions =
  isHeader && header.getBoolean('Header actions')
    ? header
        .findConnectedInstances(isAction, { path: ['Actions', 'actions'], traverseInstances: true })
        .map(i => i.executeTemplate().example)
    : [];

const body = instance.getSlot('Slot');
const hasFooter = instance.getBoolean('Footer');
const footer = instance.findInstance('_footer');
const footerActions = hasFooter
  ? instance
      .findConnectedInstances(isAction, { path: ['_footer', 'Actions'], traverseInstances: true })
      .map(i => i.executeTemplate().example)
  : [];
const leftActions =
  hasFooter && footer.type === 'INSTANCE' && footer.getBoolean('More actions')
    ? instance
        .findConnectedInstances(isAction, {
          path: ['_footer', 'Left actions'],
          traverseInstances: true,
        })
        .map(i => i.executeTemplate().example)
    : [];

const dialogExample = figma.code`<Dialog${figma.helpers.react.renderProp('width', width)}>
  <DialogTrigger asChild>
    <Button variant='outline' color='neutral'>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>${title}</DialogTitle>${
        description
          ? figma.code`
      <DialogDescription>${description}</DialogDescription>`
          : ''
      }${
        headerActions.length
          ? figma.code`
      ${headerActions}`
          : ''
      }
    </DialogHeader>
    <DialogBody>${filled(body) ? body : '...'}</DialogBody>${
      hasFooter
        ? figma.code`
    <DialogFooter>${
      leftActions.length
        ? figma.code`
      <DialogFooterControls placement='left'>
        ${leftActions}
      </DialogFooterControls>`
        : ''
    }
      <DialogFooterControls>
        ${footerActions.length ? footerActions : '...'}
      </DialogFooterControls>
    </DialogFooter>`
        : ''
    }
  </DialogContent>
</Dialog>`;

const example = isTour
  ? figma.code`{/* Type=Tour: use the Tour component (@wallarm-org/design-system/Tour), not Dialog. */}`
  : dialogExample;

export default {
  id: 'dialog',
  example,
  imports: [
    "import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogFooterControls, DialogHeader, DialogTitle, DialogTrigger } from '@wallarm-org/design-system/Dialog';",
    "import { Button } from '@wallarm-org/design-system/Button';",
  ],
  metadata: { nestable: false },
};
