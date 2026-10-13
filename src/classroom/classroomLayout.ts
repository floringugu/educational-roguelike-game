import { type SpriteId } from '../assets/sprite-ids';

// Where things are in the drawing of the classroom (art guide §2), in pixels
// of the art: x and y from the top left corner of the safe area of 180x320,
// which every screen shows whole (ADR-0015). A place in the margin of the
// drawing around it has an x or a y below 0, or beyond 180 or 320. Other
// tickets place their elements with these values, and the components turn
// them into CSS pixels with `calc(n * var(--art-pixel))`.
//
// The values come from art/classroom.aseprite: if the drawing changes, they
// change with it.
export type ArtRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// The sprites of the classroom are the ones whose identifier starts with
// "classroom-".
export type ClassroomSpriteId = Extract<SpriteId, `classroom-${string}`>;

// The things that ticket 15 animates are separate sprites, already in their
// place (ticket 11), drawn over the classroom in this order. Each PNG
// already leaves out the pixels that the classroom covers, such as the parts
// of the blind slat behind the window frame.
export const CLASSROOM_SPRITES: ReadonlyArray<{ id: ClassroomSpriteId; rect: ArtRect }> = [
  // A loose slat of the blind, and the cloud and the leafy trees seen
  // through the window, in front of the city.
  { id: 'classroom-blind-slat', rect: { x: 16, y: 9, width: 7, height: 8 } },
  { id: 'classroom-cloud', rect: { x: 17, y: 44, width: 9, height: 3 } },
  { id: 'classroom-tree', rect: { x: -18, y: 75, width: 47, height: 39 } },
  // The radiator under the window, with the sandwich wrapped in foil on it.
  { id: 'classroom-radiator', rect: { x: 2, y: 115, width: 26, height: 42 } },
  // The loudspeakers at both sides of the enemy panel.
  { id: 'classroom-speaker-left', rect: { x: 36, y: 19, width: 10, height: 15 } },
  { id: 'classroom-speaker-right', rect: { x: 135, y: 19, width: 10, height: 15 } },
  // The hands of the clock, at the top right.
  { id: 'classroom-clock-minute-hand', rect: { x: 167, y: 21, width: 1, height: 7 } },
  { id: 'classroom-clock-hour-hand', rect: { x: 163, y: 25, width: 5, height: 3 } },
  { id: 'classroom-clock-second-hand', rect: { x: 167, y: 27, width: 4, height: 5 } },
  // The box of confiscated phones, on the right back desk, under the cork
  // board.
  { id: 'classroom-phone-box', rect: { x: 157, y: 99, width: 20, height: 19 } },
  // On the green desk: the pencil case at the left corner, and the spiral
  // notebook with the pen at the right one. They stand at the edges of the
  // whole drawing, so a phone that shows only the safe area sees just their
  // tips.
  { id: 'classroom-pencil-case', rect: { x: -18, y: 163, width: 34, height: 28 } },
  { id: 'classroom-notebook', rect: { x: 170, y: 178, width: 28, height: 36 } },
  { id: 'classroom-pen', rect: { x: 180, y: 193, width: 17, height: 6 } },
];

// The enemy stands in the middle of the green desk (ticket 13). The sprite
// of an enemy is 88x96 and fills this rectangle; its feet stand on its
// bottom edge, the line y = ENEMY_FEET_Y.
export const ENEMY_RECT: ArtRect = { x: 46, y: 92, width: 88, height: 96 };
export const ENEMY_FEET_Y = ENEMY_RECT.y + ENEMY_RECT.height;

// The zones where the game writes on the drawing (ticket 15). A text never
// leaves its zone (art guide §8).
export const TEXT_ZONES = {
  // The two halves of the chalkboard, kept clear of rubbed-out chalk.
  boardLeft: { x: 54, y: 46, width: 40, height: 35 },
  boardRight: { x: 108, y: 46, width: 39, height: 36 },
  // The post-it on the cork board.
  postIt: { x: 160, y: 86, width: 17, height: 13 },
} as const satisfies Record<string, ArtRect>;
