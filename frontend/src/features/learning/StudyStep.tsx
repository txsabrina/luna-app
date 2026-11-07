import { useState } from 'react';
import { CardViewer } from '../../components/CardViewer/CardViewer';
import type { Study } from './contracts';

/** Unassessed study: revealing, rotating or opening support is always optional. */
export function StudyStep({ step, active, onNext, continueLabel }: {
  step: Study; active: boolean; onNext: () => void; continueLabel?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const [inverted, setInverted] = useState(false);
  return <div className="lesson-reading">
    {step.paragraphs.map((text, index) => <p className="study-text" key={index}>{text}</p>)}
    {step.blocks.map(block => block.collapsible ? <details className="study-support" key={block.label}>
      <summary>{block.label}</summary>
      {block.paragraphs.map((text, index) => <p className="study-text" key={index}>{text}</p>)}
    </details> : <section className="study-support" key={block.label}>
      <h3>{block.label}</h3>
      {block.paragraphs.map((text, index) => <p className="study-text" key={index}>{text}</p>)}
    </section>)}
    {step.cardMode === 'reveal' && !revealed && <button type="button" onClick={() => setRevealed(true)}>Revelar a carta</button>}
    {active && step.cardMode !== 'none' && (step.cardMode !== 'reveal' || revealed)
      && <CardViewer cardId="major-00-fool" alt={step.imageAlt!} inverted={inverted} />}
    {step.cardMode === 'rotate' && <button type="button" aria-pressed={inverted} onClick={() => setInverted(value => !value)}>
      {inverted ? 'Voltar à posição normal' : 'Inverter para observar'}
    </button>}
    {revealed && step.afterReveal?.map((text, index) => <p className="study-text" key={index}>{text}</p>)}
    {step.reflection && <p className="study-text">{step.reflection}</p>}
    <div className="lesson-actions"><button type="button" onClick={onNext}>{continueLabel ?? step.cta}</button></div>
  </div>;
}
