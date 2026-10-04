// Fragment shader of the swirl background (FR-VIS-001), written from scratch
// for Empollatro (R-3). It works in three steps:
//
// 1. Twist. Each pixel is rotated around the center of the screen by an angle
//    that grows towards the center. Straight stripes turn into a spiral.
// 2. Domain warping. The twisted position is pushed a few times by sine waves
//    of growing frequency, each one smaller than the one before. That bends
//    the spiral into irregular streaks of paint.
// 3. Bands. A smooth value read from the warped position picks one of the
//    three colors, without blending them, so every pixel is exactly a palette
//    color (FR-VIS-004).
//
// The animation is a loop. Everything that moves depends on u_phase, an angle
// that goes from 0 to 2*pi once per loop, multiplied only by whole numbers, so
// the last frame of the loop joins the first one. The numbers also stay small,
// which matters on phones whose GPU uses low precision floats.

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution; // size of the canvas, in pixels
uniform float u_phase; // from 0 to 2*pi, once per loop
uniform vec3 u_baseColor;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;

// How much the spiral turns. TWIST_CORE keeps the angle finite at the center.
const float TWIST_STRENGTH = 2.4;
const float TWIST_CORE = 0.45;

// How many stripes cross the screen before warping.
const float STRIPE_DENSITY = 3.0;

// How far the first sine wave pushes the position. Each following wave
// pushes less (divided by its number).
const float WARP_STRENGTH = 0.7;

// Limits between the bands of `paint`, which goes from -1 to 1. Below the
// first one, the base color; between both, the primary; above, the secondary.
const float PRIMARY_FROM = 0.0;
const float SECONDARY_FROM = 0.6;

void main() {
  // Position of the pixel relative to the center of the screen. Dividing by
  // the shorter side keeps the swirl round on any screen shape.
  vec2 position = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  // 1. Twist: the closer to the center, the bigger the angle. Adding u_phase
  //    turns the whole spiral once per loop.
  float radius = length(position);
  float angle = TWIST_STRENGTH / (radius + TWIST_CORE) + u_phase;
  float cosine = cos(angle);
  float sine = sin(angle);
  vec2 twisted = vec2(
    cosine * position.x - sine * position.y,
    sine * position.x + cosine * position.y
  );

  // 2. Domain warping. Each wave moves at its own whole number of turns per
  //    loop, in alternating directions, so the streaks keep changing shape.
  vec2 warped = twisted * STRIPE_DENSITY;
  for (int wave = 1; wave <= 4; wave++) {
    float waveNumber = float(wave);
    warped += (WARP_STRENGTH / waveNumber) * vec2(
      sin(waveNumber * warped.y + waveNumber * u_phase),
      cos(waveNumber * warped.x - (waveNumber + 1.0) * u_phase)
    );
  }

  // 3. Bands.
  float paint = sin(warped.x + warped.y);
  vec3 pixelColor = u_baseColor;
  if (paint > SECONDARY_FROM) {
    pixelColor = u_secondaryColor;
  } else if (paint > PRIMARY_FROM) {
    pixelColor = u_primaryColor;
  }

  gl_FragColor = vec4(pixelColor, 1.0);
}
