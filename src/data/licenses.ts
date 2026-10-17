// License register (R-4): every asset and every font of the project, with its
// author, its license and the attribution that the license asks for. The
// Credits screen is generated from this list (FR-VIS-006), so adding an entry
// here is all it takes to credit a new asset.
//
// A test checks that every file in src/assets is listed here.
//
// The texts of the register are shown as they are, in English, the language
// of the licenses, and do not go through the text catalog: names of
// licenses and attributions are quoted, not translated. Only the labels of
// the Credits screen ("Autor", "Licencia"...) come from src/i18n/es.ts.

export type LicenseEntry = {
  // Name of the work.
  name: string;
  author: string;
  // Name of the license, as its author calls it.
  license: string;
  // Link to the license text, or to the page where the author states it.
  licenseUrl: string;
  // The license text, when it is a file that must travel with the work (the
  // OFL asks for it). It is one of `files`. The Credits screen links to this
  // copy, which also works without a connection.
  licenseFile?: string;
  // Link to the page where the work was obtained.
  sourceUrl: string;
  // The attribution that the license asks for, ready to show as it is. It is
  // empty only when the license asks for none; we credit the author anyway.
  attribution: string;
  // What the project changed, if anything.
  modification?: string;
  // The files of the work, relative to src/assets/.
  files: string[];
};

export const LICENSES: LicenseEntry[] = [
  {
    name: 'm6x11plus',
    author: 'Daniel Linssen',
    license: 'Free to use with attribution',
    licenseUrl: 'https://managore.itch.io/m6x11',
    sourceUrl: 'https://managore.itch.io/m6x11',
    attribution: 'm6x11plus, a font by Daniel Linssen (managore.itch.io/m6x11)',
    modification: 'Converted from TTF to WOFF2.',
    files: ['fonts/m6x11plus.woff2'],
  },
  {
    name: 'Pixelify Sans',
    author: 'The Pixelify Sans Project Authors',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://scripts.sil.org/OFL',
    licenseFile: 'fonts/PixelifySans-OFL.txt',
    sourceUrl: 'https://github.com/eifetx/Pixelify-Sans',
    attribution: 'Copyright 2021 The Pixelify Sans Project Authors (github.com/eifetx/Pixelify-Sans)',
    files: ['fonts/PixelifySans.woff2', 'fonts/PixelifySans-OFL.txt'],
  },
  {
    // The project's own pixel art (ADR-0011): drawn for Empollatro, with
    // palette colors only. The PNG files are the source, except for the
    // classroom, which is drawn in art/classroom.aseprite and exported to the
    // PNG files of backgrounds/ and of the sprites classroom-*: each plane
    // (ADR-0017) is a merge of its layers, with its edge repeated 12 pixels
    // all around, and each strip of frames starts with the drawn frame.
    name: 'Empollatro sprites',
    author: 'Florin Gugu',
    license: 'Creative Commons Zero (CC0 1.0)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://github.com/floringugu/educational-roguelike-game',
    attribution: 'Empollatro sprites by Florin Gugu',
    files: [
      'backgrounds/classroom-back-desks.png',
      'backgrounds/classroom-desk.png',
      'backgrounds/classroom-light.png',
      'backgrounds/classroom-room.png',
      'sprites/block-scrap.png',
      'sprites/block-shield-empty.png',
      'sprites/block-shield-full.png',
      'sprites/card-art-books.png',
      'sprites/card-art-chalk.png',
      'sprites/card-art-cheat-sheet.png',
      'sprites/card-art-coffee.png',
      'sprites/card-art-empty-desk.png',
      'sprites/classroom-blind-slat.png',
      'sprites/classroom-clock-hour-hand.png',
      'sprites/classroom-clock-minute-hand.png',
      'sprites/classroom-clock-second-hand.png',
      'sprites/classroom-cloud.png',
      'sprites/classroom-notebook.png',
      'sprites/classroom-notebook-shadow.png',
      'sprites/classroom-pen.png',
      'sprites/classroom-pen-shadow.png',
      'sprites/classroom-pen-shadow-paper.png',
      'sprites/classroom-pencil-case.png',
      'sprites/classroom-pencil-case-shadow.png',
      'sprites/classroom-phone-box.png',
      'sprites/classroom-radiator.png',
      'sprites/classroom-speaker-left.png',
      'sprites/classroom-speaker-right.png',
      'sprites/classroom-tree.png',
      'sprites/classroom-water-bottle.png',
      'sprites/classroom-water-bottle-shadow.png',
      'sprites/discard-scrap.png',
      'sprites/discard-shredder.png',
      'sprites/discard-shredder-strips.png',
      'sprites/draw-pile-scrap.png',
      'sprites/draw-pile-sheets.png',
      'sprites/end-turn-post-it.png',
      'sprites/enemy-annoyance-mark.png',
      'sprites/enemy-midterm.png',
      'sprites/enemy-midterm-portrait.png',
      'sprites/enemy-midterm-shadow.png',
      'sprites/enemy-panel-scrap.png',
      'sprites/energy-can.png',
      'sprites/energy-scrap.png',
      'sprites/health-neuron-empty.png',
      'sprites/health-neuron-full.png',
      'sprites/health-scrap.png',
      'sprites/intent-attack.png',
      'sprites/intent-bubble.png',
      'sprites/menu-post-it.png',
      'textures/coffee-corner.png',
      'textures/coffee-ring-splash.png',
      'textures/coffee-ring.png',
      'textures/crumpled-paper-tile.png',
      'textures/crumpled-paper.png',
      'textures/crumpled-parchment-tile.png',
      'textures/crumpled-parchment.png',
      'textures/crumpled-sheet-left-cut.png',
      'textures/crumpled-sheet-left.png',
      'textures/crumpled-sheet-right-cut.png',
      'textures/crumpled-sheet-right.png',
      'textures/crumpled-sheet-top-cut.png',
      'textures/crumpled-sheet-top.png',
    ],
  },
  {
    // The city seen through the window of the classroom (ADR-0004: a CC0
    // pack, recolored to the palette). It is the farthest plane of the
    // classroom (ADR-0017), so that this entry covers exactly the third-party
    // pixels.
    name: 'City Mega Pack',
    author: 'GrafxKid',
    license: 'Creative Commons Zero (CC0 1.0)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://opengameart.org/content/city-mega-pack',
    attribution: 'City Mega Pack by GrafxKid (opengameart.org/content/city-mega-pack)',
    modification:
      'A slice of the city skyline of the pack, cropped, mapped to the palette of the game and with its towers recolored. Grown 3 pixels by repeating its edge, so it still fills the window when the camera moves, and padded 12 pixels all around.',
    files: ['backgrounds/classroom-city.png'],
  },
];
