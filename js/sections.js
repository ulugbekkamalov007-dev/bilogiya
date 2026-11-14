// Bo'limlarni yashirish: admin "Ilova" sozlamasidan belgilaydi (app_settings 'ui'.hidden). Sukut bo'yicha AI va Laboratoriya yashirin.
import { state } from './core.js';
import { T } from './ui.js';

export const SECTIONS = () => [
  ['ai', T('AI yordamchi', 'ИИ-помощник', 'AI assistant')], ['lab', T('Laboratoriya', 'Лаборатория', 'Laboratory')], ['forum', T('Forum', 'Форум', 'Forum')],
  ['cards', T('Kartalar', 'Карточки', 'Flashcards')], ['achievements', T('Yutuqlar', 'Достижения', 'Achievements')], ['offline', T('Oflayn yuklab olinganlar', 'Офлайн', 'Offline')],
  ['rating', T('Reyting', 'Рейтинг', 'Rating')]
];
export const hiddenSet = () => new Set(Array.isArray(state.settings?.ui?.hidden) ? state.settings.ui.hidden : ['ai', 'lab']);
const MAP = [[/^\/ai/, 'ai'], [/^\/lab/, 'lab'], [/^\/forum/, 'forum'], [/^\/cards/, 'cards'], [/^\/achievements/, 'achievements'], [/^\/offline/, 'offline'], [/^\/rating/, 'rating']];
export const sectionOf = path => (MAP.find(([re]) => re.test(path)) || [])[1] || null;
export const isHidden = path => { const s = sectionOf(path); return !!s && hiddenSet().has(s); };
