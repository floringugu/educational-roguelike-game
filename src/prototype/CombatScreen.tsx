import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../background/usePrefersReducedMotion';
import type { CardData } from '../cards/cardData';
import { Hand } from '../cards/Hand';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import { flyCardToShredder, runShredder } from './discardFlight';
import { EnemyView } from './EnemyView';
import { HealthMeter } from './HealthMeter';
import {
  bringNextEnemy,
  dealNewHand,
  isEnemyDefeated,
  isHandEmpty,
  playCard,
  startMockCombat,
  type CardEffect,
} from './mockCombat';
import { QuestionSheet } from './QuestionSheet';
import { TEST_QUESTIONS, pickQuestion, shuffledOptions, type Question } from './questions';
import { TEST_HAND } from './testHand';
import './CombatScreen.css';

// How long the hand stays empty after its last card, so the result of that
// card can be seen before the new hand comes in and the block is lost.
const NEW_HAND_DELAY_MS = 1000;


type CombatScreenProps = {
  onOpenCredits: () => void;
};

// The question being asked: the card that asked it and the order its options
// were shuffled in.
type OpenQuestion = {
  cardKey: string;
  card: CardData;
  question: Question;
  options: string[];
};

// A tag with what a card did to the player, such as "+5" of block. The
// number tells each tag from the one before, so a new one floats up again.
type PlayerTag = {
  number: number;
  effect: CardEffect;
};

// The combat screen of the H1 prototype (ticket 06), to judge how playing a
// card looks and feels. There is an enemy with its name, its health and its
// intent, the health and block of the player, and the hand of test cards.
// Playing a card asks a question (FR-CMB-001): answered right, the card does
// its effect and, if it hits, the screen shakes; failed, it does nothing.
// Either way it goes to the discard pile.
//
// It is throwaway code (ADR-0003): the rules are faked by mockCombat.ts.
export function CombatScreen({ onOpenCredits }: CombatScreenProps) {
  const [combat, setCombat] = useState(() => startMockCombat(TEST_HAND));
  const [openQuestion, setOpenQuestion] = useState<OpenQuestion | null>(null);
  // Hits since the last enemy came in, and the damage of the last one.
  const [enemyHits, setEnemyHits] = useState(0);
  const [lastDamage, setLastDamage] = useState(0);
  // How many enemies have come in after the first one.
  const [enemyArrivals, setEnemyArrivals] = useState(0);
  const [playerTag, setPlayerTag] = useState<PlayerTag | null>(null);
  // Played cards still flying to the shredder. The discard counter does not
  // count them until they go in.
  const [cardsInFlight, setCardsInFlight] = useState(0);
  const previousQuestionId = useRef<string | null>(null);
  const screenElement = useRef<HTMLElement>(null);
  const handElement = useRef<HTMLDivElement>(null);
  const shredderElement = useRef<HTMLSpanElement>(null);
  const stripsElement = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const enemyIsDefeated = isEnemyDefeated(combat);
  const handIsEmpty = isHandEmpty(combat);
  const shownDiscardCount = Math.max(combat.discardPile.length - cardsInFlight, 0);

  function handlePlayCard(cardKey: string) {
    const handCard = combat.hand.find((candidate) => candidate.key === cardKey);
    if (openQuestion !== null || handCard === undefined) {
      return;
    }
    const question = pickQuestion(TEST_QUESTIONS, previousQuestionId.current);
    previousQuestionId.current = question.id;
    setOpenQuestion({
      cardKey,
      card: handCard.card,
      question,
      options: shuffledOptions(question),
    });
  }

  function handleQuestionResolved(isCorrect: boolean) {
    if (openQuestion === null) {
      return;
    }
    const { combat: nextCombat, applied } = playCard(combat, openQuestion.cardKey, isCorrect);
    // Before the card leaves the hand, a copy of it starts its flight to
    // the shredder.
    sendCardToShredder(openQuestion.cardKey);
    setCombat(nextCombat);
    setOpenQuestion(null);

    if (applied?.kind === 'damage') {
      setEnemyHits(enemyHits + 1);
      setLastDamage(applied.amount);
      shakeScreen(applied.amount);
    } else if (applied !== null) {
      setPlayerTag({ number: (playerTag?.number ?? 0) + 1, effect: applied });
    }

    focusFirstCard();
  }

  // A played card, right or wrong, flies to the shredder of the discard
  // pile, which cuts it into strips. With reduced motion it only goes to the
  // discard pile, as the counter shows (FR-VIS-007).
  function sendCardToShredder(cardKey: string) {
    const index = combat.hand.findIndex((candidate) => candidate.key === cardKey);
    const slot = handElement.current?.querySelectorAll('.hand__slot')[index];
    const card = slot?.querySelector<HTMLElement>('.card');
    const shredder = shredderElement.current;
    const strips = stripsElement.current;
    if (prefersReducedMotion || card === null || card === undefined || shredder === null || strips === null) {
      return;
    }
    setCardsInFlight((count) => count + 1);
    void flyCardToShredder(card, shredder).then(() => {
      setCardsInFlight((count) => count - 1);
      runShredder(shredder, strips);
    });
  }

  // Gives the keyboard focus back to the hand, where the next card is. The
  // frame wait lets React draw the hand first.
  function focusFirstCard() {
    window.requestAnimationFrame(() => {
      handElement.current?.querySelector<HTMLElement>('.card')?.focus({ preventScroll: true });
    });
  }

  // After the last card, a new hand is dealt with a pause. Not while the
  // enemy falls: the next enemy comes in first, and then the hand.
  useEffect(() => {
    if (!handIsEmpty || enemyIsDefeated) {
      return;
    }
    const timer = window.setTimeout(() => {
      setCombat((current) => dealNewHand(current));
      focusFirstCard();
    }, NEW_HAND_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [handIsEmpty, enemyIsDefeated]);

  function handleEnemyDefeatShown() {
    setCombat(bringNextEnemy(combat));
    setEnemyHits(0);
    setEnemyArrivals(enemyArrivals + 1);
    setPlayerTag(null);
  }

  // The whole screen shakes with a hit, harder the more damage it does. It
  // uses the animations of the browser (Element.animate), which run without
  // drawing the screen again with React. Not with reduced motion (FR-VIS-007).
  function shakeScreen(damage: number) {
    if (prefersReducedMotion) {
      return;
    }
    const pixels = Math.min(4 + damage / 2, 10);
    screenElement.current?.animate(
      [
        { transform: 'translate(0, 0)' },
        { transform: `translate(${-pixels}px, ${pixels / 2}px)` },
        { transform: `translate(${pixels}px, ${-pixels / 2}px)` },
        { transform: `translate(${-pixels / 2}px, ${pixels / 4}px)` },
        { transform: `translate(${pixels / 4}px, 0)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: 350, easing: 'ease-out' },
    );
  }

  return (
    <main ref={screenElement} className="combat-screen">
      {/* While the question is open, the rest of the screen cannot be
          touched or reached with the keyboard. Neither can the hand while
          the enemy falls. */}
      <div className="combat-screen__content" inert={openQuestion !== null}>
        <header className="combat-screen__top">
          <h1 className="combat-screen__title" tabIndex={-1}>
            {es.app.name}
          </h1>
          <button type="button" className="combat-screen__credits" onClick={onOpenCredits}>
            {es.combat.creditsButton}
          </button>
        </header>

        <div className="combat-screen__arena">
          <EnemyView
            enemy={combat.enemy}
            hits={enemyHits}
            lastDamage={lastDamage}
            arrivals={enemyArrivals}
            onDefeatShown={handleEnemyDefeatShown}
          />
        </div>

        <section className="combat-screen__player">
          <div className="combat-screen__player-health">
            <HealthMeter
              health={combat.player.health}
              maxHealth={combat.player.maxHealth}
              label={es.combat.playerHealthLabel}
              kind="player"
            />
          </div>
          {/* The block is a shield drawn with a pen, dimmed when there is
              none. The discard pile is a paper shredder. Their names are
              only for screen readers: the drawings say what they are. */}
          <p className="combat-screen__counter combat-screen__counter--block">
            <span className="combat-screen__counter-label">{es.combat.blockLabel}</span>
            <Sprite
              id={combat.player.block > 0 ? 'block-shield-full' : 'block-shield-empty'}
              description=""
            />
            <span className="combat-screen__counter-value">{combat.player.block}</span>
          </p>
          <p className="combat-screen__counter combat-screen__counter--discard">
            <span className="combat-screen__counter-label">{es.combat.discardLabel}</span>
            {/* The strips of paper, hidden under the shredder until it cuts a
                card. */}
            <span className="combat-screen__strips">
              <span ref={stripsElement} className="combat-screen__strips-paper">
                <Sprite id="discard-shredder-strips" description="" />
              </span>
            </span>
            <span ref={shredderElement} className="combat-screen__shredder">
              <Sprite id="discard-shredder" description="" />
              <span className="combat-screen__counter-value">{shownDiscardCount}</span>
            </span>
          </p>
          {playerTag !== null && (
            <span
              key={playerTag.number}
              className={`effect-tag effect-tag--${playerTag.effect.kind} combat-screen__player-tag`}
              aria-hidden="true"
            >
              {es.combat.gainSign}
              {playerTag.effect.amount}
            </span>
          )}
        </section>

        <div ref={handElement} inert={enemyIsDefeated}>
          <Hand cards={combat.hand} onPlayCard={handlePlayCard} />
        </div>
      </div>

      {openQuestion !== null && (
        <QuestionSheet
          // A new key for each question, so the sheet starts clean.
          key={`${openQuestion.cardKey}-${openQuestion.question.id}`}
          card={openQuestion.card}
          question={openQuestion.question}
          options={openQuestion.options}
          onResolved={handleQuestionResolved}
        />
      )}
    </main>
  );
}
