import { type AnimationEvent, type CSSProperties, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getSpriteUrl, type SpriteId } from '../assets/catalog';
import { usePrefersReducedMotion } from '../background/usePrefersReducedMotion';
import { type CameraMove, SETTLE_ENEMY_DELAY_MS, landingMove } from '../classroom/camera';
import { type ArtRect } from '../classroom/classroomLayout';
import { useCamera } from '../classroom/useCamera';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import {
  ANNOYANCE_DURATION_MS,
  MARK_FRAME_MS,
  PHRASE_MAX_WIDTH,
  type Annoyance,
  type BubbleState,
  annoyanceShakeMove,
  bubbleAt,
  bubbleLeft,
  talkingBubbleWidth,
} from './annoyance';
import type { MockCombat, MockEnemyId } from './mockCombat';
import './EnemyView.css';

// The sprite of each enemy, 96x96 pixels of the art, and its shadow on the
// desk (ticket 13). EnemyView.css places the shadow under its feet.
const ENEMY_SPRITES: Record<MockEnemyId, SpriteId> = {
  midterm: 'enemy-midterm',
};
const ENEMY_SHADOWS: Record<MockEnemyId, SpriteId> = {
  midterm: 'enemy-midterm-shadow',
};

// The parts of each enemy that a thrown item of the desk can hit (ticket
// 17), in pixels of the art from the top left corner of the safe area: the
// sheet of its head and its body. Its thin arms and legs are left out.
export const ENEMY_HIT_AREAS: Record<MockEnemyId, ReadonlyArray<ArtRect>> = {
  midterm: [
    { x: 47, y: 96, width: 86, height: 44 },
    { x: 59, y: 140, width: 63, height: 28 },
  ],
};

// Where the annoyance mark of each enemy goes (ticket 17), in pixels of its
// sprite: next to its face, which each enemy has in a different place. On
// the midterm, at the top right of its face, by its eyebrow.
const ENEMY_ANNOYANCE_MARKS: Record<MockEnemyId, { x: number; y: number }> = {
  midterm: { x: 72, y: 20 },
};

// An enemy comes in dropping onto the desk from 170 pixels of the art above,
// faster and faster, like a thing that falls. It moves in whole pixels of
// the art, with the keyframes of the camera (ADR-0017).
const DROP_HEIGHT = 170;
const DROP_DURATION_MS = 300;

function dropMove(): CameraMove {
  return {
    durationMs: DROP_DURATION_MS,
    offsetAt(timeMs) {
      const timeLeft = 1 - (timeMs / DROP_DURATION_MS) ** 2;
      return { x: 0, y: -DROP_HEIGHT * timeLeft };
    },
  };
}

// Its intent shows a moment after it lands.
const INTENT_DELAY_AFTER_LANDING_MS = 120;

// A hit: the enemy flashes and leans back from its feet, away from the
// player, turning a little, and springs back, harder the more damage it
// takes. It is a turn in 3D, like the cards (FR-VIS-002), seen from the
// distance that EnemyView.css gives to the perspective.
const TILT_DURATION_MS = 460;

function tiltKeyframes(damage: number): Keyframe[] {
  const lean = Math.min(26 + damage, 40);
  return [
    { offset: 0, filter: 'brightness(3)', transform: 'rotateX(0deg) rotateY(0deg)' },
    { offset: 0.22, filter: 'brightness(3)', transform: `rotateX(${lean}deg) rotateY(-12deg)` },
    { offset: 0.55, filter: 'none', transform: `rotateX(${-lean * 0.3}deg) rotateY(5deg)` },
    { offset: 0.8, transform: `rotateX(${lean * 0.1}deg) rotateY(-1deg)` },
    { offset: 1, transform: 'rotateX(0deg) rotateY(0deg)' },
  ];
}

// Keeps an element invisible for a while, and then lets it show again.
function hideFor(element: HTMLElement, durationMs: number): Animation {
  return element.animate([{ opacity: 0 }, { opacity: 0 }], { duration: durationMs });
}

// The annoyance mark shows, and beats from one of its 2 frames to the
// other. Its sprite has both frames side by side, and EnemyView.css shows
// one at a time. Without `visibility` in its keyframes, it is hidden.
const MARK_BEAT_KEYFRAMES: Keyframe[] = [
  { offset: 0, visibility: 'visible', backgroundPosition: '0% 0%', easing: 'steps(1, end)' },
  { offset: 0.5, visibility: 'visible', backgroundPosition: '100% 0%', easing: 'steps(1, end)' },
  { offset: 1, visibility: 'visible', backgroundPosition: '100% 0%' },
];
const MARK_STILL_KEYFRAMES: Keyframe[] = [{ visibility: 'visible' }, { visibility: 'visible' }];

// How wide the phrase is, in pixels of the art, as the browser writes it in
// the hidden box of EnemyView.css, which is PHRASE_MAX_WIDTH wide and splits
// it into lines of even width: the width of its widest line. The scale of
// the art comes from the width of that box.
function measurePhraseWidth(phraseElement: HTMLElement | null): number {
  const box = phraseElement?.parentElement;
  if (phraseElement === null || box === null || box === undefined) {
    return PHRASE_MAX_WIDTH;
  }
  const artPixel = box.getBoundingClientRect().width / PHRASE_MAX_WIDTH;
  const lineWidths = Array.from(phraseElement.getClientRects(), (line) => line.width);
  if (artPixel <= 0 || lineWidths.length === 0) {
    return PHRASE_MAX_WIDTH;
  }
  return Math.max(...lineWidths) / artPixel;
}

// The talk of the bubble each time the enemy gets annoyed (annoyance.ts):
// its width and how many letters of the phrase show, worked out again at
// each frame of the screen, or null while it shows the intent. A new
// annoyance starts it again.
function useTalkingBubble(
  annoyanceCount: number,
  letterCount: number,
  phraseElement: RefObject<HTMLSpanElement | null>,
): BubbleState | null {
  const camera = useCamera();
  const [bubble, setBubble] = useState<BubbleState | null>(null);

  useEffect(() => {
    if (annoyanceCount === 0) {
      return;
    }
    let frame = 0;
    let startMs: number | null = null;
    let talkingWidth = 0;
    let shown: BubbleState | null = null;

    function showFrame(nowMs: number) {
      // The phrase is measured once, on the first frame, when the browser
      // has already laid it out.
      if (startMs === null) {
        startMs = nowMs;
        talkingWidth = talkingBubbleWidth(measurePhraseWidth(phraseElement.current));
      }
      const next = bubbleAt(nowMs - startMs, letterCount, talkingWidth, camera.isStill());
      // React draws the bubble again only when it changes.
      if (next?.width !== shown?.width || next?.letters !== shown?.letters) {
        shown = next;
        setBubble(next);
      }
      if (next !== null) {
        frame = window.requestAnimationFrame(showFrame);
      }
    }

    frame = window.requestAnimationFrame(showFrame);
    return () => window.cancelAnimationFrame(frame);
  }, [annoyanceCount, camera, letterCount, phraseElement]);

  return bubble;
}

type EnemyViewProps = {
  enemy: MockCombat['enemy'];
  // How many hits the enemy has taken, and the damage of the last one. Each
  // new hit plays the hit animation and shows its damage.
  hits: number;
  lastDamage: number;
  // How many enemies have come in after the first one.
  arrivals: number;
  // How many times a thrown item of the desk has hit it, and what it said
  // the last time (ticket 17). Each new one annoys it again.
  annoyance: Annoyance;
  // Called when it has landed on the desk, and a thrown item can hit it.
  onLanded: () => void;
  // Called when the animation of its defeat ends, to bring the next one.
  onDefeatShown: () => void;
};

// The enemy of the prototype (ticket 06), standing on the green desk with
// its shadow under its feet, and its intent over its head in a bubble of
// paper (FR-CMB-005, ADR-0016). Its name and its health are in EnemyPanel,
// at the top of the classroom (ticket 12). It moves with the desk when the
// camera moves (ADR-0017).
// When a thrown item of the desk hits it, it gets annoyed (FR-VIS-010): it
// shakes, an annoyance mark beats next to its face, and it says a phrase in
// the bubble of its intent, which widens for it, as if it talked.
// With reduced motion it does not drop, lean back or shake, and its defeat
// takes no time (FR-VIS-007).
//
// CombatScreen draws a new EnemyView for each enemy, so each one starts
// clean.
export function EnemyView({ enemy, hits, lastDamage, arrivals, annoyance, onLanded, onDefeatShown }: EnemyViewProps) {
  const texts = es.enemies[enemy.id];
  const isDefeated = enemy.health === 0;
  const camera = useCamera();
  const prefersReducedMotion = usePrefersReducedMotion();
  const intentElement = useRef<HTMLParagraphElement>(null);
  const shadowElement = useRef<HTMLImageElement>(null);
  const shakeElement = useRef<HTMLDivElement>(null);
  const bodyElement = useRef<HTMLDivElement>(null);
  const markElement = useRef<HTMLSpanElement>(null);
  const phraseMeasureElement = useRef<HTMLSpanElement>(null);

  const phrase = es.combat.annoyancePhrases[annoyance.phraseIndex ?? 0] ?? '';
  // The letters one by one. Array.from keeps a letter with an accent, such
  // as "í", in one piece.
  const letters = Array.from(phrase);
  const bubble = useTalkingBubble(annoyance.count, letters.length, phraseMeasureElement);

  // The intent stands over the enemy, but it counts as interface: it goes
  // over the items of the desk that the player holds (DeskItems), so it is
  // not inside the enemy. It moves with the desk on its own.
  useLayoutEffect(() => {
    const intent = intentElement.current;
    if (intent === null) {
      return;
    }
    return camera.attachFollower('desk', intent);
  }, [camera]);

  // An enemy comes in: the first one once the camera has almost sat down at
  // the desk (CombatScreen), and each next one as soon as the one before has
  // fallen. Until it lands, its shadow is not on the desk, and its intent
  // shows a moment later. When it lands, the desk dips under it.
  // A layout effect, so the enemy is hidden before the browser paints it in
  // its place.
  useLayoutEffect(() => {
    const body = bodyElement.current;
    const shadow = shadowElement.current;
    const intent = intentElement.current;
    if (prefersReducedMotion || body === null || shadow === null || intent === null) {
      onLanded();
      return;
    }
    const delayMs = arrivals === 0 ? SETTLE_ENEMY_DELAY_MS : 0;
    const landingMs = delayMs + DROP_DURATION_MS;
    const drop = camera.playOn(body, dropMove(), delayMs);
    drop.onfinish = () => {
      camera.play(landingMove());
      onLanded();
    };
    const animations = [
      hideFor(body, delayMs),
      hideFor(shadow, landingMs),
      hideFor(intent, landingMs + INTENT_DELAY_AFTER_LANDING_MS),
      drop,
    ];
    return () => {
      for (const animation of animations) {
        animation.cancel();
      }
    };
  }, [arrivals, camera, onLanded, prefersReducedMotion]);

  // Each new hit makes the enemy lean back.
  useLayoutEffect(() => {
    const body = bodyElement.current;
    if (hits === 0 || prefersReducedMotion || body === null) {
      return;
    }
    const tilt = body.animate(tiltKeyframes(lastDamage), { duration: TILT_DURATION_MS, easing: 'ease-out' });
    return () => tilt.cancel();
  }, [hits, lastDamage, prefersReducedMotion]);

  // Each annoyance makes it shake and shows its mark, which beats, for
  // ANNOYANCE_DURATION_MS. While the classroom is still, it does not shake
  // and the mark keeps still (FR-VIS-007). A new one starts them again.
  useEffect(() => {
    const shake = shakeElement.current;
    const mark = markElement.current;
    if (annoyance.count === 0 || shake === null || mark === null) {
      return;
    }
    const animations: Animation[] = [];
    if (camera.isStill()) {
      animations.push(mark.animate(MARK_STILL_KEYFRAMES, { duration: ANNOYANCE_DURATION_MS }));
    } else {
      const beatMs = 2 * MARK_FRAME_MS;
      animations.push(
        mark.animate(MARK_BEAT_KEYFRAMES, { duration: beatMs, iterations: ANNOYANCE_DURATION_MS / beatMs }),
        camera.playOn(shake, annoyanceShakeMove()),
      );
    }
    return () => {
      for (const animation of animations) {
        animation.cancel();
      }
    };
  }, [annoyance.count, camera]);

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === 'enemy-fall') {
      onDefeatShown();
    }
  }

  // The key makes React draw the sprite again on each hit and each arrival,
  // which starts the CSS animation of its defeat from the beginning.
  const bodyClassName = isDefeated ? 'enemy__body enemy__body--defeated' : 'enemy__body';
  const shadowClassName = isDefeated ? 'enemy__shadow enemy__shadow--defeated' : 'enemy__shadow';
  const mark = ENEMY_ANNOYANCE_MARKS[enemy.id];

  // While it talks, the bubble is as wide as the talk says (EnemyView.css).
  const intentClassName = bubble === null ? 'enemy__intent' : 'enemy__intent enemy__intent--talking';
  const intentStyle =
    bubble === null
      ? undefined
      : ({ '--bubble-width': bubble.width, '--bubble-left': bubbleLeft(bubble.width) } as CSSProperties);

  return (
    <>
      <section
        className="enemy"
        ref={(element) => (element === null ? undefined : camera.attachFollower('desk', element))}
      >
        <img ref={shadowElement} className={shadowClassName} src={getSpriteUrl(ENEMY_SHADOWS[enemy.id])} alt="" />

        <div ref={shakeElement} className="enemy__shake">
          <div
            key={`${arrivals}-${hits}`}
            ref={bodyElement}
            className={bodyClassName}
            onAnimationEnd={handleAnimationEnd}
          >
            <Sprite id={ENEMY_SPRITES[enemy.id]} description={texts.description} size={96} />
          </div>

          {!isDefeated && (
            <span
              ref={markElement}
              className="enemy__annoyance-mark"
              style={{ left: `calc(${mark.x} * var(--art-pixel))`, top: `calc(${mark.y} * var(--art-pixel))` }}
            />
          )}
        </div>

        {hits > 0 && (
          <span key={hits} className="effect-tag effect-tag--damage enemy__damage" aria-hidden="true">
            {es.combat.lossSign}
            {lastDamage}
          </span>
        )}
      </section>

      {/* While it talks, the icon and the value of the intent are hidden,
          but screen readers still read them: the phrase is only a picture
          of its annoyance, and they skip it. The phrase is written whole
          from the start, with the letters still to come hidden, so its
          lines do not change as it is written. */}
      <p ref={intentElement} className={intentClassName} style={intentStyle}>
        <span className="enemy__hidden-text">{es.combat.intentAttack} </span>
        <Sprite id="intent-attack" description="" />
        <span className="enemy__intent-value">{enemy.intent.amount}</span>
        {bubble !== null && (
          <span className="enemy__phrase" aria-hidden="true">
            <span className="enemy__phrase-text">
              {letters.slice(0, bubble.letters).join('')}
              <span className="enemy__phrase-rest">{letters.slice(bubble.letters).join('')}</span>
            </span>
          </span>
        )}
        {annoyance.count > 0 && (
          <span className="enemy__phrase-measure" aria-hidden="true">
            <span ref={phraseMeasureElement}>{phrase}</span>
          </span>
        )}
      </p>
    </>
  );
}
