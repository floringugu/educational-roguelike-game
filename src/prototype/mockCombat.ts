import type { CardData, CardId, HandCard } from '../cards/cardData';

// Throwaway code of the H1 prototype (ticket 06, ADR-0003). It only fakes a
// combat to judge how playing a card looks and feels. The real rules
// (energy, turns, the phase of the enemies) are the game engine of H2, a
// separate pure package that does not reuse any of this.

// What a test card does when its question is answered right. The number is
// also written in its description (src/i18n/es.ts); a test checks that both
// say the same.
export type CardEffect = {
  kind: 'damage' | 'block' | 'heal';
  amount: number;
};

export const CARD_EFFECTS: Record<CardId, CardEffect> = {
  chalkThrow: { kind: 'damage', amount: 6 },
  skipClass: { kind: 'block', amount: 5 },
  coffee: { kind: 'heal', amount: 4 },
  cheatSheet: { kind: 'damage', amount: 10 },
  tome: { kind: 'block', amount: 9 },
};

// What the enemy will do in its next phase (FR-CMB-005). The prototype only
// has attacks, and the enemy never does them: there is no enemy phase.
export type Intent = {
  kind: 'attack';
  amount: number;
};

// The enemy shows the next one of these each time a new hand is dealt, so
// the intent can be seen changing.
export const ENEMY_INTENTS: readonly Intent[] = [
  { kind: 'attack', amount: 8 },
  { kind: 'attack', amount: 12 },
  { kind: 'attack', amount: 6 },
];

// The two enemies of the prototype. They take turns: when one is defeated,
// the other one comes in. So both styles of enemy art can be judged on the
// phone: a normal enemy, a student's worry drawn in pixel art, and a
// character, a caricature drawn in pen as in the margin of a notebook.
export const MOCK_ENEMY_IDS = ['midterm', 'mathTeacher'] as const;
export type MockEnemyId = (typeof MOCK_ENEMY_IDS)[number];

const ENEMY_MAX_HEALTH = 40;
const PLAYER_MAX_HEALTH = 40;
// The player starts hurt, so healing can be seen.
const PLAYER_START_HEALTH = 26;

export type MockCombat = {
  hand: HandCard[];
  discardPile: HandCard[];
  enemy: { id: MockEnemyId; health: number; maxHealth: number; intent: Intent };
  player: { health: number; maxHealth: number; block: number };
  // How many hands have been dealt. It gives each new hand its own keys and
  // its intent.
  handsDealt: number;
};

// The effect of a played card as it happened: a hit on an enemy with 4 of
// health left takes 4, not 6. It is null when the question was failed and the
// card did nothing (FR-CMB-001).
export type PlayResult = {
  combat: MockCombat;
  applied: CardEffect | null;
};

export function startMockCombat(cards: readonly CardData[]): MockCombat {
  return {
    hand: dealHand(cards, 0),
    discardPile: [],
    enemy: {
      id: MOCK_ENEMY_IDS[0],
      health: ENEMY_MAX_HEALTH,
      maxHealth: ENEMY_MAX_HEALTH,
      intent: intentForHand(0),
    },
    player: { health: PLAYER_START_HEALTH, maxHealth: PLAYER_MAX_HEALTH, block: 0 },
    handsDealt: 1,
  };
}

// Plays the card of the hand with the given key, once its question has been
// answered (FR-CMB-001). Answered right, the card applies its effect; failed,
// it does nothing. Either way it goes to the discard pile. After the last card
// the hand stays empty: the screen waits a moment, so the result of that card
// can be seen, and then deals a new hand with dealNewHand.
export function playCard(combat: MockCombat, cardKey: string, isCorrect: boolean): PlayResult {
  const played = combat.hand.find((handCard) => handCard.key === cardKey);
  if (played === undefined) {
    throw new Error(`There is no card "${cardKey}" in the hand`);
  }
  const hand = combat.hand.filter((handCard) => handCard !== played);
  const discardPile = [...combat.discardPile, played];

  let enemy = combat.enemy;
  let player = combat.player;
  let applied: CardEffect | null = null;
  if (isCorrect) {
    const effect = CARD_EFFECTS[played.card.id];
    if (effect.kind === 'damage') {
      const damage = Math.min(effect.amount, enemy.health);
      enemy = { ...enemy, health: enemy.health - damage };
      applied = { kind: 'damage', amount: damage };
    } else if (effect.kind === 'block') {
      player = { ...player, block: player.block + effect.amount };
      applied = effect;
    } else {
      const healing = Math.min(effect.amount, player.maxHealth - player.health);
      player = { ...player, health: player.health + healing };
      applied = { kind: 'heal', amount: healing };
    }
  }

  return { combat: { ...combat, hand, discardPile, enemy, player }, applied };
}

export function isHandEmpty(combat: MockCombat): boolean {
  return combat.hand.length === 0;
}

export function isEnemyDefeated(combat: MockCombat): boolean {
  return combat.enemy.health === 0;
}

// Once its defeat has been shown, the other enemy comes in with full health,
// as if a new combat started: the player gets the health they started with
// again, so there is always something to heal.
export function bringNextEnemy(combat: MockCombat): MockCombat {
  const nextIndex = (MOCK_ENEMY_IDS.indexOf(combat.enemy.id) + 1) % MOCK_ENEMY_IDS.length;
  return {
    ...combat,
    enemy: { ...combat.enemy, id: MOCK_ENEMY_IDS[nextIndex] as MockEnemyId, health: combat.enemy.maxHealth },
    player: { ...combat.player, health: PLAYER_START_HEALTH, block: 0 },
  };
}

// A new hand from the discard pile, so the prototype can be played without
// end. It is as if a new turn began: the block of the last turn is lost and
// the enemy shows its next intent.
export function dealNewHand(combat: MockCombat): MockCombat {
  const cards = combat.discardPile.map((handCard) => handCard.card);
  return {
    ...combat,
    hand: dealHand(cards, combat.handsDealt),
    discardPile: [],
    enemy: { ...combat.enemy, intent: intentForHand(combat.handsDealt) },
    player: { ...combat.player, block: 0 },
    handsDealt: combat.handsDealt + 1,
  };
}

// Each card of a new hand gets a key that no card had before, so the screen
// sees new cards and deals them in, even if they are the same cards.
function dealHand(cards: readonly CardData[], handNumber: number): HandCard[] {
  return cards.map((card, index) => ({ key: `${handNumber}-${index}`, card }));
}

function intentForHand(handNumber: number): Intent {
  return ENEMY_INTENTS[handNumber % ENEMY_INTENTS.length] as Intent;
}
