import { useEffect, useRef, useState } from 'react';
import { request } from './api';
import { isEvaluation } from './contracts';
import type { Evaluation, SingleChoice } from './contracts';

type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string }
  | { kind: 'success'; result: Evaluation };

export function SingleChoiceStep({ lessonId, version, step, onNext }: {
  lessonId: string; version: number; step: SingleChoice; onNext: () => void;
}) {
  const [selected, setSelected] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const pending = useRef<AbortController | null>(null);
  const firstOption = useRef<HTMLInputElement>(null);
  useEffect(() => () => { pending.current?.abort(); }, []);

  async function confirm() {
    if (!selected || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setState({ kind: 'loading' });
    try {
      const result = await request(
        `/lessons/${encodeURIComponent(lessonId)}/steps/${encodeURIComponent(step.id)}/evaluate`,
        isEvaluation, controller.signal, { contentVersion: version, selectedOptionId: selected },
      );
      if (!step.options.some(option => option.id === result.expectedOptionId))
        throw new Error('A avaliação recebida não corresponde à etapa.');
      if (!controller.signal.aborted) setState({ kind: 'success', result });
    } catch (error) {
      if (!controller.signal.aborted) setState({ kind: 'error', message: error instanceof Error
        ? error.message : 'Não foi possível avaliar. Tente novamente.' });
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  }
  const evaluated = state.kind === 'success';
  return <>
    <fieldset disabled={state.kind === 'loading' || evaluated} className="answer-options">
      <legend>{step.question}</legend>
      {step.options.map((option, index) => <label key={option.id}>
        <input ref={index === 0 ? firstOption : undefined} type="radio" name={step.id}
          value={option.id} checked={selected === option.id}
          onChange={() => { setSelected(option.id); setState({ kind: 'idle' }); }} />
        <span>{option.label}</span>
      </label>)}
    </fieldset>
    {!evaluated && <button type="button" disabled={!selected || state.kind === 'loading'}
      onClick={() => void confirm()}>
      {state.kind === 'loading' ? 'Avaliando…' : state.kind === 'error' ? 'Tentar avaliação novamente' : 'Confirmar alternativa'}
    </button>}
    <div role="status" aria-live="polite" aria-atomic="true">
      {state.kind === 'loading' && <p>Consultando a avaliação…</p>}
      {state.kind === 'error' && <p className="lesson-feedback">{state.message} Sua seleção foi preservada.</p>}
      {state.kind === 'success' && <section className="lesson-feedback">
        <h3>{state.result.correct ? 'Resposta esperada selecionada' : 'Vamos comparar as possibilidades'}</h3>
        <p>{state.result.selectedOptionFeedback}</p>
        <p><span aria-hidden="true">✓ </span><strong>Resposta esperada:</strong> {step.options.find(option => option.id === state.result.expectedOptionId)?.label}</p>
        <p>{state.result.explanation}</p>
      </section>}
    </div>
    {state.kind === 'success' && <div className="lesson-actions">
      {!state.result.correct && <button type="button" onClick={() => {
        setState({ kind: 'idle' }); firstOption.current?.focus();
      }}>Tentar outra alternativa</button>}
      <button type="button" onClick={onNext}>Concluir esta prévia</button>
    </div>}
  </>;
}
