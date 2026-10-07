import { useEffect, useRef, useState } from 'react';
import { chooseBackgroundMode, type FallbackReason } from './backgroundMode';
import { startSwirlAnimation } from './swirlAnimation';
import { SWIRL_COLORS, staticSwirlBackground, type SwirlColors } from './swirlColors';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import './SwirlBackground.css';

// One pixel of the swirl covers 4x4 CSS pixels, the same size as one pixel
// of the sprites (16x16 drawn at 64x64), so the background matches the art.
export const DEFAULT_RESOLUTION_SCALE = 1 / 4;

type SwirlBackgroundProps = {
  // Size of the drawn image relative to the screen in CSS pixels (FR-VIS-001).
  resolutionScale?: number;
  colors?: SwirlColors;
};

// The animated background behind every screen (FR-VIS-001): the wood of a
// school desk whose grain flows slowly around its knots. It stops moving and
// shows a single frame when the frame rate is too low or when the system asks
// for reduced motion (FR-VIS-007). Without WebGL there is no frame to show,
// so it is replaced by the static CSS stripes.
export function SwirlBackground({
  resolutionScale = DEFAULT_RESOLUTION_SCALE,
  colors = SWIRL_COLORS,
}: SwirlBackgroundProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Once the swirl falls back, it stays that way until the app is reloaded.
  const [fallbackReason, setFallbackReason] = useState<FallbackReason | null>(null);
  const mode = chooseBackgroundMode(prefersReducedMotion, fallbackReason);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (mode === 'static' || canvas === null) {
      return;
    }
    // Going from 'animated' to 'frozen' keeps the same canvas: React reuses
    // it because both modes render the same elements.
    return startSwirlAnimation(canvas, {
      colors,
      resolutionScale,
      frozen: mode === 'frozen',
      onFallback: setFallbackReason,
    });
  }, [mode, colors, resolutionScale]);

  // The background is decoration: screen readers skip it (aria-hidden).
  // data-background tells tests and the developer which one is showing.
  if (mode === 'static') {
    return (
      <div
        className="swirl-background"
        data-background="static"
        style={{ background: staticSwirlBackground(colors) }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className="swirl-background" data-background={mode} aria-hidden="true">
      <canvas ref={canvasRef} className="swirl-background__canvas" />
    </div>
  );
}
