import { describe, expect, it } from 'vitest';
import { MAX_BUMP_LIFT, bumpDesk, bumpLiftInPixels, onDeskBump } from '../../src/background/deskBumps.ts';

describe('the hits on the desk', () => {
  it('tells every listener how hard the hit was', () => {
    const received: number[] = [];
    const stopListening = onDeskBump((strength) => received.push(strength));
    bumpDesk(0.5);
    stopListening();
    expect(received).toEqual([0.5]);
  });

  it('keeps the strength between 0 and 1', () => {
    const received: number[] = [];
    const stopListening = onDeskBump((strength) => received.push(strength));
    bumpDesk(3);
    bumpDesk(-1);
    stopListening();
    expect(received).toEqual([1, 0]);
  });

  it('stops calling a listener that stopped listening', () => {
    const received: number[] = [];
    const stopListening = onDeskBump((strength) => received.push(strength));
    stopListening();
    bumpDesk(1);
    expect(received).toEqual([]);
  });

  it('makes the objects jump at least one pixel and at most MAX_BUMP_LIFT', () => {
    expect(bumpLiftInPixels(0)).toBe(1);
    expect(bumpLiftInPixels(1)).toBe(MAX_BUMP_LIFT);
    expect(bumpLiftInPixels(0.5)).toBeGreaterThanOrEqual(1);
    expect(bumpLiftInPixels(0.5)).toBeLessThanOrEqual(MAX_BUMP_LIFT);
  });
});
