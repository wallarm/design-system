import { type FC, useEffect, useRef, useState } from 'react';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Button } from '@wallarm-org/design-system/Button';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { HStack, VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';
import { ToggleButton } from '@wallarm-org/design-system/ToggleButton';
import { cn } from '@wallarm-org/design-system/utils/cn';
import { A2uiSurfaces } from '../a2ui/A2uiSurfaces';
import { createA2uiCatalog } from '../a2ui/catalog';
import { wallarmComponents } from '../components';
import type { GenUiActionHandler } from '../core/define';
import type { ReplayScenario } from '../fixtures/scenarios';
import type { StreamLine } from '../fixtures/stream';
import { createJsonRenderCatalog } from '../json-render/catalog';
import { JsonRenderSurface } from '../json-render/JsonRenderSurface';
import { specFromLines } from '../json-render/spec';

type Format = 'a2ui' | 'json-render';

/** The agent writes slowly, the app's API answers fast. */
const DELAY = { agent: 650, app: 220 };

const A2UI_CATALOG = createA2uiCatalog(wallarmComponents);

export interface GenUiPlaygroundProps {
  /** The prompts to pick from, in order; the first one plays on mount. */
  scenarios: readonly ReplayScenario[];
  /** Sizes the playground; it fills its box (give the host a height). */
  className?: string;
  /** Show the stream panel at first; a narrow host starts with it closed. Default true. */
  defaultStreamOpen?: boolean;
}

/**
 * Replays recorded agent answers: pick a prompt, watch the agent stream the layout and the app
 * fill its data, in either format, with the stream itself beside the page.
 */
export const GenUiPlayground: FC<GenUiPlaygroundProps> = ({
  scenarios,
  className,
  defaultStreamOpen = true,
}) => {
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id);
  const [format, setFormat] = useState<Format>('a2ui');
  const [streamOpen, setStreamOpen] = useState(defaultStreamOpen);
  const [log, setLog] = useState<readonly { seq: number; text: string }[]>([]);
  const scenario = scenarios.find(s => s.id === scenarioId) ?? scenarios[0];
  const stream: readonly StreamLine<unknown>[] =
    format === 'a2ui' ? (scenario?.a2ui ?? []) : (scenario?.jsonRender ?? []);
  const replay = useReplay(stream);
  // Once the answer is complete, the app keeps sending live data (if the scenario has any).
  const live = scenario?.liveStreams;
  const ticks = useLiveTicks(
    replay.done ? live?.every : undefined,
    `${scenario?.id}-${format}-${replay.run}`,
  );
  const liveRange = Array.from({ length: ticks }, (_, i) => i + 1);
  const liveA2ui = live ? liveRange.flatMap(tick => live.lines(tick).a2ui) : [];
  const liveJsonRender = live ? liveRange.flatMap(tick => live.lines(tick).jsonRender) : [];
  const shown: readonly StreamLine<unknown>[] = [
    ...stream.slice(0, replay.count),
    ...(format === 'a2ui' ? liveA2ui : liveJsonRender),
  ];
  const [jsonCatalogs] = useState(
    () =>
      new Map(scenarios.map(s => [s.id, createJsonRenderCatalog(wallarmComponents, s.actions)])),
  );

  const handleAction: GenUiActionHandler = (name, params) => {
    setLog(entries => [
      { seq: entries.length, text: `${name} ${JSON.stringify(params)}` },
      ...entries,
    ]);
  };
  const pick = (id: string) => {
    setScenarioId(id);
    replay.restart();
  };
  const handleFormatChange = (value: string) => {
    if (value !== 'a2ui' && value !== 'json-render') return;
    setFormat(value);
    replay.restart();
  };

  const jsonCatalog = scenario && jsonCatalogs.get(scenario.id);

  return (
    <div className={cn('flex min-h-0 flex-col bg-bg-surface-1', className)}>
      <VStack gap={12} align='stretch' className='border-b border-border-primary-light p-16'>
        <HStack justify='between' align='center' gap={12}>
          <Text weight='medium'>Ask the agent</Text>
          <HStack gap={8} align='center'>
            <SegmentedControl value={format} onChange={handleFormatChange}>
              <SegmentedControlItem value='a2ui'>A2UI v1.0</SegmentedControlItem>
              <SegmentedControlItem value='json-render'>json-render</SegmentedControlItem>
            </SegmentedControl>
            <ToggleButton
              size='medium'
              active={streamOpen}
              aria-pressed={streamOpen}
              onToggle={setStreamOpen}
            >
              Stream
            </ToggleButton>
            <Button variant='outline' color='neutral' size='medium' onClick={replay.restart}>
              Replay
            </Button>
          </HStack>
        </HStack>
        <div role='group' aria-label='Prompts' className='flex flex-wrap gap-8'>
          {scenarios.map(s => (
            <ToggleButton
              key={s.id}
              size='medium'
              active={s.id === scenario?.id}
              // The DS ToggleButton shows its state only visually; say it to assistive tech too.
              aria-pressed={s.id === scenario?.id}
              onToggle={() => pick(s.id)}
              title={s.summary}
            >
              {s.prompt}
            </ToggleButton>
          ))}
        </div>
      </VStack>

      <div className='flex min-h-0 flex-1'>
        {/* A section, not <main>: the host page already has its main landmark. */}
        <section aria-label='Answer' className='min-w-0 flex-1 overflow-auto bg-bg-page-bg p-24'>
          {scenario &&
            (format === 'a2ui' ? (
              <A2uiSurfaces
                key={`${scenario.id}-${replay.run}`}
                catalog={A2UI_CATALOG}
                messages={[...scenario.a2ui.slice(0, replay.count), ...liveA2ui].map(
                  entry => entry.line,
                )}
                actions={scenario.actions}
                onAction={handleAction}
              />
            ) : (
              jsonCatalog && (
                <JsonRenderSurface
                  key={`${scenario.id}-${replay.run}`}
                  catalog={jsonCatalog}
                  spec={specFromLines(
                    [...scenario.jsonRender.slice(0, replay.count), ...liveJsonRender].map(
                      entry => entry.line,
                    ),
                  )}
                  streaming={!replay.done}
                  onAction={handleAction}
                />
              )
            ))}
        </section>

        {streamOpen && (
          <aside
            aria-label='Stream'
            className='flex w-360 shrink-0 flex-col border-l border-border-primary-light'
          >
            <HStack justify='between' align='center' className='px-16 py-12'>
              <HStack gap={8} align='center'>
                <Text weight='medium'>Stream</Text>
                {ticks > 0 && (
                  <Badge type='secondary' color='green' size='small'>
                    Live · app data every {Math.round((live?.every ?? 0) / 1000)} s
                  </Badge>
                )}
              </HStack>
              <Text size='sm' color='secondary'>
                {ticks > 0 ? `${shown.length} lines` : `${replay.count} of ${stream.length} lines`}
              </Text>
            </HStack>
            <ol className='m-0 flex min-h-0 flex-1 list-none flex-col gap-6 overflow-y-auto overflow-x-hidden px-16 pb-16'>
              {shown.map((entry, i) => (
                // The stream only grows, so a line's index is its identity.
                // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
                <li key={`${replay.run}-${i}`} className='min-w-0'>
                  <details className='rounded-8 bg-bg-surface-2'>
                    <summary className='flex min-w-0 cursor-pointer list-none items-center gap-8 p-8'>
                      <Badge
                        type='secondary'
                        color={entry.origin === 'agent' ? 'violet' : 'green'}
                        size='small'
                      >
                        {entry.origin === 'agent' ? 'agent · layout' : 'app · data'}
                      </Badge>
                      <span className='min-w-0 truncate font-mono text-xs text-text-primary'>
                        {describeLine(entry.line)}
                      </span>
                    </summary>
                    <pre className='m-0 max-h-320 overflow-y-auto whitespace-pre-wrap break-all border-t border-border-primary-light p-8 font-mono text-xs text-text-primary'>
                      {JSON.stringify(entry.line, null, 2)}
                    </pre>
                  </details>
                </li>
              ))}
            </ol>
            <VStack
              gap={4}
              align='stretch'
              className='border-t border-border-primary-light px-16 py-12'
            >
              <Text weight='medium'>Actions sent to the agent</Text>
              {log.length === 0 ? (
                <Text size='sm' color='secondary'>
                  Press a button in the answer.
                </Text>
              ) : (
                log.slice(0, 4).map(entry => (
                  <pre
                    key={entry.seq}
                    className='m-0 whitespace-pre-wrap break-all font-mono text-xs text-text-primary'
                  >
                    {entry.text}
                  </pre>
                ))
              )}
            </VStack>
          </aside>
        )}
      </div>
    </div>
  );
};

/** Live updates stop here, so a page left open doesn't grow its stream forever. */
const MAX_LIVE_TICKS = 100;

/**
 * Counts live updates, one every `every` ms while it is set; a new `key` (another prompt, format
 * or replay) starts over from 0.
 */
function useLiveTicks(every: number | undefined, key: string) {
  const [state, setState] = useState({ key, ticks: 0 });
  const ticks = state.key === key ? state.ticks : 0;
  useEffect(() => {
    if (!every || ticks >= MAX_LIVE_TICKS) return;
    const timer = setTimeout(() => setState({ key, ticks: ticks + 1 }), every);
    return () => clearTimeout(timer);
  }, [every, key, ticks]);
  return ticks;
}

/** Replays a stream line by line from mount; `restart` starts over and remounts the surface. */
function useReplay(lines: readonly StreamLine<unknown>[]) {
  const [state, setState] = useState({ run: 0, count: 0 });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (state.count >= lines.length) return;
    const next = lines[state.count];
    timer.current = setTimeout(
      () => setState(s => ({ ...s, count: s.count + 1 })),
      next ? DELAY[next.origin] : 0,
    );
    return () => clearTimeout(timer.current);
  }, [state, lines]);

  const restart = () => setState(s => ({ run: s.run + 1, count: 0 }));
  return { ...state, restart, done: state.count >= lines.length };
}

/**
 * One line of the stream in a few words: what the message does and to what. A2UI messages name
 * their type and the components or path; json-render patches are an op and a path.
 */
const describeLine = (line: unknown): string => {
  if (typeof line !== 'object' || line === null) return String(line);
  if ('op' in line && 'path' in line) return `${String(line.op)} ${String(line.path)}`;
  const [type, body] = Object.entries(line).find(([key]) => key !== 'version') ?? ['?', {}];
  if (typeof body !== 'object' || body === null) return type;
  if ('components' in body && Array.isArray(body.components)) {
    const ids = body.components.map((c: unknown) =>
      typeof c === 'object' && c !== null && 'id' in c ? String(c.id) : '?',
    );
    return `${type} · ${ids.join(', ')}`;
  }
  if ('path' in body) return `${type} · ${String(body.path)}`;
  return 'surfaceId' in body ? `${type} · ${String(body.surfaceId)}` : type;
};
