// Contrast ratio between two colors, as defined by WCAG 2.x. NFR-ACS-001
// asks for at least 4.5:1 between text and its background (AA level).

export const MINIMUM_TEXT_CONTRAST = 4.5;

// Converts '#rrggbb' to its red, green and blue values, from 0 to 255.
export function hexToRgb(hex: string): [number, number, number] {
  const channel = (start: number) => parseInt(hex.slice(start, start + 2), 16);
  return [channel(1), channel(3), channel(5)];
}

// Converts '#rrggbb' to its relative luminance: how bright the color looks,
// from 0 (black) to 1 (white). Each channel is first converted from sRGB to
// linear light.
function relativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0);
}

// Returns a number from 1 (same color) to 21 (black on white).
export function contrastRatio(colorA: string, colorB: string): number {
  const luminanceA = relativeLuminance(colorA);
  const luminanceB = relativeLuminance(colorB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}
