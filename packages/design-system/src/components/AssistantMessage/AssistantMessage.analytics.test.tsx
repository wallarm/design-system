import { createRef } from 'react';

import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import { MessageAction, MessageActions } from '../MessageActions';
import { AssistantMessage } from './AssistantMessage';
import { AssistantMessageContent } from './AssistantMessageContent';
import { AssistantMessageError } from './AssistantMessageError';
import { AssistantMessageLoader } from './AssistantMessageLoader';
import {
  AssistantMessageMarkdown,
  type AssistantMessageMarkdownComponents,
} from './AssistantMessageMarkdown';
import { AssistantMessageMarkdownInlineCode } from './AssistantMessageMarkdownInlineCode';
import { AssistantMessageMarkdownLink } from './AssistantMessageMarkdownLink';

const PROPS = '{"message":"m-1"}';

describe('AssistantMessage — analytics pass-through (docs/metrics/contract.md)', () => {
  it('forwards attributes and refs on the root and the content', () => {
    const root = createRef<HTMLElement>();
    const content = createRef<HTMLDivElement>();
    render(
      <AssistantMessage
        ref={root}
        data-testid='msg'
        data-analytics-id='WALLY_ANSWER'
        data-analytics-props={PROPS}
      >
        <AssistantMessageContent ref={content} data-analytics-id='WALLY_ANSWER_CONTENT'>
          Hi
        </AssistantMessageContent>
      </AssistantMessage>,
    );
    expect(root.current).toBe(screen.getByTestId('msg'));
    expect(content.current).toBe(screen.getByTestId('msg--content'));
    expect(screen.getByTestId('msg')).toHaveAttribute('data-analytics-id', 'WALLY_ANSWER');
    expect(screen.getByTestId('msg').getAttribute('data-analytics-props')).toBe(PROPS);
    expect(screen.getByTestId('msg--content')).toHaveAttribute(
      'data-analytics-id',
      'WALLY_ANSWER_CONTENT',
    );
  });

  it('resolves a click on a composed action to the action, not the message', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <AssistantMessage data-testid='msg' data-analytics-id='WALLY_ANSWER'>
        <MessageActions>
          <MessageAction aria-label='Copy' data-analytics-id='WALLY_ANSWER_COPY'>
            C
          </MessageAction>
        </MessageActions>
      </AssistantMessage>,
    );
    await userEvent.click(screen.getByTestId('msg--actions--action'));
    expect(captured).toHaveBeenCalledWith('WALLY_ANSWER_COPY');
  });

  it('forwards attributes and refs on the loader and the error', () => {
    const loader = createRef<HTMLDivElement>();
    const error = createRef<HTMLDivElement>();
    render(
      <AssistantMessage data-testid='msg'>
        <AssistantMessageLoader ref={loader} data-analytics-id='WALLY_LOADER' />
        <AssistantMessageError
          ref={error}
          data-analytics-id='WALLY_ERROR'
          data-analytics-props={PROPS}
        >
          Failed
        </AssistantMessageError>
      </AssistantMessage>,
    );
    expect(loader.current).toBe(screen.getByTestId('msg--loader'));
    expect(error.current).toBe(screen.getByTestId('msg--error'));
    expect(loader.current).toHaveAttribute('data-analytics-id', 'WALLY_LOADER');
    expect(error.current).toHaveAttribute('data-analytics-id', 'WALLY_ERROR');
    expect(error.current?.getAttribute('data-analytics-props')).toBe(PROPS);
  });

  it('resolves a click on the Retry action to the action, not the error', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <AssistantMessageError
        data-analytics-id='WALLY_ERROR'
        action={
          <Button data-testid='retry' data-analytics-id='WALLY_RETRY'>
            Retry
          </Button>
        }
      >
        Failed
      </AssistantMessageError>,
    );
    await userEvent.click(screen.getByTestId('retry'));
    expect(captured).toHaveBeenCalledWith('WALLY_RETRY');
  });
});

const TRACKED: Partial<AssistantMessageMarkdownComponents> = {
  a: props => (
    <AssistantMessageMarkdownLink
      {...props}
      data-analytics-id='WALLY_ANSWER_LINK'
      data-analytics-props={PROPS}
    />
  ),
  inlineCode: props => (
    <AssistantMessageMarkdownInlineCode
      {...props}
      data-analytics-id='WALLY_ANSWER_CODE'
      data-analytics-props={PROPS}
    />
  ),
};

describe('AssistantMessageMarkdown — analytics through the components map', () => {
  it('lands attributes on the real <a> and <code> nodes', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <AssistantMessage data-testid='m'>
        <AssistantMessageMarkdown
          text='See [docs](https://a.example) and `x`'
          components={TRACKED}
        />
      </AssistantMessage>,
    );
    const link = screen.getByTestId('m--link');
    const code = screen.getByTestId('m--inline-code');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('data-analytics-id', 'WALLY_ANSWER_LINK');
    expect(link.getAttribute('data-analytics-props')).toBe(PROPS);
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveAttribute('data-analytics-id', 'WALLY_ANSWER_CODE');
    expect(code.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(code);
    expect(captured).toHaveBeenCalledWith('WALLY_ANSWER_CODE');
  });
});
