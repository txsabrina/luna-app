import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassificationStep } from './ClassificationStep';
import { isLesson } from './contracts';
import type { Classification } from './contracts';
import document from '../../../../backend/src/main/resources/content/tarot/fool-first-step.v1.json';

const step = document.lesson.steps[8] as Classification;
const response = (data: unknown) => ({ ok: true, status: 200, json: async () => data }) as Response;
const result = { correct: false, items: step.items.map(item => ({ itemId: item.id,
  selectedCategoryId: 'observation', expectedCategoryId: 'interpretation', correct: false, feedback: 'Propõe uma relação de sentido.' })) };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
async function selectAll() {
  for (const radio of screen.getAllByRole('radio', { name: 'Observação' })) await userEvent.click(radio);
}
it('exige tentativa completa, preserva seleção em falha, permite retry e avanço após erros avaliados', async () => {
  const fetch = vi.fn().mockRejectedValueOnce(new Error('Sem conexão')).mockResolvedValueOnce(response(result));
  const next = vi.fn();
  vi.stubGlobal('fetch', fetch);
  render(<ClassificationStep step={step} lessonId="fool-first-step" version={4} onNext={next} />);
  expect(screen.getByRole('button', { name: 'Conferir' })).toHaveProperty('disabled', true);
  await selectAll();
  expect(fetch).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
  expect(await screen.findByText(/Suas escolhas foram preservadas/)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
  expect(screen.getAllByRole('radio', { name: 'Observação' }).every(radio => (radio as HTMLInputElement).checked)).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Tentar avaliação novamente' }));
  expect(await screen.findByRole('heading', { name: 'Vamos comparar as classificações' })).toBeTruthy();
  expect(screen.getAllByText(/Categoria esperada:/)).toHaveLength(4);
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ contentVersion: 4,
    assignments: step.items.map(item => ({ itemId: item.id, categoryId: 'observation' })) });
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(next).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Conferir' })).toHaveProperty('disabled', false);
});
it('bloqueia envio duplicado e ignora resposta depois de sair da etapa', async () => {
  let resolve!: (value: Response) => void;
  const fetch = vi.fn(() => new Promise<Response>(done => { resolve = done; }));
  vi.stubGlobal('fetch', fetch);
  const view = render(<ClassificationStep step={step} lessonId="fool-first-step" version={4} onNext={() => {}} />);
  await selectAll();
  await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
  await userEvent.click(screen.getByRole('button', { name: 'Avaliando…' }));
  expect(fetch).toHaveBeenCalledTimes(1);
  view.rerender(<ClassificationStep active={false} step={step} lessonId="fool-first-step" version={4} onNext={() => {}} />);
  expect((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].signal?.aborted).toBe(true);
  resolve(response(result));
  expect(await screen.findByRole('button', { name: 'Conferir' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
});
it('rejeita versão antiga, categorias duplicadas e chaves públicas', () => {
  expect(isLesson(document.lesson)).toBe(true);
  expect(isLesson({ ...document.lesson, contentVersion: 2 })).toBe(false);
  expect(isLesson({ ...document.lesson, steps: document.lesson.steps.map(item => item.id === step.id
    ? { ...step, categories: [step.categories[0], step.categories[0]] } : item) })).toBe(false);
  expect(isLesson({ ...document.lesson, steps: document.lesson.steps.map(item => item.id === step.id
    ? { ...step, items: step.items.map(item => ({ ...item, expectedCategoryId: 'observation' })) } : item) })).toBe(false);
});
