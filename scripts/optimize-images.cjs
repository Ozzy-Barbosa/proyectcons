#!/usr/bin/env node
'use strict';

// Creates responsive derivatives only. Source photographs and attribution data
// are never modified. Run: node scripts/optimize-images.cjs
const fs = require('node:fs');
const path = require('node:path');

function loadSharp() {
  const runtime = process.env.USERPROFILE && path.join(
    process.env.USERPROFILE,
    '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'
  );
  const candidates = ['sharp', process.env.SHARP_MODULE_PATH, runtime].filter(Boolean);
  for (const candidate of candidates) {
    try { return require(candidate); } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
  }
  throw new Error('Sharp no está disponible. Instala sharp o define SHARP_MODULE_PATH con la ruta de su módulo.');
}

async function main() {
  const sharp = loadSharp();
  const root = path.resolve(__dirname, '..');
  const sourceDir = path.join(root, 'assets/images');
  const outputDir = path.join(sourceDir, 'optimized');
  const widths = [640, 1440];
  const files = fs.readdirSync(sourceDir);
  const sources = files.filter(file => /\.(jpe?g|png)$/i.test(file))
    .filter(file => !/\.jpe?g$/i.test(file) || !files.includes(`${path.parse(file).name}.png`)).sort();
  const images = [];
  fs.mkdirSync(outputDir, { recursive: true });

  for (const source of sources) {
    const original = path.join(sourceDir, source);
    const input = await sharp(original).metadata();
    const sourceBytes = fs.statSync(original).size;
    const stem = path.parse(source).name;
    // PNG is the official transparent logo; preserve sharp edges and alpha.
    const encoder = source.endsWith('.png') ? { lossless: true, effort: 6 } : { quality: 80, effort: 5 };
    const derivatives = [];

    for (const width of widths) {
      const file = `${stem}-${width}.webp`;
      const result = await sharp(original)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp(encoder)
        .toFile(path.join(outputDir, file));
      derivatives.push({ file, width: result.width, height: result.height, bytes: result.size });
    }

    images.push({ source, width: input.width, height: input.height, bytes: sourceBytes, derivatives });
  }

  // Keyed by original filename for build-time lookup. Use variant.width as the
  // srcset descriptor; the filename states the requested maximum width.
  const manifest = Object.fromEntries(images.map(item => [item.source, {
    width: item.width, height: item.height, bytes: item.bytes, variants: item.derivatives
  }]));
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const photos = images.filter(item => !item.source.startsWith('logo-'));
  const before = photos.reduce((sum, item) => sum + item.bytes, 0);
  const after = photos.reduce((sum, item) => sum + item.derivatives[1].bytes, 0);
  console.log(`Optimizadas ${images.length} imágenes (${images.length * widths.length} variantes procesadas).`);
  console.log(`Fotografías, versión grande: ${(before / 1048576).toFixed(2)} → ${(after / 1048576).toFixed(2)} MiB (${Math.round((1 - after / before) * 100)}% menos).`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
