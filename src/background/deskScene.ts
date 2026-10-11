import { PALETTE, type PaletteColorName } from '../theme/palette';
import type { SwirlColors } from './swirlColors';

// The still part of the background (FR-VIS-001, ticket 04): the floor, the
// desk, its legs, the chair, the cuts in the formica and the things lying on
// the desk. It is painted once here, pixel by pixel, every time the screen
// changes size, and the shader (swirl.frag.glsl) only puts it on the screen
// and adds what moves: the fly, the paper plane, the jump of the objects,
// the ball of paper and the ant.
//
// Every pixel is stored as the position of its color in the palette, never
// as a free color, so the image can only use palette colors (FR-VIS-004).
// One pixel here is one pixel of the shader: 4x4 CSS pixels.

// The palette colors in a fixed order. A pixel stores the position of its
// color in this list.
export const PALETTE_COLOR_NAMES = Object.keys(PALETTE) as PaletteColorName[];

// Stored where there is no color: outside the objects, or outside a sprite.
// The shader uses the same number (NOTHING in swirl.frag.glsl).
export const NOTHING = 255;

export type DeskScene = {
  width: number;
  height: number;
  // One color position per pixel, row by row from the top left corner.
  // Everything that stays still: the floor, the desk, the chair, the cuts
  // and the shadows of the objects.
  ground: Uint8Array;
  // The things lying on the desk, apart, because they jump when the desk is
  // hit while their shadows stay. NOTHING where there is no object.
  objects: Uint8Array;
  // Where the desk ended up, for the shader.
  layout: DeskLayout;
};

// Where the top of the desk is, in pixels from the top left corner of the
// screen: its left and right columns, its far row (top) and its front row
// (front), the last one of formica before the wooden edge.
export type DeskLayout = {
  left: number;
  right: number;
  top: number;
  front: number;
};

// The floor that shows on each side of the desk on a phone.
const FLOOR_MARGIN = 6;
// On a wide screen, the desk does not grow beyond this (480 CSS pixels) and
// stays in the middle.
const MAX_DESK_WIDTH = 120;
// The far edge of the desk, just under the title and the credits button.
const DESK_TOP = 15;
// The front edge of the desk is measured from the bottom of the screen,
// like the player and the hand, which are drawn from the bottom up: this
// way the edge always falls just over the health of the player.
const FRONT_FROM_BOTTOM = 59;
// On a very short screen (a phone turned sideways) the desk keeps at least
// this height, and the chair goes off the bottom of the screen.
const MIN_DESK_HEIGHT = 60;

export function deskLayout(width: number, height: number): DeskLayout {
  const deskWidth = Math.min(width - 2 * FLOOR_MARGIN, MAX_DESK_WIDTH);
  const left = Math.floor((width - deskWidth) / 2);
  return {
    left,
    right: left + deskWidth - 1,
    top: DESK_TOP,
    front: Math.max(height - FRONT_FROM_BOTTOM, DESK_TOP + MIN_DESK_HEIGHT),
  };
}

// A sprite written as rows of letters, in the style of pixel art: each
// letter is a color of its key, and a dot is an empty pixel. Letters that are
// in `groundKey` instead are painted on the ground (the shadow of an object,
// a bit of dust), so they stay still when the object jumps.
type Sprite = {
  rows: string[];
  key: Record<string, PaletteColorName>;
  groundKey?: Record<string, PaletteColorName>;
};

// A layer of the image: one color position per pixel.
type Layer = {
  put: (x: number, y: number, color: PaletteColorName) => void;
  fillRect: (left: number, top: number, right: number, bottom: number, color: PaletteColorName) => void;
  pixels: Uint8Array;
};

function createLayer(width: number, height: number): Layer {
  const pixels = new Uint8Array(width * height).fill(NOTHING);
  const put = (x: number, y: number, color: PaletteColorName) => {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      pixels[y * width + x] = PALETTE_COLOR_NAMES.indexOf(color);
    }
  };
  // Both corners are included.
  const fillRect = (left: number, top: number, right: number, bottom: number, color: PaletteColorName) => {
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        put(x, y, color);
      }
    }
  };
  return { put, fillRect, pixels };
}

// A number from 0 to 1 that looks random but is always the same for the same
// pixel, so the specks of the floor do not change from one frame to another.
function noise(x: number, y: number, seed: number): number {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
}

// The remainder that is never negative, so the tiles repeat to both sides of
// the middle of the screen.
function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function paintDeskScene(width: number, height: number, colors: SwirlColors): DeskScene {
  const layout = deskLayout(width, height);
  const ground = createLayer(width, height);
  const objects = createLayer(width, height);
  const { left, right, top, front } = layout;
  // The middle of the desk, where the chair goes.
  const middle = Math.floor((left + right) / 2);

  // Paints a sprite with its top left corner at (x, y).
  function paintSprite(x: number, y: number, sprite: Sprite, layer: Layer) {
    sprite.rows.forEach((row, rowIndex) => {
      [...row].forEach((letter, column) => {
        const groundColor = sprite.groundKey?.[letter];
        const color = sprite.key[letter];
        if (groundColor !== undefined) {
          ground.put(x + column, y + rowIndex, groundColor);
        } else if (color !== undefined) {
          layer.put(x + column, y + rowIndex, color);
        }
      });
    });
  }

  // ---- The floor ----
  // Terrazzo: light tiles with specks. The tiles are shorter from top to
  // bottom than across, because the floor is seen at an angle. Above the
  // desk, where the title of the combat goes, the seams use the color of
  // the specks (see COLORS_UNDER_DESK_TITLE).
  function floorColor(x: number, y: number): PaletteColorName {
    const isSeam = positiveModulo(x - middle + 17, 34) === 0 || positiveModulo(y + 5, 24) === 0;
    const speck = noise(x, y, 5);
    const seamColor = y < top ? colors.floorSpeck : colors.floorSeam;
    if (isSeam) {
      return seamColor;
    }
    if (speck < 0.09) {
      return colors.floorSpeck;
    }
    if (speck < 0.11) {
      return seamColor;
    }
    return colors.floor;
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ground.put(x, y, floorColor(x, y));
    }
  }

  // The shadow of the desk on the floor, under it and to its right, because
  // the light comes from the top left. Its far end breaks into loose pixels.
  for (let y = front + 4; y <= front + 27; y++) {
    for (let x = left + 2; x <= right + 2; x++) {
      if (y < front + 23 || noise(x, y, 3) < 0.5) {
        ground.put(x, y, colors.floorShadow);
      }
    }
  }
  ground.fillRect(right + 1, top + 3, right + 3, front + 4, colors.floorShadow);

  // ---- The legs and the chair ----
  // A metal tube, 3 pixels wide, lit from the left.
  function paintTube(x: number, fromY: number, toY: number) {
    ground.fillRect(x, fromY, x + 1, toY, colors.metal);
    ground.fillRect(x + 2, fromY, x + 2, toY, colors.metalShade);
  }
  function paintFoot(x: number, y: number) {
    ground.fillRect(x - 1, y, x + 3, y + 1, colors.feet);
  }
  // The back legs are farther away, so their feet are higher up the screen.
  for (const x of [left + 10, right - 12]) {
    paintTube(x, front + 6, front + 20);
    paintFoot(x, front + 21);
  }
  ground.fillRect(left + 13, front + 14, right - 13, front + 14, colors.metal);
  ground.fillRect(left + 13, front + 15, right - 13, front + 15, colors.metalShade);
  // The front legs, with the side rail that joins each one to its back leg.
  for (const x of [left + 2, right - 4]) {
    paintTube(x, front + 6, front + 35);
    paintFoot(x, front + 36);
  }
  for (let step = 0; step <= 5; step++) {
    ground.put(left + 5 + step, front + 29 - 2 * step, colors.metalShade);
    ground.put(right - 5 - step, front + 29 - 2 * step, colors.metalShade);
  }

  // The chair, pushed in under the desk: the seat with four screws, then the
  // posts and the curved bar of the backrest, which is the nearest part.
  const seatLeft = middle - 23;
  const seatRight = middle + 23;
  ground.fillRect(seatLeft, front + 19, seatRight, front + 35, colors.deskOutline);
  ground.fillRect(seatLeft + 1, front + 20, seatRight - 1, front + 32, colors.desk);
  ground.fillRect(seatLeft + 1, front + 20, seatRight - 1, front + 20, colors.deskLight);
  ground.fillRect(seatLeft + 1, front + 20, seatLeft + 1, front + 32, colors.deskLight);
  ground.fillRect(seatLeft + 1, front + 33, seatRight - 1, front + 34, colors.deskShade);
  // Round corners: the shadow of the desk shows through them.
  ground.put(seatLeft, front + 19, colors.floorShadow);
  ground.put(seatRight, front + 19, colors.floorShadow);
  for (const [x, y] of [
    [seatLeft + 5, front + 23],
    [seatRight - 5, front + 23],
    [seatLeft + 5, front + 30],
    [seatRight - 5, front + 30],
  ] as const) {
    ground.put(x, y, colors.floor);
  }
  for (const x of [seatLeft + 4, seatRight - 6]) {
    paintTube(x, front + 36, front + 45);
  }
  ground.fillRect(seatLeft - 4, front + 46, seatRight + 4, front + 46, colors.metal);
  ground.fillRect(seatLeft - 4, front + 47, seatRight + 4, front + 48, colors.metalShade);
  for (let step = 0; step <= 2; step++) {
    ground.put(seatLeft - 6 + step, front + 44 + step, colors.metal);
    ground.put(seatRight + 6 - step, front + 44 + step, colors.metal);
  }
  for (const x of [seatLeft - 2, seatRight]) {
    paintTube(x, front + 49, front + 56);
    paintFoot(x, front + 57);
  }

  // ---- The top of the desk ----
  // The outline, with round far corners, and the formica inside, with its
  // lit far and left edges and its shaded right edge.
  ground.fillRect(left, top, right, front + 5, colors.deskOutline);
  ground.fillRect(left + 1, top + 1, right - 1, front, colors.desk);
  ground.fillRect(left + 2, top + 1, right - 2, top + 1, colors.deskLight);
  ground.fillRect(left + 1, top + 2, left + 1, front, colors.deskLight);
  ground.fillRect(right - 1, top + 2, right - 1, front, colors.deskShade);
  for (const [x, y] of [
    [left, top],
    [left + 1, top],
    [left, top + 1],
    [right, top],
    [right - 1, top],
    [right, top + 1],
  ] as const) {
    ground.put(x, y, floorColor(x, y));
  }
  ground.put(left + 1, top + 1, colors.deskOutline);
  ground.put(right - 1, top + 1, colors.deskOutline);
  // A few lighter and darker specks in the formica.
  for (let y = top + 2; y < front; y++) {
    for (let x = left + 2; x < right - 1; x++) {
      const speck = noise(x, y, 11);
      if (speck < 0.012) {
        ground.put(x, y, colors.deskLight);
      } else if (speck > 0.992) {
        ground.put(x, y, colors.deskShade);
      }
    }
  }
  // The front edge: the rounded wood of the board, with a few lines of
  // grain, and the metal frame under it.
  ground.fillRect(left + 1, front + 1, right - 1, front + 1, colors.deskEdge);
  ground.fillRect(left + 1, front + 2, right - 1, front + 3, colors.deskEdgeSide);
  for (let x = left + 3; x < right - 2; x += 7) {
    ground.fillRect(x, front + 3, x + 2, front + 3, colors.deskEdgeGrain);
  }
  ground.fillRect(left + 1, front + 4, right - 1, front + 4, colors.deskEdgeGrain);
  ground.fillRect(left + 3, front + 6, right - 3, front + 6, colors.metal);
  ground.fillRect(left + 3, front + 7, right - 3, front + 7, colors.metalShade);
  ground.fillRect(left + 3, front + 8, right - 3, front + 8, colors.feet);
  // A chipped corner, where the board shows under the formica.
  paintSprite(left + 1, front - 3, { rows: ['w..', 'ww.', 'www'], key: { w: colors.cutWall } }, ground);

  // ---- The cuts, made with a blade ----
  // The days passing, at the top left: two groups of five and two more.
  const tallyStrokes: Stroke[] = [];
  for (const groupX of [left + 4, left + 19]) {
    for (let mark = 0; mark < 4; mark++) {
      const x = groupX + mark * 3;
      tallyStrokes.push([x, top + 5 + (mark % 2), x, top + 10]);
    }
    tallyStrokes.push([groupX - 1, top + 9, groupX + 10, top + 5]);
  }
  tallyStrokes.push([left + 34, top + 5, left + 34, top + 10], [left + 37, top + 6, left + 37, top + 10]);
  carve(ground, cutPixels(tallyStrokes), colors);
  // A heart at the top right, with F+D inside. The letters are thin cuts
  // without the lit wall, so their small holes stay open. They only suggest
  // writing, like the doodles that docs/GUIA-DE-ARTE.md §7 allows.
  const heartX = right - 19;
  carve(ground, spritePixels(heartX, top + 3, HEART_ROWS), colors);
  paintSprite(heartX + 3, top + 7, { rows: INITIALS_ROWS, key: { x: colors.cutGroove } }, ground);

  // ---- The things on the desk ----
  // In the free space between the enemy and the player, just behind the
  // front edge.
  const shadow = { o: colors.objectShadow };
  paintSprite(left + 5, front - 16, { ...PENCIL, groundKey: shadow }, objects);
  paintSprite(left + 7, front - 9, { ...ERASER, groundKey: shadow }, objects);
  for (const [x, y] of ERASER_CRUMBS) {
    paintSprite(left + 7 + x, front - 9 + y, { ...CRUMB, groundKey: shadow }, objects);
  }
  const sharpenerX = middle - 7;
  paintSprite(sharpenerX - 2, front - 10, { ...SHARPENER, groundKey: { ...shadow, d: 'umber' } }, objects);
  paintSprite(sharpenerX + 8, front - 9, SHAVING_BIG, objects);
  paintSprite(sharpenerX - 6, front - 6, SHAVING_SMALL, objects);
  paintSprite(sharpenerX + 13, front - 5, SHAVING_FLAT, objects);
  paintSprite(right - 28, front - 16, { ...PENCIL_CASE, groundKey: shadow }, objects);
  paintSprite(right - 34, front - 4, { ...BALLPOINT, groundKey: shadow }, objects);

  return { width, height, ground: ground.pixels, objects: objects.pixels, layout };
}

// ---- Cuts ----

// A straight cut from (x1, y1) to (x2, y2).
type Stroke = readonly [number, number, number, number];

// The pixels a list of straight cuts goes through.
function cutPixels(strokes: Stroke[]): Array<readonly [number, number]> {
  const pixels: Array<readonly [number, number]> = [];
  for (const [x1, y1, x2, y2] of strokes) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let step = 0; step <= steps; step++) {
      pixels.push([Math.round(x1 + ((x2 - x1) * step) / steps), Math.round(y1 + ((y2 - y1) * step) / steps)]);
    }
  }
  return pixels;
}

// The pixels marked with an x in some rows, with the first row at (x, y).
function spritePixels(x: number, y: number, rows: string[]): Array<readonly [number, number]> {
  const pixels: Array<readonly [number, number]> = [];
  rows.forEach((row, rowIndex) => {
    [...row].forEach((letter, column) => {
      if (letter === 'x') {
        pixels.push([x + column, y + rowIndex]);
      }
    });
  });
  return pixels;
}

// A cut made with a blade in the formica. The groove is dark. Its lower wall
// (or its right one, when the cut goes down) catches the light from the top
// left and shows the brown board under the formica. Here and there, a chip
// of formica lifts at its top left.
function carve(ground: Layer, pixels: Array<readonly [number, number]>, colors: SwirlColors) {
  const isCut = new Set(pixels.map(([x, y]) => `${x},${y}`));
  const cut = (x: number, y: number) => isCut.has(`${x},${y}`);
  for (const [x, y] of pixels) {
    if (!cut(x, y + 1)) {
      ground.put(x, y + 1, colors.cutWall);
    } else if (!cut(x + 1, y)) {
      ground.put(x + 1, y, colors.cutWall);
    }
    if (!cut(x - 1, y - 1) && noise(x, y, 9) < 0.18) {
      ground.put(x - 1, y - 1, colors.cutChip);
    }
  }
  // The groove goes last, so no wall or chip covers it.
  for (const [x, y] of pixels) {
    ground.put(x, y, colors.cutGroove);
  }
}

const HEART_ROWS = [
  '...xxx.....xxx...',
  '..x...x...x...x..',
  '.x.....x.x.....x.',
  'x.......x.......x',
  'x...............x',
  'x...............x',
  'x...............x',
  '.x.............x.',
  '..x...........x..',
  '...x.........x...',
  '....x.......x....',
  '.....x.....x.....',
  '......x...x......',
  '.......x.x.......',
  '........x........',
];

const INITIALS_ROWS = [
  'xxx.....xx.',
  'x....x..x.x',
  'xx..xxx.x.x',
  'x....x..xx.',
];

// ---- The things on the desk ----
// Seen from the high three-quarter view of ticket 04: the top of each thing
// and a bit of its front. The light comes from the top left. In every one,
// `o` is its shadow on the desk.

// A yellow pencil with its eraser on the left, the metal band (ferrule), a
// stamped brand too small to read and the sharpened point on the right.
const PENCIL: Sprite = {
  rows: [
    '.VVpspsGGpppppGGGGGGs...',
    'VVVststGGffGfGGGGGGGssuk',
    '.CCtltlAAAAAAAAAAAAAtt..',
    '..ooooooooooooooooooooo.',
  ],
  key: {
    V: 'vermilion',
    C: 'crimson',
    p: 'paper',
    s: 'sand',
    t: 'tan',
    l: 'leather',
    G: 'gold',
    A: 'amber',
    f: 'forest',
    u: 'umber',
    k: 'ink',
  },
};

// A white eraser in its blue paper sleeve, worn and grey at its free end.
const ERASER: Sprite = {
  rows: [
    '.pppppLLLLLLL.',
    'psspppbbbpbbbo',
    'pstppbbbbpbbbo',
    'ppppppbbbpbbbo',
    'qqqqqqiiiiiiio',
    '.sssssnnnnnnno',
    '..oooooooooooo',
  ],
  key: {
    p: 'paper',
    s: 'sand',
    t: 'tan',
    q: 'parchment',
    L: 'lavender',
    b: 'periwinkle',
    i: 'indigo',
    n: 'night',
  },
};

// The crumbs of rubber around the eraser, from its top left corner.
const ERASER_CRUMBS = [
  [16, 3],
  [18, 5],
  [15, 7],
  [-3, 5],
] as const;

const CRUMB: Sprite = {
  rows: ['q.', '.o'],
  key: { q: 'parchment' },
};

// A metal sharpener with the hole for the pencil, and some graphite dust
// (`d`) on the desk around it.
const SHARPENER: Sprite = {
  rows: [
    '..LLpLLL.........',
    '..LLLpkL.........',
    'd.LLLLpLo........',
    '..bbkkbbo.......d',
    '..bnkkbbo........',
    '...oooooo........',
    '...........d.....',
    '.............d...',
  ],
  key: { L: 'lavender', p: 'paper', k: 'ink', b: 'periwinkle', n: 'night' },
};

// Curly shavings of the pencil, with the yellow paint on their rim.
const SHAVING_KEY: Record<string, PaletteColorName> = { a: 'amber', G: 'gold', s: 'sand', t: 'tan', w: 'parchment' };
const SHAVING_BIG: Sprite = { rows: ['.aGs.', 'aswts', 'Gt.s.', '.sst.'], key: SHAVING_KEY };
const SHAVING_SMALL: Sprite = { rows: ['.Gs', 'ats', '.s.'], key: SHAVING_KEY };
const SHAVING_FLAT: Sprite = { rows: ['Gas', 's.t'], key: SHAVING_KEY };

// A red fabric pencil case, lit from the top left, with the zip along its
// top, its teeth in two colors, a gold pull and a seam along its front.
const PENCIL_CASE: Sprite = {
  rows: [
    '..vvvvvvvvvvvvvvvvvvvvvv...',
    '.vrrrrrrrrrrrrrrrrrrrrrrw..',
    'vrrrrrrrrrrrrrrrrrrrrrrrrwo',
    'vrstststststststststststrwo',
    'vrrrrGGGrrrrrrrrrrrrrrrrrwo',
    'vrrrrGwGrrrrrrrrrrrrrrrrrwo',
    'vrrrrrGrrrrrrrrrrrrrrrrrrwo',
    'wrrrrrrrrrrrrrrrrrrrrrrrrwo',
    'wwwwwwwwwwwwwwwwwwwwwwwwwwo',
    '.wwswwwswwwswwwswwwswwwsw.o',
    '..wwwwwwwwwwwwwwwwwwwwww..o',
    '...ooooooooooooooooooooooo.',
  ],
  key: { v: 'vermilion', r: 'crimson', w: 'wine', s: 'sand', t: 'tan', G: 'gold' },
};

// A ballpoint pen with its blue cap on the left, the clear barrel with the
// ink tube inside, and the point on the right.
const BALLPOINT: Sprite = {
  rows: [
    '.iiiibLpLpLpLpLpLpL...',
    'kiiiiiiiiiiiiiiiiiissk',
    '.bkkkbLLLLLLLLLLLLL...',
    '..ooooooooooooooooooo.',
  ],
  key: { i: 'indigo', b: 'periwinkle', L: 'lavender', p: 'paper', s: 'sand', k: 'ink' },
};

// ---- The sprites of the animation ----
// The fly, the paper plane, the ball of paper and the ant, drawn by the
// shader where the animation puts them. They are packed side by side in a
// small image, each one in a square cell of SPRITE_CELL pixels, in the order
// of ANIMATION_SPRITES. The shader knows each one by its position in that
// list (the *_SPRITE constants of swirl.frag.glsl, which a test compares
// with this list).
export const SPRITE_CELL = 8;

export const ANIMATION_SPRITES = {
  // A fly in the air, seen from above, with its wings up and then down. The
  // shader switches between both many times a second.
  flyWingsUp: { rows: ['L.L', '.k.'], key: { L: 'lavender', k: 'ink' } },
  flyWingsDown: { rows: ['...', 'LkL'], key: { L: 'lavender', k: 'ink' } },
  // The fly standing on the desk, with its head to the right and its wings
  // folded behind it.
  flyStanding: { rows: ['Lkk'], key: { L: 'lavender', k: 'ink' } },
  // A paper plane flying to the right: its lit wing on top, its folded body
  // in the middle and its shaded wing below.
  paperPlane: {
    rows: ['pp......', '.ppppp..', '..tttppp', '.sssss..', 'ss......'],
    key: { p: 'paper', t: 'tan', s: 'sand' },
  },
  // A ball of crumpled paper, lit from the top left, with the folds of the
  // paper in two tones. The second one is the same ball after a quarter turn,
  // so it seems to roll when the shader switches between them.
  paperBall: {
    rows: ['.pps.', 'ppsqs', 'psqpt', 'sqstt', '.stt.'],
    key: { p: 'paper', q: 'parchment', s: 'sand', t: 'tan' },
  },
  paperBallTurned: {
    rows: ['.pqp.', 'pqsps', 'qpqst', 'sstqt', '.stt.'],
    key: { p: 'paper', q: 'parchment', s: 'sand', t: 'tan' },
  },
  // A small red ant seen from the side, walking to the right with a crumb
  // of bread in its jaws: the abdomen, a thin waist, the chest, the head with
  // its eye and two antennae in a V, and three legs that move in turns. Each
  // part is lit at the top (vermilion) and shaded below (wine).
  antStepA: {
    rows: ['....w.w', 'vc.v.v.', 'cwcwckq', 'w.w.w..'],
    key: { c: 'crimson', v: 'vermilion', w: 'wine', k: 'ink', q: 'parchment' },
  },
  antStepB: {
    rows: ['....w.w', 'vc.v.v.', 'cwcwckq', '.w.w.w.'],
    key: { c: 'crimson', v: 'vermilion', w: 'wine', k: 'ink', q: 'parchment' },
  },
  // The same ant turned to the left, to look back. The light on its abdomen
  // stays at the top left.
  antLookingBack: {
    rows: ['w.w....', '.v.v.vc', 'qkcwcwc', '.w.w.w.'],
    key: { c: 'crimson', v: 'vermilion', w: 'wine', k: 'ink', q: 'parchment' },
  },
} satisfies Record<string, Sprite>;

export type AnimationSpriteName = keyof typeof ANIMATION_SPRITES;

// The image with all the sprites of the animation: one color position per
// pixel, NOTHING where it is empty.
export function paintAnimationSprites(): { width: number; height: number; pixels: Uint8Array } {
  const names = Object.keys(ANIMATION_SPRITES) as AnimationSpriteName[];
  const width = names.length * SPRITE_CELL;
  const layer = createLayer(width, SPRITE_CELL);
  names.forEach((name, index) => {
    const sprite: Sprite = ANIMATION_SPRITES[name];
    sprite.rows.forEach((row, rowIndex) => {
      [...row].forEach((letter, column) => {
        const color = sprite.key[letter];
        if (color !== undefined) {
          layer.put(index * SPRITE_CELL + column, rowIndex, color);
        }
      });
    });
  });
  return { width, height: SPRITE_CELL, pixels: layer.pixels };
}

// Exported only for the tests, which check that every sprite is well formed.
export const DESK_SPRITES_FOR_TESTS: Record<string, Sprite> = {
  PENCIL,
  ERASER,
  CRUMB,
  SHARPENER,
  SHAVING_BIG,
  SHAVING_SMALL,
  SHAVING_FLAT,
  PENCIL_CASE,
  BALLPOINT,
  ...ANIMATION_SPRITES,
};
