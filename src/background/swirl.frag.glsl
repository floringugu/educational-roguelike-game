// Fragment shader of the background (FR-VIS-001), written from scratch for
// Empollatro (R-3). It draws the wooden top of a school desk seen from above,
// so the cards and the enemies lie on it. It works in three steps:
//
// 1. Grain. A value that grows from the bottom to the top of the screen. Its
//    lines of equal value are the lines of the grain. A few slow sine waves
//    bend them and change the space between them, like in real wood.
// 2. Knots. Around a few points the value rises like a small hill, so the
//    grain bends around them and closes into rings. The knots drift a little
//    and the grain flows around them.
// 3. Bands. The fraction of the value picks one of the three colors, without
//    blending them, so every pixel is exactly a palette color (FR-VIS-004).
// 4. Details. On top of the wood, things a student leaves on a desk: a heart
//    with two initials and other doodles drawn with a black pen, and an
//    eraser. They do not move. They are built from lines and simple shapes,
//    measured in pixels of the image (each one is 4x4 CSS pixels): the
//    doodles in the corners and the eraser against the left edge, where the
//    interface leaves the desk free. The
//    eraser is light, so no text may go on it (see swirlColors.ts).
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
uniform vec3 u_penColor;
uniform vec3 u_eraserColor;
uniform vec3 u_eraserSleeveColor;

// How many grain lines cross the shorter side of the screen.
const float GRAIN_DENSITY = 9.0;

// How many rings a knot adds: the height of its hill in grain lines.
const float KNOT_RINGS = 3.0;
// Knots are longer than tall, because they stretch along the grain.
const float KNOT_STRETCH = 0.55;

// Limits inside each grain line, which goes from 0 to 1: below the first
// one, the base color; between both, the primary; above, the secondary.
const float PRIMARY_FROM = 0.55;
const float SECONDARY_FROM = 0.85;

// Adds the hill of one knot. center is where it is, size how big it is and
// turns how many small circles it drifts around center in each loop.
float knot(vec2 position, vec2 center, float size, float turns) {
  vec2 drift = vec2(0.04 * cos(turns * u_phase), 0.03 * sin(turns * u_phase));
  vec2 offset = position - center - drift;
  offset.x *= KNOT_STRETCH;
  float distanceSquared = dot(offset, offset) / (size * size);
  return KNOT_RINGS * exp(-distanceSquared);
}

// ---- Details (step 4) ----
// Every shape gets `pixel`: the pixel being drawn, in whole pixels of the
// image, counted from the top left corner of the shape. Its center is at
// +0.5, like the centers of the lines below, so straight lines and 45 degree
// lines come out one pixel thick, as if drawn by hand in pixel art.

// True if the pixel is on the line from a to b, both given in whole pixels.
bool onLine(vec2 pixel, vec2 a, vec2 b) {
  vec2 center = pixel + 0.5;
  vec2 start = a + 0.5;
  vec2 direction = b - a;
  // How far along the line the closest point is, from 0 (a) to 1 (b).
  float along = clamp(dot(center - start, direction) / max(dot(direction, direction), 0.0001), 0.0, 1.0);
  return length(center - (start + along * direction)) < 0.55;
}

// True inside the classic heart curve (x^2 + y^2 - 1)^3 - x^2 y^3 <= 0, with
// y going up. It is about 2.3 wide and 2.2 tall around (0, 0).
bool insideHeart(vec2 point) {
  float a = dot(point, point) - 1.0;
  return a * a * a - point.x * point.x * point.y * point.y * point.y <= 0.0;
}

// The outline of a heart, HEART_SIZE pixels from its center to the side,
// with its center at (11, 11).
const float HEART_SIZE = 9.0;
vec2 heartPoint(vec2 pixel) {
  // From pixels, y going down, to the curve, y going up.
  return (pixel + 0.5 - vec2(11.0, 11.0)) / HEART_SIZE * vec2(1.0, -1.0);
}

bool onHeart(vec2 pixel) {
  vec2 point = heartPoint(pixel);
  // One pixel, measured on the curve.
  float onePixel = 1.0 / HEART_SIZE;
  // On the outline: inside, but with a neighbour outside.
  return insideHeart(point) && !(
    insideHeart(point + vec2(onePixel, 0.0)) && insideHeart(point - vec2(onePixel, 0.0)) &&
    insideHeart(point + vec2(0.0, onePixel)) && insideHeart(point - vec2(0.0, onePixel))
  );
}

// The letters F, + and D, 3 pixels wide and 5 tall, side by side with one
// pixel between them: "F+D", 11 pixels wide.
bool onInitials(vec2 pixel) {
  bool letterF = onLine(pixel, vec2(0.0, 0.0), vec2(0.0, 4.0)) ||
    onLine(pixel, vec2(0.0, 0.0), vec2(2.0, 0.0)) ||
    onLine(pixel, vec2(0.0, 2.0), vec2(1.0, 2.0));
  bool plus = onLine(pixel, vec2(5.0, 1.0), vec2(5.0, 3.0)) ||
    onLine(pixel, vec2(4.0, 2.0), vec2(6.0, 2.0));
  // The D has cut corners, so it does not look like an O.
  bool letterD = onLine(pixel, vec2(8.0, 0.0), vec2(8.0, 4.0)) ||
    onLine(pixel, vec2(8.0, 0.0), vec2(9.0, 0.0)) ||
    onLine(pixel, vec2(8.0, 4.0), vec2(9.0, 4.0)) ||
    onLine(pixel, vec2(10.0, 1.0), vec2(10.0, 3.0));
  return letterF || plus || letterD;
}

// An arrow through the heart, from the bottom left to the top right. It
// goes behind the heart: it is not drawn inside it.
bool onArrow(vec2 pixel) {
  if (insideHeart(heartPoint(pixel))) {
    return false;
  }
  // At 45 degrees, through the middle of the heart, the line is clean.
  bool shaft = onLine(pixel, vec2(-3.0, 25.0), vec2(25.0, -3.0));
  bool head = onLine(pixel, vec2(25.0, -3.0), vec2(21.0, -3.0)) || onLine(pixel, vec2(25.0, -3.0), vec2(25.0, 1.0));
  // Two feathers at the tail, shaped like the head.
  bool feathers = false;
  for (int feather = 0; feather < 2; feather++) {
    vec2 base = vec2(-3.0, 25.0) + float(feather) * vec2(2.0, -2.0);
    feathers = feathers || onLine(pixel, base, base - vec2(2.0, 0.0)) || onLine(pixel, base, base + vec2(0.0, 2.0));
  }
  return shaft || head || feathers;
}

// A skull over two crossed bones, 13x15 pixels.
bool onSkull(vec2 pixel) {
  // The top of the head: half a ring.
  vec2 fromCenter = pixel + 0.5 - vec2(6.5, 5.5);
  bool head = pixel.y <= 6.0 && abs(length(fromCenter) - 4.6) < 0.55;
  // The jaw, narrower than the head, with three teeth.
  bool jaw = onLine(pixel, vec2(2.0, 7.0), vec2(4.0, 9.0)) ||
    onLine(pixel, vec2(10.0, 7.0), vec2(8.0, 9.0)) ||
    onLine(pixel, vec2(4.0, 9.0), vec2(8.0, 9.0)) ||
    onLine(pixel, vec2(5.0, 8.0), vec2(5.0, 9.0)) ||
    onLine(pixel, vec2(7.0, 8.0), vec2(7.0, 9.0));
  // Two square eyes of 2x2 and a nose of one pixel.
  vec2 leftEye = pixel - vec2(3.0, 4.0);
  vec2 rightEye = pixel - vec2(8.0, 4.0);
  bool eyes = (leftEye.x >= 0.0 && leftEye.x <= 1.0 && leftEye.y >= 0.0 && leftEye.y <= 1.0) ||
    (rightEye.x >= 0.0 && rightEye.x <= 1.0 && rightEye.y >= 0.0 && rightEye.y <= 1.0);
  bool nose = pixel == vec2(6.0, 6.0);
  // The bones cross under the jaw, with a knob at each end.
  bool bones = onLine(pixel, vec2(1.0, 11.0), vec2(11.0, 14.0)) || onLine(pixel, vec2(1.0, 14.0), vec2(11.0, 11.0));
  bool knobs = pixel == vec2(0.0, 10.0) || pixel == vec2(0.0, 15.0) ||
    pixel == vec2(12.0, 10.0) || pixel == vec2(12.0, 15.0);
  return head || jaw || eyes || nose || bones || knobs;
}

// A star drawn in one stroke, without lifting the pen: five lines that join
// every second point of a pentagon. It is 11x11 pixels.
bool onStar(vec2 pixel) {
  // The five points, starting at the top and going round. Their angles are
  // whole fifths of a turn.
  const float FIFTH_OF_A_TURN = 1.2566371;
  bool star = false;
  for (int point = 0; point < 5; point++) {
    float from = float(point) * 2.0 * FIFTH_OF_A_TURN;
    float to = from + 2.0 * FIFTH_OF_A_TURN;
    vec2 start = floor(vec2(5.0, 5.5) + 5.0 * vec2(sin(from), -cos(from)) + 0.5);
    vec2 end = floor(vec2(5.0, 5.5) + 5.0 * vec2(sin(to), -cos(to)) + 0.5);
    star = star || onLine(pixel, start, end);
  }
  return star;
}

// Days counted with marks: a group of five, crossed, and two more.
bool onTallyMarks(vec2 pixel) {
  bool marks = false;
  for (int mark = 0; mark < 6; mark++) {
    // The first four, then a gap where the fifth would be, then two more.
    float x = float(mark) * 2.0 + (mark >= 4 ? 4.0 : 0.0);
    marks = marks || onLine(pixel, vec2(x, 0.0), vec2(x, 4.0));
  }
  return marks || onLine(pixel, vec2(0.0, 4.0), vec2(6.0, 0.0));
}

// The eraser: a block of rubber with a paper sleeve around one end, tilted
// and cut by the left edge of the screen. Returns 0 outside, 1 on its dark
// outline, 2 on the rubber and 3 on the sleeve.
const float ERASER_TILT = -0.3; // radians
float eraserPart(vec2 pixel) {
  // Turn the pixel the opposite way, so the eraser can be measured as a
  // straight box around its center.
  vec2 center = pixel + 0.5;
  float cosine = cos(ERASER_TILT);
  float sine = sin(ERASER_TILT);
  vec2 box = vec2(cosine * center.x + sine * center.y, -sine * center.x + cosine * center.y);
  vec2 halfSize = vec2(10.0, 5.0);
  vec2 inside = halfSize - abs(box);
  // The free end is worn round: its corners are cut.
  if (box.x > 7.0 && abs(box.y) > 2.0 + (halfSize.x - box.x)) {
    return 0.0;
  }
  if (inside.x < 0.0 || inside.y < 0.0) {
    return 0.0;
  }
  if (inside.x < 1.0 || inside.y < 1.0) {
    return 1.0;
  }
  // The sleeve covers the end that is out of the screen, and a bit more.
  if (box.x < 1.0) {
    // A line where the sleeve ends, so it reads as a separate piece.
    return box.x > 0.0 ? 1.0 : 3.0;
  }
  return 2.0;
}

// True if the pixel, counted from the top left corner of the image, is part
// of a pen doodle. Each doodle is only looked at inside its box, so the
// shader does little work for the rest.
bool insideBox(vec2 pixel, vec2 size) {
  return pixel.x >= 0.0 && pixel.y >= 0.0 && pixel.x < size.x && pixel.y < size.y;
}

bool onPenDoodle(vec2 topLeft) {
  // One doodle in each corner. The top ones go below the title and the
  // credits button; the bottom ones can be partly hidden by the hand.
  // Skull, top left.
  vec2 skull = topLeft - vec2(4.0, 16.0);
  if (insideBox(skull, vec2(13.0, 16.0)) && onSkull(skull)) {
    return true;
  }
  // Tally marks, top right.
  vec2 tally = topLeft - vec2(u_resolution.x - 18.0, 17.0);
  if (insideBox(tally + vec2(1.0, 0.0), vec2(16.0, 5.0)) && onTallyMarks(tally)) {
    return true;
  }
  // Heart with an arrow, bottom left. The arrow sticks out of the heart, so
  // the box starts before it.
  vec2 heart = topLeft - vec2(6.0, u_resolution.y - 32.0);
  if (insideBox(heart + vec2(6.0, 4.0), vec2(32.0, 32.0)) &&
      (onHeart(heart) || onInitials(heart - vec2(6.0, 7.0)) || onArrow(heart))) {
    return true;
  }
  // Star, bottom right.
  vec2 star = topLeft - vec2(u_resolution.x - 15.0, u_resolution.y - 16.0);
  if (insideBox(star, vec2(11.0, 11.0)) && onStar(star)) {
    return true;
  }
  return false;
}

// The color of the detail on this pixel, or the wood color if there is none.
vec3 addDetails(vec3 woodColor, vec2 topLeft, vec2 bottomLeft) {
  // The pen is black, like the darkest lines of the grain. To keep it from
  // getting lost among them, the wood right next to each stroke is light,
  // as if the stroke were scratched into the desk.
  if (onPenDoodle(topLeft)) {
    return u_penColor;
  }
  if (onPenDoodle(topLeft + vec2(1.0, 0.0)) || onPenDoodle(topLeft - vec2(1.0, 0.0)) ||
      onPenDoodle(topLeft + vec2(0.0, 1.0)) || onPenDoodle(topLeft - vec2(0.0, 1.0))) {
    return u_primaryColor;
  }
  // Eraser, on the left between the enemy and the player, with three crumbs
  // of rubber.
  float eraser = eraserPart(bottomLeft - vec2(8.0, 64.0));
  if (eraser == 1.0) {
    return u_secondaryColor;
  }
  if (eraser == 2.0) {
    return u_eraserColor;
  }
  if (eraser == 3.0) {
    return u_eraserSleeveColor;
  }
  vec2 crumbs = bottomLeft - vec2(21.0, 56.0);
  if (crumbs == vec2(0.0, 0.0) || crumbs == vec2(3.0, 2.0) || crumbs == vec2(2.0, -2.0)) {
    return u_eraserColor;
  }
  return woodColor;
}

void main() {
  // Position of the pixel relative to the center of the screen. Dividing by
  // the shorter side keeps the knots round on any screen shape.
  vec2 position = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  // 1. Grain. The two waves that only depend on y make the lines closer or
  //    farther apart. The other three bend them; each one moves at its own
  //    whole number of turns per loop. The last, small and fast in space,
  //    roughens the edges of the lines.
  float grain = position.y * GRAIN_DENSITY;
  grain += 1.2 * sin(2.3 * position.y + 0.4) + 0.6 * sin(5.1 * position.y + 1.0);
  grain += 0.35 * sin(1.3 * position.x + 0.8 * position.y + u_phase);
  grain += 0.18 * sin(3.1 * position.x - 1.7 * position.y - 2.0 * u_phase);
  grain += 0.08 * sin(7.0 * position.x + 2.0 * position.y + 3.0 * u_phase);
  grain += 0.06 * sin(23.0 * position.x + 5.0 * position.y);

  // 2. Knots: one at the top, between the doodles, and two low, under the
  //    health of the player and under the hand.
  grain += knot(position, vec2(0.05, 0.75), 0.09, 1.0);
  grain += knot(position, vec2(0.25, -0.62), 0.07, -1.0);
  grain += knot(position, vec2(-0.1, -0.95), 0.06, 2.0);

  // 3. Bands.
  float line = fract(grain);
  vec3 pixelColor = u_baseColor;
  if (line > SECONDARY_FROM) {
    pixelColor = u_secondaryColor;
  } else if (line > PRIMARY_FROM) {
    pixelColor = u_primaryColor;
  }

  // 4. Details. Whole pixels, counted from the top left and the bottom left
  //    corners of the image.
  vec2 bottomLeft = floor(gl_FragCoord.xy);
  vec2 topLeft = vec2(bottomLeft.x, u_resolution.y - 1.0 - bottomLeft.y);
  pixelColor = addDetails(pixelColor, topLeft, bottomLeft);

  gl_FragColor = vec4(pixelColor, 1.0);
}
