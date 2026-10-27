import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const rootDir = process.cwd();
const publicDir = path.resolve(rootDir, 'public');

// Vector SVG with pure paths (no external font dependencies so it renders identically everywhere)
function getSvg(isMaskable = false) {
  // For maskable, full-bleed solid background without rounded corners, content scaled to 80% safe zone
  const bgRx = isMaskable ? '0' : '110';
  const innerScale = isMaskable ? 'transform="scale(0.8) translate(64, 64)"' : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="40%" stop-color="#312e81" />
      <stop offset="80%" stop-color="#4338ca" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Solid Full-bleed Background for Android Maskable / App icon -->
  <rect width="512" height="512" rx="${bgRx}" fill="url(#bgGrad)" />

  <g ${innerScale}>
    <!-- Inner glowing badge -->
    <rect x="56" y="56" width="400" height="400" rx="90" fill="url(#cardGrad)" opacity="0.25" />

    <!-- Open Book / Language Sheets Motif -->
    <g filter="url(#glow)">
      <!-- Left Page -->
      <path d="M 120 170 Q 185 155 246 180 L 246 360 Q 185 335 120 350 Z" fill="url(#pageGrad)" />
      <!-- Right Page -->
      <path d="M 392 170 Q 327 155 266 180 L 266 360 Q 327 335 392 350 Z" fill="#ffffff" />
      <!-- Book spine shadow -->
      <path d="M 246 180 L 266 180 L 266 360 L 246 360 Z" fill="#c7d2fe" opacity="0.8" />
    </g>

    <!-- Stylized "文" (Language/Culture) Iconography on Left Page -->
    <!-- Top dot/head -->
    <circle cx="185" cy="225" r="7" fill="#4338ca" />
    <!-- Horizontal stroke -->
    <path d="M 152 244 L 218 244" stroke="#4338ca" stroke-width="7" stroke-linecap="round" />
    <!-- Left falling stroke & Right falling stroke -->
    <path d="M 195 246 Q 165 285 145 305" stroke="#4338ca" stroke-width="7" stroke-linecap="round" fill="none" />
    <path d="M 175 252 Q 195 285 225 305" stroke="#4338ca" stroke-width="7" stroke-linecap="round" fill="none" />

    <!-- Stylized "A" (Alphabet/Global) Iconography on Right Page -->
    <path d="M 330 220 L 305 295 M 330 220 L 355 295" stroke="#4f46e5" stroke-width="7" stroke-linecap="round" />
    <path d="M 314 270 L 346 270" stroke="#4f46e5" stroke-width="6.5" stroke-linecap="round" />

    <!-- Floating Sparkles / Stars -->
    <path d="M 256 120 L 262 135 L 277 141 L 262 147 L 256 162 L 250 147 L 235 141 L 250 135 Z" fill="#38bdf8" />
    <circle cx="370" cy="130" r="6" fill="#818cf8" />
    <circle cx="140" cy="135" r="5" fill="#a5b4fc" />

    <!-- Brand Label "LINGUAHUB" -->
    <rect x="156" y="380" width="200" height="34" rx="17" fill="#0f172a" opacity="0.8" />
    <text x="256" y="403" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="16" fill="#38bdf8" letter-spacing="3" text-anchor="middle">LINGUAHUB</text>
  </g>
</svg>`;
}

async function generate() {
  const standardSvg = Buffer.from(getSvg(false));
  const maskableSvg = Buffer.from(getSvg(true));

  // 1. icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), getSvg(false), 'utf8');
  console.log('Saved public/icon.svg');

  // 2. pwa-192x192.png
  await sharp(standardSvg)
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Saved public/pwa-192x192.png');

  // 3. pwa-512x512.png
  await sharp(standardSvg)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Saved public/pwa-512x512.png');

  // 4. pwa-maskable-512x512.png
  await sharp(maskableSvg)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Saved public/pwa-maskable-512x512.png');

  // 5. apple-touch-icon.png (180x180)
  await sharp(standardSvg)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved public/apple-touch-icon.png');

  // 6. favicon.ico / favicon (64x64 PNG fallback)
  await sharp(standardSvg)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Saved public/favicon.png');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
