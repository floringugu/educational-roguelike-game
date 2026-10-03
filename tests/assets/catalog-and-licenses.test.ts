import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodePng, pixelAt } from '../../scripts/png.ts';
import { SPRITE_IDS } from '../../src/assets/sprite-ids.ts';
import { LICENSES } from '../../src/data/licenses.ts';
import { PALETTE } from '../../src/theme/palette.ts';

const assetsDirectory = fileURLToPath(new URL('../../src/assets/', import.meta.url));

// Every file in src/assets/, as a path relative to it ('fonts/x.woff2').
const assetFiles = readdirSync(assetsDirectory, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && !entry.name.endsWith('.ts'))
  .map((entry) => `${entry.parentPath}/${entry.name}`.replace(assetsDirectory, '').replace(/^\//, ''));

describe('FR-VIS-004: the sprites of the catalog', () => {
  it('includes the sprites that tickets 05 and 06 need: card art and an enemy', () => {
    expect(SPRITE_IDS.some((id) => id.startsWith('card-art-'))).toBe(true);
    expect(SPRITE_IDS.some((id) => id.startsWith('enemy-'))).toBe(true);
  });

  it('has a file for every identifier', () => {
    for (const id of SPRITE_IDS) {
      expect(assetFiles, id).toContain(`sprites/${id}.png`);
    }
  });

  it('has no sprite file outside the catalog', () => {
    const catalogFiles = SPRITE_IDS.map((id) => `sprites/${id}.png`);
    const spriteFiles = assetFiles.filter((file) => file.startsWith('sprites/'));
    expect([...spriteFiles].sort()).toEqual([...catalogFiles].sort());
  });

  it('draws every sprite with colors of the palette only', () => {
    const paletteColors = new Set(Object.values(PALETTE));
    for (const id of SPRITE_IDS) {
      const image = decodePng(readFileSync(`${assetsDirectory}sprites/${id}.png`));
      let opaquePixels = 0;
      for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
          const { red, green, blue, alpha } = pixelAt(image, x, y);
          if (alpha === 0) {
            continue;
          }
          opaquePixels += 1;
          const hex = `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
          expect(paletteColors.has(hex as never), `${id} uses ${hex}`).toBe(true);
          expect(alpha, `${id} has a semi-transparent pixel`).toBe(255);
        }
      }
      expect(opaquePixels, id).toBeGreaterThan(0);
    }
  });
});

describe('R-4: the license register', () => {
  const registeredFiles = LICENSES.flatMap((entry) => entry.files);

  it('lists every file of src/assets, each in exactly one entry', () => {
    expect([...registeredFiles].sort()).toEqual([...assetFiles].sort());
  });

  it('gives every entry an author, a license, links and an attribution', () => {
    for (const entry of LICENSES) {
      expect(entry.name, 'name').not.toBe('');
      expect(entry.author, `${entry.name}: author`).not.toBe('');
      expect(entry.license, `${entry.name}: license`).not.toBe('');
      expect(entry.attribution, `${entry.name}: attribution`).not.toBe('');
      expect(entry.licenseUrl, `${entry.name}: license link`).toMatch(/^https:\/\//);
      expect(entry.sourceUrl, `${entry.name}: source link`).toMatch(/^https:\/\//);
      expect(entry.files.length, `${entry.name}: files`).toBeGreaterThan(0);
    }
  });

  // The OFL asks for its text to travel with the font. The Credits screen
  // links every licenseFile, and that link is what puts the file in the build.
  it('links every license text of src/assets from its entry', () => {
    const licenseFiles = LICENSES.flatMap((entry) => (entry.licenseFile === undefined ? [] : [entry.licenseFile]));
    expect(assetFiles.filter((file) => file.endsWith('.txt')).sort()).toEqual([...licenseFiles].sort());
    for (const entry of LICENSES) {
      if (entry.licenseFile !== undefined) {
        expect(entry.files, entry.name).toContain(entry.licenseFile);
      }
    }
  });

  it('has no repeated names', () => {
    const names = LICENSES.map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
