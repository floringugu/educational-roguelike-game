import { describe, expect, it } from 'vitest';
import {
  PLANE_DEPTH,
  PLANE_PADDING,
  depthDuring,
  landingMove,
  settleMove,
  shakeMove,
  stepKeyframes,
  type CameraKeyframe,
  type CameraMove,
} from '../../src/classroom/camera.ts';
import { CLASSROOM_PLANES } from '../../src/classroom/classroomLayout.ts';

// The x and y of a keyframe, in the CSS pixels of its transform.
function translationOf(keyframe: CameraKeyframe): [number, number] {
  const match = /^translate\((-?[\d.]+)px, (-?[\d.]+)px\)$/.exec(keyframe.transform);
  if (match === null) {
    throw new Error(`Unexpected transform: ${keyframe.transform}`);
  }
  return [Number(match[1]), Number(match[2])];
}

// Every move of the camera, the shake with the most damage among them.
const MOVES: Array<[string, CameraMove]> = [
  ['the shake of a small hit', shakeMove(1)],
  ['the shake of a big hit', shakeMove(99)],
  ['the settle at the start', settleMove()],
  ['the landing', landingMove()],
];

describe('the camera of the classroom (ADR-0017)', () => {
  it.each(MOVES)('moves every plane in whole pixels of the art in %s', (_name, move) => {
    for (const plane of CLASSROOM_PLANES) {
      for (const keyframe of stepKeyframes(move, depthDuring(move, plane), 1)) {
        const [x, y] = translationOf(keyframe);
        expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
      }
    }
  });

  it.each(MOVES)('jumps from pixel to pixel, and ends at rest, in %s', (_name, move) => {
    const keyframes = stepKeyframes(move, 1, 1);
    const last = keyframes[keyframes.length - 1];
    expect(last?.offset).toBe(1);
    expect(last?.transform).toBe('translate(0px, 0px)');
    for (const keyframe of keyframes.slice(0, -1)) {
      expect(keyframe.easing).toBe('steps(1, end)');
    }
    // The offsets go forward, and two keyframes in a row are never the same.
    for (let index = 1; index < keyframes.length; index += 1) {
      const previous = keyframes[index - 1];
      const current = keyframes[index];
      expect(current?.offset).toBeGreaterThan(previous?.offset ?? 1);
      if (index < keyframes.length - 1) {
        expect(current?.transform).not.toBe(previous?.transform);
      }
    }
  });

  it.each(MOVES)('never moves a plane further than the edge its PNG repeats in %s', (_name, move) => {
    for (const plane of CLASSROOM_PLANES) {
      for (const keyframe of stepKeyframes(move, depthDuring(move, plane), 1)) {
        const [x, y] = translationOf(keyframe);
        expect(Math.abs(x)).toBeLessThanOrEqual(PLANE_PADDING);
        expect(Math.abs(y)).toBeLessThanOrEqual(PLANE_PADDING);
      }
    }
  });

  it('moves the nearer planes further', () => {
    expect(PLANE_DEPTH.city).toBeLessThan(PLANE_DEPTH.room);
    expect(PLANE_DEPTH.room).toBeLessThan(PLANE_DEPTH.backDesks);
    expect(PLANE_DEPTH.backDesks).toBeLessThan(PLANE_DEPTH.desk);
  });

  it('turns pixels of the art into CSS pixels outside the classroom', () => {
    const keyframes = stepKeyframes(landingMove(), 1, 2.5);
    expect(keyframes[0]).toEqual({ offset: 0, transform: 'translate(0px, 7.5px)', easing: 'steps(1, end)' });
  });

  it('shakes harder with more damage, up to 5 pixels of the art', () => {
    function biggestOffset(move: CameraMove): number {
      return Math.max(
        ...stepKeyframes(move, 1, 1).map((keyframe) => Math.max(...translationOf(keyframe).map(Math.abs))),
      );
    }
    expect(biggestOffset(shakeMove(2))).toBeLessThan(biggestOffset(shakeMove(12)));
    // The shake fades out from the start, so it never quite reaches 5.
    expect(biggestOffset(shakeMove(99))).toBeLessThanOrEqual(5);
    expect(biggestOffset(shakeMove(99))).toBeGreaterThanOrEqual(4);
  });

  it('keeps the city still in a shake, and lets it rise a little when the camera sits down', () => {
    const shake = stepKeyframes(shakeMove(12), depthDuring(shakeMove(12), 'city'), 1);
    expect(shake.map((keyframe) => keyframe.transform)).toEqual(['translate(0px, 0px)', 'translate(0px, 0px)']);
    const settle = stepKeyframes(settleMove(), depthDuring(settleMove(), 'city'), 1);
    expect(translationOf(settle[0] ?? { offset: 0, transform: '' })).toEqual([0, 2]);
  });
});
