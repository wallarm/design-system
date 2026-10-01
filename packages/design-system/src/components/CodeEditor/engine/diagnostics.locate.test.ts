import { describe, expect, it } from 'vitest';
import { locateJsonSyntaxError } from './diagnostics';

describe('locateJsonSyntaxError', () => {
  it('reads the V8 "at position N" offset and drops the position suffix', () => {
    expect(
      locateJsonSyntaxError(
        "Expected ',' or '}' after property value in JSON at position 13 (line 3 column 3)",
        '{\n  "a": 1\n  "b": 2\n}',
      ),
    ).toEqual({ offset: 13, message: "Expected ',' or '}' after property value" });
  });

  it('converts a Firefox "line L column C" position into an offset', () => {
    expect(
      locateJsonSyntaxError(
        "JSON.parse: expected ',' or '}' after property value in object at line 3 column 3 of the JSON data",
        '{\n  "a": 1\n  "b": 2\n}',
      ),
    ).toEqual({ offset: 13, message: "Expected ',' or '}' after property value in object" });
  });

  it('points "unexpected end" at the end of the content, ignoring trailing whitespace', () => {
    expect(locateJsonSyntaxError('Unexpected end of JSON input', '{"a": \n\n')).toEqual({
      offset: 5,
      message: 'Unexpected end of JSON input',
    });
  });

  it('returns a null offset when the message has no position', () => {
    expect(
      locateJsonSyntaxError(`Unexpected token '}', "{"a": tru}" is not valid JSON`, '{"a": tru}'),
    ).toEqual({ offset: null, message: "Unexpected token '}'" });
    expect(locateJsonSyntaxError("JSON Parse error: Expected '}'", '{')).toEqual({
      offset: null,
      message: "Expected '}'",
    });
  });

  it('falls back to a generic message when nothing is left after cleaning', () => {
    expect(locateJsonSyntaxError('', '{')).toEqual({ offset: null, message: 'Invalid JSON' });
  });

  it('keeps the "after JSON" wording of the V8 trailing-content message', () => {
    expect(
      locateJsonSyntaxError(
        'Unexpected non-whitespace character after JSON at position 4 (line 1 column 5)',
        '[1] x',
      ),
    ).toEqual({ offset: 4, message: 'Unexpected non-whitespace character after JSON' });
  });

  it('drops the quoted input of V8 messages, also when it is truncated', () => {
    expect(
      locateJsonSyntaxError(`Unexpected token ']', ..."19999, tru]" is not valid JSON`, '[tru]'),
    ).toEqual({ offset: null, message: "Unexpected token ']'" });
    expect(
      locateJsonSyntaxError(
        `Unexpected token 't', ..."1, 2, tru, 0, 1"... is not valid JSON`,
        '[tru]',
      ),
    ).toEqual({ offset: null, message: "Unexpected token 't'" });
  });
});
