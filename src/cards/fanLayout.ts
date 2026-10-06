// How the cards of the hand open like a fan (FR-VIS-002): each card turns a
// little more than the one before it, and the cards at the sides sit lower,
// so their top edges draw an arc.

// Degrees that each card turns more than its neighbor.
export const FAN_STEP_DEGREES = 4;

// How much lower a card sits for each step away from the middle, in CSS
// pixels. It grows with the square of the steps, which draws the arc.
export const FAN_DROP_PIXELS = 4;

// Where a card rests in the hand: how much it turns (positive is clockwise)
// and how far down it moves.
export type FanPose = {
  rotateDegrees: number;
  dropPixels: number;
};

// `index` counts from 0, starting at the left card.
export function fanPose(index: number, cardCount: number): FanPose {
  // Steps away from the middle of the hand: with 5 cards they are -2, -1, 0,
  // 1 and 2. With an even count the middle falls between two cards (-0.5,
  // 0.5), so the fan stays symmetric.
  const stepsFromMiddle = index - (cardCount - 1) / 2;
  return {
    rotateDegrees: stepsFromMiddle * FAN_STEP_DEGREES,
    dropPixels: stepsFromMiddle * stepsFromMiddle * FAN_DROP_PIXELS,
  };
}
