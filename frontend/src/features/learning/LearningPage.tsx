import { useEffect, useState } from 'react';
import { request } from './api';
import { isLesson, isNavigation } from './contracts';
import type { Lesson, Navigation } from './contracts';
import { LessonPlayer } from './LessonPlayer';
import './learning.css';

type State = { kind: 'loading' } | { kind: 'error'; message: string }
  | { kind: 'lesson'; lesson: Lesson } | { kind: 'navigation'; navigation: Navigation };

export function LearningPage({ path }: { path: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [retry, setRetry] = useState(0);
  const [, section, id] = path.split('/');
  const isTrail = section === 'trails' && id === 'tarot';
  useEffect(() => {
    if (isTrail) return;
    const controller = new AbortController();
    async function load() {
      setState({ kind: 'loading' });
      try {
        const endpoint = `/${section}/${encodeURIComponent(id ?? '')}`;
        if (section === 'lessons') {
          const lesson = await request(endpoint, isLesson, controller.signal);
          if (!controller.signal.aborted) setState({ kind: 'lesson', lesson });
        } else if (section === 'courses' || section === 'modules') {
          const navigation = await request(endpoint, isNavigation, controller.signal);
          if (!controller.signal.aborted) setState({ kind: 'navigation', navigation });
        } else throw new Error('Este caminho ainda não está disponível.');
      } catch (error) {
        if (!controller.signal.aborted) setState({ kind: 'error', message: error instanceof Error
          ? error.message : 'Não foi possível carregar o conteúdo.' });
      }
    }
    void load();
    return () => controller.abort();
  }, [section, id, retry, isTrail]);

  return <section className="learning-page">
    <nav className="lesson-breadcrumb" aria-label="Hierarquia de estudos">
      <a href="/">Trilhas</a><span aria-hidden="true"> / </span>
      <a href="/trails/tarot">Tarô</a>
      {(section === 'courses' || section === 'modules' || section === 'lessons') && <>
        <span aria-hidden="true"> / </span><a href="/courses/tarot-cards-foundations">Cartas e fundamentos</a>
      </>}
      {(section === 'modules' || section === 'lessons') && <>
        <span aria-hidden="true"> / </span><a href="/modules/major-arcana">Arcanos Maiores</a>
      </>}
      {section === 'lessons' && <><span aria-hidden="true"> / </span><span>O Louco</span></>}
    </nav>
    {isTrail ? <article className="lesson-surface">
      <h1>Tarô</h1><p>Investigue imagens e tradições simbólicas com interpretações contextualizadas.</p>
      <p>Quatro cursos planejados. Somente a prévia abaixo foi preparada neste incremento.</p>
      <ul className="navigation-list"><li><a href="/courses/tarot-cards-foundations">Cartas e fundamentos</a><p>Prévia: primeiro caminho de O Louco.</p></li></ul>
    </article> : <>
      {state.kind === 'loading' && <p className="notice" role="status">Carregando conteúdo…</p>}
      {state.kind === 'error' && <div className="notice" role="alert"><h1>Conteúdo não acessível</h1>
        <p>{state.message}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button>
      </div>}
      {state.kind === 'navigation' && <article className="lesson-surface">
        <p className="lesson-badge">Prévia: primeiro caminho</p><h1>{state.navigation.title}</h1>
        <p>O restante do conteúdo está em produção.</p>
        <ul className="navigation-list">{state.navigation.children.map(child => <li key={child.id}>
          <a href={`/${section === 'courses' ? 'modules' : 'lessons'}/${encodeURIComponent(child.id)}`}>{child.title}</a>
          <p>Prévia: primeiro caminho</p>
        </li>)}</ul>
      </article>}
      {state.kind === 'lesson' && <LessonPlayer key={`${state.lesson.id}-${state.lesson.contentVersion}`} lesson={state.lesson} />}
    </>}
  </section>;
}
