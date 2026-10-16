import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../../App';
import { groupHref, cardHref, modulesHref } from './cardSelectors';

function open(path: string) {
  window.history.replaceState({}, '', path);
  return render(<App />);
}
afterEach(() => {
  cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});

describe('Catálogo local', () => {
  it.each(['major-arcana', 'wands', 'cups', 'swords', 'pentacles'] as const)('abre grupo %s sem API e com miniaturas lazy', group => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const { container } = open(groupHref(group));
    expect(fetch).not.toHaveBeenCalled();
    const total = group === 'major-arcana' ? 22 : 14;
    expect(container.querySelectorAll('.lp-card-results li')).toHaveLength(total);
    expect(Array.from(container.querySelectorAll('img')).every(image => image.getAttribute('loading') === 'lazy')).toBe(true);
    expect(screen.getByRole('link', { name: 'Voltar aos módulos' }).getAttribute('href')).toBe(modulesHref);
    expect(within(screen.getByRole('navigation')).getByRole('link', { name: 'Trilhas' }).getAttribute('aria-current')).toBe('page');
  });
  it('alterna visualização, busca e limpa estado vazio com retorno de foco', () => {
    const { container } = open(groupHref('major-arcana'));
    fireEvent.click(screen.getByRole('button', { name: 'Lista' }));
    expect(screen.getByRole('button', { name: 'Lista' }).getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.lp-card-results--list')).toBeTruthy();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'A FORCA' } });
    expect(screen.getByRole('heading', { name: 'A Força' })).toBeTruthy();
    expect(screen.getByText('1 resultados de 22 cartas')).toBeTruthy();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'inexistente' } });
    expect(screen.getByText('Nenhuma carta encontrada.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
    expect(container.querySelectorAll('.lp-card-results li')).toHaveLength(22);
    fireEvent.click(screen.getByRole('button', { name: 'Grade' }));
    expect(container.querySelector('.lp-card-results--grid')).toBeTruthy();
  });
  it.each([groupHref('wands') + 'bad', cardHref('missing')])('mostra não encontrado em %s', path => {
    open(path);
    expect(screen.getByRole('heading', { name: 'Não encontrado' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voltar aos módulos' }).getAttribute('href')).toBe(modulesHref);
  });
  it('mantém nome e destino quando imagem falha', () => {
    const { container } = open(groupHref('cups'));
    fireEvent.error(container.querySelector('img')!);
    expect(screen.getByText('Imagem de Ás de Copas indisponível.')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ás de Copas/ }).getAttribute('href')).toBe(cardHref('cups-ace'));
  });
  it.each(['major-00-fool', 'cups-ace'])('apresenta %s sem API e com disponibilidade precisa', id => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    open(cardHref(id));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText('Baralho autoral do Luna, inspirado no Waite–Smith.')).toBeTruthy();
    if (id === 'major-00-fool') {
      expect(screen.getByRole('link', { name: 'Abrir prévia da aula' }).getAttribute('href')).toBe('/lessons/fool-first-step');
      expect(screen.getByText('A prévia da aula precisa da API em execução.')).toBeTruthy();
    } else {
      expect(screen.queryByRole('link', { name: 'Abrir prévia da aula' })).toBeNull();
      expect(screen.getByText(/A aula desta carta está em preparação/)).toBeTruthy();
    }
  });
  it('amplia e fecha pelo botão e cancelamento, devolvendo foco (API de dialog simulada)', () => {
    const { container } = open(cardHref('cups-ace'));
    const dialog = container.querySelector('dialog')!;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => { dialog.removeAttribute('open'); dialog.dispatchEvent(new Event('close')); });
    const trigger = screen.getByRole('button', { name: 'Ampliar carta' });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Ás de Copas' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar ampliação' }));
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
