import { useEffect, useRef, useState } from 'react';
import { request } from './api';
import { isClassificationEvaluation } from './contracts';
import type { Classification, ClassificationEvaluation } from './contracts';

export function ClassificationStep({ step, lessonId, version, onNext, active = true }: {
  step: Classification; lessonId: string; version: number; onNext: () => void; active?: boolean;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ClassificationEvaluation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const firstOption = useRef<HTMLInputElement>(null);
  useEffect(() => () => { pending.current?.abort(); }, [active]);
  async function confirm() {
    if (pending.current || !step.items.every(item => selected[item.id])) return;
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true); setError('');
    try {
      const response = await request(`/lessons/${encodeURIComponent(lessonId)}/steps/${encodeURIComponent(step.id)}/classify`,
        isClassificationEvaluation, controller.signal, { contentVersion: version,
          assignments: step.items.map(item => ({ itemId: item.id, categoryId: selected[item.id] })) });
      if (response.items.length !== step.items.length || new Set(response.items.map(item => item.itemId)).size !== step.items.length
        || response.items.some(item => !step.items.some(option => option.id === item.itemId)
          || item.selectedCategoryId !== selected[item.itemId]
          || !step.categories.some(category => category.id === item.expectedCategoryId)))
        throw new Error('A avaliação recebida não corresponde à etapa.');
      if (!controller.signal.aborted) setResult(response);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Não foi possível avaliar.');
    } finally {
      setLoading(false);
      if (pending.current === controller) pending.current = null;
    }
  }
  return <>
    <p>{step.instruction}</p>
    {step.items.map((item, index) => <fieldset key={item.id} disabled={loading || !!result} className="answer-options">
      <legend>{item.label}</legend>
      {step.categories.map((category, categoryIndex) => <label key={category.id}>
        <input ref={index === 0 && categoryIndex === 0 ? firstOption : undefined} type="radio" value={category.id} name={`${step.id}-${item.id}`} checked={selected[item.id] === category.id}
          onChange={() => { setSelected(previous => ({ ...previous, [item.id]: category.id })); setError(''); }} />
        <span>{category.label}</span>
      </label>)}
    </fieldset>)}
    {!result && <button type="button" disabled={loading || !step.items.every(item => selected[item.id])}
      onClick={() => void confirm()}>{loading ? 'Avaliando…' : error ? 'Tentar avaliação novamente' : 'Conferir'}</button>}
    <div role="status" aria-live="polite" aria-atomic="true">
      {loading && <p>Consultando a avaliação…</p>}
      {error && <p>{error} Suas escolhas foram preservadas.</p>}
      {result && <section className="lesson-feedback">
        <h3>{result.correct ? 'Classificação esperada' : 'Vamos comparar as classificações'}</h3>
        <ul>{result.items.map(item => <li key={item.itemId}>
          <strong>{step.items.find(option => option.id === item.itemId)?.label}</strong>
          <p>{item.correct ? 'Correto.' : 'Outra classificação era esperada.'} {item.feedback}</p>
          <p>Categoria esperada: {step.categories.find(category => category.id === item.expectedCategoryId)?.label}</p>
        </li>)}</ul>
      </section>}
    </div>
    {result && <div className="lesson-actions">
      <button type="button" onClick={() => { setResult(null); firstOption.current?.focus(); }}>Tentar novamente</button>
      <button type="button" onClick={onNext}>Continuar</button>
    </div>}
  </>;
}
