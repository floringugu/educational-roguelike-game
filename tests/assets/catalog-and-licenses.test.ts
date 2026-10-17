import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodePng, pixelAt } from '../../scripts/png.ts';
import { SPRITE_IDS } from '../../src/assets/sprite-ids.ts';
import {
  PLANE_PADDING,
  depthDuring,
  landingMove,
  settleMove,
  shakeMove,
  stepKeyframes,
  type CameraKeyframe,
  type CameraMove,
} from '../../src/classroom/camera.ts';
import {
  CLASSROOM_HEIGHT,
  CLASSROOM_MARGIN_X,
  CLASSROOM_MARGIN_Y,
  CLASSROOM_WIDTH,
  SAFE_AREA_HEIGHT,
  SAFE_AREA_WIDTH,
} from '../../src/classroom/integerScale.ts';
import {
  CLASSROOM_PLANES,
  CLASSROOM_SPRITES,
  ENEMY_RECT,
  TEXT_ZONES,
  type ArtRect,
  type ClassroomPlane,
} from '../../src/classroom/classroomLayout.ts';
import { DESK_ITEMS } from '../../src/classroom/deskItems.ts';
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

  // The stationery of the combat interface (ADR-0016): the notebook scraps,
  // the post-its and the bubble that the counters, the panel of the enemy,
  // "Terminar turno", the menu and the intent are drawn on. Each one has its
  // own size, with its shadow and its tape (art guide §2).
  const STATIONERY_SIZES: Record<string, [number, number]> = {
    'draw-pile-scrap': [23, 33],
    'energy-scrap': [23, 33],
    'health-scrap': [27, 33],
    'block-scrap': [23, 33],
    'discard-scrap': [23, 33],
    'enemy-panel-scrap': [87, 28],
    'end-turn-post-it': [41, 28],
    'menu-post-it': [21, 21],
    'intent-bubble': [31, 21],
  };

  // The sprites of the things on the desk that the player can pick up, and
  // of their shadows (ticket 17), with the size of their place.
  const DESK_ITEM_SIZES: Record<string, [number, number]> = {};
  for (const item of DESK_ITEMS) {
    DESK_ITEM_SIZES[item.sprite] = [item.rect.width, item.rect.height];
    DESK_ITEM_SIZES[item.shadow] = [item.shadowRect.width, item.shadowRect.height];
    if (item.shadowOnRide !== undefined) {
      DESK_ITEM_SIZES[item.shadowOnRide] = [item.shadowRect.width, item.shadowRect.height];
    }
  }

  // The size of each kind of sprite (art guide §2): the icons of the
  // interface and the portrait of an enemy are 16x16 (ADR-0016). The enemies
  // are still 96x96 and the art of the cards 16x16, until tickets 13 and 14
  // redraw them at 88x96 and 24x24. The shadow of an enemy is as wide as its
  // feet, under which it is drawn on the desk (ticket 13). The mark of an
  // annoyed enemy is a strip of 2 frames of 9x9 (ticket 17). The sprites of
  // the classroom have the size of their place in the drawing, and a strip
  // of frames has its frames side by side (ADR-0017).
  function expectedSize(id: string): [number, number] {
    const classroomSprite = CLASSROOM_SPRITES.find((sprite) => sprite.id === id);
    if (classroomSprite !== undefined) {
      const { rect, frames = 1 } = classroomSprite;
      return [rect.width * frames, rect.height];
    }
    const deskItemSize = DESK_ITEM_SIZES[id];
    if (deskItemSize !== undefined) {
      return deskItemSize;
    }
    const stationerySize = STATIONERY_SIZES[id];
    if (stationerySize !== undefined) {
      return stationerySize;
    }
    if (id === 'enemy-annoyance-mark') {
      return [18, 9];
    }
    if (id.startsWith('enemy-') && id.endsWith('-portrait')) {
      return [16, 16];
    }
    if (id.startsWith('enemy-') && id.endsWith('-shadow')) {
      return [59, 7];
    }
    if (id.startsWith('enemy-')) {
      return [96, 96];
    }
    if (id.startsWith('card-art-')) {
      return [16, 16];
    }
    return [16, 16];
  }

  // An icon of the interface is any sprite that is not of the classroom, of
  // an enemy, of a card or a piece of stationery.
  function isInterfaceIcon(id: string): boolean {
    const isClassroom = id.startsWith('classroom-');
    return !isClassroom && !(id in STATIONERY_SIZES) && !id.startsWith('enemy-') && !id.startsWith('card-art-');
  }

  it('draws each kind of sprite at its size: icons and portraits at 16x16 (ADR-0016)', () => {
    for (const id of SPRITE_IDS) {
      const image = decodePng(readFileSync(`${assetsDirectory}sprites/${id}.png`));
      expect([image.width, image.height], id).toEqual(expectedSize(id));
    }
  });

  it('has a sprite for every piece of stationery', () => {
    for (const id of Object.keys(STATIONERY_SIZES)) {
      expect(SPRITE_IDS as readonly string[], id).toContain(id);
    }
  });

  // The most colors of each kind, outline included (art guide §6): 6 for an
  // icon of the interface and 8 for the portrait of an enemy.
  it('draws the icons with 6 colors at most and the portraits with 8 at most', () => {
    for (const id of SPRITE_IDS) {
      const isIcon = isInterfaceIcon(id);
      const isPortrait = id.endsWith('-portrait');
      if (!isIcon && !isPortrait) {
        continue;
      }
      const image = decodePng(readFileSync(`${assetsDirectory}sprites/${id}.png`));
      const colors = new Set<string>();
      for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
          const { red, green, blue, alpha } = pixelAt(image, x, y);
          if (alpha > 0) {
            colors.add(`${red},${green},${blue}`);
          }
        }
      }
      expect(colors.size, id).toBeLessThanOrEqual(isPortrait ? 8 : 6);
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

describe('FR-VIS-001: the classroom (tickets 11 and 16)', () => {
  const paletteColors = new Set<string>(Object.values(PALETTE));

  function hexAt(image: ReturnType<typeof decodePng>, x: number, y: number): string {
    const { red, green, blue } = pixelAt(image, x, y);
    return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
  }

  // The PNG of each plane of the classroom (ADR-0017), from the farthest to
  // the nearest. The city is a plane of its own because it is third-party
  // art (R-4).
  const PLANE_FILES: Record<ClassroomPlane, string> = {
    city: 'backgrounds/classroom-city.png',
    room: 'backgrounds/classroom-room.png',
    backDesks: 'backgrounds/classroom-back-desks.png',
    light: 'backgrounds/classroom-light.png',
    desk: 'backgrounds/classroom-desk.png',
  };
  const planeImages = Object.fromEntries(
    CLASSROOM_PLANES.map((plane) => [plane, decodePng(readFileSync(`${assetsDirectory}${PLANE_FILES[plane]}`))]),
  ) as Record<ClassroomPlane, ReturnType<typeof decodePng>>;

  // The planes that cover the frame: all but the light, which is half
  // transparent. They are checked from the nearest, which covers the most.
  const OPAQUE_PLANES: ClassroomPlane[] = ['desk', 'backDesks', 'room', 'city'];

  it('has a PNG for every plane, and no other background', () => {
    const backgroundFiles = assetFiles.filter((file) => file.startsWith('backgrounds/'));
    expect([...backgroundFiles].sort()).toEqual(Object.values(PLANE_FILES).sort());
  });

  // Each plane but the light repeats its edge PLANE_PADDING pixels all
  // around (art guide §7), so the camera can move it without a gap at the
  // edge of the frame. Each pixel is either opaque or fully transparent, in
  // colors of the palette. The planes have many pixels, so the wrong ones are
  // gathered and checked once, which is much faster than checking each one.
  it('draws the opaque planes 12 pixels bigger on every side, in colors of the palette', () => {
    for (const plane of OPAQUE_PLANES) {
      const image = planeImages[plane];
      expect([image.width, image.height], plane).toEqual([
        CLASSROOM_WIDTH + 2 * PLANE_PADDING,
        CLASSROOM_HEIGHT + 2 * PLANE_PADDING,
      ]);
      const wrongPixels: string[] = [];
      for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
          const { alpha } = pixelAt(image, x, y);
          if (alpha !== 0 && alpha !== 255) {
            wrongPixels.push(`${x},${y} is half transparent`);
          } else if (alpha === 255 && !paletteColors.has(hexAt(image, x, y))) {
            wrongPixels.push(`${x},${y} uses ${hexAt(image, x, y)}`);
          }
        }
      }
      expect(wrongPixels.slice(0, 5), plane).toEqual([]);
    }
  });

  // Where each plane is, in pixels of the art from its place at rest.
  type PlaneOffsets = Record<ClassroomPlane, [number, number]>;
  const AT_REST: PlaneOffsets = { city: [0, 0], room: [0, 0], backDesks: [0, 0], light: [0, 0], desk: [0, 0] };

  // The first pixel of the frame that no opaque plane covers, with each
  // plane moved by its offset, or null if the planes cover them all.
  function firstUncoveredPixel(offsets: PlaneOffsets): string | null {
    for (let y = 0; y < CLASSROOM_HEIGHT; y += 1) {
      for (let x = 0; x < CLASSROOM_WIDTH; x += 1) {
        const isCovered = OPAQUE_PLANES.some((plane) => {
          const [offsetX, offsetY] = offsets[plane];
          const image = planeImages[plane];
          return pixelAt(image, x + PLANE_PADDING - offsetX, y + PLANE_PADDING - offsetY).alpha === 255;
        });
        if (!isCovered) {
          return `${x},${y}`;
        }
      }
    }
    return null;
  }

  // The room leaves a hole in the glass of the window, and the city fills it.
  it('covers the frame with its planes at rest, and the city shows through the window', () => {
    expect(firstUncoveredPixel(AT_REST)).toBeNull();
    const room = planeImages.room;
    const city = planeImages.city;
    let cityPixelsSeen = 0;
    for (let y = PLANE_PADDING; y < PLANE_PADDING + CLASSROOM_HEIGHT; y += 1) {
      for (let x = PLANE_PADDING; x < PLANE_PADDING + CLASSROOM_WIDTH; x += 1) {
        if (pixelAt(room, x, y).alpha === 0 && pixelAt(city, x, y).alpha === 255) {
          cityPixelsSeen += 1;
        }
      }
    }
    expect(cityPixelsSeen).toBeGreaterThan(0);
  });

  // The x and y of the keyframe that holds at `progress` (from 0 to 1): the
  // last one that has started, since each one lasts until the next.
  function translationAt(keyframes: CameraKeyframe[], progress: number): [number, number] {
    const started = keyframes.filter((keyframe) => keyframe.offset <= progress);
    const current = started[started.length - 1] ?? keyframes[0];
    const match = /^translate\((-?\d+)px, (-?\d+)px\)$/.exec(current?.transform ?? '');
    if (match === null) {
      throw new Error(`Unexpected transform: ${current?.transform}`);
    }
    return [Number(match[1]), Number(match[2])];
  }

  // Every move of the camera, the shake with the most damage among them.
  const MOVES: Array<[string, CameraMove]> = [
    ['the shake of a small hit', shakeMove(1)],
    ['the shake of a big hit', shakeMove(99)],
    ['the settle at the start', settleMove()],
    ['the landing', landingMove()],
  ];

  // The planes move by different distances, so the city must fill the
  // window and the room must reach under the desks wherever the camera is.
  it.each(MOVES)('covers the frame at every step of %s', (_name, move) => {
    const keyframesOfPlane = Object.fromEntries(
      CLASSROOM_PLANES.map((plane) => [plane, stepKeyframes(move, depthDuring(move, plane), 1)]),
    ) as Record<ClassroomPlane, CameraKeyframe[]>;
    const progresses = new Set(CLASSROOM_PLANES.flatMap((plane) => keyframesOfPlane[plane].map((k) => k.offset)));
    const checkedSteps = new Set<string>();
    for (const progress of progresses) {
      const offsets = Object.fromEntries(
        CLASSROOM_PLANES.map((plane) => [plane, translationAt(keyframesOfPlane[plane], progress)]),
      ) as PlaneOffsets;
      const step = JSON.stringify(offsets);
      if (checkedSteps.has(step)) {
        continue;
      }
      checkedSteps.add(step);
      expect(firstUncoveredPixel(offsets), step).toBeNull();
    }
  });

  // The layer of light is the only exception to the rule of opaque pixels
  // (art guide §4): gold and sunbeam, with three levels of transparency.
  it('has a layer of light as big as the drawing, in light colors and three levels of transparency', () => {
    const image = planeImages.light;
    expect([image.width, image.height]).toEqual([CLASSROOM_WIDTH, CLASSROOM_HEIGHT]);
    const lightColors = [PALETTE.gold, PALETTE.sunbeam];
    let litPixels = 0;
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const { alpha } = pixelAt(image, x, y);
        expect([0, 64, 128, 192], `light at ${x},${y}`).toContain(alpha);
        if (alpha > 0) {
          litPixels += 1;
          expect(lightColors, `light at ${x},${y}`).toContain(hexAt(image, x, y));
        }
      }
    }
    expect(litPixels).toBeGreaterThan(0);
  });

  // The places are counted from the safe area. A sprite may stand in the
  // margin of the drawing, but the enemy and the texts must be seen on every
  // screen, so they stay inside the safe area.
  function expectInside(name: string, rect: ArtRect, left: number, top: number, right: number, bottom: number) {
    expect(rect.width, name).toBeGreaterThan(0);
    expect(rect.height, name).toBeGreaterThan(0);
    expect(rect.x, name).toBeGreaterThanOrEqual(left);
    expect(rect.y, name).toBeGreaterThanOrEqual(top);
    expect(rect.x + rect.width, name).toBeLessThanOrEqual(right);
    expect(rect.y + rect.height, name).toBeLessThanOrEqual(bottom);
  }

  it('places every sprite inside the drawing', () => {
    for (const { id, rect } of CLASSROOM_SPRITES) {
      expectInside(
        id,
        rect,
        -CLASSROOM_MARGIN_X,
        -CLASSROOM_MARGIN_Y,
        SAFE_AREA_WIDTH + CLASSROOM_MARGIN_X,
        SAFE_AREA_HEIGHT + CLASSROOM_MARGIN_Y,
      );
    }
  });

  it('places the enemy and the text zones inside the safe area', () => {
    const places: Array<[string, ArtRect]> = [['enemy', ENEMY_RECT], ...Object.entries(TEXT_ZONES)];
    for (const [name, rect] of places) {
      expectInside(name, rect, 0, 0, SAFE_AREA_WIDTH, SAFE_AREA_HEIGHT);
    }
  });

  // The enemies of the art guide (§2) are 88x96 and fill their place.
  it('leaves an 88x96 place for the enemy', () => {
    expect([ENEMY_RECT.width, ENEMY_RECT.height]).toEqual([88, 96]);
  });

  // Each sprite of the classroom is either drawn in its place or is one of
  // the things on the desk, with their shadows (ticket 17).
  it('places every sprite of the classroom once', () => {
    const classroomIds = SPRITE_IDS.filter((id) => id.startsWith('classroom-'));
    const placedIds = [
      ...CLASSROOM_SPRITES.map(({ id }) => id),
      ...DESK_ITEMS.flatMap((item) => [item.sprite, item.shadow, ...(item.shadowOnRide ? [item.shadowOnRide] : [])]),
    ];
    expect(placedIds.sort()).toEqual([...classroomIds].sort());
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
