import { PreviewImage, RemotePreviewLink } from './PreviewElements';
import { CardCatalogPage, CardPresentationPage } from './CardCatalogPage';
import { TarotPages } from './TarotPages';
import { ContentShell } from '../../components/ContentShell/ContentShell';
import { BoardHome } from './BoardHome';
import { previewTrails } from './data';
import './preview.css';

export type PreviewPath = '/preview' | '/preview/trilhas' | '/preview/taro' | '/preview/taro/cartas-e-fundamentos' | `/preview/taro/cartas-e-fundamentos/modulos/${string}` | `/preview/taro/cartas/${string}`;

export function PreviewPage({ path }: { path: PreviewPath }) {
  if (path === '/preview') return <BoardHome />;
  const tarotPage = path === '/preview/taro' || path === '/preview/taro/cartas-e-fundamentos';
  const catalogPrefix = '/preview/taro/cartas-e-fundamentos/modulos/';
  const cardPrefix = '/preview/taro/cartas/';
  const catalogPage = path.startsWith(catalogPrefix);
  const cardPage = path.startsWith(cardPrefix);
  return <ContentShell preview>

      {catalogPage ? <CardCatalogPage key={path} groupId={path.slice(catalogPrefix.length)} /> :
        cardPage ? <CardPresentationPage key={path} cardId={path.slice(cardPrefix.length)} /> : tarotPage ? <TarotPages modulesPage={path === '/preview/taro/cartas-e-fundamentos'} /> : <>
        <header className="lp-intro">
          <h1>Nossas trilhas de conhecimento</h1>
          <p>Escolha um caminho para explorar.</p>
        </header>
        <div className="lp-trail-grid">
          {previewTrails.map(trail => <article className="lp-trail-card" id={trail.id} key={trail.id}>
            <PreviewImage src={trail.asset} size={trail.imageSize} label={trail.name} />
            <h2>{trail.name}</h2>
            <p>{trail.description}</p>
            <p className="lp-count">{trail.plannedCourseCount} cursos planejados</p>
            <p className="lp-status">{trail.status}</p>
            {trail.coursesHref && <a className="lp-action lp-catalog-action" href={trail.coursesHref}>Explorar os cursos</a>}
            {trail.previewAvailable && <>
              <p className="lp-availability">Aula de O Louco disponível</p>
              <RemotePreviewLink />
            </>}
          </article>)}
        </div>
      </>}
      <p className="lp-disclaimer">Interface com dados locais em revisão. Cursos planejados não representam conteúdo concluído.</p>
  </ContentShell>;
}
