// Cuts the first sprites out of a CC0 tile sheet and recolors them to the
// fixed palette (FR-VIS-004). The result goes to src/assets/sprites/.
//
// Source: "Tiny Dungeon" by Kenney, CC0 (see src/data/licenses.ts). The sheet
// is not stored in the repository. Download it from
// https://kenney.nl/assets/tiny-dungeon, unzip it and run:
//
//   node scripts/build-sprites.ts path/to/Tilemap/tilemap_packed.png
//
// Each pixel takes the closest color of the palette, so the sprites look like
// the rest of the interface. Transparent pixels stay transparent.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { type SpriteId } from '../src/assets/sprite-ids.ts';
import { hexToRgb } from '../src/theme/contrast.ts';
import { PALETTE } from '../src/theme/palette.ts';
import { decodePng, encodePng, pixelAt, type Image } from './png.ts';

const TILE_SIZE = 16;
const OUTPUT_DIRECTORY = fileURLToPath(new URL('../src/assets/sprites/', import.meta.url));

// Position of each sprite in the sheet, counted in tiles (the sheet has 12
// columns, with no space between tiles). The id is the file name and the
// identifier that the catalog (src/assets/catalog.ts) uses; typing it as
// SpriteId makes the type check fail if an id is renamed in only one place.
export const SPRITES: ReadonlyArray<{ id: SpriteId; column: number; row: number }> = [
  { id: 'card-art-attack', column: 8, row: 8 }, // sword
  { id: 'card-art-defense', column: 6, row: 8 }, // round shield
  { id: 'card-art-heal', column: 7, row: 9 }, // red potion
  { id: 'enemy-brute', column: 2, row: 9 }, // red monster
];

const paletteRgb = Object.values(PALETTE).map(hexToRgb);

// Returns the palette color closest to the given one, by distance in RGB.
export function closestPaletteColor(red: number, green: number, blue: number): [number, number, number] {
  let best = paletteRgb[0] ?? [0, 0, 0];
  let bestDistance = Infinity;
  for (const candidate of paletteRgb) {
    const distance =
      (candidate[0] - red) ** 2 + (candidate[1] - green) ** 2 + (candidate[2] - blue) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

// Copies one tile of the sheet, recolored to the palette.
export function cutAndRecolor(sheet: Image, column: number, row: number): Image {
  const pixels = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);
  for (let y = 0; y < TILE_SIZE; y += 1) {
    for (let x = 0; x < TILE_SIZE; x += 1) {
      const source = pixelAt(sheet, column * TILE_SIZE + x, row * TILE_SIZE + y);
      const target = (y * TILE_SIZE + x) * 4;
      // Kenney's sprites have no semi-transparent pixels, so a pixel is
      // either kept or dropped.
      if (source.alpha < 128) {
        continue;
      }
      const [red, green, blue] = closestPaletteColor(source.red, source.green, source.blue);
      pixels.set([red, green, blue, 255], target);
    }
  }
  return { width: TILE_SIZE, height: TILE_SIZE, pixels };
}

function main(): void {
  const sheetPath = process.argv[2];
  if (sheetPath === undefined) {
    throw new Error('Usage: node scripts/build-sprites.ts path/to/tilemap_packed.png');
  }
  const sheet = decodePng(readFileSync(sheetPath));
  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  for (const sprite of SPRITES) {
    const image = cutAndRecolor(sheet, sprite.column, sprite.row);
    writeFileSync(`${OUTPUT_DIRECTORY}${sprite.id}.png`, encodePng(image));
    console.log(`Wrote ${sprite.id}.png`);
  }
}

// Only run when called from the command line, not when a test imports it.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
