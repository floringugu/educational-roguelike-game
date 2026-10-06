import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MINIMUM_TEXT_CONTRAST, contrastRatio } from '../../src/theme/contrast.ts';
import { PALETTE, colorRoles, textOnBackgroundPairs, type ColorRole } from '../../src/theme/palette.ts';

const sourceDirectory = fileURLToPath(new URL('../../src/', import.meta.url));
const paletteHexColors = Object.values(PALETTE);

// Reads the file as text. The path is relative to src/.
function readSource(path: string): string {
  return readFileSync(join(sourceDirectory, path), 'utf8');
}

// Every file in src/ with one of the given extensions, as a full path.
function sourceFiles(extensions: RegExp): string[] {
  return readdirSync(sourceDirectory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && extensions.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
}

// A CSS rule: its selector and its declarations ('color: var(--color-text)').
type CssRule = { selector: string; declarations: { property: string; value: string }[] };

// Splits a CSS file into its rules. It is a simple reader, enough for the
// plain CSS of this project: no nesting, and no "{", "}" or ";" inside values.
function readCssRules(css: string): CssRule[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] ?? '').trim(),
    declarations: (match[2] ?? '')
      .split(';')
      .map((declaration) => declaration.split(':'))
      .filter((parts) => parts.length >= 2)
      .map(([property = '', ...value]) => ({ property: property.trim(), value: value.join(':').trim() })),
  }));
}

// Properties that paint a color.
const colorProperty =
  /^(?:color|background(?:-color|-image)?|border(?:-[a-z]+)*|outline(?:-color)?|fill|stroke|(?:box|text)-shadow|caret-color|accent-color|text-decoration(?:-color)?)$/;
// Words that may appear in those properties without being a color.
const wordsThatAreNotColors = new Set([
  'none', 'inherit', 'initial', 'unset', 'currentcolor', 'transparent',
  'solid', 'dashed', 'dotted', 'double', 'inset', 'thin', 'medium', 'thick', 'underline',
  // Gradients, such as the editions of the cards.
  'linear', 'repeating', 'gradient', 'calc',
]);

// Returns the words used as colors in a CSS file without going through a
// variable, such as `white` in `color: white`.
function findColorWords(css: string): string[] {
  const found: string[] = [];
  for (const rule of readCssRules(css)) {
    for (const { property, value } of rule.declarations) {
      if (!colorProperty.test(property)) {
        continue;
      }
      // Remove the variables, the images ('url(../paper.png)') and the
      // numbers ('2px', '0', '50%'): the words that are left must be
      // keywords, not colors.
      const withoutVariablesOrNumbers = value
        .replace(/(?:var|url)\([^)]*\)/g, '')
        .replace(/-?[\d.]+[a-z%]*/g, '');
      const words = withoutVariablesOrNumbers.match(/[a-zA-Z]+/g) ?? [];
      found.push(...words.filter((word) => !wordsThatAreNotColors.has(word.toLowerCase())));
    }
  }
  return found;
}

// The color role behind a variable: 'var(--color-text-muted)' is 'textMuted'.
function roleOfValue(value: string): ColorRole | undefined {
  const match = /^var\(--color-([a-z-]+)\)$/.exec(value);
  if (match === null) {
    return undefined;
  }
  const role = (match[1] ?? '').replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  if (!(role in colorRoles)) {
    throw new Error(`Unknown color variable ${value}`);
  }
  return role as ColorRole;
}

describe('FR-VIS-004: the palette', () => {
  it('has between 16 and 24 different colors', () => {
    expect(paletteHexColors.length).toBeGreaterThanOrEqual(16);
    expect(paletteHexColors.length).toBeLessThanOrEqual(24);
    expect(new Set(paletteHexColors).size).toBe(paletteHexColors.length);
  });

  it('has the colors written as lowercase #rrggbb', () => {
    for (const hex of paletteHexColors) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('FR-VIS-004: the colors of the interface come from the palette', () => {
  const tokens = readSource('styles/tokens.css');

  it('repeats in tokens.css the color of every role', () => {
    const toCssName = (role: string) => role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    for (const [role, colorName] of Object.entries(colorRoles)) {
      const expected = `--color-${toCssName(role)}: ${PALETTE[colorName]};`;
      expect(tokens, `the token for "${role}"`).toContain(expected);
    }
  });

  it('has no color in tokens.css that is not in the palette', () => {
    const colors = tokens.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    expect(colors.length).toBeGreaterThan(0);
    for (const color of colors) {
      expect(paletteHexColors, `the color ${color}`).toContain(color.toLowerCase());
    }
  });

  it('writes no color outside tokens.css: the rest of the code uses its variables', () => {
    // Look at every CSS, TS and TSX file in src/, except the palette itself
    // and the tokens.
    const files = sourceFiles(/\.(css|ts|tsx)$/).filter(
      (path) => !path.endsWith('theme/palette.ts') && !path.endsWith('styles/tokens.css'),
    );

    // A color written as hexadecimal, or as rgb(), hsl(), oklch()...
    const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/;
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(colorLiteral);
    }
  });

  it('writes no color by its name in the CSS: the colors are variables', () => {
    for (const file of sourceFiles(/\.css$/)) {
      expect(findColorWords(readFileSync(file, 'utf8')), file).toEqual([]);
    }
  });

  it('finds the colors written by their name', () => {
    const css = 'a { color: white; border: 1px solid black; background: var(--color-surface); }';
    expect(findColorWords(css)).toEqual(['white', 'black']);
  });

  it('does not take the name of an image for a color', () => {
    const css = "a { background-image: url('../assets/textures/crumpled-paper.png'); }";
    expect(findColorWords(css)).toEqual([]);
  });
});

describe('NFR-ACS-001: contrast of text and background', () => {
  it('lists at least one pair', () => {
    expect(textOnBackgroundPairs.length).toBeGreaterThan(0);
  });

  it.each(textOnBackgroundPairs)(
    'has a contrast of at least 4.5:1 for $text on $background',
    ({ text, background }) => {
      const ratio = contrastRatio(PALETTE[colorRoles[text]], PALETTE[colorRoles[background]]);
      expect(ratio).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST);
    },
  );

  it('computes the ratio like WCAG: 21:1 for black on white and 1:1 for equal colors', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('rejects a pair that is too weak', () => {
    // Gold on parchment looks readable at first sight but it is not.
    expect(contrastRatio(PALETTE.gold, PALETTE.parchment)).toBeLessThan(MINIMUM_TEXT_CONTRAST);
  });

  // Reads which text colors the CSS puts on which backgrounds, and checks
  // that every one of those pairs is in textOnBackgroundPairs (so the test
  // above checks its contrast).
  //   - A rule that sets both a text color and a background (a button) adds
  //     exactly that pair.
  //   - A rule that only sets a background (a card) holds text of other
  //     rules, and so does the page (body). Every text color that is set
  //     without a background can end up on any of them, so every such
  //     combination is a pair.
  //   - A ::before or ::after with empty content is only a drawing (the
  //     mortarboard of a seal): it holds no text, so its background is not
  //     one of those.
  it('lists every pair of text and background that the CSS uses', () => {
    const usedPairs = new Set<string>();
    const textColorsWithoutBackground = new Set<ColorRole>();
    const containerBackgrounds = new Set<ColorRole>();

    for (const file of sourceFiles(/\.css$/)) {
      for (const rule of readCssRules(readFileSync(file, 'utf8'))) {
        const valueOf = (pattern: RegExp) =>
          rule.declarations.find((declaration) => pattern.test(declaration.property))?.value;
        const textValue = valueOf(/^color$/);
        const backgroundValue = valueOf(/^background(?:-color)?$/);
        const text = textValue === undefined ? undefined : roleOfValue(textValue);
        const background = backgroundValue === undefined ? undefined : roleOfValue(backgroundValue);

        if (text !== undefined && background !== undefined) {
          usedPairs.add(`${text} on ${background}`);
        }
        if (text !== undefined && (background === undefined || rule.selector === 'body')) {
          textColorsWithoutBackground.add(text);
        }
        const isEmptyPseudoElement =
          /::(?:before|after)$/.test(rule.selector) && valueOf(/^content$/) === "''";
        if (
          background !== undefined &&
          !isEmptyPseudoElement &&
          (text === undefined || rule.selector === 'body')
        ) {
          containerBackgrounds.add(background);
        }
      }
    }
    for (const text of textColorsWithoutBackground) {
      for (const background of containerBackgrounds) {
        usedPairs.add(`${text} on ${background}`);
      }
    }

    const listedPairs = textOnBackgroundPairs.map(({ text, background }) => `${text} on ${background}`);
    expect(usedPairs.size).toBeGreaterThan(0);
    for (const pair of usedPairs) {
      expect(listedPairs, `the CSS puts ${pair}`).toContain(pair);
    }
  });
});
