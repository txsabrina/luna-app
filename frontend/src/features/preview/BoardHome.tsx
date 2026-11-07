import { CatalogCardImage } from './CatalogCardImage';
import { PreviewImage } from './PreviewElements';
import { catalogCards } from './cards';
import { previewTrails, remotePreview } from './data';
import './board-home.css';

type NavigationIcon = 'home' | 'trails' | 'library' | 'space';

function NavigationIcon({ kind }: { kind: NavigationIcon }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === 'home' && <path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10" />}
    {kind === 'trails' && <><path d="M5 18c-5-8 16 2 12-12M7 5l3 3-3 3-3-3Z" /><circle cx="5" cy="19" r="2" /><circle cx="18" cy="4" r="2" /></>}
    {kind === 'library' && <path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" />}
    {kind === 'space' && <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2c0-6 16-6 16 0v2Z" /></>}
  </svg>;
}

function Star({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'bh-star bh-star-small' : 'bh-star'} viewBox="0 0 20 24"
    aria-hidden="true" focusable="false"><path d="m10 0 2.5 9L20 12l-7.5 2.5L10 24l-2.5-9.5L0 12l7.5-3Z" fill="currentColor" /></svg>;
}

const fool = catalogCards.find(card => card.id === 'major-00-fool')!;

export function BoardHome() {
  return <div className="board-home">
    <div className="bh-app">
      <a className="bh-skip" href="#home-content">Ir para o conteúdo</a>
      <header className="bh-header">
        <div className="bh-stars"><Star small /><Star /></div>
        <a className="bh-brand" href="/preview" aria-label="Luna — Início">
          <svg className="bh-moon" viewBox="0 0 48 56" aria-hidden="true" focusable="false">
            <path d="M38 3C4-7-9 46 26 53c9 2 17-2 21-9C9 57 8 7 38 3Z" fill="currentColor" />
          </svg>
          <span>LUNA</span>
        </a>
        <div className="bh-stars bh-stars-end"><Star /><Star small /></div>
      </header>

      <main className="bh-main" id="home-content" tabIndex={-1}>
        <section className="bh-greeting" aria-label="Mensagem da Lume">
          <div className="bh-portrait"><PreviewImage src="/assets/lume/lume-home-approved.png" size={768} label="Lume" /></div>
          <h1>Uma descoberta de cada vez.</h1>
        </section>

        <section className="bh-activity" aria-label="Prévia de O Louco">
          <a className="bh-activity-link" href={remotePreview.href} aria-labelledby="home-activity-title" aria-describedby="home-api-note">
            <div className="bh-fool"><CatalogCardImage card={fool} decorative sizes="48px" /></div>
            <div><span className="bh-activity-title" id="home-activity-title">Conhecer O Louco</span>
              <span className="bh-badge">Prévia disponível</span>
            </div>
          </a>
          <p className="bh-api-note" id="home-api-note">{remotePreview.apiNotice}</p>
        </section>

        <nav className="bh-trails" aria-label="Trilhas de conhecimento">
          <ul>{previewTrails.map(trail => <li key={trail.id}>
            <a href={trail.coursesHref ?? `/preview/trilhas#${trail.id}`}>
              <PreviewImage src={trail.asset} size={trail.imageSize} label={trail.name} className={`bh-medallion bh-art-${trail.id}`} />
              <span>{trail.homeLabel}</span>
            </a>
          </li>)}</ul>
        </nav>

        <section className="bh-destinations" aria-labelledby="destinations-title">
          <h2 id="destinations-title">Destinações</h2>
          <ul>{previewTrails.map(trail => {
            const content = <>
              <PreviewImage src={trail.asset} size={trail.imageSize} label={trail.name} className={`bh-destination-art bh-art-${trail.id}`} />
              <span className="bh-course-count">{trail.plannedCourseCount} cursos</span>
              <span className="bh-badge">Planejamento</span>
            </>;
            return <li key={trail.id}>
              {trail.coursesHref ? <a className="bh-destination" href={trail.coursesHref}
                aria-label={`${trail.homeLabel}: ${trail.plannedCourseCount} cursos planejados. Explorar estrutura.`}>{content}</a> :
                <div className="bh-destination" role="group" aria-label={`${trail.homeLabel}: ${trail.plannedCourseCount} cursos planejados, em preparação.`}>{content}</div>}
            </li>;
          })}</ul>
        </section>
      </main>

      <nav className="bh-navigation" aria-label="Navegação da prévia visual">
        <a href="/preview" aria-current="page"><NavigationIcon kind="home" /><span>Início</span></a>
        <a href="/preview/trilhas"><NavigationIcon kind="trails" /><span>Trilhas</span></a>
        <span className="bh-unavailable" aria-disabled="true"><NavigationIcon kind="library" /><span>Biblioteca</span><small>Em preparação</small></span>
        <span className="bh-unavailable" aria-disabled="true"><NavigationIcon kind="space" /><span>Meu espaço</span><small>Em preparação</small></span>
      </nav>
    </div>
  </div>;
}
