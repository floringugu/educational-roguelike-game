// The fixed palette of Empollatro: "Pergamino y tinta", 20 colors chosen by
// the owner (FR-VIS-004). All the art and all the colors of the interface use
// only these colors.
//
// The names describe the color, not its use, so a color can change role
// without being renamed. Roles ("background", "text"...) are in `colorRoles`.
export const PALETTE = {
  ink: '#1a1410',
  bark: '#2e231b',
  umber: '#4a3a2c',
  leather: '#6f5a44',
  tan: '#9c8266',
  sand: '#cdb896',
  parchment: '#ece0c6',
  paper: '#faf4e2',
  night: '#22263f',
  indigo: '#3b4577',
  periwinkle: '#5d6bb0',
  lavender: '#98a6e0',
  wine: '#5c1f2a',
  crimson: '#9a3340',
  vermilion: '#d4584f',
  amber: '#e8933e',
  gold: '#f2c94c',
  forest: '#2f5a3a',
  leaf: '#5a9a5a',
  lime: '#a4d17a',
} as const;

export type PaletteColorName = keyof typeof PALETTE;

// The role each color plays in the interface. src/styles/tokens.css repeats
// these values as CSS variables (CSS cannot import TypeScript); a test checks
// that both stay equal.
export const colorRoles = {
  background: 'ink',
  surface: 'bark',
  text: 'paper',
  textMuted: 'sand',
  accent: 'gold',
  // Cards (FR-VIS-002): a page of a notebook. Paper with ink text, ruled
  // lines, a leather frame with a hard shadow, and a dark window behind the
  // art, since the sprites have light details. The cost is circled in red
  // pen.
  card: 'paper',
  cardText: 'ink',
  cardRule: 'lavender',
  cardFrame: 'leather',
  cardShadow: 'ink',
  cardArt: 'bark',
  cardPhotoEdge: 'sand',
  cardCost: 'crimson',
  // The color of each card type: its name, label, numbers and margin line,
  // and a lighter one for the tape that holds the art.
  cardAttack: 'crimson',
  cardAttackLight: 'vermilion',
  cardDefense: 'indigo',
  cardDefenseLight: 'periwinkle',
  cardSkill: 'forest',
  cardSkillLight: 'leaf',
  // The editions of a card. Foil is a diploma: crumpled parchment with a
  // gold seal that shines. Holo is a certificate: crumpled paper with a thin
  // tan edge, like the diploma, and the brown seal of the university, with a mortarboard on
  // it, crossed by holographic stripes. The seal is not blue, the color
  // of defense, since a certificate can be of any type. The crumpled sheets are textures
  // (src/assets/textures/): their inside uses `card`, `cardDiploma` and
  // `cardCrease` (the shaded side of the creases), their edge
  // `cardSheetEdge`, and their shadow
  // `cardShadow`. No text reaches the edge.
  cardDiploma: 'parchment',
  cardCrease: 'sand',
  cardSheetEdge: 'tan',
  cardSealEdge: 'umber',
  foilSeal: 'gold',
  foilSealRing: 'amber',
  foilShine: 'paper',
  holoSeal: 'umber',
  holoSealRing: 'leather',
  holoEmblem: 'paper',
  holoBand1: 'lavender',
  holoBand2: 'lime',
  holoBand3: 'gold',
  holoBand4: 'vermilion',
  // The coffee stains of a card (textures too): dried coffee, darker at its
  // edge.
  cardCoffee: 'sand',
  cardCoffeeEdge: 'tan',
  // The combat screen of the prototype (ticket 06). The health bars: an
  // empty track, the health that is left and, behind it, a trail that
  // follows a moment later and shows how much was lost.
  healthTrack: 'bark',
  healthTrail: 'sand',
  enemyHealth: 'vermilion',
  playerHealth: 'leaf',
  // The tags that show what a played card did: damage, healing and block.
  // The block tag has the color of defense.
  damageTag: 'crimson',
  healTag: 'forest',
  blockTag: 'indigo',
  // The question sheet: a page of an exam, with ruled lines, a margin line in
  // the color of the type of the card and the marks of the teacher in red
  // pen. Its options are on parchment, and after answering, the right one
  // turns green and a wrong one red. Like the card, it can be crumpled or
  // stained with coffee, with the same textures.
  exam: 'paper',
  examText: 'ink',
  examRule: 'lavender',
  examMark: 'crimson',
  examOption: 'parchment',
  examOptionEdge: 'leather',
  answerCorrect: 'lime',
  answerWrong: 'crimson',
} as const satisfies Record<string, PaletteColorName>;

export type ColorRole = keyof typeof colorRoles;

// Every pair of text color and background color that the interface uses.
// A test checks that each pair has a contrast of at least 4.5:1 (NFR-ACS-001),
// and another one reads the CSS and fails if it uses a pair missing here.
// Add the new pair here when a component puts text on another background.
export const textOnBackgroundPairs: ReadonlyArray<{ text: ColorRole; background: ColorRole }> = [
  { text: 'text', background: 'background' },
  { text: 'text', background: 'surface' },
  { text: 'textMuted', background: 'background' },
  { text: 'textMuted', background: 'surface' },
  { text: 'accent', background: 'background' },
  { text: 'accent', background: 'surface' },
  // Buttons filled with the accent color, such as "Volver" in Credits.
  { text: 'background', background: 'accent' },
  // The face of a card: its text, its cost and the texts in the color of
  // its type.
  { text: 'cardText', background: 'card' },
  { text: 'cardCost', background: 'card' },
  { text: 'cardAttack', background: 'card' },
  { text: 'cardDefense', background: 'card' },
  { text: 'cardSkill', background: 'card' },
  // The ruled lines of a card run under its ink text.
  { text: 'cardText', background: 'cardRule' },
  // The ink text on the crumpled sheets of the editions and on the coffee
  // stains. The texts in the color of the type keep their patch of paper.
  { text: 'cardText', background: 'cardDiploma' },
  { text: 'cardText', background: 'cardCrease' },
  { text: 'cardText', background: 'cardCoffee' },
  { text: 'cardText', background: 'cardCoffeeEdge' },
  // The combat screen: the tags of the effects, the numbers of the health
  // bars over their track, and the question sheet.
  { text: 'text', background: 'damageTag' },
  { text: 'text', background: 'healTag' },
  { text: 'text', background: 'blockTag' },
  { text: 'text', background: 'healthTrack' },
  { text: 'examText', background: 'exam' },
  // The name of the card being played, at the top of the sheet, in the
  // color of its type.
  { text: 'cardAttack', background: 'exam' },
  { text: 'cardDefense', background: 'exam' },
  { text: 'cardSkill', background: 'exam' },
  { text: 'examText', background: 'examRule' },
  // The question sheet of a crumpled card, or of a stained one.
  { text: 'examText', background: 'cardDiploma' },
  { text: 'examText', background: 'cardCrease' },
  { text: 'examText', background: 'cardCoffee' },
  { text: 'examText', background: 'cardCoffeeEdge' },
  { text: 'examMark', background: 'exam' },
  { text: 'examText', background: 'examOption' },
  { text: 'examText', background: 'answerCorrect' },
  { text: 'text', background: 'answerWrong' },
  // The window behind the art of a card holds no text, but the test that
  // reads the CSS cannot know it: it counts any text color that is set
  // without a background as able to end up on it.
  { text: 'text', background: 'cardArt' },
  { text: 'textMuted', background: 'cardArt' },
  { text: 'accent', background: 'cardArt' },
];
