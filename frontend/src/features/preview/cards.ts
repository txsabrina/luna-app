import { cardImageMetadata } from './cardImageMetadata';
import type { CardImageMetadata } from './cardImageMetadata';
import { remotePreview } from './data';

export type CardGroupId = 'major-arcana' | 'wands' | 'cups' | 'swords' | 'pentacles';
export type CatalogCard = {
  id: string;
  displayNamePtBR: string;
  artTitleEn: string;
  groupId: CardGroupId;
  sortOrder: number;
  displayNumber: string;
  masterFilename: string;
  image: CardImageMetadata;
  deckId: 'luna-authorial-waite-smith-inspired';
} & ({ lessonAvailability: 'preview'; lessonHref: string } | { lessonAvailability: 'planned'; lessonHref?: never });

type CardEntry = readonly [id: string, pt: string, en: string, group: CardGroupId, numberOrRank: string, filename: string];

// Explicit filenames checked on disk. English labels still require review against the artwork.
const entries: readonly CardEntry[] = [
  ['major-00-fool', 'O Louco', 'The Fool', 'major-arcana', '0', '01_the_fool.png'],
  ['major-01-magician', 'O Mago', 'The Magician', 'major-arcana', 'I', '02_the_magician.png'],
  ['major-02-high-priestess', 'A Sacerdotisa', 'The High Priestess', 'major-arcana', 'II', '03_the_high_priestess.png'],
  ['major-03-empress', 'A Imperatriz', 'The Empress', 'major-arcana', 'III', '04_the_empress.png'],
  ['major-04-emperor', 'O Imperador', 'The Emperor', 'major-arcana', 'IV', '05_the_emperor.png'],
  ['major-05-hierophant', 'O Hierofante', 'The Hierophant', 'major-arcana', 'V', '06_the_hierophant.png'],
  ['major-06-lovers', 'Os Enamorados', 'The Lovers', 'major-arcana', 'VI', '07_the_lovers.png'],
  ['major-07-chariot', 'O Carro', 'The Chariot', 'major-arcana', 'VII', '08_the_chariot.png'],
  ['major-08-strength', 'A Força', 'Strength', 'major-arcana', 'VIII', '09_strength.png'],
  ['major-09-hermit', 'O Eremita', 'The Hermit', 'major-arcana', 'IX', '10_the_hermit.png'],
  ['major-10-wheel-of-fortune', 'A Roda da Fortuna', 'Wheel of Fortune', 'major-arcana', 'X', '11_wheel_of_fortune.png'],
  ['major-11-justice', 'A Justiça', 'Justice', 'major-arcana', 'XI', '12_justice.png'],
  ['major-12-hanged-man', 'O Enforcado', 'The Hanged Man', 'major-arcana', 'XII', '13_the_hanged_man.png'],
  ['major-13-death', 'A Morte', 'Death', 'major-arcana', 'XIII', '14_death.png'],
  ['major-14-temperance', 'A Temperança', 'Temperance', 'major-arcana', 'XIV', '15_temperance.png'],
  ['major-15-devil', 'O Diabo', 'The Devil', 'major-arcana', 'XV', '16_the_devil.png'],
  ['major-16-tower', 'A Torre', 'The Tower', 'major-arcana', 'XVI', '17_the_tower.png'],
  ['major-17-star', 'A Estrela', 'The Star', 'major-arcana', 'XVII', '18_the_star.png'],
  ['major-18-moon', 'A Lua', 'The Moon', 'major-arcana', 'XVIII', '19_the_moon.png'],
  ['major-19-sun', 'O Sol', 'The Sun', 'major-arcana', 'XIX', '20_the_sun.png'],
  ['major-20-judgement', 'O Julgamento', 'Judgement', 'major-arcana', 'XX', '21_judgement.png'],
  ['major-21-world', 'O Mundo', 'The World', 'major-arcana', 'XXI', '22_the_world.png'],
  ['wands-ace', 'Ás de Paus', 'Ace of Wands', 'wands', 'Ás', '23_ace_of_wands.png'],
  ['wands-two', 'Dois de Paus', 'Two of Wands', 'wands', 'Dois', '24_two_of_wands.png'],
  ['wands-three', 'Três de Paus', 'Three of Wands', 'wands', 'Três', '25_three_of_wands.png'],
  ['wands-four', 'Quatro de Paus', 'Four of Wands', 'wands', 'Quatro', '26_four_of_wands.png'],
  ['wands-five', 'Cinco de Paus', 'Five of Wands', 'wands', 'Cinco', '27_five_of_wands.png'],
  ['wands-six', 'Seis de Paus', 'Six of Wands', 'wands', 'Seis', '28_six_of_wands.png'],
  ['wands-seven', 'Sete de Paus', 'Seven of Wands', 'wands', 'Sete', '29_seven_of_wands.png'],
  ['wands-eight', 'Oito de Paus', 'Eight of Wands', 'wands', 'Oito', '30_eight_of_wands.png'],
  ['wands-nine', 'Nove de Paus', 'Nine of Wands', 'wands', 'Nove', '31_nine_of_wands.png'],
  ['wands-ten', 'Dez de Paus', 'Ten of Wands', 'wands', 'Dez', '32_ten_of_wands.png'],
  ['wands-page', 'Pajem de Paus', 'Page of Wands', 'wands', 'Pajem', '33_page_of_wands.png'],
  ['wands-knight', 'Cavaleiro de Paus', 'Knight of Wands', 'wands', 'Cavaleiro', '34_knight_of_wands.png'],
  ['wands-queen', 'Rainha de Paus', 'Queen of Wands', 'wands', 'Rainha', '35_queen_of_wands.png'],
  ['wands-king', 'Rei de Paus', 'King of Wands', 'wands', 'Rei', '36_king_of_wands.png'],
  ['cups-ace', 'Ás de Copas', 'Ace of Cups', 'cups', 'Ás', '37_ace_of_cups.png'],
  ['cups-two', 'Dois de Copas', 'Two of Cups', 'cups', 'Dois', '38_two_of_cups.png'],
  ['cups-three', 'Três de Copas', 'Three of Cups', 'cups', 'Três', '39_three_of_cups.png'],
  ['cups-four', 'Quatro de Copas', 'Four of Cups', 'cups', 'Quatro', '40_four_of_cups.png'],
  ['cups-five', 'Cinco de Copas', 'Five of Cups', 'cups', 'Cinco', '41_five_of_cups.png'],
  ['cups-six', 'Seis de Copas', 'Six of Cups', 'cups', 'Seis', '42_six_of_cups.png'],
  ['cups-seven', 'Sete de Copas', 'Seven of Cups', 'cups', 'Sete', '43_seven_of_cups.png'],
  ['cups-eight', 'Oito de Copas', 'Eight of Cups', 'cups', 'Oito', '44_eight_of_cups.png'],
  ['cups-nine', 'Nove de Copas', 'Nine of Cups', 'cups', 'Nove', '45_nine_of_cups.png'],
  ['cups-ten', 'Dez de Copas', 'Ten of Cups', 'cups', 'Dez', '46_ten_of_cups.png'],
  ['cups-page', 'Pajem de Copas', 'Page of Cups', 'cups', 'Pajem', '47_page_of_cups.png'],
  ['cups-knight', 'Cavaleiro de Copas', 'Knight of Cups', 'cups', 'Cavaleiro', '48_knight_of_cups.png'],
  ['cups-queen', 'Rainha de Copas', 'Queen of Cups', 'cups', 'Rainha', '49_queen_of_cups.png'],
  ['cups-king', 'Rei de Copas', 'King of Cups', 'cups', 'Rei', '50_king_of_cups.png'],
  ['swords-ace', 'Ás de Espadas', 'Ace of Swords', 'swords', 'Ás', '51_ace_of_swords.png'],
  ['swords-two', 'Dois de Espadas', 'Two of Swords', 'swords', 'Dois', '52_two_of_swords.png'],
  ['swords-three', 'Três de Espadas', 'Three of Swords', 'swords', 'Três', '53_three_of_swords.png'],
  ['swords-four', 'Quatro de Espadas', 'Four of Swords', 'swords', 'Quatro', '54_four_of_swords.png'],
  ['swords-five', 'Cinco de Espadas', 'Five of Swords', 'swords', 'Cinco', '55_five_of_swords.png'],
  ['swords-six', 'Seis de Espadas', 'Six of Swords', 'swords', 'Seis', '56_six_of_swords.png'],
  ['swords-seven', 'Sete de Espadas', 'Seven of Swords', 'swords', 'Sete', '57_seven_of_swords.png'],
  ['swords-eight', 'Oito de Espadas', 'Eight of Swords', 'swords', 'Oito', '58_eight_of_swords.png'],
  ['swords-nine', 'Nove de Espadas', 'Nine of Swords', 'swords', 'Nove', '59_nine_of_swords.png'],
  ['swords-ten', 'Dez de Espadas', 'Ten of Swords', 'swords', 'Dez', '60_ten_of_swords.png'],
  ['swords-page', 'Pajem de Espadas', 'Page of Swords', 'swords', 'Pajem', '61_page_of_swords.png'],
  ['swords-knight', 'Cavaleiro de Espadas', 'Knight of Swords', 'swords', 'Cavaleiro', '62_knight_of_swords.png'],
  ['swords-queen', 'Rainha de Espadas', 'Queen of Swords', 'swords', 'Rainha', '63_queen_of_swords.png'],
  ['swords-king', 'Rei de Espadas', 'King of Swords', 'swords', 'Rei', '64_king_of_swords.png'],
  ['pentacles-ace', 'Ás de Ouros', 'Ace of Pentacles', 'pentacles', 'Ás', '65_ace_of_pentacles.png'],
  ['pentacles-two', 'Dois de Ouros', 'Two of Pentacles', 'pentacles', 'Dois', '66_two_of_pentacles.png'],
  ['pentacles-three', 'Três de Ouros', 'Three of Pentacles', 'pentacles', 'Três', '67_three_of_pentacles.png'],
  ['pentacles-four', 'Quatro de Ouros', 'Four of Pentacles', 'pentacles', 'Quatro', '68_four_of_pentacles.png'],
  ['pentacles-five', 'Cinco de Ouros', 'Five of Pentacles', 'pentacles', 'Cinco', '69_five_of_pentacles.png'],
  ['pentacles-six', 'Seis de Ouros', 'Six of Pentacles', 'pentacles', 'Seis', '70_six_of_pentacles.png'],
  ['pentacles-seven', 'Sete de Ouros', 'Seven of Pentacles', 'pentacles', 'Sete', '71_seven_of_pentacles.png'],
  ['pentacles-eight', 'Oito de Ouros', 'Eight of Pentacles', 'pentacles', 'Oito', '72_eight_of_pentacles.png'],
  ['pentacles-nine', 'Nove de Ouros', 'Nine of Pentacles', 'pentacles', 'Nove', '73_nine_of_pentacles.png'],
  ['pentacles-ten', 'Dez de Ouros', 'Ten of Pentacles', 'pentacles', 'Dez', '74_ten_of_pentacles.png'],
  ['pentacles-page', 'Pajem de Ouros', 'Page of Pentacles', 'pentacles', 'Pajem', '75_page_of_pentacles.png'],
  ['pentacles-knight', 'Cavaleiro de Ouros', 'Knight of Pentacles', 'pentacles', 'Cavaleiro', '76_knight_of_pentacles.png'],
  ['pentacles-queen', 'Rainha de Ouros', 'Queen of Pentacles', 'pentacles', 'Rainha', '77_queen_of_pentacles.png'],
  ['pentacles-king', 'Rei de Ouros', 'King of Pentacles', 'pentacles', 'Rei', '78_king_of_pentacles.png'],
];

export const catalogCards: readonly CatalogCard[] = entries.map(([id, displayNamePtBR, artTitleEn, groupId, displayNumber, filename], index) => {
  const image = cardImageMetadata[id];
  if (!image) throw new Error(`Missing generated image metadata for ${id}.`);
  return {
    id, displayNamePtBR, artTitleEn, groupId, displayNumber, sortOrder: index,
    masterFilename: filename,
    image,
    deckId: 'luna-authorial-waite-smith-inspired',
    ...(id === 'major-00-fool' ? { lessonAvailability: 'preview', lessonHref: remotePreview.href } :
      { lessonAvailability: 'planned' }),
  };
});
