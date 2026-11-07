import { useEffect, useId, useRef, useState } from 'react';
import { LumeGuide } from '../../components/LumeGuide/LumeGuide';
import { CardViewer } from '../../components/CardViewer/CardViewer';
import type { Lesson, Observation } from './contracts';
import { SingleChoiceStep } from './SingleChoiceStep';
import { ClassificationStep } from './ClassificationStep';
import { StudyStep } from './StudyStep';

function ObservationStep({ step, onNext, active }: { step: Observation; onNext: () => void; active: boolean }) {
  const [selected, setSelected] = useState('');
  return <>
        {active && <CardViewer cardId={step.cardId} alt={step.imageAlt} />}
    <fieldset className="answer-options">
      <legend>Escolha o detalhe que chamou sua atenção. Não há resposta correta.</legend>
      {step.options.map(option => <label key={option.id}>
        <input type="radio" name={step.id} value={option.id} checked={selected === option.id}
          onChange={() => setSelected(option.id)} /><span>{option.label}</span>
      </label>)}
    </fieldset>
    <div role="status" aria-live="polite" aria-atomic="true">
      {selected && <p className="lesson-feedback">{step.options.find(option => option.id === selected)?.feedback}</p>}
    </div>
    {selected && <button type="button" onClick={onNext}>Continuar</button>}
    <button type="button" onClick={onNext}>Prefiro continuar observando</button>
  </>;
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const [stepId, setStepId] = useState(lesson.steps[0].id);
  const [complete, setComplete] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const mapId = useId();
  const [mapOpen, setMapOpen] = useState(false);
  const [navigationRequest, setNavigationRequest] = useState(0);
  const [traversed, setTraversed] = useState<Set<string>>(() => new Set());
  const index = lesson.steps.findIndex(step => step.id === stepId);
  const step = lesson.steps[index];
  const pathIndex = lesson.paths.findIndex(path => path.stepIds.includes(stepId));
  const path = lesson.paths[pathIndex];
  const nextPath = path.stepIds.at(-1) === stepId ? lesson.paths[pathIndex + 1] : undefined;
  const continueLabel = nextPath ? `Continuar para ${nextPath.title}` : undefined;
    useEffect(() => {
    // Only explicit navigation moves focus, including a repeat selection of the same step.
    if (navigationRequest === 0) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [navigationRequest]);
  function navigate(id: string, showCompletion = false) {
    setStepId(id);
    setComplete(showCompletion);
    setMapOpen(false);
    setNavigationRequest(previous => previous + 1);
  }
  function move(direction: number) {
    if (direction > 0) setTraversed(previous => new Set([...previous, stepId]));
    const next = lesson.steps[index + direction];
    if (next) navigate(next.id);
    else if (direction > 0) navigate(stepId, true);
  }
  return <article className="lesson-surface">
    <p className="lesson-badge">Aula disponível · {lesson.steps.length} etapas</p>
    <h1>{lesson.title}</h1>
    <details className="lesson-objectives"><summary>Objetivos da aula</summary><ul>{lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul></details>
    <div className="lesson-navigation-summary">
      <p className="lesson-position">Etapa {index + 1} de {lesson.steps.length} · {path.title}</p>
      <button type="button" aria-expanded={mapOpen} aria-controls={mapId}
        onClick={() => setMapOpen(previous => !previous)}>
        {mapOpen ? 'Fechar mapa das etapas' : 'Abrir mapa das etapas'}
      </button>
    </div>
    <div id={mapId} className="lesson-map" hidden={!mapOpen}>
      <p>Navegue livremente. Visitar uma etapa não conclui as etapas ignoradas.</p>
      {lesson.paths.map((path, pathIndex) => <nav key={path.id} aria-label={`Caminho ${pathIndex + 1} — ${path.title}`}>
      <h2>Caminho {pathIndex + 1} — {path.title}</h2>
      <ol className="lesson-progress">{lesson.steps.map((item, position) =>
        path.stepIds.includes(item.id) && <li key={item.id}
          aria-current={!complete && item.id === stepId ? 'step' : undefined}>
          <button
            type="button"
            className="lesson-step-button"
            aria-current={!complete && item.id === stepId ? 'step' : undefined}
                        onClick={() => navigate(item.id)}
          >
            <span aria-hidden="true">
              {String(position + 1).padStart(2, '0')}
            </span>{' '}
            {item.title}
            {!complete && item.id === stepId && <span className="lesson-current-label">Etapa atual</span>}

          </button>
        </li>)}</ol>
          </nav>)}
    </div>
    <h2 className="lesson-content-title" ref={heading} tabIndex={-1}>{complete ? 'Encerramento da aula' : step.title}</h2>
    {complete ? <section>
      <p>{lesson.steps.every(item => traversed.has(item.id)) ? 'Você percorreu os quatro caminhos de O Louco.' : 'Você chegou ao encerramento. Ainda há etapas que você pode explorar pelo mapa.'}</p>
      <p>Este registro vale apenas para esta sessão. Retomada e progresso salvo ainda não estão disponíveis.</p>
      <div className="lesson-actions">
        <button type="button" onClick={() => navigate(lesson.steps.at(-1)!.id)}>Voltar à ficha</button>
        <button type="button" onClick={() => { setTraversed(new Set()); navigate(lesson.steps[0].id); }}>Revisitar a aula</button>
        <a href="/modules/major-arcana">Voltar ao módulo</a>
      </div>
    </section> : <>
      <LumeGuide guide={step.lume} />
      {(step.type === 'single-choice' || step.type === 'classification') && <div className="lesson-reading">
        {step.paragraphs?.map((text, index) => <p key={index}>{text}</p>)}
        {step.type === 'classification' && step.note && <p>{step.note}</p>}
      </div>}
      {lesson.steps.map(item => <div key={item.id} hidden={item.id !== stepId}>
        {item.type === 'observation' && <ObservationStep step={item} active={item.id === stepId} onNext={() => move(1)} />}
        {item.type === 'single-choice' && <SingleChoiceStep step={item} lessonId={lesson.id}
          active={item.id === stepId} version={lesson.contentVersion} onNext={() => move(1)} continueLabel={item.id === stepId ? continueLabel : undefined} />}
        {item.type === 'classification' && <ClassificationStep step={item} lessonId={lesson.id}
          active={item.id === stepId} version={lesson.contentVersion} onNext={() => move(1)} />}
        {item.type === 'study' && <StudyStep step={item} active={item.id === stepId} onNext={() => move(1)} continueLabel={item.id === stepId ? continueLabel : undefined} />}
      </div>)}
      <div key={step.id} className="lesson-reading">
        {step.type === 'explanation' && <>
          {step.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <button type="button" onClick={() => move(1)}>{step.cta}</button>
        </>}
                {step.type === 'exploration' && <>
          <CardViewer cardId={step.cardId} alt={step.imageAlt} />
          {step.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <ul className="lesson-symbols">{step.symbols.map(symbol => <li key={symbol.id}><details>
            <summary>{symbol.label}</summary>
            <p><strong>Observação:</strong> {symbol.observation}</p>
            <p><strong>Interpretação possível:</strong> {symbol.interpretation}</p>
          </details></li>)}</ul>
          {step.reflection && <p><strong>Reflexão mental:</strong> {step.reflection}</p>}
          <button type="button" onClick={() => move(1)}>Continuar investigando</button>
        </>}
      </div>
      <div className="lesson-actions">
        {index > 0 && <button type="button" onClick={() => move(-1)}>Etapa anterior</button>}
        <a href="/modules/major-arcana">Pausar e voltar ao módulo</a>
      </div>
    </>}
    <details className="lesson-editorial"><summary>Sobre a carta e esta aula</summary>
      <p><strong>Imagem:</strong> Baralho autoral do Luna, inspirado no Waite–Smith.</p>
      <p>Observar descreve a imagem. Abertura, começo e espontaneidade são o recorte interpretativo desta aula, não um significado universal, diagnóstico ou previsão.</p>
      <p>A procedência detalhada, autoria nominal e condições de uso da arte autoral ainda precisam ser documentadas. Não usamos imagens dos prints Astra.</p>
    </details>
  </article>;
}
