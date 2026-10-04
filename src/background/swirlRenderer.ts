import { hexToRgb } from '../theme/contrast';
import { PALETTE, type PaletteColorName } from '../theme/palette';
import fragmentShaderSource from './swirl.frag.glsl?raw';
import vertexShaderSource from './swirl.vert.glsl?raw';
import type { SwirlColors } from './swirlColors';

// Seconds the swirl takes to complete its loop. The shader is written so the
// end of the loop joins its start (see swirl.frag.glsl).
const LOOP_SECONDS = 60;

// Draws the swirl shader on a canvas with WebGL. It knows nothing about React
// or about when to draw: SwirlBackground decides that.
export type SwirlRenderer = {
  // Sets the size of the image the shader draws, in pixels. The canvas is
  // then stretched by CSS to fill the screen.
  resize: (widthInPixels: number, heightInPixels: number) => void;
  // Draws the frame that corresponds to that moment of the animation.
  draw: (elapsedSeconds: number) => void;
  // Frees the GPU memory used by the shader.
  dispose: () => void;
};

// Returns null when the browser cannot run the swirl: there is no WebGL, it
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

  // The colors do not change while the swirl runs, so they are sent once.
  gl.uniform3fv(gl.getUniformLocation(program, 'u_baseColor'), paletteColorForShader(colors.base));
  gl.uniform3fv(gl.getUniformLocation(program, 'u_primaryColor'), paletteColorForShader(colors.primary));
  gl.uniform3fv(gl.getUniformLocation(program, 'u_secondaryColor'), paletteColorForShader(colors.secondary));

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const phaseLocation = gl.getUniformLocation(program, 'u_phase');

  // Arrow functions, not `function` declarations: TypeScript only remembers
  // inside arrow functions that `gl` was checked not to be null.
  const resize = (widthInPixels: number, heightInPixels: number) => {
    canvas.width = widthInPixels;
    canvas.height = heightInPixels;
    gl.viewport(0, 0, widthInPixels, heightInPixels);
    gl.uniform2f(resolutionLocation, widthInPixels, heightInPixels);
  };

  const draw = (elapsedSeconds: number) => {
    // The shader receives the position inside the loop as an angle from 0
    // to 2*pi, not the elapsed time: the time keeps growing and phone GPUs
    // would lose precision with big numbers.
    const loopProgress = (elapsedSeconds % LOOP_SECONDS) / LOOP_SECONDS;
    gl.uniform1f(phaseLocation, loopProgress * 2 * Math.PI);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const dispose = () => {
    gl.deleteBuffer(triangleBuffer);
    gl.deleteProgram(program);
  };

  return { resize, draw, dispose };
}

// Shaders take colors as three numbers from 0 to 1.
function paletteColorForShader(name: PaletteColorName): Float32Array {
  const [red, green, blue] = hexToRgb(PALETTE[name]);
  return new Float32Array([red / 255, green / 255, blue / 255]);
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
    console.warn('The swirl shader did not link:', gl.getProgramInfoLog(program));
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
    console.warn('The swirl shader did not compile:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
