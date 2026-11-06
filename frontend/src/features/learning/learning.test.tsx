import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LearningPage } from './LearningPage';
import { LessonPlayer } from './LessonPlayer';
import { SingleChoiceStep } from './SingleChoiceStep';
import { CardViewer } from '../../components/CardViewer/CardViewer';
import { isLesson } from './contracts';
import lessonDocument from '../../../../backend/src/main/resources/content/tarot/fool-first-step.v1.json';
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
  id: 'fool-first-step', contentVersion: 3, title: 'O Louco — o primeiro passo', status: 'PREVIEW',
  objectives: ['Observar antes de interpretar.'],
  steps: [
    { id: '01-opening', type: 'explanation', title: 'Abertura', lume: { mood: 'welcoming', message: 'Vamos observar.' }, paragraphs: ['Começar sem ter o mapa inteiro.'], cta: 'Vamos investigar' },
    { id: '02-observation', type: 'observation', title: 'Observação livre', lume: { mood: 'curious', message: 'Sem resposta correta.' }, cardId: 'major-00-fool', imageAlt: 'Figura próxima de uma borda.', options: [{ id: 'dog', label: 'Cachorro', feedback: 'Ele acompanha a figura perto dos pés. Guarde essa pista.' }] },
    { id: '03-core', type: 'explanation', title: 'Núcleo', lume: { mood: 'explaining', message: 'Abertura, começo e espontaneidade.' }, paragraphs: ['Isso não significa abandonar o planejamento.'], cta: 'Experimentar uma situação' },
    quiz,
    ...(lessonDocument.lesson.steps.slice(4) as Lesson['steps']),
  ],
};
function response(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data } as Response;
}
const result = { correct: false, selectedOptionFeedback: 'Preparação pode ajudar, mas prolongar a espera não é o foco.', expectedOptionId: 'small-experiment', explanation: 'Experimente sem exigir domínio antecipado.' };

beforeEach(() => {
  // jsdom has no layout/scrolling; verify the requested behavior in navigation tests.
  vi.stubGlobal('HTMLElement', HTMLElement);
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
});
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
    expect(isLesson({ ...lesson, steps: lesson.steps.map(step => step.id === quiz.id ? { ...quiz, expectedOptionId: 'small-experiment' } : step) })).toBe(false);
    expect(isLesson({ ...lesson, steps: [] })).toBe(false);
    expect(isLesson({ ...lesson, contentVersion: 1 })).toBe(false);
    expect(isLesson({ ...lesson, steps: lesson.steps.map(step => step.type === 'observation'
      ? { ...step, cardId: 'unknown' } : step) })).toBe(false);
  });
});

describe('Navegação da prévia', () => {
  it('liga a trilha de Tarô ao curso existente', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<LearningPage path="/trails/tarot" />);
    expect(screen.getByRole('link', { name: 'Cartas e fundamentos' })
      .getAttribute('href')).toBe('/courses/tarot-cards-foundations');
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    { section: 'courses', id: 'tarot-cards-foundations', title: 'Cartas e fundamentos',
      parentId: 'tarot', childId: 'major-arcana', childTitle: 'Arcanos Maiores', nextSection: 'modules' },
    { section: 'modules', id: 'major-arcana', title: 'Arcanos Maiores',
      parentId: 'tarot-cards-foundations', childId: lesson.id, childTitle: lesson.title, nextSection: 'lessons' },
  ])('carrega $section e oferece o próximo nível', async item => {
    const fetch = vi.fn().mockResolvedValue(response({
      id: item.id, title: item.title, status: 'PREVIEW', parentId: item.parentId,
      children: [{ id: item.childId, title: item.childTitle, status: 'PREVIEW' }],
    }));
    vi.stubGlobal('fetch', fetch);
    render(<LearningPage path={`/${item.section}/${item.id}`} />);
    expect(await screen.findByRole('heading', { level: 1, name: item.title })).toBeTruthy();
    expect(screen.getByRole('link', { name: item.childTitle }).getAttribute('href'))
      .toBe(`/${item.nextSection}/${item.childId}`);
    expect(fetch).toHaveBeenCalledWith(`/api/v1/${item.section}/${item.id}`, expect.objectContaining({ method: 'GET' }));
  });
});

describe('Escolha contextual', () => {
  it('separa seleção de confirmação e mostra feedback e resposta esperada', async () => {
    const fetch = vi.fn().mockResolvedValue(response(result));
    const next = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<SingleChoiceStep lessonId={lesson.id} version={3} step={quiz} onNext={next} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Reunir referências.' }));
    expect(fetch).not.toHaveBeenCalled();
            expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
    expect(await screen.findByText(result.selectedOptionFeedback)).toBeTruthy();
    expect(screen.getByText('Resposta esperada:')).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ contentVersion: 3, selectedOptionId: 'reference-first' });
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('radio', { name: 'Reunir referências.' })).toHaveProperty('disabled', false);
    expect(screen.queryByText(result.selectedOptionFeedback)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
    expect(next).not.toHaveBeenCalled();
  });
  it('preserva seleção quando a avaliação falha', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('Falha de rede')).mockResolvedValueOnce(response({ ...result, correct: true }));
    vi.stubGlobal('fetch', fetch);
    render(<SingleChoiceStep lessonId={lesson.id} version={3} step={quiz} onNext={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Experimentar um desenho simples.' }));
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
    expect(await screen.findByText(/Sua seleção foi preservada/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
    expect(screen.getByRole('radio', { name: 'Experimentar um desenho simples.' })).toHaveProperty('checked', true);
    await userEvent.click(screen.getByRole('button', { name: 'Tentar avaliação novamente' }));
    expect(await screen.findByRole('heading', { name: 'Resposta esperada selecionada' })).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('não permite confirmações duplicadas durante a requisição', async () => {
    const fetch = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetch);
    render(<SingleChoiceStep lessonId={lesson.id} version={3} step={quiz} onNext={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Reunir referências.' }));
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
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
        const fetch = vi.fn().mockImplementation(async (url: string) => response(url.endsWith('/classify')
      ? { correct: false, items: lessonDocument.lesson.steps[8].items!.map(item => ({ itemId: item.id,
        selectedCategoryId: 'observation', expectedCategoryId: 'interpretation', correct: false, feedback: 'Compare a relação de sentido.' })) }
      : url.includes('10-connection') ? { ...result, expectedOptionId: 'motion-edge' } : result));
    vi.stubGlobal('fetch', fetch);
    render(<LessonPlayer lesson={lesson} />);
    await userEvent.click(screen.getByRole('button', { name: 'Vamos investigar' }));
    expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Prefiro continuar observando' })).toHaveProperty('disabled', false);
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
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Continuar investigando' }));
    expect(screen.getByRole('button', { name: 'Conferir' })).toHaveProperty('disabled', true);
    for (const radio of screen.getAllByRole('radio', { name: 'Observação' })) await userEvent.click(radio);
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Rosa + trouxa.' }));
    await userEvent.click(screen.getByRole('button', { name: 'Conferir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Você percorreu Conhecer e Investigar. Os próximos caminhos estão em produção.')).toBeTruthy();
    expect(screen.getByText(/A aula completa ainda não foi concluída/)).toBeTruthy();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(screen.getByRole('link', { name: 'Voltar ao módulo' }).getAttribute('href'))
      .toBe('/modules/major-arcana');
    await userEvent.click(screen.getByRole('button', { name: 'Revisitar a prévia' }));
    expect(screen.getByRole('heading', { name: 'Abertura' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Abertura' })).toBe(document.activeElement);
    expect(screen.queryByRole('heading', { name: 'Prévia concluída' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Vamos investigar' }));
    expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Prefiro continuar observando' })).toHaveProperty('disabled', false);
    expect(screen.getByRole('radio', { name: 'Cachorro' })).toHaveProperty('checked', false);
        expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('avança sem seleção, sem resposta fictícia ou avaliação, e alinha identidade', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<LessonPlayer lesson={lesson} />);
    expect(screen.getByText('Prévia · 10 etapas')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Caminho 1 — Conhecer' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir mapa das etapas' }));
    expect(screen.getByRole('navigation', { name: 'Caminho 1 — Conhecer' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Caminho 2 — Investigar' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Lume, companheira de estudos' }).getAttribute('src'))
      .toBe('/assets/preview/lume-welcome.png');
    expect(screen.getByText('Baralho autoral do Luna, inspirado no Waite–Smith.')).toBeTruthy();
    expect(screen.queryByText(/Pamela Colman Smith/)).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Vamos investigar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Prefiro continuar observando' }));
    expect(screen.getByRole('heading', { name: 'Núcleo' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Etapa anterior' }));
    expect(screen.getByRole('radio', { name: 'Cachorro' })).toHaveProperty('checked', false);
    expect(screen.getByRole('status').textContent).toBe('');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('resolve variantes existentes e preserva ampliação e foco', async () => {
      render(<CardViewer cardId="major-00-fool" alt="Carta autoral de O Louco" />);
    const element = document.querySelector('dialog')!;
    const showModal = vi.fn(() => { element.setAttribute('open', ''); });
    const close = vi.fn(() => {
      element.removeAttribute('open');
      element.dispatchEvent(new Event('close'));
    });
    element.showModal = showModal;
    element.close = close;
          const thumbnail = screen.getByRole('img');
    expect(thumbnail.getAttribute('src')).toBe('/assets/tarot/optimized/major-00-fool-320.webp');
    expect(thumbnail.getAttribute('srcset')).toContain('major-00-fool-640.webp 640w');
    expect(thumbnail.getAttribute('srcset')).toContain('major-00-fool-777.webp 777w');
    expect(thumbnail.getAttribute('sizes')).toBeTruthy();
    expect(thumbnail.getAttribute('width')).toBe('777');
    expect(thumbnail.getAttribute('height')).toBe('1360');
    expect(screen.getAllByRole('img')).toHaveLength(1);
    const trigger = screen.getByRole('button', { name: 'Ampliar carta' });
    await userEvent.click(trigger);
    expect(showModal).toHaveBeenCalledTimes(1);
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe('/assets/tarot/optimized/major-00-fool-777.webp');
    await userEvent.click(screen.getByRole('button', { name: 'Fechar ampliação' }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger);
    expect(dialog.querySelector('img')).toBeNull();
      });
  it('oferece baralho físico quando a carta está ausente', async () => {
    render(<CardViewer cardId="major-00-fool" alt="Uma figura e um cachorro." />);
    const image = screen.getByRole('img');
    image.dispatchEvent(new Event('error'));
    expect(await screen.findByText(/Você pode continuar com seu baralho físico/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ampliar carta' })).toBeNull();
  });
});
