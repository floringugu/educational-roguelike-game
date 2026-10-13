import { type CSSProperties, type ReactNode } from 'react';
import { Classroom } from './Classroom';
import { useIntegerScale } from './useIntegerScale';
import './GameFrame.css';

// The browser rounds the lengths of the layout to 1/64 of a CSS pixel.
// Rounded down, the frame would cut a sliver off the last column and the
// last row of the classroom that it shows, and they would blur. Rounded up,
// the frame is a tiny part of a physical pixel bigger, which cannot be seen.
function roundUpToLayoutPrecision(length: number): number {
  return Math.ceil(length * 64) / 64;
}

// The frame where the whole game is drawn (ADR-0014, ADR-0015): the part of
// the screen that the classroom covers, at the biggest integer scale at
// which its safe area of 180x320 pixels of the art fits. On a phone it is
// the whole screen; on a tablet or a PC it is centered, with plain ink bands
// at the sides. The classroom goes at the back, and the screens on top.
//
// The frame shares the scale through one CSS variable, --art-scale: one
// pixel of the art in CSS pixels, as a plain number. GameFrame.css turns it
// into --art-pixel, the same length with its unit, and every piece of pixel
// art inside is sized with `calc(n * var(--art-pixel))`, so all of them use
// the same scale.
export function GameFrame({ children }: { children: ReactNode }) {
  const placement = useIntegerScale();
  const style = {
    left: `${placement.left}px`,
    top: `${placement.top}px`,
    width: `${roundUpToLayoutPrecision(placement.width)}px`,
    height: `${roundUpToLayoutPrecision(placement.height)}px`,
    '--art-scale': placement.artPixel,
    '--classroom-left': `${placement.classroomLeft}px`,
    '--classroom-top': `${placement.classroomTop}px`,
  } as CSSProperties;

  return (
    <div className="game-frame" style={style}>
      <Classroom />
      <div className="game-frame__screen">{children}</div>
    </div>
  );
}
