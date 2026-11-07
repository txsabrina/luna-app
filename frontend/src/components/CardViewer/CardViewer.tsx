import { useRef, useState } from 'react';
import { cardImageMetadata } from '../../features/preview/cardImageMetadata';

export function CardViewer({ cardId, alt, inverted = false }: { cardId: 'major-00-fool'; alt: string; inverted?: boolean }) {
  const image = cardImageMetadata[cardId];
  const fallback = image.variants[0];
  const enlarged = image.variants[image.variants.length - 1];
  const srcSet = image.variants.map(variant => `${variant.src} ${variant.width}w`).join(', ');
  const [open, setOpen] = useState(false);
  const [missing, setMissing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <figure className="card-viewer">
      {missing ? <div className="asset-fallback" role="status">
        <p>A imagem de O Louco está indisponível.</p>
        <p>Você pode continuar com seu baralho físico Waite–Smith.</p>
        <p><strong>Descrição da imagem:</strong> {alt}</p>
      </div> : <>
        <img src={fallback.src} srcSet={srcSet} sizes="(max-width: 380px) 80vw, 280px"
          width={image.width} height={image.height} alt={alt} style={inverted ? { transform: 'rotate(180deg)' } : undefined} onError={() => setMissing(true)} />
        <button ref={trigger} type="button" onClick={() => { setOpen(true); dialog.current?.showModal(); }}>Ampliar carta</button>
        <dialog ref={dialog} aria-labelledby="card-dialog-title"
          onClose={() => { setOpen(false); trigger.current?.focus(); }}>
          <h2 id="card-dialog-title">O Louco — baralho autoral do Luna</h2>
          <button type="button" autoFocus onClick={() => dialog.current?.close()}>Fechar ampliação</button>
          {open && <img src={enlarged.src} srcSet={srcSet} sizes="(max-width: 640px) 80vw, 580px"
            width={image.width} height={image.height} alt={alt} style={inverted ? { transform: 'rotate(180deg)' } : undefined}
                        onError={() => {
              dialog.current?.close();
              setMissing(true);
            }} />}
        </dialog>
      </>}
      <figcaption>Baralho autoral do Luna, inspirado no Waite–Smith. As associações da aula são interpretações contextualizadas.</figcaption>
    </figure>
  );
}
