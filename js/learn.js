// O'qish xulosasi (learning time): talaba bosh sahifasi bloklari, streak kalendari, tur bo'yicha tarix (/history/:kind)
import { sb, state, tr, route, go, esc, ic, $, $$, fmtDate, dayStr, addDays, spinner } from './core.js';
import { T, skeleton, empty, errBox, bar, dbErr } from './ui.js';
import { CCOL } from './charts.js';

export const KINDS = {
  video: { ic: 'video', n: () => T('Videolar', 'Видео', 'Videos'), one: () => T('Video', 'Видео', 'Video'), kinds: ['video'], c: CCOL.video },
  audio: { ic: 'audio', n: () => T('Audiolar', 'Аудио', 'Audios'), one: () => T('Audio', 'Аудио', 'Audio'), kinds: ['audio'], c: CCOL.audio },
  book: { ic: 'book', n: () => T('Kitoblar', 'Книги', 'Books'), one: () => T('Kitob', 'Книга', 'Book'), kinds: ['book', 'pdf'], c: CCOL.book },
  presentation: { ic: 'file', n: () => T('Taqdimotlar', 'Презентации', 'Presentations'), one: () => T('Taqdimot', 'Презентация', 'Presentation'), kinds: ['presentation'], c: '#D9731A' },
  test: { ic: 'test', n: () => T('Testlar', 'Тесты', 'Tests'), one: () => T('Test', 'Тест', 'Test'), kinds: ['test'], c: CCOL.test },
};
// soniyani odam tushunadigan ko'rinishda: 46 daqiqa 52 soniya
export function fmtLearn(sec) {
  sec = Math.max(0, Math.round(+sec || 0)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  const U = { h: T('soat', 'ч', 'h'), m: T('daq', 'мин', 'min'), s: T('s', 'с', 's') };
  if (h) return `${h} ${U.h} ${m} ${U.m}`; if (m) return s ? `${m} ${U.m} ${s} ${U.s}` : `${m} ${U.m}`; return `${s} ${U.s}`;
}
export const sumSec = o => Object.entries(o || {}).reduce((a, [k, v]) => a + (k === 'app' ? 0 : +v || 0), 0);

export async function learnSummary() { const { data } = await sb.rpc('my_learning_summary'); return data || { today: {}, week: {}, all: {}, days: [], streak: 0, best: 0, goal: 20, tests: {} }; }

// Faollik kalendari (GitHub uslubida): oxirgi 18 hafta; kun rangi = o'qish vaqti
export function streakCalendar(days, weeks = 18) {
  const map = {}; (days || []).forEach(x => { map[String(x.d).slice(0, 10)] = +x.s; });
  const today = new Date(), dow = (today.getDay() + 6) % 7, start = addDays(today, -(weeks - 1) * 7 - dow); const cols = [];
  for (let w = 0; w < weeks; w++) { const col = []; for (let d = 0; d < 7; d++) { const dt = addDays(start, w * 7 + d), k = dayStr(dt), future = dt > today, s = map[k] || 0;
    const lv = future ? -1 : s <= 0 ? 0 : s < 600 ? 1 : s < 1800 ? 2 : 3; col.push(`<i class="cal l${lv}" title="${esc(k + ' · ' + fmtLearn(s))}"></i>`); } cols.push(`<div class="calc">${col.join('')}</div>`); }
  return `<div class="cal-wrap" role="img" aria-label="${esc(T('Faollik kalendari', 'Календарь активности', 'Activity calendar'))}">${cols.join('')}</div>
    <div class="cal-leg muted small"><span>${esc(T('Kam', 'Меньше', 'Less'))}</span><i class="cal l0"></i><i class="cal l1"></i><i class="cal l2"></i><i class="cal l3"></i><span>${esc(T('Ko\'p', 'Больше', 'More'))}</span></div>`;
}

// Bosh sahifa bloki: kunlik maqsad, streak, tur bo'yicha vaqt, haftalik grafik, tarix kategoriyalari
export function learnBlock(s, histCounts = {}) {
  const goalSec = (s.goal || 20) * 60, todaySec = sumSec(s.today), pc = Math.min(100, Math.round(todaySec / goalSec * 100));
  const R = 34, C = 2 * Math.PI * R, tiles = ['video', 'audio', 'book', 'test'];
  const wk = []; for (let i = 6; i >= 0; i--) { const k = dayStr(addDays(new Date(), -i)), x = (s.days || []).find(d => String(d.d).slice(0, 10) === k); wk.push({ k, s: x ? +x.s : 0 }); }
  const mx = Math.max(1, ...wk.map(w => w.s));
  return `<div class="lgrid">
    <div class="card pad goalc"><div class="row" style="gap:14px"><svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="${R}" fill="none" stroke="var(--card2)" stroke-width="9"/><circle cx="42" cy="42" r="${R}" fill="none" stroke="var(--brand)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pc / 100)).toFixed(1)}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor">${pc}%</text></svg>
      <div><small class="muted">${esc(T('Bugungi o\'qish', 'Сегодня', 'Today'))}</small><div class="big">${esc(fmtLearn(todaySec))}</div><small class="muted">${esc(T('Maqsad', 'Цель', 'Goal'))}: ${s.goal || 20} ${esc(T('daqiqa', 'мин', 'min'))}</small></div></div></div>
    <a class="card pad streakc" href="#/achievements"><small class="muted">${esc(T('Ketma-ket kunlar', 'Серия дней', 'Streak'))}</small><div class="big">${ic('flame', 22)} ${s.streak || 0} ${esc(T('kun', 'дн.', 'days'))}</div><small class="muted">${esc(T('Eng yaxshi', 'Рекорд', 'Best'))}: ${s.best || 0}</small></a>
    <div class="card pad sumc"><div class="sumr"><div><small class="muted">${esc(T('Bu hafta', 'Неделя', 'This week'))}</small><b>${esc(fmtLearn(sumSec(s.week)))}</b></div><div><small class="muted">${esc(T('Jami', 'Всего', 'Total'))}</small><b>${esc(fmtLearn(sumSec(s.all)))}</b></div></div></div>
  </div>
  <div class="ltiles mt">${tiles.map(k => `<a class="ltile" href="#/history/${k}" style="--c:${KINDS[k].c}"><span class="item-ic ${k}">${ic(KINDS[k].ic, 18)}</span><small class="muted">${esc(KINDS[k].one())}</small><b>${esc(fmtLearn(s.today?.[k] || 0))}</b><small class="muted">${esc(T('hafta', 'нед.', 'wk'))}: ${esc(fmtLearn(s.week?.[k] || 0))}</small></a>`).join('')}</div>
  <div class="card pad mt"><h3 class="mb0">${esc(T('Haftalik faollik', 'Активность за неделю', 'Weekly activity'))}</h3><div class="wbars">${wk.map(w => `<div class="wb" title="${esc(w.k + ' · ' + fmtLearn(w.s))}"><i style="height:${Math.max(4, Math.round(w.s / mx * 100))}%"></i><span>${w.k.slice(8)}</span></div>`).join('')}</div></div>
  <div class="card pad mt"><div class="row between"><h3 class="mb0">${esc(T('Faollik kalendari', 'Календарь активности', 'Activity calendar'))}</h3></div>${streakCalendar(s.days)}</div>
  <h3 class="mt">${esc(T('Materiallar tarixi', 'История материалов', 'Material history'))}</h3>
  <div class="hcats">${Object.keys(KINDS).map(k => `<a class="card pad hcat" href="#/history/${k}"><span class="item-ic ${k}">${ic(KINDS[k].ic, 22)}</span><div class="grow"><b>${esc(KINDS[k].n())}</b><br><small class="muted">${histCounts[k] != null ? histCounts[k] + ' ' + esc(T('ta', '', '')) : ''}</small></div>${ic('chev', 16)}</a>`).join('')}</div>`;
}

const fmtPos = sec => { sec = Math.max(0, Math.round(sec || 0)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };

route('/history/:kind', async ({ el, params, alive }) => {
  const K = KINDS[params.kind]; if (!K) return go('/home', true);
  el.innerHTML = `<div class="page"><div class="row"><a class="btn ghost sm" href="#/home">${ic('back')}</a><h2 class="mb0">${esc(K.n())}</h2></div>${skeleton(4, 78)}</div>`;
  const head = `<div class="row"><a class="btn ghost sm" href="#/home">${ic('back')}</a><h2 class="mb0">${esc(K.n())}</h2></div>`;
  if (params.kind === 'test') {
    const { data, error } = await sb.from('test_attempts').select('id,item_id,total,correct,percent,duration_s,created_at,items(title)').eq('user_id', state.user.id).order('created_at', { ascending: false }).limit(200);
    if (!alive()) return; if (error) { el.innerHTML = `<div class="page">${head}${errBox(dbErr(error))}</div>`; return; }
    const a = data || [], cor = a.reduce((x, r) => x + r.correct, 0), tot = a.reduce((x, r) => x + r.total, 0), sec = a.reduce((x, r) => x + r.duration_s, 0), best = a.reduce((x, r) => Math.max(x, +r.percent), 0);
    el.innerHTML = `<div class="page">${head}<div class="ltiles mt">
      <div class="ltile"><small class="muted">${esc(T('Ishlangan testlar', 'Пройдено тестов', 'Tests taken'))}</small><b>${a.length}</b></div><div class="ltile"><small class="muted">${esc(T('To\'g\'ri', 'Верно', 'Correct'))}</small><b>${cor}</b></div>
      <div class="ltile"><small class="muted">${esc(T('Noto\'g\'ri', 'Неверно', 'Wrong'))}</small><b>${tot - cor}</b></div><div class="ltile"><small class="muted">${esc(T('Eng yaxshi', 'Лучший', 'Best'))}</small><b>${Math.round(best)}%</b></div>
      <div class="ltile"><small class="muted">${esc(T('Sarflangan vaqt', 'Время', 'Time spent'))}</small><b>${esc(fmtLearn(sec))}</b></div></div>
      <h3 class="mt">${esc(T('Oxirgi urinishlar', 'Последние попытки', 'Recent attempts'))}</h3>
      ${a.length ? `<div class="stack">${a.slice(0, 40).map(r => `<a class="card pad item-row" href="${r.item_id ? '#/test/' + r.item_id : '#/tests'}"><span class="item-ic test">${ic('test')}</span><div class="grow"><b>${esc(r.items ? tr(r.items.title) : T('Aralash test', 'Смешанный тест', 'Mixed test'))}</b><br><small class="muted">${r.correct}/${r.total} · ${esc(fmtLearn(r.duration_s))} · ${esc(fmtDate(r.created_at))}</small>${bar(+r.percent)}</div><b>${Math.round(r.percent)}%</b></a>`).join('')}</div>` : empty('test', T('Hali test ishlamagansiz', 'Вы ещё не проходили тесты', 'No tests taken yet'), `<a class="btn" href="#/tests">${esc(T('Testlarga o\'tish', 'К тестам', 'Go to tests'))}</a>`)}</div>`;
    return;
  }
  const { data, error } = await sb.rpc('item_history', { p_kinds: K.kinds });
  if (!alive()) return; if (error) { el.innerHTML = `<div class="page">${head}${errBox(dbErr(error))}</div>`; return; }
  const rows = data || [];
  el.innerHTML = `<div class="page">${head}${rows.length ? `<div class="plist mt">${rows.map(r => {
    const dur = +r.duration || 0, av = ['video', 'audio'].includes(params.kind);
    return `<a class="card pad plrow" href="#/item/${r.item_id}"><span class="thumb ${params.kind}">${ic(K.ic, 26)}${dur ? `<em>${esc(fmtPos(dur))}</em>` : ''}</span><div class="grow"><b class="clamp2">${esc(tr(r.title))}</b>
      <small class="muted">${r.plays || 1} ${esc(T('marta ochilgan', 'раз открыто', 'opens'))}${av && r.last_pos > 5 && r.percent < 100 ? ` · ${esc(T('oxirgi joy', 'остановились', 'stopped at'))} ${esc(fmtPos(r.last_pos))}` : ''}${r.seconds ? ` · ${esc(fmtLearn(r.seconds))}` : ''}</small>
      ${bar(r.percent)}<small class="muted">${r.percent}% ${r.last_at ? '· ' + esc(fmtDate(r.last_at)) : ''}</small></div>${av && r.percent < 100 && r.last_pos > 5 ? `<span class="btn sm">${esc(T('Davom etish', 'Продолжить', 'Resume'))}</span>` : ''}</a>`; }).join('')}</div>`
    : empty(K.ic, T('Bu yerda hali hech narsa yo\'q. Kutubxonadan material oching — tarix shu yerda saqlanadi.', 'Здесь пока пусто. Откройте материал в библиотеке — история сохранится здесь.', 'Nothing here yet. Open material from the library — your history is saved here.'), `<a class="btn" href="#/library">${esc(T('Kutubxona', 'Библиотека', 'Library'))}</a>`)}</div>`;
}, { auth: true });
