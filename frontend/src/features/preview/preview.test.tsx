import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../../App';
import userEvent from '@testing-library/user-event';

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
    expect(screen.getByRole('main')).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText('Carregando as trilhas…')).toBeNull();
    expect(screen.getByRole('link', { name: path === '/preview' ? 'Conhecer O Louco' : 'Explorar a aula' }).getAttribute('href'))
      .toBe('/lessons/fool-first-step');
    expect(screen.getByText('A aula precisa da API em execução.')).toBeTruthy();
  });

  it('home segue a tela 04 com os assets aprovados e estados verdadeiros', () => {
    const { container } = open('/preview');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Uma descoberta de cada vez.');
    expect(screen.getByText('Aula disponível')).toBeTruthy();
    const sources = Array.from(container.querySelectorAll('img')).map(image => image.getAttribute('src'));
    expect(sources[0]).toBe('/assets/lume/lume-home-approved.png');
    expect(sources[1]).toBe('/assets/tarot/optimized/major-00-fool-320.webp');
    for (const name of ['tarot', 'numerology', 'patterns']) {
      expect(sources.filter(src => src === `/assets/preview/${name}-medallion.png`)).toHaveLength(1);
      expect(container.querySelector(`.bh-destinations img[src="/assets/destinations/${name}-approved.png"]`)).toBeTruthy();
      expect(container.querySelector(`.bh-trails img[src="/assets/preview/${name}-medallion.png"]`)).toBeTruthy();
    }
    expect(screen.queryByText(/Retomar|Exemplo|conquistas/i)).toBeNull();
    expect(screen.getByRole('link', { name: 'Tarô' }).getAttribute('href')).toBe('/preview/taro');
    expect(screen.getByRole('link', { name: 'Padrões' }).getAttribute('href'))
      .toBe('/preview/trilhas#patterns');
    expect(screen.queryByText('Lume, sua companheira de estudos.')).toBeNull();
    const main = screen.getByRole('main');
    const greeting = screen.getByRole('region', { name: 'Mensagem da Lume' });
    const activity = screen.getByRole('region', { name: 'Aula de O Louco' });
    const trails = screen.getByRole('navigation', { name: 'Trilhas de conhecimento' });
    const destinations = screen.getByRole('region', { name: 'Destinações' });
    expect([...main.children]).toEqual([greeting, activity, trails, destinations]);
    expect(within(destinations).getAllByText('Planejamento')).toHaveLength(3);
    for (const count of [4, 6, 14]) expect(within(destinations).getByText(`${count} cursos`)).toBeTruthy();
    expect(within(destinations).getAllByRole('link')).toHaveLength(1);
    expect(within(destinations).getByRole('group', { name: /Numerologia: 6 cursos planejados, em preparação/ })).toBeTruthy();
    expect(within(destinations).getByRole('group', { name: /Padrões: 14 cursos planejados, em preparação/ })).toBeTruthy();
    expect(within(destinations).getByRole('link', { name: /Tarô: 4 cursos planejados/ }).getAttribute('href')).toBe('/preview/taro');
    expect(screen.queryByRole('button', { name: /notifica/i })).toBeNull();
  });

  it('trilhas distinguem planejamento e disponibilidade somente da prévia', () => {
    open('/preview/trilhas');
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
    expect(within(cards[2]).getByRole('heading', { name: 'Padrões e autoconhecimento' })).toBeTruthy();
    for (const count of [4, 6, 14]) expect(screen.getByText(`${count} cursos planejados`)).toBeTruthy();
    expect(within(cards[0]).getByText('Cursos em preparação')).toBeTruthy();
    expect(within(cards[0]).getByText('Aula de O Louco disponível')).toBeTruthy();
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
    const nextNav = screen.getByRole('navigation', { name: 'Navegação da prévia visual' });
    expect(within(nextNav).getByRole('link', { name: 'Trilhas' }).getAttribute('aria-current')).toBe('page');
    expect(within(nextNav).getByRole('link', { name: 'Início' }).getAttribute('href')).toBe('/preview');
    expect(within(nextNav).queryByRole('link', { name: /Biblioteca|Meu espaço/ })).toBeNull();
    expect(within(nextNav).getAllByText('Em preparação')).toHaveLength(2);
  });

  it('falha de ilustração mantém fallback e ações', () => {
    const { container } = open('/preview');
    for (const image of container.querySelectorAll('img')) fireEvent.error(image);
    expect(screen.getByText('Ilustração de Lume indisponível.')).toBeTruthy();
    expect(screen.getByText('Imagem de O Louco indisponível.')).toBeTruthy();
    expect(screen.getAllByRole('status')).toHaveLength(8);
    expect(screen.getByRole('link', { name: 'Conhecer O Louco' }).getAttribute('href')).toBe('/lessons/fool-first-step');
    expect(screen.getByRole('heading', { name: 'Destinações' })).toBeTruthy();
  });

  it('oferece acesso por teclado e navegação sem ações vazias', async () => {
    open('/preview');
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Ir para o conteúdo' }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Luna — Início' }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Conhecer O Louco' }));
    expect(document.activeElement?.getAttribute('aria-describedby')).toBe('home-api-note');
    const nav = screen.getByRole('navigation', { name: 'Navegação da prévia visual' });
    expect(within(nav).getAllByRole('link')).toHaveLength(2);
    expect(within(nav).getAllByText('Em preparação')).toHaveLength(2);
    expect(nav.querySelectorAll('[aria-disabled="true"]')).toHaveLength(2);
    expect(nav.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(4);
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });

  it.each(['/preview/trilhas', '/preview/taro', '/preview/taro/cartas-e-fundamentos',
    '/preview/taro/cartas-e-fundamentos/modulos/major-arcana', '/preview/taro/cartas/major-00-fool'])(
    'usa o shell compartilhado em %s', path => {
      const { container } = open(path);
      expect(container.querySelector('.board-home')).toBeNull();
      expect(container.querySelector('.content-shell')).toBeTruthy();
      expect(screen.getByRole('navigation', { name: 'Navegação da prévia visual' })).toBeTruthy();
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


describe('Navegação remota no shell compartilhado', () => {
  it.each([
    ['courses', 'tarot-cards-foundations', 'Cartas e fundamentos', 'major-arcana', 'Arcanos Maiores', 'modules'],
    ['modules', 'major-arcana', 'Arcanos Maiores', 'fool-first-step', 'O Louco', 'lessons'],
  ])('preserva dados e destino de %s', async (section, id, title, childId, childTitle, next) => {
    const fetch = vi.fn().mockResolvedValue({ok:true, json:async()=>({id,title,status:'PREVIEW',parentId:'tarot',children:[{id:childId,title:childTitle,status:'PREVIEW'}]})});
    vi.stubGlobal('fetch',fetch);
    const {container}=open('/'+section+'/'+id);
    expect(screen.getByRole('status').textContent).toContain('Carregando');
    expect(await screen.findByRole('heading',{name:title,level:1})).toBeTruthy();
    expect(screen.getByRole('link',{name:childTitle}).getAttribute('href')).toBe('/'+next+'/'+childId);
    expect(fetch).toHaveBeenCalledWith('/api/v1/'+section+'/'+id,expect.objectContaining({method:'GET'}));
    expect(container.querySelector('.content-shell')).toBeTruthy();
    expect(container.querySelector('.content-navigation')).toBeNull();
    const quiet=screen.getByRole('checkbox');
    await userEvent.click(quiet);
    expect(quiet).toHaveProperty('checked',true);
  });
  it('mantém erro e recuperação remotos sem dados simulados',async()=>{
    const fetch=vi.fn().mockRejectedValue(new Error('API indisponível'));
    vi.stubGlobal('fetch',fetch);
    const {container}=open('/courses/tarot-cards-foundations');
    expect((await screen.findByRole('alert')).textContent).toContain('API indisponível');
    await userEvent.click(screen.getByRole('button',{name:'Tentar novamente'}));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(container.querySelector('.content-shell')).toBeTruthy();
  });
});
