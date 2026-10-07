import { describe, expect, it } from 'vitest';
import type { CardData, HandCard } from '../../src/cards/cardData.ts';
import { es } from '../../src/i18n/es.ts';
import {
  CARD_EFFECTS,
  ENEMY_INTENTS,
  MOCK_ENEMY_IDS,
  bringNextEnemy,
  dealNewHand,
  isEnemyDefeated,
  isHandEmpty,
  playCard,
  startMockCombat,
  type MockCombat,
} from '../../src/prototype/mockCombat.ts';
import { TEST_HAND } from '../../src/prototype/testHand.ts';

// The key of the first card of the hand with the given id.
function keyOf(combat: MockCombat, id: CardData['id']): string {
  const handCard = combat.hand.find((candidate) => candidate.card.id === id);
  if (handCard === undefined) {
    throw new Error(`There is no ${id} in the hand`);
  }
  return handCard.key;
}

describe('the mock combat of the prototype (ticket 06)', () => {
  it('starts with the 5 test cards in hand, the enemy unhurt and the first intent', () => {
    const combat = startMockCombat(TEST_HAND);
    expect(combat.hand).toHaveLength(5);
    expect(combat.discardPile).toHaveLength(0);
    expect(combat.enemy.health).toBe(combat.enemy.maxHealth);
    expect(combat.enemy.intent).toEqual(ENEMY_INTENTS[0]);
    expect(combat.player.block).toBe(0);
  });

  it('writes in the description of every card the number its effect uses', () => {
    for (const card of TEST_HAND) {
      expect(es.cards[card.id].description, card.id).toContain(String(CARD_EFFECTS[card.id].amount));
    }
  });

  it('with a right answer, an attack card hurts the enemy and goes to the discard pile (FR-CMB-001)', () => {
    const combat = startMockCombat(TEST_HAND);
    const { combat: after, applied } = playCard(combat, keyOf(combat, 'chalkThrow'), true);

    expect(applied).toEqual({ kind: 'damage', amount: 6 });
    expect(after.enemy.health).toBe(combat.enemy.health - 6);
    expect(after.hand).toHaveLength(4);
    expect(after.discardPile.map((handCard) => handCard.card.id)).toEqual(['chalkThrow']);
  });

  it('with a wrong answer, the card does nothing and goes to the discard pile (FR-CMB-001)', () => {
    const combat = startMockCombat(TEST_HAND);
    const { combat: after, applied } = playCard(combat, keyOf(combat, 'cheatSheet'), false);

    expect(applied).toBeNull();
    expect(after.enemy).toEqual(combat.enemy);
    expect(after.player).toEqual(combat.player);
    expect(after.discardPile.map((handCard) => handCard.card.id)).toEqual(['cheatSheet']);
  });

  it('does not take more health from the enemy than it has left', () => {
    let combat = startMockCombat(TEST_HAND);
    combat = { ...combat, enemy: { ...combat.enemy, health: 4 } };
    const { combat: after, applied } = playCard(combat, keyOf(combat, 'cheatSheet'), true);

    expect(applied).toEqual({ kind: 'damage', amount: 4 });
    expect(after.enemy.health).toBe(0);
    expect(isEnemyDefeated(after)).toBe(true);
  });

  it('adds block with a defense card', () => {
    const combat = startMockCombat(TEST_HAND);
    const { combat: after, applied } = playCard(combat, keyOf(combat, 'tome'), true);

    expect(applied).toEqual({ kind: 'block', amount: 9 });
    expect(after.player.block).toBe(9);
  });

  it('heals with Cafelito, never above the maximum health', () => {
    let combat = startMockCombat(TEST_HAND);
    const { combat: healed } = playCard(combat, keyOf(combat, 'coffee'), true);
    expect(healed.player.health).toBe(combat.player.health + 4);

    combat = { ...combat, player: { ...combat.player, health: combat.player.maxHealth - 1 } };
    const { combat: full, applied } = playCard(combat, keyOf(combat, 'coffee'), true);
    expect(applied).toEqual({ kind: 'heal', amount: 1 });
    expect(full.player.health).toBe(full.player.maxHealth);
  });

  it('keeps the block of the last card until the new hand is dealt', () => {
    let combat = startMockCombat(TEST_HAND);
    combat = playCard(combat, keyOf(combat, 'skipClass'), true).combat;
    while (combat.hand.length > 1) {
      const other = combat.hand.find((handCard) => handCard.card.id !== 'tome') as HandCard;
      combat = playCard(combat, other.key, false).combat;
    }
    // The last card gives more block: the total is kept, so it can be seen.
    combat = playCard(combat, keyOf(combat, 'tome'), true).combat;

    expect(isHandEmpty(combat)).toBe(true);
    expect(combat.player.block).toBe(5 + 9);
    expect(combat.discardPile).toHaveLength(5);
  });

  it('deals a new hand from the discard pile once the hand is empty', () => {
    let combat = startMockCombat(TEST_HAND);
    combat = playCard(combat, keyOf(combat, 'tome'), true).combat;
    const firstKeys = TEST_HAND.map((_card, index) => `0-${index}`);
    while (!isHandEmpty(combat)) {
      combat = playCard(combat, (combat.hand[0] as HandCard).key, false).combat;
    }
    combat = dealNewHand(combat);

    expect(combat.hand).toHaveLength(5);
    expect(combat.discardPile).toHaveLength(0);
    // New keys, so the screen deals the cards in again.
    for (const handCard of combat.hand) {
      expect(firstKeys).not.toContain(handCard.key);
    }
    // A new turn: the block is lost and the enemy shows its next intent.
    expect(combat.player.block).toBe(0);
    expect(combat.enemy.intent).toEqual(ENEMY_INTENTS[1]);
  });

  it('brings in the other enemy, with full health, when one is defeated', () => {
    let combat = startMockCombat(TEST_HAND);
    expect(combat.enemy.id).toBe('midterm');
    combat = { ...combat, enemy: { ...combat.enemy, health: 0 }, player: { ...combat.player, block: 5 } };
    const next = bringNextEnemy(combat);

    expect(next.enemy.id).toBe('mathTeacher');
    expect(isEnemyDefeated(next)).toBe(false);
    expect(next.enemy.health).toBe(next.enemy.maxHealth);
    expect(next.player.block).toBe(0);
    // After the last enemy, the first one comes in again.
    expect(bringNextEnemy(next).enemy.id).toBe(MOCK_ENEMY_IDS[0]);
  });

  it('has a name and a description in the text catalog for every enemy', () => {
    for (const id of MOCK_ENEMY_IDS) {
      expect(es.enemies[id].name, id).not.toBe('');
      expect(es.enemies[id].description, id).not.toBe('');
    }
  });

  it('refuses to play a card that is not in the hand', () => {
    const combat = startMockCombat(TEST_HAND);
    expect(() => playCard(combat, 'missing', true)).toThrow();
  });
});
