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
  coursesHref?: string;
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
    coursesHref: '/preview/taro',
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

export type PreviewCourse = {
  id: string;
  name: string;
  description: string;
  status: 'Estrutura em exploração' | 'Em preparação';
  modulesHref?: string;
  previewAvailable: boolean;
};

export type PreviewModule = {
  id: string;
  name: string;
  description: string;
  status: 'Conteúdo em preparação' | 'Aulas em preparação';
  cardCount?: number;
  previewAvailable: boolean;
};

export const tarotCourses: readonly PreviewCourse[] = [
  {
    id: 'tarot-cards-foundations', name: 'Cartas e fundamentos',
    description: 'Conheça o baralho, observe símbolos e construa interpretações.',
    status: 'Estrutura em exploração', previewAvailable: true,
    modulesHref: '/preview/taro/cartas-e-fundamentos',
  },
  {
    id: 'tarot-reversals', name: 'Inversões',
    description: 'Explore diferentes métodos para interpretar cartas invertidas.',
    status: 'Em preparação', previewAvailable: false,
  },
  {
    id: 'tarot-combinations', name: 'Combinações',
    description: 'Investigue como as cartas dialogam entre si.',
    status: 'Em preparação', previewAvailable: false,
  },
  {
    id: 'tarot-correspondences', name: 'Correspondências',
    description: 'Conheça associações astrológicas identificadas por tradição.',
    status: 'Em preparação', previewAvailable: false,
  },
];

export const foundationsModules: readonly PreviewModule[] = [
  {
    id: 'tarot-foundations', name: 'Primeiros passos',
    description: 'Estrutura do baralho, observação e perguntas de leitura.',
    status: 'Conteúdo em preparação', previewAvailable: false,
  },
  {
    id: 'major-arcana', name: 'Arcanos Maiores', cardCount: 22,
    description: 'para explorar temas e experiências simbólicas.',
    status: 'Aulas em preparação', previewAvailable: true,
  },
  {
    id: 'wands', name: 'Paus', cardCount: 14,
    description: 'ação, iniciativa e expressão.',
    status: 'Conteúdo em preparação', previewAvailable: false,
  },
  {
    id: 'cups', name: 'Copas', cardCount: 14,
    description: 'sentimentos, vínculos e imaginação.',
    status: 'Conteúdo em preparação', previewAvailable: false,
  },
  {
    id: 'swords', name: 'Espadas', cardCount: 14,
    description: 'pensamento, comunicação e conflito.',
    status: 'Conteúdo em preparação', previewAvailable: false,
  },
  {
    id: 'pentacles', name: 'Ouros', cardCount: 14,
    description: 'recursos, prática e condições concretas.',
    status: 'Conteúdo em preparação', previewAvailable: false,
  },
];
