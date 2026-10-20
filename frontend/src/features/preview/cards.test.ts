import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { catalogCards } from './cards';
import { searchCards } from './cardSelectors';

describe('Manifesto autoral', () => {
  it('tem 78 identidades, caminhos únicos e correspondência exata com os masters privados', () => {
    expect(catalogCards).toHaveLength(78);
    expect(new Set(catalogCards.map(card => card.id)).size).toBe(78);
    const filenames = catalogCards.map(card => card.masterFilename);
    expect(new Set(filenames).size).toBe(78);
    const disk = readdirSync('../assets-source/tarot/luna').filter(name => /^\d{2}_.*\.png$/.test(name));
    expect([...filenames].sort()).toEqual(disk.sort());
  });
  it('preserva grupos, sequência e números independentes dos prefixos', () => {
    expect(catalogCards.map(card => card.sortOrder)).toEqual(Array.from({ length: 78 }, (_, index) => index));
    expect(catalogCards[0].displayNumber).toBe('0');
    expect(catalogCards[0].masterFilename).toBe('01_the_fool.png');
    expect(catalogCards[0].image.variants.map(variant => variant.width)).toEqual([320, 640, 777]);
    expect(catalogCards.every(card => card.image.variants.every(variant => variant.src.startsWith(`/assets/tarot/optimized/${card.id}-`)))).toBe(true);
    expect(catalogCards[8].displayNumber).toBe('VIII');
    expect(catalogCards[8].displayNamePtBR).toBe('A Força');
    expect(catalogCards[11].displayNumber).toBe('XI');
    expect(catalogCards[11].displayNamePtBR).toBe('A Justiça');
    expect(catalogCards.filter(card => card.groupId === 'major-arcana')).toHaveLength(22);
    const ranks = ['Ás', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez', 'Pajem', 'Cavaleiro', 'Rainha', 'Rei'];
    for (const group of ['wands', 'cups', 'swords', 'pentacles']) {
      expect(catalogCards.filter(card => card.groupId === group).map(card => card.displayNumber)).toEqual(ranks);
    }
    expect(catalogCards.filter(card => card.lessonAvailability === 'preview').map(card => card.id)).toEqual(['major-00-fool']);
  });
  it('busca apenas no grupo, em português e inglês sem caixa ou acentos', () => {
    expect(searchCards('major-arcana', 'FORCA')[0].displayNamePtBR).toBe('A Força');
    expect(searchCards('major-arcana', 'STRENGTH')[0].displayNamePtBR).toBe('A Força');
    expect(searchCards('cups', 'as de copas')[0].id).toBe('cups-ace');
    expect(searchCards('cups', 'ace of wands')).toHaveLength(0);
  });
});
