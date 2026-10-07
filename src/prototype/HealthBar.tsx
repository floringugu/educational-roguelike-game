import type { CSSProperties } from 'react';
import { es } from '../i18n/es';
import './HealthBar.css';

type HealthBarProps = {
  health: number;
  maxHealth: number;
  // What the bar is, for screen readers ("Vida del enemigo").
  label: string;
  // The color of the health that is left.
  kind: 'enemy' | 'player';
};

// A health bar with its numbers ("26/40"). When the health drops, the bar
// shrinks at once and a lighter trail follows it a moment later, so the hit
// can be seen (ticket 06). The bar itself is drawn by HealthBar.css from the
// fraction of health that is left.
export function HealthBar({ health, maxHealth, label, kind }: HealthBarProps) {
  // A CSS variable cannot be typed in `style`, so the object is widened to
  // CSSProperties.
  const style = { '--health-fraction': health / maxHealth } as CSSProperties;
  return (
    <div
      className={`health-bar health-bar--${kind}`}
      style={style}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={maxHealth}
      aria-valuenow={health}
    >
      <span className="health-bar__numbers">
        {health}
        {es.combat.outOf}
        {maxHealth}
      </span>
    </div>
  );
}
