import { describe, expect, it } from 'vitest';
import {
  CLASSROOM_HEIGHT,
  CLASSROOM_MARGIN_X,
  CLASSROOM_MARGIN_Y,
  CLASSROOM_WIDTH,
  SAFE_AREA_HEIGHT,
  SAFE_AREA_WIDTH,
  placeFrame,
} from '../../src/classroom/integerScale';

describe('placeFrame (ADR-0014, ADR-0015)', () => {
  // The examples of the ticket: x6 on a phone 1080 physical pixels wide, x4
  // on one 720 wide and x3 on a PC of 1920x1080. The scale is the one at
  // which the safe area of 180x320 fits.
  it('picks the biggest integer scale at which the safe area fits', () => {
    expect(placeFrame(360, 800, 3).scale).toBe(6);
    expect(placeFrame(412, 915, 2.625).scale).toBe(6);
    expect(placeFrame(360, 640, 2).scale).toBe(4);
    expect(placeFrame(1920, 1080, 1).scale).toBe(3);
    expect(placeFrame(820, 1180, 2).scale).toBe(7);
  });

  it('never picks a scale below 1', () => {
    expect(placeFrame(100, 100, 1).scale).toBe(1);
    expect(placeFrame(0, 0, 1).scale).toBe(1);
  });

  it('copes with odd values from the browser', () => {
    // An unknown width counts as an empty screen.
    expect(placeFrame(Number.NaN, 800, 3).scale).toBe(1);
    // An unknown ratio counts as 1: 360x800 physical pixels fit x2.
    expect(placeFrame(360, 800, 0).scale).toBe(2);
  });

  it('gives the size of a pixel of the art in CSS pixels', () => {
    expect(placeFrame(360, 800, 3).artPixel).toBe(2);
    expect(placeFrame(1920, 1080, 1).artPixel).toBe(3);
  });

  it('fills the whole screen of a phone, with no bands', () => {
    // 1080x2400 physical pixels at x6: the classroom measures 1296x2592, and
    // the screen shows its middle part.
    const phone = placeFrame(360, 800, 3);
    expect(phone).toMatchObject({
      left: 0,
      top: 0,
      width: 360,
      height: 800,
      classroomLeft: -36,
      classroomTop: -32,
    });

    // A small phone of 640x1136 physical pixels at x3.
    const small = placeFrame(320, 568, 2);
    expect(small).toMatchObject({ left: 0, top: 0, width: 320, height: 568 });
  });

  it('leaves bands at the sides of a wide screen', () => {
    // A PC at x3: the classroom is 648 pixels wide, and the free space is
    // split between both sides. It is taller than the screen, so the top and
    // the bottom of its margin are left out.
    const pc = placeFrame(1920, 1080, 1);
    expect(pc).toMatchObject({
      left: 636,
      top: 0,
      width: 648,
      height: 1080,
      classroomLeft: 0,
      classroomTop: -108,
    });

    // A tablet at x7.
    const tablet = placeFrame(820, 1180, 2);
    expect(tablet).toMatchObject({ left: 32, top: 0, width: 756, height: 1180 });
  });

  it('puts the frame and the classroom on whole physical pixels', () => {
    for (const [width, height, ratio] of [
      [360, 800, 3],
      [412, 915, 2.625],
      [393, 873, 2.75],
      [1366, 768, 1],
      [1920, 1080, 1],
      [820, 1180, 2],
      [320, 568, 2],
    ] as const) {
      const placement = placeFrame(width, height, ratio);
      for (const length of [
        placement.left,
        placement.top,
        placement.width,
        placement.height,
        placement.classroomLeft,
        placement.classroomTop,
      ]) {
        const physical = length * ratio;
        expect(Math.abs(physical - Math.round(physical))).toBeLessThan(1e-9);
      }
      // The browser keeps the lengths of the layout in steps of 1/64 of a
      // CSS pixel: the offsets of the frame must be steps, or it would round
      // them. The classroom is moved with a transform, which it does not
      // round.
      for (const offset of [placement.left, placement.top]) {
        expect(Math.abs(offset * 64 - Math.round(offset * 64))).toBeLessThan(1e-3);
      }

      // The frame is inside the screen.
      expect(placement.left).toBeGreaterThanOrEqual(0);
      expect(placement.top).toBeGreaterThanOrEqual(0);
      expect(placement.left + placement.width).toBeLessThanOrEqual(width);
      expect(placement.top + placement.height).toBeLessThanOrEqual(height);

      // The classroom covers the whole frame, with no gap at any side.
      const pixel = placement.artPixel;
      expect(placement.classroomLeft).toBeLessThanOrEqual(0);
      expect(placement.classroomTop).toBeLessThanOrEqual(0);
      expect(placement.classroomLeft + CLASSROOM_WIDTH * pixel).toBeGreaterThanOrEqual(placement.width - 1e-9);
      expect(placement.classroomTop + CLASSROOM_HEIGHT * pixel).toBeGreaterThanOrEqual(placement.height - 1e-9);

      // The safe area is seen whole.
      const allowedCut = 1e-9;
      const safeLeft = placement.classroomLeft + CLASSROOM_MARGIN_X * pixel;
      const safeTop = placement.classroomTop + CLASSROOM_MARGIN_Y * pixel;
      expect(safeLeft).toBeGreaterThanOrEqual(-allowedCut);
      expect(safeTop).toBeGreaterThanOrEqual(-allowedCut);
      expect(safeLeft + SAFE_AREA_WIDTH * pixel).toBeLessThanOrEqual(placement.width + allowedCut);
      expect(safeTop + SAFE_AREA_HEIGHT * pixel).toBeLessThanOrEqual(placement.height + allowedCut);
    }
  });
});
