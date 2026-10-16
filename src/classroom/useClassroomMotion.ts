import { useEffect, useState, useSyncExternalStore } from 'react';
import { FRAME_RATE_WINDOW_MS, MINIMUM_FRAME_RATE, createFrameRateMeter } from '../background/frameRateMeter';
import { usePrefersReducedMotion } from '../background/usePrefersReducedMotion';

// Whether the classroom moves (FR-VIS-001, FR-VIS-007):
// - moving: its slow loops play, and the camera moves with the hits;
// - paused: the tab is hidden, and the loops wait where they are until it
//   shows again;
// - still: the system asks for reduced motion, or the phone could not keep
//   30 fps on average for 5 seconds. Nothing moves until the app is opened
//   again.
export type ClassroomMotion = 'moving' | 'paused' | 'still';

export function useClassroomMotion(): ClassroomMotion {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTabHidden = useIsTabHidden();
  const isTooSlow = useIsTooSlow(!prefersReducedMotion);

  if (prefersReducedMotion || isTooSlow) {
    return 'still';
  }
  if (isTabHidden) {
    return 'paused';
  }
  return 'moving';
}

function useIsTabHidden(): boolean {
  return useSyncExternalStore(subscribeToVisibility, readIsTabHidden, readIsTabHiddenWithoutBrowser);
}

function subscribeToVisibility(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function readIsTabHidden(): boolean {
  return document.hidden;
}

// Used when React renders without a browser, as in the tests.
function readIsTabHiddenWithoutBrowser(): boolean {
  return false;
}

// Measures the frame rate while the classroom moves, and turns true for good
// once the average of the last 5 seconds drops below 30 fps (NFR-PRF-003,
// prov.). With `isMeasuring` false it does not measure: the classroom is
// still anyway.
function useIsTooSlow(isMeasuring: boolean): boolean {
  const [isTooSlow, setIsTooSlow] = useState(false);

  useEffect(() => {
    if (!isMeasuring || isTooSlow) {
      return;
    }
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    let frameRequest = requestAnimationFrame(countFrame);

    function countFrame(frameTime: number) {
      meter.recordFrame(frameTime);
      if (meter.isSlowerThan(MINIMUM_FRAME_RATE)) {
        setIsTooSlow(true);
        return;
      }
      frameRequest = requestAnimationFrame(countFrame);
    }

    // The browser stops the frames while the tab is hidden. Start counting
    // again when it comes back, or the pause would count as very slow frames.
    function handleVisibilityChange() {
      meter.reset();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      cancelAnimationFrame(frameRequest);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMeasuring, isTooSlow]);

  return isTooSlow;
}
