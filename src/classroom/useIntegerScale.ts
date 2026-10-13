import { useEffect, useState } from 'react';
import { type FramePlacement, placeFrame } from './integerScale';

function readFramePlacement(): FramePlacement {
  return placeFrame(window.innerWidth, window.innerHeight, window.devicePixelRatio);
}

// The placement of the game frame on the current screen (ADR-0014). It is
// worked out again when the window changes size (turning the phone, resizing
// the window of a PC) and when the devicePixelRatio changes (zooming the
// page, or moving the window to another monitor), because both change how
// many physical pixels there are.
export function useIntegerScale(): FramePlacement {
  const [placement, setPlacement] = useState(readFramePlacement);

  useEffect(() => {
    function update() {
      setPlacement(readFramePlacement());
    }

    // There is no event for a change of devicePixelRatio. A media query that
    // matches the current ratio stops matching when it changes; then it is
    // replaced by one that matches the new ratio.
    let ratioQuery: MediaQueryList | null = null;
    function watchRatio() {
      ratioQuery?.removeEventListener('change', handleRatioChange);
      ratioQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      ratioQuery.addEventListener('change', handleRatioChange);
    }
    function handleRatioChange() {
      watchRatio();
      update();
    }

    window.addEventListener('resize', update);
    watchRatio();
    // The window may have changed between the first render and this effect.
    update();
    return () => {
      window.removeEventListener('resize', update);
      ratioQuery?.removeEventListener('change', handleRatioChange);
    };
  }, []);

  return placement;
}
