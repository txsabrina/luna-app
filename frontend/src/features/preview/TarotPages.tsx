import { catalogCards } from './cards';
import { CatalogCardImage } from './CatalogCardImage';
import { modulesHref } from './cardSelectors';
import { foundationsModules, previewTrails, tarotCourses } from './data';
import { PreviewImage, RemotePreviewLink } from './PreviewElements';

export function TarotPages({ modulesPage }: { modulesPage: boolean }) {
  const tarot = previewTrails.find(trail => trail.id === 'tarot')!;
  const course = tarotCourses.find(item => item.id === 'tarot-cards-foundations')!;
  return <>
    <header className="lp-intro">
      <a className="lp-back" href={modulesPage ? tarot.coursesHref : '/preview/trilhas'}>
        {modulesPage ? 'Voltar aos cursos de Tarô' : 'Voltar às trilhas'}
      </a>
      {modulesPage && <p className="lp-kicker">{course.name}</p>}
      <h1>{modulesPage ? 'Conheça os caminhos do baralho' : 'Explore o Tarô'}</h1>
      <p>{modulesPage ? 'Explore sua estrutura antes de aprofundar cada carta.' :
        'Conheça o baralho, suas possibilidades de leitura e as relações entre as cartas.'}</p>
    </header>
    {!modulesPage && <div className="content-tarot-highlight">
      <PreviewImage src={tarot.asset} size={tarot.imageSize} label={tarot.name} />
      <span>Tarô</span>
    </div>}
    <div className="lp-catalog-grid">
      {modulesPage ? foundationsModules.map(module => <article className="lp-trail-card" key={module.id}>
        <div className="content-thumbnail">{module.cardCount ? <CatalogCardImage decorative lazy sizes="72px" card={catalogCards.find(card => card.groupId === module.id)!} /> : <svg viewBox="0 0 64 80" aria-hidden="true"><rect x="8" y="10" width="36" height="56" rx="4" fill="none" stroke="currentColor"/><rect x="22" y="16" width="36" height="56" rx="4" fill="none" stroke="currentColor"/></svg>}</div>
        <div className="content-card-copy"><h2>{module.name}</h2>
        <p>{module.cardCount ? <>
          {module.cardCount} cartas{module.id === 'major-arcana' ? ' ' : ': '}{module.description}
        </> : module.description}</p>
        <p className="lp-status">{module.status}</p>
        {module.cardCount && <a className="lp-action lp-catalog-action" href={`${modulesHref}/modulos/${module.id}`}>Explorar cartas</a>}
        {module.previewAvailable && <>
          <p className="lp-availability">Prévia de O Louco disponível</p>
          <RemotePreviewLink label="Abrir prévia de O Louco" />
        </>}
        </div>
      </article>) : tarotCourses.map((item, index) => <article className="lp-trail-card" key={item.id}>
        <div className={`content-thumbnail content-thumbnail--${index}`}>
          <CatalogCardImage decorative lazy sizes="72px" card={catalogCards[index === 3 ? 1 : 0]} />
          {index >= 2 && <CatalogCardImage decorative lazy sizes="72px" card={catalogCards[2]} />}
        </div>
        <div className="content-card-copy"><h2>{item.name}</h2>
        <p>{item.description}</p>
        <p className="lp-status">{item.status}</p>
        {item.previewAvailable && <p className="lp-availability">Prévia de O Louco disponível</p>}
        {item.modulesHref && <a className="lp-action lp-catalog-action" href={item.modulesHref}>Ver módulos</a>}
        </div>
      </article>)}
    </div>
    {modulesPage && <p className="lp-note">
      As contagens representam cartas do baralho, não aulas implementadas. As associações são a abordagem
      introdutória deste curso, não significados universais exclusivos.
    </p>}
  </>;
}
