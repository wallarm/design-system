import { describe, expect, it } from '@rstest/core';
import { toCanvasAdapter } from './canvas-adapter';

describe('stateful canvas examples', () => {
  it('emits a complete classic-JavaScript adapter for local state', () => {
    const result = toCanvasAdapter(
      `import { useState } from 'react';
      import { SearchInput } from '@wallarm-org/design-system/SearchInput';
      export const Basic = () => {
        const [value, setValue] = useState('');
        return <SearchInput value={value} onChange={setValue} />;
      };`,
      'SearchInputBasic',
    );
    expect(result).toContain('window.WallarmExampleSearchInputBasic');
    expect(result).toContain('React.createElement(SearchInput');
    expect(result).toContain('component-from-global-scope="WallarmExampleSearchInputBasic"');
    expect(result).not.toContain('import {');
  });

  it('resolves local story data but refuses missing data or test-only helpers', () => {
    const code = `import { Text } from '@wallarm-org/design-system/Text';
      export const Basic = () => <Text onClick={() => onClick()}>{message}</Text>;`;
    expect(toCanvasAdapter(code, 'Basic')).toBeUndefined();
    expect(
      toCanvasAdapter(
        code,
        'Basic',
        `const message = 'Ready';
      const onClick = () => console.log(message);`,
      ),
    ).toContain("const message = 'Ready'");
    expect(
      toCanvasAdapter(
        code,
        'Basic',
        `import { fn } from 'storybook/test';
      const message = 'Ready'; const onClick = fn();`,
      ),
    ).toBeUndefined();
  });
});
