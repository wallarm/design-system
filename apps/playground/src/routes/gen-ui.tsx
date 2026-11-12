import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { type GenUiActionHandler, wallarmComponents } from '@wallarm-org/gen-ui';
import { Heading } from '@wallarm-org/design-system/Heading';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@wallarm-org/design-system/SegmentedControl';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';
import {
  type ChatPart,
  type ChatPartRenderContext,
  WallyAssistant,
} from '@wallarm-org/design-system/WallyAssistant';
import { type A2uiMessage, A2uiSurfaces, createA2uiCatalog } from '@wallarm-org/gen-ui/a2ui';
import { ATTACK_SUMMARY_ACTIONS } from '@wallarm-org/gen-ui/fixtures';
import {
  createJsonRenderCatalog,
  JsonRenderSurface,
  type SpecStreamLine,
  specFromLines,
} from '@wallarm-org/gen-ui/json-render';
import {
  GEN_UI_KIND,
  type GenUiFormat,
  type GenUiPart,
  useEmulatedAgent,
} from '../gen-ui/useEmulatedAgent';

export const Route = createFileRoute('/gen-ui')({
  component: GenUiPage,
});

// One definition per component, two catalogs derived from it.
const A2UI_CATALOG = createA2uiCatalog(wallarmComponents);
const JSON_RENDER_CATALOG = createJsonRenderCatalog(wallarmComponents, ATTACK_SUMMARY_ACTIONS);

const SUGGESTIONS = [{ id: 'summary', label: 'Show attacks for the last 24 hours' }];

interface LoggedAction {
  format: GenUiFormat;
  name: string;
  params: Record<string, unknown>;
}

const GenUiSurface = ({
  part,
  streaming,
  onAction,
}: {
  part: GenUiPart;
  streaming: boolean;
  onAction: GenUiActionHandler;
}) =>
  part.data.format === 'a2ui' ? (
    <A2uiSurfaces
      catalog={A2UI_CATALOG}
      messages={part.data.lines as readonly A2uiMessage[]}
      actions={ATTACK_SUMMARY_ACTIONS}
      onAction={onAction}
    />
  ) : (
    <JsonRenderSurface
      catalog={JSON_RENDER_CATALOG}
      spec={specFromLines(part.data.lines as readonly SpecStreamLine[])}
      streaming={streaming}
      onAction={onAction}
    />
  );

function GenUiPage() {
  const [format, setFormat] = useState<GenUiFormat>('a2ui');
  const [log, setLog] = useState<readonly LoggedAction[]>([]);
  const agent = useEmulatedAgent(format);

  const handleAction =
    (partFormat: GenUiFormat): GenUiActionHandler =>
    (name, params) => {
      setLog(entries => [{ format: partFormat, name, params }, ...entries]);
      agent.act(name, params);
    };

  // A render function: no hooks here, they live in the surface components.
  const renderPart = (part: ChatPart, ctx: ChatPartRenderContext) =>
    part.type === 'custom' && part.kind === GEN_UI_KIND ? (
      <GenUiSurface
        part={part as GenUiPart}
        streaming={ctx.streaming}
        onAction={handleAction((part as GenUiPart).data.format)}
      />
    ) : undefined;

  const handleFormatChange = (value: string) => setFormat(value as GenUiFormat);

  return (
    <div className='flex gap-24 w-screen h-screen p-24'>
      <div className='h-full w-640 shrink-0'>
        <WallyAssistant
          data-testid='gen-ui-chat'
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

      <VStack gap={16} align='start' className='min-w-0 flex-1'>
        <Heading color='primary'>Generative UI prototype</Heading>
        <Text color='secondary'>
          The agent is emulated: every answer replays a fixture line by line. The same gen-ui
          catalog renders it from A2UI v1.0 messages or from json-render patches; pick the format
          for the next answer.
        </Text>
        <SegmentedControl value={format} onChange={handleFormatChange}>
          <SegmentedControlItem value='a2ui'>A2UI v1.0</SegmentedControlItem>
          <SegmentedControlItem value='json-render'>json-render</SegmentedControlItem>
        </SegmentedControl>

        <Heading size='md' color='primary'>
          Actions sent to the agent
        </Heading>
        {log.length === 0 ? (
          <Text color='secondary'>Press a button in an answer.</Text>
        ) : (
          <pre className='w-full overflow-auto rounded-8 bg-bg-surface-2 p-12 text-xs text-text-primary'>
            {log.map(entry => JSON.stringify(entry)).join('\n')}
          </pre>
        )}
      </VStack>
    </div>
  );
}
