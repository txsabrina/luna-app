import type { ReactNode } from 'react';
import './content-shell.css';
type NavigationIcon = 'home' | 'trails' | 'library' | 'space';

function NavigationIcon({ kind }: { kind: NavigationIcon }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === 'home' && <path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10" />}
    {kind === 'trails' && <><path d="M5 18c-5-8 16 2 12-12M7 5l3 3-3 3-3-3Z" /><circle cx="5" cy="19" r="2" /><circle cx="18" cy="4" r="2" /></>}
    {kind === 'library' && <path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" />}
    {kind === 'space' && <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2c0-6 16-6 16 0v2Z" /></>}
  </svg>;
}


function Star({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'content-star content-star-small' : 'content-star'} viewBox="0 0 20 24"
    aria-hidden="true" focusable="false"><path d="m10 0 2.5 9L20 12l-7.5 2.5L10 24l-2.5-9.5L0 12l7.5-3Z" fill="currentColor" /></svg>;
}


export function ContentShell({ children, preview = false, study = false }: { children: ReactNode; preview?: boolean; study?: boolean }) {
 return <div className={`content-shell ${preview ? 'local-preview' : 'content-api'}${study ? ' study-shell' : ''}`}>
 <div className="content-app">
 <a className="content-skip" href="#preview-content">Ir para o conteúdo</a>
       <header className="content-header">
        {study ? <a className="study-back" href="/modules/major-arcana">Arcanos Maiores</a> :
          <div className="content-stars"><Star small /><Star /></div>}
        <a className="content-brand" href={preview ? "/preview" : "/"} aria-label="Luna — Início">
          <svg className="content-moon" viewBox="0 0 48 56" aria-hidden="true" focusable="false">
            <path d="M38 3C4-7-9 46 26 53c9 2 17-2 21-9C9 57 8 7 38 3Z" fill="currentColor" />
          </svg>
          <span>LUNA</span>
        </a>
        <div className="content-stars content-stars-end"><Star /><Star small /></div>
      </header>
 <main className="lp-main" id="preview-content" tabIndex={-1}>{children}</main>
 {preview && <nav className="content-navigation" aria-label="Navegação da prévia visual">
 <a href="/preview"><NavigationIcon kind="home"/><span>Início</span></a>
 <a href="/preview/trilhas" aria-current="page"><NavigationIcon kind="trails"/><span>Trilhas</span></a>
 <span aria-disabled="true"><NavigationIcon kind="library"/><span>Biblioteca</span><small>Em preparação</small></span>
 <span aria-disabled="true"><NavigationIcon kind="space"/><span>Meu espaço</span><small>Em preparação</small></span>
 </nav>}
 </div></div>;
}
