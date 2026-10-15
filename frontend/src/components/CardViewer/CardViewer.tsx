import { useRef, useState } from 'react';

export function CardViewer({ src, alt }: { src: string; alt: string }) {
  const [missing, setMissing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <figure className="card-viewer">
      {missing ? <div className="asset-fallback" role="status">
        <p>A reprodução de O Louco ainda não está disponível.</p>
        <p>Você pode continuar com seu baralho físico Waite–Smith.</p>
        <p><strong>Descrição da imagem:</strong> {alt}</p>
      </div> : <>
        <img src={src} alt={alt} onError={() => setMissing(true)} />
        <button ref={trigger} type="button" onClick={() => dialog.current?.showModal()}>Ampliar carta</button>
        <dialog ref={dialog} aria-labelledby="card-dialog-title"
          onClose={() => trigger.current?.focus()}>
          <h2 id="card-dialog-title">O Louco — Waite–Smith</h2>
          <button type="button" autoFocus onClick={() => dialog.current?.close()}>Fechar ampliação</button>
          <img src={src} alt={alt} onError={() => { dialog.current?.close(); setMissing(true); }} />
        </dialog>
      </>}
      <figcaption>Observação da imagem · Waite–Smith. As associações da aula são interpretações contextualizadas.</figcaption>
    </figure>
  );
}
