// Identifiers of the sprites in the catalog. They are in their own file, with
// no Vite code, so scripts and tests can use them (see catalog.ts).
export const SPRITE_IDS = [
  'card-art-books',
  'card-art-chalk',
  'card-art-cheat-sheet',
  'card-art-coffee',
  'card-art-empty-desk',
  'enemy-brute',
] as const;

export type SpriteId = (typeof SPRITE_IDS)[number];
