// The hits on the desk (ADR-0014): when the enemy hits the player, the things
// lying on the desk of the background jump a little. The combat only calls
// bumpDesk(); the background listens with onDeskBump(). It is a plain module
// and not React state, so a hit never draws the screen again with React:
// the shader moves the objects in its next frame.
//
// In the prototype of H1 the enemy never attacks, so nothing calls bumpDesk()
// yet. The combat of H2 will call it in the enemy phase, with the damage of
// the hit, for example bumpDesk(Math.min(damage / 12, 1)).

// What a listener receives: how hard the hit was, from 0 to 1.
export type DeskBumpListener = (strength: number) => void;

const listeners = new Set<DeskBumpListener>();

// The highest jump of an object, in pixels of the background (4 CSS pixels
// each). The jump is small on purpose: the background must not distract
// from the combat.
export const MAX_BUMP_LIFT = 2;

// Tells the background that the desk was hit. `strength` goes from 0 (a
// light hit) to 1 (the hardest one); values outside are clamped.
export function bumpDesk(strength: number): void {
  const clampedStrength = Math.min(Math.max(strength, 0), 1);
  for (const listener of listeners) {
    listener(clampedStrength);
  }
}

// Calls `listener` on every hit. Returns the function that stops listening.
export function onDeskBump(listener: DeskBumpListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// How many pixels the objects jump for a hit of that strength: always at
// least one, so even a light hit shows.
export function bumpLiftInPixels(strength: number): number {
  return Math.max(1, Math.round(strength * MAX_BUMP_LIFT));
}
