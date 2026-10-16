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
    {!modulesPage && <aside className="lp-tarot-guide" aria-label="Mensagem da Lume">
      <PreviewImage src="/assets/preview/lume-welcome.png" size={768} label="Lume" className="lp-lume" />
      <p>Vamos construir esse conhecimento por caminhos. Uma carta de cada vez, sem perder o contexto.</p>
      <PreviewImage src={tarot.asset} size={tarot.imageSize} label={tarot.name} className="lp-tarot-emblem" />
    </aside>}
    <div className="lp-catalog-grid">
      {modulesPage ? foundationsModules.map(module => <article className="lp-trail-card" key={module.id}>
        <h2>{module.name}</h2>
        <p>{module.cardCount ? <>
          {module.cardCount} cartas{module.id === 'major-arcana' ? ' ' : ': '}{module.description}
        </> : module.description}</p>
        <p className="lp-status">{module.status}</p>
        {module.cardCount && <a className="lp-action lp-catalog-action" href={`${modulesHref}/modulos/${module.id}`}>Explorar cartas</a>}
        {module.previewAvailable && <>
          <p className="lp-availability">Prévia de O Louco disponível</p>
          <RemotePreviewLink label="Abrir prévia de O Louco" />
        </>}
      </article>) : tarotCourses.map(item => <article className="lp-trail-card" key={item.id}>
        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <p className="lp-status">{item.status}</p>
        {item.previewAvailable && <p className="lp-availability">Prévia de O Louco disponível</p>}
        {item.modulesHref && <a className="lp-action lp-catalog-action" href={item.modulesHref}>Ver módulos</a>}
      </article>)}
    </div>
    {modulesPage && <p className="lp-note">
      As contagens representam cartas do baralho, não aulas implementadas. As associações são a abordagem
      introdutória deste curso, não significados universais exclusivos.
    </p>}
  </>;
}
