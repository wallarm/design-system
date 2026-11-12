import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import { wallarmComponents } from '../components';
import { formatNumber } from '../core/format';
import { LIVE_MONITOR_SCENARIO, openUiAnswer, SCENARIOS } from '../fixtures';
import { toStreams } from '../fixtures/stream';
import { checkOpenUiAnswer, createOpenUiLibrary, OpenUiSurface } from '../openui';

const libraryFor = (actions: (typeof SCENARIOS)[number]['actions']) =>
  createOpenUiLibrary(wallarmComponents, actions);

describe('OpenUI Lang', () => {
  for (const scenario of SCENARIOS) {
    it(`renders "${scenario.prompt}" complete, with no issue in the answer`, async () => {
      const library = libraryFor(scenario.actions);
      const { program, data } = openUiAnswer(scenario.openui);
      const error = rstest.spyOn(console, 'error');
      const onError = rstest.fn();
      const view = render(
        <OpenUiSurface
          library={library}
          program={program}
          data={data}
          onAction={rstest.fn()}
          onError={onError}
        />,
      );
      await waitFor(() => expect(view.container.textContent).not.toBe(''));
      await waitFor(() =>
        expect(view.container.querySelector('[data-gen-ui-placeholder]')).toBeNull(),
      );
      expect(onError).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      error.mockRestore();
      const options = { components: wallarmComponents, actions: scenario.actions };
      expect(checkOpenUiAnswer(program, library, options)).toEqual([]);
    });
  }

  it('renders every prefix of every stream', () => {
    const error = rstest.spyOn(console, 'error');
    for (const scenario of SCENARIOS) {
      const library = libraryFor(scenario.actions);
      for (let i = 1; i <= scenario.openui.length; i++) {
        const { program, data } = openUiAnswer(scenario.openui.slice(0, i));
        render(
          <OpenUiSurface
            library={library}
            program={program}
            data={data}
            streaming={i < scenario.openui.length}
            onAction={rstest.fn()}
            onError={rstest.fn()}
          />,
        ).unmount();
      }
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('shows a skeleton until the app sends the data the program reads', async () => {
    const scenario = SCENARIOS.find(s => s.id === 'security-dashboard') ?? SCENARIOS[1];
    if (!scenario) throw new Error('no scenario');
    const { program } = openUiAnswer(scenario.openui);
    const view = render(
      <OpenUiSurface
        library={libraryFor(scenario.actions)}
        program={program}
        onAction={rstest.fn()}
        onError={rstest.fn()}
      />,
    );
    expect(await screen.findByText('Security dashboard')).toBeTruthy();
    expect(view.container.querySelector('[data-gen-ui-placeholder]')).not.toBeNull();
    expect(screen.queryByText('13.2M')).toBeNull();
  });

  it('keeps the page current with live app data', async () => {
    const streams = toStreams(LIVE_MONITOR_SCENARIO);
    const live = streams.liveStreams;
    if (!live) throw new Error('the scenario has live data');
    const library = libraryFor(LIVE_MONITOR_SCENARIO.actions);
    const first = openUiAnswer(streams.openui);
    const shown = (data: Record<string, unknown>) => {
      const now = data.now;
      return typeof now === 'object' && now !== null && 'requests' in now
        ? formatNumber(Number(now.requests), 'compact')
        : '';
    };
    // The first update that changes the tile, so the check can fail.
    const tick =
      Array.from({ length: 60 }, (_, i) => i + 1).find(
        t =>
          shown(openUiAnswer([...streams.openui, ...live.lines(t).openui]).data) !==
          shown(first.data),
      ) ?? 0;
    const next = openUiAnswer([...streams.openui, ...live.lines(tick).openui]);
    const props = { library, program: first.program, onAction: rstest.fn(), onError: rstest.fn() };
    const view = render(<OpenUiSurface {...props} data={first.data} />);
    expect(await screen.findByText(shown(first.data))).toBeTruthy();
    view.rerender(<OpenUiSurface {...props} data={next.data} />);
    expect(await screen.findByText(shown(next.data))).toBeTruthy();
  });

  it("passes the app's actions with their context and drops the rest", async () => {
    const onAction = rstest.fn();
    const program = [
      'root = Stack("row", null, [ok, away])',
      'ok = Button("Block", "primary", null, @block_ips({ips: $top}))',
      'away = Button("Open", null, null, @OpenUrl("https://example.com"))',
    ].join('\n');
    render(
      <OpenUiSurface
        library={libraryFor([{ name: 'block_ips', description: 'Block IPs.' }])}
        program={program}
        data={{ top: ['203.0.113.7'] }}
        onAction={onAction}
      />,
    );
    // The app's action goes through; @OpenUrl would leave the page and is dropped.
    (await screen.findByText('Open')).click();
    (await screen.findByText('Block')).click();
    await waitFor(() =>
      expect(onAction).toHaveBeenCalledWith('block_ips', { ips: ['203.0.113.7'] }),
    );
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('prompts the model with every catalog entry and the allowed actions', () => {
    const prompt = libraryFor([{ name: 'block_ips', description: 'Block IPs.' }]).library.prompt();
    for (const { name } of wallarmComponents) expect(prompt).toContain(`${name}(`);
    expect(prompt).toContain('block_ips');
  });
});
