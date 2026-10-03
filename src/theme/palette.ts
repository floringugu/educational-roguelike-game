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
];
