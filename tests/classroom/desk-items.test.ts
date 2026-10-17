import { describe, expect, it } from 'vitest';
import { ENEMY_FEET_Y } from '../../src/classroom/classroomLayout.ts';
import { placeFrame } from '../../src/classroom/integerScale.ts';
import {
  DESK_ITEMS,
  ENEMY_Z_INDEX,
  HELD_Z_INDEX,
  MIN_TOUCH_SIZE_CSS,
  baseOf,
  dropItem,
  grabZone,
  heldPlace,
  isOnFreeDesk,
  isThrow,
  leaveRide,
  moveItem,
  putBack,
  rectAt,
  releaseVelocity,
  restingZIndices,
  shadowRectAt,
  startingPlaces,
  visibleAreaOf,
  type FreeDesk,
  type VisibleArea,
} from '../../src/classroom/deskItems.ts';

// A phone of 9:16, 360 CSS pixels wide: it shows only the safe area, at 2
// CSS pixels per pixel of the art, and its bottom bar and hand start at the
// row 270.
const PHONE_9_16: VisibleArea = { left: 0, top: 0, right: 180, bottom: 320 };
const PHONE_ART_PIXEL = 2;
const PHONE_FREE_DESK: FreeDesk = { left: 0, right: 180, bottom: 270 };

// A PC that shows the whole drawing of 216x432 around the safe area.
const WHOLE_DRAWING: VisibleArea = { left: -18, top: -56, right: 198, bottom: 376 };
const WIDE_FREE_DESK: FreeDesk = { left: -18, right: 198, bottom: 270 };

describe('FR-VIS-010: the things on the desk (ticket 17)', () => {
  it('starts each combat with every item in its place of the drawing, the pen on the notebook', () => {
    const places = startingPlaces();
    expect(places.pencilCase).toEqual({ x: -29, y: 164, ridingOn: null });
    expect(places.waterBottle).toEqual({ x: 21, y: 160, ridingOn: null });
    expect(places.notebook).toEqual({ x: 170, y: 178, ridingOn: null });
    expect(places.pen).toEqual({ x: 180, y: 193, ridingOn: 'notebook' });
  });

  it('starts with every item lying on the desk', () => {
    for (const item of DESK_ITEMS) {
      expect(baseOf(item.id, item.rect), item.id).toBeGreaterThan(157);
    }
  });

  it('keeps the shadow as far from the item as in the drawing', () => {
    const shadow = shadowRectAt('waterBottle', { x: 50, y: 200 });
    expect(shadow).toEqual({ x: 51, y: 217, width: 9, height: 6 });
  });

  it('moves the pen with the notebook while it rides on it', () => {
    const places = moveItem(startingPlaces(), 'notebook', 120, 200);
    expect(places.notebook).toEqual({ x: 120, y: 200, ridingOn: null });
    expect(places.pen).toEqual({ x: 130, y: 215, ridingOn: 'notebook' });
  });

  it('does not move the notebook with the pen', () => {
    const places = moveItem(startingPlaces(), 'pen', 100, 230);
    expect(places.notebook).toEqual(startingPlaces().notebook);
  });

  it('no longer moves the pen with the notebook once the pen is picked up on its own', () => {
    const pickedUp = leaveRide(startingPlaces(), 'pen');
    const places = moveItem(pickedUp, 'notebook', 120, 200);
    expect(places.pen).toEqual({ x: 180, y: 193, ridingOn: null });
  });
});

describe('FR-VIS-010: letting go of an item', () => {
  it('leaves an item where it is let go on the free part of the desk', () => {
    const before = startingPlaces();
    const moved = moveItem(before, 'waterBottle', 80, 230);
    const dropped = dropItem(moved, 'waterBottle', PHONE_FREE_DESK, before);
    expect(dropped.waterBottle).toEqual({ x: 80, y: 230, ridingOn: null });
  });

  it('sends an item back where it was if it is let go over the bar or the hand', () => {
    const before = startingPlaces();
    const moved = moveItem(before, 'waterBottle', 80, 260);
    const dropped = dropItem(moved, 'waterBottle', PHONE_FREE_DESK, before);
    expect(dropped.waterBottle).toEqual(before.waterBottle);
  });

  it('sends an item back where it was if it is let go over the wall', () => {
    const before = startingPlaces();
    const moved = moveItem(before, 'waterBottle', 80, 120);
    const dropped = dropItem(moved, 'waterBottle', PHONE_FREE_DESK, before);
    expect(dropped.waterBottle).toEqual(before.waterBottle);
  });

  it('sends an item back where it was if part of it is off the screen', () => {
    const before = startingPlaces();
    const moved = moveItem(before, 'waterBottle', 176, 200);
    const dropped = dropItem(moved, 'waterBottle', PHONE_FREE_DESK, before);
    expect(dropped.waterBottle).toEqual(before.waterBottle);
  });

  it('sends the notebook back with the pen on it', () => {
    const before = startingPlaces();
    const moved = moveItem(before, 'notebook', 60, 280);
    const dropped = dropItem(moved, 'notebook', PHONE_FREE_DESK, before);
    expect(dropped.notebook).toEqual(before.notebook);
    expect(dropped.pen).toEqual(before.pen);
  });

  it('puts the pen back on the notebook if it is let go on it', () => {
    const before = startingPlaces();
    const notebookOut = dropItem(moveItem(before, 'notebook', 100, 200), 'notebook', PHONE_FREE_DESK, before);
    const penOff = dropItem(moveItem(leaveRide(notebookOut, 'pen'), 'pen', 40, 230), 'pen', PHONE_FREE_DESK, notebookOut);
    expect(penOff.pen.ridingOn).toBeNull();

    const penOn = dropItem(moveItem(leaveRide(penOff, 'pen'), 'pen', 105, 210), 'pen', PHONE_FREE_DESK, penOff);
    expect(penOn.pen).toEqual({ x: 105, y: 210, ridingOn: 'notebook' });
  });

  it('puts the pen back on the notebook if it goes back to where it rode on it', () => {
    const before = startingPlaces();
    const pickedUp = leaveRide(before, 'pen');
    const dropped = dropItem(moveItem(pickedUp, 'pen', 40, 300), 'pen', WIDE_FREE_DESK, before);
    expect(dropped.pen).toEqual(before.pen);
  });

  it('puts an item back where it was, with what rides on it, riding on what it rode on', () => {
    const before = startingPlaces();
    const thrown = moveItem(leaveRide(before, 'pen'), 'pen', 90, 120);
    expect(putBack(thrown, 'pen', before).pen).toEqual(before.pen);

    const notebookThrown = moveItem(before, 'notebook', 90, 120);
    const notebookBack = putBack(notebookThrown, 'notebook', before);
    expect(notebookBack.notebook).toEqual(before.notebook);
    expect(notebookBack.pen).toEqual(before.pen);
  });

  it('takes an item to lie on the desk when its bottom row is on the back edge of the desk', () => {
    expect(isOnFreeDesk({ x: 10, y: 136, width: 7, height: 22 }, PHONE_FREE_DESK)).toBe(true);
    expect(isOnFreeDesk({ x: 10, y: 135, width: 7, height: 22 }, PHONE_FREE_DESK)).toBe(false);
  });

  it('lets an item lie in the margin of a wide screen, where it is seen', () => {
    expect(isOnFreeDesk({ x: -18, y: 180, width: 7, height: 22 }, WIDE_FREE_DESK)).toBe(true);
    expect(isOnFreeDesk({ x: -18, y: 180, width: 7, height: 22 }, PHONE_FREE_DESK)).toBe(false);
  });
});

describe('FR-VIS-010: in front of or behind the enemy', () => {
  it('draws an item in front of the enemy when its base is further down than the feet', () => {
    const places = moveItem(startingPlaces(), 'waterBottle', 80, ENEMY_FEET_Y - 22 + 1);
    expect(restingZIndices(places).waterBottle).toBeGreaterThan(ENEMY_Z_INDEX);
  });

  it('draws an item behind the enemy when its base is on the line of the feet or above it', () => {
    const places = moveItem(startingPlaces(), 'waterBottle', 80, ENEMY_FEET_Y - 22);
    expect(restingZIndices(places).waterBottle).toBeLessThan(ENEMY_Z_INDEX);
  });

  it('draws the pen right over the notebook it rides on', () => {
    const zIndices = restingZIndices(startingPlaces());
    expect(zIndices.pen).toBe(zIndices.notebook + 1);
  });

  it('draws the nearer item over the farther one', () => {
    const places = moveItem(moveItem(startingPlaces(), 'waterBottle', 60, 200), 'pencilCase', 40, 200);
    const zIndices = restingZIndices(places);
    expect(zIndices.pencilCase).toBeGreaterThan(zIndices.waterBottle);
  });

  it('draws every item that lies on the desk under the held items', () => {
    const places = moveItem(startingPlaces(), 'notebook', 100, 230);
    for (const zIndex of Object.values(restingZIndices(places))) {
      expect(zIndex).toBeLessThan(HELD_Z_INDEX);
    }
  });
});

describe('FR-VIS-010: the part of the classroom that the screen shows', () => {
  it('is only the safe area on a phone of 9:16', () => {
    expect(visibleAreaOf(placeFrame(360, 640, 3))).toEqual(PHONE_9_16);
  });

  it('is the whole drawing on a PC', () => {
    expect(visibleAreaOf(placeFrame(1440, 900, 1))).toEqual(WHOLE_DRAWING);
  });

  it('reaches into the margin below the safe area on a long phone', () => {
    const visible = visibleAreaOf(placeFrame(393, 852, 3));
    expect(visible.left).toBeLessThanOrEqual(0);
    expect(visible.right).toBeGreaterThanOrEqual(180);
    expect(visible.bottom).toBeGreaterThan(320);
  });
});

describe('NFR-USA-002: the zone where an item is picked up', () => {
  const minimumSize = MIN_TOUCH_SIZE_CSS / PHONE_ART_PIXEL;

  it('is at least 44x44 CSS pixels even when only a sliver of the item is seen', () => {
    const zone = grabZone(rectAt('notebook', startingPlaces().notebook), PHONE_9_16, PHONE_ART_PIXEL);
    expect(zone).not.toBeNull();
    expect(zone?.width).toBeGreaterThanOrEqual(minimumSize);
    expect(zone?.height).toBeGreaterThanOrEqual(minimumSize);
  });

  it('grows towards the center of the screen and stays on it', () => {
    const notebook = grabZone(rectAt('notebook', startingPlaces().notebook), PHONE_9_16, PHONE_ART_PIXEL);
    expect(notebook).toEqual({ x: 180 - minimumSize, y: 178, width: minimumSize, height: 36 });

    const pencilCase = grabZone(rectAt('pencilCase', startingPlaces().pencilCase), PHONE_9_16, PHONE_ART_PIXEL);
    expect(pencilCase).toEqual({ x: 0, y: 164, width: minimumSize, height: 31 });
  });

  it('grows evenly around a small item in the middle of the screen', () => {
    const zone = grabZone({ x: 80, y: 200, width: 7, height: 22 }, PHONE_9_16, PHONE_ART_PIXEL);
    expect(zone).toEqual({ x: 80 - 7.5, y: 200, width: minimumSize, height: 22 });
  });

  it('covers only the part of the item that is seen when it is big enough', () => {
    const zone = grabZone(rectAt('pencilCase', startingPlaces().pencilCase), WHOLE_DRAWING, 3);
    expect(zone).toEqual({ x: -18, y: 164, width: 33, height: 31 });
  });

  it('has no zone for an item that the screen does not show', () => {
    expect(grabZone(rectAt('pen', startingPlaces().pen), PHONE_9_16, PHONE_ART_PIXEL)).toBeNull();
  });
});

describe('FR-VIS-010: moving and throwing', () => {
  it('follows the finger in whole pixels of the art', () => {
    expect(heldPlace({ x: 20, y: 160 }, { x: 7, y: -4 }, 2)).toEqual({ x: 24, y: 158 });
    expect(heldPlace({ x: 20, y: 160 }, { x: 0.9, y: 0 }, 2)).toEqual({ x: 20, y: 160 });
  });

  it('measures the speed of the finger over its last moments', () => {
    const velocity = releaseVelocity([
      { x: 0, y: 100, timeMs: 0 },
      { x: 0, y: 90, timeMs: 50 },
      { x: 0, y: 80, timeMs: 100 },
      { x: 10, y: 40, timeMs: 150 },
    ]);
    expect(velocity).toEqual({ x: 0.2, y: -0.8 });
  });

  it('does not take a finger that stopped before letting go to be moving', () => {
    const velocity = releaseVelocity([
      { x: 0, y: 200, timeMs: 0 },
      { x: 0, y: 100, timeMs: 60 },
      { x: 0, y: 100, timeMs: 200 },
    ]);
    expect(velocity).toEqual({ x: 0, y: 0 });
  });

  it('throws an item let go with a quick move upwards', () => {
    expect(isThrow({ x: 0, y: -0.8 })).toBe(true);
    expect(isThrow({ x: 0.6, y: -0.6 })).toBe(true);
  });

  it('does not throw an item let go slowly, sideways or downwards', () => {
    expect(isThrow({ x: 0, y: -0.5 })).toBe(false);
    expect(isThrow({ x: 1.2, y: -0.3 })).toBe(false);
    expect(isThrow({ x: 0, y: 1.5 })).toBe(false);
  });
});
