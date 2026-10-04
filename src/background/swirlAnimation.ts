import type { FallbackReason } from './backgroundMode';
import { FRAME_RATE_WINDOW_MS, MINIMUM_FRAME_RATE, createFrameRateMeter } from './frameRateMeter';
import type { SwirlColors } from './swirlColors';
import { createSwirlRenderer, type SwirlRenderer } from './swirlRenderer';

export type SwirlAnimationOptions = {
  colors: SwirlColors;
  // Size of the drawn image relative to the canvas size in CSS pixels.
  resolutionScale: number;
  // True to draw a single frame that does not move. It is drawn again only
  // when the canvas changes size, because that erases it.
  frozen: boolean;
  // Called at most once, when the swirl cannot go on as it is.
  onFallback: (reason: FallbackReason) => void;
};

// A frame that takes longer than this (the phone froze for a moment) only
// moves the animation this far, so it does not jump.
const LONGEST_ANIMATION_STEP_MS = 100;

// Starts drawing the swirl on the canvas: once per frame of the screen, or
// only once if it is frozen. Returns a function that stops it and frees
// everything it used.
export function startSwirlAnimation(canvas: HTMLCanvasElement, options: SwirlAnimationOptions): () => void {
  const renderer = createSwirlRenderer(canvas, options.colors);
  if (renderer === null) {
    options.onFallback('no-webgl');
    return () => undefined;
  }
  return runSwirlAnimation(canvas, renderer, options);
}

// The drawing itself, once the renderer exists. It is a separate function so
// the renderer it receives can never be null.
function runSwirlAnimation(
  canvas: HTMLCanvasElement,
  renderer: SwirlRenderer,
  options: SwirlAnimationOptions,
): () => void {
  const frameRateMeter = createFrameRateMeter(FRAME_RATE_WINDOW_MS);
  // Time the animation has been running, without the pauses. A frozen
  // swirl never advances it, so it always shows the first frame of the loop.
  let animationTimeMs = 0;
  let previousFrameTime: number | null = null;
  let frameRequest: number | null = null;

  // FR-VIS-001: the image is drawn below the native resolution and stretched
  // to the screen. Drawing 1/16 of the pixels (with the default scale of
  // 1/4) is what keeps the shader cheap on the phone.
  function resizeToCanvas() {
    const width = Math.max(1, Math.round(canvas.clientWidth * options.resolutionScale));
    const height = Math.max(1, Math.round(canvas.clientHeight * options.resolutionScale));
    renderer.resize(width, height);
    // Changing the size erases the image: draw it again right away, so the
    // screen does not show an empty frame.
    renderer.draw(animationTimeMs / 1000);
  }

  function drawFrame(frameTime: number) {
    if (previousFrameTime !== null) {
      animationTimeMs += Math.min(frameTime - previousFrameTime, LONGEST_ANIMATION_STEP_MS);
    }
    previousFrameTime = frameTime;
    renderer.draw(animationTimeMs / 1000);

    frameRateMeter.recordFrame(frameTime);
    if (frameRateMeter.isSlowerThan(MINIMUM_FRAME_RATE)) {
      stop();
      options.onFallback('low-frame-rate');
      return;
    }
    frameRequest = requestAnimationFrame(drawFrame);
  }

  function pause() {
    if (frameRequest !== null) {
      cancelAnimationFrame(frameRequest);
      frameRequest = null;
    }
  }

  function resume() {
    if (options.frozen) {
      // Nothing moves, but some phones drop the image of a page that was
      // in the background: draw the frame again when the tab comes back.
      renderer.draw(animationTimeMs / 1000);
      return;
    }
    // The time spent hidden is neither animation time nor slow frames.
    previousFrameTime = null;
    frameRateMeter.reset();
    if (frameRequest === null) {
      frameRequest = requestAnimationFrame(drawFrame);
    }
  }

  // FR-VIS-001: the swirl pauses while the tab is hidden, and goes on where
  // it was when the tab is shown again.
  function handleVisibilityChange() {
    if (document.hidden) {
      pause();
    } else {
      resume();
    }
  }

  // The phone can take the GPU away from the page (for example, after a
  // long time in the background). The swirl cannot go on without it.
  function handleContextLost() {
    stop();
    options.onFallback('no-webgl');
  }

  const resizeObserver = new ResizeObserver(resizeToCanvas);

  function stop() {
    pause();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    resizeObserver.disconnect();
    renderer.dispose();
  }

  resizeToCanvas();
  resizeObserver.observe(canvas);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  canvas.addEventListener('webglcontextlost', handleContextLost);
  if (!document.hidden) {
    resume();
  }

  return stop;
}
