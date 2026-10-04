// Chooses what the background shows. It does not use the browser, so it can
// be tested on its own.

// Why the swirl stopped moving (FR-VIS-001).
//   - 'no-webgl': the browser cannot run the shader, or lost the GPU.
//   - 'low-frame-rate': the average of the last 5 s dropped below 30 fps.
// Reduced motion (FR-VIS-007) is not here: it is a choice of the player that
// SwirlBackground reads before starting the swirl, not something that fails.
export type FallbackReason = 'no-webgl' | 'low-frame-rate';

// What the background shows (FR-VIS-001, FR-VIS-007).
//   - 'animated': the swirl moves.
//   - 'frozen': one frame of the swirl, drawn with WebGL, that does not move.
//   - 'static': the CSS stripes, for when there is no WebGL to draw a frame.
export type BackgroundMode = 'animated' | 'frozen' | 'static';

export function chooseBackgroundMode(
  prefersReducedMotion: boolean,
  fallbackReason: FallbackReason | null,
): BackgroundMode {
  if (fallbackReason === 'no-webgl') {
    return 'static';
  }
  if (prefersReducedMotion || fallbackReason === 'low-frame-rate') {
    return 'frozen';
  }
  return 'animated';
}
