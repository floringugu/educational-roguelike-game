import { type AnimationEvent, useLayoutEffect, useRef } from 'react';
import { getSpriteUrl, type SpriteId } from '../assets/catalog';
import { usePrefersReducedMotion } from '../background/usePrefersReducedMotion';
import { type CameraMove, SETTLE_ENEMY_DELAY_MS, landingMove } from '../classroom/camera';
import { useCamera } from '../classroom/useCamera';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
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

type EnemyViewProps = {
  enemy: MockCombat['enemy'];
  // How many hits the enemy has taken, and the damage of the last one. Each
  // new hit plays the hit animation and shows its damage.
  hits: number;
  lastDamage: number;
  // How many enemies have come in after the first one.
  arrivals: number;
  // Called when the animation of its defeat ends, to bring the next one.
  onDefeatShown: () => void;
};

// The enemy of the prototype (ticket 06), standing on the green desk with
// its shadow under its feet, and its intent over its head in a bubble of
// paper (FR-CMB-005, ADR-0016). Its name and its health are in EnemyPanel,
// at the top of the classroom (ticket 12). It moves with the desk when the
// camera moves (ADR-0017).
// With reduced motion it does not drop or lean back, and its defeat takes
// no time (FR-VIS-007).
export function EnemyView({ enemy, hits, lastDamage, arrivals, onDefeatShown }: EnemyViewProps) {
  const texts = es.enemies[enemy.id];
  const isDefeated = enemy.health === 0;
  const camera = useCamera();
  const prefersReducedMotion = usePrefersReducedMotion();
  const intentElement = useRef<HTMLParagraphElement>(null);
  const shadowElement = useRef<HTMLImageElement>(null);
  const bodyElement = useRef<HTMLDivElement>(null);

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
      return;
    }
    const delayMs = arrivals === 0 ? SETTLE_ENEMY_DELAY_MS : 0;
    const landingMs = delayMs + DROP_DURATION_MS;
    const drop = camera.playOn(body, dropMove(), delayMs);
    drop.onfinish = () => camera.play(landingMove());
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
  }, [arrivals, camera, prefersReducedMotion]);

  // Each new hit makes the enemy lean back.
  useLayoutEffect(() => {
    const body = bodyElement.current;
    if (hits === 0 || prefersReducedMotion || body === null) {
      return;
    }
    const tilt = body.animate(tiltKeyframes(lastDamage), { duration: TILT_DURATION_MS, easing: 'ease-out' });
    return () => tilt.cancel();
  }, [hits, lastDamage, prefersReducedMotion]);

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === 'enemy-fall') {
      onDefeatShown();
    }
  }

  // The key makes React draw the sprite again on each hit and each arrival,
  // which starts the CSS animation of its defeat from the beginning.
  const bodyClassName = isDefeated ? 'enemy__body enemy__body--defeated' : 'enemy__body';
  const shadowClassName = isDefeated ? 'enemy__shadow enemy__shadow--defeated' : 'enemy__shadow';

  return (
    <section
      className="enemy"
      ref={(element) => (element === null ? undefined : camera.attachFollower('desk', element))}
    >
      <p ref={intentElement} className="enemy__intent">
        <span className="enemy__hidden-text">{es.combat.intentAttack} </span>
        <Sprite id="intent-attack" description="" />
        <span className="enemy__intent-value">{enemy.intent.amount}</span>
      </p>

      <img ref={shadowElement} className={shadowClassName} src={getSpriteUrl(ENEMY_SHADOWS[enemy.id])} alt="" />

      <div
        key={`${arrivals}-${hits}`}
        ref={bodyElement}
        className={bodyClassName}
        onAnimationEnd={handleAnimationEnd}
      >
        <Sprite id={ENEMY_SPRITES[enemy.id]} description={texts.description} size={96} />
      </div>

      {hits > 0 && (
        <span key={hits} className="effect-tag effect-tag--damage enemy__damage" aria-hidden="true">
          {es.combat.lossSign}
          {lastDamage}
        </span>
      )}
    </section>
  );
}
