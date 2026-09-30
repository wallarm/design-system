import { describe, expect, it } from 'vitest';
import { checkFile, formatFileSize, formatRejection, toAcceptList, toAcceptString } from './index';

const LIMITS = {
  acceptList: ['.so', '.dylib'],
  maxFiles: 1,
  maxFileSize: 32 * 1024 ** 2,
  minFileSize: 10,
};

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [32 * 1024 ** 2, '32 MB'],
    [40.5 * 1024 ** 2, '40.5 MB'],
    [1024 ** 2 - 1, '1 MB'], // rounds up across the unit boundary instead of "1024 KB"
    [3 * 1024 ** 3, '3 GB'],
  ])('%d bytes → %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe('accept helpers', () => {
  it('splits comma strings and trims', () => {
    expect(toAcceptList('.so, .dylib')).toEqual(['.so', '.dylib']);
  });
  it('flattens arrays of comma strings and drops empties', () => {
    expect(toAcceptList(['.lua', 'image/png,image/jpeg', ''])).toEqual([
      '.lua',
      'image/png',
      'image/jpeg',
    ]);
  });
  it('returns [] / undefined for no accept', () => {
    expect(toAcceptList(undefined)).toEqual([]);
    expect(toAcceptString(undefined)).toBeUndefined();
    expect(toAcceptString([])).toBeUndefined();
  });
  it('joins into an Ark/native accept string', () => {
    expect(toAcceptString(['.so', '.dylib'])).toBe('.so,.dylib');
  });
});

describe('formatRejection', () => {
  it('names the file and the accepted types', () => {
    expect(formatRejection('policy.txt', 'FILE_INVALID_TYPE', LIMITS)).toBe(
      'policy.txt — Not a .so / .dylib file',
    );
  });
  it('states size and limit for FILE_TOO_LARGE', () => {
    expect(formatRejection('big.so', 'FILE_TOO_LARGE', LIMITS, 40 * 1024 ** 2)).toBe(
      'big.so — Too large: 40 MB; the limit is 32 MB',
    );
  });
  it('states size and minimum for FILE_TOO_SMALL', () => {
    expect(formatRejection('tiny.so', 'FILE_TOO_SMALL', LIMITS, 2)).toBe(
      'tiny.so — Too small: 2 B; the minimum is 10 B',
    );
  });
  it('states the file limit for TOO_MANY_FILES', () => {
    expect(formatRejection('c.so', 'TOO_MANY_FILES', { ...LIMITS, maxFiles: 2 })).toBe(
      'c.so — Too many files; the limit is 2',
    );
  });
  it('reports duplicates', () => {
    expect(formatRejection('a.so', 'FILE_EXISTS', LIMITS)).toBe('a.so — Already added');
  });
  it('shows custom validate() strings verbatim', () => {
    expect(formatRejection('a.so', 'Missing spe_init export', LIMITS)).toBe(
      'a.so — Missing spe_init export',
    );
  });
});

describe('checkFile', () => {
  const file = (name: string, size = 20, type = '') => new File(['x'.repeat(size)], name, { type });

  it('accepts by extension, case-insensitive', () => {
    expect(checkFile(file('LIB.SO'), { acceptList: ['.so'] })).toEqual([]);
  });
  it('accepts exact and wildcard MIME types', () => {
    expect(checkFile(file('a.png', 20, 'image/png'), { acceptList: ['image/png'] })).toEqual([]);
    expect(checkFile(file('a.webp', 20, 'image/webp'), { acceptList: ['image/*'] })).toEqual([]);
  });
  it('rejects the wrong type', () => {
    expect(checkFile(file('a.txt'), { acceptList: ['.so'] })).toEqual(['FILE_INVALID_TYPE']);
  });
  it('accepts everything when acceptList is empty', () => {
    expect(checkFile(file('a.anything'), { acceptList: [] })).toEqual([]);
  });
  it('reports size limits and custom errors together', () => {
    expect(
      checkFile(file('a.so', 100), {
        acceptList: ['.so'],
        maxFileSize: 50,
        validate: () => ['Bad header'],
      }),
    ).toEqual(['FILE_TOO_LARGE', 'Bad header']);
    expect(checkFile(file('a.so', 1), { acceptList: [], minFileSize: 5 })).toEqual([
      'FILE_TOO_SMALL',
    ]);
  });
});
