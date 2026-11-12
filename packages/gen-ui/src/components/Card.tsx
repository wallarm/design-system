import { z } from 'zod';
import { Card, CardContent } from '@wallarm-org/design-system/Card';
import { defineComponent } from '../define';

export const CardComponent = defineComponent({
  name: 'Card',
  description: 'A bordered surface that groups related content.',
  props: z.object({}),
  hasChildren: true,
  View: ({ children }) => (
    <Card>
      <CardContent>{children}</CardContent>
    </Card>
  ),
});
