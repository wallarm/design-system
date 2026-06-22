import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { TabsContent, TabsList } from '../Tabs';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetCopyButton } from './CodeSnippetCopyButton';
import { CodeSnippetFullscreenButton } from './CodeSnippetFullscreenButton';
import { CodeSnippetHeader } from './CodeSnippetHeader';
import { CodeSnippetLineNumbers } from './CodeSnippetLineNumbers';
import { CodeSnippetRoot } from './CodeSnippetRoot';
import { CodeSnippetShowMoreButton } from './CodeSnippetShowMoreButton';
import { CodeSnippetTab } from './CodeSnippetTab';
import { CodeSnippetTabs } from './CodeSnippetTabs';
import { CodeSnippetWrapButton } from './CodeSnippetWrapButton';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the CodeSnippetCopyButton <button>', () => {
    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' data-analytics-id='COPY_CODE' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    const btn = screen.getByTestId('copy-btn');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('data-analytics-id', 'COPY_CODE');
  });

  it('forwards data-analytics-id to CodeSnippetWrapButton and CodeSnippetFullscreenButton', () => {
    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetWrapButton data-testid='wrap-btn' data-analytics-id='TOGGLE_WRAP' />
          <CodeSnippetFullscreenButton data-testid='fs-btn' data-analytics-id='TOGGLE_FULLSCREEN' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    expect(screen.getByTestId('wrap-btn')).toHaveAttribute('data-analytics-id', 'TOGGLE_WRAP');
    expect(screen.getByTestId('fs-btn')).toHaveAttribute('data-analytics-id', 'TOGGLE_FULLSCREEN');
  });

  it('forwards data-analytics-props verbatim on toolbar buttons', () => {
    const payload = JSON.stringify({ feature: 'docs', lang: 'tsx' });

    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetCopyButton
            data-testid='copy-btn'
            data-analytics-id='COPY_CODE'
            data-analytics-props={payload}
          />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    expect(screen.getByTestId('copy-btn')).toHaveAttribute('data-analytics-props', payload);
  });

  it('composes consumer onClick alongside the internal copy handler', async () => {
    const onClick = vi.fn();

    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetCopyButton
            data-testid='copy-btn'
            data-analytics-id='COPY_CODE'
            onClick={onClick}
          />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('composes consumer onToggle alongside the internal wrap handler', async () => {
    const onToggle = vi.fn();

    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetWrapButton
            data-testid='wrap-btn'
            data-analytics-id='TOGGLE_WRAP'
            onToggle={onToggle}
          />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('wrap-btn'));

    expect(onToggle).toHaveBeenCalledWith(true, expect.anything());
  });

  it('forwards data-analytics-id to each CodeSnippetTab trigger', () => {
    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetHeader>
          <CodeSnippetTabs defaultValue='ts'>
            <TabsList>
              <CodeSnippetTab value='ts' data-testid='tab-ts' data-analytics-id='TAB_TS'>
                TypeScript
              </CodeSnippetTab>
              <CodeSnippetTab value='js' data-testid='tab-js' data-analytics-id='TAB_JS'>
                JavaScript
              </CodeSnippetTab>
            </TabsList>
            <TabsContent value='ts'>TS content</TabsContent>
            <TabsContent value='js'>JS content</TabsContent>
          </CodeSnippetTabs>
        </CodeSnippetHeader>
      </CodeSnippetRoot>,
    );

    const tabTs = screen.getByTestId('tab-ts');
    const tabJs = screen.getByTestId('tab-js');

    expect(tabTs.tagName).toBe('BUTTON');
    expect(tabTs).toHaveAttribute('data-analytics-id', 'TAB_TS');
    expect(tabJs).toHaveAttribute('data-analytics-id', 'TAB_JS');
  });

  it('CodeSnippetCopyButton click resolves to its data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' data-analytics-id='COPY_CODE' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(captured).toHaveBeenCalledWith('COPY_CODE');
  });

  it('CodeSnippetWrapButton click resolves to its data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetWrapButton data-testid='wrap-btn' data-analytics-id='TOGGLE_WRAP' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('wrap-btn'));

    expect(captured).toHaveBeenCalledWith('TOGGLE_WRAP');
  });

  it('CodeSnippetFullscreenButton click resolves to its data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <CodeSnippetRoot code='hello'>
        <CodeSnippetActions>
          <CodeSnippetFullscreenButton data-testid='fs-btn' data-analytics-id='TOGGLE_FULLSCREEN' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('fs-btn'));

    expect(captured).toHaveBeenCalledWith('TOGGLE_FULLSCREEN');
  });

  it('forwards data-analytics-id to an explicit CodeSnippetShowMoreButton', async () => {
    const captured = captureAnalyticsClicks();
    const code = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`).join('\n');

    render(
      <CodeSnippetRoot code={code} maxLines={4}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
        <CodeSnippetShowMoreButton data-testid='show-more-btn' data-analytics-id='CODE_SHOW_MORE' />
      </CodeSnippetRoot>,
    );

    const button = await screen.findByTestId('show-more-btn');

    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'CODE_SHOW_MORE');

    await userEvent.click(button);

    expect(captured).toHaveBeenCalledWith('CODE_SHOW_MORE');
  });

  it('renders only the explicit CodeSnippetShowMoreButton when one is provided', () => {
    const code = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`).join('\n');

    render(
      <CodeSnippetRoot code={code} maxLines={4}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
        <CodeSnippetShowMoreButton data-testid='show-more-btn' />
      </CodeSnippetRoot>,
    );

    expect(screen.getAllByRole('button', { name: /show more/i })).toHaveLength(1);
    expect(screen.getByTestId('show-more-btn')).toBeInTheDocument();
  });

  it('keeps auto-rendering the default show-more button when no explicit button is provided', () => {
    const code = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`).join('\n');

    render(
      <CodeSnippetRoot code={code} maxLines={4}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
  });

  it('forwards FoldRegion toggleProps to the fold gutter button', async () => {
    const captured = captureAnalyticsClicks();
    const payload = '{"feature":"code","target":"fold-toggle"}';

    render(
      <CodeSnippetRoot
        code={'function test() {\n  return true;\n}'}
        folds={[
          {
            id: 'function-body',
            startLine: 1,
            endLine: 3,
            toggleProps: {
              'data-testid': 'fold-toggle',
              'data-analytics-id': 'FOLD_TOGGLE',
              'data-analytics-props': payload,
            },
          },
        ]}
      >
        <CodeSnippetContent>
          <CodeSnippetLineNumbers />
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    const toggle = await screen.findByTestId('fold-toggle');

    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('data-analytics-id', 'FOLD_TOGGLE');
    expect(toggle).toHaveAttribute('data-analytics-props', payload);

    await userEvent.click(toggle);

    expect(captured).toHaveBeenCalledWith('FOLD_TOGGLE');
  });

  it('forwards FoldRegion summaryProps to the inline fold-summary button', async () => {
    const captured = captureAnalyticsClicks();
    const payload = '{"feature":"code","target":"fold-summary"}';

    render(
      <CodeSnippetRoot
        code={'function test() {\n  return true;\n}'}
        folds={[
          {
            id: 'function-body',
            startLine: 1,
            endLine: 3,
            defaultCollapsed: true,
            summaryProps: {
              'data-testid': 'fold-summary',
              'data-analytics-id': 'FOLD_SUMMARY',
              'data-analytics-props': payload,
            },
          },
        ]}
      >
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    const summary = await screen.findByTestId('fold-summary');

    expect(summary.tagName).toBe('BUTTON');
    expect(summary).toHaveAttribute('data-analytics-id', 'FOLD_SUMMARY');
    expect(summary).toHaveAttribute('data-analytics-props', payload);

    await userEvent.click(summary);

    expect(captured).toHaveBeenCalledWith('FOLD_SUMMARY');
  });

  it('composes FoldRegion button handlers with the internal fold toggle handler', async () => {
    const onToggleClick = vi.fn();
    const onSummaryClick = vi.fn();

    render(
      <CodeSnippetRoot
        code={'function test() {\n  return true;\n}'}
        folds={[
          {
            id: 'function-body',
            startLine: 1,
            endLine: 3,
            toggleProps: {
              'data-testid': 'fold-toggle',
              onClick: onToggleClick,
            },
            summaryProps: {
              'data-testid': 'fold-summary',
              onClick: onSummaryClick,
            },
          },
        ]}
      >
        <CodeSnippetContent>
          <CodeSnippetLineNumbers />
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    await userEvent.click(await screen.findByTestId('fold-toggle'));
    await userEvent.click(await screen.findByTestId('fold-summary'));

    expect(onToggleClick).toHaveBeenCalledOnce();
    expect(onSummaryClick).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('fold-summary')).not.toBeInTheDocument();
  });
});
