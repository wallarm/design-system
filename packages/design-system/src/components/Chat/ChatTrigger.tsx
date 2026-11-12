import { type ButtonHTMLAttributes, type FC, type Ref, useId } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { AgentGlyph } from '../AgentGlyph';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

/**
 * The app-header button that opens Wally (Figma 101:1034): a ghost small icon `Button` with the
 * Wally glyph at 24 px and an "Ask Wally" tooltip. It holds no open state — wire `onClick`/`aria-expanded`
 * yourself, or wrap it in `<DrawerTrigger asChild>`.
 */
export interface ChatTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Tooltip text and accessible name. */
  label?: string;
}

export const ChatTrigger: FC<ChatTriggerProps> = ({
  ref,
  id,
  label = 'Ask Wally',
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('trigger', testIdProp);
  const fallbackId = useId();
  // An outer `DrawerTrigger asChild` hands us its id, which wins on the button: anchor the
  // tooltip by the same id, or it opens in the page corner.
  const triggerId = id ?? fallbackId;

  return (
    <Tooltip ids={{ trigger: triggerId }} data-testid={testId}>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label={label}
          type='button'
          {...rest}
          id={triggerId}
          ref={ref}
          data-slot='chat-trigger'
          data-testid={testId}
        >
          {/* Wally's character, not the brand mark: the wally-button is a character place (WDS-205) */}
          <AgentGlyph
            agent='wally'
            size={24}
            align='box'
            data-testid={testId && `${testId}--icon`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

ChatTrigger.displayName = 'ChatTrigger';
