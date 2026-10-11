import { describe, expect, it } from 'vitest';
import { filledQuarters } from '../../src/prototype/healthSymbols.ts';

describe('the health drawn as symbols (ticket 06)', () => {
  it('draws one symbol for every 8 points of maximum health', () => {
    expect(filledQuarters(40, 40)).toHaveLength(5);
    expect(filledQuarters(80, 80)).toHaveLength(10);
    // A maximum that is not a multiple of 8 still gets a symbol for the rest.
    expect(filledQuarters(42, 42)).toHaveLength(6);
  });

  it('fills every quarter with full health and none with no health', () => {
    expect(filledQuarters(40, 40)).toEqual([4, 4, 4, 4, 4]);
    expect(filledQuarters(0, 40)).toEqual([0, 0, 0, 0, 0]);
  });

  it('empties the symbols from the last one, a quarter for every 2 points', () => {
    expect(filledQuarters(26, 40)).toEqual([4, 4, 4, 1, 0]);
    expect(filledQuarters(34, 40)).toEqual([4, 4, 4, 4, 1]);
  });

  it('shows a quarter as full while any of its health is left', () => {
    expect(filledQuarters(27, 40)).toEqual([4, 4, 4, 2, 0]);
    expect(filledQuarters(1, 40)).toEqual([1, 0, 0, 0, 0]);
  });
});
