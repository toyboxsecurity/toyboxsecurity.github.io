/**
 * Generates the full favicon set from src/assets/logos/icon.png.
 *
 * Why this exists: Google's SERP favicon requires a raster (PNG/ICO) at a size
 * that's a multiple of 48px (48, 96, 144, ...). The previous favicon.svg
 * placeholder ("TB" on a dark square) was vector-only — Google fell back to the
 * default globe icon in search results.
 *
 * Outputs (all into public/):
 *   - favicon.ico        — multi-resolution (16, 32, 48) for legacy browsers
 *   - favicon-48.png     — Google SERP minimum
 *   - favicon-96.png     — Google SERP recommended
 *   - favicon-192.png    — Android home-screen / PWA
 *   - favicon-512.png    — Android splash / large
 *   - apple-touch-icon.png (180x180) — iOS home-screen
 *
 * The existing favicon.svg is left in place as a fallback for browsers that
 * prefer vector (Firefox tabs, etc.).
 *
 * Run via: node scripts/generate-favicons.mjs
 * Re-run only when icon.png changes.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src/assets/logos/icon.png');
const OUT_DIR = resolve(ROOT, 'public');

// Background-fit padding: icon.png is 1072x983 (slightly wider than tall) and
// transparent. We composite onto the brand dark to give Google a solid edge.
const BG = '#1A1410';

/** Render the source icon into a square canvas of `size`px filled with BG. */
async function renderSquare(size) {
  // Fit the icon inside ~88% of the canvas so it has a small breathing border.
  const inner = Math.round(size * 0.88);
  const iconBuf = await sharp(SRC)
    .resize(inner, inner, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: iconBuf, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function main() {
  const sizes = [16, 32, 48, 96, 144, 180, 192, 512];
  const renders = {};
  for (const s of sizes) {
    renders[s] = await renderSquare(s);
    console.log(`✓ rendered ${s}x${s}`);
  }

  // PNG outputs
  writeFileSync(resolve(OUT_DIR, 'favicon-48.png'), renders[48]);
  writeFileSync(resolve(OUT_DIR, 'favicon-96.png'), renders[96]);
  writeFileSync(resolve(OUT_DIR, 'favicon-192.png'), renders[192]);
  writeFileSync(resolve(OUT_DIR, 'favicon-512.png'), renders[512]);
  writeFileSync(resolve(OUT_DIR, 'apple-touch-icon.png'), renders[180]);
  console.log('✓ wrote PNG favicons');

  // favicon.ico — concatenate 16/32/48 into a single .ico via png-to-ico-style
  // header. Use sharp's `.toFile()` for one of them and then build a multi-size
  // ICO manually. Simpler approach: ship a 48x48 PNG renamed to favicon.ico,
  // BUT browsers actually parse .ico format, so we build it properly.
  const ico = buildIco([
    { size: 16, png: renders[16] },
    { size: 32, png: renders[32] },
    { size: 48, png: renders[48] },
  ]);
  writeFileSync(resolve(OUT_DIR, 'favicon.ico'), ico);
  console.log('✓ wrote favicon.ico (16+32+48 multi-size)');
}

/**
 * Build a multi-image ICO file from a list of PNG buffers.
 * ICO file format reference: https://en.wikipedia.org/wiki/ICO_(file_format)
 * Modern browsers accept PNG-encoded ICO entries (Vista+ format).
 */
function buildIco(images) {
  // ICONDIR header (6 bytes) + ICONDIRENTRY (16 bytes each)
  const headerSize = 6 + images.length * 16;
  let dataOffset = headerSize;
  const entries = [];
  let totalDataSize = 0;
  for (const { size, png } of images) {
    entries.push({ size, png, offset: dataOffset });
    dataOffset += png.length;
    totalDataSize += png.length;
  }

  const out = Buffer.alloc(headerSize + totalDataSize);
  // ICONDIR
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // type: 1 = ICO
  out.writeUInt16LE(images.length, 4); // image count

  // ICONDIRENTRY for each image
  for (let i = 0; i < entries.length; i++) {
    const { size, png, offset } = entries[i];
    const base = 6 + i * 16;
    out.writeUInt8(size >= 256 ? 0 : size, base + 0); // width (0 = 256)
    out.writeUInt8(size >= 256 ? 0 : size, base + 1); // height
    out.writeUInt8(0, base + 2); // color palette count
    out.writeUInt8(0, base + 3); // reserved
    out.writeUInt16LE(1, base + 4); // color planes
    out.writeUInt16LE(32, base + 6); // bits per pixel
    out.writeUInt32LE(png.length, base + 8); // image size
    out.writeUInt32LE(offset, base + 12); // image offset
    png.copy(out, offset);
  }
  return out;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
