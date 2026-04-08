import { describe, expect, it } from 'vitest';
import { getHttpFolds, HTTP_FOLD_ID } from './httpFolds';

const httpRequest = `GET /api/v2/users HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer token123
Cache-Control: no-cache

{
  "filter": "active"
}`;

const httpResponse = `HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: abc-123

{
  "data": []
}`;

const headersOnly = `GET /api/health HTTP/1.1
Host: api.example.com
Accept: text/plain`;

const singleLine = `GET /api/health HTTP/1.1`;

describe('getHttpFolds', () => {
  it('returns headers and body folds for a full request', () => {
    const folds = getHttpFolds(httpRequest);

    expect(folds).toEqual([
      {
        id: HTTP_FOLD_ID.headers,
        startLine: 2,
        endLine: 5,
        label: 'Headers',
        defaultCollapsed: undefined,
      },
      {
        id: HTTP_FOLD_ID.body,
        startLine: 7,
        endLine: 9,
        label: 'Body',
        defaultCollapsed: undefined,
      },
    ]);
  });

  it('returns headers and body folds for a response', () => {
    const folds = getHttpFolds(httpResponse);

    expect(folds).toEqual([
      {
        id: HTTP_FOLD_ID.headers,
        startLine: 2,
        endLine: 3,
        label: 'Headers',
        defaultCollapsed: undefined,
      },
      {
        id: HTTP_FOLD_ID.body,
        startLine: 5,
        endLine: 7,
        label: 'Body',
        defaultCollapsed: undefined,
      },
    ]);
  });

  it('returns only headers fold when no body', () => {
    const folds = getHttpFolds(headersOnly);

    expect(folds).toEqual([
      {
        id: HTTP_FOLD_ID.headers,
        startLine: 2,
        endLine: 3,
        label: 'Headers',
        defaultCollapsed: undefined,
      },
    ]);
  });

  it('returns empty array for single-line input', () => {
    const folds = getHttpFolds(singleLine);
    expect(folds).toEqual([]);
  });

  it('applies custom labels', () => {
    const folds = getHttpFolds(httpRequest, {
      headers: { label: 'Request Headers' },
      body: { label: 'Request Body' },
    });

    expect(folds[0].label).toBe('Request Headers');
    expect(folds[1].label).toBe('Request Body');
  });

  it('applies defaultCollapsed options', () => {
    const folds = getHttpFolds(httpRequest, {
      headers: { defaultCollapsed: false },
      body: { defaultCollapsed: true },
    });

    expect(folds[0].defaultCollapsed).toBe(false);
    expect(folds[1].defaultCollapsed).toBe(true);
  });

  it('uses const IDs that cannot be overridden', () => {
    const folds = getHttpFolds(httpRequest);

    expect(folds[0].id).toBe('http-headers');
    expect(folds[1].id).toBe('http-body');
  });

  it('offsets line numbers with startingLineNumber', () => {
    const folds = getHttpFolds(httpResponse, { startingLineNumber: 100 });

    expect(folds[0]).toMatchObject({ startLine: 101, endLine: 102 });
    expect(folds[1]).toMatchObject({ startLine: 104, endLine: 106 });
  });

  it('handles trailing newline as separator with no body', () => {
    const code = `GET /api HTTP/1.1
Host: example.com
`;
    const folds = getHttpFolds(code);

    // Trailing newline creates an empty line at index 2 → separator
    // No body lines after separator → only headers fold
    expect(folds).toHaveLength(1);
    expect(folds[0].id).toBe(HTTP_FOLD_ID.headers);
    expect(folds[0].startLine).toBe(2);
    expect(folds[0].endLine).toBe(2);
  });
});
