/**
 * Generates PNG PWA icons from public/favicon.svg
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'favicon.svg');
const outDir = join(root, 'public', 'icons');

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Install sharp first: npm install sharp --save-dev');
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  const svg = readFileSync(svgPath);

  for (const size of [192, 512]) {
    const png = await sharp(svg).resize(size, size).png().toBuffer();
    const out = join(outDir, `icon-${size}.png`);
    writeFileSync(out, png);
    console.log(`Wrote ${out}`);
  }

  // Apple touch icon (180px recommended)
  const apple = await sharp(svg).resize(180, 180).png().toBuffer();
  writeFileSync(join(outDir, 'apple-touch-icon.png'), apple);
  console.log('Wrote apple-touch-icon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
