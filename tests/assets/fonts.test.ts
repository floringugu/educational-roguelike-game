import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SPANISH_CHARACTERS, findMissingCharacters, readCodePoints } from '../../scripts/font-glyphs.ts';

const fontsDirectory = fileURLToPath(new URL('../../src/assets/fonts/', import.meta.url));

function readFont(fileName: string): Uint8Array {
  return readFileSync(fontsDirectory + fileName);
}

describe('FR-VIS-005: the fonts', () => {
  it('reads the characters of a font', () => {
    const characters = readCodePoints(readFont('PixelifySans.woff2'));

    expect(characters.has('A'.codePointAt(0) ?? 0)).toBe(true);
    // A character that no Latin font has.
    expect(characters.has(0x0e01)).toBe(false);
  });

  // m6x11 (without "plus") has no accented letters, so the project uses
  // m6x11plus. The result of the check is written in ticket H1-03.
  it('has m6x11plus with all the Spanish characters', () => {
    expect(findMissingCharacters(readFont('m6x11plus.woff2'), SPANISH_CHARACTERS)).toEqual([]);
  });

  it('has Pixelify Sans with all the Spanish characters', () => {
    expect(findMissingCharacters(readFont('PixelifySans.woff2'), SPANISH_CHARACTERS)).toEqual([]);
  });

  it('reports the characters that a font is missing', () => {
    expect(findMissingCharacters(readFont('PixelifySans.woff2'), 'aก')).toEqual(['ก']);
  });

  it('loads the fonts from the project, not from a CDN', () => {
    const css = readFileSync(fileURLToPath(new URL('../../src/styles/fonts.css', import.meta.url)), 'utf8');

    expect(css).not.toMatch(/https?:\/\//);
    expect(css).toContain('assets/fonts/m6x11plus.woff2');
    expect(css).toContain('assets/fonts/PixelifySans.woff2');
  });
});
