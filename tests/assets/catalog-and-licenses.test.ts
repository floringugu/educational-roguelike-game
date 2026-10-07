import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodePng, pixelAt } from '../../scripts/png.ts';
import { SPRITE_IDS } from '../../src/assets/sprite-ids.ts';
import { LICENSES } from '../../src/data/licenses.ts';
import { PALETTE, colorRoles } from '../../src/theme/palette.ts';

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

  // The art of a card is 16x16 drawn at 32 px, and an enemy is 96x96 drawn
  // at 192 px: both at 2 px per pixel, so they look like the same game.
  it('draws the enemies at 96x96 and every other sprite at 16x16', () => {
    for (const id of SPRITE_IDS) {
      const image = decodePng(readFileSync(`${assetsDirectory}sprites/${id}.png`));
      const side = id.startsWith('enemy-') ? 96 : 16;
      expect([image.width, image.height], id).toEqual([side, side]);
    }
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

describe('FR-VIS-002: the textures of the cards', () => {
  const textureFiles = assetFiles.filter((file) => file.startsWith('textures/'));
  const colorOf = (role: keyof typeof colorRoles) => PALETTE[colorRoles[role]];

  // The colors each texture may use. Its texts are checked against the
  // inside of the sheet and the stains only (NFR-ACS-001), so any other
  // color could make a text unreadable. A transparent pixel is allowed: the
  // sheets are not rectangles, and the stains only cover part of the card.
  const sheetInside = [colorOf('card'), colorOf('cardDiploma'), colorOf('cardCrease')];
  const coffee = [colorOf('cardCoffee'), colorOf('cardCoffeeEdge')];
  const textures: Record<string, { width: number; height: number; colors: string[] }> = {
    // A card is 84x118 (with its 2px border): the sheet has the same pixels
    // as the card, plus 3px and 4px for the shadow.
    'textures/crumpled-parchment.png': {
      width: 87,
      height: 122,
      colors: [...sheetInside, colorOf('cardSheetEdge'), colorOf('cardShadow')],
    },
    'textures/crumpled-paper.png': {
      width: 87,
      height: 122,
      colors: [...sheetInside, colorOf('cardSheetEdge'), colorOf('cardShadow')],
    },
    // The question sheet of a diploma or a certificate (ticket 06): the
    // creases of the same sheets as tiles that repeat without a seam, and
    // its bent outline as strips that repeat along the top, the left and the
    // right side. Each side has the strip with the edge (and, on the right,
    // the shadow) and the strip that cuts the tile off outside the sheet.
    'textures/crumpled-parchment-tile.png': { width: 128, height: 128, colors: sheetInside },
    'textures/crumpled-paper-tile.png': { width: 128, height: 128, colors: sheetInside },
    'textures/crumpled-sheet-top.png': { width: 120, height: 6, colors: [colorOf('cardSheetEdge')] },
    'textures/crumpled-sheet-left.png': { width: 6, height: 120, colors: [colorOf('cardSheetEdge')] },
    'textures/crumpled-sheet-right.png': {
      width: 9,
      height: 120,
      colors: [colorOf('cardSheetEdge'), colorOf('cardShadow')],
    },
    'textures/crumpled-sheet-top-cut.png': { width: 120, height: 6, colors: [colorOf('cardShadow')] },
    'textures/crumpled-sheet-left-cut.png': { width: 6, height: 120, colors: [colorOf('cardShadow')] },
    'textures/crumpled-sheet-right-cut.png': { width: 9, height: 120, colors: [colorOf('cardShadow')] },
    // The stains are drawn at half size: 44x44 and 56x40 on the card.
    'textures/coffee-ring.png': { width: 22, height: 22, colors: coffee },
    'textures/coffee-ring-splash.png': { width: 22, height: 22, colors: coffee },
    'textures/coffee-corner.png': { width: 28, height: 20, colors: coffee },
  };

  function hexAt(image: ReturnType<typeof decodePng>, x: number, y: number): string {
    const { red, green, blue } = pixelAt(image, x, y);
    return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
  }

  it('has the sheets of the diploma and the certificate, those of the question sheet, and the coffee stains', () => {
    expect([...textureFiles].sort()).toEqual(Object.keys(textures).sort());
  });

  it('has the size that the CSS draws them at', () => {
    for (const [file, { width, height }] of Object.entries(textures)) {
      const image = decodePng(readFileSync(`${assetsDirectory}${file}`));
      expect({ width: image.width, height: image.height }, file).toEqual({ width, height });
    }
  });

  it('draws them with their own colors of the palette, or fully transparent', () => {
    for (const [file, { colors }] of Object.entries(textures)) {
      const image = decodePng(readFileSync(`${assetsDirectory}${file}`));
      for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
          const { alpha } = pixelAt(image, x, y);
          expect([0, 255], `${file} has a half transparent pixel`).toContain(alpha);
          if (alpha === 255) {
            expect(colors, `${file} uses ${hexAt(image, x, y)}`).toContain(hexAt(image, x, y));
          }
        }
      }
    }
  });

  // A hole in a tile would show the page through the question sheet.
  it('fills the tiles completely', () => {
    for (const file of ['textures/crumpled-parchment-tile.png', 'textures/crumpled-paper-tile.png']) {
      const image = decodePng(readFileSync(`${assetsDirectory}${file}`));
      for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
          expect(pixelAt(image, x, y).alpha, `${file} at ${x},${y}`).toBe(255);
        }
      }
    }
  });

  // The outline of the question sheet ends before the inner side of its
  // strips, where the padding of the sheet keeps the texts (QuestionSheet.css):
  // there, the strips leave the tile as it is.
  it('keeps the outline of the question sheet inside its strips', () => {
    const innerLines: Record<string, (image: ReturnType<typeof decodePng>, along: number) => [number, number]> = {
      'textures/crumpled-sheet-top.png': (image, along) => [along, image.height - 1],
      'textures/crumpled-sheet-top-cut.png': (image, along) => [along, image.height - 1],
      'textures/crumpled-sheet-left.png': (image, along) => [image.width - 1, along],
      'textures/crumpled-sheet-left-cut.png': (image, along) => [image.width - 1, along],
      'textures/crumpled-sheet-right.png': (_image, along) => [0, along],
      'textures/crumpled-sheet-right-cut.png': (_image, along) => [0, along],
    };
    for (const [file, innerPixel] of Object.entries(innerLines)) {
      const image = decodePng(readFileSync(`${assetsDirectory}${file}`));
      const length = Math.max(image.width, image.height);
      for (let along = 0; along < length; along += 1) {
        const [x, y] = innerPixel(image, along);
        expect(pixelAt(image, x, y).alpha, `${file} at ${x},${y}`).toBe(0);
      }
    }
  });

  // The texts of a diploma or a certificate stay inside the border and the
  // padding of the card (Card.css): 11px from the sides, 10px from the top
  // and 8px from the bottom. Under them there must only be the inside of the
  // sheet, never its edge, its shadow or a hole in it.
  it('keeps the edge of the sheets away from the texts', () => {
    for (const file of ['textures/crumpled-parchment.png', 'textures/crumpled-paper.png']) {
      const image = decodePng(readFileSync(`${assetsDirectory}${file}`));
      for (let y = 10; y < 118 - 8; y += 1) {
        for (let x = 11; x < 84 - 11; x += 1) {
          expect(pixelAt(image, x, y).alpha, `${file} at ${x},${y}`).toBe(255);
          expect(sheetInside, `${file} at ${x},${y}`).toContain(hexAt(image, x, y));
        }
      }
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
