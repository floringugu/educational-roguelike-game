import type { ReactNode, Ref } from 'react';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import './BottomBar.css';

type BottomBarProps = {
  drawPileCount: number;
  energy: number;
  maxEnergy: number;
  health: number;
  maxHealth: number;
  block: number;
  discardCount: number;
  // The shredder of the discard pile and its strips of paper, for the
  // animation of a played card (discardFlight.ts).
  shredderRef: Ref<HTMLSpanElement>;
  stripsRef: Ref<HTMLSpanElement>;
  // The whole bar, so the items of the desk are not left under it
  // (DeskItems, ticket 17).
  barRef?: Ref<HTMLElement>;
  // What the last card did to the player ("+5"), floating over the health.
  healthTag?: ReactNode;
};

// The counters of the player (ticket 12, ADR-0016), on the green desk over
// the hand: five scraps of a notebook taped to the desk, for the draw pile,
// the energy, the health, the block and the discard pile, and a post-it that
// ends the turn. Each scrap holds a drawing over its number. The names of the
// counters are only for screen readers: the drawings say what they are.
export function BottomBar({
  drawPileCount,
  energy,
  maxEnergy,
  health,
  maxHealth,
  block,
  discardCount,
  shredderRef,
  stripsRef,
  barRef,
  healthTag,
}: BottomBarProps) {
  return (
    <section ref={barRef} className="bottom-bar">
      <p className="bottom-bar__counter bottom-bar__counter--draw-pile">
        <span className="bottom-bar__hidden-text">{es.combat.drawPileLabel} </span>
        <Sprite id="draw-pile-sheets" description="" />
        <span className="bottom-bar__value">{drawPileCount}</span>
      </p>

      {/* In H1 the energy is only drawn: playing a card does not spend it.
          Its rules come with the engine of H2. */}
      <p className="bottom-bar__counter bottom-bar__counter--energy">
        <span className="bottom-bar__hidden-text">{es.combat.energyLabel} </span>
        <Sprite id="energy-can" description="" />
        <span className="bottom-bar__value">
          {energy}
          {es.combat.outOf}
          {maxEnergy}
        </span>
      </p>

      {/* The health of the student is a neuron, empty when none is left. */}
      <div
        className="bottom-bar__counter bottom-bar__counter--health"
        role="meter"
        aria-label={es.combat.playerHealthLabel}
        aria-valuemin={0}
        aria-valuemax={maxHealth}
        aria-valuenow={health}
      >
        <Sprite id={health > 0 ? 'health-neuron-full' : 'health-neuron-empty'} description="" />
        <span className="bottom-bar__value">
          {health}
          {es.combat.outOf}
          {maxHealth}
        </span>
        {healthTag}
      </div>

      {/* The block is a shield drawn with a pen, dimmed when there is none. */}
      <p className="bottom-bar__counter bottom-bar__counter--block">
        <span className="bottom-bar__hidden-text">{es.combat.blockLabel} </span>
        <Sprite id={block > 0 ? 'block-shield-full' : 'block-shield-empty'} description="" />
        <span className="bottom-bar__value">{block}</span>
      </p>

      {/* The discard pile is a paper shredder. The strips of a cut card come
          out under it, hidden until it cuts one. */}
      <p className="bottom-bar__counter bottom-bar__counter--discard">
        <span className="bottom-bar__hidden-text">{es.combat.discardLabel} </span>
        <span className="bottom-bar__shredder-box">
          <span ref={shredderRef} className="bottom-bar__shredder">
            <Sprite id="discard-shredder" description="" />
          </span>
          <span className="bottom-bar__strips">
            <span ref={stripsRef} className="bottom-bar__strips-paper">
              <Sprite id="discard-shredder-strips" description="" />
            </span>
          </span>
        </span>
        <span className="bottom-bar__value">{discardCount}</span>
      </p>

      {/* In H1 the turn does not end: the post-it is drawn but does nothing,
          and aria-disabled tells screen readers that it is not available yet.
          Unlike `disabled`, it can still be reached with the keyboard, so it
          is announced. */}
      <button type="button" className="bottom-bar__end-turn" aria-disabled="true">
        <span className="bottom-bar__end-turn-text">{es.combat.endTurnButton}</span>
      </button>
    </section>
  );
}
