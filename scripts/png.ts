// A small PNG reader and writer, enough for pixel art sprites: 8 bits per
// channel (or an 8-bit color table), no interlacing. It exists so the sprite
// tools need no dependency.

import { crc32, deflateSync, inflateSync } from 'node:zlib';

export type Rgba = { red: number; green: number; blue: number; alpha: number };

export type Image = {
  width: number;
  height: number;
  // 4 bytes (red, green, blue, alpha) per pixel, row after row.
  pixels: Uint8Array;
};

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Reads the pixels of a PNG file. Throws if the file uses a feature that is
// not supported, instead of returning a wrong image.
export function decodePng(file: Uint8Array): Image {
  const buffer = Buffer.from(file);
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error('Not a PNG file');
  }

  let width = 0;
  let height = 0;
  let colorType = 0;
  // For PNG files with a color table (color type 3): the colors, and the
  // transparency of each one.
  let colorTable = Buffer.alloc(0);
  let tableAlpha = Buffer.alloc(0);
  // For RGB files (color type 2): the one color that means "transparent", if
  // the file has one.
  let transparentColor: [number, number, number] | undefined;
  const dataChunks: Buffer[] = [];

  // A PNG is a list of chunks: 4 bytes of length, 4 of type, the data and a
  // 4-byte checksum.
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
      const interlace = data.readUInt8(12);
      if (bitDepth !== 8 || interlace !== 0 || (colorType !== 6 && colorType !== 2 && colorType !== 3)) {
        throw new Error('Only 8-bit RGB, RGBA or indexed PNG files without interlacing are supported');
      }
    } else if (type === 'PLTE') {
      colorTable = data;
    } else if (type === 'tRNS') {
      // The tRNS chunk means something different for each color type.
      if (colorType === 3) {
        tableAlpha = data;
      } else if (colorType === 2) {
        // Three 2-byte numbers: red, green and blue. With 8 bits per channel
        // only the low byte is used.
        transparentColor = [data.readUInt16BE(0), data.readUInt16BE(2), data.readUInt16BE(4)];
      }
    } else if (type === 'IDAT') {
      dataChunks.push(data);
    }
    offset += 12 + length;
  }

  // Bytes per pixel in the file: 1 index, 3 for RGB or 4 for RGBA.
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const rowBytes = width * channels;
  const raw = inflateSync(Buffer.concat(dataChunks));
  const pixels = new Uint8Array(width * height * 4);

  // Every row starts with a filter byte. The filters store each byte as the
  // difference with its neighbors, so they are undone while reading.
  const previousRow = new Uint8Array(rowBytes);
  const currentRow = new Uint8Array(rowBytes);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (rowBytes + 1);
    const filter = raw.readUInt8(rowStart);
    for (let i = 0; i < rowBytes; i += 1) {
      const value = raw.readUInt8(rowStart + 1 + i);
      const left = i >= channels ? (currentRow[i - channels] ?? 0) : 0;
      const up = previousRow[i] ?? 0;
      const upLeft = i >= channels ? (previousRow[i - channels] ?? 0) : 0;
      currentRow[i] = (value + predictor(filter, left, up, upLeft)) & 0xff;
    }
    for (let x = 0; x < width; x += 1) {
      const target = (y * width + x) * 4;
      if (colorType === 3) {
        const index = currentRow[x] ?? 0;
        pixels[target] = colorTable[index * 3] ?? 0;
        pixels[target + 1] = colorTable[index * 3 + 1] ?? 0;
        pixels[target + 2] = colorTable[index * 3 + 2] ?? 0;
        pixels[target + 3] = tableAlpha[index] ?? 255;
        continue;
      }
      const red = currentRow[x * channels] ?? 0;
      const green = currentRow[x * channels + 1] ?? 0;
      const blue = currentRow[x * channels + 2] ?? 0;
      pixels[target] = red;
      pixels[target + 1] = green;
      pixels[target + 2] = blue;
      if (channels === 4) {
        pixels[target + 3] = currentRow[x * channels + 3] ?? 0;
      } else {
        const isTransparent =
          transparentColor !== undefined &&
          red === transparentColor[0] &&
          green === transparentColor[1] &&
          blue === transparentColor[2];
        pixels[target + 3] = isTransparent ? 0 : 255;
      }
    }
    previousRow.set(currentRow);
  }
  return { width, height, pixels };
}

function predictor(filter: number, left: number, up: number, upLeft: number): number {
  switch (filter) {
    case 0:
      return 0;
    case 1:
      return left;
    case 2:
      return up;
    case 3:
      return (left + up) >> 1;
    case 4: {
      // Paeth: use whichever of the three neighbors is closest to left + up - upLeft.
      const estimate = left + up - upLeft;
      const distanceLeft = Math.abs(estimate - left);
      const distanceUp = Math.abs(estimate - up);
      const distanceUpLeft = Math.abs(estimate - upLeft);
      if (distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft) {
        return left;
      }
      return distanceUp <= distanceUpLeft ? up : upLeft;
    }
    default:
      throw new Error(`Unknown PNG filter ${filter}`);
  }
}

function chunk(type: string, data: Buffer): Buffer {
  const typeAndData = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, checksum]);
}

// Writes an RGBA image as a PNG file.
export function encodePng(image: Image): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(image.width, 0);
  header.writeUInt32BE(image.height, 4);
  header.writeUInt8(8, 8); // bits per channel
  header.writeUInt8(6, 9); // RGBA

  // Filter 0 ("none") in front of every row.
  const rowBytes = image.width * 4;
  const raw = Buffer.alloc(image.height * (rowBytes + 1));
  for (let y = 0; y < image.height; y += 1) {
    const rowStart = y * (rowBytes + 1);
    raw.writeUInt8(0, rowStart);
    Buffer.from(image.pixels.subarray(y * rowBytes, (y + 1) * rowBytes)).copy(raw, rowStart + 1);
  }

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function pixelAt(image: Image, x: number, y: number): Rgba {
  const start = (y * image.width + x) * 4;
  return {
    red: image.pixels[start] ?? 0,
    green: image.pixels[start + 1] ?? 0,
    blue: image.pixels[start + 2] ?? 0,
    alpha: image.pixels[start + 3] ?? 0,
  };
}
