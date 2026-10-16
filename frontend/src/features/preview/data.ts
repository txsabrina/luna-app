export type PreviewTrail = {
  id: string;
  name: string;
  homeLabel: string;
  description: string;
  asset: string;
  imageSize: number;
  plannedCourseCount: number;
  status: 'Cursos em preparação' | 'Em preparação';
  previewAvailable: boolean;
};

export const remotePreview = {
  href: '/lessons/fool-first-step',
  title: 'Conhecer O Louco',
  description: 'Prévia disponível · 4 etapas',
  apiNotice: 'A prévia da aula precisa da API em execução.',
};

export const previewTrails: readonly PreviewTrail[] = [
  {
    id: 'tarot', name: 'Tarô', homeLabel: 'Tarô',
    description: 'Observe cartas, conecte símbolos e construa interpretações.',
    asset: '/assets/preview/tarot-medallion.png', imageSize: 1024,
    plannedCourseCount: 4, status: 'Cursos em preparação', previewAvailable: true,
  },
  {
    id: 'numerology', name: 'Numerologia', homeLabel: 'Numerologia',
    description: 'Explore números e métodos simbólicos passo a passo.',
    asset: '/assets/preview/numerology-medallion.png', imageSize: 1024,
    plannedCourseCount: 6, status: 'Em preparação', previewAvailable: false,
  },
  {
    id: 'patterns', name: 'Padrões e autoconhecimento', homeLabel: 'Padrões',
    description: 'Investigue hábitos e interpretações em atividades educativas.',
    asset: '/assets/preview/patterns-medallion.png', imageSize: 768,
    plannedCourseCount: 14, status: 'Em preparação', previewAvailable: false,
  },
];
