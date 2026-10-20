import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ts from 'typescript';

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(frontend, '../assets-source/tarot/luna');
const legacy = path.join(frontend, 'public/assets/tarot/waite-smith');
const output = path.join(frontend, 'public/assets/tarot/optimized');
const imageMetadataModule = path.join(frontend, 'src/features/preview/cardImageMetadata.ts');
const sampleIds = ['major-00-fool', 'wands-ace', 'cups-ace', 'swords-ace', 'pentacles-ace'];
const hash = buffer => createHash('sha256').update(buffer).digest('hex');

async function exists(filename) {
  try { await stat(filename); return true; } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

// Read literal entries using the project's TypeScript parser, without executing the editorial module.
async function manifestEntries() {
  const filename = path.join(frontend, 'src/features/preview/cards.ts');
  const tree = ts.createSourceFile(filename, await readFile(filename, 'utf8'), ts.ScriptTarget.Latest, true);
  let initializer;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === 'entries') initializer = node.initializer;
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) throw new Error('Manifest entries must be an explicit literal array.');
  const entries = initializer.elements.map(row => {
    if (!ts.isArrayLiteralExpression(row) || row.elements.length !== 6 ||
      !row.elements.every(ts.isStringLiteral)) throw new Error('Unexpected manifest entry.');
    const [id, , , , , filename] = row.elements.map(value => value.text);
    if (!/^[a-z0-9-]+$/.test(id) || !/^\d{2}_[a-z0-9_]+\.png$/.test(filename)) throw new Error(`Unsafe entry: ${id}`);
    return { cardId: id, filename };
  });
  if (entries.length !== 78 || new Set(entries.map(entry => entry.cardId)).size !== 78 ||
    new Set(entries.map(entry => entry.filename)).size !== 78) throw new Error('Expected 78 unique IDs and files.');
  return entries;
}

async function inspect(entries, directory) {
  const results = [];
  for (const entry of entries) {
    const filename = path.join(directory, entry.filename);
    const buffer = await readFile(filename);
    const metadata = await sharp(buffer).metadata();
    if (metadata.format !== 'png' || !metadata.width || !metadata.height ||
      (metadata.pages ?? 1) !== 1 || (metadata.orientation ?? 1) !== 1) {
      throw new Error(`Unsupported format/orientation: ${entry.filename}`);
    }
    // Reject profiles needing an explicit conversion policy instead of silently changing colours.
    if (metadata.space !== 'srgb') throw new Error(`Colour space requires review: ${entry.filename}: ${metadata.space}`);
    results.push({ ...entry, width: metadata.width, height: metadata.height, bytes: buffer.length,
      sha256: hash(buffer), hasAlpha: metadata.hasAlpha, hasProfile: Boolean(metadata.icc) });
  }
  return results;
}

async function copyMasters(entries) {
  const originals = await inspect(entries, legacy);
  // Preflight every existing destination before creating or copying anything.
  for (const entry of originals) {
    const destination = path.join(source, entry.filename);
    if (await exists(destination) && hash(await readFile(destination)) !== entry.sha256) {
      throw new Error(`Destination hash differs; no overwrite: ${destination}`);
    }
  }
  await mkdir(source, { recursive: true });
  for (const entry of originals) {
    const destination = path.join(source, entry.filename);
    if (!await exists(destination)) await copyFile(path.join(legacy, entry.filename), destination, constants.COPYFILE_EXCL);
    if (hash(await readFile(destination)) !== entry.sha256) throw new Error(`Copy verification failed: ${destination}`);
  }
  return originals;
}

async function generate(masters, mode, quality) {
  const started = performance.now();
  const selected = mode === 'sample' ? masters.filter(entry => sampleIds.includes(entry.cardId)) : masters;
  if (mode === 'sample' && selected.length !== 5) throw new Error('Missing sample identity.');
  await mkdir(output, { recursive: true });
  const temporary = await mkdtemp(path.join(output, '.generation-'));
  const cards = [];
  const files = [];
  try {
    // Sequential cards/variants bound memory and concurrency; libvips uses one worker thread.
    sharp.concurrency(1);
    for (const master of selected) {
      const variants = [];
      for (const width of [...new Set([320, 640, 1280].map(size => Math.min(size, master.width)))]) {
        const filename = `${master.cardId}-${width}.webp`;
        const destination = path.join(temporary, filename);
        await sharp(path.join(source, master.filename)).keepIccProfile()
          .resize({ width, withoutEnlargement: true, fit: 'inside' })
          .webp({ quality, effort: 6, alphaQuality: 100 }).toFile(destination);
        const buffer = await readFile(destination);
        const decoded = await sharp(buffer).metadata();
        await sharp(buffer).raw().toBuffer();
        const height = Math.round(master.height * width / master.width);
        if (decoded.format !== 'webp' || decoded.width !== width || decoded.height !== height ||
          width > master.width || decoded.hasAlpha !== master.hasAlpha || Boolean(decoded.icc) !== master.hasProfile) {
          throw new Error(`Output verification failed: ${filename}`);
        }
        variants.push({ width, height, bytes: buffer.length, src: `/assets/tarot/optimized/${filename}`, sha256: hash(buffer) });
        files.push(filename);
      }
      if (hash(await readFile(path.join(source, master.filename))) !== master.sha256) throw new Error(`Master changed: ${master.filename}`);
      cards.push({ cardId: master.cardId, master, variants });
    }
    const profiles = [320, 640, 1280].map(requestedWidth => ({ requestedWidth,
      bytes: cards.reduce((sum, card) => sum + card.variants.find(variant => variant.width === Math.min(requestedWidth, card.master.width)).bytes, 0) }));
    const variants = cards.flatMap(card => card.variants);
    const report = { schemaVersion: 1, mode, generator: { sharp: sharp.versions.sharp, node: process.version,
      format: 'webp', quality, effort: 6, widths: [320, 640, 1280], concurrency: 1, colour: 'sRGB, ICC preserved when present' },
      masterCount: masters.length, copiedMasters: masters.map(({ cardId, filename, sha256, bytes }) => ({ cardId, filename, sha256, bytes })),
      removalCandidates: mode === 'all' ? masters.map(({ filename, sha256 }) => ({
        publicPath: `/assets/tarot/waite-smith/${filename}`,
        preservedMaster: `assets-source/tarot/luna/${filename}`,
        sha256,
        consumers: ['generate-tarot-images.mjs --copy-masters', 'tarot-images.test.ts compatibility check'],
        decision: 'Preserve pending explicit removal approval; no catalogue runtime consumer remains.',
      })) : undefined,
      selectedCount: cards.length, derivativeCount: variants.length,
      selectedMasterBytes: selected.reduce((sum, entry) => sum + entry.bytes, 0),
      derivativeBytes: variants.reduce((sum, variant) => sum + variant.bytes, 0), profiles,
      smallest: variants.reduce((a, b) => a.bytes < b.bytes ? a : b), largest: variants.reduce((a, b) => a.bytes > b.bytes ? a : b),
      generationMs: Math.round(performance.now() - started), cards,
      compatibility: mode === 'all' ? 'All public PNGs preserved; catalogue uses optimized variants; remote lesson unchanged.' :
        'All public PNGs preserved; remote lesson and consumers unchanged.',
      measurement: 'File bytes only, not browser download or visual approval.' };
    const reportName = `${mode}-metadata.json`;
    await writeFile(path.join(temporary, reportName), JSON.stringify(report, null, 2) + '\n');
    if (mode === 'all') {
      const imageMetadata = Object.fromEntries(cards.map(card => [card.cardId, {
        width: card.master.width,
        height: card.master.height,
        variants: card.variants.map(({ width, height, src }) => ({ width, height, src })),
      }]));
      const module = `// Generated by scripts/generate-tarot-images.mjs --all. Do not edit manually.\n` +
        `export type CardImageMetadata = { readonly width: number; readonly height: number; readonly variants: readonly { readonly width: number; readonly height: number; readonly src: string }[] };\n\n` +
        `export const cardImageMetadata: Readonly<Record<string, CardImageMetadata>> = ${JSON.stringify(imageMetadata, null, 2)};\n`;
      await writeFile(path.join(temporary, 'cardImageMetadata.ts'), module);
    }
    // Publish only this run's validated files; never delete masters or unrelated outputs.
    for (const filename of [...files, reportName]) await rename(path.join(temporary, filename), path.join(output, filename));
    if (mode === 'all') await rename(path.join(temporary, 'cardImageMetadata.ts'), imageMetadataModule);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--sample') ? 'sample' : args.includes('--all') ? 'all' : undefined;
  const qualityArg = args.find(arg => arg.startsWith('--quality='));
  const quality = qualityArg ? Number(qualityArg.slice('--quality='.length)) : 85;
  if (args.some(arg => !['--copy-masters', '--sample', '--all'].includes(arg) && arg !== qualityArg) ||
    (args.includes('--sample') && args.includes('--all')) || !Number.isInteger(quality) || quality < 1 || quality > 100 ||
    (!mode && !args.includes('--copy-masters'))) throw new Error('Usage: --copy-masters and/or --sample|--all [--quality=85]');
  const entries = await manifestEntries();
  const masters = args.includes('--copy-masters') ? await copyMasters(entries) : await inspect(entries, source);
  console.log(`Verified ${masters.length} masters; SHA256 and filenames unchanged.`);
  if (mode) await generate(masters, mode, quality);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
