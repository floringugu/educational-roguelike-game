import { describe, expect, it } from 'vitest';
import {
  FRAME_RATE_WINDOW_MS,
  MINIMUM_FRAME_RATE,
  createFrameRateMeter,
  type FrameRateMeter,
} from '../../src/background/frameRateMeter.ts';

// Records frames at a steady rate from `startMs` for `durationMs`, as
// requestAnimationFrame would. Returns the time of the last frame.
function recordSteadyFrames(meter: FrameRateMeter, framesPerSecond: number, startMs: number, durationMs: number) {
  const frameIntervalMs = 1000 / framesPerSecond;
  let time = startMs;
  for (; time <= startMs + durationMs; time += frameIntervalMs) {
    meter.recordFrame(time);
  }
  return time - frameIntervalMs;
}

describe('createFrameRateMeter', () => {
  it('has no average with fewer than two frames', () => {
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    expect(meter.averageFrameRate()).toBeNull();
    meter.recordFrame(1000);
    expect(meter.averageFrameRate()).toBeNull();
  });

  it('measures the frames per second of a steady animation', () => {
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    recordSteadyFrames(meter, 60, 0, 6000);
    expect(meter.averageFrameRate()).toBeCloseTo(60, 5);
  });

  it('averages only the frames of the last window', () => {
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    // A slow start (loading the app) followed by 5 s at full speed.
    const end = recordSteadyFrames(meter, 10, 0, 3000);
    recordSteadyFrames(meter, 60, end + 1000 / 60, FRAME_RATE_WINDOW_MS);
    expect(meter.averageFrameRate()).toBeCloseTo(60, 0);
  });
});

describe('FR-VIS-001: below 30 fps on average for 5 s', () => {
  it('is too slow at 20 fps once 5 s have passed', () => {
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    recordSteadyFrames(meter, 20, 0, FRAME_RATE_WINDOW_MS);
    expect(meter.isSlowerThan(MINIMUM_FRAME_RATE)).toBe(true);
  });

  it('waits for the full 5 s before deciding', () => {
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    recordSteadyFrames(meter, 20, 0, 4900);
    expect(meter.hasFullWindow()).toBe(false);
    expect(meter.isSlowerThan(MINIMUM_FRAME_RATE)).toBe(false);
  });

  it('is fast enough at 30 fps or more', () => {
    const atThirty = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    recordSteadyFrames(atThirty, 30, 0, 6000);
    expect(atThirty.isSlowerThan(MINIMUM_FRAME_RATE)).toBe(false);

    const atSixty = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    recordSteadyFrames(atSixty, 60, 0, 6000);
    expect(atSixty.isSlowerThan(MINIMUM_FRAME_RATE)).toBe(false);
  });

  it('forgets the slow frames after a reset, as when the tab comes back', () => {
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    const end = recordSteadyFrames(meter, 60, 0, 3000);
    // The tab was hidden for 10 s: the gap is not a slow frame.
    meter.reset();
    recordSteadyFrames(meter, 60, end + 10_000, 3000);
    expect(meter.hasFullWindow()).toBe(false);
    expect(meter.averageFrameRate()).toBeCloseTo(60, 5);
  });
});
