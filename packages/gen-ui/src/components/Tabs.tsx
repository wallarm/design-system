import { Children } from 'react';
import * as z from 'zod';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { HStack, VStack } from '@wallarm-org/design-system/Stack';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@wallarm-org/design-system/Tabs';
import { defineComponent } from '../core/define';

export const TabsComponent = defineComponent({
  name: 'Tabs',
  description:
    'Splits content into alternative panes the user switches between (Overview / Requests / Rules). labels[i] titles the i-th child: send one child per label, and wrap several blocks of a pane in a Stack. Use Sections instead when the content is not alternative.',
  props: z.object({
    labels: z.array(z.string().min(1)).min(1),
  }),
  hasChildren: true,
  Skeleton: () => (
    <VStack gap={12} align='stretch' fullWidth>
      <HStack gap={16}>
        <Skeleton width='80px' height='20px' transparent={false} />
        <Skeleton width='80px' height='20px' transparent={false} />
        <Skeleton width='80px' height='20px' transparent={false} />
      </HStack>
      <Skeleton width='100%' height='120px' transparent={false} />
    </VStack>
  ),
  View: ({ props, children }) => {
    // Values are indices, so repeated labels stay distinct. A label whose child hasn't streamed in
    // yet gets an empty pane; children past the last label are dropped.
    const panes = Children.toArray(children);
    return (
      // Inactive panes stay mounted so charts keep their state across switches.
      <Tabs defaultValue='0' lazyMount={false} unmountOnExit={false}>
        <TabsList>
          {props.labels.map((label, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the index is the tab's value; labels may repeat
            <TabsTrigger key={i} value={String(i)}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {props.labels.map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the index is the tab's value; labels may repeat
          <TabsContent key={i} value={String(i)}>
            {/* DS TabsContent has no spacing of its own; keep the pane off the tab underline. */}
            <div className='pt-16'>{panes[i]}</div>
          </TabsContent>
        ))}
      </Tabs>
    );
  },
});
