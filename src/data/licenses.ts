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
    // palette colors only. The PNG files are the source.
    name: 'Empollatro sprites',
    author: 'Florin Gugu',
    license: 'Creative Commons Zero (CC0 1.0)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://github.com/floringugu/educational-roguelike-game',
    attribution: 'Empollatro sprites by Florin Gugu',
    files: [
      'sprites/card-art-books.png',
      'sprites/card-art-chalk.png',
      'sprites/card-art-cheat-sheet.png',
      'sprites/card-art-coffee.png',
      'sprites/card-art-empty-desk.png',
      'sprites/enemy-math-teacher.png',
      'sprites/enemy-midterm.png',
      'sprites/intent-attack.png',
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
];
