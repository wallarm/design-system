import { describe, expect, it, rstest } from '@rstest/core';
import { render, waitFor } from '@testing-library/react';
import {
  type A2uiMessage,
  a2uiPrompt,
  createA2uiCatalog,
  ExpressSurfaces,
  toExpressLines,
} from '../a2ui';
import { wallarmComponents } from '../components';
import { SCENARIOS } from '../fixtures';

const catalog = createA2uiCatalog(wallarmComponents);

const surfaceIdOf = (messages: readonly A2uiMessage[]) =>
  JSON.stringify(messages[0]).match(/"surfaceId":"([^"]+)"/)?.[1] ?? 'main';

describe('A2UI Express', () => {
  for (const scenario of SCENARIOS) {
    it(`streams "${scenario.prompt}" as Express and renders it complete`, async () => {
      const messages = scenario.a2ui.map(line => line.line);
      const surfaceId = surfaceIdOf(messages);
      const chunks = toExpressLines(catalog, surfaceId, messages);
      const error = rstest.spyOn(console, 'error');
      const onError = rstest.fn();
      const props = {
        catalog,
        surfaceId,
        actions: scenario.actions,
        onAction: rstest.fn(),
        onError,
      };

      // Chunk by chunk, as a model streams it: the compiler emits messages as they complete.
      const view = render(<ExpressSurfaces {...props} chunks={chunks.slice(0, 1)} />);
      for (let i = 2; i <= chunks.length; i++) {
        view.rerender(<ExpressSurfaces {...props} chunks={chunks.slice(0, i)} />);
      }
      await waitFor(() => expect(view.container.textContent).not.toBe(''));
      await waitFor(() =>
        expect(view.container.querySelector('[data-gen-ui-placeholder]')).toBeNull(),
      );
      expect(onError).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      error.mockRestore();
    });
  }

  it("writes the agent's layout in well under two thirds of the JSON", () => {
    for (const scenario of SCENARIOS) {
      const agent = scenario.a2ui.filter(l => l.origin === 'agent').map(l => l.line);
      const express = toExpressLines(catalog, surfaceIdOf(agent), agent).join('\n');
      expect(express.length / JSON.stringify(agent).length).toBeLessThan(0.65);
    }
  });

  it('prompts the model with a signature for every catalog entry and the allowed actions', () => {
    const actions = [{ name: 'block_ips', description: 'Block the given IPs.' }];
    const prompt = a2uiPrompt(catalog, { actions });
    for (const { name } of wallarmComponents) expect(prompt).toContain(`${name}(`);
    expect(prompt).toContain('- block_ips: Block the given IPs.');
    const json = a2uiPrompt(catalog, { format: 'json', actions });
    for (const { name } of wallarmComponents) expect(json).toContain(`"${name}"`);
    expect(json).toContain('updateComponents');
  });

  it('reports a block it cannot compile and renders the rest', async () => {
    const onError = rstest.fn();
    const view = render(
      <ExpressSurfaces
        catalog={catalog}
        surfaceId='s'
        chunks={[
          'surface("s")\nroot = Stack(_, _, [title])\ntitle = Heading("Fine")',
          'surface("s", update=true)\nbad = NotAComponent("x")',
        ]}
        actions={[]}
        onAction={rstest.fn()}
        onError={onError}
      />,
    );
    await waitFor(() => expect(view.container.textContent).toContain('Fine'));
    expect(onError).toHaveBeenCalled();
  });
});
