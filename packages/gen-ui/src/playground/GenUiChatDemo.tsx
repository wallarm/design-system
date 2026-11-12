import { type FC, useState } from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';
import { cn } from '@wallarm-org/design-system/utils/cn';
import {
  type ChatPart,
  type ChatPartRenderContext,
  WallyAssistant,
} from '@wallarm-org/design-system/WallyAssistant';
import { A2uiSurfaces } from '../a2ui/A2uiSurfaces';
import { createA2uiCatalog } from '../a2ui/catalog';
import { ExpressSurfaces } from '../a2ui/express';
import { wallarmComponents } from '../components';
import type { GenUiActionHandler } from '../core/define';
import { ATTACK_SUMMARY_ACTIONS } from '../fixtures/attackSummary';
import { createJsonRenderCatalog } from '../json-render/catalog';
import { JsonRenderSurface } from '../json-render/JsonRenderSurface';
import { specFromLines } from '../json-render/spec';
import { createOpenUiLibrary } from '../openui/catalog';
import { OpenUiSurface } from '../openui/OpenUiSurface';
import {
  type GenUiFormat,
  type GenUiPart,
  isGenUiFormat,
  isGenUiPart,
  useEmulatedAgent,
} from './useEmulatedAgent';

// One definition per component, a catalog per format derived from it.
const A2UI_CATALOG = createA2uiCatalog(wallarmComponents);
const JSON_RENDER_CATALOG = createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS);
const OPENUI_LIBRARY = createOpenUiLibrary(wallarmComponents, ATTACK_SUMMARY_ACTIONS);

const SUGGESTIONS = [{ id: 'summary', label: 'Show attacks for the last 24 hours' }];

/** One gen-ui part of an answer, rendered in its own format. */
const GenUiSurface: FC<{ part: GenUiPart; streaming: boolean; onAction: GenUiActionHandler }> = ({
  part,
  streaming,
  onAction,
}) => {
  const { data } = part;
  switch (data.format) {
    case 'a2ui':
      return (
        <A2uiSurfaces
          catalog={A2UI_CATALOG}
          messages={data.lines}
          actions={ATTACK_SUMMARY_ACTIONS}
          onAction={onAction}
        />
      );
    case 'express':
      return (
        <ExpressSurfaces
          catalog={A2UI_CATALOG}
          surfaceId={data.surfaceId}
          chunks={data.lines}
          actions={ATTACK_SUMMARY_ACTIONS}
          onAction={onAction}
        />
      );
    case 'json-render':
      return (
        <JsonRenderSurface
          catalog={JSON_RENDER_CATALOG}
          spec={specFromLines(data.lines)}
          streaming={streaming}
          onAction={onAction}
        />
      );
    default:
      return (
        <OpenUiSurface
          library={OPENUI_LIBRARY}
          program={data.lines.join('\n')}
          streaming={streaming}
          onAction={onAction}
        />
      );
  }
};

export interface GenUiChatDemoProps {
  /** Sizes the demo; it fills its box (give the host a height). */
  className?: string;
}

/**
 * Generative UI inside the Wally chat: an emulated agent answers with a surface (in the format
 * picked for the next answer) through WallyAssistant's `renderPart`. Its Block button asks for
 * approval before the agent acts.
 */
export const GenUiChatDemo: FC<GenUiChatDemoProps> = ({ className }) => {
  const [format, setFormat] = useState<GenUiFormat>('a2ui');
  const [log, setLog] = useState<readonly { seq: number; text: string }[]>([]);
  const agent = useEmulatedAgent(format);

  const handleAction: GenUiActionHandler = (name, params) => {
    setLog(entries => [
      { seq: entries.length, text: `${name} ${JSON.stringify(params)}` },
      ...entries,
    ]);
    agent.act(name, params);
  };

  // A render function: no hooks here, they live in the surface components.
  const renderPart = (part: ChatPart, ctx: ChatPartRenderContext) =>
    isGenUiPart(part) ? (
      <GenUiSurface part={part} streaming={ctx.streaming} onAction={handleAction} />
    ) : undefined;

  const handleFormatChange = (value: string) => {
    if (isGenUiFormat(value)) setFormat(value);
  };

  return (
    <div className={cn('flex min-h-0 gap-24 bg-bg-surface-1 p-16', className)}>
      <div className='h-full min-w-0 flex-1'>
        <WallyAssistant
          messages={agent.messages}
          status={agent.status}
          suggestions={agent.messages.length ? undefined : SUGGESTIONS}
          onSubmit={agent.send}
          onStop={agent.stop}
          onApprovalRespond={agent.respond}
          approvalPlacement='inline'
          renderPart={renderPart}
        />
      </div>

      <VStack gap={12} align='stretch' className='w-320 shrink-0'>
        <Text weight='medium'>Format of the next answer</Text>
        <SegmentedControl value={format} onChange={handleFormatChange}>
          <SegmentedControlItem value='a2ui'>A2UI</SegmentedControlItem>
          <SegmentedControlItem value='express'>Express</SegmentedControlItem>
          <SegmentedControlItem value='json-render'>json-render</SegmentedControlItem>
          <SegmentedControlItem value='openui'>OpenUI</SegmentedControlItem>
        </SegmentedControl>
        <Text weight='medium'>Actions sent to the agent</Text>
        {log.length === 0 ? (
          <Text size='sm' color='secondary'>
            Ask for the attacks, then press a button in the answer.
          </Text>
        ) : (
          log.slice(0, 6).map(entry => (
            <pre
              key={entry.seq}
              className='m-0 whitespace-pre-wrap break-all font-mono text-xs text-text-primary'
            >
              {entry.text}
            </pre>
          ))
        )}
      </VStack>
    </div>
  );
};
