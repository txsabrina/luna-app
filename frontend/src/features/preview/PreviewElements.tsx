import { useState } from 'react';
import { remotePreview } from './data';

export function PreviewImage({ src, size, label, className = '' }: {
  src: string; size: number; label: string; className?: string;
}) {
  const [missing, setMissing] = useState(false);
  return <div className={`lp-image ${className}`}>
    {missing ? <p role="status">Ilustração de {label} indisponível.</p> :
      <img src={src} width={size} height={size} alt="" onError={() => setMissing(true)} />}
  </div>;
}

export function RemotePreviewLink({ label = 'Explorar a prévia' }: { label?: string }) {
  return <div className="lp-remote">
    <a className="lp-action" href={remotePreview.href}>{label}</a>
    <p className="lp-note">{remotePreview.apiNotice}</p>
  </div>;
}
