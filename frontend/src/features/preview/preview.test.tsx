import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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

describe('Preview local isolada', () => {
  it.each(['/preview', '/preview/trilhas'])('abre %s sem chamar API', path => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    open(path);
    expect(screen.getByText('Prévia visual')).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText('Carregando as trilhas…')).toBeNull();
    expect(screen.getByRole('link', { name: 'Explorar a prévia' }).getAttribute('href'))
      .toBe('/lessons/fool-first-step');
    expect(screen.getByText('A prévia da aula precisa da API em execução.')).toBeTruthy();
  });

  it('home usa os quatro assets e mostra quatro etapas sem progresso fictício', () => {
    const { container } = open('/preview');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Uma descoberta de cada vez.');
    expect(screen.getByText('Prévia disponível · 4 etapas')).toBeTruthy();
    const sources = Array.from(container.querySelectorAll('img')).map(image => image.getAttribute('src'));
    expect(sources).toEqual([
      '/assets/preview/lume-welcome.png', '/assets/preview/tarot-medallion.png',
      '/assets/preview/numerology-medallion.png', '/assets/preview/patterns-medallion.png',
    ]);
    expect(screen.queryByText('Retomar')).toBeNull();
    expect(screen.getByRole('link', { name: 'Tarô' }).getAttribute('href')).toBe('/preview/trilhas#tarot');
    expect(screen.getByRole('link', { name: 'Padrões' }).getAttribute('href'))
      .toBe('/preview/trilhas#patterns');
    expect(screen.queryByText('Lume, sua companheira de estudos.')).toBeNull();
    expect(screen.getByText('Vamos observar antes de decorar?')).toBeTruthy();
  });

  it('trilhas distinguem planejamento e disponibilidade somente da prévia', () => {
    open('/preview/trilhas');
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
    expect(within(cards[2]).getByRole('heading', { name: 'Padrões e autoconhecimento' })).toBeTruthy();
    for (const count of [4, 6, 14]) expect(screen.getByText(`${count} cursos planejados`)).toBeTruthy();
    expect(within(cards[0]).getByText('Cursos em preparação')).toBeTruthy();
    expect(within(cards[0]).getByText('Prévia de O Louco disponível')).toBeTruthy();
    for (const card of cards.slice(1)) {
      expect(within(card).getByText('Em preparação')).toBeTruthy();
      expect(within(card).queryByRole('link')).toBeNull();
    }
  });

  it('links entre Início e Trilhas correspondem às rotas e indicam página ativa', () => {
    const home = open('/preview');
    const nav = screen.getByRole('navigation', { name: 'Navegação da prévia visual' });
    expect(within(nav).getByRole('link', { name: 'Início' }).getAttribute('aria-current')).toBe('page');
    const destination = within(nav).getByRole('link', { name: 'Trilhas' }).getAttribute('href');
    home.unmount();
    open(destination!);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Nossas trilhas de conhecimento');
    const nextNav = screen.getByRole('navigation');
    expect(within(nextNav).getByRole('link', { name: 'Trilhas' }).getAttribute('aria-current')).toBe('page');
    expect(within(nextNav).getByRole('link', { name: 'Início' }).getAttribute('href')).toBe('/preview');
    expect(within(nextNav).queryByRole('link', { name: /Biblioteca|Meu espaço/ })).toBeNull();
    expect(within(nextNav).getAllByText('Em preparação')).toHaveLength(2);
  });

  it('falha de ilustração mantém fallback e ações', () => {
    const { container } = open('/preview');
    fireEvent.error(container.querySelector('img')!);
    expect(screen.getByRole('status').textContent).toBe('Ilustração de Lume indisponível.');
    expect(screen.getByRole('link', { name: 'Explorar a prévia' })).toBeTruthy();
  });

  it('acesso remoto continua usando API e mostra erro sem simulação', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('API indisponível'));
    vi.stubGlobal('fetch', fetch);
    open('/lessons/fool-first-step');
    expect((await screen.findByRole('alert')).textContent).toContain('API indisponível');
    expect(fetch).toHaveBeenCalledWith('/api/v1/lessons/fool-first-step', expect.anything());
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeTruthy();
    expect(screen.queryByText('Prévia visual')).toBeNull();
  });
});
