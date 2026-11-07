import { useState } from 'react';
import type { Lume } from '../../features/learning/contracts';

export function LumeGuide({ guide, imageSrc = '/assets/lume/lume-guide-side.png' }: { guide: Lume; imageSrc?: string }) {
  const [available, setAvailable] = useState(true);
  return (
    <aside className="lesson-guide" aria-label="Mensagem da Lume">
      {available && <span className="guide-portrait"><img src={imageSrc} alt="Lume, companheira de estudos"
        onError={() => setAvailable(false)} /></span>}
      <div><p className="guide-name">Lume</p><p>{guide.message}</p></div>
    </aside>
  );
}
