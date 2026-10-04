import { describe, expect, it } from 'vitest';
import { SWIRL_COLORS, staticSwirlBackground } from '../../src/background/swirlColors.ts';
import { MINIMUM_TEXT_CONTRAST, contrastRatio } from '../../src/theme/contrast.ts';
import { PALETTE, colorRoles, textOnBackgroundPairs } from '../../src/theme/palette.ts';

const swirlColorNames = Object.values(SWIRL_COLORS);

// The text colors that the interface puts right on the page background, and
// so on top of the swirl.
const textRolesOnTheBackground = textOnBackgroundPairs
  .filter((pair) => pair.background === 'background')
  .map((pair) => pair.text);

describe('FR-VIS-001: colors of the swirl', () => {
  it('uses three different colors of the palette', () => {
    expect(new Set(swirlColorNames).size).toBe(3);
    for (const name of swirlColorNames) {
      expect(Object.keys(PALETTE)).toContain(name);
    }
  });

  // NFR-ACS-001: text drawn on the swirl must stay readable on any of its
  // colors, not only on the plain background color.
  it.each(swirlColorNames)('keeps a contrast of at least 4.5:1 for every text color on %s', (name) => {
    expect(textRolesOnTheBackground.length).toBeGreaterThan(0);
    for (const role of textRolesOnTheBackground) {
      const ratio = contrastRatio(PALETTE[colorRoles[role]], PALETTE[name]);
      expect(ratio, `${role} on ${name}`).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
    }
  });

  it('builds the static background only with the colors of the swirl', () => {
    const background = staticSwirlBackground(SWIRL_COLORS);
    const usedColors = new Set(background.match(/#[0-9a-f]{6}/g));
    const swirlHexColors = swirlColorNames.map((name) => PALETTE[name]);
    expect([...usedColors].sort()).toEqual([...swirlHexColors].sort());
  });
});
