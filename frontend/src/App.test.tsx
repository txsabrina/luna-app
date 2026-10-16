import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const trails = [
  { id: 'tarot', title: 'Tarô', description: 'Imagens e símbolos.', plannedCourseCount: 4, status: 'PLANNED' },
  { id: 'numerology', title: 'Numerologia', description: 'Números e tradições.', plannedCourseCount: 6, status: 'PLANNED' },
  { id: 'patterns', title: 'Padrões e autoconhecimento', description: 'Hábitos e interpretações.', plannedCourseCount: 14, status: 'PLANNED' },
];
function response(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data } as Response;
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Home como entrada de aprendizagem', () => {
  it('oferece a rota real da prévia sem disponibilizar toda a trilha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(trails)));
    render(<App />);
    const action = await screen.findByRole('link', { name: 'Conhecer O Louco' });
    expect(action.getAttribute('href')).toBe('/lessons/fool-first-step');
    expect(action.getAttribute('aria-describedby')).toBe('fool-preview-description');
    expect(screen.getByText('Prévia disponível · 4 etapas')).toBeTruthy();
    expect(screen.getAllByText('Em planejamento')).toHaveLength(3);
    expect(screen.queryByText('Disponível', { exact: true })).toBeNull();
    const cards = screen.getAllByRole('article');
    for (const card of cards.slice(1)) {
      expect(within(card).getByText('Cursos em preparação')).toBeTruthy();
      expect(within(card).queryByRole('link')).toBeNull();
    }
    expect(screen.getByText(/Nosso primeiro encontro é com O Louco/)).toBeTruthy();
  });

  it('preserva o status retornado pela API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([
      { ...trails[0], status: 'IN_PROGRESS' }, ...trails.slice(1),
    ])));
    render(<App />);
    expect(await screen.findByText('Em produção')).toBeTruthy();
    expect(screen.getAllByText('Em planejamento')).toHaveLength(2);
  });

  it('mantém loading acessível sem mostrar um catálogo simulado', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    render(<App />);
    expect(screen.getByRole('status').textContent).toContain('Carregando as trilhas');
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Conhecer O Louco' })).toBeNull();
  });

  it('mantém erro e retry sem substituir a API por dados fictícios', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(response({}, 503))
      .mockResolvedValueOnce(response(trails));
    vi.stubGlobal('fetch', fetch);
    render(<App />);
    expect((await screen.findByRole('alert')).textContent).toContain('HTTP 503');
    expect(screen.queryByRole('article')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('link', { name: 'Conhecer O Louco' })).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('permite ativar e desativar modo tranquilo com teclado, somente na sessão', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(trails)));
    const user = userEvent.setup();
    const { container, unmount } = render(<App />);
    const checkbox = screen.getByRole('checkbox', { name: /Modo tranquilo: sem animações/ });
    expect(checkbox).toHaveProperty('checked', false);
    checkbox.focus();
    await user.keyboard(' ');
    expect(checkbox).toHaveProperty('checked', true);
    expect(container.querySelector('.universe.quiet')).not.toBeNull();
    expect(screen.getByText('Ativado nesta sessão')).toBeTruthy();
    await user.keyboard(' ');
    expect(checkbox).toHaveProperty('checked', false);
    await user.keyboard(' ');
    unmount();
    render(<App />);
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', false);
  });

  it('preserva o convite e o fallback quando o retrato não carrega', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    render(<App />);
    fireEvent.error(screen.getByRole('img', { name: 'Lume, a bruxinha companheira de estudos' }));
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Retrato da personagem ainda não adicionado.')).toBeTruthy();
    expect(screen.getByText(/Nosso primeiro encontro é com O Louco/)).toBeTruthy();
  });
});
