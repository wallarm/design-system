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
    ['👩‍💻 Dev', '👩‍💻D'],
    ['', ''],
    ['   ', ''],
  ])('%j → %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
