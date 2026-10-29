import type { ElementType, ReactNode } from 'react';
import { afterEach, describe, expect, it } from '@rstest/core';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createReact18Window } from './react18';

const envs: ReturnType<typeof createReact18Window>[] = [];
function setup() {
  const env = createReact18Window();
  envs.push(env);
  env.window.eval(readFileSync(resolve('.claude-design/project/components/bundle.js'), 'utf8'));
  const DS = env.window.WallarmDS;
  const h = (name: string, props: Record<string, unknown> = {}, ...children: ReactNode[]) =>
    env.React.createElement(DS[name] as ElementType, props, ...children);
  const root = env.ReactDOM.createRoot(env.window.document.getElementById('app')!);
  const mount = (node: ReactNode) => env.ReactDOM.flushSync(() => root.render(node));
  return { ...env, DS, h, root, mount };
}
afterEach(() => {
  for (const env of envs.splice(0)) env.dom.window.close();
});

describe('complete browser bundle on real React 18', () => {
  it('defines the namespace and matches every published runtime export', () => {
    const { React, DS } = setup();
    expect(React.version).toBe('18.3.1');
    const sourceExports: string[] = JSON.parse(
      execFileSync(
        'node',
        [
          '--input-type=module',
          '-e',
          "import * as ds from './dist/index.js'; import {readdirSync,existsSync} from 'node:fs'; const names=new Set(Object.keys(ds)); for(const dir of readdirSync('./dist/components')) {const file='./dist/components/'+dir+'/index.js'; if(existsSync(file)) for(const name of Object.keys(await import(file))) names.add(name);} console.log(JSON.stringify([...names]))",
        ],
        { encoding: 'utf8' },
      ),
    );
    for (const name of sourceExports) expect(DS, name).toHaveProperty(name);
  });
  it('has a complete header and stays within inline-script and size limits', () => {
    const { DS } = setup();
    const bundle = readFileSync(resolve('.claude-design/project/components/bundle.js'), 'utf8');
    const header = JSON.parse(
      bundle.split('\n')[0]!.replace('/* @ds-bundle: ', '').replace(' */', ''),
    ) as { format: number; namespace: string; components: { name: string }[] };
    expect(header.namespace).toBe('WallarmDS');
    expect(header.format).toBe(4);
    for (const name of Object.keys(DS).filter(
      name => /^[A-Z]/.test(name) && !['Icons', 'TableCells'].includes(name),
    ))
      expect(header.components.map(c => c.name)).toContain(name);
    expect(Buffer.byteLength(bundle)).toBeLessThanOrEqual(5_700_000);
    expect(bundle).not.toMatch(/<\/script|<!--|(?:import|fetch)\s*\(\s*['"]https?:/i);
  });
  it('forwards Button and Input refs supplied by the canvas', () => {
    const { React, window, h, mount, root } = setup();
    const button = React.createRef<HTMLButtonElement>();
    const input = React.createRef<HTMLInputElement>();
    mount(
      React.createElement(
        React.Fragment,
        {},
        h('Button', { ref: button }, 'Save'),
        h('Input', { ref: input }),
      ),
    );
    expect(button.current).toBeInstanceOf(window.HTMLButtonElement);
    expect(input.current).toBeInstanceOf(window.HTMLInputElement);
    root.unmount();
  });
});
