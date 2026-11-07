import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudyStep } from './StudyStep';
import { LessonPlayer } from './LessonPlayer';
import { isLesson } from './contracts';
import type { Lesson, Study } from './contracts';
import document from '../../../../backend/src/main/resources/content/tarot/fool-first-step.v1.json';

const lesson = document.lesson as Lesson;
const study = (index: number) => lesson.steps[index] as Study;
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('valida vinte etapas, quatro caminhos e versão sem aceitar chaves ou partições inválidas', () => {
  expect(isLesson(lesson)).toBe(true);
  expect(isLesson({ ...lesson, contentVersion: 3 })).toBe(false);
  expect(isLesson({ ...lesson, paths: lesson.paths.slice(0, 3) })).toBe(false);
  expect(isLesson({ ...lesson, paths: lesson.paths.map(path => ({ ...path, stepIds: path.stepIds.slice(1) })) })).toBe(false);
  expect(isLesson({ ...lesson, steps: lesson.steps.map(step => step.id === '11-zero' ? { ...step, expectedOptionId: 'new-with-experience' } : step) })).toBe(false);
});

it('comparação guiada e reflexão têm continuidade livre sem exigir apoio nem resposta', () => {
  const next = vi.fn();
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  const view = render(<StudyStep step={study(12)} active onNext={next} />);
  expect(view.container.querySelectorAll('details')).toHaveLength(3);
  expect([...view.container.querySelectorAll('details')].every(item => !item.open)).toBe(true);
  expect(screen.queryByRole('radio')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(next).toHaveBeenCalledTimes(1);
  expect(fetch).not.toHaveBeenCalled();
  view.rerender(<StudyStep step={study(14)} active onNext={next} />);
  expect(screen.getByText('Ver um exemplo')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('recuperação não carrega carta antes da revelação e permite continuar sem revelar', () => {
  const next = vi.fn();
  const view = render(<StudyStep step={study(15)} active onNext={next} />);
  expect(screen.queryByRole('img')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(next).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Revelar a carta' }));
  expect(screen.getByRole('img').getAttribute('src')).toContain('major-00-fool-320.webp');
  expect(screen.getByRole('button', { name: 'Ampliar carta' })).toBeTruthy();
  view.rerender(<StudyStep step={study(15)} active={false} onNext={next} />);
  expect(screen.queryByRole('img')).toBeNull();
  view.rerender(<StudyStep step={study(15)} active onNext={next} />);
  expect(screen.getByRole('img')).toBeTruthy();
});

it('inversão rotaciona somente a imagem e não altera asset ou legenda', () => {
  render(<StudyStep step={study(17)} active onNext={() => {}} />);
  const image = screen.getByRole('img');
  const src = image.getAttribute('src');
  fireEvent.click(screen.getByRole('button', { name: 'Inverter para observar' }));
  expect(image.style.transform).toBe('rotate(180deg)');
  expect(image.getAttribute('src')).toBe(src);
  expect(screen.getByRole('button', { name: 'Ampliar carta' }).style.transform).toBe('');
  fireEvent.click(screen.getByRole('button', { name: 'Voltar à posição normal' }));
  expect(image.style.transform).toBe('');
});

it('percurso sequencial reconhece quatro caminhos; reinício limpa respostas e registro da sessão', async () => {
  const fetch = vi.fn(async (url: string, options: RequestInit) => {
    const id = url.split('/steps/')[1].split('/')[0] as keyof typeof document.assessments;
    const key = document.assessments[id];
    const body = JSON.parse(String(options.body));
    expect(body.contentVersion).toBe(4);
    const result = 'items' in key ? {
      correct: false, items: body.assignments.map((item: {itemId: string; categoryId: string}) => {
        const entries: Record<string, {expectedCategoryId: string; feedback: Record<string, string>}> = key.items;
        const entry = entries[item.itemId];
        return {itemId: item.itemId, selectedCategoryId: item.categoryId, expectedCategoryId: entry.expectedCategoryId, correct: false, feedback: Object.values(entry.feedback)[0]};
      }),
    } : {correct: false, selectedOptionFeedback: Object.values(key.feedback)[0], expectedOptionId: key.expectedOptionId, explanation: key.explanation};
    return {ok: true, status: 200, json: async () => result} as Response;
  });
  vi.stubGlobal('fetch', fetch);
  render(<LessonPlayer lesson={lesson} />);
  for (const step of lesson.steps) {
    const pathIndex = lesson.paths.findIndex(path => path.stepIds.includes(step.id));
    const path = lesson.paths[pathIndex];
    const boundary = path.stepIds.at(-1) === step.id ? lesson.paths[pathIndex + 1] : undefined;
    const next = boundary ? `Continuar para ${boundary.title}` : 'Continuar';
    if (step.type === 'single-choice' || step.type === 'classification') {
      for (const fieldset of screen.getAllByRole('group').filter(el => el.tagName === 'FIELDSET')) {
        fireEvent.click(within(fieldset).getAllByRole('radio')[0]);
      }
      fireEvent.click(screen.getByRole('button', {name: 'Conferir'}));
      fireEvent.click(await screen.findByRole('button', {name: next}));
    } else {
      const label = step.type === 'explanation' ? step.cta : step.type === 'observation' ? 'Prefiro continuar observando'
        : step.type === 'exploration' ? 'Continuar investigando' : boundary ? next : step.cta;
      fireEvent.click(screen.getByRole('button', {name: label}));
    }
  }
  expect(screen.getByText('Você percorreu os quatro caminhos de O Louco.')).toBeTruthy();
  expect(fetch).toHaveBeenCalledTimes(7);
  fireEvent.click(screen.getByRole('button', {name: 'Voltar à ficha'}));
  expect(screen.getByRole('heading', {name: 'Sua ficha de O Louco'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button', {name: 'Encerrar a aula'}));
  fireEvent.click(screen.getByRole('button', {name: 'Revisitar a aula'}));
  fireEvent.click(screen.getByRole('button', {name: 'Abrir mapa das etapas'}));
  fireEvent.click(window.document.querySelectorAll<HTMLButtonElement>('.lesson-step-button')[19]);
  fireEvent.click(screen.getByRole('button', {name: 'Encerrar a aula'}));
  expect(screen.getByText('Você chegou ao encerramento. Ainda há etapas que você pode explorar pelo mapa.')).toBeTruthy();
});
