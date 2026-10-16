import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

function open(path: string) {
  window.history.replaceState({}, '', path);
  return render(<App />);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/');
});

describe('Cursos e módulos locais de Tarô', () => {
  it.each(['/preview/taro', '/preview/taro/cartas-e-fundamentos'])('abre diretamente %s sem API', path => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    open(path);
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText('Prévia visual')).toBeTruthy();
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('link', { name: 'Trilhas' }).getAttribute('aria-current')).toBe('page');
    expect(within(nav).getByRole('link', { name: 'Início' }).getAttribute('aria-current')).toBeNull();
  });

  it('apresenta quatro cursos, somente fundamentos com destino local', () => {
    open('/preview/taro');
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(4);
    for (const name of ['Cartas e fundamentos', 'Inversões', 'Combinações', 'Correspondências']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    }
    expect(within(cards[0]).getByText('Estrutura em exploração')).toBeTruthy();
    expect(within(cards[0]).getByText('Prévia de O Louco disponível')).toBeTruthy();
    expect(within(cards[0]).getByRole('link', { name: 'Ver módulos' }).getAttribute('href'))
      .toBe('/preview/taro/cartas-e-fundamentos');
    for (const card of cards.slice(1)) {
      expect(within(card).getByText('Em preparação')).toBeTruthy();
      expect(within(card).queryByRole('link')).toBeNull();
    }
    expect(screen.queryByText(/XP|%/)).toBeNull();
  });

  it('apresenta seis módulos e contagens de cartas, sem aulas fictícias', () => {
    open('/preview/taro/cartas-e-fundamentos');
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(6);
    for (const name of ['Primeiros passos', 'Arcanos Maiores', 'Paus', 'Copas', 'Espadas', 'Ouros']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    }
    expect(screen.getByText('22 cartas para explorar temas e experiências simbólicas.')).toBeTruthy();
    expect(screen.getAllByText(/^14 cartas:/)).toHaveLength(4);
    expect(within(cards[1]).getByText('Aulas em preparação')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Abrir prévia de O Louco' }).getAttribute('href'))
      .toBe('/lessons/fool-first-step');
    expect(screen.getByText('A prévia da aula precisa da API em execução.')).toBeTruthy();
    for (const card of cards.filter((_, index) => index !== 1)) {
      expect(within(card).queryByRole('link', { name: /prévia/ })).toBeNull();
      expect(within(card).getByText('Conteúdo em preparação')).toBeTruthy();
    }
    expect(within(cards[0]).queryByRole('link')).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Explorar cartas' })).toHaveLength(5);
    expect(screen.getByText(/não aulas implementadas/)).toBeTruthy();
    expect(screen.getByText(/não significados universais exclusivos/)).toBeTruthy();
  });

  it('liga Trilhas, cursos e módulos e oferece retornos explícitos', () => {
    let page = open('/preview/trilhas');
    const destination = screen.getByRole('link', { name: 'Explorar os cursos' }).getAttribute('href');
    expect(destination).toBe('/preview/taro');
    expect(screen.getByRole('link', { name: 'Explorar a prévia' }).getAttribute('href'))
      .toBe('/lessons/fool-first-step');
    page.unmount();
    page = open(destination!);
    expect(screen.getByRole('link', { name: 'Voltar às trilhas' }).getAttribute('href')).toBe('/preview/trilhas');
    const modules = screen.getByRole('link', { name: 'Ver módulos' }).getAttribute('href');
    page.unmount();
    open(modules!);
    expect(screen.getByRole('link', { name: 'Voltar aos cursos de Tarô' }).getAttribute('href')).toBe('/preview/taro');
  });

  it('mantém imagens, fallback e links acessíveis por teclado', async () => {
    const user = userEvent.setup();
    const { container } = open('/preview/taro');
    const images = container.querySelectorAll('img');
    expect(Array.from(images).map(image => image.getAttribute('src'))).toEqual([
      '/assets/preview/lume-welcome.png', '/assets/preview/tarot-medallion.png',
    ]);
    fireEvent.error(images[0]);
    expect(screen.getByRole('status').textContent).toContain('Lume indisponível');
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Ir para o conteúdo' }));
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Voltar às trilhas' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Ver módulos' }));
  });
});
