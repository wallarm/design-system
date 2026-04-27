import { useEffect, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Copy, Folder, Trash2 } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../Card';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerResizeHandle,
  DrawerTitle,
  DrawerTrigger,
} from '../Drawer';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { Selection } from './Selection';
import { SelectionAll } from './SelectionAll';
import { SelectionBulkBar } from './SelectionBulkBar';
import { SelectionItem } from './SelectionItem';

interface Cluster {
  id: string;
  title: string;
  region: string;
  status: 'Active' | 'Idle' | 'Error';
  locked?: boolean;
}

const clusters: Cluster[] = [
  { id: '1', title: 'Production cluster', region: 'us-east-1', status: 'Active' },
  { id: '2', title: 'Staging cluster', region: 'eu-west-1', status: 'Active' },
  { id: '3', title: 'Dev cluster', region: 'us-west-2', status: 'Idle' },
  { id: '4', title: 'Legacy cluster', region: 'ap-south-1', status: 'Error' },
  { id: '5', title: 'Read replica', region: 'us-east-1', status: 'Active', locked: true },
];

const meta = {
  title: 'Data Display/Selection',
  component: Selection,
  subcomponents: {
    SelectionItem,
    SelectionAll,
    SelectionBulkBar,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Selection is a compound component family that wraps arbitrary items, ' +
          'gives each one a checkbox, and reveals an animated bulk-action bar when items are selected. ' +
          'Use SelectionItem to wrap each item, SelectionAll for a select-all checkbox, ' +
          'and SelectionBulkBar for the action bar.',
      },
    },
  },
} satisfies Meta<typeof Selection>;

export default meta;

const ClusterCard = ({ cluster }: { cluster: Cluster }) => (
  <Card className='flex-1'>
    <CardHeader>
      <CardTitle>{cluster.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Text size='sm' color='secondary'>
        {cluster.region}
      </Text>
    </CardContent>
    <CardFooter>
      <Badge>{cluster.status}</Badge>
    </CardFooter>
  </Card>
);

export const Default: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
      <VStack gap={12}>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </VStack>

      <SelectionBulkBar>
        <Button
          variant='ghost'
          color='neutral-alt'
          onClick={() => alert(`Duplicate ${selected.length}`)}
        >
          <Copy /> Duplicate
        </Button>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const WithSelectAll: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
      <VStack gap={16}>
        <HStack gap={8} align='center'>
          <SelectionAll />
          <Text size='sm' color='secondary'>
            Select all
          </Text>
        </HStack>

        <VStack gap={12}>
          {clusters.map(c => (
            <SelectionItem key={c.id} itemId={c.id}>
              <ClusterCard cluster={c} />
            </SelectionItem>
          ))}
        </VStack>
      </VStack>

      <SelectionBulkBar>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const Grid: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
      <div className='grid grid-cols-3 gap-12'>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </div>

      <SelectionBulkBar>
        <Button onClick={() => alert(selected.join(', '))}>Inspect</Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const WithDisabled: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
      <VStack gap={8}>
        <HStack gap={8} align='center'>
          <SelectionAll />
          <Text size='sm' color='secondary'>
            Select all (locked items skipped)
          </Text>
        </HStack>

        <VStack gap={12}>
          {clusters.map(c => (
            <SelectionItem key={c.id} itemId={c.id} disabled={c.locked}>
              <ClusterCard cluster={c} />
            </SelectionItem>
          ))}
        </VStack>
      </VStack>

      <SelectionBulkBar>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const RangeSelection: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
      <VStack gap={12}>
        <Text size='sm' color='secondary'>
          Tip: hold <kbd>Shift</kbd> and click another checkbox to select a range.
        </Text>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </VStack>

      <SelectionBulkBar>
        <Button color='brand' onClick={() => alert(`Selected: ${selected.join(', ')}`)}>
          Confirm
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const BulkActions: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
      <VStack gap={12}>
        {clusters.map(c => (
          <SelectionItem key={c.id} itemId={c.id}>
            <ClusterCard cluster={c} />
          </SelectionItem>
        ))}
      </VStack>

      <SelectionBulkBar>
        <Button
          variant='ghost'
          color='neutral-alt'
          onClick={() => alert(`Move ${selected.length}`)}
        >
          <Folder /> Move
        </Button>
        <Button
          variant='ghost'
          color='neutral-alt'
          onClick={() => alert(`Duplicate ${selected.length}`)}
        >
          <Copy /> Duplicate
        </Button>
        <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
          <Trash2 /> Delete
        </Button>
      </SelectionBulkBar>
    </Selection>
  );
};

export const EmptyAndPartial: StoryFn<typeof meta> = () => {
  const [items, setItems] = useState<Cluster[]>(clusters);
  const [selected, setSelected] = useState<string[]>(['1', 'ghost']);

  // Demonstrate cleanup pattern: drop ids that no longer exist in items.
  useEffect(() => {
    setSelected(prev => prev.filter(id => items.some(c => c.id === id)));
  }, [items]);

  return (
    <VStack gap={16}>
      <HStack gap={8}>
        <Button onClick={() => setItems([])} variant='outline'>
          Clear items
        </Button>
        <Button onClick={() => setItems(clusters)} variant='outline'>
          Restore items
        </Button>
      </HStack>

      <Selection items={items} getItemId={c => c.id} value={selected} onChange={setSelected}>
        <VStack gap={12}>
          {items.length === 0 ? (
            <Text size='sm' color='secondary'>
              No items.
            </Text>
          ) : (
            items.map(c => (
              <SelectionItem key={c.id} itemId={c.id}>
                <ClusterCard cluster={c} />
              </SelectionItem>
            ))
          )}
        </VStack>

        <SelectionBulkBar>
          <Button color='brand' onClick={() => alert(`Delete ${selected.length}`)}>
            <Trash2 /> Delete
          </Button>
        </SelectionBulkBar>
      </Selection>
    </VStack>
  );
};

export const WithoutBulkBar: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
      <VStack gap={16}>
        <Text size='sm' color='secondary'>
          Selected: {selected.length}
        </Text>

        <VStack gap={12}>
          {clusters.map(c => (
            <SelectionItem key={c.id} itemId={c.id}>
              <ClusterCard cluster={c} />
            </SelectionItem>
          ))}
        </VStack>
      </VStack>
    </Selection>
  );
};

export const InsideDrawer: StoryFn<typeof meta> = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Drawer width={720}>
      <DrawerTrigger asChild>
        <Button>Open drawer with selection</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerResizeHandle />
        <DrawerHeader>
          <DrawerTitle>Clusters</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <Selection items={clusters} getItemId={c => c.id} value={selected} onChange={setSelected}>
            <VStack gap={16}>
              <HStack gap={8} align='center'>
                <SelectionAll />
                <Text size='sm' color='secondary'>
                  Select all
                </Text>
              </HStack>

              <VStack gap={12}>
                {clusters.map(c => (
                  <SelectionItem key={c.id} itemId={c.id}>
                    <ClusterCard cluster={c} />
                  </SelectionItem>
                ))}
              </VStack>
            </VStack>

            <SelectionBulkBar>
              <Button
                variant='secondary'
                color='neutral-alt'
                size='large'
                onClick={() => alert(`Duplicate ${selected.length}`)}
              >
                <Copy /> Duplicate
              </Button>
              <Button
                variant='secondary'
                color='neutral-alt'
                size='large'
                onClick={() => alert(`Move ${selected.length}`)}
              >
                <Folder /> Move
              </Button>
              <Button
                variant='secondary'
                color='destructive'
                size='large'
                onClick={() => alert(`Delete ${selected.length}`)}
              >
                <Trash2 /> Delete
              </Button>
            </SelectionBulkBar>
          </Selection>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
