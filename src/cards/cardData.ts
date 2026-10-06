import { SPRITE_IDS, type SpriteId } from '../assets/sprite-ids';
import { es } from '../i18n/es';

// The editions a card can have (FR-VIS-002). An edition only changes how
// the card looks: "base" is the plain page of the notebook, "foil" is a
// diploma and "holo" a certificate, both crumpled and with a seal whose shine
// moves (see Card.css).
export const CARD_EDITIONS = ['base', 'foil', 'holo'] as const;
export type CardEdition = (typeof CARD_EDITIONS)[number];

// The type of a card says what kind of effect it has. Each type has its own
// color on the card (see Card.css) and its label in `es.cardTypes`.
export const CARD_TYPES = ['attack', 'defense', 'skill'] as const;
export type CardType = (typeof CARD_TYPES)[number];

// The coffee stains a card can have (FR-VIS-002): a wink on the cards that
// look like long hours of study, such as Tocho or Cafelito. "ring" is the
// mark of a cup, "ring-splash" a mark with a splash next to it, "corner" a
// corner soaked by spilled coffee and "corner-ring" both. Only a plain page
// of the notebook ("base") can have one: a crumpled diploma or certificate
// already has its own look, and both together would be too much. They only
// change how the card looks (see Card.css).
export const CARD_STAINS = ['ring', 'ring-splash', 'corner', 'corner-ring'] as const;
export type CardStain = (typeof CARD_STAINS)[number];

// The identifier of a card. Its name and description are in the text
// catalog, under `es.cards.<id>` (NFR-I18N-001), so the data never holds
// visible text.
export type CardId = keyof typeof es.cards;

// A card of the hand as test data (the "carta de acción" of the glossary).
// It only has what the screen needs to draw it. The real cards, with their
// effects and questions, are defined as content packs in H2 (ADR-0009).
export type CardData = {
  id: CardId;
  type: CardType;
  // Energy needed to play the card.
  cost: number;
  // The sprite of the asset catalog drawn on the card (FR-VIS-004).
  art: SpriteId;
  edition: CardEdition;
  // Optional: most cards have no stain, so the field is left out. Only on
  // cards of the "base" edition.
  stain?: CardStain;
};

// Checks that a list read from JSON has the shape of CardData and returns it
// with that type. TypeScript cannot check the contents of a JSON file, so a
// mistake in it (a typo in an id, a missing field) would only show up as a
// broken card on screen. This makes it fail as soon as the file is read, with
// a message that says which card is wrong.
export function parseCards(json: unknown): CardData[] {
  if (!Array.isArray(json)) {
    throw new Error('The card list must be a JSON array');
  }
  return json.map((item: unknown, index) => parseCard(item, `card ${index}`));
}

function parseCard(item: unknown, where: string): CardData {
  if (typeof item !== 'object' || item === null) {
    throw new Error(`${where} must be an object`);
  }
  // Reading a property that may not exist gives `undefined`, which the
  // checks below reject.
  const { id, type, cost, art, edition, stain } = item as Record<string, unknown>;

  if (!isCardId(id)) {
    throw new Error(`${where}: "${String(id)}" is not a card with texts in src/i18n/es.ts`);
  }
  if (!isCardType(type)) {
    throw new Error(`${where} (${id}): the type must be one of ${CARD_TYPES.join(', ')}`);
  }
  if (typeof cost !== 'number' || !Number.isInteger(cost) || cost < 0) {
    throw new Error(`${where} (${id}): the cost must be a whole number of 0 or more`);
  }
  if (!isSpriteId(art)) {
    throw new Error(`${where} (${id}): "${String(art)}" is not a sprite of the asset catalog`);
  }
  if (!isCardEdition(edition)) {
    throw new Error(`${where} (${id}): the edition must be one of ${CARD_EDITIONS.join(', ')}`);
  }
  if (stain !== undefined && !isCardStain(stain)) {
    throw new Error(`${where} (${id}): the stain must be one of ${CARD_STAINS.join(', ')}, or no stain`);
  }
  if (stain !== undefined && edition !== 'base') {
    throw new Error(`${where} (${id}): only a card of the base edition can have a coffee stain`);
  }
  // The stain is only added when there is one, so a card without it has no
  // `stain` key at all, the same as in the JSON.
  const card: CardData = { id, type, cost, art, edition };
  if (stain !== undefined) {
    card.stain = stain;
  }
  return card;
}

function isCardId(value: unknown): value is CardId {
  return typeof value === 'string' && Object.hasOwn(es.cards, value);
}

// `includes` on a list of fixed strings only accepts those strings, so the
// list is widened to plain strings to ask about any value.
function isSpriteId(value: unknown): value is SpriteId {
  return typeof value === 'string' && (SPRITE_IDS as readonly string[]).includes(value);
}

function isCardType(value: unknown): value is CardType {
  return typeof value === 'string' && (CARD_TYPES as readonly string[]).includes(value);
}

function isCardEdition(value: unknown): value is CardEdition {
  return typeof value === 'string' && (CARD_EDITIONS as readonly string[]).includes(value);
}

function isCardStain(value: unknown): value is CardStain {
  return typeof value === 'string' && (CARD_STAINS as readonly string[]).includes(value);
}
