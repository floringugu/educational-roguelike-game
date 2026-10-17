import { type CameraMove } from '../classroom/camera';
import { type RandomSource } from './questions';

// The enemy gets annoyed when a thing of the desk hits it (FR-VIS-010,
// ticket 17): it shakes from side to side, an annoyance mark shows next to
// its face, and it says a phrase in the bubble of its intent, as if it
// talked. It is only decoration: nothing of the combat changes (P1).
//
// This file has no browser code, so it can be tested in Node. EnemyView
// plays it.

// How long it shakes and shows the mark (prov.).
export const ANNOYANCE_DURATION_MS = 1500;

// The mark beats in 2 frames: each one shows this long.
export const MARK_FRAME_MS = 250;

// How many times the enemy on the desk has got annoyed since it came in, and
// the phrase it said the last time, by its place in the catalog of texts:
// null until it has said one. A new enemy starts at 0 but remembers the last
// phrase, so it never repeats it either.
export type Annoyance = {
  count: number;
  phraseIndex: number | null;
};

// Picks one of the `count` phrases at random, never the one said last, so a
// second hit never repeats it.
export function pickPhraseIndex(count: number, previousIndex: number | null, random: RandomSource = Math.random): number {
  if (count <= 1) {
    return 0;
  }
  if (previousIndex === null) {
    return Math.floor(random() * count);
  }
  // A number among the others: the phrases after the previous one move one
  // place down to fill its gap.
  const index = Math.floor(random() * (count - 1));
  return index >= previousIndex ? index + 1 : index;
}

// The shake: one pixel of the art to one side and to the other, every
// SHAKE_STEP_MS, with a pause at the middle in between, until it ends at
// rest. It goes sideways only, unlike the lean of a hit, which turns it.
const SHAKE_STEP_MS = 40;
const SHAKE_STEPS = [0, 1, 0, -1];

export function annoyanceShakeMove(): CameraMove {
  return {
    durationMs: ANNOYANCE_DURATION_MS,
    offsetAt(timeMs) {
      const step = Math.floor(timeMs / SHAKE_STEP_MS) % SHAKE_STEPS.length;
      return { x: SHAKE_STEPS[step] ?? 0, y: 0 };
    },
  };
}

// The bubble of the intent, at rest: 31x21 pixels of the art, from x 82 of
// the safe area (EnemyView.css). Its paper goes from x 1 to 28: the outline
// takes 1 pixel on the left and the outline and its shadow 2 on the right.
export const BUBBLE_WIDTH = 31;
export const BUBBLE_LEFT = 82;
const BUBBLE_EDGES = BUBBLE_WIDTH - 28;

// The widest that the bubble gets, and the widest that the phrase may be in
// it, with a pixel of paper on each side of the text.
export const PHRASE_MAX_WIDTH = 72;
export const BUBBLE_MAX_WIDTH = PHRASE_MAX_WIDTH + 2 + BUBBLE_EDGES;

// The width of the bubble that says a phrase as wide as `phraseWidth`
// pixels of the art, measured on the screen: just wide enough, in whole
// pixels of the art, and never narrower than at rest.
export function talkingBubbleWidth(phraseWidth: number): number {
  const paper = Math.max(BUBBLE_WIDTH - BUBBLE_EDGES, Math.ceil(phraseWidth) + 2);
  return Math.min(paper + BUBBLE_EDGES, BUBBLE_MAX_WIDTH);
}

// Where the left edge of the bubble goes for a width: it grows the same to
// both sides, by whole pixels of the art, so it never falls between two
// pixels and blurs (ADR-0014).
export function bubbleLeft(width: number): number {
  return BUBBLE_LEFT - Math.floor((width - BUBBLE_WIDTH) / 2);
}

// The times of the talk (prov.): the bubble widens, the phrase is written
// letter by letter, stays a while once it is whole, and goes, and the bubble
// shrinks back.
export const BUBBLE_RESIZE_MS = 120;
export const LETTER_INTERVAL_MS = 35;
export const PHRASE_HOLD_MS = 1200;

// How long the whole talk lasts for a phrase of `letterCount` letters.
export function talkDuration(letterCount: number): number {
  return BUBBLE_RESIZE_MS + letterCount * LETTER_INTERVAL_MS + PHRASE_HOLD_MS + BUBBLE_RESIZE_MS;
}

export type BubbleState = {
  // The width of the bubble, in whole pixels of the art.
  width: number;
  // How many letters of the phrase show.
  letters: number;
};

// The bubble `elapsedMs` after the hit, for a phrase of `letterCount`
// letters that needs a bubble `talkingWidth` wide, or null once the talk is
// over and the bubble shows the intent again.
// While the classroom is still (FR-VIS-007), the bubble is already wide,
// with the whole phrase, and stays as long as if it were written.
export function bubbleAt(elapsedMs: number, letterCount: number, talkingWidth: number, isStill: boolean): BubbleState | null {
  const durationMs = talkDuration(letterCount);
  if (elapsedMs < 0 || elapsedMs >= durationMs) {
    return null;
  }
  if (isStill) {
    return { width: talkingWidth, letters: letterCount };
  }
  const growth = talkingWidth - BUBBLE_WIDTH;
  const shrinkStartMs = durationMs - BUBBLE_RESIZE_MS;
  if (elapsedMs < BUBBLE_RESIZE_MS) {
    // Widening: one more whole pixel of the art at a time.
    return { width: BUBBLE_WIDTH + Math.floor((growth * elapsedMs) / BUBBLE_RESIZE_MS), letters: 0 };
  }
  if (elapsedMs >= shrinkStartMs) {
    // The phrase has gone, and the bubble shrinks back.
    const shrinkingMs = elapsedMs - shrinkStartMs;
    return { width: talkingWidth - Math.floor((growth * shrinkingMs) / BUBBLE_RESIZE_MS), letters: 0 };
  }
  // The first letter shows as soon as the bubble is wide.
  const writtenLetters = Math.floor((elapsedMs - BUBBLE_RESIZE_MS) / LETTER_INTERVAL_MS) + 1;
  return { width: talkingWidth, letters: Math.min(writtenLetters, letterCount) };
}
