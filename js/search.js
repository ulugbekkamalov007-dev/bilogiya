// Global qidiruv (header / "/" tugmasi): foydalanuvchiga ruxsat etilgan materiallar va papkalar ichidan
import { sb, state, t, tr, addDict, go, esc, ic, $, $$, modal, memo, spinner } from './core.js';

addDict({
  uz: { 'gs.ph': 'Qidirish…', 'gs.none': 'Hech narsa topilmadi', 'gs.hint': 'Kamida 2 ta harf kiriting', 'gs.folder': 'Papka' },
  ru: { 'gs.ph': 'Поиск…', 'gs.none': 'Ничего не найдено', 'gs.hint': 'Введите минимум 2 буквы', 'gs.folder': 'Папка' },
  en: { 'gs.ph': 'Search…', 'gs.none': 'Nothing found', 'gs.hint': 'Type at least 2 letters', 'gs.folder': 'Folder' },
});

const KIC = { video: 'video', audio: 'audio', pdf: 'book', presentation: 'book', book: 'book', test: 'test', link: 'globe', folder: 'folder' };
const load = () => memo('gs:index', 60000, async () => {
  const [a, b] = await Promise.all([
    sb.from('items').select('id,kind,title,folder_id').neq('kind', 'app').limit(1500),
    sb.from('folders').select('id,title').limit(500),
  ]);
  return [...(b.data || []).map(x => ({ id: x.id, kind: 'folder', title: x.title })), ...(a.data || [])];
});
const hit = (x, q) => { const s = tr(x.title).toLowerCase(); return s.includes(q); };
const to = x => x.kind === 'folder' ? '/library/' + x.id : x.kind === 'test' ? '/test/' + x.id : '/item/' + x.id;

export function openSearch() {
  if ($('#gsm')) return;
  const m = modal(`<div id="gsm"><div class="gsbox">${ic('search', 18)}<input id="gsq" class="input" type="search" autocomplete="off" placeholder="${esc(t('gs.ph'))}" aria-label="${esc(t('gs.ph'))}"></div><div id="gsr" class="gsr"><p class="muted center pad">${esc(t('gs.hint'))}</p></div></div>`, { cls: 'wide' });
  const inp = $('#gsq', m.el), out = $('#gsr', m.el); inp.focus();
  let idx = null, tmr;
  const run = async () => {
    const q = inp.value.trim().toLowerCase();
    if (q.length < 2) { out.innerHTML = `<p class="muted center pad">${esc(t('gs.hint'))}</p>`; return; }
    if (!idx) { out.innerHTML = spinner(); idx = await load(); }
    const r = idx.filter(x => hit(x, q)).slice(0, 30);
    out.innerHTML = r.length ? r.map(x => `<a class="gsi" href="#${to(x)}"><span class="item-ic ${x.kind}">${ic(KIC[x.kind] || 'book', 18)}</span><b class="grow">${esc(tr(x.title))}</b><small class="muted">${esc(x.kind === 'folder' ? t('gs.folder') : x.kind)}</small></a>`).join('') : `<p class="muted center pad">${esc(t('gs.none'))}</p>`;
    $$('.gsi', out).forEach(a => a.addEventListener('click', () => m.close()));
  };
  inp.oninput = () => { clearTimeout(tmr); tmr = setTimeout(run, 120); };
  inp.onkeydown = e => { if (e.key === 'Enter') { const f = $('.gsi', out); if (f) { go(f.getAttribute('href').slice(1)); m.close(); } } };
}
