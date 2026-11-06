import { StrictMode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonPlayer } from './LessonPlayer';
import type { Lesson } from './contracts';
import lessonDocument from '../../../../backend/src/main/resources/content/tarot/fool-first-step.v1.json';

const lesson = lessonDocument.lesson as Lesson;
const scroll = vi.fn();
let originalScroll: PropertyDescriptor | undefined;
beforeEach(() => {
  originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll });
  scroll.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
});
async function selectStep(position: number) {
  await userEvent.click(screen.getByRole('button', { name: 'Abrir mapa das etapas' }));
  const map = document.getElementById(screen.getByRole('button', { name: 'Fechar mapa das etapas' }).getAttribute('aria-controls')!)!;
  await userEvent.click(within(map).getAllByRole('button')[position]);
}
it('não foca nem rola na montagem inicial, mesmo em StrictMode; mapa começa fechado', async () => {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus');
  render(<StrictMode><LessonPlayer lesson={lesson} /></StrictMode>);
  expect(focus).not.toHaveBeenCalled();
  expect(scroll).not.toHaveBeenCalled();
  focus.mockRestore();
  expect(screen.getByText('Etapa 1 de 10 · Conhecer')).toBeTruthy();
  const toggle = screen.getByRole('button', { name: 'Abrir mapa das etapas' });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByRole('navigation')).toBeNull();
  toggle.focus();
  await userEvent.keyboard('{Enter}');
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  const map = document.getElementById(toggle.getAttribute('aria-controls')!)!;
  expect(map.hidden).toBe(false);
  expect(within(map).getAllByRole('button')).toHaveLength(10);
  expect(within(map).getAllByRole('button')[0].getAttribute('aria-current')).toBe('step');
  expect(screen.getByText('Etapa atual')).toBeTruthy();
  await userEvent.keyboard(' ');
  expect(map.hidden).toBe(true);
  expect(scroll).not.toHaveBeenCalled();
});
it('salta livremente, fecha mapa e foca/rola o título atualizado; repetir etapa também retorna', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  render(<LessonPlayer lesson={lesson} />);
  await selectStep(7);
  const title = screen.getByRole('heading', { name: lesson.steps[7].title });
  expect(document.activeElement).toBe(title);
  expect(screen.getByText('Etapa 8 de 10 · Investigar')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Abrir mapa das etapas' }).getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(scroll).toHaveBeenLastCalledWith({ behavior: 'instant', block: 'start' });
  expect(scroll.mock.instances.at(-1)).toBe(title);
  await userEvent.click(screen.getByRole('button', { name: 'Abrir mapa das etapas' }));
  const buttons = document.querySelectorAll<HTMLButtonElement>('.lesson-step-button');
  expect(buttons[7].getAttribute('aria-current')).toBe('step');
  expect([...buttons].filter(button => button.hasAttribute('aria-current'))).toHaveLength(1);
  const calls = scroll.mock.calls.length;
  buttons[7].focus();
  await userEvent.keyboard('{Enter}');
  expect(scroll).toHaveBeenCalledTimes(calls + 1);
  expect(document.activeElement).toBe(title);
  await selectStep(3);
  expect(screen.getByText('Etapa 4 de 10 · Conhecer')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
  await selectStep(0);
  expect(screen.queryByRole('heading', { name: 'Prévia concluída' })).toBeNull();
});
it('preserva escolhas e cancela avaliação ao sair pelo mapa sem aplicar resposta obsoleta', async () => {
  let resolve!: (value: Response) => void;
  const fetch = vi.fn<(url: string, options: RequestInit) => Promise<Response>>(() => new Promise<Response>(done => { resolve = done; }));
  vi.stubGlobal('fetch', fetch);
  render(<LessonPlayer lesson={lesson} />);
  await selectStep(3);
  const quiz = lesson.steps[3];
  if (quiz.type !== 'single-choice') throw new Error('Expected single-choice fixture');
  await userEvent.click(screen.getByRole('radio', { name: quiz.options[0].label }));
  await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
  const signal = fetch.mock.calls[0][1].signal!;
  await selectStep(4);
  expect(signal.aborted).toBe(true);
  await act(async () => resolve({ ok: true, status: 200, json: async () => ({ correct: false,
    selectedOptionFeedback: 'Resposta obsoleta', expectedOptionId: 'small-experiment', explanation: 'Contexto.' }) } as Response));
  await selectStep(3);
  expect(screen.getByRole('radio', { name: quiz.options[0].label })).toHaveProperty('checked', true);
  expect(screen.queryByText('Resposta obsoleta')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Conferir' })).toHaveProperty('disabled', false);
});
