import type { FC } from 'react';
import { type ActionEvent, type OpenUIError, Renderer } from '@openuidev/react-lang';
import type { GenUiActionHandler } from '../core/define';
import { isRecord } from '../core/guards';
import { SurfaceBoundary } from '../render/SurfaceBoundary';
import { warn } from '../render/warn';
import type { OpenUiLibrary } from './catalog';

export interface OpenUiSurfaceProps {
  library: OpenUiLibrary;
  /** The OpenUI Lang program so far; it grows while the model streams. */
  program: string;
  /**
   * The app's data. Each top-level key is a `$variable` the program reads (`kpi` → `$kpi.attacks`);
   * pass a new object when it changes and the page follows, with no call to the agent.
   */
  data?: Record<string, unknown>;
  streaming?: boolean;
  onAction: GenUiActionHandler;
  /** What OpenUI couldn't parse or render, once the stream is done. Default: console.warn. */
  onError?: (errors: readonly OpenUIError[]) => void;
}

/**
 * Renders one OpenUI Lang program through the catalog. Only the app's actions reach `onAction`:
 * OpenUI's own steps that leave the page (`@ToAssistant`, `@OpenUrl`) are dropped with a warning,
 * and with no tool provider `Query` and `Mutation` reach nothing.
 */
export const OpenUiSurface: FC<OpenUiSurfaceProps> = ({
  library,
  program,
  data = {},
  streaming = false,
  onAction,
  onError = warnErrors,
}) => {
  const handleAction = ({ type, params }: ActionEvent) => {
    if (!library.actions.some(a => a.name === type)) {
      warn(`action "${type}" is not in the allowlist, dropped`);
      return;
    }
    onAction(type, isRecord(params.context) ? params.context : {});
  };
  // Mid-stream every statement is partial; report only what the finished program still has.
  const handleErrors = (errors: OpenUIError[]) => {
    if (!streaming && errors.length) onError(errors);
  };
  return (
    <SurfaceBoundary>
      <Renderer
        response={program}
        library={library.library}
        isStreaming={streaming}
        initialState={Object.fromEntries(Object.entries(data).map(([k, v]) => [`$${k}`, v]))}
        onAction={handleAction}
        onError={handleErrors}
        publishObservability={false}
      />
    </SurfaceBoundary>
  );
};

const warnErrors = (errors: readonly OpenUIError[]) => warn('OpenUI rejected the answer', errors);
