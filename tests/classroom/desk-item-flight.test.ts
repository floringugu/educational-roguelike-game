import { describe, expect, it } from 'vitest';
import { stepKeyframes } from '../../src/classroom/camera.ts';
import { ENEMY_FEET_Y, type ArtRect } from '../../src/classroom/classroomLayout.ts';
import { spinPivot, throwFlight, wouldHitEnemy, type ThrowSetup } from '../../src/classroom/deskItemFlight.ts';
import { DESK_BACK_EDGE_Y, isInFrontOfEnemy, isOnFreeDesk, type FreeDesk } from '../../src/classroom/deskItems.ts';

// The enemy as a thrown item sees it: its head and its body.
const ENEMY: ArtRect[] = [
  { x: 47, y: 96, width: 86, height: 44 },
  { x: 59, y: 140, width: 63, height: 28 },
];

// A phone of 9:16, whose bar and hand start at the row 270.
const FREE_DESK: FreeDesk = { left: 0, right: 180, bottom: 270 };

// The water bottle, held in front of the enemy.
const BOTTLE: ArtRect = { x: 80, y: 198, width: 7, height: 22 };

function setup(overrides: Partial<ThrowSetup>): ThrowSetup {
  return { rect: BOTTLE, velocity: { x: 0, y: -0.5 }, enemyHitArea: ENEMY, freeDesk: FREE_DESK, ...overrides };
}

const THROWS: Array<[string, ThrowSetup]> = [
  ['a throw at the enemy', setup({})],
  ['a slanted throw at the enemy', setup({ velocity: { x: 0.3, y: -0.6 } })],
  ['a throw beside the enemy', setup({ rect: { ...BOTTLE, x: 160 } })],
  ['a throw with no enemy standing', setup({ enemyHitArea: null })],
  ['a throw to the side', setup({ rect: { ...BOTTLE, x: 20 }, velocity: { x: -1, y: -0.6 } })],
  ['a quick throw of the notebook', setup({ rect: { x: 120, y: 200, width: 38, height: 36 }, velocity: { x: 0, y: -3 } })],
];

describe('FR-VIS-010: the flight of a thrown item (ticket 17)', () => {
  it('hits the enemy when it flies into it, and falls in front of its feet', () => {
    const flight = throwFlight(setup({}));
    expect(flight.hitsEnemy).toBe(true);
    const base = flight.landing.y + BOTTLE.height;
    expect(base).toBeGreaterThan(ENEMY_FEET_Y);
    expect(isInFrontOfEnemy(base)).toBe(true);
  });

  it('hits the wall when it flies beside the enemy, and falls onto the back edge of the desk', () => {
    const flight = throwFlight(setup({ rect: { ...BOTTLE, x: 160 } }));
    expect(flight.hitsEnemy).toBe(false);
    expect(flight.landing.y + BOTTLE.height).toBe(DESK_BACK_EDGE_Y + 1);
  });

  it('flies past the enemy when no enemy is standing', () => {
    const flight = throwFlight(setup({ enemyHitArea: null }));
    expect(flight.hitsEnemy).toBe(false);
    expect(isInFrontOfEnemy(flight.landing.y + BOTTLE.height)).toBe(false);
  });

  it('bounces back off the enemy, away from where it came', () => {
    const flight = throwFlight(setup({ velocity: { x: 0.3, y: -0.6 } }));
    expect(flight.hitsEnemy).toBe(true);
    const hitX = flight.move.offsetAt(flight.hitMs).x + flight.landing.x;
    expect(flight.landing.x).toBeLessThan(hitX);
  });

  it('hits the edge of the screen before the wall when it is thrown to the side', () => {
    const flight = throwFlight(setup({ rect: { ...BOTTLE, x: 20 }, velocity: { x: -1, y: -0.6 } }));
    expect(flight.landing.x).toBe(FREE_DESK.left);
    expect(flight.landing.y).toBeGreaterThan(100);
  });

  it.each(THROWS)('lands on the free part of the desk after %s', (_name, throwSetup) => {
    const flight = throwFlight(throwSetup);
    const { width, height } = throwSetup.rect;
    expect(Number.isInteger(flight.landing.x) && Number.isInteger(flight.landing.y)).toBe(true);
    expect(isOnFreeDesk({ ...flight.landing, width, height }, throwSetup.freeDesk)).toBe(true);
  });

  it('lands above the bar and the hand even when they leave little desk', () => {
    const flight = throwFlight(setup({ freeDesk: { left: 0, right: 180, bottom: 200 } }));
    expect(flight.landing.y + BOTTLE.height).toBeLessThanOrEqual(200);
  });

  it.each(THROWS)('starts where it is let go and ends at the landing in %s', (_name, throwSetup) => {
    const { move, landing } = throwFlight(throwSetup);
    const start = move.offsetAt(0);
    expect(start.x + landing.x).toBeCloseTo(throwSetup.rect.x);
    expect(start.y + landing.y).toBeCloseTo(throwSetup.rect.y);
    expect(move.offsetAt(move.durationMs)).toEqual({ x: 0, y: 0 });
  });

  it.each(THROWS)('flies in whole pixels of the art in %s (ADR-0017)', (_name, throwSetup) => {
    const { move } = throwFlight(throwSetup);
    for (const keyframe of stepKeyframes(move, 1, 2)) {
      const match = /^translate\((-?[\d.]+)px, (-?[\d.]+)px\)$/.exec(keyframe.transform);
      expect(match, keyframe.transform).not.toBeNull();
      // One pixel of the art is 2 CSS pixels here.
      expect(Number.isInteger(Number(match?.[1]) / 2)).toBe(true);
      expect(Number.isInteger(Number(match?.[2]) / 2)).toBe(true);
    }
  });

  it.each(THROWS)('hits during the flight and lasts less than a second in %s', (_name, throwSetup) => {
    const { hitMs, move } = throwFlight(throwSetup);
    expect(hitMs).toBeGreaterThanOrEqual(0);
    expect(hitMs).toBeLessThanOrEqual(move.durationMs);
    expect(move.durationMs).toBeLessThan(1000);
  });

  it('says whether a throw would hit the enemy, for a classroom that keeps still', () => {
    expect(wouldHitEnemy(setup({}))).toBe(true);
    expect(wouldHitEnemy(setup({ rect: { ...BOTTLE, x: 160 } }))).toBe(false);
  });
});

describe('FR-VIS-010: the spin of a thrown item', () => {
  it('turns in quarter turns and ends without a turn', () => {
    const { spinKeyframes } = throwFlight(setup({}));
    expect(spinKeyframes.length).toBeGreaterThan(2);
    for (const keyframe of spinKeyframes) {
      const match = /^rotate\((-?\d+)deg\)$/.exec(keyframe.transform);
      expect(match, keyframe.transform).not.toBeNull();
      expect(Number.isInteger(Number(match?.[1]) / 90)).toBe(true);
    }
    expect(spinKeyframes.at(-1)).toEqual({ offset: 1, transform: 'rotate(0deg)' });
  });

  it('turns to the right when thrown to the right, and to the left otherwise', () => {
    const right = throwFlight(setup({ velocity: { x: 0.3, y: -0.6 } })).spinKeyframes;
    const left = throwFlight(setup({ velocity: { x: -0.3, y: -0.6 } })).spinKeyframes;
    expect(right[1]?.transform).toBe('rotate(90deg)');
    expect(left[1]?.transform).toBe('rotate(-90deg)');
  });

  // A quarter turn keeps the pixels of the art on the grid only around a
  // corner or the center of a pixel.
  it('turns around a corner or the center of a pixel', () => {
    expect(spinPivot(38, 36)).toEqual({ x: 19, y: 18 });
    expect(spinPivot(7, 21)).toEqual({ x: 3.5, y: 10.5 });
    expect(spinPivot(7, 22)).toEqual({ x: 3.5, y: 10.5 });
    expect(spinPivot(17, 6)).toEqual({ x: 8.5, y: 2.5 });
  });
});
