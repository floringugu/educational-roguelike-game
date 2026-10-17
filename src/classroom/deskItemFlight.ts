import { type CameraKeyframe, type CameraMove } from './camera';
import { type ArtRect, ENEMY_FEET_Y } from './classroomLayout';
import { DESK_BACK_EDGE_Y, type FreeDesk, type Velocity } from './deskItems';

// The flight of a thrown item of the desk (FR-VIS-010, ticket 17). It flies
// in a straight line the way it was thrown. If it meets the enemy, it hits
// it, bounces off and falls onto the desk in front of its feet. If not, it
// hits the wall or the chalkboard behind and falls onto the back edge of the
// desk, behind the enemy. On its way it spins in quarter turns.
//
// The flight is a camera move (camera.ts), so it plays in whole pixels of
// the art with the keyframes of the camera (ADR-0017). This file has no
// browser code, so it can be tested in Node.

// How fast the item flies, in pixels of the art per millisecond: as fast as
// the finger that threw it, within these limits, so a slow throw still gets
// there and a very quick one can still be seen.
const MIN_FLIGHT_SPEED = 0.35;
const MAX_FLIGHT_SPEED = 0.8;

// The height at which a thrown item hits the wall or the chalkboard, if it
// does not meet the enemy first: the row of its center. The chalkboard goes
// down to the row 103.
const WALL_HIT_Y = 100;

// After hitting, it falls, faster and faster: pixels of the art per
// millisecond, per millisecond.
const GRAVITY = 0.0018;

// An item that hits the enemy bounces back up a little, and away from the
// enemy, at this part of the speed it had.
const BOUNCE_UP_SPEED = 0.12;
const BOUNCE_BACK_PART = 0.3;

// It falls onto the desk in front of the feet of the enemy, with its base a
// few rows further down than them.
const LANDING_IN_FRONT_OF_ENEMY = ENEMY_FEET_Y + 6;

// One quarter turn every this many milliseconds.
const QUARTER_TURN_MS = 60;

export type ThrowSetup = {
  // Where the item is when it is let go: its place, lifted as it is held.
  rect: ArtRect;
  // The speed of the finger when it let go, in pixels of the art per
  // millisecond.
  velocity: Velocity;
  // The parts of the enemy that a thrown item can hit, or null if there is
  // no enemy standing: falling, defeated or not yet landed.
  enemyHitArea: ReadonlyArray<ArtRect> | null;
  // Where the item can come down.
  freeDesk: FreeDesk;
};

export type DeskItemFlight = {
  // The place where it ends, in whole pixels of the art.
  landing: { x: number; y: number };
  // The flight, as offsets from the landing: it ends there, at { x: 0, y: 0 }.
  move: CameraMove;
  // When it hits the enemy or the wall, from the start of the flight.
  hitMs: number;
  hitsEnemy: boolean;
  // The quarter turns, as keyframes of `transform`, which play over the
  // whole flight and end without a turn.
  spinKeyframes: CameraKeyframe[];
};

type Point = { x: number; y: number };

// How far the center of the item goes along `direction` before it enters a
// rectangle, or null if it never does. It is 0 if it already starts inside.
// For each side, the distances at which the line enters and leaves the band
// between the two edges; the line is inside the rectangle where it is inside
// both bands.
function distanceToRect(start: Point, direction: Point, rect: ArtRect): number | null {
  let enter = 0;
  let leave = Infinity;
  const sides: Array<[number, number, number, number]> = [
    [start.x, direction.x, rect.x, rect.x + rect.width],
    [start.y, direction.y, rect.y, rect.y + rect.height],
  ];
  for (const [from, step, low, high] of sides) {
    if (step === 0) {
      if (from < low || from > high) {
        return null;
      }
      continue;
    }
    const atLow = (low - from) / step;
    const atHigh = (high - from) / step;
    enter = Math.max(enter, Math.min(atLow, atHigh));
    leave = Math.min(leave, Math.max(atLow, atHigh));
  }
  return enter <= leave ? enter : null;
}

// How far the center goes before it hits the wall: when it rises to the row
// WALL_HIT_Y, or before that, when the item reaches the left or right edge
// of the screen. It is 0 if it is already there.
function distanceToWall(start: Point, direction: Point, rect: ArtRect, freeDesk: FreeDesk): number {
  let distance = direction.y < 0 ? (start.y - WALL_HIT_Y) / -direction.y : Infinity;
  const leftmostCenter = freeDesk.left + rect.width / 2;
  const rightmostCenter = freeDesk.right - rect.width / 2;
  if (direction.x < 0) {
    distance = Math.min(distance, (start.x - leftmostCenter) / -direction.x);
  } else if (direction.x > 0) {
    distance = Math.min(distance, (rightmostCenter - start.x) / direction.x);
  }
  // Only a throw upwards gets here (isThrow), but an item thrown straight
  // down would never meet the wall: it hits it at once instead.
  return Number.isFinite(distance) ? Math.max(distance, 0) : 0;
}

// The time it takes to fall from `fromY` to `toY` (further down), starting
// at `startSpeedY` (negative is up).
function fallTime(fromY: number, toY: number, startSpeedY: number): number {
  const drop = Math.max(toY - fromY, 0);
  return (-startSpeedY + Math.sqrt(startSpeedY ** 2 + 2 * GRAVITY * drop)) / GRAVITY;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

// The quarter turns of a flight. A turn to the right when it flies to the
// right, and to the left otherwise.
function spinKeyframes(durationMs: number, turnsRight: boolean): CameraKeyframe[] {
  const keyframes: CameraKeyframe[] = [];
  const sign = turnsRight ? 1 : -1;
  for (let turn = 0; turn * QUARTER_TURN_MS < durationMs; turn += 1) {
    const degrees = (sign * 90 * turn) % 360;
    // Adding 0 turns -0 into 0, so the transform never says "-0deg".
    keyframes.push({
      offset: (turn * QUARTER_TURN_MS) / durationMs,
      transform: `rotate(${degrees + 0}deg)`,
      easing: 'steps(1, end)',
    });
  }
  keyframes.push({ offset: 1, transform: 'rotate(0deg)' });
  return keyframes;
}

// The point around which an item turns. A quarter turn around it keeps every
// pixel of the art on the grid of the art only if it is a corner of a pixel
// or the center of a pixel: both of its coordinates whole, or both a half.
// The center of the sprite is used when it is one of those, and otherwise
// the center of the pixel half a pixel above it.
export function spinPivot(width: number, height: number): Point {
  const x = width / 2;
  const isSameKind = (width + height) % 2 === 0;
  return { x, y: isSameKind ? height / 2 : height / 2 - 0.5 };
}

export function throwFlight({ rect, velocity, enemyHitArea, freeDesk }: ThrowSetup): DeskItemFlight {
  const speed = Math.hypot(velocity.x, velocity.y);
  const direction = speed === 0 ? { x: 0, y: -1 } : { x: velocity.x / speed, y: velocity.y / speed };
  const flightSpeed = clamp(speed, MIN_FLIGHT_SPEED, MAX_FLIGHT_SPEED);
  const start = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

  // Where it hits: the enemy, if it meets it before the wall.
  const toWall = distanceToWall(start, direction, rect, freeDesk);
  let toEnemy: number | null = null;
  for (const part of enemyHitArea ?? []) {
    const distance = distanceToRect(start, direction, part);
    if (distance !== null && (toEnemy === null || distance < toEnemy)) {
      toEnemy = distance;
    }
  }
  const hitsEnemy = toEnemy !== null && toEnemy <= toWall;
  const toHit = hitsEnemy && toEnemy !== null ? toEnemy : toWall;
  const hitMs = toHit / flightSpeed;
  const hit = { x: start.x + direction.x * toHit, y: start.y + direction.y * toHit };

  // Where it comes down: in front of the enemy after hitting it, or on the
  // back edge of the desk after hitting the wall, whole on the screen and
  // above the bar. An item that hits the wall low, at the edge of the
  // screen, stays at that height.
  const lowestLanding = freeDesk.bottom - rect.height;
  const hitTop = Math.round(hit.y - rect.height / 2);
  const landingY = hitsEnemy
    ? Math.min(LANDING_IN_FRONT_OF_ENEMY - rect.height, lowestLanding)
    : clamp(hitTop, DESK_BACK_EDGE_Y + 1 - rect.height, lowestLanding);
  const startSpeedY = hitsEnemy ? -BOUNCE_UP_SPEED : 0;
  const fallMs = fallTime(hit.y, landingY + rect.height / 2, startSpeedY);
  const bounceX = hitsEnemy ? -direction.x * flightSpeed * BOUNCE_BACK_PART * fallMs : 0;
  const landingX = clamp(
    Math.round(hit.x + bounceX - rect.width / 2),
    Math.ceil(freeDesk.left),
    Math.floor(freeDesk.right - rect.width),
  );
  const landing = { x: landingX, y: landingY };

  const durationMs = Math.max(Math.ceil(hitMs + fallMs), 1);
  // While falling, it goes sideways at an even speed, so it ends right at
  // the landing.
  const fallSpeedX = fallMs > 0 ? (landingX + rect.width / 2 - hit.x) / fallMs : 0;

  // The top left corner of the item at a moment of the flight.
  function cornerAt(timeMs: number): Point {
    if (timeMs < hitMs) {
      const travelled = flightSpeed * timeMs;
      return {
        x: start.x + direction.x * travelled - rect.width / 2,
        y: start.y + direction.y * travelled - rect.height / 2,
      };
    }
    const fallingMs = Math.min(timeMs - hitMs, fallMs);
    return {
      x: hit.x + fallSpeedX * fallingMs - rect.width / 2,
      y: Math.min(
        hit.y + startSpeedY * fallingMs + (GRAVITY * fallingMs ** 2) / 2 - rect.height / 2,
        landingY,
      ),
    };
  }

  const move: CameraMove = {
    durationMs,
    offsetAt(timeMs) {
      if (timeMs >= durationMs) {
        return { x: 0, y: 0 };
      }
      const corner = cornerAt(timeMs);
      return { x: corner.x - landing.x, y: corner.y - landing.y };
    },
  };

  return {
    landing,
    move,
    hitMs,
    hitsEnemy,
    spinKeyframes: spinKeyframes(durationMs, direction.x >= 0),
  };
}

// Whether a throw would hit the enemy. With reduced motion, or while the
// classroom is still (FR-VIS-007), the item does not fly, but a throw at the
// enemy still annoys it.
export function wouldHitEnemy(setup: ThrowSetup): boolean {
  return throwFlight(setup).hitsEnemy;
}
