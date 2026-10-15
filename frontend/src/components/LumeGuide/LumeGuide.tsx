import { useState } from 'react';
import type { Lume } from '../../features/learning/contracts';

export function LumeGuide({ guide }: { guide: Lume }) {
  const [available, setAvailable] = useState(true);
  return (
    <aside className="lesson-guide" aria-label="Mensagem da Lume">
      {available && <img src="/assets/lume.png" alt="Lume, companheira de estudos"
        onError={() => setAvailable(false)} />}
      <div><p className="guide-name">Lume</p><p>{guide.message}</p></div>
    </aside>
  );
}
