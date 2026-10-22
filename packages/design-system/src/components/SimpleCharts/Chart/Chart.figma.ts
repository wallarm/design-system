// url=https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7470-917
// source=https://github.com/wallarm/design-system/blob/main/packages/design-system/src/components/SimpleCharts/Chart/Chart.tsx
// component=Chart
import figma from 'figma';

const instance = figma.selectedInstance;

// Template files may only import the default `figma`, so the handle types are derived here.
type InstanceHandle = Extract<ReturnType<typeof instance.findInstance>, { type: 'INSTANCE' }>;
type LayerHandle = ReturnType<typeof instance.findInstance> | ReturnType<typeof instance.findText>;

const type = instance.getEnum('Type', {
  'Bar list (Common)': 'bar-list',
  'Pie RC': 'pie',
  'Line (Common)': 'line',
  Metric: 'metric',
  'Metric and sparkline': 'metric-sparkline',
  'Horizontal bar (stacked)': 'horizontal-bar-stack',
  'Empty (Common)': 'empty',
  'Area (Stacked)': 'area',
  'Vertical stacked columns': 'column',
});

const asInstance = (layer: LayerHandle | null | undefined) =>
  layer?.type === 'INSTANCE' ? layer : undefined;
const textOf = (layer: LayerHandle | null | undefined) =>
  layer?.type === 'TEXT' ? layer.textContent : undefined;

// Title / Filtered / Actions live on the private nested _chart-header instance.
const header = asInstance(instance.findInstance('_chart-header', { traverseInstances: true }));
const title = header?.getString('Title') ?? 'Title';
// A filtered card pins its actions open (see the WithAlwaysVisibleActions story).
const filtered = header?.getBoolean('Filtered') ?? false;
const actions = (header?.getSlot('Actions')?.connectedInstances ?? []).map(
  i => figma.code`
      ${i.executeTemplate().example}`,
);

const actionsBlock = actions.length
  ? figma.code`
    <ChartActions${figma.helpers.react.renderProp('alwaysVisible', filtered)}>${actions}
    </ChartActions>`
  : '';

// Headline from a private _metric-item-common: value text, connected `delta`, optional caption.
const metricImports = new Set<string>();
const metricHeader = (metric: InstanceHandle | undefined, indent: string) => {
  metricImports.add('MetricHeader').add('MetricValue');
  const value = textOf(metric?.findText('XX', { traverseInstances: true })) ?? '91';
  const deltaLayer = metric?.getBoolean('Delta')
    ? asInstance(metric.findInstance('delta', { traverseInstances: true }))
    : undefined;
  // MetricDelta comes with the nested `delta` template's own import.
  const delta = deltaLayer
    ? figma.code`
${indent}  ${deltaLayer.executeTemplate().example}`
    : '';
  const caption = metric?.getBoolean('Subline')
    ? textOf(metric.findText('Text', { traverseInstances: true }))
    : undefined;
  if (caption) metricImports.add('MetricCaption');
  return figma.code`<MetricHeader>
${indent}  <MetricValue>${value}</MetricValue>${delta}
${indent}</MetricHeader>${caption ? `\n${indent}<MetricCaption>${caption}</MetricCaption>` : ''}`;
};

// Line/Area/Column: the "Slot" toggle shows the private _line-chart-slot (metric headline + line-legend).
const lineSlot =
  (type === 'line' || type === 'area' || type === 'column') && instance.getBoolean('Slot')
    ? asInstance(instance.findInstance('_line-chart-slot', { traverseInstances: true }))
    : undefined;
const slotMetric = lineSlot?.getBoolean('Metric')
  ? asInstance(lineSlot.findInstance('Metric', { traverseInstances: true }))
  : undefined;
const slotLegend = lineSlot?.getBoolean('Legend')
  ? asInstance(lineSlot.findInstance('line-legend', { traverseInstances: true }))
  : undefined;
// Series keys follow the connected LineChartLegend template's slug so legend rows match lines.
const legendLabels = (
  slotLegend?.findLayers(n => n.type === 'TEXT' && n.name === 'Attribute', {
    traverseInstances: true,
  }) ?? []
)
  .map(textOf)
  .filter((l): l is string => !!l);
const series = (legendLabels.length ? legendLabels : ['Requests']).map(label => ({
  key: label.toLowerCase().replace(/\s+/g, '-'),
  label,
}));
const seriesProp = `[${series.map(s => `{ key: '${s.key}', label: '${s.label}' }`).join(', ')}]`;
const lineData = `[${[1700000000000, 1700003600000, 1700007200000]
  .map(
    (t, n) =>
      `{ timestamp: ${t}, ${series.map((s, i) => `'${s.key}': ${(n + 1) * 40 + i * 25}`).join(', ')} }`,
  )
  .join(', ')}]`;

const slotParts = [
  slotMetric ? metricHeader(slotMetric, '      ') : undefined,
  slotLegend?.executeTemplate().example,
].filter(Boolean);
const slotBlock = slotParts.length
  ? figma.code`
    <div className='flex items-center justify-between pr-8'>${slotParts.map(
      p => figma.code`
      ${p}`,
    )}
    </div>`
  : '';

const bars = (Component: string) =>
  series.map(
    s => figma.code`
      <${Component} seriesKey='${s.key}' />`,
  );

const emptyText = textOf(
  asInstance(instance.findInstance('empty-state', { traverseInstances: true }))?.findText('Title'),
);

const pieRows: [string, number][] = [
  ['2XX', 900],
  ['3XX', 150],
  ['4XX', 100],
  ['5XX', 50],
];
const pieData = `[${pieRows.map(([name, value]) => `{ name: '${name}', value: ${value} }`).join(', ')}]`;
const pieLegendItems = pieRows.map(
  ([name, value]) => figma.code`
      <PieChartLegendItem name='${name}'>
        ${name}
        <PieChartLegendValue>
          ${String(value)}
          <LegendDot />
          <PieChartLegendPercent />
        </PieChartLegendValue>
      </PieChartLegendItem>`,
);

const sparklineData = `[${[14, 11, 11, 16, 18, 13]
  .map((value, n) => `{ x: new Date(2026, 0, ${n + 1}), value: ${value} }`)
  .join(', ')}]`;

const hbarMetric = asInstance(
  instance.findInstance('_metric-item-common', { traverseInstances: true }),
);

const body =
  type === 'bar-list'
    ? figma.code`<BarList max={1200}>
    <BarListItem value={900}>
      <BarListBar />
      <BarListLabel>Blocked</BarListLabel>
      <BarListValue>
        900
        <BarListPercent />
      </BarListValue>
    </BarListItem>
    <BarListItem value={300}>
      <BarListBar />
      <BarListLabel>Monitored</BarListLabel>
      <BarListValue>
        300
        <BarListPercent />
      </BarListValue>
    </BarListItem>
  </BarList>`
    : type === 'pie'
      ? figma.code`<PieChart data={${pieData}}>
    <PieChartDonut>
      <PieChartCenter>
        <PieChartCenterValue>1200</PieChartCenterValue>
        <PieChartCenterLabel>requests</PieChartCenterLabel>
      </PieChartCenter>
    </PieChartDonut>
    <PieChartLegend>${pieLegendItems}
    </PieChartLegend>
  </PieChart>`
      : type === 'line'
        ? figma.code`<LineChart data={${lineData}} series={${seriesProp}} xKey='timestamp'>${slotBlock}
    <LineChartBody>
      <LineChartGrid />
      <LineChartXAxis />
      <LineChartYAxis />${bars('LineChartLine')}
      <LineChartTooltip />
    </LineChartBody>
  </LineChart>`
        : type === 'area'
          ? figma.code`<AreaChart data={${lineData}} series={${seriesProp}} xKey='timestamp'>${slotBlock}
    <AreaChartBody>
      <LineChartGrid />
      <LineChartXAxis />
      <LineChartYAxis />${bars('AreaChartArea')}
      <LineChartTooltip />
    </AreaChartBody>
  </AreaChart>`
          : type === 'column'
            ? figma.code`<ColumnChart data={${lineData}} series={${seriesProp}} xKey='timestamp'>${slotBlock}
    <ColumnChartBody>
      <LineChartGrid />
      <ColumnChartXAxis />
      <LineChartYAxis />
      <ColumnChartStack />
      <LineChartTooltip />
    </ColumnChartBody>
  </ColumnChart>`
            : type === 'metric'
              ? figma.code`<Metric>
    ${metricHeader(hbarMetric, '    ')}
  </Metric>`
              : type === 'metric-sparkline'
                ? figma.code`<Metric>
    ${metricHeader(hbarMetric, '    ')}
  </Metric>
  <MetricSparkline data={${sparklineData}} label='Attribute' />`
                : type === 'horizontal-bar-stack'
                  ? figma.code`<HorizontalBarStack data={${pieData}}>
    ${metricHeader(hbarMetric, '    ')}
  </HorizontalBarStack>`
                  : emptyText && emptyText !== 'No data'
                    ? figma.code`<ChartEmpty>${emptyText}</ChartEmpty>`
                    : figma.code`<ChartEmpty />`;

const bodyImports: Record<string, string[]> = {
  'bar-list': [
    'BarList',
    'BarListBar',
    'BarListItem',
    'BarListLabel',
    'BarListPercent',
    'BarListValue',
  ],
  pie: [
    'LegendDot',
    'PieChart',
    'PieChartCenter',
    'PieChartCenterLabel',
    'PieChartCenterValue',
    'PieChartDonut',
    'PieChartLegend',
    'PieChartLegendItem',
    'PieChartLegendPercent',
    'PieChartLegendValue',
  ],
  line: [
    'LineChart',
    'LineChartBody',
    'LineChartGrid',
    'LineChartLine',
    'LineChartTooltip',
    'LineChartXAxis',
    'LineChartYAxis',
  ],
  area: [
    'AreaChart',
    'AreaChartArea',
    'AreaChartBody',
    'LineChartGrid',
    'LineChartTooltip',
    'LineChartXAxis',
    'LineChartYAxis',
  ],
  column: [
    'ColumnChart',
    'ColumnChartBody',
    'ColumnChartStack',
    'ColumnChartXAxis',
    'LineChartGrid',
    'LineChartTooltip',
    'LineChartYAxis',
  ],
  metric: ['Metric'],
  'metric-sparkline': ['Metric', 'MetricSparkline'],
  'horizontal-bar-stack': ['HorizontalBarStack'],
  empty: ['ChartEmpty'],
};

const names = [
  'Chart',
  'ChartHeader',
  'ChartTitle',
  ...(actions.length ? ['ChartActions'] : []),
  ...(bodyImports[type ?? 'empty'] ?? []),
  ...metricImports,
].sort();

export default {
  id: 'chart',
  example: figma.code`<Chart>
  <ChartHeader>
    <ChartTitle>${title}</ChartTitle>${actionsBlock}
  </ChartHeader>
  ${body}
</Chart>`,
  // Nested connected templates (Button, MetricDelta, LineChartLegend) carry their own imports.
  imports: [
    `import { ${[...new Set(names)].join(', ')} } from '@wallarm-org/design-system/SimpleCharts';`,
  ],
  metadata: { nestable: true },
};
