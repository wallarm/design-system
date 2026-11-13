import { transformAsync } from '@babel/core';
import { describe, expect, it } from '@rstest/core';
import { act, renderHook } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { useControlled } from '../useControlled';

interface Props {
  controlled: string | undefined;
  default?: string;
}

const renderControlled = (initialProps: Props) =>
  renderHook(
    ({ controlled, default: defaultValue }: Props) =>
      useControlled({ controlled, default: defaultValue }),
    { initialProps },
  );

describe('useControlled', () => {
  it('uncontrolled: starts from the default and the setter updates the value', () => {
    const { result } = renderControlled({ controlled: undefined, default: 'a' });
    expect(result.current[0]).toBe('a');

    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');
  });

  it('controlled: follows the prop and the setter is a no-op', () => {
    const { result, rerender } = renderControlled({ controlled: 'x', default: 'a' });
    expect(result.current[0]).toBe('x');

    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('x');

    rerender({ controlled: 'y', default: 'a' });
    expect(result.current[0]).toBe('y');
  });

  it('keeps the mode chosen on mount when the prop switches', () => {
    const uncontrolled = renderControlled({ controlled: undefined, default: 'a' });
    uncontrolled.rerender({ controlled: 'x', default: 'a' });
    expect(uncontrolled.result.current[0]).toBe('a');

    const controlled = renderControlled({ controlled: 'x' });
    controlled.rerender({ controlled: undefined });
    expect(controlled.result.current[0]).toBeUndefined();
  });

  it('keeps the setter identity across renders', () => {
    const { result, rerender } = renderControlled({ controlled: undefined, default: 'a' });
    const setter = result.current[1];
    act(() => setter('b'));
    rerender({ controlled: undefined, default: 'a' });
    expect(result.current[1]).toBe(setter);
  });

  it('compiles under React Compiler without a bailout', async () => {
    const filename = path.resolve(__dirname, '../useControlled.ts');
    const errors: string[] = [];
    await transformAsync(readFileSync(filename, 'utf8'), {
      filename,
      babelrc: false,
      configFile: false,
      presets: ['@babel/preset-typescript'],
      plugins: [
        [
          'babel-plugin-react-compiler',
          {
            target: '19',
            panicThreshold: 'none',
            logger: {
              logEvent(_file: string, event: { kind: string }) {
                if (event.kind === 'CompileError' || event.kind === 'PipelineError') {
                  errors.push(event.kind);
                }
              },
            },
          },
        ],
      ],
    });
    expect(errors).toEqual([]);
  });
});
