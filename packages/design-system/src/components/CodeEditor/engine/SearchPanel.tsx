import { type ChangeEvent, type FC, type KeyboardEvent, useCallback } from 'react';
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  replaceAll,
  replaceNext,
  SearchQuery,
  setSearchQuery,
} from '@codemirror/search';
import { EditorView, runScopeHandlers } from '@codemirror/view';
import { ChevronDown } from '../../../icons/ChevronDown';
import { ChevronUp } from '../../../icons/ChevronUp';
import { X } from '../../../icons/X';
import { cn } from '../../../utils/cn';
import { Button } from '../../Button';
import { Input } from '../../Input';
import { ToggleButton } from '../../ToggleButton';
import { countMatches, matchCountMessage } from './searchMatches';

export interface SearchPanelProps {
  view: EditorView;
  query: SearchQuery;
  /** `null` while the query is empty or an invalid regular expression. */
  matchCount: number | null;
  readOnly: boolean;
  testId: string | undefined;
}

type QueryPatch = Partial<
  Pick<SearchQuery, 'search' | 'replace' | 'caseSensitive' | 'regexp' | 'wholeWord'>
>;

const rowClassName = 'flex h-32 items-center gap-4 px-6';

/** Internal: rendered by `searchExtension` into CodeMirror's top panel through the portal registry. */
export const SearchPanel: FC<SearchPanelProps> = ({
  view,
  query,
  matchCount,
  readOnly,
  testId,
}) => {
  const slot = (name: string) => (testId ? `${testId}--${name}` : undefined);

  /** Focus + select the find field once, when the panel mounts. */
  const focusOnMount = useCallback((input: HTMLInputElement | null) => {
    input?.focus();
    input?.select();
  }, []);

  const updateQuery = (patch: QueryPatch) => {
    const next = new SearchQuery({
      search: query.search,
      replace: query.replace,
      caseSensitive: query.caseSensitive,
      regexp: query.regexp,
      wholeWord: query.wholeWord,
      literal: query.literal,
      ...patch,
    });
    if (next.eq(query)) return;
    const effects = [setSearchQuery.of(next)];
    const announce =
      next.search === ''
        ? []
        : [
            EditorView.announce.of(
              next.valid
                ? matchCountMessage(countMatches(view.state, next))
                : 'Invalid regular expression',
            ),
          ];
    view.dispatch({ effects: [...effects, ...announce] });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, onEnter: (shift: boolean) => void) => {
    // Enter / Escape while an IME composes text confirm the composition, not a search command.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    // Escape / Mod-F / F3 / Mod-G from `searchKeymap` (scope `search-panel`).
    // preventDefault marks Escape as handled, so an enclosing fullscreen stays open.
    if (runScopeHandlers(view, event.nativeEvent, 'search-panel')) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onEnter(event.shiftKey);
    }
  };

  const handleFindKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    handleKeyDown(event, shift => (shift ? findPrevious : findNext)(view));

  const handleReplaceKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    handleKeyDown(event, () => replaceNext(view));

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Inputs handle their own keys; this covers the buttons.
    if (event.target instanceof HTMLInputElement) return;
    if (runScopeHandlers(view, event.nativeEvent, 'search-panel')) event.preventDefault();
  };

  const canSearch = query.valid;

  return (
    <div
      role='search'
      aria-label='Find and replace'
      data-slot='code-editor-search'
      data-testid={slot('search')}
      className='flex flex-col border-b border-border-primary-light code-snippet-bg font-sans'
      onKeyDown={handlePanelKeyDown}
    >
      <div className={rowClassName}>
        <Input
          ref={focusOnMount}
          size='small'
          className='w-240'
          placeholder='Find'
          aria-label='Find'
          main-field='true'
          value={query.search}
          error={query.search !== '' && !canSearch}
          data-testid={slot('search-input')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateQuery({ search: event.target.value })
          }
          onKeyDown={handleFindKeyDown}
        />
        <span
          aria-hidden='true'
          className={cn(
            'min-w-72 text-xs text-text-secondary whitespace-nowrap',
            !canSearch && 'invisible',
          )}
          data-testid={slot('search-count')}
        >
          {matchCount === null ? '' : matchCountMessage(matchCount)}
        </span>
        <ToggleButton
          variant='ghost'
          color='neutral'
          size='small'
          active={query.caseSensitive}
          aria-pressed={query.caseSensitive}
          aria-label='Match case'
          data-testid={slot('search-case')}
          onToggle={active => updateQuery({ caseSensitive: active })}
        >
          Aa
        </ToggleButton>
        <ToggleButton
          variant='ghost'
          color='neutral'
          size='small'
          active={query.wholeWord}
          aria-pressed={query.wholeWord}
          aria-label='Match whole word'
          data-testid={slot('search-whole-word')}
          onToggle={active => updateQuery({ wholeWord: active })}
        >
          W
        </ToggleButton>
        <ToggleButton
          variant='ghost'
          color='neutral'
          size='small'
          active={query.regexp}
          aria-pressed={query.regexp}
          aria-label='Use regular expression'
          data-testid={slot('search-regexp')}
          onToggle={active => updateQuery({ regexp: active })}
        >
          .*
        </ToggleButton>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='Previous match'
          disabled={!canSearch}
          data-testid={slot('search-previous')}
          onClick={() => findPrevious(view)}
        >
          <ChevronUp />
        </Button>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='Next match'
          disabled={!canSearch}
          data-testid={slot('search-next')}
          onClick={() => findNext(view)}
        >
          <ChevronDown />
        </Button>
        <Button
          variant='ghost'
          color='neutral'
          size='small'
          className='ml-auto'
          aria-label='Close search'
          data-testid={slot('search-close')}
          onClick={() => closeSearchPanel(view)}
        >
          <X />
        </Button>
      </div>
      {!readOnly && (
        <div className={rowClassName}>
          <Input
            size='small'
            className='w-240'
            placeholder='Replace'
            aria-label='Replace'
            value={query.replace}
            data-testid={slot('replace-input')}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateQuery({ replace: event.target.value })
            }
            onKeyDown={handleReplaceKeyDown}
          />
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            disabled={!canSearch}
            data-testid={slot('replace-next')}
            onClick={() => replaceNext(view)}
          >
            Replace
          </Button>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            disabled={!canSearch}
            data-testid={slot('replace-all')}
            onClick={() => replaceAll(view)}
          >
            Replace all
          </Button>
        </div>
      )}
    </div>
  );
};

SearchPanel.displayName = 'SearchPanel';
