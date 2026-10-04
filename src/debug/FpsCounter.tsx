import { useEffect, useState } from 'react';
import { FRAME_RATE_WINDOW_MS, createFrameRateMeter } from '../background/frameRateMeter';
import { es } from '../i18n/es';
import './FpsCounter.css';

// How often the number on screen changes. Updating it on every frame would
// make React render 60 or 120 times per second, which would itself slow
// down the page being measured.
const DISPLAY_UPDATE_INTERVAL_MS = 500;

// Debug counter of frames per second, to measure NFR-PRF-003 on the phone.
// It shows the average of the last 5 seconds, the same window the swirl uses
// to decide whether it is too slow (FR-VIS-001). It measures the whole page,
// so it keeps working when the background is static.
export function FpsCounter() {
  const [averageFrameRate, setAverageFrameRate] = useState<number | null>(null);

  useEffect(() => {
    const meter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
    let lastDisplayUpdate = 0;
    let frameRequest = requestAnimationFrame(countFrame);

    function countFrame(frameTime: number) {
      meter.recordFrame(frameTime);
      if (frameTime - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL_MS) {
        setAverageFrameRate(meter.averageFrameRate());
        lastDisplayUpdate = frameTime;
      }
      frameRequest = requestAnimationFrame(countFrame);
    }

    // The browser stops the frames while the tab is hidden. Start counting
    // again when it comes back, or the pause would lower the average.
    function handleVisibilityChange() {
      meter.reset();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      cancelAnimationFrame(frameRequest);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // A developer tool, not part of the game: screen readers skip it.
  return (
    <p className="fps-counter" aria-hidden="true">
      {averageFrameRate === null ? es.debug.noFrameRateYet : Math.round(averageFrameRate)}{' '}
      {es.debug.framesPerSecond}
    </p>
  );
}
