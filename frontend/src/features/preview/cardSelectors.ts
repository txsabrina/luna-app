import { catalogCards, type CardGroupId } from './cards';
import { foundationsModules } from './data';

export const modulesHref = '/preview/taro/cartas-e-fundamentos';
export const groupHref = (id: CardGroupId) => `${modulesHref}/modulos/${id}`;
export const cardHref = (id: string) => `/preview/taro/cartas/${id}`;

export function getCardGroup(id: string) {
  return foundationsModules.find(module => module.id === id && module.cardCount !== undefined);
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function searchCards(groupId: string, query = '') {
  const term = normalize(query);
  return catalogCards.filter(card => card.groupId === groupId &&
    normalize(`${card.displayNamePtBR} ${card.artTitleEn}`).includes(term));
}
