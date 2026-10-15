import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LearningPage } from './LearningPage';
import { LessonPlayer } from './LessonPlayer';
import { SingleChoiceStep } from './SingleChoiceStep';
import { CardViewer } from '../../components/CardViewer/CardViewer';
import { isLesson } from './contracts';
import type { Lesson, SingleChoice } from './contracts';

const quiz: SingleChoice = {
  id: '04-context', type: 'single-choice', title: 'Aplicação contextual',
  lume: { mood: 'curious', message: 'Compare as possibilidades.' },
  question: 'Qual reflexão se conecta melhor ao núcleo?',
  options: [
    { id: 'reference-first', label: 'Reunir referências.' },
    { id: 'small-experiment', label: 'Experimentar um desenho simples.' },
    { id: 'strict-routine', label: 'Definir rotina rigorosa.' },
    { id: 'complete-confidence', label: 'Esperar confiança completa.' },
  ],
};
const lesson: Lesson = {
  id: 'fool-first-step', contentVersion: 1, title: 'O Louco — o primeiro passo', status: 'PREVIEW',
  objectives: ['Observar antes de interpretar.'],
  steps: [
    { id: '01-opening', type: 'explanation', title: 'Abertura', lume: { mood: 'welcoming', message: 'Vamos observar.' }, paragraphs: ['Começar sem ter o mapa inteiro.'], cta: 'Vamos investigar' },
    { id: '02-observation', type: 'observation', title: 'Observação livre', lume: { mood: 'curious', message: 'Sem resposta correta.' }, imagePath: '/assets/tarot/waite-smith/fool.jpg', imageAlt: 'Figura próxima de uma borda.', options: [{ id: 'dog', label: 'Cachorro', feedback: 'Ele acompanha a figura perto dos pés. Guarde essa pista.' }] },
    { id: '03-core', type: 'explanation', title: 'Núcleo', lume: { mood: 'explaining', message: 'Abertura, começo e espontaneidade.' }, paragraphs: ['Isso não significa abandonar o planejamento.'], cta: 'Experimentar uma situação' },
    quiz,
  ],
};
function response(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data } as Response;
}
const result = { correct: false, selectedOptionFeedback: 'Preparação pode ajudar, mas prolongar a espera não é o foco.', expectedOptionId: 'small-experiment', explanation: 'Experimente sem exigir domínio antecipado.' };

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Carregamento e contrato', () => {
  it('exibe loading e sucesso', async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(done => { resolve = done; })));
    render(<LearningPage path="/lessons/fool-first-step" />);
    expect(screen.getByRole('status').textContent).toContain('Carregando');
    resolve(response(lesson));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveProperty('textContent', lesson.title);
  });
  it('mostra erro e permite retry', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('Sem conexão')).mockResolvedValueOnce(response(lesson));
    vi.stubGlobal('fetch', fetch);
    render(<LearningPage path="/lessons/fool-first-step" />);
    expect((await screen.findByRole('alert')).textContent).toContain('Sem conexão');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { level: 1 })).toHaveProperty('textContent', lesson.title);
  });
  it('rejeita conteúdo inválido e chave de avaliação no payload', () => {
    expect(isLesson(lesson)).toBe(true);
    expect(isLesson({ ...lesson, assessments: {} })).toBe(false);
    expect(isLesson({ ...lesson, steps: [...lesson.steps.slice(0, 3), { ...quiz, expectedOptionId: 'small-experiment' }] })).toBe(false);
    expect(isLesson({ ...lesson, steps: [] })).toBe(false);
  });
});

describe('Escolha contextual', () => {
  it('separa seleção de confirmação e mostra feedback e resposta esperada', async () => {
    const fetch = vi.fn().mockResolvedValue(response(result));
    const next = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<SingleChoiceStep lessonId={lesson.id} version={1} step={quiz} onNext={next} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Reunir referências.' }));
    expect(fetch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar alternativa' }));
    expect(await screen.findByText(result.selectedOptionFeedback)).toBeTruthy();
    expect(screen.getByText('Resposta esperada:')).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ contentVersion: 1, selectedOptionId: 'reference-first' });
    await userEvent.click(screen.getByRole('button', { name: 'Tentar outra alternativa' }));
    expect(screen.getByRole('radio', { name: 'Reunir referências.' })).toHaveProperty('disabled', false);
  });
  it('preserva seleção quando a avaliação falha', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('Falha de rede')).mockResolvedValueOnce(response({ ...result, correct: true }));
    vi.stubGlobal('fetch', fetch);
    render(<SingleChoiceStep lessonId={lesson.id} version={1} step={quiz} onNext={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Experimentar um desenho simples.' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar alternativa' }));
    expect(await screen.findByText(/Sua seleção foi preservada/)).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Experimentar um desenho simples.' })).toHaveProperty('checked', true);
    await userEvent.click(screen.getByRole('button', { name: 'Tentar avaliação novamente' }));
    expect(await screen.findByRole('heading', { name: 'Resposta esperada selecionada' })).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('não permite confirmações duplicadas durante a requisição', async () => {
    const fetch = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetch);
    render(<SingleChoiceStep lessonId={lesson.id} version={1} step={quiz} onNext={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Reunir referências.' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar alternativa' }));
    expect(screen.getByRole('button', { name: 'Avaliando…' })).toHaveProperty('disabled', true);
    // O fieldset desabilita os radios sem alterar a propriedade input.disabled.
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.matches(':disabled')).toBe(true);
    }
    await userEvent.click(screen.getByRole('radio', { name: 'Experimentar um desenho simples.' }));
    expect(screen.getByRole('radio', { name: 'Reunir referências.' })).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Experimentar um desenho simples.' })).toHaveProperty('checked', false);
    await userEvent.click(screen.getByRole('button', { name: 'Avaliando…' }));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('Caminho da prévia', () => {
  it('observação sem avaliação, anterior/próxima e conclusão apenas da prévia', async () => {
    const fetch = vi.fn().mockResolvedValue(response(result));
    vi.stubGlobal('fetch', fetch);
    render(<LessonPlayer lesson={lesson} />);
    await userEvent.click(screen.getByRole('button', { name: 'Vamos investigar' }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveProperty('disabled', true);
    await userEvent.click(screen.getByRole('radio', { name: 'Cachorro' }));
    expect(screen.getByRole('status').textContent).toContain('Guarde essa pista');
    expect(fetch).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(screen.getByRole('heading', { name: 'Observação livre' })).toBeTruthy();
    await userEvent.click(screen.getByRole('radio', { name: 'Cachorro' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Experimentar uma situação' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Reunir referências.' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar alternativa' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Concluir esta prévia' }));
    expect(screen.getByText('Você concluiu esta prévia. Os próximos caminhos estão em produção.')).toBeTruthy();
    expect(screen.getByText(/A aula completa não foi concluída/)).toBeTruthy();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });
  it('oferece baralho físico quando a carta está ausente', async () => {
    render(<CardViewer src="/assets/tarot/waite-smith/fool.jpg" alt="Uma figura e um cachorro." />);
    const image = screen.getByRole('img');
    image.dispatchEvent(new Event('error'));
    expect(await screen.findByText(/Você pode continuar com seu baralho físico/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ampliar carta' })).toBeNull();
  });
});
