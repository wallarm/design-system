import type * as React from 'react';
import { act } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { createRoot, type Root } from 'react-dom/client';
import { MatchStep } from './MatchStep';
import type { PointSelectorModel } from './usePointSelector';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
(globalThis as typeof globalThis & { React: typeof React }).React = await import('react');

let root: Root | null = null;

const createMockModel = (
  condition: 'equal' | 'regexp' | 'nregexp' | null = null,
  value = '',
): PointSelectorModel =>
  ({
    ui: {
      stage: 'value',
      query: '',
      highlight: 0,
      menuOpen: false,
      nameStep: null,
      nameIgnoreCase: false,
      pickStep: null,
      picked: [],
      conditionQuery: '',
      conditionHighlight: 0,
      focusTick: 0,
      focusTarget: 'value',
      sdkError: null,
      incomplete: false,
      canonicalInfo: null,
    },
    actions: {
      closeConditionList: rs.fn(),
      setConditionQuery: rs.fn(),
      highlightCondition: rs.fn(),
      chooseCondition: rs.fn(),
      editCondition: rs.fn(),
      setValue: rs.fn(),
      setIgnoreCase: rs.fn(),
    },
    keys: {
      handleConditionKey: rs.fn(),
      handleValueKey: rs.fn(),
    },
    conditionTitle: 'How should the value match?',
    conditionTakesValue: condition !== null,
    conditionRows: [],
    conditionHighlightedId: null,
    readAs: 'Read as: the value',
    // Add any other required properties
  }) as unknown as PointSelectorModel;

const render = (
  model: PointSelectorModel,
  condition: 'equal' | 'regexp' | 'nregexp' | null = null,
  value = '',
  ignoreCase = false,
) => {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  const conditionInputRef = { current: null };
  const valueInputRef = { current: null };
  const conditionChipRef = { current: null };

  act(() =>
    root?.render(
      <MatchStep
        model={model}
        conditionInputRef={conditionInputRef}
        valueInputRef={valueInputRef}
        conditionChipRef={conditionChipRef}
        condition={condition}
        value={value}
        ignoreCase={ignoreCase}
      />,
    ),
  );
  return container;
};

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.replaceChildren();
});

describe('MatchStep - Live Regex Validation', () => {
  describe('Non-regex conditions', () => {
    it('does not show validation for equal condition', async () => {
      const model = createMockModel('equal', 'test-value');
      const container = render(model, 'equal', 'test-value');

      // Wait for any potential debounced validation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeFalsy();

      const loader = container.querySelector('[data-testid*="regex-loading"]');
      expect(loader).toBeFalsy();
    });

    it('does not show validation for empty value', async () => {
      const model = createMockModel('regexp', '');
      const container = render(model, 'regexp', '');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeFalsy();
    });
  });

  describe('Regexp condition validation', () => {
    it('shows loading indicator immediately when typing', () => {
      const model = createMockModel('regexp', '[0-9]+');
      const container = render(model, 'regexp', '[0-9]+');

      // Before debounce completes
      const loader = container.querySelector('[data-testid*="regex-loading"]');
      expect(loader).toBeTruthy();
    });

    it('accepts valid regex pattern after debounce', async () => {
      const model = createMockModel('regexp', '^[0-9]{1,10}$');
      const container = render(model, 'regexp', '^[0-9]{1,10}$');

      // Wait for debounce (300ms) + a bit extra
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeFalsy();

      const loader = container.querySelector('[data-testid*="regex-loading"]');
      expect(loader).toBeFalsy();
    });

    it('shows error for invalid regex pattern', async () => {
      const model = createMockModel('regexp', '[invalid(');
      const container = render(model, 'regexp', '[invalid(');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeTruthy();
      expect(error?.textContent).toContain('Regex compilation error');

      const loader = container.querySelector('[data-testid*="regex-loading"]');
      expect(loader).toBeFalsy();
    });

    it('shows error for unclosed bracket', async () => {
      const model = createMockModel('regexp', '[0-9');
      const container = render(model, 'regexp', '[0-9');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeTruthy();
    });

    it('shows error for invalid quantifier', async () => {
      const model = createMockModel('regexp', 'a{,}');
      const container = render(model, 'regexp', 'a{,}');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeTruthy();
    });

    it('accepts complex valid patterns', async () => {
      const validPatterns = [
        '^https?://[a-z0-9.-]+\\.[a-z]{2,}$',
        '\\d{3}-\\d{2}-\\d{4}',
        '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        '(?:foo|bar|baz)',
      ];

      for (const pattern of validPatterns) {
        const model = createMockModel('regexp', pattern);
        const container = render(model, 'regexp', pattern);

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 400));
        });

        const error = container.querySelector('[data-testid*="regex-error"]');
        expect(error).toBeFalsy();

        // Clean up
        act(() => root?.unmount());
        container.remove();
      }
    });
  });

  describe('Nregexp condition validation', () => {
    it('validates nregexp condition same as regexp', async () => {
      const model = createMockModel('nregexp', '^[a-z]+$');
      const container = render(model, 'nregexp', '^[a-z]+$');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeFalsy();
    });

    it('shows error for invalid nregexp pattern', async () => {
      const model = createMockModel('nregexp', '(unclosed');
      const container = render(model, 'nregexp', '(unclosed');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeTruthy();
    });
  });

  describe('Debouncing behavior', () => {
    it('debounces validation by 300ms', async () => {
      const model = createMockModel('regexp', '[0-9]+');
      const container = render(model, 'regexp', '[0-9]+');

      // Immediately after render, loader should be visible
      let loader = container.querySelector('[data-testid*="regex-loading"]');
      expect(loader).toBeTruthy();

      // After 200ms (before debounce completes), loader still visible
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      loader = container.querySelector('[data-testid*="regex-loading"]');
      expect(loader).toBeTruthy();

      // After 400ms total (after debounce completes), loader gone, no error
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      loader = container.querySelector('[data-testid*="regex-loading"]');
      expect(loader).toBeFalsy();

      const error = container.querySelector('[data-testid*="regex-error"]');
      expect(error).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('sets aria-invalid when regex error is present', async () => {
      const model = createMockModel('regexp', '[invalid');
      const container = render(model, 'regexp', '[invalid');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const input = container.querySelector('input[aria-label="value"]');
      expect(input?.getAttribute('aria-invalid')).toBe('true');
    });

    it('sets aria-describedby pointing to error message', async () => {
      const model = createMockModel('regexp', '(broken');
      const container = render(model, 'regexp', '(broken');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const input = container.querySelector('input[aria-label="value"]');
      const describedBy = input?.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();

      const errorElement = container.querySelector(`#${describedBy}`);
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain('Regex compilation error');
    });

    it('does not set aria-invalid for valid regex', async () => {
      const model = createMockModel('regexp', '^[a-z]+$');
      const container = render(model, 'regexp', '^[a-z]+$');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      const input = container.querySelector('input[aria-label="value"]');
      expect(input?.getAttribute('aria-invalid')).toBe('false');
    });
  });

  describe('DoS prevention patterns', () => {
    it('accepts patterns that could cause catastrophic backtracking', async () => {
      // These patterns are potentially dangerous but syntactically valid
      // The actual DoS prevention happens at the vectorscan engine level
      const patterns = ['(a+)+', '(a*)*', '(x+x+)+y', '(.*){10}'];

      for (const pattern of patterns) {
        const model = createMockModel('regexp', pattern);
        const container = render(model, 'regexp', pattern);

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 400));
        });

        // JavaScript RegExp compilation accepts these (they're syntactically valid)
        // The SDK/vectorscan layer would reject them at rule validation time
        const error = container.querySelector('[data-testid*="regex-error"]');
        expect(error).toBeFalsy();

        // Clean up
        act(() => root?.unmount());
        container.remove();
      }
    });
  });
});
