import { useRef, useState } from 'react';
import { LumeGuide } from '../../components/LumeGuide/LumeGuide';
import { CardViewer } from '../../components/CardViewer/CardViewer';
import type { Lesson, Observation } from './contracts';
import { SingleChoiceStep } from './SingleChoiceStep';

function ObservationStep({ step, onNext }: { step: Observation; onNext: () => void }) {
  const [selected, setSelected] = useState('');
  return <>
    <CardViewer cardId={step.cardId} alt={step.imageAlt} />
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
  const index = lesson.steps.findIndex(step => step.id === stepId);
  const step = lesson.steps[index];
  function move(direction: number) {
    const next = lesson.steps[index + direction];
    if (next) setStepId(next.id);
    else if (direction > 0) setComplete(true);
    heading.current?.focus();
  }
  return <article className="lesson-surface">
    <p className="lesson-badge">Prévia · 4 etapas</p>
    <h1>{lesson.title}</h1>
    <details><summary>Objetivos desta prévia</summary><ul>{lesson.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul></details>
    <nav aria-label="Caminho 1 — Conhecer">
      <h2>Caminho 1 — Conhecer</h2>
      <ol className="lesson-progress">{lesson.steps.map((item, position) => <li key={item.id}
        aria-current={!complete && item.id === stepId ? 'step' : undefined}>
        <span>{String(position + 1).padStart(2, '0')}</span> {item.title}
      </li>)}</ol>
    </nav>
    <h2 ref={heading} tabIndex={-1}>{complete ? 'Prévia concluída' : step.title}</h2>
    {complete ? <section>
      <p>Você percorreu o primeiro caminho. Os próximos caminhos estão em produção.</p>
      <p>Este registro vale apenas para esta sessão. A aula completa ainda não foi concluída. Não há XP ou progresso salvo.</p>
      <div className="lesson-actions">
        <button type="button" onClick={() => { setComplete(false); heading.current?.focus(); }}>Rever etapa 04</button>
        <button type="button" onClick={() => {
          setStepId(lesson.steps[0].id);
          setComplete(false);
          heading.current?.focus();
        }}>Revisitar a prévia</button>
        <a href="/modules/major-arcana">Voltar ao módulo</a>
      </div>
    </section> : <>
      <LumeGuide guide={step.lume} imageSrc="/assets/preview/lume-welcome.png" />
      <div key={step.id}>
        {step.type === 'explanation' && <>
          {step.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <button type="button" onClick={() => move(1)}>{step.cta}</button>
        </>}
        {step.type === 'observation' && <ObservationStep step={step} onNext={() => move(1)} />}
        {step.type === 'single-choice' && <SingleChoiceStep step={step} lessonId={lesson.id}
          version={lesson.contentVersion} onNext={() => move(1)} />}
      </div>
      <div className="lesson-actions">
        {index > 0 && <button type="button" onClick={() => move(-1)}>Etapa anterior</button>}
        <a href="/modules/major-arcana">Pausar e voltar ao módulo</a>
      </div>
    </>}
    <aside className="lesson-editorial">
      <p><strong>Imagem:</strong> Baralho autoral do Luna, inspirado no Waite–Smith.</p>
      <p>Observar descreve a imagem. Abertura, começo e espontaneidade são o recorte interpretativo desta aula, não um significado universal, diagnóstico ou previsão.</p>
      <p>A procedência detalhada, autoria nominal e condições de uso da arte autoral ainda precisam ser documentadas. Não usamos imagens dos prints Astra.</p>
    </aside>
  </article>;
}
