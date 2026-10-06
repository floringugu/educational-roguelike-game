import { describe, expect, it } from 'vitest';
import { FAN_STEP_DEGREES, fanPose } from '../../src/cards/fanLayout.ts';

describe('fanPose (FR-VIS-002)', () => {
  const hand = [0, 1, 2, 3, 4].map((index) => fanPose(index, 5));

  it('keeps the middle card straight and in its place', () => {
    expect(hand[2]).toEqual({ rotateDegrees: 0, dropPixels: 0 });
  });

  it('turns each card a little more than the one on its left', () => {
    const angles = hand.map((pose) => pose.rotateDegrees);
    expect(angles).toEqual([-2, -1, 0, 1, 2].map((steps) => steps * FAN_STEP_DEGREES));
  });

  it('opens symmetrically, with the cards at the sides lower', () => {
    expect(hand[0]?.dropPixels).toBe(hand[4]?.dropPixels);
    expect(hand[1]?.dropPixels).toBe(hand[3]?.dropPixels);
    expect(hand[0]?.dropPixels).toBeGreaterThan(hand[1]?.dropPixels ?? 0);
    expect(hand[1]?.dropPixels).toBeGreaterThan(0);
  });

  it('stays symmetric with an even number of cards', () => {
    expect(fanPose(0, 4).rotateDegrees).toBe(-fanPose(3, 4).rotateDegrees);
    expect(fanPose(1, 4).dropPixels).toBe(fanPose(2, 4).dropPixels);
  });
});
