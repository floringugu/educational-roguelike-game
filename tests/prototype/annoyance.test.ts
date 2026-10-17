import { describe, expect, it } from 'vitest';
import { stepKeyframes } from '../../src/classroom/camera.ts';
import { es } from '../../src/i18n/es.ts';
import {
  ANNOYANCE_DURATION_MS,
  BUBBLE_LEFT,
  BUBBLE_MAX_WIDTH,
  BUBBLE_RESIZE_MS,
  BUBBLE_WIDTH,
  LETTER_INTERVAL_MS,
  PHRASE_HOLD_MS,
  annoyanceShakeMove,
  bubbleAt,
  bubbleLeft,
  pickPhraseIndex,
  talkDuration,
  talkingBubbleWidth,
} from '../../src/prototype/annoyance.ts';

// A random source that returns the given numbers in turn.
function sequence(...numbers: number[]): () => number {
  let next = 0;
  return () => {
    const number = numbers[next % numbers.length] as number;
    next += 1;
    return number;
  };
}

describe('FR-VIS-010: the phrases of an annoyed enemy (ticket 17)', () => {
  it('has at least 5 phrases in the catalog of texts (NFR-I18N-001)', () => {
    expect(es.combat.annoyancePhrases.length).toBeGreaterThanOrEqual(5);
  });

  it('never says the same phrase twice in a row', () => {
    const count = es.combat.annoyancePhrases.length;
    for (let previous = 0; previous < count; previous += 1) {
      for (const random of [0, 0.2, 0.5, 0.8, 0.999]) {
        const index = pickPhraseIndex(count, previous, () => random);
        expect(index).not.toBe(previous);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(count);
      }
    }
  });

  it('can say any other phrase', () => {
    const picked = new Set<number>();
    for (let step = 0; step < 6; step += 1) {
      picked.add(pickPhraseIndex(7, 3, sequence(step / 6)));
    }
    expect([...picked].sort()).toEqual([0, 1, 2, 4, 5, 6]);
  });

  it('can say any phrase the first time', () => {
    expect(pickPhraseIndex(7, null, () => 0)).toBe(0);
    expect(pickPhraseIndex(7, null, () => 0.999)).toBe(6);
  });
});

describe('FR-VIS-010: the shake of an annoyed enemy', () => {
  it('lasts 1.5 seconds (prov.)', () => {
    expect(annoyanceShakeMove().durationMs).toBe(ANNOYANCE_DURATION_MS);
    expect(ANNOYANCE_DURATION_MS).toBe(1500);
  });

  it('goes from side to side, one whole pixel of the art, and ends at rest (ADR-0017)', () => {
    const keyframes = stepKeyframes(annoyanceShakeMove(), 1, 1);
    const offsets = keyframes.map((keyframe) => keyframe.transform);
    expect(new Set(offsets)).toEqual(new Set(['translate(0px, 0px)', 'translate(1px, 0px)', 'translate(-1px, 0px)']));
    expect(keyframes.at(-1)?.transform).toBe('translate(0px, 0px)');
  });
});

describe('FR-VIS-010: the bubble that says the phrase', () => {
  it('is never narrower than at rest, nor wider than the most', () => {
    expect(talkingBubbleWidth(0)).toBe(BUBBLE_WIDTH);
    expect(talkingBubbleWidth(20)).toBe(BUBBLE_WIDTH);
    expect(talkingBubbleWidth(500)).toBe(BUBBLE_MAX_WIDTH);
    expect(BUBBLE_MAX_WIDTH).toBe(77);
  });

  it('leaves a pixel of paper at each side of the phrase, in whole pixels of the art', () => {
    expect(talkingBubbleWidth(40)).toBe(40 + 2 + 3);
    expect(talkingBubbleWidth(40.2)).toBe(41 + 2 + 3);
  });

  it('grows the same to both sides, from a whole pixel of the art', () => {
    expect(bubbleLeft(BUBBLE_WIDTH)).toBe(BUBBLE_LEFT);
    expect(bubbleLeft(BUBBLE_WIDTH + 10)).toBe(BUBBLE_LEFT - 5);
    expect(bubbleLeft(BUBBLE_WIDTH + 11)).toBe(BUBBLE_LEFT - 5);
    expect(bubbleLeft(BUBBLE_MAX_WIDTH)).toBe(59);
  });

  it('widens in whole pixels of the art in 120 ms, before the first letter', () => {
    let lastWidth = BUBBLE_WIDTH;
    for (let timeMs = 0; timeMs < BUBBLE_RESIZE_MS; timeMs += 8) {
      const bubble = bubbleAt(timeMs, 12, 60, false);
      expect(bubble?.letters).toBe(0);
      expect(Number.isInteger(bubble?.width)).toBe(true);
      expect(bubble?.width).toBeGreaterThanOrEqual(lastWidth);
      lastWidth = bubble?.width ?? 0;
    }
    expect(bubbleAt(BUBBLE_RESIZE_MS, 12, 60, false)).toEqual({ width: 60, letters: 1 });
  });

  it('writes one letter every 35 ms (prov.)', () => {
    expect(LETTER_INTERVAL_MS).toBe(35);
    expect(bubbleAt(BUBBLE_RESIZE_MS + 34, 12, 60, false)?.letters).toBe(1);
    expect(bubbleAt(BUBBLE_RESIZE_MS + 35, 12, 60, false)?.letters).toBe(2);
    expect(bubbleAt(BUBBLE_RESIZE_MS + 11 * 35, 12, 60, false)?.letters).toBe(12);
  });

  it('keeps the whole phrase for 1.2 s (prov.) once it is written, and then shrinks back', () => {
    expect(PHRASE_HOLD_MS).toBe(1200);
    const writtenMs = BUBBLE_RESIZE_MS + 12 * LETTER_INTERVAL_MS;
    expect(bubbleAt(writtenMs + PHRASE_HOLD_MS - 1, 12, 60, false)).toEqual({ width: 60, letters: 12 });
    const shrinking = bubbleAt(writtenMs + PHRASE_HOLD_MS + 60, 12, 60, false);
    expect(shrinking?.letters).toBe(0);
    expect(shrinking?.width).toBeLessThan(60);
    expect(shrinking?.width).toBeGreaterThan(BUBBLE_WIDTH);
  });

  it('shows the intent again when the talk is over', () => {
    expect(bubbleAt(talkDuration(12), 12, 60, false)).toBeNull();
    expect(bubbleAt(talkDuration(12) - 1, 12, 60, false)).not.toBeNull();
  });

  it('is already wide with the whole phrase while the classroom is still, and stays as long (FR-VIS-007)', () => {
    expect(bubbleAt(0, 12, 60, true)).toEqual({ width: 60, letters: 12 });
    expect(bubbleAt(talkDuration(12) - 1, 12, 60, true)).toEqual({ width: 60, letters: 12 });
    expect(bubbleAt(talkDuration(12), 12, 60, true)).toBeNull();
  });
});
