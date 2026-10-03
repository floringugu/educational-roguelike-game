// Reads which characters a font file can draw, by parsing its "cmap" table.
// FR-VIS-005 says m6x11 is only used for titles and numbers if it has all the
// Spanish characters; this is the check for that.
//
// It reads TrueType (.ttf) files and WOFF2 (.woff2) files, the compressed
// format that the app serves. Only the two cmap formats that real fonts use
// for text are supported: format 4 (characters up to U+FFFF) and format 12
// (all characters).

import { brotliDecompressSync } from 'node:zlib';

// Characters that the interface needs (FR-VIS-005).
export const SPANISH_CHARACTERS = 'áéíóúüñÁÉÍÓÚÜÑ¿¡';

// Returns the code points (numbers that identify characters) that the font
// has a glyph for.
export function readCodePoints(font: Uint8Array): Set<number> {
  const signature = String.fromCharCode(...font.subarray(0, 4));
  const cmap = signature === 'wOF2' ? findWoff2Cmap(font) : findTrueTypeCmap(font);
  return readCmap(new DataView(cmap.buffer, cmap.byteOffset, cmap.byteLength));
}

// Returns the bytes of the cmap table of a TrueType file.
function findTrueTypeCmap(font: Uint8Array): Uint8Array {
  const view = new DataView(font.buffer, font.byteOffset, font.byteLength);
  const tableCount = view.getUint16(4);

  // The table directory starts at byte 12; each entry takes 16 bytes.
  for (let i = 0; i < tableCount; i += 1) {
    const entry = 12 + i * 16;
    const tag = String.fromCharCode(...font.subarray(entry, entry + 4));
    if (tag === 'cmap') {
      const offset = view.getUint32(entry + 8);
      const length = view.getUint32(entry + 12);
      return font.subarray(offset, offset + length);
    }
  }
  throw new Error('The font has no cmap table');
}

// Returns the bytes of the cmap table of a WOFF2 file. A WOFF2 file is a
// header, a list of tables, and then all the tables one after the other,
// compressed together with Brotli. The cmap table is always stored as it is,
// so after decompressing it can be read like in a TrueType file.
// Format: https://www.w3.org/TR/WOFF2/
function findWoff2Cmap(font: Uint8Array): Uint8Array {
  const view = new DataView(font.buffer, font.byteOffset, font.byteLength);
  const tableCount = view.getUint16(12);
  const compressedLength = view.getUint32(20);

  // The list of tables starts after the 48-byte header. Its entries have
  // different lengths, so they are read one by one.
  let position = 48;
  // Where each table starts once the data is decompressed.
  let tableStart = 0;
  let cmap: { start: number; length: number } | undefined;

  for (let i = 0; i < tableCount; i += 1) {
    const flags = view.getUint8(position);
    position += 1;
    // The low 6 bits say which table it is: 0 is cmap, 10 glyf, 11 loca. The
    // value 63 means that the 4-letter name of the table follows.
    const knownTag = flags & 0x3f;
    if (knownTag === 63) {
      position += 4;
    }
    const originalLength = readUIntBase128(view, position);
    position = originalLength.next;

    // The high 2 bits say whether the table was transformed to compress
    // better. If it was, its stored length follows. For glyf and loca, 0
    // means transformed and 3 means stored as is; for the rest, the opposite.
    const transformVersion = flags >> 6;
    const isGlyfOrLoca = knownTag === 10 || knownTag === 11;
    const isTransformed = isGlyfOrLoca ? transformVersion !== 3 : transformVersion !== 0;
    let storedLength = originalLength.value;
    if (isTransformed) {
      const transformLength = readUIntBase128(view, position);
      position = transformLength.next;
      storedLength = transformLength.value;
    }

    if (knownTag === 0) {
      cmap = { start: tableStart, length: storedLength };
    }
    tableStart += storedLength;
  }

  if (cmap === undefined) {
    throw new Error('The font has no cmap table');
  }
  const tables = brotliDecompressSync(font.subarray(position, position + compressedLength));
  return tables.subarray(cmap.start, cmap.start + cmap.length);
}

// WOFF2 writes some numbers with a variable number of bytes: 7 bits per byte,
// and the top bit says whether another byte follows.
function readUIntBase128(view: DataView, start: number): { value: number; next: number } {
  let value = 0;
  for (let i = 0; i < 5; i += 1) {
    const byte = view.getUint8(start + i);
    value = value * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) {
      return { value, next: start + i + 1 };
    }
  }
  throw new Error('Invalid WOFF2 number');
}

// Reads the characters listed in a cmap table. `view` covers just the table.
function readCmap(view: DataView): Set<number> {
  const cmapOffset = 0;
  const codePoints = new Set<number>();
  const subtableCount = view.getUint16(cmapOffset + 2);
  for (let i = 0; i < subtableCount; i += 1) {
    const subtableOffset = cmapOffset + view.getUint32(cmapOffset + 4 + i * 8 + 4);
    const format = view.getUint16(subtableOffset);
    if (format === 4) {
      readFormat4(view, subtableOffset, codePoints);
    } else if (format === 12) {
      readFormat12(view, subtableOffset, codePoints);
    }
  }
  return codePoints;
}

// Format 4: the characters come in ranges (segments). A range has its first
// and last character; the font may map them to glyph 0, which means "no
// glyph", so every character is checked against its glyph index.
function readFormat4(view: DataView, offset: number, codePoints: Set<number>): void {
  const segmentCount = view.getUint16(offset + 6) / 2;
  const endCodes = offset + 14;
  const startCodes = endCodes + segmentCount * 2 + 2;
  const idDeltas = startCodes + segmentCount * 2;
  const idRangeOffsets = idDeltas + segmentCount * 2;

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const end = view.getUint16(endCodes + segment * 2);
    const start = view.getUint16(startCodes + segment * 2);
    const delta = view.getUint16(idDeltas + segment * 2);
    const rangeOffsetPosition = idRangeOffsets + segment * 2;
    const rangeOffset = view.getUint16(rangeOffsetPosition);

    for (let code = start; code <= end && code !== 0xffff; code += 1) {
      let glyph: number;
      if (rangeOffset === 0) {
        glyph = (code + delta) & 0xffff;
      } else {
        const glyphPosition = rangeOffsetPosition + rangeOffset + (code - start) * 2;
        const rawGlyph = view.getUint16(glyphPosition);
        glyph = rawGlyph === 0 ? 0 : (rawGlyph + delta) & 0xffff;
      }
      if (glyph !== 0) {
        codePoints.add(code);
      }
    }
  }
}

// Format 12: groups of consecutive characters with consecutive glyphs.
function readFormat12(view: DataView, offset: number, codePoints: Set<number>): void {
  const groupCount = view.getUint32(offset + 12);
  for (let group = 0; group < groupCount; group += 1) {
    const position = offset + 16 + group * 12;
    const start = view.getUint32(position);
    const end = view.getUint32(position + 4);
    const firstGlyph = view.getUint32(position + 8);
    for (let code = start; code <= end; code += 1) {
      if (firstGlyph + (code - start) !== 0) {
        codePoints.add(code);
      }
    }
  }
}

// Returns the characters of `text` that the font cannot draw.
export function findMissingCharacters(font: Uint8Array, text: string): string[] {
  const available = readCodePoints(font);
  return [...text].filter((character) => !available.has(character.codePointAt(0) ?? 0));
}
