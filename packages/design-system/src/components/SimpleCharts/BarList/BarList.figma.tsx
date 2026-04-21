import figma from '@figma/code-connect';
import { Chart } from '../Chart/Chart';
import { ChartHeader } from '../Chart/ChartHeader';
import { ChartTitle } from '../Chart/ChartTitle';
import { BarList } from './BarList';
import { BarListBar } from './BarListBar';
import { BarListItem } from './BarListItem';
import { BarListLabel } from './BarListLabel';
import { BarListPercent } from './BarListPercent';
import { BarListValue } from './BarListValue';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7490-121720&m=dev';

const sampleRows = [
  { name: '/api/v1/users', value: 1240 },
  { name: '/api/v1/auth/login', value: 890 },
  { name: '/api/v1/orders', value: 612 },
  { name: '/api/v1/products', value: 358 },
  { name: '/api/v1/search', value: 174 },
];

const sampleMax = Math.max(...sampleRows.map(r => r.value));

figma.connect(BarList, figmaNodeUrl, {
  props: {
    title: figma.string('Title'),
    state: figma.enum('State', {
      Default: 'default',
      Hovered: 'hovered',
      Filtered: 'filtered',
    }),
  },
  example: ({ title, state }) => (
    <Chart>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
      </ChartHeader>
      <BarList max={sampleMax}>
        {sampleRows.map(row => (
          <BarListItem
            key={row.name}
            value={row.value}
            selected={state === 'filtered' && row.name === sampleRows[0]?.name}
            onClick={() => {}}
          >
            <BarListBar />
            <BarListLabel>{row.name}</BarListLabel>
            <BarListValue>
              {row.value.toLocaleString('en-US')}
              <BarListPercent />
            </BarListValue>
          </BarListItem>
        ))}
      </BarList>
    </Chart>
  ),
});
