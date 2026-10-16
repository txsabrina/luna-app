import { PreviewImage, RemotePreviewLink } from './PreviewElements';
import { CardCatalogPage, CardPresentationPage } from './CardCatalogPage';
import { TarotPages } from './TarotPages';
import { previewTrails, remotePreview } from './data';
import './preview.css';

export type PreviewPath = '/preview' | '/preview/trilhas' | '/preview/taro' | '/preview/taro/cartas-e-fundamentos' | `/preview/taro/cartas-e-fundamentos/modulos/${string}` | `/preview/taro/cartas/${string}`;

export function PreviewPage({ path }: { path: PreviewPath }) {
  const trailsPage = path === '/preview/trilhas';
  const tarotPage = path === '/preview/taro' || path === '/preview/taro/cartas-e-fundamentos';
  const homePage = path === '/preview';
  const catalogPrefix = '/preview/taro/cartas-e-fundamentos/modulos/';
  const cardPrefix = '/preview/taro/cartas/';
  const catalogPage = path.startsWith(catalogPrefix);
  const cardPage = path.startsWith(cardPrefix);
  return <div className="local-preview">
    <a className="lp-skip" href="#preview-content">Ir para o conteúdo</a>
    <header className="lp-header">
      <a className="lp-brand" href="/preview">Luna<span>Conhecimento em fases. No seu ritmo.</span></a>
      <span className="lp-label">Prévia visual</span>
    </header>
    <main className="lp-main" id="preview-content">
      {catalogPage ? <CardCatalogPage key={path} groupId={path.slice(catalogPrefix.length)} /> :
        cardPage ? <CardPresentationPage key={path} cardId={path.slice(cardPrefix.length)} /> : tarotPage ? <TarotPages modulesPage={path === '/preview/taro/cartas-e-fundamentos'} /> : trailsPage ? <>
        <header className="lp-intro">
          <h1>Nossas trilhas de conhecimento</h1>
          <p>Escolha um caminho para explorar.</p>
        </header>
        <div className="lp-trail-grid">
          {previewTrails.map(trail => <article className="lp-trail-card" id={trail.id} key={trail.id}>
            <PreviewImage src={trail.asset} size={trail.imageSize} label={trail.name} />
            <h2>{trail.name}</h2>
            <p>{trail.description}</p>
            <p className="lp-count">{trail.plannedCourseCount} cursos planejados</p>
            <p className="lp-status">{trail.status}</p>
            {trail.coursesHref && <a className="lp-action lp-catalog-action" href={trail.coursesHref}>Explorar os cursos</a>}
            {trail.previewAvailable && <>
              <p className="lp-availability">Prévia de O Louco disponível</p>
              <RemotePreviewLink />
            </>}
          </article>)}
        </div>
      </> : <>
        <section className="lp-welcome" aria-labelledby="welcome-title">
          <PreviewImage src="/assets/preview/lume-welcome.png" size={768} label="Lume" className="lp-lume" />
          <div>
            <h1 id="welcome-title">Uma descoberta de cada vez.</h1>
            <p className="lp-message">Vamos observar antes de decorar?</p>
          </div>
        </section>
        <section className="lp-activity" aria-labelledby="activity-title">
          <div><p className="lp-kicker">Um primeiro passo</p>
            <h2 id="activity-title">{remotePreview.title}</h2>
            <p>{remotePreview.description}</p>
          </div>
          <RemotePreviewLink />
        </section>
        <section className="lp-paths" aria-labelledby="paths-title">
          <div className="lp-section-heading"><h2 id="paths-title">Três caminhos para descobrir</h2>
            <a href="/preview/trilhas">Conhecer as trilhas</a>
          </div>
          <ul className="lp-medallions">{previewTrails.map(trail => <li key={trail.id}>
            <a href={trail.coursesHref ?? `/preview/trilhas#${trail.id}`}>
              <PreviewImage src={trail.asset} size={trail.imageSize} label={trail.name} />
              <span>{trail.homeLabel}</span>
            </a>
          </li>)}</ul>
        </section>
      </>}
      <p className="lp-disclaimer">Interface com dados locais em revisão. Cursos planejados não representam conteúdo concluído.</p>
    </main>
    <nav className="lp-navigation" aria-label="Navegação da prévia visual">
      <a href="/preview" aria-current={homePage ? 'page' : undefined}>Início</a>
      <a href="/preview/trilhas" aria-current={!homePage ? 'page' : undefined}>Trilhas</a>
      <span>Biblioteca<small>Em preparação</small></span>
      <span>Meu espaço<small>Em preparação</small></span>
    </nav>
  </div>;
}
