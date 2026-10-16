import { useState } from 'react';
import { previewTrails, remotePreview } from './data';
import './preview.css';

function PreviewImage({ src, size, label, className = '' }: {
  src: string; size: number; label: string; className?: string;
}) {
  const [missing, setMissing] = useState(false);
  return <div className={`lp-image ${className}`}>
    {missing ? <p role="status">Ilustração de {label} indisponível.</p> :
      <img src={src} width={size} height={size} alt="" onError={() => setMissing(true)} />}
  </div>;
}

function RemotePreviewLink() {
  return <div className="lp-remote">
    <a className="lp-action" href={remotePreview.href}>Explorar a prévia</a>
    <p className="lp-note">{remotePreview.apiNotice}</p>
  </div>;
}

export function PreviewPage({ path }: { path: '/preview' | '/preview/trilhas' }) {
  const trailsPage = path === '/preview/trilhas';
  return <div className="local-preview">
    <a className="lp-skip" href="#preview-content">Ir para o conteúdo</a>
    <header className="lp-header">
      <a className="lp-brand" href="/preview">Luna<span>Conhecimento em fases. No seu ritmo.</span></a>
      <span className="lp-label">Prévia visual</span>
    </header>
    <main className="lp-main" id="preview-content">
      {trailsPage ? <>
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
            <a href={`/preview/trilhas#${trail.id}`}>
              <PreviewImage src={trail.asset} size={trail.imageSize} label={trail.name} />
              <span>{trail.homeLabel}</span>
            </a>
          </li>)}</ul>
        </section>
      </>}
      <p className="lp-disclaimer">Interface com dados locais em revisão. Cursos planejados não representam conteúdo concluído.</p>
    </main>
    <nav className="lp-navigation" aria-label="Navegação da prévia visual">
      <a href="/preview" aria-current={!trailsPage ? 'page' : undefined}>Início</a>
      <a href="/preview/trilhas" aria-current={trailsPage ? 'page' : undefined}>Trilhas</a>
      <span>Biblioteca<small>Em preparação</small></span>
      <span>Meu espaço<small>Em preparação</small></span>
    </nav>
  </div>;
}
