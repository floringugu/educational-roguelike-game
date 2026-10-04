// Vertex shader of the swirl background (FR-VIS-001).
//
// It draws a single triangle bigger than the screen, so that it covers every
// pixel; the fragment shader then picks the color of each one. One triangle
// is a little cheaper than two forming a rectangle, and has no diagonal seam.

attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
