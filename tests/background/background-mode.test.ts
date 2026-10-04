import { describe, expect, it } from 'vitest';
import { chooseBackgroundMode } from '../../src/background/backgroundMode.ts';

describe('chooseBackgroundMode (FR-VIS-001, FR-VIS-007)', () => {
  it('animates the swirl when nothing stops it', () => {
    expect(chooseBackgroundMode(false, null)).toBe('animated');
  });

  it('freezes the swirl on one frame with reduced motion or a low frame rate', () => {
    expect(chooseBackgroundMode(true, null)).toBe('frozen');
    expect(chooseBackgroundMode(false, 'low-frame-rate')).toBe('frozen');
    expect(chooseBackgroundMode(true, 'low-frame-rate')).toBe('frozen');
  });

  it('shows the CSS stripes without WebGL, since no frame can be drawn', () => {
    expect(chooseBackgroundMode(false, 'no-webgl')).toBe('static');
    expect(chooseBackgroundMode(true, 'no-webgl')).toBe('static');
  });
});
