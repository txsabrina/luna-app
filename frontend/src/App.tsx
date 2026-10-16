import { useEffect, useState } from 'react';
import './App.css';
import { LearningPage } from './features/learning/LearningPage';
import { PreviewPage } from './features/preview/PreviewPage';

type Status = 'PLANNED' | 'IN_PROGRESS' | 'AVAILABLE';

type Trail = {
  id: string;
  title: string;
  description: string;
  plannedCourseCount: number;
  status: Status;
};

type Catalog =
  | { kind: 'loading' }
  | { kind: 'success'; trails: Trail[] }
  | { kind: 'error'; message: string };

const labels: Record<Status, string> = {
  PLANNED: 'Em planejamento',
  IN_PROGRESS: 'Em produção',
  AVAILABLE: 'Disponível',
};

const symbols: Record<string, string> = {
  tarot: '✦',
  numerology: '∞',
  patterns: '◌',
};

function isTrail(value: unknown): value is Trail {
  if (typeof value !== 'object' || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.plannedCourseCount === 'number' &&
    Number.isInteger(item.plannedCourseCount) &&
    item.plannedCourseCount >= 0 &&
    (item.status === 'PLANNED' ||
      item.status === 'IN_PROGRESS' ||
      item.status === 'AVAILABLE')
  );
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [quiet, setQuiet] = useState(false);
  const [portraitAvailable, setPortraitAvailable] = useState(true);
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const showCatalog = path === '/';

  useEffect(() => {
    if (!showCatalog) return;
    const controller = new AbortController();

    async function load() {
      setCatalog({ kind: 'loading' });

      try {
        const response = await fetch('/api/v1/trails', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`A API respondeu com HTTP ${response.status}.`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data) || !data.every(isTrail)) {
          throw new Error('O catálogo recebido tem um formato inesperado.');
        }

        if (!controller.signal.aborted) setCatalog({ kind: 'success', trails: data });
      } catch (error) {
        if (controller.signal.aborted) return;

        setCatalog({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar o catálogo.',
        });
      }
    }

    void load();
    return () => controller.abort();
  }, [attempt, showCatalog]);

    if (path === '/preview' || path === '/preview/trilhas') {
    return <PreviewPage path={path} />;
  }

  return (
    <div className={`universe ${quiet ? 'quiet' : ''}`}>
      <header className="site-header">
        <a href="/" className="brand">
          <span aria-hidden="true">☾</span> LUNA
        </a>
        <span className="preview">Prévia de desenvolvimento</span>
      </header>

      <main>
        {!showCatalog && <LearningPage path={path} />}
        {showCatalog && <>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Conhecimento em fases. No seu ritmo.</p>
          <h1 id="hero-title">Seu universo de estudos.</h1>
          <p className="hero-description">
            Observe, experimente e conecte ideias.
            Uma descoberta de cada vez.
          </p>

          <aside className="lume-panel" aria-label="Mensagem da Lume">
            {portraitAvailable && (
              <img
                className="lume-image"
                src="/assets/lume.png"
                alt="Lume, a bruxinha companheira de estudos"
                onError={() => setPortraitAvailable(false)}
              />
            )}
            <div>
              <p className="eyebrow">Lume</p>
              <p>“Vamos observar antes de decorar? Nosso primeiro encontro é com O Louco.”</p>
              {!portraitAvailable && (
                <small>Retrato da personagem ainda não adicionado.</small>
              )}
            </div>
          </aside>
        </section>

        <section aria-labelledby="catalog-title">
          <h2 id="catalog-title">Escolha uma constelação</h2>
          <p className="muted">Três trilhas, diferentes formas de investigar.</p>

          {catalog.kind === 'loading' && (
            <p className="notice" role="status">Carregando as trilhas…</p>
          )}

          {catalog.kind === 'error' && (
            <div className="notice error" role="alert">
              <h3>O catálogo não está acessível.</h3>
              <p>{catalog.message}</p>
              <p>Confira se o Quarkus está rodando na porta 8080.</p>
              <button onClick={() => setAttempt(value => value + 1)}>
                Tentar novamente
              </button>
            </div>
          )}

          {catalog.kind === 'success' && (
            <div className="trail-grid">
              {catalog.trails.map(trail => (
                <article className="trail-card" key={trail.id}>
                  <span className="trail-symbol" aria-hidden="true">
                    {symbols[trail.id] ?? '✦'}
                  </span>
                  <span className="status">{labels[trail.status]}</span>
                  <h3>{trail.title}</h3>
                  <p>{trail.description}</p>
                  <footer>{trail.plannedCourseCount} cursos planejados</footer>
                  {trail.id === 'tarot' ? <div className="preview-entry">
                    <p id="fool-preview-description" className="preview-description">Prévia disponível · 4 etapas</p>
                    <a className="primary-action" href="/lessons/fool-first-step"
                      aria-describedby="fool-preview-description">Conhecer O Louco</a>
                  </div> : <p className="preparation-note">Cursos em preparação</p>}
                </article>
              ))}
            </div>
          )}
        </section>

        </>}
        <label className="motion-setting">
          <input
            type="checkbox"
            checked={quiet}
            onChange={event => setQuiet(event.target.checked)}
          />
          <span>Modo tranquilo: sem animações
            <small>{quiet ? 'Ativado nesta sessão' : 'Desativado · respeita a preferência do dispositivo'}</small>
          </span>
        </label>

        <p className="scope-note">
          Catálogo em planejamento e prévia de O Louco com quatro etapas.
          A aula completa, progresso salvo e conquistas ainda não estão disponíveis.
        </p>
      </main>
    </div>
  );
}
