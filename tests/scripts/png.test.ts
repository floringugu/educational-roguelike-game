import { crc32, deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { decodePng, encodePng, pixelAt } from '../../scripts/png.ts';

// Builds a PNG chunk by hand: length, type, data and checksum.
function chunk(type: string, data: Buffer): Buffer {
  const typeAndData = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, checksum]);
}

// A 2x1 RGB file (color type 2) whose tRNS chunk marks pure green as
// transparent. The left pixel is green and the right one red.
function rgbPngWithTransparentGreen(): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(2, 0); // width
  header.writeUInt32BE(1, 4); // height
  header.writeUInt8(8, 8); // bits per channel
  header.writeUInt8(2, 9); // RGB
  const transparentColor = Buffer.from([0, 0, 0, 255, 0, 0]); // red 0, green 255, blue 0
  // Filter byte 0, then green and red.
  const row = Buffer.from([0, 0, 255, 0, 255, 0, 0]);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('tRNS', transparentColor),
    chunk('IDAT', deflateSync(row)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

describe('png', () => {
  it('reads back the pixels it writes', () => {
    const pixels = new Uint8Array([10, 20, 30, 255, 40, 50, 60, 0]);
    const image = decodePng(encodePng({ width: 2, height: 1, pixels }));

    expect(image.width).toBe(2);
    expect(image.height).toBe(1);
    expect([...image.pixels]).toEqual([...pixels]);
  });

  it('makes transparent the color that the tRNS chunk marks in an RGB file', () => {
    const image = decodePng(rgbPngWithTransparentGreen());

    expect(pixelAt(image, 0, 0).alpha).toBe(0);
    expect(pixelAt(image, 1, 0)).toEqual({ red: 255, green: 0, blue: 0, alpha: 255 });
  });
});
