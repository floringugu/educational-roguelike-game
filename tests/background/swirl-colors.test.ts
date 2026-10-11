import { describe, expect, it } from 'vitest';
import {
  COLORS_UNDER_DESK_TEXT,
  COLORS_UNDER_DESK_TITLE,
  SHADED_COLOR,
  SWIRL_COLORS,
  staticSwirlBackground,
} from '../../src/background/swirlColors.ts';
import { MINIMUM_TEXT_CONTRAST, contrastRatio } from '../../src/theme/contrast.ts';
import { PALETTE, colorRoles, type ColorRole, type PaletteColorName } from '../../src/theme/palette.ts';

const paletteColorNames = Object.keys(PALETTE);

// The colors that a text can have under it.
function colorsUnder(list: ReadonlyArray<keyof typeof SWIRL_COLORS>): PaletteColorName[] {
  return [...new Set(list.map((key) => SWIRL_COLORS[key]))];
}

function expectReadableOn(role: ColorRole, backgrounds: PaletteColorName[]) {
  for (const name of backgrounds) {
    const ratio = contrastRatio(PALETTE[colorRoles[role]], PALETTE[name]);
    expect(ratio, `${role} on ${name}`).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
  }
}

describe('FR-VIS-004: colors of the background', () => {
  it('uses only colors of the palette', () => {
    for (const name of Object.values(SWIRL_COLORS)) {
      expect(paletteColorNames).toContain(name);
    }
  });

  // The shadows of the fly, the plane and the ball of paper change every
  // color for another one of the palette, never for a mixed one.
  it('shades every color of the palette into another color of the palette', () => {
    expect(Object.keys(SHADED_COLOR).sort()).toEqual([...paletteColorNames].sort());
    for (const name of Object.values(SHADED_COLOR)) {
      expect(paletteColorNames).toContain(name);
    }
  });

  // The shadow makes a color darker, never lighter.
  it('makes a color darker in the shadow', () => {
    const lightness = (name: PaletteColorName) => contrastRatio(PALETTE[name], '#000000');
    for (const name of paletteColorNames as PaletteColorName[]) {
      expect(lightness(SHADED_COLOR[name]), `${name} in the shadow`).toBeLessThanOrEqual(lightness(name));
    }
  });
});

// NFR-ACS-001: the texts drawn right on the desk have no background of their
// own, so they must stay readable on every color that can be under them.
describe('NFR-ACS-001: texts on the desk of the background', () => {
  it('keeps a contrast of at least 4.5:1 for the texts in ink on the desk, the floor and the tubes', () => {
    expectReadableOn('deskText', colorsUnder(COLORS_UNDER_DESK_TEXT));
  });

  it('keeps a contrast of at least 4.5:1 for the title in wine on the floor above the desk', () => {
    expectReadableOn('deskTitle', colorsUnder(COLORS_UNDER_DESK_TITLE));
  });
});

describe('FR-VIS-001: the static background', () => {
  it('draws the floor and the top of the desk, only with their colors', () => {
    const background = staticSwirlBackground(SWIRL_COLORS);
    const usedColors = new Set(background.match(/#[0-9a-f]{6}/g));
    const expected = new Set(
      [SWIRL_COLORS.floor, SWIRL_COLORS.desk, SWIRL_COLORS.deskLight, SWIRL_COLORS.deskEdge].map(
        (name) => PALETTE[name],
      ),
    );
    expect([...usedColors].sort()).toEqual([...expected].sort());
  });
});
