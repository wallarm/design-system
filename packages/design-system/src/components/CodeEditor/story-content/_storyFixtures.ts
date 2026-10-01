import { getHttpFolds } from '../../CodeSnippet/lib/httpFolds';
import type { CodeEditorFolds, JsonSchema } from '../types';

/**
 * Line map the E2E suite relies on (`CodeEditor.e2e.ts`): 1 start line, 2 `Host`,
 * 4 `X-Env: staging`, 7 `"name"`, 9 `"retries": 9` (breaks the schema maximum),
 * 10 a line longer than the frame. `staging` appears exactly twice (lines 4 and 8).
 */
export const EDITING_REQUEST = [
  'POST /api/v1/rules HTTP/1.1',
  'Host: api.wallarm.example',
  'Content-Type: application/json',
  'X-Env: staging',
  '',
  '{',
  '  "name": "Block scanners",',
  '  "env": "staging",',
  '  "retries": 9,',
  '  "description": "Blocks requests from known vulnerability scanners on every public endpoint of the API gateway, including the legacy routes kept only for older mobile clients"',
  '}',
].join('\n');

/** Applies to the JSON body of `EDITING_REQUEST`. Module-level so its identity is stable. */
export const RULE_SCHEMA: JsonSchema = {
  type: 'object',
  required: ['name', 'env'],
  properties: {
    name: { type: 'string', title: 'Rule name' },
    env: { enum: ['staging', 'production'], description: 'Where the rule is deployed.' },
    retries: {
      type: 'integer',
      minimum: 0,
      maximum: 5,
      description: 'How many times a failed check is retried.',
    },
    description: { type: 'string' },
  },
};

/** Headers and body folds recomputed from the edited value (stable reference). */
export const httpFolds: CodeEditorFolds = (value, { startingLineNumber }) =>
  getHttpFolds(value, { startingLineNumber });

export type TabId = 'request' | 'response';

export const isTabId = (value: string): value is TabId =>
  value === 'request' || value === 'response';

/** Line 3 of each document ends with a quoted string the E2E suite edits. */
export const TAB_DOCUMENTS: Record<TabId, string> = {
  request: ['{', '  "action": "block",', '  "path": "/login"', '}'].join('\n'),
  response: ['{', '  "status": 403,', '  "reason": "blocked"', '}'].join('\n'),
};

const LONG_DOCUMENT_EVENTS = 1996;

/** Exactly 2 000 lines — the top of the adapter painter's performance envelope. */
export const LONG_DOCUMENT = [
  '{',
  '  "events": [',
  ...Array.from({ length: LONG_DOCUMENT_EVENTS }, (_, index) => {
    const id = index + 1;
    const status = id % 7 === 0 ? 403 : 200;
    const comma = id === LONG_DOCUMENT_EVENTS ? '' : ',';
    return `    { "id": ${id}, "method": "GET", "path": "/api/v1/items/${id}", "status": ${status} }${comma}`;
  }),
  '  ]',
  '}',
].join('\n');
