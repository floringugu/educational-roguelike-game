// Asset catalog (FR-VIS-004): sprites are requested by identifier, so
// replacing a sprite means replacing its file, without touching any component.
//
// To add a sprite: put the PNG in src/assets/sprites/<id>.png, add its id to
// sprite-ids.ts and list it in src/data/licenses.ts (R-4).

import { type SpriteId } from './sprite-ids';

export { SPRITE_IDS, type SpriteId } from './sprite-ids';

// Vite replaces this with the URL of every PNG in the folder. The key is the
// file path, for example './sprites/enemy-midterm.png'.
const spriteUrls = import.meta.glob<string>('./sprites/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getSpriteUrl(id: SpriteId): string {
  const url = spriteUrls[`./sprites/${id}.png`];
  if (url === undefined) {
    throw new Error(`The sprite "${id}" is in the catalog but its file is missing`);
  }
  return url;
}

// The planes of the classroom that cover the whole game frame (ADR-0015,
// ADR-0017), from the farthest to the nearest: the city seen through the
// window, which is third-party art with an entry of its own in the license
// register; the room, with a hole in the glass of the window; the desks at
// the back; the layer of light; and the green desk in front.
export type BackgroundId =
  | 'classroom-city'
  | 'classroom-room'
  | 'classroom-back-desks'
  | 'classroom-light'
  | 'classroom-desk';

const backgroundUrls = import.meta.glob<string>('./backgrounds/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getBackgroundUrl(id: BackgroundId): string {
  const url = backgroundUrls[`./backgrounds/${id}.png`];
  if (url === undefined) {
    throw new Error(`The background "${id}" is in the catalog but its file is missing`);
  }
  return url;
}

// License texts that travel with their work, such as the OFL of a font
// (R-4). Asking Vite for their URL is what copies them into the build; a
// file that nothing imports would be left out.
const licenseFileUrls = import.meta.glob<string>('./**/*.txt', {
  eager: true,
  query: '?url',
  import: 'default',
});

// `path` is relative to src/assets/, as in the license register.
export function getLicenseFileUrl(path: string): string {
  const url = licenseFileUrls[`./${path}`];
  if (url === undefined) {
    throw new Error(`The license file "${path}" is missing`);
  }
  return url;
}
