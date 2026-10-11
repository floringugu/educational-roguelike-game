import { hexToRgb } from '../theme/contrast';
import { PALETTE, type PaletteColorName } from '../theme/palette';
import { PALETTE_COLOR_NAMES, paintAnimationSprites, paintDeskScene } from './deskScene';
import fragmentShaderSource from './swirl.frag.glsl?raw';
import vertexShaderSource from './swirl.vert.glsl?raw';
import { SHADED_COLOR, type SwirlColors } from './swirlColors';

// Seconds the animation takes to complete its loop. The shader is written so
// the end of the loop joins its start (see swirl.frag.glsl).
const LOOP_SECONDS = 60;

// A hit on the desk, for the jump of the objects (see deskBumps.ts).
export type DeskBump = {
  // Seconds since the hit.
  secondsSince: number;
  // How high the objects jump, in pixels.
  liftInPixels: number;
};

// No hit: the objects stay still.
export const NO_DESK_BUMP: DeskBump = { secondsSince: 0, liftInPixels: 0 };

// Draws the background shader on a canvas with WebGL. It knows nothing about
// React or about when to draw: SwirlBackground decides that.
export type SwirlRenderer = {
  // Sets the size of the image the shader draws, in pixels, and paints the
  // still scene again for that size. The canvas is then stretched by CSS to
  // fill the screen.
  resize: (widthInPixels: number, heightInPixels: number) => void;
  // Draws the frame that corresponds to that moment of the animation.
  draw: (elapsedSeconds: number, bump: DeskBump) => void;
  // Frees the GPU memory used by the shader.
  dispose: () => void;
};

// The texture units of the three images the shader reads.
const SCENE_TEXTURE_UNIT = 0;
const SPRITES_TEXTURE_UNIT = 1;
const PALETTE_TEXTURE_UNIT = 2;

// Returns null when the browser cannot run the shader: there is no WebGL, it
// would run without the GPU, or the shader does not compile. The caller then
// shows the static CSS background (FR-VIS-001).
export function createSwirlRenderer(canvas: HTMLCanvasElement, colors: SwirlColors): SwirlRenderer | null {
  const gl = canvas.getContext('webgl', {
    // The background covers the whole screen and is opaque: without an alpha
    // channel the browser composes it faster.
    alpha: false,
    // Smoothing edges would create colors outside the palette.
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
    // If the browser can only draw WebGL with the CPU (no GPU, or a GPU on
    // its block list), it would be very slow: treat it as having no WebGL.
    failIfMajorPerformanceCaveat: true,
  });
  if (gl === null) {
    return null;
  }

  const program = createProgram(gl);
  if (program === null) {
    return null;
  }
  gl.useProgram(program);

  // One triangle that is bigger than the screen, in clip space coordinates
  // (the screen goes from -1 to 1). See swirl.vert.glsl.
  const triangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // The three images, as textures. Each pixel holds the position of its
  // color in the palette (see deskScene.ts), not the color itself.
  //   - The scene: the still part of the background. Its red channel is the
  //     ground and its green channel the objects. It is painted again on
  //     every resize.
  //   - The sprites of the animation: the fly, the paper plane, the ball
  //     of paper and the ant.
  //   - The palette: one row with every color and one with its shaded
  //     version (SHADED_COLOR).
  const sceneTexture = createIndexTexture(gl, SCENE_TEXTURE_UNIT);
  const spritesTexture = createIndexTexture(gl, SPRITES_TEXTURE_UNIT);
  const paletteTexture = createIndexTexture(gl, PALETTE_TEXTURE_UNIT);

  const sprites = paintAnimationSprites();
  uploadIndices(gl, SPRITES_TEXTURE_UNIT, spritesTexture, sprites.width, sprites.height, sprites.pixels, null);
  uploadPalette(gl, paletteTexture);

  gl.uniform1i(gl.getUniformLocation(program, 'u_scene'), SCENE_TEXTURE_UNIT);
  gl.uniform1i(gl.getUniformLocation(program, 'u_sprites'), SPRITES_TEXTURE_UNIT);
  gl.uniform1i(gl.getUniformLocation(program, 'u_palette'), PALETTE_TEXTURE_UNIT);
  gl.uniform2f(gl.getUniformLocation(program, 'u_spritesSize'), sprites.width, sprites.height);
  gl.uniform1f(gl.getUniformLocation(program, 'u_paletteSize'), PALETTE_COLOR_NAMES.length);

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const deskLocation = gl.getUniformLocation(program, 'u_desk');
  const phaseLocation = gl.getUniformLocation(program, 'u_phase');
  const bumpSecondsLocation = gl.getUniformLocation(program, 'u_bumpSeconds');
  const bumpLiftLocation = gl.getUniformLocation(program, 'u_bumpLift');

  // Arrow functions, not `function` declarations: TypeScript only remembers
  // inside arrow functions that `gl` was checked not to be null.
  const resize = (widthInPixels: number, heightInPixels: number) => {
    canvas.width = widthInPixels;
    canvas.height = heightInPixels;
    gl.viewport(0, 0, widthInPixels, heightInPixels);
    gl.uniform2f(resolutionLocation, widthInPixels, heightInPixels);

    const scene = paintDeskScene(widthInPixels, heightInPixels, colors);
    uploadIndices(gl, SCENE_TEXTURE_UNIT, sceneTexture, scene.width, scene.height, scene.ground, scene.objects);
    const { left, top, right, front } = scene.layout;
    gl.uniform4f(deskLocation, left, top, right, front);
  };

  const draw = (elapsedSeconds: number, bump: DeskBump) => {
    // The shader receives the position inside the loop as an angle from 0
    // to 2*pi, not the elapsed time: the time keeps growing and phone GPUs
    // would lose precision with big numbers.
    const loopProgress = (elapsedSeconds % LOOP_SECONDS) / LOOP_SECONDS;
    gl.uniform1f(phaseLocation, loopProgress * 2 * Math.PI);
    gl.uniform1f(bumpSecondsLocation, bump.secondsSince);
    gl.uniform1f(bumpLiftLocation, bump.liftInPixels);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const dispose = () => {
    gl.deleteBuffer(triangleBuffer);
    gl.deleteTexture(sceneTexture);
    gl.deleteTexture(spritesTexture);
    gl.deleteTexture(paletteTexture);
    gl.deleteProgram(program);
  };

  return { resize, draw, dispose };
}

// A texture that is read pixel by pixel: no smoothing between pixels (it
// would mix the positions of two colors into a third one) and no repeating.
function createIndexTexture(gl: WebGLRenderingContext, unit: number): WebGLTexture {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// Sends one or two layers of color positions to a texture: the first one in
// the red channel and the second one, if there is one, in the green channel.
// The first row of the layers is the top of the image, so the shader reads
// it with y going down.
function uploadIndices(
  gl: WebGLRenderingContext,
  unit: number,
  texture: WebGLTexture,
  width: number,
  height: number,
  firstLayer: Uint8Array,
  secondLayer: Uint8Array | null,
) {
  const data = new Uint8Array(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel++) {
    data[pixel * 4] = firstLayer[pixel] ?? 0;
    data[pixel * 4 + 1] = secondLayer?.[pixel] ?? 0;
    data[pixel * 4 + 3] = 255;
  }
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
}

// The palette as a texture of 2 rows: the colors and their shaded versions,
// in the order of PALETTE_COLOR_NAMES.
function uploadPalette(gl: WebGLRenderingContext, texture: WebGLTexture) {
  const rows: Array<(name: PaletteColorName) => PaletteColorName> = [
    (name) => name,
    (name) => SHADED_COLOR[name],
  ];
  const width = PALETTE_COLOR_NAMES.length;
  const data = new Uint8Array(width * rows.length * 4);
  rows.forEach((colorOf, row) => {
    PALETTE_COLOR_NAMES.forEach((name, column) => {
      const [red, green, blue] = hexToRgb(PALETTE[colorOf(name)]);
      const start = (row * width + column) * 4;
      data.set([red, green, blue, 255], start);
    });
  });
  gl.activeTexture(gl.TEXTURE0 + PALETTE_TEXTURE_UNIT);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, rows.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
}

// Compiles both shaders and links them into a program. Returns null if any
// step fails, and explains why in the console.
function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (vertexShader === null || fragmentShader === null) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  // Once linked, the program keeps what it needs from the shaders.
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('The background shader did not link:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function compileShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (shader === null) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('The background shader did not compile:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
