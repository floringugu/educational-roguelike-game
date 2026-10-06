import { describe, expect, it } from 'vitest';
import { CARD_STAINS, CARD_TYPES, parseCards } from '../../src/cards/cardData.ts';
import { es } from '../../src/i18n/es.ts';
import cardsJson from '../../src/prototype/cards.json';

const validCard = { id: 'chalkThrow', type: 'attack', cost: 1, art: 'card-art-chalk', edition: 'base' };

describe('the test hand in src/prototype/cards.json (FR-VIS-002)', () => {
  const cards = parseCards(cardsJson);

  it('has 5 cards, the size of a hand', () => {
    expect(cards).toHaveLength(5);
  });

  it('has at least one foil card and one holo card', () => {
    expect(cards.some((card) => card.edition === 'foil')).toBe(true);
    expect(cards.some((card) => card.edition === 'holo')).toBe(true);
  });

  it('takes the name and the description of every card from the text catalog (NFR-I18N-001)', () => {
    for (const card of cards) {
      expect(es.cards[card.id].name, card.id).not.toBe('');
      expect(es.cards[card.id].description, card.id).not.toBe('');
    }
  });

  it('has a card of each type, with its label in the text catalog', () => {
    for (const type of CARD_TYPES) {
      expect(cards.some((card) => card.type === type), type).toBe(true);
      expect(es.cardTypes[type], type).not.toBe('');
    }
  });

  it('stains only Tocho and Cafelito, the cards of long hours of study, and never a crumpled card', () => {
    const stained = cards.filter((card) => card.stain !== undefined).map((card) => card.id);
    expect(stained.sort()).toEqual(['coffee', 'tome']);
    for (const card of cards.filter((card) => card.stain !== undefined)) {
      expect(card.edition, card.id).toBe('base');
    }
  });

  it('draws every card with card art of the asset catalog (FR-VIS-004)', () => {
    for (const card of cards) {
      expect(card.art, card.id).toMatch(/^card-art-/);
    }
  });
});

describe('parseCards', () => {
  it('accepts a valid list', () => {
    expect(parseCards([validCard])).toEqual([validCard]);
  });

  it('rejects something that is not a list', () => {
    expect(() => parseCards({ cards: [] })).toThrow('JSON array');
  });

  it('rejects a card without texts in the catalog', () => {
    expect(() => parseCards([{ ...validCard, id: 'fireball' }])).toThrow('"fireball"');
  });

  it('rejects an unknown type', () => {
    for (const type of ['heal', undefined]) {
      expect(() => parseCards([{ ...validCard, type }])).toThrow('type');
    }
  });

  it('rejects a cost that is not a whole number of 0 or more', () => {
    for (const cost of [-1, 1.5, '1', undefined]) {
      expect(() => parseCards([{ ...validCard, cost }])).toThrow('cost');
    }
  });

  it('rejects art that is not in the asset catalog', () => {
    expect(() => parseCards([{ ...validCard, art: 'card-art-magic' }])).toThrow('"card-art-magic"');
  });

  it('rejects an unknown edition', () => {
    expect(() => parseCards([{ ...validCard, edition: 'gold' }])).toThrow('edition');
  });

  it('accepts every coffee stain, and a card without one', () => {
    for (const stain of CARD_STAINS) {
      expect(parseCards([{ ...validCard, stain }])).toEqual([{ ...validCard, stain }]);
    }
    expect(parseCards([validCard])[0]).not.toHaveProperty('stain');
  });

  it('rejects an unknown stain', () => {
    for (const stain of ['tea', null, true]) {
      expect(() => parseCards([{ ...validCard, stain }])).toThrow('stain');
    }
  });

  it('rejects a coffee stain on a diploma or a certificate', () => {
    for (const edition of ['foil', 'holo']) {
      expect(() => parseCards([{ ...validCard, edition, stain: 'ring' }])).toThrow('base edition');
    }
  });

  it('says which card is wrong', () => {
    expect(() => parseCards([validCard, null])).toThrow('card 1');
  });
});
