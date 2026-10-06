import { parseCards } from '../cards/cardData';
import cardsJson from './cards.json';

// The hand of 5 test cards shown on screen while there is no game engine
// (H1). The cards are data, not components, so adding or changing one only
// means editing cards.json and its texts in src/i18n/es.ts.
export const TEST_HAND = parseCards(cardsJson);
