import { PALETTE, type PaletteColorName } from '../theme/palette';

// The colors of the background (FR-VIS-001), the wooden top of a desk. They
// are parameters taken from the fixed palette (FR-VIS-004), never free colors.
//   - base: the color that fills most of the screen, the wood.
//   - primary: the lighter band of each grain line.
//   - secondary: the thin dark line at the end of each grain line.
export type SwirlColors = {
  base: PaletteColorName;
  primary: PaletteColorName;
  secondary: PaletteColorName;
};

// Text is drawn right on top of the background, so every color here must be
// dark enough for every text color to keep a contrast of 4.5:1 on it
// (NFR-ACS-001). tests/background/swirl-colors.test.ts checks it: night,
// indigo, wine, ink, bark and umber pass; crimson and periwinkle do not.
export const SWIRL_COLORS: SwirlColors = {
  base: 'bark',
  primary: 'umber',
  secondary: 'ink',
};

// The colors of the details on the desk, drawn by the shader on top of the
// wood: the doodles of a black pen and an eraser with a paper sleeve.
//   - pen: text can end up on top of the doodles on any screen, so it
//     follows the same rule as the wood (NFR-ACS-001). Next to each stroke
//     the shader paints the primary color of the wood, which also follows it.
//   - eraser and eraserSleeve: an eraser only looks like one when it is
//     light, and light colors do not give 4.5:1 with the light text. So it
//     is the exception: it stays against the left edge of the screen, in the
//     free space between the enemy and the player, where there is no text.
export type DeskDetailColors = {
  pen: PaletteColorName;
  eraser: PaletteColorName;
  eraserSleeve: PaletteColorName;
};

export const DESK_DETAIL_COLORS: DeskDetailColors = {
  pen: 'ink',
  eraser: 'paper',
  eraserSleeve: 'periwinkle',
};

// The static background that replaces the shader when there is no WebGL to
// draw it, not even a single frozen frame (FR-VIS-001). Horizontal lines of
// grain, like the desk the shader draws: a wide band of the base color, a
// narrower one of the primary and a thin line of the secondary, repeated down
// the screen. Their edges are hard, like the bands of the shader, so it only
// uses palette colors. It has no details: they need the shader. It is a value for the CSS `background` property.
export function staticSwirlBackground(colors: SwirlColors): string {
  const base = PALETTE[colors.base];
  const primary = PALETTE[colors.primary];
  const secondary = PALETTE[colors.secondary];
  return `repeating-linear-gradient(180deg, ${base} 0 20px, ${primary} 20px 32px, ${secondary} 32px 36px)`;
}
