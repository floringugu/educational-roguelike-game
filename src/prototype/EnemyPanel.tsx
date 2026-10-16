import type { CSSProperties } from 'react';
import type { SpriteId } from '../assets/catalog';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import type { MockCombat, MockEnemyId } from './mockCombat';
import './EnemyPanel.css';

// The portrait of each enemy, 16x16, for its panel.
const ENEMY_PORTRAITS: Record<MockEnemyId, SpriteId> = {
  midterm: 'enemy-midterm-portrait',
};

type EnemyPanelProps = {
  enemy: MockCombat['enemy'];
};

// The panel of the enemy at the top of the classroom, between the two
// loudspeakers (ticket 12, art guide §2): a strip of a notebook taped to the
// wall (ADR-0016), with its portrait, its name and a health bar with its
// numbers ("40/40").
export function EnemyPanel({ enemy }: EnemyPanelProps) {
  // How full the bar is, from 0 to 1. A CSS variable cannot be typed in
  // `style`, so the object is widened to CSSProperties.
  const barStyle = { '--health-share': enemy.health / enemy.maxHealth } as CSSProperties;

  return (
    <section className="enemy-panel">
      {/* The portrait only repeats the enemy drawn below: screen readers skip it. */}
      <Sprite id={ENEMY_PORTRAITS[enemy.id]} description="" />
      <div className="enemy-panel__details">
        <p className="enemy-panel__name">{es.enemies[enemy.id].name}</p>
        <div
          className="enemy-panel__health"
          role="meter"
          aria-label={es.combat.enemyHealthLabel}
          aria-valuemin={0}
          aria-valuemax={enemy.maxHealth}
          aria-valuenow={enemy.health}
        >
          <span className="enemy-panel__bar" style={barStyle} />
          <span className="enemy-panel__numbers">
            {enemy.health}
            {es.combat.outOf}
            {enemy.maxHealth}
          </span>
        </div>
      </div>
    </section>
  );
}
