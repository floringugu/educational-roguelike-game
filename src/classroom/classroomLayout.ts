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

// The planes of the classroom (ADR-0017), from the farthest to the nearest.
// Each one is a PNG of its own, and the camera (camera.ts) moves the nearer
// ones further, so the room seems to have depth:
// - city: the city seen through the glass of the window;
// - room: the walls, the floor, the window, the chalkboard, the cork board
//   and the clock, with a hole in the glass;
// - backDesks: the desks at the back of the room;
// - light: the layer of light from the window, the only one with
//   semitransparent pixels (art guide §4);
// - desk: the green desk in front, where the enemy stands.
export const CLASSROOM_PLANES = ['city', 'room', 'backDesks', 'light', 'desk'] as const;
export type ClassroomPlane = (typeof CLASSROOM_PLANES)[number];

export type ClassroomSprite = {
  id: ClassroomSpriteId;
  // The plane the sprite belongs to: it moves with it.
  plane: ClassroomPlane;
  // Where it stands. With frames, the size of one frame.
  rect: ArtRect;
  // A sprite that changes its drawing (ticket 15) is a strip of frames side
  // by side, `frames` times as wide as its rect. The first frame is the one
  // drawn in art/classroom.aseprite.
  frames?: number;
};

// The things that ticket 15 animates are separate sprites, already in their
// place (ticket 11), drawn over their plane in this order. Each PNG already
// leaves out the pixels that the planes in front of it cover, such as the
// parts of the cloud behind the window frame.
export const CLASSROOM_SPRITES: ReadonlyArray<ClassroomSprite> = [
  // The cloud and the leafy trees seen through the window, in front of the
  // city. The trees sway in 4 frames.
  { id: 'classroom-cloud', plane: 'city', rect: { x: 17, y: 44, width: 9, height: 3 } },
  { id: 'classroom-tree', plane: 'city', rect: { x: -18, y: 75, width: 47, height: 39 }, frames: 4 },
  // A loose slat of the blind.
  { id: 'classroom-blind-slat', plane: 'room', rect: { x: 16, y: 9, width: 7, height: 8 } },
  // The radiator under the window, with the sandwich wrapped in foil on it.
  { id: 'classroom-radiator', plane: 'room', rect: { x: 2, y: 115, width: 26, height: 42 } },
  // The loudspeakers at both sides of the enemy panel.
  { id: 'classroom-speaker-left', plane: 'room', rect: { x: 36, y: 19, width: 10, height: 15 } },
  { id: 'classroom-speaker-right', plane: 'room', rect: { x: 135, y: 19, width: 10, height: 15 } },
  // The hands of the clock, at the top right. The second hand turns in 60
  // frames of 11x11 around the centre of the clock, one per second.
  { id: 'classroom-clock-minute-hand', plane: 'room', rect: { x: 167, y: 21, width: 1, height: 7 } },
  { id: 'classroom-clock-hour-hand', plane: 'room', rect: { x: 163, y: 25, width: 5, height: 3 } },
  { id: 'classroom-clock-second-hand', plane: 'room', rect: { x: 162, y: 22, width: 11, height: 11 }, frames: 60 },
  // The box of confiscated phones, on the right back desk, under the cork
  // board.
  { id: 'classroom-phone-box', plane: 'backDesks', rect: { x: 157, y: 99, width: 20, height: 19 } },
  // The things on the green desk that the player can pick up are not here:
  // they move on their own, with their shadows (deskItems.ts, ticket 17).
];

// The specks of dust that float up through the beam of light (ticket 15):
// single pixels of the art, in the light plane.
export const DUST_MOTES: ReadonlyArray<{ x: number; y: number }> = [
  { x: 45, y: 120 },
  { x: 54, y: 130 },
  { x: 71, y: 127 },
  { x: 78, y: 138 },
  { x: 86, y: 122 },
  { x: 100, y: 134 },
  { x: 114, y: 144 },
  { x: 128, y: 140 },
  { x: 139, y: 149 },
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
