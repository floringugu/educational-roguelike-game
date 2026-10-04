// Measures the frame rate of an animation: it keeps the times of the frames
// drawn in the last `windowMs` milliseconds and works out how many frames per
// second that is. It does not use the browser, so it can be tested with
// made-up times.

// FR-VIS-001: the swirl stops moving and freezes on one frame when the average
// of the last 5 seconds drops below 30 fps (NFR-PRF-003, prov.).
export const MINIMUM_FRAME_RATE = 30;
export const FRAME_RATE_WINDOW_MS = 5000;

export type FrameRateMeter = {
  // Call it once per frame, with the time the browser gives to
  // requestAnimationFrame (milliseconds).
  recordFrame: (timeMs: number) => void;
  // Average frames per second over the frames kept, or null with fewer than
  // two frames.
  averageFrameRate: () => number | null;
  // True once the frames recorded since the start (or the last reset) cover
  // the whole window. Before that, the average is based on too few frames.
  hasFullWindow: () => boolean;
  // True when the window is full and its average is below `minimumFrameRate`.
  isSlowerThan: (minimumFrameRate: number) => boolean;
  // Forgets every frame. Call it when the animation stops for a while (the
  // tab is hidden), or the pause would count as very slow frames.
  reset: () => void;
};

export function createFrameRateMeter(windowMs: number): FrameRateMeter {
  // Times of the frames inside the window, from oldest to newest.
  let frameTimes: number[] = [];
  // Time of the first frame since the start or the last reset.
  let firstFrameTime: number | null = null;

  function recordFrame(timeMs: number) {
    if (firstFrameTime === null) {
      firstFrameTime = timeMs;
    }
    frameTimes.push(timeMs);

    // Forget the frames that are now older than the window.
    const oldestTimeKept = timeMs - windowMs;
    while (frameTimes.length > 0 && (frameTimes[0] ?? timeMs) < oldestTimeKept) {
      frameTimes.shift();
    }
  }

  function averageFrameRate(): number | null {
    const oldest = frameTimes[0];
    const newest = frameTimes[frameTimes.length - 1];
    if (oldest === undefined || newest === undefined || newest === oldest) {
      return null;
    }
    // N frames span N - 1 intervals between them.
    const intervals = frameTimes.length - 1;
    return intervals / ((newest - oldest) / 1000);
  }

  function hasFullWindow(): boolean {
    const newest = frameTimes[frameTimes.length - 1];
    return firstFrameTime !== null && newest !== undefined && newest - firstFrameTime >= windowMs;
  }

  function isSlowerThan(minimumFrameRate: number): boolean {
    const average = averageFrameRate();
    return hasFullWindow() && average !== null && average < minimumFrameRate;
  }

  function reset() {
    frameTimes = [];
    firstFrameTime = null;
  }

  return { recordFrame, averageFrameRate, hasFullWindow, isSlowerThan, reset };
}
