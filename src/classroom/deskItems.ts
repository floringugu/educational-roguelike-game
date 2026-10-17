import { type ArtRect, type ClassroomSpriteId, ENEMY_FEET_Y } from './classroomLayout';
import { CLASSROOM_MARGIN_X, CLASSROOM_MARGIN_Y, type FramePlacement } from './integerScale';

// The things on the green desk that the player can pick up, move and throw
// at the enemy (FR-VIS-010, ticket 17). They are only decoration: nothing
// they do changes the combat (P1).
//
// This file has no browser code, so its rules can be tested in Node.
// DeskItems.tsx draws the items and follows the finger with them.

export type DeskItemId = 'pencilCase' | 'waterBottle' | 'notebook' | 'pen';

export type DeskItem = {
  id: DeskItemId;
  sprite: ClassroomSpriteId;
  // Where it lies at the start of each combat, as in the drawing, in pixels
  // of the art from the top left corner of the safe area (classroomLayout.ts).
  rect: ArtRect;
  // Its shadow on the desk, a sprite of its own, so the item can be lifted
  // and moved without it (art guide §4).
  shadow: ClassroomSpriteId;
  shadowRect: ArtRect;
  // The item it lies on at the start, if any: the pen lies on the notebook.
  ridesOn?: DeskItemId;
  // The shadow it casts on the item it lies on, which is lighter than the
  // desk. It has the place of `shadowRect`.
  shadowOnRide?: ClassroomSpriteId;
};

// In the order they are drawn: an item that rides on another one comes
// after it, so it is drawn on top.
export const DESK_ITEMS: ReadonlyArray<DeskItem> = [
  // At the left corner. Most of it is out of the safe area: a phone of 9:16
  // shows only its right third.
  {
    id: 'pencilCase',
    sprite: 'classroom-pencil-case',
    rect: { x: -29, y: 164, width: 44, height: 31 },
    shadow: 'classroom-pencil-case-shadow',
    shadowRect: { x: -29, y: 166, width: 46, height: 31 },
  },
  // Next to the pencil case.
  {
    id: 'waterBottle',
    sprite: 'classroom-water-bottle',
    rect: { x: 21, y: 160, width: 7, height: 22 },
    shadow: 'classroom-water-bottle-shadow',
    shadowRect: { x: 22, y: 177, width: 9, height: 6 },
  },
  // At the right corner: a phone of 9:16 shows a strip of 10 pixels of it.
  {
    id: 'notebook',
    sprite: 'classroom-notebook',
    rect: { x: 170, y: 178, width: 38, height: 36 },
    shadow: 'classroom-notebook-shadow',
    shadowRect: { x: 173, y: 185, width: 36, height: 31 },
  },
  // On the notebook, out of the safe area: a phone of 9:16 does not show it
  // until the notebook is pulled out.
  {
    id: 'pen',
    sprite: 'classroom-pen',
    rect: { x: 180, y: 193, width: 17, height: 6 },
    shadow: 'classroom-pen-shadow',
    shadowRect: { x: 183, y: 195, width: 14, height: 5 },
    ridesOn: 'notebook',
    shadowOnRide: 'classroom-pen-shadow-paper',
  },
];

export function deskItemById(id: DeskItemId): DeskItem {
  const item = DESK_ITEMS.find((candidate) => candidate.id === id);
  if (item === undefined) {
    throw new Error(`Unknown desk item: ${id}`);
  }
  return item;
}

// The first row of the green desk, at its back edge, in the safe area. An
// item lies on the desk when its bottom row is on this row or below it.
export const DESK_BACK_EDGE_Y = 157;

// How far a held item rises above the desk, in pixels of the art. Its
// shadow stays down on the desk.
export const HELD_LIFT = 2;

// Where an item lies: the top left corner of its sprite, in whole pixels of
// the art, and the item it rides on, if any. An item that rides on another
// one moves with it.
export type DeskItemPlace = {
  x: number;
  y: number;
  ridingOn: DeskItemId | null;
};

export type DeskItemPlaces = Record<DeskItemId, DeskItemPlace>;

// The places at the start of each combat: those of the drawing.
export function startingPlaces(): DeskItemPlaces {
  const places = {} as DeskItemPlaces;
  for (const item of DESK_ITEMS) {
    places[item.id] = { x: item.rect.x, y: item.rect.y, ridingOn: item.ridesOn ?? null };
  }
  return places;
}

// The rectangle that an item covers at a place.
export function rectAt(id: DeskItemId, place: { x: number; y: number }): ArtRect {
  const { width, height } = deskItemById(id).rect;
  return { x: place.x, y: place.y, width, height };
}

// Where the shadow of an item goes when the item is at a place: as far from
// it as in the drawing.
export function shadowRectAt(id: DeskItemId, place: { x: number; y: number }): ArtRect {
  const item = deskItemById(id);
  return {
    x: place.x + item.shadowRect.x - item.rect.x,
    y: place.y + item.shadowRect.y - item.rect.y,
    width: item.shadowRect.width,
    height: item.shadowRect.height,
  };
}

// The line under the bottom row of an item: the place where it touches the
// desk. The enemy stands on the line ENEMY_FEET_Y in the same way.
export function baseOf(id: DeskItemId, place: { x: number; y: number }): number {
  return place.y + deskItemById(id).rect.height;
}

// The items that ride on an item.
export function ridersOf(places: DeskItemPlaces, carrierId: DeskItemId): DeskItemId[] {
  return DESK_ITEMS.filter((item) => places[item.id].ridingOn === carrierId).map((item) => item.id);
}

// Moves an item to a new place, and the items that ride on it by as much.
export function moveItem(places: DeskItemPlaces, id: DeskItemId, x: number, y: number): DeskItemPlaces {
  const dx = x - places[id].x;
  const dy = y - places[id].y;
  const moved = { ...places, [id]: { ...places[id], x, y } };
  for (const riderId of ridersOf(places, id)) {
    moved[riderId] = { ...places[riderId], x: places[riderId].x + dx, y: places[riderId].y + dy };
  }
  return moved;
}

// The part of the green desk where an item can be left, in pixels of the
// art: between the left and right edges of the screen, and from the back
// edge of the desk down to the top of the bottom bar or of the hand,
// whichever is higher. DeskItems.tsx measures it, because it depends on the
// screen.
export type FreeDesk = {
  left: number;
  right: number;
  bottom: number;
};

// Whether an item at a place lies on the free part of the desk: all of it
// on the screen, and its bottom row on the desk, above the bar and the hand.
// Its top can stand out over the wall, as at the back edge of the desk.
export function isOnFreeDesk(rect: ArtRect, freeDesk: FreeDesk): boolean {
  const base = rect.y + rect.height;
  return (
    rect.x >= freeDesk.left &&
    rect.x + rect.width <= freeDesk.right &&
    base > DESK_BACK_EDGE_Y &&
    base <= freeDesk.bottom
  );
}

function isInside(inner: ArtRect, outer: ArtRect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

// Lets go of an item at a place.
// - An item that can ride on another one (the pen on the notebook) rides on
//   it again if it is let go all inside it.
// - Otherwise it stays where it is let go if that is on the free desk.
// - If not, it jumps back to where it was before it was picked up (putBack).
export function dropItem(
  places: DeskItemPlaces,
  id: DeskItemId,
  freeDesk: FreeDesk,
  placesBeforePickUp: DeskItemPlaces,
): DeskItemPlaces {
  const place = places[id];
  const rect = rectAt(id, place);
  const carrierId = deskItemById(id).ridesOn;
  if (carrierId !== undefined && isInside(rect, rectAt(carrierId, places[carrierId]))) {
    return { ...places, [id]: { ...place, ridingOn: carrierId } };
  }
  if (isOnFreeDesk(rect, freeDesk)) {
    return { ...places, [id]: { ...place, ridingOn: null } };
  }
  return putBack(places, id, placesBeforePickUp);
}

// Puts an item back where it was before it was picked up, which
// `placesBeforePickUp` remembers, riding on what it rode on then. The items
// riding on it come back with it. A throw that hits the enemy while the
// classroom keeps still does this too (DeskItems.tsx).
export function putBack(places: DeskItemPlaces, id: DeskItemId, placesBeforePickUp: DeskItemPlaces): DeskItemPlaces {
  const before = placesBeforePickUp[id];
  const movedBack = moveItem(places, id, before.x, before.y);
  return { ...movedBack, [id]: { ...movedBack[id], ridingOn: before.ridingOn } };
}

// Lets go of the item it rides on, if any: an item that is picked up or
// thrown on its own no longer rides on anything.
export function leaveRide(places: DeskItemPlaces, id: DeskItemId): DeskItemPlaces {
  return { ...places, [id]: { ...places[id], ridingOn: null } };
}

// Where an item is drawn when it lies on the desk. The enemy stands at
// z-index 10 (EnemyView.css): an item whose base is further down than the
// feet of the enemy is nearer, and is drawn in front of it; otherwise it is
// behind. Among the items, the nearer one is drawn over the farther one, and
// an item that rides on another one is drawn right over it.
// A held or flying item, and what rides on it, goes over the enemy but under
// its intent (z-index 30, EnemyView.css), which counts as interface.
export const ENEMY_Z_INDEX = 10;
export const HELD_Z_INDEX = 20;

export function isInFrontOfEnemy(base: number): boolean {
  return base > ENEMY_FEET_Y;
}

export function restingZIndices(places: DeskItemPlaces): Record<DeskItemId, number> {
  // An item that rides on another one goes by the base of the one it rides
  // on, right after it.
  function sortKey(id: DeskItemId): [number, number] {
    const carrierId = places[id].ridingOn;
    if (carrierId !== null) {
      return [baseOf(carrierId, places[carrierId]), 1];
    }
    return [baseOf(id, places[id]), 0];
  }
  const sorted = DESK_ITEMS.map((item) => item.id).sort((a, b) => {
    const [baseA, riderA] = sortKey(a);
    const [baseB, riderB] = sortKey(b);
    return baseA - baseB || riderA - riderB;
  });

  const zIndices = {} as Record<DeskItemId, number>;
  let behind = 1;
  let inFront = ENEMY_Z_INDEX + 1;
  for (const id of sorted) {
    const [base] = sortKey(id);
    if (isInFrontOfEnemy(base)) {
      zIndices[id] = inFront;
      inFront += 1;
    } else {
      zIndices[id] = behind;
      behind += 1;
    }
  }
  return zIndices;
}

// The part of the classroom that the screen shows, in pixels of the art
// from the top left corner of the safe area. Every screen shows the whole
// safe area, and some show part of the margin around it (ADR-0015).
export type VisibleArea = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

// The visible area of a placement of the game frame (integerScale.ts): the
// frame shows the classroom from its corner, which is 0 or less, and the
// safe area starts CLASSROOM_MARGIN_X and CLASSROOM_MARGIN_Y further in.
export function visibleAreaOf(placement: FramePlacement): VisibleArea {
  const left = -placement.classroomLeft / placement.artPixel - CLASSROOM_MARGIN_X;
  const top = -placement.classroomTop / placement.artPixel - CLASSROOM_MARGIN_Y;
  return {
    left,
    top,
    right: left + placement.width / placement.artPixel,
    bottom: top + placement.height / placement.artPixel,
  };
}

// The smallest zone that a finger can touch with ease, in CSS pixels
// (NFR-USA-002).
export const MIN_TOUCH_SIZE_CSS = 44;

// The zone where an item is picked up, in pixels of the art: the part of it
// that the screen shows, grown to MIN_TOUCH_SIZE_CSS at least, also when
// only a sliver of it shows (NFR-USA-002). It grows evenly around that part,
// and is then pushed towards the center of the screen until it is all on
// it. An item that the screen does not show at all has no zone.
export function grabZone(rect: ArtRect, visible: VisibleArea, artPixel: number): ArtRect | null {
  const minimumSize = MIN_TOUCH_SIZE_CSS / artPixel;
  const horizontal = growInside(rect.x, rect.x + rect.width, visible.left, visible.right, minimumSize);
  const vertical = growInside(rect.y, rect.y + rect.height, visible.top, visible.bottom, minimumSize);
  if (horizontal === null || vertical === null) {
    return null;
  }
  return {
    x: horizontal.start,
    y: vertical.start,
    width: horizontal.end - horizontal.start,
    height: vertical.end - vertical.start,
  };
}

// The same along one side: from `start` to `end`, of which the screen shows
// from `visibleStart` to `visibleEnd`.
function growInside(
  start: number,
  end: number,
  visibleStart: number,
  visibleEnd: number,
  minimumSize: number,
): { start: number; end: number } | null {
  const shownStart = Math.max(start, visibleStart);
  const shownEnd = Math.min(end, visibleEnd);
  if (shownEnd <= shownStart) {
    return null;
  }
  const growth = Math.max(minimumSize - (shownEnd - shownStart), 0);
  let zoneStart = shownStart - growth / 2;
  let zoneEnd = shownEnd + growth / 2;
  if (zoneStart < visibleStart) {
    zoneEnd += visibleStart - zoneStart;
    zoneStart = visibleStart;
  }
  if (zoneEnd > visibleEnd) {
    zoneStart -= zoneEnd - visibleEnd;
    zoneEnd = visibleEnd;
  }
  return { start: zoneStart, end: zoneEnd };
}

// Where a held item goes when the finger has moved from where it picked it
// up: as far as the finger, in whole pixels of the art, so it never falls
// between two pixels and blurs (ADR-0014).
export function heldPlace(
  placeAtPickUp: { x: number; y: number },
  fingerMovedCss: { x: number; y: number },
  artPixel: number,
): { x: number; y: number } {
  return {
    x: placeAtPickUp.x + Math.round(fingerMovedCss.x / artPixel),
    y: placeAtPickUp.y + Math.round(fingerMovedCss.y / artPixel),
  };
}

// Throwing: letting go of an item with a quick move upwards (prov.), in CSS
// pixels per millisecond. "Upwards" is within 60 degrees of straight up: the
// part of the speed that goes up is at least half of it.
export const THROW_MIN_SPEED_CSS_PER_MS = 0.8;

export type PointerSample = { x: number; y: number; timeMs: number };
export type Velocity = { x: number; y: number };

// The speed of the finger when it lets go is measured over its last
// moments, so a stop right before letting go is not a throw.
const VELOCITY_WINDOW_MS = 80;

// The speed of the finger over its last VELOCITY_WINDOW_MS, from the samples
// of its moves, the oldest first. The last sample is where it let go.
export function releaseVelocity(samples: ReadonlyArray<PointerSample>): Velocity {
  const last = samples.at(-1);
  if (last === undefined) {
    return { x: 0, y: 0 };
  }
  const first = samples.find((sample) => last.timeMs - sample.timeMs <= VELOCITY_WINDOW_MS) ?? last;
  const elapsedMs = last.timeMs - first.timeMs;
  if (elapsedMs <= 0) {
    return { x: 0, y: 0 };
  }
  return { x: (last.x - first.x) / elapsedMs, y: (last.y - first.y) / elapsedMs };
}

export function isThrow(velocity: Velocity): boolean {
  const speed = Math.hypot(velocity.x, velocity.y);
  const upwardSpeed = -velocity.y;
  return speed >= THROW_MIN_SPEED_CSS_PER_MS && upwardSpeed >= speed / 2;
}
