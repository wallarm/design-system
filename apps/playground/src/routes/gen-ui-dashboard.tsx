import { useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { type GenUiActionHandler, wallarmComponents } from '@wallarm-org/gen-ui';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Button } from '@wallarm-org/design-system/Button';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Input } from '@wallarm-org/design-system/Input';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { HStack, VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';
import { A2uiSurfaces, createA2uiCatalog } from '@wallarm-org/gen-ui/a2ui';
import {
  DASHBOARD_A2UI,
  DASHBOARD_ACTIONS,
  DASHBOARD_JSON_RENDER,
  type StreamLine,
} from '@wallarm-org/gen-ui/fixtures';
import {
  createJsonRenderCatalog,
  JsonRenderSurface,
  specFromLines,
} from '@wallarm-org/gen-ui/json-render';

export const Route = createFileRoute('/gen-ui-dashboard')({
  component: DashboardPage,
});

type Format = 'a2ui' | 'json-render';

const A2UI_CATALOG = createA2uiCatalog(wallarmComponents);
const JSON_RENDER_CATALOG = createJsonRenderCatalog(wallarmComponents, DASHBOARD_ACTIONS);
const STREAMS: Record<Format, readonly StreamLine<unknown>[]> = {
  a2ui: DASHBOARD_A2UI,
  'json-render': DASHBOARD_JSON_RENDER,
};
/** The agent writes slowly, the app's API answers fast. */
const DELAY = { agent: 700, app: 250 };
const PROMPT = 'Build a security dashboard for the last 24 hours';

/** Replays a stream line by line; `run` restarts it, and a new run unmounts the old surface. */
function useReplay(lines: readonly StreamLine<unknown>[]) {
  const [state, setState] = useState({ run: 0, count: 0 });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (state.run === 0 || state.count >= lines.length) return;
    const next = lines[state.count];
    timer.current = setTimeout(
      () => setState(s => ({ ...s, count: s.count + 1 })),
      next ? DELAY[next.origin] : 0,
    );
    return () => clearTimeout(timer.current);
  }, [state, lines]);

  const start = () => setState(s => ({ run: s.run + 1, count: 0 }));
  return { ...state, start, done: state.run > 0 && state.count >= lines.length };
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

function DashboardPage() {
  const [format, setFormat] = useState<Format>('a2ui');
  const [log, setLog] = useState<readonly { seq: number; text: string }[]>([]);
  const stream = STREAMS[format];
  const replay = useReplay(stream);
  const arrived = stream.slice(0, replay.count);

  const handleAction: GenUiActionHandler = (name, params) => {
    setLog(entries => [
      { seq: entries.length, text: `${name} ${JSON.stringify(params)}` },
      ...entries,
    ]);
  };
  const handleFormatChange = (value: string) => {
    if (value === 'a2ui' || value === 'json-render') setFormat(value);
  };

  return (
    <div className='flex h-screen w-screen flex-col'>
      <HStack gap={12} align='center' className='border-b border-border-primary-light px-24 py-12'>
        <Heading size='lg' weight='medium'>
          Agent builds a dashboard
        </Heading>
        <Input value={PROMPT} readOnly aria-label='Prompt' className='max-w-480' />
        <Button variant='primary' color='brand' onClick={replay.start}>
          {replay.run ? 'Rebuild' : 'Build'}
        </Button>
        <SegmentedControl value={format} onChange={handleFormatChange}>
          <SegmentedControlItem value='a2ui'>A2UI v1.0</SegmentedControlItem>
          <SegmentedControlItem value='json-render'>json-render</SegmentedControlItem>
        </SegmentedControl>
      </HStack>

      <div className='flex min-h-0 flex-1'>
        <main className='min-w-0 flex-1 overflow-auto bg-bg-page-bg p-24'>
          {replay.run === 0 ? (
            <Text color='secondary'>
              Press Build. The agent streams the layout, with every number bound to a path; the app
              fills those paths from its API. Parts that haven&apos;t arrived hold a skeleton.
            </Text>
          ) : format === 'a2ui' ? (
            <A2uiSurfaces
              key={replay.run}
              catalog={A2UI_CATALOG}
              messages={DASHBOARD_A2UI.slice(0, replay.count).map(l => l.line)}
              actions={DASHBOARD_ACTIONS}
              onAction={handleAction}
            />
          ) : (
            <JsonRenderSurface
              key={replay.run}
              catalog={JSON_RENDER_CATALOG}
              spec={specFromLines(DASHBOARD_JSON_RENDER.slice(0, replay.count).map(l => l.line))}
              streaming={!replay.done}
              onAction={handleAction}
            />
          )}
        </main>

        <aside className='flex w-440 shrink-0 flex-col border-l border-border-primary-light'>
          <HStack justify='between' align='center' className='px-16 py-12'>
            <Text weight='medium'>Stream</Text>
            <Text size='sm' color='secondary'>
              {arrived.length} of {stream.length} lines
            </Text>
          </HStack>
          <ol className='m-0 flex min-h-0 flex-1 list-none flex-col gap-6 overflow-y-auto overflow-x-hidden px-16 pb-16'>
            {arrived.map((entry, i) => (
              // The stream only grows, so a line's index is its identity.
              // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
              <li key={`${replay.run}-${i}`} className='min-w-0'>
                <details className='group rounded-8 bg-bg-surface-2'>
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
                Press a button on the dashboard.
              </Text>
            ) : (
              log.map(entry => (
                <pre
                  key={entry.seq}
                  className='m-0 whitespace-pre-wrap font-mono text-xs text-text-primary'
                >
                  {entry.text}
                </pre>
              ))
            )}
          </VStack>
        </aside>
      </div>
    </div>
  );
}
