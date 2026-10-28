// url=https://www.figma.com/design/bsqgrzkpIB2yPVlNpgU8jN/Wally-%E2%80%94-AI-Assistnat?node-id=171-1673
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/ApprovalCard/ApprovalCard.tsx
// component=ApprovalCard
import figma, { type SlotResult } from 'figma';

// An empty slot comes back as a guid-less SLOT section that renders "Missing snippet".
const filled = (slot?: SlotResult) => !!slot?.some(s => s.type !== 'SLOT' || s.guid);

const instance = figma.selectedInstance;

const status = instance.getEnum('State', {
  Default: undefined,
  Approved: 'approved',
  Rejected: 'rejected',
});

// Pending shows the content slot (text) plus the split approve button and Reject;
// resolved states render only the status row, so children are omitted.
const slot = instance.getSlot('content');
const text = instance.findText('Approval text goes here');
const content = filled(slot)
  ? slot
  : text.type === 'TEXT'
    ? text.textContent
    : 'Approval text goes here';

const example = status
  ? figma.code`<ApprovalCard${figma.helpers.react.renderProp('status', status)} />`
  : figma.code`<ApprovalCard>
  <ApprovalCardContent>${content}</ApprovalCardContent>
  <ApprovalCardActions>
    <DropdownMenu>
      <SplitButton>
        <Button>Always allow in this session</Button>
        <DropdownMenuTrigger asChild>
          <Button aria-label='More approval options'>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
      </SplitButton>
      <DropdownMenuContent>
        <DropdownMenuItem>Allow once</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button variant='secondary' color='neutral'>
      Reject
    </Button>
  </ApprovalCardActions>
</ApprovalCard>`;

export default {
  id: 'approval-card',
  example,
  imports: [
    "import { ApprovalCard, ApprovalCardActions, ApprovalCardContent } from '@wallarm-org/design-system/ApprovalCard';",
    ...(status
      ? []
      : [
          "import { Button } from '@wallarm-org/design-system/Button';",
          "import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@wallarm-org/design-system/DropdownMenu';",
          "import { SplitButton } from '@wallarm-org/design-system/SplitButton';",
          "import { ChevronDown } from '@wallarm-org/design-system/icons';",
        ]),
  ],
  metadata: { nestable: true },
};
