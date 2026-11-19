// Ilova bilan birga keladigan tayyor kurs (kurs5/): admin bir tugma bilan o'rnatadi.
import { sb, state, esc, $, go, toast, btnBusy, i18nField } from './core.js';
import { T } from './ui.js';

export const isBio5 = c => /biologiya\s*5/i.test(JSON.stringify(c?.title || ''));
const lc = c => c?.lessons?.[0]?.count || 0;
export const bioCourse = list => (list || []).find(isBio5);
export const needBundled = list => state.isAdmin && (!bioCourse(list) || !lc(bioCourse(list)));
// Admin kabinetga kirganda kurs yo'q yoki bo'sh bo'lsa — o'zi yaratadi/to'ldiradi (har sessiyada bir marta urinadi)
export async function autoBundled() {
  if (!state.isAdmin) return false;
  try { if (sessionStorage.getItem('bio_auto')) return false; } catch { }
  const { data } = await sb.from('courses').select('id,title,lessons(count)');
  const c = bioCourse(data); if (c && lc(c)) return false;
  try { sessionStorage.setItem('bio_auto', '1'); } catch { }
  let id = c?.id;
  if (!id) { const r = await sb.from('courses').insert({ title: await i18nField('Biologiya 5-sinf'), grade: 5, author_id: state.user.id }).select('id').single(); if (r.error || !r.data) return false; id = r.data.id; }
  go('/teach/build/' + id + '?auto=1'); return true;
}
export const bundledCard = () => `<div class="card pad mb" style="border:2px dashed var(--brand,#0f766e)"><h3 style="margin:0 0 6px">📚 Biologiya 5-sinf — ${esc(T('tayyor kurs', 'готовый курс', 'ready course'))}</h3>
  <p class="muted small" style="margin:0 0 10px">${esc(T('3 bob, 18 mavzu, kitoblar, testlar, kartochkalar. Bir tugma bilan yaratiladi va nashr qilinadi.', '3 главы, 18 тем, книги, тесты, карточки. Создаётся и публикуется одной кнопкой.', '3 chapters, 18 topics, books, tests, cards. Created and published with one button.'))}</p>
  <button class="btn lg" data-inst>⚡ ${esc(T('Tayyor kursni o\'rnatish', 'Установить готовый курс', 'Install ready course'))}</button></div>`;
export function bindBundled(root, list) {
  const b = root.querySelector('[data-inst]'); if (!b) return;
  b.onclick = async () => {
    btnBusy(b, true);
    try {
      const ex = bioCourse(list); if (ex) return go('/teach/build/' + ex.id + '?auto=1');
      const { data: c, error } = await sb.from('courses').insert({ title: await i18nField('Biologiya 5-sinf'), grade: 5, author_id: state.user.id }).select('id').single(); if (error) throw error;
      go('/teach/build/' + c.id + '?auto=1');
    } catch (e) { btnBusy(b, false); toast(String(e.message || e), 'err'); }
  };
}
