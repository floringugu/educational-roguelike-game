import { describe, expect, it } from 'vitest';
import { isDebugMode } from '../../src/debug/debugMode.ts';

describe('isDebugMode', () => {
  it('is on with ?debug in the address', () => {
    expect(isDebugMode('?debug')).toBe(true);
    expect(isDebugMode('?debug=1')).toBe(true);
    expect(isDebugMode('?other=2&debug')).toBe(true);
  });

  it('is off without it', () => {
    expect(isDebugMode('')).toBe(false);
    expect(isDebugMode('?other=2')).toBe(false);
  });
});
