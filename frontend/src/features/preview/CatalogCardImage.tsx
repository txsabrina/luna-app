import { useState } from 'react';
import type { CatalogCard } from './cards';
import { getCardGroup } from './cardSelectors';

export function CatalogCardImage({ card, decorative = false, lazy = false }: {
  card: CatalogCard; decorative?: boolean; lazy?: boolean;
}) {
  const [missing, setMissing] = useState(false);
  return <div className="lp-card-image">
    {missing ? <p role="status">Imagem de {card.displayNamePtBR} indisponível.</p> :
      <img src={card.imageSrc} alt={decorative ? '' : `${card.displayNamePtBR}, ${getCardGroup(card.groupId)?.name}, baralho autoral do Luna`}
        loading={lazy ? 'lazy' : 'eager'} onError={() => setMissing(true)} />}
  </div>;
}
