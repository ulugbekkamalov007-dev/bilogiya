// Ilova bilan birga keladigan tayyor kurs (kurs5/): admin bir tugma bilan o'rnatadi.
import { sb, state, esc, $, go, toast, btnBusy, i18nField } from './core.js';
import { T } from './ui.js';

export const isBio5 = c => /biologiya\s*5/i.test(JSON.stringify(c?.title || ''));
export const needBundled = list => state.isAdmin && !(list || []).some(isBio5);
export const bundledCard = () => `<div class="card pad mb" style="border:2px dashed var(--brand,#0f766e)"><h3 style="margin:0 0 6px">📚 Biologiya 5-sinf — ${esc(T('tayyor kurs', 'готовый курс', 'ready course'))}</h3>
  <p class="muted small" style="margin:0 0 10px">${esc(T('3 bob, 18 mavzu, kitoblar, testlar, kartochkalar. Bir tugma bilan yaratiladi va nashr qilinadi.', '3 главы, 18 тем, книги, тесты, карточки. Создаётся и публикуется одной кнопкой.', '3 chapters, 18 topics, books, tests, cards. Created and published with one button.'))}</p>
  <button class="btn lg" data-inst>⚡ ${esc(T('Tayyor kursni o\'rnatish', 'Установить готовый курс', 'Install ready course'))}</button></div>`;
export function bindBundled(root) {
  const b = root.querySelector('[data-inst]'); if (!b) return;
  b.onclick = async () => {
    btnBusy(b, true);
    try {
      const { data: c, error } = await sb.from('courses').insert({ title: await i18nField('Biologiya 5-sinf'), grade: 5, author_id: state.user.id }).select('id').single(); if (error) throw error;
      go('/teach/build/' + c.id + '?auto=1');
    } catch (e) { btnBusy(b, false); toast(String(e.message || e), 'err'); }
  };
}
