import { useRef, useState } from 'react';
import { catalogCards } from './cards';
import { cardHref, getCardGroup, groupHref, modulesHref, searchCards } from './cardSelectors';
import { CatalogCardImage } from './CatalogCardImage';
import { RemotePreviewLink } from './PreviewElements';
import './card-catalog.css';

function NotFound() {
  return <><h1>Não encontrado</h1><p>A carta ou o grupo solicitado não está no catálogo.</p>
    <a className="lp-back" href={modulesHref}>Voltar aos módulos</a></>;
}

export function CardCatalogPage({ groupId }: { groupId: string }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const search = useRef<HTMLInputElement>(null);
  const group = getCardGroup(groupId);
  if (!group) return <NotFound />;
  const cards = searchCards(groupId, query);
  return <>
    <header className="lp-intro">
      <a className="lp-back" href={modulesHref}>Voltar aos módulos</a>
      <h1>{group.name}</h1><p>{group.cardCount} cartas no grupo</p>
      <p>Explore as imagens do baralho. As aulas serão disponibilizadas conforme forem desenvolvidas.</p>
    </header>
    <div className="lp-card-controls">
      <label>Buscar carta<input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div role="group" aria-label="Visualização do catálogo">
        <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Grade</button>
        <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>Lista</button>
      </div>
    </div>
    <p role="status">{cards.length} resultados de {group.cardCount} cartas</p>
    {cards.length === 0 ? <div className="lp-empty"><p>Nenhuma carta encontrada.</p>
      <button type="button" onClick={() => { setQuery(''); search.current?.focus(); }}>Limpar busca</button>
    </div> : <ul className={`lp-card-results lp-card-results--${view}`}>
      {cards.map(card => <li key={card.id}><a href={cardHref(card.id)}>
        <CatalogCardImage card={card} decorative lazy />
        <div><h2>{card.displayNamePtBR}</h2><p>{card.artTitleEn} · {card.displayNumber}</p>
          <p>{card.lessonAvailability === 'preview' ? 'Prévia da aula disponível' : 'Aula em preparação'}</p>
        </div>
      </a></li>)}
    </ul>}
  </>;
}

export function CardPresentationPage({ cardId }: { cardId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const card = catalogCards.find(item => item.id === cardId);
  if (!card) return <NotFound />;
  const group = getCardGroup(card.groupId)!;
  return <>
    <header className="lp-intro">
      <a className="lp-back" href={groupHref(card.groupId)}>Voltar a {group.name}</a>
      <h1>{card.displayNamePtBR}</h1><p>{group.name} · {card.displayNumber} · {card.artTitleEn}</p>
    </header>
    <div className="lp-card-presentation">
      <div><CatalogCardImage card={card} />
        <button ref={trigger} type="button" onClick={() => dialog.current?.showModal()}>Ampliar carta</button>
      </div>
      <div><p>Baralho autoral do Luna, inspirado no Waite–Smith.</p>
        {card.lessonAvailability === 'preview' ? <RemotePreviewLink label="Abrir prévia da aula" /> :
          <p>A aula desta carta está em preparação. Você já pode explorar sua imagem.</p>}
      </div>
    </div>
    <dialog ref={dialog} className="lp-card-dialog" aria-labelledby="catalog-dialog-title"
      onClose={() => trigger.current?.focus()} onCancel={event => { event.preventDefault(); dialog.current?.close(); }}>
      <div className="lp-dialog-heading"><h2 id="catalog-dialog-title">{card.displayNamePtBR}</h2>
        <button type="button" autoFocus onClick={() => dialog.current?.close()}>Fechar ampliação</button>
      </div>
      <CatalogCardImage card={card} />
    </dialog>
  </>;
}
