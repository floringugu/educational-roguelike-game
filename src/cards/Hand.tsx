import { LazyMotion, domMin } from 'motion/react';
import { es } from '../i18n/es';
import { Card } from './Card';
import type { CardData } from './cardData';
import { fanPose } from './fanLayout';
import './Hand.css';

type HandProps = {
  cards: CardData[];
};

// The cards of the hand, open like a fan along the bottom of the screen, where
// the thumb reaches them with the phone held upright (FR-VIS-002,
// NFR-USA-002).
//
// The cards move with Motion (ADR-0004) in its light form: `m` components
// inside LazyMotion only load the features they are given. domMin is the
// smallest set, enough to draw the springs of the cards; `strict` makes the
// full `motion` components, which would load everything, an error here.
export function Hand({ cards }: HandProps) {
  return (
    <LazyMotion features={domMin} strict>
      <ol className="hand" aria-label={es.hand.label}>
        {cards.map((card, index) => (
          // The position is the key: the same card can be twice in a hand.
          <li key={index} className="hand__slot">
            <Card card={card} restPose={fanPose(index, cards.length)} />
          </li>
        ))}
      </ol>
    </LazyMotion>
  );
}
