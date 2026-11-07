export type Lume = { mood: string; message: string };
export type Option = { id: string; label: string };
type BaseStep = { id: string; title: string; lume: Lume };
export type Explanation = BaseStep & {
  type: 'explanation'; paragraphs: string[]; cta: string;
};
export type Observation = BaseStep & {
  type: 'observation'; cardId: 'major-00-fool'; imageAlt: string;
  options: (Option & { feedback: string })[];
};
export type SingleChoice = BaseStep & {
  type: 'single-choice'; question: string; options: Option[]; paragraphs?: string[] | null;
};
export type Exploration = BaseStep & {
  type: 'exploration'; cardId: 'major-00-fool'; imageAlt: string; paragraphs: string[];
  symbols: (Option & { observation: string; interpretation: string })[]; reflection?: string | null;
};
export type Classification = BaseStep & {
  type: 'classification'; instruction: string; items: Option[]; categories: Option[];
  paragraphs?: string[] | null; note?: string | null;
};
export type Study = BaseStep & {
  type: 'study'; paragraphs: string[];
  blocks: { label: string; paragraphs: string[]; collapsible: boolean }[];
  cardMode: 'none' | 'visible' | 'reveal' | 'rotate'; cardId?: 'major-00-fool' | null;
  imageAlt?: string | null; afterReveal?: string[] | null; reflection?: string | null; cta: string;
};
export type ClassificationEvaluation = { correct: boolean; items: {
  itemId: string; selectedCategoryId: string; expectedCategoryId: string; correct: boolean; feedback: string;
}[] };
export type Step = Explanation | Observation | SingleChoice | Exploration | Classification | Study;
export type Lesson = {
  id: string; contentVersion: number; title: string; status: 'AVAILABLE';
  objectives: string[]; steps: Step[];
  paths: { id: string; title: string; stepIds: string[] }[];
};
export type Navigation = {
  id: string; title: string; status: 'PREVIEW'; parentId: string;
  children: { id: string; title: string; status: 'PREVIEW' | 'AVAILABLE' }[];
};
export type Evaluation = {
  correct: boolean; selectedOptionFeedback: string;
  expectedOptionId: string; explanation: string;
};

type ObjectValue = Record<string, unknown>;
function object(value: unknown): value is ObjectValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}
function options(value: unknown, observation = false): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  const ids = new Set<string>();
  return value.every(item => {
    if (!object(item) || typeof item.id !== 'string' || typeof item.label !== 'string'
      || !item.id.trim() || !item.label.trim() || ids.has(item.id) || (observation && typeof item.feedback !== 'string')) return false;
    ids.add(item.id);
    return true;
  });
}
function isStep(value: unknown): value is Step {
  if (!object(value) || typeof value.id !== 'string' || !value.id.trim() || typeof value.title !== 'string'
    || !object(value.lume) || typeof value.lume.mood !== 'string'
    || typeof value.lume.message !== 'string') return false;
  switch (value.type) {
    case 'study': return strings(value.paragraphs) && typeof value.cta === 'string'
      && ['none', 'visible', 'reveal', 'rotate'].includes(String(value.cardMode))
      && (value.cardMode === 'none' || (value.cardId === 'major-00-fool' && typeof value.imageAlt === 'string'))
      && (value.cardMode !== 'reveal' || strings(value.afterReveal))
      && (value.afterReveal == null || strings(value.afterReveal))
      && (value.reflection == null || typeof value.reflection === 'string')
      && Array.isArray(value.blocks) && value.blocks.every(block => object(block)
        && typeof block.label === 'string' && strings(block.paragraphs) && typeof block.collapsible === 'boolean');
    case 'explanation': return strings(value.paragraphs) && typeof value.cta === 'string';
    case 'observation': return value.cardId === 'major-00-fool' && !('imagePath' in value)
      && typeof value.imageAlt === 'string' && options(value.options, true);
    case 'exploration': return value.cardId === 'major-00-fool' && typeof value.imageAlt === 'string'
      && strings(value.paragraphs) && options(value.symbols) && (value.symbols as ObjectValue[]).every(symbol =>
        typeof symbol.observation === 'string' && typeof symbol.interpretation === 'string')
      && (value.reflection == null || typeof value.reflection === 'string');
    case 'classification': return typeof value.instruction === 'string' && options(value.items)
      && (value.paragraphs == null || strings(value.paragraphs)) && (value.note == null || typeof value.note === 'string')
      && options(value.categories) && (value.categories as unknown[]).length >= 2
      && !('assessments' in value) && !('expectedCategoryId' in value) && !('feedback' in value)
      && (value.items as ObjectValue[]).every(item => !('expectedCategoryId' in item) && !('feedback' in item));
    case 'single-choice': return typeof value.question === 'string' && options(value.options)
      && (value.paragraphs == null || strings(value.paragraphs))
      && !('expectedOptionId' in value) && !('feedback' in value)
      && (value.options as ObjectValue[]).every(option => !('feedback' in option) && !('expectedOptionId' in option));
    default: return false;
  }
}
export function isLesson(value: unknown): value is Lesson {
  return object(value) && value.id === 'fool-first-step'
      && typeof value.contentVersion === 'number' && Number.isInteger(value.contentVersion)
    && value.contentVersion === 4 && typeof value.title === 'string'
    && value.status === 'AVAILABLE' && strings(value.objectives)
    && Array.isArray(value.steps) && value.steps.length === 20 && value.steps.every(isStep)
    && new Set(value.steps.map(step => step.id)).size === value.steps.length
    && Array.isArray(value.paths) && value.paths.length === 4
    && value.paths.every(path => object(path) && typeof path.id === 'string' && typeof path.title === 'string'
      && strings(path.stepIds) && path.stepIds.length > 0)
    && new Set(value.paths.map(path => path.id)).size === 4
    && JSON.stringify(value.paths.flatMap(path => path.stepIds)) === JSON.stringify(value.steps.map(step => step.id))
    && !('assessments' in value);
}
export function isNavigation(value: unknown): value is Navigation {
  return object(value) && typeof value.id === 'string' && typeof value.title === 'string'
    && value.status === 'PREVIEW' && typeof value.parentId === 'string'
    && Array.isArray(value.children) && value.children.every(child => object(child)
      && typeof child.id === 'string' && typeof child.title === 'string' && (child.status === 'PREVIEW' || child.status === 'AVAILABLE'));
}
export function isClassificationEvaluation(value: unknown): value is ClassificationEvaluation {
  return object(value) && typeof value.correct === 'boolean' && Array.isArray(value.items)
    && value.items.every(item => object(item) && typeof item.itemId === 'string'
      && typeof item.selectedCategoryId === 'string' && typeof item.expectedCategoryId === 'string'
      && typeof item.correct === 'boolean' && typeof item.feedback === 'string');
}
export function isEvaluation(value: unknown): value is Evaluation {
  return object(value) && typeof value.correct === 'boolean'
    && typeof value.selectedOptionFeedback === 'string'
    && typeof value.expectedOptionId === 'string' && typeof value.explanation === 'string';
}
