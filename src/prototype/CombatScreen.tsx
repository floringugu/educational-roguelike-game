import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../background/usePrefersReducedMotion';
import type { CardData } from '../cards/cardData';
import { Hand } from '../cards/Hand';
import { settleMove, shakeMove } from '../classroom/camera';
import { DeskItems } from '../classroom/DeskItems';
import { useCamera } from '../classroom/useCamera';
import { es } from '../i18n/es';
import { BottomBar } from './BottomBar';
import { CombatMenu } from './CombatMenu';
import { type Annoyance, pickPhraseIndex } from './annoyance';
import { flyCardToShredder, runShredder } from './discardFlight';
import { EnemyPanel } from './EnemyPanel';
import { ENEMY_HIT_AREAS, EnemyView } from './EnemyView';
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

// The energy of the bottom bar. In H1 it is only drawn, always full: playing
// a card does not spend it. Its rules come with the engine of H2.
const H1_ENERGY = 3;

// The prototype deals each new hand from the discard pile, so its draw pile
// is always empty.
const H1_DRAW_PILE_COUNT = 0;

type CombatScreenProps = {
  onOpenSettings: () => void;
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
// card looks and feels. Its layout is the one of the art guide (§2, ticket
// 12): the menu at the top left, the panel of the enemy at the top, the
// enemy with its intent on the green desk, the hand of test cards and, under
// it, the bar with the counters of the player.
// Playing a card asks a question (FR-CMB-001): answered right, the card does
// its effect and, if it hits, the camera shakes the classroom (ADR-0017);
// failed, it does nothing. Either way it goes to the discard pile.
//
// It is throwaway code (ADR-0003): the rules are faked by mockCombat.ts.
export function CombatScreen({ onOpenSettings, onOpenCredits }: CombatScreenProps) {
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
  // Whether the enemy has landed on the desk, so a thrown item of the desk
  // can hit it, and how annoyed it is (ticket 17).
  const [enemyHasLanded, setEnemyHasLanded] = useState(false);
  const [annoyance, setAnnoyance] = useState<Annoyance>({ count: 0, phraseIndex: null });
  // While the menu is open, the items of the desk cannot be picked up.
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const previousQuestionId = useRef<string | null>(null);
  const handElement = useRef<HTMLDivElement>(null);
  const barElement = useRef<HTMLElement>(null);
  const shredderElement = useRef<HTMLSpanElement>(null);
  const stripsElement = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const camera = useCamera();

  const enemyIsDefeated = isEnemyDefeated(combat);
  const enemyIsStanding = enemyHasLanded && !enemyIsDefeated;
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
      camera.play(shakeMove(applied.amount));
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

  // When the combat starts, the camera sits down at the desk, and then the
  // enemy drops onto it (EnemyView).
  useEffect(() => {
    camera.play(settleMove());
  }, [camera]);

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
    // The next enemy has not been annoyed yet, but it does not repeat the
    // last phrase either.
    setEnemyHasLanded(false);
    setAnnoyance((current) => ({ count: 0, phraseIndex: current.phraseIndex }));
  }

  // The same function on every render, so EnemyView does not play the drop
  // of the enemy again.
  const handleEnemyLanded = useCallback(() => setEnemyHasLanded(true), []);

  // A thrown item of the desk hit the enemy: it gets annoyed and says a
  // phrase, never the one it said last (FR-VIS-010). The random number is
  // drawn here, so the update stays the same if React runs it twice.
  function handleDeskItemHit() {
    const random = Math.random();
    setAnnoyance((current) => ({
      count: current.count + 1,
      phraseIndex: pickPhraseIndex(es.combat.annoyancePhrases.length, current.phraseIndex, () => random),
    }));
  }

  return (
    <main className="combat-screen">
      {/* While the question is open, the rest of the screen cannot be
          touched or reached with the keyboard. Neither can the hand while
          the enemy falls. */}
      <div className="combat-screen__content" inert={openQuestion !== null}>
        {/* The title of the screen is only for screen readers: the app moves
            the focus to it when this screen opens again. */}
        <h1 className="combat-screen__hidden-text" tabIndex={-1}>
          {es.app.name}
        </h1>

        <CombatMenu onOpenSettings={onOpenSettings} onOpenCredits={onOpenCredits} onOpenChange={setMenuIsOpen} />

        <EnemyPanel enemy={combat.enemy} />

        {/* The enemy and the items of the desk, which go in front of it or
            behind it. Each enemy finds the items in their places and starts
            without being annoyed. */}
        <div className="combat-screen__scene">
          <EnemyView
            key={`enemy-${enemyArrivals}`}
            enemy={combat.enemy}
            hits={enemyHits}
            lastDamage={lastDamage}
            arrivals={enemyArrivals}
            annoyance={annoyance}
            onLanded={handleEnemyLanded}
            onDefeatShown={handleEnemyDefeatShown}
          />
          <DeskItems
            key={`desk-items-${enemyArrivals}`}
            enemyHitArea={enemyIsStanding ? ENEMY_HIT_AREAS[combat.enemy.id] : null}
            isDisabled={menuIsOpen}
            onEnemyHit={handleDeskItemHit}
            deskCoverRefs={[barElement, handElement]}
          />
        </div>

        <div ref={handElement} className="combat-screen__hand" inert={enemyIsDefeated}>
          <Hand cards={combat.hand} onPlayCard={handlePlayCard} />
        </div>

        <BottomBar
          drawPileCount={H1_DRAW_PILE_COUNT}
          energy={H1_ENERGY}
          maxEnergy={H1_ENERGY}
          health={combat.player.health}
          maxHealth={combat.player.maxHealth}
          block={combat.player.block}
          discardCount={shownDiscardCount}
          shredderRef={shredderElement}
          stripsRef={stripsElement}
          barRef={barElement}
          healthTag={
            playerTag !== null && (
              <span
                key={playerTag.number}
                className={`effect-tag effect-tag--${playerTag.effect.kind} combat-screen__player-tag`}
                aria-hidden="true"
              >
                {es.combat.gainSign}
                {playerTag.effect.amount}
              </span>
            )
          }
        />
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
