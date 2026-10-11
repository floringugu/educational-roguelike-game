import type { CSSProperties } from 'react';
import { Sprite } from '../components/Sprite';
import type { SpriteId } from '../assets/catalog';
import { es } from '../i18n/es';
import { filledQuarters } from './healthSymbols';
import './HealthMeter.css';

type HealthMeterProps = {
  health: number;
  maxHealth: number;
  // What the meter is, for screen readers ("Vida del enemigo").
  label: string;
  // Whose health it is: it decides the symbol.
  kind: 'enemy' | 'player';
};

// The symbol of each side, full and empty: the neurons of the student, and
// the red pen crosses of the enemy, like the mistakes marked on an exam.
const SYMBOL_SPRITES: Record<HealthMeterProps['kind'], { full: SpriteId; empty: SpriteId }> = {
  player: { full: 'health-neuron-full', empty: 'health-neuron-empty' },
  enemy: { full: 'health-cross-full', empty: 'health-cross-empty' },
};

// The health as a row of symbols, with its numbers ("26/40") beside them.
// Each symbol is the empty sprite with the full one over it, cut to the
// quarters that are left (see HealthMeter.css and healthSymbols.ts).
export function HealthMeter({ health, maxHealth, label, kind }: HealthMeterProps) {
  const sprites = SYMBOL_SPRITES[kind];
  return (
    <div
      className="health-meter"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={maxHealth}
      aria-valuenow={health}
    >
      <span className="health-meter__symbols">
        {filledQuarters(health, maxHealth).map((quarters, index) => {
          // A CSS variable cannot be typed in `style`, so the object is
          // widened to CSSProperties.
          const style = { '--filled-quarters': quarters } as CSSProperties;
          return (
            // The symbols never change order, so their position is their key.
            <span key={index} className="health-meter__symbol" style={style}>
              <Sprite id={sprites.empty} description="" size={32} />
              <span className="health-meter__full">
                <Sprite id={sprites.full} description="" size={32} />
              </span>
            </span>
          );
        })}
      </span>
      <span className="health-meter__numbers">
        {health}
        {es.combat.outOf}
        {maxHealth}
      </span>
    </div>
  );
}
