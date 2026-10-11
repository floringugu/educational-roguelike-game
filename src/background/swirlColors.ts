import { PALETTE, type PaletteColorName } from '../theme/palette';

// The colors of the background (FR-VIS-001): a green school desk with its
// chair, on the terrazzo floor of a classroom, seen from a high three-quarter
// view (ADR-0014). They are parameters taken from the fixed palette
// (FR-VIS-004), never free colors. The things lying on the desk (pencil,
// eraser...) are small sprites with their own colors, in deskScene.ts.
export type SwirlColors = {
  // The floor: light terrazzo with specks, and the seams between its tiles.
  floor: PaletteColorName;
  floorSpeck: PaletteColorName;
  floorSeam: PaletteColorName;
  // The shadow of the desk on the floor.
  floorShadow: PaletteColorName;
  // The formica top: its color, its lit edges (far and left) and its shaded
  // edge (right), and the dark line around it.
  desk: PaletteColorName;
  deskLight: PaletteColorName;
  deskShade: PaletteColorName;
  deskOutline: PaletteColorName;
  // The rounded wooden front edge of the top: its lit top, its side and the
  // darker lines of its grain.
  deskEdge: PaletteColorName;
  deskEdgeSide: PaletteColorName;
  deskEdgeGrain: PaletteColorName;
  // The metal tubes of the desk and the chair, lit from the left, and the
  // rubber feet.
  metal: PaletteColorName;
  metalShade: PaletteColorName;
  feet: PaletteColorName;
  // The cuts made with a blade in the formica: the dark groove, its lit wall
  // where the board under the formica shows, and the chips around it.
  cutGroove: PaletteColorName;
  cutWall: PaletteColorName;
  cutChip: PaletteColorName;
  // The shadow of the things lying on the desk.
  objectShadow: PaletteColorName;
};

export const SWIRL_COLORS: SwirlColors = {
  floor: 'parchment',
  floorSpeck: 'sand',
  floorSeam: 'tan',
  floorShadow: 'sand',
  desk: 'sage',
  deskLight: 'khaki',
  deskShade: 'olive',
  deskOutline: 'ink',
  deskEdge: 'sand',
  deskEdgeSide: 'tan',
  deskEdgeGrain: 'leather',
  metal: 'khaki',
  metalShade: 'olive',
  feet: 'ink',
  cutGroove: 'umber',
  cutWall: 'tan',
  cutChip: 'khaki',
  objectShadow: 'olive',
};

// NFR-ACS-001. The desk is light, so the texts drawn right on it are dark
// (the roles deskText and deskTitle of the palette). These lists say which
// colors of the background can end up under them; a test checks a contrast
// of 4.5:1 for each one.
//   - The texts in ink (the name of the enemy and the numbers of the
//     health) can land on the floor, the formica, the front edge and the
//     tubes.
//   - The title of the combat, in wine, is always on the floor above the
//     desk. There the floor only uses its color and its specks: deskScene.ts
//     draws the seams of the tiles with the color of the specks.
// The rest are thin lines or small things that the layout keeps away from
// the texts: the outline of the top, the grain of its edge, the feet, the
// cuts (at the top corners of the desk) and the shadows of the objects (in
// the free space between the enemy and the player). The fly, the paper
// plane, the ant and the ball of paper of the animation are small and only
// pass by, the ball to the right of the enemy, away from the texts.
export const COLORS_UNDER_DESK_TEXT: ReadonlyArray<keyof SwirlColors> = [
  'floor',
  'floorSpeck',
  'floorSeam',
  'floorShadow',
  'desk',
  'deskLight',
  'deskShade',
  'deskEdge',
  'deskEdgeSide',
  'metal',
  'metalShade',
];

export const COLORS_UNDER_DESK_TITLE: ReadonlyArray<keyof SwirlColors> = ['floor', 'floorSpeck'];

// The color each color turns into under the shadow of the fly, the paper
// plane or the ball of paper: the next one down its ramp. The darkest color of each ramp turns
// into ink, and olive into umber, a brown as dark as it.
export const SHADED_COLOR: Record<PaletteColorName, PaletteColorName> = {
  ink: 'ink',
  bark: 'ink',
  umber: 'bark',
  leather: 'umber',
  tan: 'leather',
  sand: 'tan',
  parchment: 'sand',
  paper: 'parchment',
  night: 'ink',
  indigo: 'night',
  periwinkle: 'indigo',
  lavender: 'periwinkle',
  wine: 'ink',
  crimson: 'wine',
  vermilion: 'crimson',
  amber: 'vermilion',
  gold: 'amber',
  forest: 'ink',
  leaf: 'forest',
  lime: 'leaf',
  olive: 'umber',
  sage: 'olive',
  khaki: 'sage',
};

// The static background that replaces the shader when there is no WebGL to
// draw it, not even a single frozen frame (FR-VIS-001). A plain version of
// the scene: the floor, and the formica top centered over it, as wide as the
// desk of the shader (see deskLayout in deskScene.ts) and from the same
// height to the same distance from the bottom, with its lit far edge. It has
// no legs, chair, cuts or objects: they need the shader. It is a value for
// the CSS `background` property: each layer is a block of one color with
// hard edges, so it only uses palette colors.
export function staticSwirlBackground(colors: SwirlColors): string {
  const floor = PALETTE[colors.floor];
  const desk = PALETTE[colors.desk];
  const deskLight = PALETTE[colors.deskLight];
  const deskEdge = PALETTE[colors.deskEdge];
  // In CSS pixels: 4 per pixel of the shader.
  const width = 'min(calc(100% - 48px), 480px)';
  const top = '60px';
  const height = 'calc(100% - 296px)';
  return [
    `linear-gradient(${deskLight} 0 4px, ${desk} 4px calc(100% - 4px), ${deskEdge} calc(100% - 4px)) center ${top} / ${width} ${height} no-repeat`,
    floor,
  ].join(', ');
}
