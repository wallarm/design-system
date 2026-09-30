import { describe, expect, it } from 'vitest';
import { getInitials } from './getInitials';

describe('getInitials', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['  ada  ', 'A'],
    ['Иван Петров', 'ИП'],
    ['Jean-Luc Picard', 'JP'],
    ['Grace Brewster Murray Hopper', 'GH'],
    ['ada lovelace', 'AL'],
    ['👩‍💻 Dev', 'D'],
    ['42', ''],
    ['"Ada" Lovelace', 'AL'],
    ['Ada 42', 'A'],
    ['(Ada) (Lovelace)', 'AL'],
    ['e\u0301mile Zola', 'E\u0301Z'],
    ['', ''],
    ['   ', ''],
  ])('%j → %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
