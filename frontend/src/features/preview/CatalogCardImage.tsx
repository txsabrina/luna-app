import { useState } from 'react';
import type { CatalogCard } from './cards';
import { getCardGroup } from './cardSelectors';

export function CatalogCardImage({ card, decorative = false, lazy = false, sizes }: {
  card: CatalogCard; decorative?: boolean; lazy?: boolean; sizes: string;
}) {
  const [missing, setMissing] = useState(false);
  const [fallback, ...sources] = card.image.variants;
  return <div className="lp-card-image">
    {missing ? <p role="status">Imagem de {card.displayNamePtBR} indisponível.</p> :
      <img src={fallback.src} srcSet={[fallback, ...sources].map(variant => `${variant.src} ${variant.width}w`).join(', ')}
        sizes={sizes} width={card.image.width} height={card.image.height}
        alt={decorative ? '' : `${card.displayNamePtBR}, ${getCardGroup(card.groupId)?.name}, baralho autoral do Luna`}
        loading={lazy ? 'lazy' : 'eager'} onError={() => setMissing(true)} />}
  </div>;
}
