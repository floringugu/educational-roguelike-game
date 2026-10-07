import type { AnimationEvent } from 'react';
import type { SpriteId } from '../assets/catalog';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import { HealthBar } from './HealthBar';
import type { MockCombat, MockEnemyId } from './mockCombat';
import './EnemyView.css';

// The sprite of each enemy. Both are 96x96 and are drawn at 192 px, so each
// of their pixels is 2 px on screen, as in the art of the cards. Both are
// pen doodles with flat colors: the Parcial is drawn on the exam sheet
// itself, and Don Ramiro on a scrap of notebook paper that is part of his
// sprite.
const ENEMY_SPRITES: Record<MockEnemyId, SpriteId> = {
  midterm: 'enemy-midterm',
  mathTeacher: 'enemy-math-teacher',
};

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

// The enemy of the prototype (ticket 06): its intent over its head
// (FR-CMB-005), its sprite from the asset catalog, its name and its health
// bar.
export function EnemyView({ enemy, hits, lastDamage, arrivals, onDefeatShown }: EnemyViewProps) {
  const texts = es.enemies[enemy.id];
  const isDefeated = enemy.health === 0;

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === 'enemy-fall') {
      onDefeatShown();
    }
  }

  // The key makes React draw the sprite again on each hit and each arrival,
  // which starts its CSS animation from the beginning.
  const bodyClassName = [
    'enemy__body',
    hits > 0 && 'enemy__body--hit',
    isDefeated && 'enemy__body--defeated',
    arrivals > 0 && hits === 0 && 'enemy__body--arrived',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="enemy">
      <p className="enemy__intent">
        <span className="enemy__hidden-text">{es.combat.intentAttack} </span>
        <Sprite id="intent-attack" description="" size={32} />
        <span className="enemy__intent-value">{enemy.intent.amount}</span>
      </p>

      <div key={`${arrivals}-${hits}`} className={bodyClassName} onAnimationEnd={handleAnimationEnd}>
        <Sprite id={ENEMY_SPRITES[enemy.id]} description={texts.description} size={192} />
      </div>

      {hits > 0 && (
        <span key={hits} className="effect-tag effect-tag--damage enemy__damage" aria-hidden="true">
          {es.combat.lossSign}
          {lastDamage}
        </span>
      )}

      <p className="enemy__name">{texts.name}</p>

      <div className="enemy__health">
        <HealthBar
          health={enemy.health}
          maxHealth={enemy.maxHealth}
          label={es.combat.enemyHealthLabel}
          kind="enemy"
        />
      </div>
    </section>
  );
}
