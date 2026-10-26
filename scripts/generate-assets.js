import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Minimal valid PNG generator in pure Node.js (no external deps)
function createSolidPng(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with scanlines
  const lineLength = 1 + width * 4; // 1 filter byte + RGBA pixels
  const rawData = Buffer.alloc(lineLength * height);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineLength;
    rawData[lineOffset] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = lineOffset + 1 + x * 4;
      // Draw a subtle gradient or circle border
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxR = width * 0.42;

      if (dist < maxR) {
        // Inner badge: bright indigo / purple gradient
        const t = (x + y) / (width + height);
        rawData[pixelOffset] = Math.round(99 + (139 - 99) * t);     // R (indigo-purple)
        rawData[pixelOffset + 1] = Math.round(102 + (92 - 102) * t); // G
        rawData[pixelOffset + 2] = Math.round(241 + (246 - 241) * t); // B
        rawData[pixelOffset + 3] = 255;
      } else {
        // Background: deep slate navy
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
        rawData[pixelOffset + 3] = a;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', idatData);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Table-based CRC32
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

// Generate PNG icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSolidPng(192, 192, 15, 23, 42));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSolidPng(512, 512, 15, 23, 42));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createSolidPng(512, 512, 15, 23, 42));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSolidPng(180, 180, 15, 23, 42));

// Generate icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="#0f172a" />
  <rect x="40" y="40" width="432" height="432" rx="100" fill="url(#grad)" filter="url(#shadow)" opacity="0.95" />
  <!-- Book / Language Sheet Motif -->
  <path d="M140 160h100c25 0 45 15 45 40v170c-15-12-30-18-45-18H140V160z" fill="#ffffff" fill-opacity="0.95" />
  <path d="M372 160H272c-25 0-45 15-45 40v170c15-12-30-18 45-18h100V160z" fill="#f1f5f9" fill-opacity="0.9" />
  <!-- Language Characters (Hanzi / Kana / Cyrillic / Alpha) -->
  <text x="180" y="240" font-family="sans-serif" font-weight="900" font-size="44" fill="#312e81" text-anchor="middle">文</text>
  <text x="332" y="240" font-family="sans-serif" font-weight="900" font-size="44" fill="#4338ca" text-anchor="middle">あ</text>
  <text x="180" y="320" font-family="sans-serif" font-weight="900" font-size="44" fill="#4338ca" text-anchor="middle">한</text>
  <text x="332" y="320" font-family="sans-serif" font-weight="900" font-size="44" fill="#312e81" text-anchor="middle">Я</text>
  <!-- Sparkle dots -->
  <circle cx="256" cy="115" r="14" fill="#38bdf8" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
console.log('Successfully generated PWA icon assets in public/');
