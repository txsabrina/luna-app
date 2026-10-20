// @vitest-environment node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { cardImageMetadata } from '../src/features/preview/cardImageMetadata';

const digest = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex');
const report = JSON.parse(readFileSync('reports/tarot/all-metadata.json', 'utf8'));

describe('Conjunto técnico do incremento 011', () => {
  it('preserva os 78 masters privados e retira somente suas antigas cópias públicas', () => {
    expect(report.masters).toHaveLength(78);
    for (const master of report.masters) {
      const copy = readFileSync(`../assets-source/tarot/luna/${master.filename}`);
      expect(copy.length).toBe(master.bytes);
      expect(digest(copy)).toBe(master.sha256);
      expect(existsSync(`public/assets/tarot/waite-smith/${master.filename}`)).toBe(false);
    }
    expect(existsSync('public/assets/tarot/waite-smith/fool.png')).toBe(true);
  });
  it('gera 78 identidades com 234 variantes decodificáveis, sem ampliar', async () => {
    expect(report.cards).toHaveLength(78);
    expect(new Set(report.cards.map((card: { cardId: string }) => card.cardId)).size).toBe(78);
    expect(report.derivativeCount).toBe(234);
    for (const card of report.cards) {
      for (const variant of card.variants) {
        const buffer = readFileSync(`public${variant.src}`);
        const metadata = await sharp(buffer).metadata();
        await sharp(buffer).raw().toBuffer();
        expect(metadata.width).toBe(variant.width);
        expect(metadata.height).toBe(variant.height);
        expect(buffer.length).toBe(variant.bytes);
        expect(digest(buffer)).toBe(variant.sha256);
        expect(variant.width).toBeLessThanOrEqual(card.master.width);
        expect(Math.abs(variant.height - card.master.height * variant.width / card.master.width)).toBeLessThanOrEqual(0.5);
      }
    }
  }, 15_000);
  it('mantém o módulo consumido pela interface alinhado aos metadados validados', () => {
    expect(Object.keys(cardImageMetadata)).toEqual(report.cards.map((card: { cardId: string }) => card.cardId));
    for (const card of report.cards) {
      expect(cardImageMetadata[card.cardId]).toEqual({
        width: card.master.width,
        height: card.master.height,
        variants: card.variants.map(({ width, height, src }: { width: number; height: number; src: string }) => ({ width, height, src })),
      });
    }
  });
  it('rejeita argumentos inválidos com saída e retorno não zero, de outro diretório', () => {
    const script = path.resolve('scripts/generate-tarot-images.mjs');
    const invalid = spawnSync(process.execPath, [script, '--sample', '--quality=invalid'], { cwd: '..', encoding: 'utf8' });
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain('Usage:');
    const missing = spawnSync(process.execPath, [script, '--import-masters=missing-master-directory'], { cwd: '..', encoding: 'utf8' });
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain('ENOENT');
  });
});
