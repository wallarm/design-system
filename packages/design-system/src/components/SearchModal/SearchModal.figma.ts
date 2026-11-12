// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=10720-7670
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SearchModal/SearchModal.tsx
// component=SearchModal
import figma from 'figma';

// Figma exposes only 'Property 1'=Default, so this is a static composition example
// and `figma.selectedInstance` is intentionally not read. Group order follows the
// Figma node (Recent, Jump to, Quick actions). `open`/`setOpen`/`setQuery` come from
// `useState` in the consumer.
const example = figma.code`<SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
  <SearchModalContent>
    <SearchModalInput placeholder='Search products, features, and more…' />
    <SearchModalBody>
      <SearchModalGroup>
        <SearchModalGroupLabel>
          <Text size='xs' color='secondary' weight='medium'>
            Recent
          </Text>
        </SearchModalGroupLabel>
        <SearchModalItem onSelect={handleSelect}>
          <History className='!icon-md' />
          <Text size='sm'>Rules — Cloud WAF</Text>
          <span className='ml-auto'>
            <Text size='xs' color='secondary'>
              2m ago
            </Text>
          </span>
        </SearchModalItem>
      </SearchModalGroup>
      <SearchModalGroup>
        <SearchModalGroupLabel>
          <Text size='xs' color='secondary' weight='medium'>
            Jump to
          </Text>
        </SearchModalGroupLabel>
        <SearchModalItem onSelect={handleSelect}>
          <Search className='!icon-md' />
          <Text size='sm'>Scanner</Text>
          <ChevronRight className='text-text-tertiary ml-auto !icon-sm' />
        </SearchModalItem>
      </SearchModalGroup>
      <SearchModalGroup>
        <SearchModalGroupLabel>
          <Text size='xs' color='secondary' weight='medium'>
            Quick actions
          </Text>
        </SearchModalGroupLabel>
        <SearchModalItem onSelect={handleSelect}>
          <AgentGlyph agent='wally' size={20} />
          <Text size='sm'>Ask Wally</Text>
        </SearchModalItem>
        <SearchModalItem onSelect={handleSelect}>
          <Users className='!icon-md' />
          <Text size='sm'>Switch tenant</Text>
        </SearchModalItem>
        <SearchModalItem onSelect={handleSelect}>
          <Plus className='!icon-md' />
          <Text size='sm'>Create…</Text>
        </SearchModalItem>
      </SearchModalGroup>
    </SearchModalBody>
    <SearchModalFooter />
  </SearchModalContent>
</SearchModal>`;

export default {
  id: 'search-modal',
  example,
  imports: [
    "import { SearchModal, SearchModalBody, SearchModalContent, SearchModalFooter, SearchModalGroup, SearchModalGroupLabel, SearchModalInput, SearchModalItem } from '@wallarm-org/design-system/SearchModal';",
    "import { Text } from '@wallarm-org/design-system/Text';",
    "import { AgentGlyph } from '@wallarm-org/design-system/AgentGlyph';",
    "import { ChevronRight, History, Plus, Search, Users } from '@wallarm-org/design-system/icons';",
  ],
  metadata: { nestable: false },
};
