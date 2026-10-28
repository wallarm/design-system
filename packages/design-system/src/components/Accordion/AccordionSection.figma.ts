// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=9154-4411
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/Accordion/Accordion.tsx
// component=Accordion
import figma, { type SlotResult } from 'figma';

// An empty slot comes back as a guid-less SLOT section that renders "Missing snippet".
const filled = (slot?: SlotResult) => !!slot?.some(s => s.type !== 'SLOT' || s.guid);

const instance = figma.selectedInstance;

const expanded = instance.getEnum('Expanded', { On: true, Off: false });
const showActions = instance.getBoolean('Show Actions');
const label = instance.findText('Label');
const title = label.type === 'TEXT' ? label.textContent : 'Title';
// Inline title content (e.g. numeric-badge) placed in the "Title slot".
const titleExtras = instance.getSlot('Title slot');
// Action buttons sit in Header/Actions/Actions; the sibling chevron button is the indicator.
const actions = instance
  .findConnectedInstances(() => true, { path: ['Header', 'Actions', 'Actions'] })
  .map(i => i.executeTemplate().example);
const content = instance.getSlot('Content');

export default {
  id: 'accordion-section',
  example: figma.code`<Accordion variant='section'${expanded ? figma.code` defaultValue={['1']}` : ''}>
  <AccordionItem value='1'>
    <AccordionTrigger>
      ${title}${titleExtras?.length ? figma.code` ${titleExtras}` : ''}
    </AccordionTrigger>${
      showActions && actions.length
        ? figma.code`
    <AccordionActions>
      ${actions}
    </AccordionActions>`
        : ''
    }
    <AccordionContent>${filled(content) ? content : '...'}</AccordionContent>
  </AccordionItem>
</Accordion>`,
  imports: [
    "import { Accordion, AccordionActions, AccordionContent, AccordionItem, AccordionTrigger } from '@wallarm-org/design-system/Accordion';",
  ],
  metadata: { nestable: false },
};
