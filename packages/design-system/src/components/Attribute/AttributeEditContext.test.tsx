import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAttributeEdit } from './AttributeEditContext';

describe('useAttributeEdit', () => {
  it('throws when used outside AttributeEdit', () => {
    expect(() => renderHook(() => useAttributeEdit())).toThrow(
      /must be used within <AttributeEdit>/,
    );
  });
});
