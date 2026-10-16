// The integer scale of the pixel art (ADR-0014, ADR-0015, art guide §3).
// Every pixel of the art is drawn as a square of N x N physical pixels of
// the screen, with N a whole number. A fractional scale would draw some
// pixels one physical pixel wider than others, and the art would look uneven.
//
// The classroom is drawn bigger than what always shows: a safe area of
// 180x320 pixels of the art, which every screen shows whole, and a margin
// around it. N is the biggest scale at which the safe area fits, and the
// screen shows as much of the margin as fits too. On a phone the classroom
// covers the whole screen; on a tablet or a PC, which are wider, plain ink
// bands are left at the sides.
//
// It is a pure function, with no browser code, so it can be tested with
// made-up screens.

// The safe area, in pixels of the art: it is always seen whole.
export const SAFE_AREA_WIDTH = 180;
export const SAFE_AREA_HEIGHT = 320;
// The margin of the drawing around the safe area, at each side.
export const CLASSROOM_MARGIN_X = 18;
export const CLASSROOM_MARGIN_Y = 56;
// The whole drawing of the classroom: 216x432.
export const CLASSROOM_WIDTH = SAFE_AREA_WIDTH + 2 * CLASSROOM_MARGIN_X;
export const CLASSROOM_HEIGHT = SAFE_AREA_HEIGHT + 2 * CLASSROOM_MARGIN_Y;

// Where the game frame goes on the screen, where the classroom goes inside
// it and how big a pixel of the art is. Every length is in CSS pixels, ready
// for the styles of the frame.
export type FramePlacement = {
  // N: physical pixels per pixel of the art.
  scale: number;
  // One pixel of the art in CSS pixels: N divided by the devicePixelRatio.
  // The CSS variable --art-scale of the game frame takes this value.
  artPixel: number;
  // One pixel of the pixel font in CSS pixels. The texts go at half scale
  // (art guide §3): a pixel of the font is half a pixel of the art, rounded
  // up to a whole physical pixel when N is odd. At x3 it is 2 physical
  // pixels; at 1.5 the letters would blur. The CSS variable --font-scale of
  // the game frame takes this value.
  fontPixel: number;
  // The frame: the part of the screen covered by the classroom.
  left: number;
  top: number;
  width: number;
  height: number;
  // The top left corner of the classroom, from the top left corner of the
  // frame. It is 0 or less: the parts of the margin that do not fit are
  // left out of the frame. The safe area starts CLASSROOM_MARGIN_X and
  // CLASSROOM_MARGIN_Y pixels of the art further in.
  classroomLeft: number;
  classroomTop: number;
};

// The browser keeps the lengths of the layout in steps of 1/64 of a CSS
// pixel. With a ratio such as 2.625, most whole physical pixels fall between
// two steps, and an offset rounded to a step would put the art a little off
// the physical pixels: the edges of the pixels of the art would blur.
const LAYOUT_STEPS_PER_CSS_PIXEL = 64;
// How far an offset may move from the center to land on a step. At 2.625
// there is a step every 21 physical pixels; this is more than enough for the
// usual ratios, and a few physical pixels off center cannot be seen.
const MAX_SHIFT_FROM_CENTER = 64;

function isOnLayoutStep(physicalPixels: number, ratio: number): boolean {
  const steps = (physicalPixels / ratio) * LAYOUT_STEPS_PER_CSS_PIXEL;
  return Math.abs(steps - Math.round(steps)) < 1e-3;
}

// The offset nearest to `centered`, between 0 and `highest`, that is a
// whole physical pixel and also a step of the layout. With an odd ratio that
// has no such offset nearby, the centered one.
function snapToLayoutStep(centered: number, highest: number, ratio: number): number {
  for (let shift = 0; shift <= MAX_SHIFT_FROM_CENTER; shift += 1) {
    for (const offset of [centered - shift, centered + shift]) {
      if (offset >= 0 && offset <= highest && isOnLayoutStep(offset, ratio)) {
        return offset;
      }
    }
  }
  return centered;
}

// The browser measures the screen in CSS pixels; a CSS pixel is
// `devicePixelRatio` physical pixels (3 on many phones, 1 on most PCs).
export function placeFrame(
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio: number,
): FramePlacement {
  // A browser can report odd values while a page loads or in a test; fall
  // back to a ratio of 1 and an empty screen, which give the smallest scale.
  const ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const cssWidth = Number.isFinite(viewportWidth) ? viewportWidth : 0;
  const cssHeight = Number.isFinite(viewportHeight) ? viewportHeight : 0;

  // Rounded down: with a ratio such as 2.625 the product has decimals, and
  // rounding up could make the frame one physical pixel bigger than the
  // screen.
  const physicalWidth = Math.floor(cssWidth * ratio);
  const physicalHeight = Math.floor(cssHeight * ratio);

  // The biggest N with which the whole safe area fits, and never less than 1.
  const scale = Math.max(
    1,
    Math.min(Math.floor(physicalWidth / SAFE_AREA_WIDTH), Math.floor(physicalHeight / SAFE_AREA_HEIGHT)),
  );

  // The frame shows as much of the classroom as fits on the screen.
  const classroomWidth = CLASSROOM_WIDTH * scale;
  const classroomHeight = CLASSROOM_HEIGHT * scale;
  const frameWidth = Math.min(physicalWidth, classroomWidth);
  const frameHeight = Math.min(physicalHeight, classroomHeight);

  // The frame is centered on the screen, with the free space split between
  // both sides. Its offset is a whole physical pixel, and a step of the
  // layout, so the edges of the pixels of the art fall on the edges of the
  // physical pixels and none is blurred.
  const freeWidth = physicalWidth - frameWidth;
  const freeHeight = physicalHeight - frameHeight;
  const frameLeft = snapToLayoutStep(Math.floor(freeWidth / 2), freeWidth, ratio);
  const frameTop = snapToLayoutStep(Math.floor(freeHeight / 2), freeHeight, ratio);

  // The classroom is centered on the frame, and always covers it whole.
  // Centered, the safe area is always seen whole: what is left out is at
  // most the margin at each side. Its corner is a whole physical pixel too,
  // but needs no step of the layout: Classroom.css moves it with a
  // transform, which the browser does not round. Written as 0 minus, so that
  // it is 0 and not -0 when nothing is left out.
  const hiddenWidth = classroomWidth - frameWidth;
  const hiddenHeight = classroomHeight - frameHeight;
  const classroomLeft = 0 - Math.floor(hiddenWidth / 2);
  const classroomTop = 0 - Math.floor(hiddenHeight / 2);

  return {
    scale,
    artPixel: scale / ratio,
    fontPixel: Math.ceil(scale / 2) / ratio,
    left: frameLeft / ratio,
    top: frameTop / ratio,
    width: frameWidth / ratio,
    height: frameHeight / ratio,
    classroomLeft: classroomLeft / ratio,
    classroomTop: classroomTop / ratio,
  };
}
