import { LazyMotion, domMin } from 'motion/react';
import { es } from '../i18n/es';
import { Card } from './Card';
import type { HandCard } from './cardData';
import { fanPose } from './fanLayout';
import './Hand.css';

type HandProps = {
  cards: readonly HandCard[];
  // Called with the key of the card that the player plays.
  onPlayCard?: (key: string) => void;
};

// The cards of the hand, open like a fan along the bottom of the screen, where
// the thumb reaches them with the phone held upright (FR-VIS-002,
// NFR-USA-002).
//
// The cards move with Motion (ADR-0004) in its light form: `m` components
// inside LazyMotion only load the features they are given. domMin is the
// smallest set, enough to draw the springs of the cards; `strict` makes the
// full `motion` components, which would load everything, an error here.
export function Hand({ cards, onPlayCard }: HandProps) {
  return (
    <LazyMotion features={domMin} strict>
      <ol className="hand" aria-label={es.hand.label}>
        {cards.map(({ key, card }, index) => (
          <li key={key} className="hand__slot">
            <Card
              card={card}
              restPose={fanPose(index, cards.length)}
              onPlay={onPlayCard === undefined ? undefined : () => onPlayCard(key)}
            />
          </li>
        ))}
      </ol>
    </LazyMotion>
  );
}
