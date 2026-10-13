// The fixed palette of Empollatro: "Pergamino y tinta", 32 colors chosen by
// the owner (FR-VIS-004). All the art and all the colors of the interface use
// only these colors.
//
// The names describe the color, not its use, so a color can change role
// without being renamed. Roles ("background", "text"...) are in `colorRoles`.
//
// The colors are grouped in ramps, from dark to light. The art guide
// (docs/GUIA-DE-ARTE.md, section 6) lists them, and docs/arte/paleta.png
// shows them.
export const PALETTE = {
  ink: '#1c1426',
  bark: '#30203a',
  umber: '#523046',
  leather: '#745848',
  tan: '#a38a6c',
  sand: '#cfc0a0',
  parchment: '#e8dcc0',
  paper: '#fff7de',
  night: '#21285a',
  indigo: '#384c98',
  periwinkle: '#5e86d2',
  lavender: '#a2c8f2',
  wine: '#5c1a3e',
  crimson: '#a62a48',
  vermilion: '#e2584a',
  amber: '#f2953a',
  gold: '#ffd04e',
  // The warm light that comes in through the blinds of the classroom
  // (ADR-0013): the light ramp is amber, gold and sunbeam.
  sunbeam: '#fff5b8',
  forest: '#1f4a4c',
  leaf: '#3f8a52',
  lime: '#a0d45c',
  // The faded greens of the formica of the desk in the background, from its
  // shaded side to its lit side. ADR-0013 keeps them for the classroom.
  olive: '#66704a',
  sage: '#9aa36a',
  khaki: '#cfcb95',
  // The classroom of ADR-0013, sampled from its reference images and adjusted
  // so that no two colors of the palette look alike.
  // The sage formica of the desk and the green lower half of the wall:
  // spruce in the deepest shade, celadon where the light hits.
  spruce: '#22313a',
  moss: '#485f55',
  fern: '#6c876c',
  celadon: '#a2b690',
  // The chalkboard is spruce; teal is the chalk rubbed out on it.
  teal: '#2b5459',
  // The upper half of the wall, a grey beige between umber and sand.
  taupe: '#958d80',
  // The dark panels of the combat interface, their metal edges, and the
  // metal of the classroom (the clock, the legs of the desks).
  slate: '#383a60',
  steel: '#6873a2',
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
  // The texts drawn right on the background, with no background of their
  // own: the name of the enemy and the numbers of the health in ink, and the
  // title of the combat in wine. They were made for the light desk of the old
  // background; over the classroom their contrast is not checked yet, because
  // ticket 12 moves them onto the panels of the interface.
  deskText: 'ink',
  deskTitle: 'wine',
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
  // The editions of a card. Foil is a diploma: crumpled parchment. Holo is a
  // certificate: crumpled paper with a thin tan edge, like the diploma. The
  // crumpled sheets are textures (src/assets/textures/): their inside uses
  // `card`, `cardDiploma` and `cardCrease` (the shaded side of the creases),
  // their edge `cardSheetEdge`, and their shadow `cardShadow`. No text
  // reaches the edge.
  cardDiploma: 'parchment',
  cardCrease: 'sand',
  cardSheetEdge: 'tan',
  // The coffee stains of a card (textures too): dried coffee, darker at its
  // edge.
  cardCoffee: 'sand',
  cardCoffeeEdge: 'tan',
  // The combat screen of the prototype (ticket 06).
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
  // The panels of the combat interface (ADR-0013): the enemy panel at the top
  // and the bottom bar. Dark slate with a steel edge and paper text. The
  // health bar is red on an ink track, like the one in the reference.
  panel: 'slate',
  panelEdge: 'steel',
  panelText: 'paper',
  healthBar: 'vermilion',
  healthBarTrack: 'ink',
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
  // The combat screen: the tags of the effects and the question sheet.
  { text: 'text', background: 'damageTag' },
  { text: 'text', background: 'healTag' },
  { text: 'text', background: 'blockTag' },
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
  // The texts of the panels of the combat interface: the name of the enemy,
  // the numbers of the health and the button "Terminar turno".
  { text: 'panelText', background: 'panel' },
];
