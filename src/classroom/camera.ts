import { type ClassroomPlane } from './classroomLayout';

// The camera of the classroom (ADR-0017). It never turns or zooms: it only
// moves the planes of the classroom up, down and to the sides, the nearer
// ones further than the far ones, so the room seems to have depth. It shakes
// with a hit, sits down at the desk when a combat starts and dips when an
// enemy lands on the desk.
//
// Every plane moves in whole pixels of the art, from one to the next with no
// step in between, so the pixel art never falls between two physical pixels
// and blurs (ADR-0014). The browser plays the moves as keyframes
// (Element.animate), without React.
//
// This file has no browser code, so it can be tested in Node. CameraContext
// plays the keyframes on the planes.

// How far each plane moves with the camera, compared with the desk, which is
// the nearest and moves the most. The city is so far that it stays still,
// and the light moves with the room, on whose walls and floor it falls.
export const PLANE_DEPTH: Record<ClassroomPlane, number> = {
  city: 0,
  room: 1 / 3,
  backDesks: 2 / 3,
  light: 1 / 3,
  desk: 1,
};

// The PNG of each plane but the light repeats its edge this many pixels of
// the art all around (art guide §7), so a moved plane never shows a gap at
// the edge of the frame. No move takes a plane further than this.
export const PLANE_PADDING = 12;

export type CameraOffset = { x: number; y: number };

export type CameraMove = {
  durationMs: number;
  // Where the desk is `timeMs` after the start of the move, in pixels of the
  // art from its place at rest. Each plane goes its depth times as far. At
  // the end of the move, the desk is back at rest: { x: 0, y: 0 }.
  offsetAt: (timeMs: number) => CameraOffset;
  // Planes that move by another depth during this move.
  depthOverrides?: Partial<Record<ClassroomPlane, number>>;
};

// A keyframe of Element.animate. The type is written here because this file
// has no browser types; the one of the browser accepts it.
export type CameraKeyframe = {
  offset: number;
  transform: string;
  easing?: string;
};

// The keyframes are worked out every 8 milliseconds: about twice per frame
// of a screen at 120 Hz, often enough that no pixel is skipped.
const SAMPLE_INTERVAL_MS = 8;

// The keyframes of one plane for a move. `depth` is how far the plane goes
// compared with the desk, and `unitPx` is one pixel of the art in CSS
// pixels where the plane is: 1 inside the classroom, which is laid out at
// one CSS pixel per pixel of the art, and the --art-scale of the game frame
// outside it.
//
// The offset is rounded to whole pixels of the art, and only a change of
// pixel makes a new keyframe. `steps(1, end)` keeps each keyframe until the
// next one, so the plane jumps from pixel to pixel and is never in between.
export function stepKeyframes(move: CameraMove, depth: number, unitPx: number): CameraKeyframe[] {
  const keyframes: CameraKeyframe[] = [];
  let lastX: number | null = null;
  let lastY: number | null = null;

  for (let timeMs = 0; timeMs < move.durationMs; timeMs += SAMPLE_INTERVAL_MS) {
    const offset = move.offsetAt(timeMs);
    const x = roundToWholePixel(offset.x * depth);
    const y = roundToWholePixel(offset.y * depth);
    if (x !== lastX || y !== lastY) {
      keyframes.push({ offset: timeMs / move.durationMs, transform: translate(x, y, unitPx), easing: 'steps(1, end)' });
      lastX = x;
      lastY = y;
    }
  }

  // The move always ends at rest.
  keyframes.push({ offset: 1, transform: translate(0, 0, unitPx) });
  return keyframes;
}

// Math.round gives -0 for small negative numbers, and the transform would
// say "-0px". Adding 0 turns -0 into 0.
function roundToWholePixel(value: number): number {
  return Math.round(value) + 0;
}

function translate(x: number, y: number, unitPx: number): string {
  return `translate(${x * unitPx}px, ${y * unitPx}px)`;
}

// The depth of a plane during a move.
export function depthDuring(move: CameraMove, plane: ClassroomPlane): number {
  return move.depthOverrides?.[plane] ?? PLANE_DEPTH[plane];
}

// A hit shakes the camera: a short wobble that dies out, harder the more
// damage it does. The desk goes up to 5 pixels of the art away.
export function shakeMove(damage: number): CameraMove {
  const durationMs = 380;
  const amplitude = Math.min(2 + damage / 4, 5);
  // One wobble every 95 milliseconds; the vertical one is smaller and out of
  // step with the horizontal one, so the camera moves in an oval.
  const wobbleMs = 95;
  return {
    durationMs,
    offsetAt(timeMs) {
      const fade = (1 - timeMs / durationMs) ** 2;
      const angle = (2 * Math.PI * timeMs) / wobbleMs;
      return {
        x: -amplitude * fade * Math.sin(angle),
        y: amplitude * 0.6 * fade * Math.cos(angle + 0.6),
      };
    },
  };
}

// When the combat starts, the camera sits down at the desk: the planes come
// up from below, the nearer ones from further, and slow down as they arrive.
// The desk starts 12 pixels of the art lower and the city, which never moves
// otherwise, 2.
export const SETTLE_DURATION_MS = 800;
const SETTLE_DESK_DROP = 12;
const SETTLE_CITY_DROP = 2;

export function settleMove(): CameraMove {
  return {
    durationMs: SETTLE_DURATION_MS,
    offsetAt(timeMs) {
      const left = 1 - timeMs / SETTLE_DURATION_MS;
      return { x: 0, y: SETTLE_DESK_DROP * left ** 3 };
    },
    depthOverrides: { city: SETTLE_CITY_DROP / SETTLE_DESK_DROP },
  };
}

// The enemy drops onto the desk when the camera has almost sat down, and it
// is hidden until then (EnemyView).
export const SETTLE_ENEMY_DELAY_MS = 560;

// An enemy lands on the desk, which dips 3 pixels of the art under its
// weight and comes back up one pixel at a time.
export function landingMove(): CameraMove {
  return {
    durationMs: 220,
    offsetAt(timeMs) {
      if (timeMs < 50) {
        return { x: 0, y: 3 };
      }
      if (timeMs < 110) {
        return { x: 0, y: 2 };
      }
      if (timeMs < 170) {
        return { x: 0, y: 1 };
      }
      return { x: 0, y: 0 };
    },
  };
}
