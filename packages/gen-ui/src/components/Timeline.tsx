import * as z from 'zod';
import { Badge, type BadgeColor } from '@wallarm-org/design-system/Badge';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { HStack, VStack } from '@wallarm-org/design-system/Stack';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@wallarm-org/design-system/Timeline';
import { defineComponent, subsetOf } from '../core/define';
import { renderValue } from '../render/cells';

export const TimelineComponent = defineComponent({
  name: 'Timeline',
  description:
    'An ordered history of events, oldest first: an attack chain, incident steps, rule changes. Each item has a title, optional description, ISO time and a badge (e.g. severity). Use Table for many comparable rows, BarList for ranked values.',
  props: z.object({
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          time: z.string().optional().describe('ISO time'),
          badge: z
            .object({
              text: z.string(),
              color: z
                .enum(subsetOf<BadgeColor>()(['slate', 'red', 'amber', 'green', 'blue']))
                .optional(),
            })
            .optional(),
        }),
      )
      .min(1),
  }),
  Skeleton: () => (
    <VStack gap={16} align='stretch'>
      <Skeleton width='60%' height='36px' transparent={false} />
      <Skeleton width='50%' height='36px' transparent={false} />
      <Skeleton width='55%' height='36px' transparent={false} />
    </VStack>
  ),
  View: ({ props }) => (
    <Timeline>
      {props.items.map((item, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the order is the identity; titles may repeat
        <TimelineItem key={i}>
          <TimelineConnector>
            <TimelineIndicator>{i + 1}</TimelineIndicator>
            <TimelineSeparator />
          </TimelineConnector>
          <TimelineContent>
            <HStack gap={8} wrap='wrap'>
              <TimelineTitle>{item.title}</TimelineTitle>
              {item.badge && (
                <Badge type='secondary' color={item.badge.color ?? 'slate'}>
                  {item.badge.text}
                </Badge>
              )}
            </HStack>
            {/* FormatDateTime draws its own text: inside a TimelineDescription it would nest <p>. */}
            {item.time && renderValue(item.time, 'datetime')}
            {item.description && <TimelineDescription>{item.description}</TimelineDescription>}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  ),
});
