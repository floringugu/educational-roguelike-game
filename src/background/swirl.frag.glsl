// Fragment shader of the background (FR-VIS-001), written from scratch for
// Empollatro (R-3). It draws a green school desk with its chair, on the
// floor of a classroom, seen from a high three-quarter view (ticket 04).
//
// The still part of the scene (the floor, the desk, the chair, the cuts in
// the formica and the things lying on it) is painted once in deskScene.ts
// and arrives here as a texture. Each of its pixels holds the position of
// its color in the palette, and the palette texture turns it into the
// color, so every pixel is exactly a palette color (FR-VIS-004). This shader
// puts the scene on the screen and adds what moves, all of it small and
// slow, so it does not distract from the combat:
//
// 1. A fly that comes in, lands on the desk, walks a little and leaves.
// 2. A paper plane that crosses the screen over the desk, with its shadow.
// 3. When the enemy hits the player, the things on the desk jump a pixel or
//    two while their shadows stay (see deskBumps.ts).
// 4. A ball of paper that someone throws: it falls on the desk, bounces,
//    rolls slowly off its right edge, falls to the floor and rolls out of
//    the screen before the loop starts again.
// 5. An ant that crosses the desk with a crumb, stops and looks back.
//
// The animation is a loop. Everything that moves depends on u_phase, an angle
// that goes from 0 to 2*pi once per loop, so the last frame of the loop joins
// the first one. The numbers also stay small, which matters on phones whose
// GPU uses low precision floats. The first frame of the loop, the one shown
// when the background is frozen, has nothing moving on the desk.
//
// All positions are whole pixels of the image (each one is 4x4 CSS pixels),
// counted from the top left corner of the screen, with y going down.

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution; // size of the canvas, in pixels
uniform float u_phase; // from 0 to 2*pi, once per loop
// The still scene: the ground in red, the objects in green.
uniform sampler2D u_scene;
// The sprites of the animation, side by side, and the size of that image in
// pixels.
uniform sampler2D u_sprites;
uniform vec2 u_spritesSize;
// The palette: the colors and their shaded versions, in two rows, and how
// many colors it has.
uniform sampler2D u_palette;
uniform float u_paletteSize;
// The top of the desk: its left column, top row, right column and front row.
uniform vec4 u_desk;
// The last hit on the desk: seconds since it happened and how many pixels
// the objects jump. The jump is 0 when there has been no hit.
uniform float u_bumpSeconds;
uniform float u_bumpLift;

const float TWO_PI = 6.2831853;

// Stored where there is no color (NOTHING in deskScene.ts).
const float NOTHING = 255.0;

// The rows of the palette texture.
const float NORMAL_ROW = 0.0;
const float SHADED_ROW = 1.0;
const float PALETTE_ROWS = 2.0;

// The sprites of the animation, in the order of ANIMATION_SPRITES in
// deskScene.ts. Each one fills a square cell of SPRITE_CELL pixels.
const float FLY_WINGS_UP_SPRITE = 0.0;
const float FLY_WINGS_DOWN_SPRITE = 1.0;
const float FLY_STANDING_SPRITE = 2.0;
const float PAPER_PLANE_SPRITE = 3.0;
const float PAPER_BALL_SPRITE = 4.0;
const float PAPER_BALL_TURNED_SPRITE = 5.0;
const float ANT_STEP_A_SPRITE = 6.0;
const float ANT_STEP_B_SPRITE = 7.0;
const float ANT_LOOKING_BACK_SPRITE = 8.0;
const float SPRITE_CELL = 8.0;

// ---- Reading the textures ----

// A texture channel holds a number from 0 to 255 as a value from 0 to 1.
float storedNumber(float channel) {
  return floor(channel * 255.0 + 0.5);
}

// The color position of the ground and of the objects at a pixel. The
// pixel is read at its center (+0.5), so it never falls between two.
float groundAt(vec2 pixel) {
  return storedNumber(texture2D(u_scene, (pixel + 0.5) / u_resolution).r);
}

float objectAt(vec2 pixel) {
  return storedNumber(texture2D(u_scene, (pixel + 0.5) / u_resolution).g);
}

vec3 paletteColor(float position, float row) {
  return texture2D(u_palette, vec2((position + 0.5) / u_paletteSize, (row + 0.5) / PALETTE_ROWS)).rgb;
}

// The color position of a sprite at a pixel counted from its top left
// corner, or NOTHING outside it.
float spriteAt(float sprite, vec2 pixel) {
  if (pixel.x < 0.0 || pixel.y < 0.0 || pixel.x >= SPRITE_CELL || pixel.y >= SPRITE_CELL) {
    return NOTHING;
  }
  vec2 inImage = vec2(sprite * SPRITE_CELL, 0.0) + pixel + 0.5;
  return storedNumber(texture2D(u_sprites, inImage / u_spritesSize).r);
}

// ---- 1 and 2. The fly and the paper plane ----

// Something that moves over the desk: the top left corner of its sprite,
// which sprite it shows (NOTHING when it is out of sight) and how high it
// flies, which is how far its shadow falls.
struct Flyer {
  vec2 position;
  float sprite;
  float height;
};

const Flyer AWAY = Flyer(vec2(0.0), NOTHING, 0.0);

// The fly, at a point of the loop. It comes in from the left between 0.08
// and 0.13, stands on the desk to the left of the enemy until 0.30, taking
// two steps, and leaves to the top left. It beats its wings 12 times a
// second.
Flyer fly(float loop) {
  vec2 landing = vec2(u_desk.x + 8.0, u_desk.y + 52.0);
  float wings = mod(floor(loop * 720.0), 2.0) == 0.0 ? FLY_WINGS_UP_SPRITE : FLY_WINGS_DOWN_SPRITE;
  if (loop >= 0.08 && loop < 0.13) {
    float progress = (loop - 0.08) / 0.05;
    vec2 from = vec2(-4.0, u_desk.y + 30.0);
    // It wobbles up and down, less and less as it lands.
    vec2 position = mix(from, landing, progress) + vec2(0.0, 3.0 * sin(progress * 12.566) * (1.0 - progress));
    return Flyer(floor(position + 0.5), wings, floor(4.0 * (1.0 - progress) + 0.5));
  }
  if (loop >= 0.13 && loop < 0.30) {
    float steps = (loop > 0.19 ? 1.0 : 0.0) + (loop > 0.24 ? 1.0 : 0.0);
    return Flyer(landing + vec2(steps, 0.0), FLY_STANDING_SPRITE, 0.0);
  }
  if (loop >= 0.30 && loop < 0.35) {
    float progress = (loop - 0.30) / 0.05;
    vec2 from = landing + vec2(2.0, 0.0);
    vec2 to = vec2(u_desk.x - 12.0, -4.0);
    vec2 position = mix(from, to, progress) + vec2(3.0 * sin(progress * 9.425), 0.0);
    return Flyer(floor(position + 0.5), wings, floor(4.0 * progress + 0.5));
  }
  return AWAY;
}

// The paper plane, at a point of the loop. It crosses the whole screen from
// left to right between 0.58 and 0.66 (about 5 seconds), over the free far
// part of the desk, between the tally of the days and the enemy, so no text
// covers it. It comes down slowly and rocks a pixel up and down.
Flyer paperPlane(float loop) {
  if (loop < 0.58 || loop >= 0.66) {
    return AWAY;
  }
  float progress = (loop - 0.58) / 0.08;
  float x = mix(-10.0, u_resolution.x + 2.0, progress);
  float y = u_desk.y + 12.0 + 4.0 * progress + sin(progress * 18.85);
  return Flyer(floor(vec2(x, y) + 0.5), PAPER_PLANE_SPRITE, floor(7.0 - 2.0 * progress + 0.5));
}

// The color position of a flyer at a pixel, or NOTHING.
float flyerAt(Flyer flyer, vec2 pixel) {
  if (flyer.sprite == NOTHING) {
    return NOTHING;
  }
  return spriteAt(flyer.sprite, pixel - flyer.position);
}

// True if the shadow of a flyer falls on the pixel. With the light from the
// top left, the shadow falls down and to the right, farther the higher it
// flies. A fly standing on the desk has no shadow.
bool inShadowOf(Flyer flyer, vec2 pixel) {
  if (flyer.sprite == NOTHING || flyer.height <= 0.0) {
    return false;
  }
  vec2 shadowPosition = flyer.position + vec2(floor(flyer.height * 0.5), flyer.height);
  return spriteAt(flyer.sprite, pixel - shadowPosition) != NOTHING;
}

// ---- 3. The jump of the objects ----

// How long a jump lasts, in seconds.
const float BUMP_SECONDS = 0.25;

// How many pixels up the objects are. They all jump together, so each one
// moves in one piece.
float objectLift() {
  if (u_bumpLift <= 0.0 || u_bumpSeconds > BUMP_SECONDS) {
    return 0.0;
  }
  // Up and down again, like a ball thrown up: a parabola.
  float progress = u_bumpSeconds / BUMP_SECONDS;
  return floor(u_bumpLift * 4.0 * progress * (1.0 - progress) + 0.5);
}

// ---- 4. The ball of paper ----

// How far the ball falls when it rolls off the side of the desk: the height
// of the desk, from its top to the feet of its front legs (deskScene.ts).
const float DESK_HEIGHT = 36.0;

// The ball of paper, at a point of the loop. Someone at the back of the
// class throws it at 0.70: it falls from above the screen to the right of
// the enemy, below the carved heart, and bounces twice. Then it keeps
// rolling slowly to the right, at 2 pixels per second, until it goes over
// the right edge of the desk at 0.847. It falls to the floor, bounces once
// and rolls out of the screen, faster after the fall, so it is gone before
// the loop starts again. It spins in the air and turns a quarter for each
// pixel it rolls.
//
// `ground` is the point under the ball (on the desk or on the floor) and
// `height` how high above it the ball is. The ball shows that many pixels
// higher, and its shadow stays on the ground (see inShadowOf). The ball is
// always one pixel higher than its height, so that, lying on the ground, it
// has a line of shadow under it like the other things.
Flyer paperBall(float loop) {
  if (loop < 0.70) {
    return AWAY;
  }
  vec2 landing = vec2(u_desk.z - 18.0, u_desk.y + 40.0);
  // Where it goes over the edge: 2 pixels of it, of 5, still on the desk.
  vec2 edge = landing + vec2(16.0, 1.0);
  vec2 onTheFloor = edge + vec2(3.0, DESK_HEIGHT);
  float spinning = mod(floor(loop * 250.0), 2.0) == 0.0 ? PAPER_BALL_SPRITE : PAPER_BALL_TURNED_SPRITE;
  vec2 ground;
  float height;
  float sprite;
  bool onTheDesk = true;
  if (loop < 0.73) {
    // Falling from farther back, faster and faster.
    float progress = (loop - 0.70) / 0.03;
    ground = mix(landing + vec2(-8.0, -24.0), landing, progress);
    height = (landing.y + 16.0) * (1.0 - progress * progress);
    sprite = spinning;
  } else if (loop < 0.745) {
    // The first bounce, 4 pixels high: up and down again, a parabola.
    float progress = (loop - 0.73) / 0.015;
    ground = landing + vec2(3.0 * progress, progress);
    height = 4.0 * 4.0 * progress * (1.0 - progress);
    sprite = spinning;
  } else if (loop < 0.755) {
    // The second bounce, 1 pixel high.
    float progress = (loop - 0.745) / 0.01;
    ground = landing + vec2(3.0 + 2.0 * progress, 1.0);
    height = 4.0 * progress * (1.0 - progress);
    sprite = spinning;
  } else if (loop < 0.847) {
    // Rolling the 11 pixels to the edge. 2 pixels per second are 120 per
    // loop, so it takes 11 / 120 = 0.092 of the loop.
    float rolled = min(floor(120.0 * (loop - 0.755) + 0.5), 11.0);
    ground = landing + vec2(5.0 + rolled, 1.0);
    height = 0.0;
    sprite = mod(rolled, 2.0) == 0.0 ? PAPER_BALL_SPRITE : PAPER_BALL_TURNED_SPRITE;
  } else if (loop < 0.857) {
    // Falling down the side of the desk, faster and faster. From now on the
    // ground under it is the floor, a desk height lower on the screen, so it
    // shows at the same place at the start of the fall.
    float progress = (loop - 0.847) / 0.01;
    ground = mix(edge + vec2(0.0, DESK_HEIGHT), onTheFloor, progress);
    height = DESK_HEIGHT * (1.0 - progress * progress);
    sprite = spinning;
    onTheDesk = false;
  } else if (loop < 0.865) {
    // One bounce on the floor, 2 pixels high.
    float progress = (loop - 0.857) / 0.008;
    ground = onTheFloor + vec2(2.0 * progress, 0.0);
    height = 4.0 * 2.0 * progress * (1.0 - progress);
    sprite = spinning;
    onTheDesk = false;
  } else {
    // Rolling on the floor at 16 pixels per second (960 per loop) until it
    // leaves the screen: the widest floor, beside a wide desk, is about 100
    // pixels, so it is out after some 6 seconds, before the loop ends.
    float rolled = floor(960.0 * (loop - 0.865) + 0.5);
    ground = onTheFloor + vec2(2.0 + rolled, 0.0);
    height = 0.0;
    sprite = mod(rolled, 2.0) == 0.0 ? PAPER_BALL_SPRITE : PAPER_BALL_TURNED_SPRITE;
    onTheDesk = false;
  }
  // Lying on the desk, it jumps with the other things when the enemy hits.
  float lift = onTheDesk ? objectLift() : 0.0;
  float shownHeight = floor(height + 0.5) + 1.0 + lift;
  return Flyer(floor(ground + 0.5) - vec2(0.0, shownHeight), sprite, shownHeight);
}

// ---- 5. The ant ----

// The ant, at a point of the loop. It comes up the left edge of the desk at
// 0.38 and walks to the right, carrying a crumb, along the free row between
// the carved heart and the intent of the enemy. At 0.47 it stops, looks
// back for a moment and goes on, until it goes down the right edge at 0.66.
// It moves its legs at each pixel it walks, and it takes the same time on
// any desk, so it walks a bit faster on a wide one.
Flyer ant(float loop) {
  if (loop < 0.38 || loop >= 0.66) {
    return AWAY;
  }
  // From just out of the left edge to just out of the right one.
  float start = u_desk.x - 7.0;
  float end = u_desk.z + 1.0;
  float stop = floor(mix(start, end, 0.4) + 0.5);
  float x;
  float sprite;
  if (loop < 0.47) {
    x = floor(mix(start, stop, (loop - 0.38) / 0.09) + 0.5);
    sprite = mod(x, 2.0) == 0.0 ? ANT_STEP_A_SPRITE : ANT_STEP_B_SPRITE;
  } else if (loop < 0.53) {
    x = stop;
    sprite = loop >= 0.49 && loop < 0.51 ? ANT_LOOKING_BACK_SPRITE : ANT_STEP_A_SPRITE;
  } else {
    x = floor(mix(stop, end, (loop - 0.53) / 0.13) + 0.5);
    sprite = mod(x, 2.0) == 0.0 ? ANT_STEP_A_SPRITE : ANT_STEP_B_SPRITE;
  }
  return Flyer(vec2(x, u_desk.y + 18.0), sprite, 0.0);
}

// The color position of the ant at a pixel, or NOTHING. Only the part of it
// on the top of the desk shows, inside its outline: the rest is still
// climbing the edge.
float antAt(Flyer theAnt, vec2 pixel) {
  if (pixel.x <= u_desk.x || pixel.x >= u_desk.z) {
    return NOTHING;
  }
  return flyerAt(theAnt, pixel);
}

void main() {
  vec2 bottomLeft = floor(gl_FragCoord.xy);
  vec2 pixel = vec2(bottomLeft.x, u_resolution.y - 1.0 - bottomLeft.y);
  // Where we are in the loop, from 0 to 1.
  float loop = u_phase / TWO_PI;

  // The scene: the ground, and over it the objects, which are read a few
  // pixels lower while they jump, so they show higher up.
  float color = groundAt(pixel);
  float object = objectAt(pixel + vec2(0.0, objectLift()));
  if (object != NOTHING) {
    color = object;
  }

  // The ant walks on the desk, so the shadows fall on it too.
  float antColor = antAt(ant(loop), pixel);
  if (antColor != NOTHING) {
    color = antColor;
  }

  // The shadows of what flies.
  Flyer theFly = fly(loop);
  Flyer thePlane = paperPlane(loop);
  Flyer theBall = paperBall(loop);
  bool shaded = inShadowOf(theFly, pixel) || inShadowOf(thePlane, pixel) || inShadowOf(theBall, pixel);
  vec3 pixelColor = paletteColor(color, shaded ? SHADED_ROW : NORMAL_ROW);

  // What flies, on top of everything: the ball, the fly over it and the
  // plane over both.
  float ballColor = flyerAt(theBall, pixel);
  if (ballColor != NOTHING) {
    pixelColor = paletteColor(ballColor, NORMAL_ROW);
  }
  float flyColor = flyerAt(theFly, pixel);
  if (flyColor != NOTHING) {
    pixelColor = paletteColor(flyColor, NORMAL_ROW);
  }
  float planeColor = flyerAt(thePlane, pixel);
  if (planeColor != NOTHING) {
    pixelColor = paletteColor(planeColor, NORMAL_ROW);
  }

  gl_FragColor = vec4(pixelColor, 1.0);
}
