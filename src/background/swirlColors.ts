import { PALETTE, type PaletteColorName } from '../theme/palette';

// The colors of the swirl background (FR-VIS-001). They are parameters taken
// from the fixed palette (FR-VIS-004), never free colors.
//   - base: the color that fills most of the screen.
//   - primary and secondary: the two paint streaks that turn on top of it.
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

// The static background that replaces the swirl when there is no WebGL to
// draw it, not even a single frozen frame (FR-VIS-001). Two diagonal streaks of the same colors on the
// base color. Their edges are hard, like the bands of the swirl, so it only
// uses palette colors; the middle of the screen, where the text usually is,
// stays on the base color. It is a value for the CSS `background` property.
export function staticSwirlBackground(colors: SwirlColors): string {
  const base = PALETTE[colors.base];
  const primary = PALETTE[colors.primary];
  const secondary = PALETTE[colors.secondary];
  return (
    `linear-gradient(160deg, ` +
    `${base} 0 30%, ${primary} 30% 38%, ${base} 38% 62%, ${secondary} 62% 72%, ${base} 72%)`
  );
}
