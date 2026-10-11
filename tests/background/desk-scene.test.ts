import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ANIMATION_SPRITES,
  DESK_SPRITES_FOR_TESTS,
  NOTHING,
  PALETTE_COLOR_NAMES,
  SPRITE_CELL,
  deskLayout,
  paintAnimationSprites,
  paintDeskScene,
} from '../../src/background/deskScene.ts';
import { SWIRL_COLORS } from '../../src/background/swirlColors.ts';

const shaderSource = readFileSync(fileURLToPath(new URL('../../src/background/swirl.frag.glsl', import.meta.url)), 'utf8');

// The value of a `const float` of the shader, such as NOTHING.
function shaderConstant(name: string): number {
  const match = new RegExp(`const float ${name} = ([\\d.]+);`).exec(shaderSource);
  if (match === null) {
    throw new Error(`The shader has no constant ${name}`);
  }
  return Number(match[1]);
}

// Screen sizes in pixels of the background (a quarter of the CSS pixels):
// a phone, a small phone, a phone turned sideways, a desktop and a tiny
// window.
const SIZES = [
  [98, 190],
  [80, 140],
  [190, 98],
  [320, 200],
  [4, 4],
] as const;

describe('FR-VIS-001: where the desk goes', () => {
  it('leaves some floor on each side of the desk on a phone', () => {
    expect(deskLayout(98, 190)).toEqual({ left: 6, right: 91, top: 15, front: 131 });
  });

  it('does not make the desk wider than 120 pixels on a wide screen, and keeps it in the middle', () => {
    const layout = deskLayout(320, 200);
    expect(layout.right - layout.left + 1).toBe(120);
    const floorOnTheLeft = layout.left;
    const floorOnTheRight = 320 - 1 - layout.right;
    expect(Math.abs(floorOnTheLeft - floorOnTheRight)).toBeLessThanOrEqual(1);
  });

  it('keeps the front edge just over the player, counted from the bottom', () => {
    expect(deskLayout(98, 190).front).toBe(190 - 59);
    expect(deskLayout(98, 250).front).toBe(250 - 59);
  });

  it('keeps a desk of at least 60 rows on a short screen', () => {
    const layout = deskLayout(190, 98);
    expect(layout.front - layout.top).toBeGreaterThanOrEqual(60);
  });
});

describe('FR-VIS-004: the painted scene', () => {
  it.each(SIZES)('has a palette color in every pixel of the ground at %ix%i', (width, height) => {
    const scene = paintDeskScene(width, height, SWIRL_COLORS);
    expect(scene.ground.length).toBe(width * height);
    for (const color of scene.ground) {
      expect(color).toBeLessThan(PALETTE_COLOR_NAMES.length);
    }
  });

  it.each(SIZES)('has a palette color or nothing in every pixel of the objects at %ix%i', (width, height) => {
    const scene = paintDeskScene(width, height, SWIRL_COLORS);
    expect(scene.objects.length).toBe(width * height);
    for (const color of scene.objects) {
      expect(color === NOTHING || color < PALETTE_COLOR_NAMES.length, `color ${color}`).toBe(true);
    }
  });

  it('puts some objects on the desk of a phone', () => {
    const scene = paintDeskScene(98, 190, SWIRL_COLORS);
    expect(scene.objects.some((color) => color !== NOTHING)).toBe(true);
  });

  it('paints the same scene every time, so it does not flicker on a resize', () => {
    const first = paintDeskScene(98, 190, SWIRL_COLORS);
    const second = paintDeskScene(98, 190, SWIRL_COLORS);
    expect(second.ground).toEqual(first.ground);
    expect(second.objects).toEqual(first.objects);
  });
});

describe('the sprites of the scene', () => {
  it.each(Object.entries(DESK_SPRITES_FOR_TESTS))('%s has rows of the same length', (_name, sprite) => {
    const width = sprite.rows[0]?.length ?? 0;
    expect(width).toBeGreaterThan(0);
    for (const row of sprite.rows) {
      expect(row.length).toBe(width);
    }
  });

  it.each(Object.entries(DESK_SPRITES_FOR_TESTS))('%s has a color for each of its letters', (_name, sprite) => {
    // paintDeskScene gives the colors of the letters painted on the ground:
    // `o` for the shadows of the objects and `d` for the graphite dust
    // around the sharpener.
    const groundLetters = { o: SWIRL_COLORS.objectShadow, d: 'umber' };
    const colors = { ...groundLetters, ...sprite.key, ...sprite.groundKey };
    for (const letter of sprite.rows.join('').replaceAll('.', '')) {
      expect(Object.keys(colors), `the letter ${letter}`).toContain(letter);
    }
    for (const color of Object.values(colors)) {
      expect(PALETTE_COLOR_NAMES).toContain(color);
    }
  });

  it('fits each sprite of the animation in its cell', () => {
    for (const sprite of Object.values(ANIMATION_SPRITES)) {
      expect(sprite.rows.length).toBeLessThanOrEqual(SPRITE_CELL);
      expect(sprite.rows[0]?.length ?? 0).toBeLessThanOrEqual(SPRITE_CELL);
    }
    const image = paintAnimationSprites();
    expect(image.width).toBe(Object.keys(ANIMATION_SPRITES).length * SPRITE_CELL);
    expect(image.height).toBe(SPRITE_CELL);
    expect(image.pixels.length).toBe(image.width * image.height);
  });
});

// The shader cannot import TypeScript, so it repeats some numbers.
describe('the numbers that the shader repeats', () => {
  it('uses the same number for "nothing" and the same cell size', () => {
    expect(shaderConstant('NOTHING')).toBe(NOTHING);
    expect(shaderConstant('SPRITE_CELL')).toBe(SPRITE_CELL);
  });

  it('numbers the sprites of the animation in the order of ANIMATION_SPRITES', () => {
    const shaderNames: Record<keyof typeof ANIMATION_SPRITES, string> = {
      flyWingsUp: 'FLY_WINGS_UP_SPRITE',
      flyWingsDown: 'FLY_WINGS_DOWN_SPRITE',
      flyStanding: 'FLY_STANDING_SPRITE',
      paperPlane: 'PAPER_PLANE_SPRITE',
      paperBall: 'PAPER_BALL_SPRITE',
      paperBallTurned: 'PAPER_BALL_TURNED_SPRITE',
      antStepA: 'ANT_STEP_A_SPRITE',
      antStepB: 'ANT_STEP_B_SPRITE',
      antLookingBack: 'ANT_LOOKING_BACK_SPRITE',
    };
    Object.keys(ANIMATION_SPRITES).forEach((name, index) => {
      expect(shaderConstant(shaderNames[name as keyof typeof ANIMATION_SPRITES]), name).toBe(index);
    });
  });
});
