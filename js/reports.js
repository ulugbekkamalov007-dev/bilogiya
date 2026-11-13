// Hisobotlar: foydalanish vaqti (kunlik/haftalik), video/kitob/test bo'yicha, test natijalari — SVG grafiklar.
// Admin ism bo'yicha foydalanuvchi hisobotini ham ko'ra oladi (/reports/user/:id).
import { sb, state, t, tr, addDict, route, go, esc, ic, $, $$, modal, fmtMin, fmtDate, dayStr, addDays, fmtDur, spinner } from './core.js';

addDict({
  uz: { 'rep.rank': 'O\'rin', 'rep.detail': 'Batafsil', 'rep.unavail': 'Ma\'lumotlar mavjud emas', 'rep.full': 'To\'liq hisobot', 'rep.tests_n': '{n} ta test', 'rep.browse_note': 'Ilovada sayr qilish — video, audio, kitob va testdan tashqari ilova ichida o\'tkazilgan vaqt', 'rep.period': 'Davr', 'rep.sortby': 'Tartiblash', 'rep.kind_hint': 'Kategoriyani bosing — qaysi materialga qancha vaqt ketgani ko\'rinadi', 'rep.mine': 'Mening hisobotim', 'rep.me_rank': 'Sizning o\'rningiz',
    'rep.lb': 'Reyting', 'rep.all': 'Hammasi', 'rep.lb_off': 'Reyting o\'chirilgan', 'rep.title': 'Hisobot', 'rep.of': '{name} — hisobot', 'rep.today': 'Bugun', 'rep.week': 'Oxirgi 7 kun', 'rep.total': 'Jami', 'rep.p7': '7 kun', 'rep.p30': '30 kun', 'rep.p12w': '12 hafta',
    'rep.time_chart': 'O\'qish vaqti (daqiqa)', 'rep.by_kind': 'Bo\'limlar bo\'yicha', 'rep.video': 'Video', 'rep.book': 'Kitob/material', 'rep.test': 'Test', 'rep.other': 'Ilovada sayr qilish', 'rep.audio': 'Audio', 'rep.app': 'Ilovada',
    'rep.items': 'Materiallar bo\'yicha vaqt', 'rep.tests': 'Test natijalari', 'rep.attempts': 'Urinishlar', 'rep.avg': 'O\'rtacha', 'rep.best': 'Eng yaxshi', 'rep.correct': 'to\'g\'ri',
    'rep.no_data': 'Ma\'lumot hali yo\'q', 'rep.day_detail': 'Kunlik to\'liq hisobot', 'rep.day': 'Kun', 'rep.min': 'daq', 'rep.close': 'Yopish', 'rep.hint': 'Kartani yoki ustunni bosing — kunlik tafsilot ochiladi',
    'rep.week_of': 'hafta', 'rep.deleted': '(o\'chirilgan material)' },
  ru: { 'rep.rank': 'Место', 'rep.detail': 'Подробно', 'rep.me_rank': 'Ваше место', 'rep.unavail': 'Данные недоступны', 'rep.full': 'Полный отчёт', 'rep.tests_n': 'Тестов: {n}', 'rep.browse_note': 'Прогулка по приложению — время в приложении вне видео, аудио, книг и тестов', 'rep.period': 'Период', 'rep.sortby': 'Сортировка', 'rep.kind_hint': 'Нажмите на категорию — увидите, на какие материалы ушло время', 'rep.mine': 'Мой отчёт', 'rep.lb': 'Рейтинг', 'rep.all': 'Всё время', 'rep.lb_off': 'Рейтинг отключён', 'rep.title': 'Отчёт', 'rep.of': '{name} — отчёт', 'rep.today': 'Сегодня', 'rep.week': 'Последние 7 дней', 'rep.total': 'Всего', 'rep.p7': '7 дней', 'rep.p30': '30 дней', 'rep.p12w': '12 недель',
    'rep.time_chart': 'Время обучения (минуты)', 'rep.by_kind': 'По разделам', 'rep.video': 'Видео', 'rep.book': 'Книги/материалы', 'rep.test': 'Тесты', 'rep.other': 'Прогулка по приложению', 'rep.audio': 'Аудио', 'rep.app': 'В приложении',
    'rep.items': 'Время по материалам', 'rep.tests': 'Результаты тестов', 'rep.attempts': 'Попытки', 'rep.avg': 'Среднее', 'rep.best': 'Лучший', 'rep.correct': 'верно',
    'rep.no_data': 'Данных пока нет', 'rep.day_detail': 'Подробный отчёт по дням', 'rep.day': 'День', 'rep.min': 'мин', 'rep.close': 'Закрыть', 'rep.hint': 'Нажмите на карточку или столбец — откроется детализация по дням',
    'rep.week_of': 'неделя', 'rep.deleted': '(удалённый материал)' },
  en: { 'rep.rank': 'Rank', 'rep.detail': 'Details', 'rep.me_rank': 'Your rank', 'rep.unavail': 'No data available', 'rep.full': 'Full report', 'rep.tests_n': '{n} tests', 'rep.browse_note': 'Browsing the app — time in the app outside video, audio, books and tests', 'rep.period': 'Period', 'rep.sortby': 'Sort by', 'rep.kind_hint': 'Tap a category to see which items took the time', 'rep.mine': 'My report', 'rep.lb': 'Leaderboard', 'rep.all': 'All time', 'rep.lb_off': 'Leaderboard is off', 'rep.title': 'Report', 'rep.of': '{name} — report', 'rep.today': 'Today', 'rep.week': 'Last 7 days', 'rep.total': 'Total', 'rep.p7': '7 days', 'rep.p30': '30 days', 'rep.p12w': '12 weeks',
    'rep.time_chart': 'Study time (minutes)', 'rep.by_kind': 'By section', 'rep.video': 'Video', 'rep.book': 'Books/materials', 'rep.test': 'Tests', 'rep.other': 'Browsing the app', 'rep.audio': 'Audio', 'rep.app': 'In app',
    'rep.items': 'Time per material', 'rep.tests': 'Test results', 'rep.attempts': 'Attempts', 'rep.avg': 'Average', 'rep.best': 'Best', 'rep.correct': 'correct',
    'rep.no_data': 'No data yet', 'rep.day_detail': 'Full daily report', 'rep.day': 'Day', 'rep.min': 'min', 'rep.close': 'Close', 'rep.hint': 'Tap a card or a bar to open the daily breakdown',
    'rep.week_of': 'week', 'rep.deleted': '(deleted item)' },
});

const tabs = a => `<div class="tabs mb"><a class="tab ${a === 'me' ? 'on' : ''}" href="#/reports">${esc(t('rep.mine'))}</a>${state.isAdmin || state.settings?.app?.leaderboard !== false ? `<a class="tab ${a === 'all' ? 'on' : ''}" href="#/reports/all">${esc(t('rep.lb'))}</a>` : ''}</div>`;
// yig'iladigan tanlagich: joriy qiymat ko'rinadi, bossa variantlar ochiladi
const ddHtml = (id, label, opts, cur) => `<div class="langdd seldd" data-dd="${id}"><button type="button" class="langcur" aria-haspopup="true"><span class="muted">${esc(label)}:</span> <b>${esc(opts.find(o => o[0] === cur)?.[1] || '')}</b> <span class="caret">▾</span></button>
  <div class="langmenu" hidden>${opts.map(([v, l]) => `<button type="button" data-v="${v}" class="${v === cur ? 'on' : ''}">${esc(l)}</button>`).join('')}</div></div>`;
function ddBind(root, onPick) {
  $$('.seldd', root).forEach(d => {
    const m = $('.langmenu', d);
    $('.langcur', d).onclick = e => { e.stopPropagation(); $$('.langmenu', root).forEach(x => { if (x !== m) x.hidden = true; }); m.hidden = !m.hidden; };
    $$('[data-v]', m).forEach(b => b.onclick = () => { m.hidden = true; onPick(d.dataset.dd, b.dataset.v); });
  });
  const close = () => $$('.langmenu', root).forEach(x => { x.hidden = true; });
  document.addEventListener('click', close, { once: true });
}
const COL = { video: '#2563eb', audio: '#8b5cf6', book: '#f59e0b', test: '#16a34a', other: '#94a3b8' };
const mondayOf = d => { const x = new Date(d); const k = (x.getDay() + 6) % 7; x.setDate(x.getDate() - k); return x; };

function stackedChart(buckets) {
  const W = 640, H = 240, L = 36, B = 28, T = 10, R = 8, iw = W - L - R, ih = H - T - B;
  const max = Math.max(10, ...buckets.map(b => b.total)), top = Math.ceil(max / 10) * 10, bw = iw / buckets.length;
  const ticks = [0, .25, .5, .75, 1].map(f => Math.round(top * f));
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">`;
  ticks.forEach(v => { const y = T + ih - v / top * ih; s += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="grid"/><text x="${L - 6}" y="${y + 4}" class="axis" text-anchor="end">${v}</text>`; });
  buckets.forEach((b, i) => {
    let y = T + ih; const x = L + i * bw + bw * 0.16, w = bw * 0.68;
    s += `<g class="cbar" data-k="${b.key}" tabindex="0"><rect x="${L + i * bw}" y="${T}" width="${bw}" height="${ih}" fill="transparent"/>`;
    ['video', 'audio', 'book', 'test', 'other'].forEach(k => { const h = b[k] / top * ih; if (h > 0.5) { y -= h; s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${COL[k]}"><title>${esc(b.label)} · ${t('rep.' + k)}: ${Math.round(b[k])} ${t('rep.min')}</title></rect>`; } });
    if (b.total === 0) s += `<rect x="${x}" y="${T + ih - 1.5}" width="${w}" height="1.5" fill="#cbd5e1"/>`;
    s += `<text x="${L + i * bw + bw / 2}" y="${H - 8}" class="axis" text-anchor="middle">${esc(b.label)}</text></g>`;
  });
  return s + '</svg>';
}
function lineChart(pts) {
  const W = 640, H = 170, L = 34, B = 22, T = 10, R = 10, iw = W - L - R, ih = H - T - B;
  if (!pts.length) return '';
  const xs = i => L + (pts.length === 1 ? iw / 2 : i / (pts.length - 1) * iw), ys = v => T + ih - v / 100 * ih;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart">`;
  [0, 50, 100].forEach(v => s += `<line x1="${L}" x2="${W - R}" y1="${ys(v)}" y2="${ys(v)}" class="grid"/><text x="${L - 6}" y="${ys(v) + 4}" class="axis" text-anchor="end">${v}</text>`);
  s += `<polyline fill="none" stroke="#16a34a" stroke-width="2.5" points="${pts.map((p, i) => xs(i) + ',' + ys(p.v)).join(' ')}"/>`;
  pts.forEach((p, i) => s += `<circle cx="${xs(i)}" cy="${ys(p.v)}" r="4.5" fill="#16a34a"><title>${esc(p.label)}: ${p.v}%</title></circle>`);
  return s + '</svg>';
}

async function renderReport(el, uid, name, alive) {
  let period = localStorage.getItem('bio.repP') || '7';
  const today = new Date();
  const draw = async () => {
    el.innerHTML = spinner();
    const weeks = period === '12w', nDays = weeks ? 84 : +period, from = dayStr(addDays(today, -(nDays - 1))), to = dayStr(today);
    const wideFrom = '2020-01-01';
    const [use, tst, itm, all] = await Promise.all([
      sb.rpc('report_usage', { p_user: uid, p_from: from, p_to: to }), sb.rpc('report_tests', { p_user: uid, p_from: from, p_to: to }),
      sb.rpc('report_usage_items', { p_user: uid, p_from: from, p_to: to }), sb.rpc('report_usage', { p_user: uid, p_from: wideFrom, p_to: to }),
    ]);
    if (!alive()) return;
    if (use.error || tst.error || itm.error) { console.warn('report:', (use.error || tst.error || itm.error).message); el.innerHTML = `<div class="page">${name ? `<a class="btn ghost sm" href="#/rating">${ic('back')}</a>` : ''}<p class="muted center pad">${esc(t('rep.unavail'))}</p></div>`; return; }
    const rows = use.data || [], tests = tst.data || [], items = itm.data || [];
    // kun bo'yicha: {app,video,book,test}
    const byDay = {}; rows.forEach(r => { (byDay[r.day] ||= { app: 0, video: 0, audio: 0, book: 0, test: 0 })[r.kind] += +r.seconds / 60; });
    const days = Array.from({ length: nDays }, (_, i) => dayStr(addDays(today, -(nDays - 1 - i))));
    const mk = (key, label, ds) => { const o = { key, label, video: 0, audio: 0, book: 0, test: 0, app: 0, other: 0 }; ds.forEach(d => { const x = byDay[d]; if (x) { ['video', 'audio', 'book', 'test', 'app'].forEach(k => o[k] += x[k]); o.other += Math.max(0, x.app - x.video - x.audio - x.book - x.test); } }); o.total = o.video + o.audio + o.book + o.test + o.other; return o; };
    let buckets;
    if (weeks) { const g = {}; days.forEach(d => { const m = dayStr(mondayOf(new Date(d))); (g[m] ||= []).push(d); }); buckets = Object.entries(g).map(([m, ds]) => mk('w:' + ds[0] + ':' + ds[ds.length - 1], fmtDate(m), ds)); }
    else buckets = days.map(d => mk('d:' + d, nDays > 14 ? d.slice(8) : fmtDate(d), [d]));
    const sec = (ds, k) => ds.reduce((a, d) => a + ((byDay[d]?.[k] || 0) * 60), 0);
    const last7 = days.slice(-7);
    const dayTot = x => x ? x.video + x.audio + x.book + x.test + Math.max(0, x.app - x.video - x.audio - x.book - x.test) : 0;   // daqiqa
    const allBy = {}; (all.data || []).forEach(r => { (allBy[r.day] ||= { app: 0, video: 0, audio: 0, book: 0, test: 0 })[r.kind] += +r.seconds / 60; });
    const appTotal = Object.values(allBy).reduce((a, x) => a + dayTot(x) * 60, 0);
    const secTot = ds => ds.reduce((a, d) => a + dayTot(byDay[d]) * 60, 0);
    const kindTot = k => rows.reduce((a, r) => a + (r.kind === k ? +r.seconds : 0), 0);
    const kinds = [['video', kindTot('video')], ['audio', kindTot('audio')], ['book', kindTot('book')], ['test', kindTot('test')], ['other', Math.round(buckets.reduce((a, b) => a + b.other, 0) * 60)]];
    const kmax = Math.max(1, ...kinds.map(k => k[1]));
    const pcts = tests.map(x => +x.percent), avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;

    el.innerHTML = `<div class="page">${name ? `<a class="btn ghost sm" href="#/rating">${ic('back')}</a>` : ''}<div class="row between wrap"><h1>${esc(name ? t('rep.of', { name }) : t('rep.title'))}</h1>${name && state.isAdmin ? `<a class="btn sm ghost" href="#/inbox/${uid}">${ic('send', 14)}</a>` : ''}
      <div class="seg sm">${[['7', 'rep.p7'], ['30', 'rep.p30'], ['12w', 'rep.p12w']].map(([v, k]) => `<label><input type="radio" name="pp" value="${v}" ${v === period ? 'checked' : ''}><span>${esc(t(k))}</span></label>`).join('')}</div></div>
      <p class="muted small">${esc(t('rep.hint'))}</p>
      <div class="stats3 mb"><button class="stat card" data-sum="today"><span>${esc(t('rep.today'))}</span><b>${esc(fmtMin(secTot([dayStr(today)])))}</b></button>
        <button class="stat card" data-sum="week"><span>${esc(t('rep.week'))}</span><b>${esc(fmtMin(secTot(last7)))}</b></button>
        <button class="stat card" data-sum="all"><span>${esc(t('rep.total'))}</span><b>${esc(fmtMin(appTotal))}</b></button></div>
      <div class="card pad mb"><h3>${esc(t('rep.time_chart'))}</h3>${buckets.some(b => b.total > 0) ? stackedChart(buckets) : `<p class="muted center pad">${esc(t('rep.no_data'))}</p>`}
        <div class="legend">${['video', 'audio', 'book', 'test', 'other'].map(k => `<span><i style="background:${COL[k]}"></i>${esc(t('rep.' + k))}</span>`).join('')}</div></div>
      <div class="card pad mb"><h3>${esc(t('rep.by_kind'))}</h3>${kinds.map(([k, s]) => `<div class="hbar ${k !== 'other' ? 'clk' : ''}" ${k !== 'other' ? `data-kind="${k}" role="button" tabindex="0"` : ''}><span>${esc(t('rep.' + k))}</span><div><i style="width:${s / kmax * 100}%;background:${COL[k]}"></i></div><b>${esc(fmtMin(s))}${k !== 'other' ? ' ›' : ''}</b></div>`).join('')}<small class="muted">${esc(t('rep.kind_hint'))}</small></div>
      <div class="card pad mb"><h3>${esc(t('rep.items'))}</h3>${items.length ? `<div class="tbl">${items.map(i => `<div class="trow"><span class="item-ic ${i.kind === 'book' ? 'book' : i.kind}">${ic(i.kind === 'video' ? 'video' : i.kind === 'audio' ? 'audio' : i.kind === 'test' ? 'test' : 'book', 16)}</span><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}</span><b>${esc(fmtMin(i.seconds))}</b></div>`).join('')}</div>` : `<p class="muted">${esc(t('rep.no_data'))}</p>`}</div>
      <div class="card pad mb"><h3>${esc(t('rep.tests'))}</h3>${tests.length ? `<div class="stats3"><div class="stat"><span>${esc(t('rep.attempts'))}</span><b>${tests.length}</b></div><div class="stat"><span>${esc(t('rep.avg'))}</span><b>${avg}%</b></div><div class="stat"><span>${esc(t('rep.best'))}</span><b>${Math.round(Math.max(...pcts))}%</b></div></div>
        ${lineChart(tests.map(x => ({ v: +x.percent, label: fmtDate(x.day) + ' · ' + tr(x.title) })))}
        <div class="tbl mt">${[...tests].reverse().slice(0, 30).map(x => `<div class="trow"><small class="muted">${esc(fmtDate(x.day))}</small><span class="grow">${esc(tr(x.title))}</span><span class="muted">${x.correct}/${x.total}</span><b class="${x.percent >= 70 ? 'ok' : x.percent >= 50 ? '' : 'bad'}">${Math.round(x.percent)}%</b></div>`).join('')}</div>` : `<p class="muted">${esc(t('rep.no_data'))}</p>`}</div></div>`;

    $$('input[name=pp]', el).forEach(r => r.onchange = () => { period = r.value; localStorage.setItem('bio.repP', period); draw(); });
    $$('.hbar.clk', el).forEach(h => h.onclick = () => kindDetail(h.dataset.kind, items, tests));
    $$('.cbar', el).forEach(g => g.onclick = () => { const [ty, a, b] = g.dataset.k.split(':'); dayDetail(uid, a, b || a, byDay, tests); });
    $$('[data-sum]', el).forEach(b => b.onclick = async () => {
      const k = b.dataset.sum; if (k === 'today') return dayDetail(uid, dayStr(today), dayStr(today), byDay, tests);
      if (k === 'week') return dayDetail(uid, last7[0], last7[6], byDay, tests);
      const m = await sb.rpc('report_usage', { p_user: uid, p_from: wideFrom, p_to: to }); const bd = {}; (m.data || []).forEach(r => { (bd[r.day] ||= { app: 0, video: 0, audio: 0, book: 0, test: 0 })[r.kind] += +r.seconds / 60; });
      dayDetail(uid, Object.keys(bd).sort()[0] || to, to, bd, tests, true);
    });
  };
  await draw();
}

// Kategoriya bosilganda: aynan qaysi material(lar)ga qancha vaqt ketgani
function kindDetail(kind, items, tests) {
  const list = items.filter(i => i.kind === kind), tot = list.reduce((a, i) => a + +i.seconds, 0);
  modal(`<h3>${esc(t('rep.' + kind))} · ${esc(fmtMin(tot))}</h3>${list.length ? `<div class="tbl">${list.map(i => `<div class="trow"><span class="item-ic ${kind}">${ic(kind === 'video' ? 'video' : kind === 'audio' ? 'audio' : kind === 'test' ? 'test' : 'book', 16)}</span><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}</span><b>${esc(fmtMin(i.seconds))}</b></div>`).join('')}</div>` : `<p class="muted">${esc(t('rep.no_data'))}</p>`}`, { cls: 'wide' });
}

// Kunlik to'liq hisobot oynasi: har bir kun uchun vaqt + ichidagi materiallar
async function dayDetail(uid, from, to, byDay, tests, allTime) {
  const m = modal(`<h3>${esc(t('rep.day_detail'))}</h3><div id="dd">${spinner()}</div>`, { cls: 'wide' });
  const days = []; for (let d = new Date(from); dayStr(d) <= to; d = addDays(d, 1)) days.push(dayStr(d)); days.reverse();
  const shown = allTime ? days.filter(d => byDay[d]) : days;
  const bucket = shown.map(d => { const x = byDay[d] || { app: 0, video: 0, audio: 0, book: 0, test: 0 }; const o = { key: d, label: fmtDate(d), video: x.video, audio: x.audio || 0, book: x.book, test: x.test, app: x.app }; o.other = Math.max(0, o.app - o.video - o.audio - o.book - o.test); o.total = o.video + o.audio + o.book + o.test + o.other; return o; }).reverse();
  const first = shown.slice(0, 31);
  const per = await Promise.all(first.map(d => sb.rpc('report_usage_items', { p_user: uid, p_from: d, p_to: d })));
  $('#dd', m.el).innerHTML = `${bucket.length > 1 && bucket.length <= 62 ? stackedChart(bucket.slice(-31)) : ''}
    <div class="tbl">${first.map((d, i) => { const x = byDay[d] || { app: 0, video: 0, audio: 0, book: 0, test: 0 }, its = per[i].data || [], ts = tests.filter(q => q.day === d);
      return `<details class="dday" ${first.length === 1 ? 'open' : ''}><summary><b>${esc(fmtDate(d))}</b><span class="grow"></span><span>${esc(fmtMin((x.video + (x.audio || 0) + x.book + x.test + Math.max(0, x.app - x.video - (x.audio || 0) - x.book - x.test)) * 60))}</span></summary>
        <div class="chips"><span class="chip" style="border-color:${COL.video}">${esc(t('rep.video'))}: ${Math.round(x.video)} ${esc(t('rep.min'))}</span><span class="chip" style="border-color:${COL.audio}">${esc(t('rep.audio'))}: ${Math.round(x.audio || 0)} ${esc(t('rep.min'))}</span><span class="chip" style="border-color:${COL.other}">${esc(t('rep.other'))}: ${Math.round(Math.max(0, x.app - x.video - (x.audio || 0) - x.book - x.test))} ${esc(t('rep.min'))}</span><span class="chip" style="border-color:${COL.book}">${esc(t('rep.book'))}: ${Math.round(x.book)} ${esc(t('rep.min'))}</span><span class="chip" style="border-color:${COL.test}">${esc(t('rep.test'))}: ${Math.round(x.test)} ${esc(t('rep.min'))}</span></div>
        ${its.map(i => `<div class="trow"><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}</span><b>${esc(fmtMin(i.seconds))}</b></div>`).join('')}
        ${ts.map(q => `<div class="trow"><span class="grow">🧪 ${esc(tr(q.title))}</span><span class="muted">${q.correct}/${q.total}</span><b>${Math.round(q.percent)}%</b></div>`).join('')}</details>`; }).join('')}</div>`;
}

route('/reports', async ({ el, alive }) => renderReport(el, state.user.id, null, alive), { auth: true });
route('/reports/user/:uid', async ({ el, params, alive }) => {
  const { data } = await sb.rpc('user_card', { p_user: params.uid });
  const c = Array.isArray(data) ? data[0] : data;
  await renderReport(el, params.uid, c?.name || '', alive);
}, { auth: true });

// ---- Reyting: barcha foydalanuvchilar, kategoriyalar bo'yicha vaqt
const ini = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const CATS = ['total', 'video', 'audio', 'book', 'test', 'browse'];
const CIC = { total: 'trophy', video: 'video', audio: 'audio', book: 'book', test: 'test', browse: 'globe' };
const catName = k => t(k === 'total' ? 'rep.total' : k === 'browse' ? 'rep.other' : 'rep.' + k);
const catCol = k => k === 'browse' ? COL.other : k === 'total' ? '#16a34a' : COL[k];

// Reytingdagi foydalanuvchi sahifasi (to'liq natija): tepada profil, pastda kartalar va tafsilotlar
const PERD = { today: 1, '7': 7, '30': 30, all: 3650 };
const perRange = per => { const today = new Date(); return [dayStr(addDays(today, -((PERD[per] || 1) - 1))), dayStr(today)]; };
route('/rating/u/:uid', async ({ el, params, q, alive }) => {
  const per = PERD[q.p] ? q.p : 'today', [from, to] = perRange(per), uid = params.uid;
  const [lb, a, b2] = await Promise.all([sb.rpc('leaderboard', { p_from: from, p_to: to }), sb.rpc('rating_user_items', { p_user: uid, p_from: from, p_to: to }), sb.rpc('rating_user_tests', { p_user: uid, p_from: from, p_to: to })]);
  if (!alive()) return;
  const all = (lb.data || []).map(r => ({ ...r, video: +r.video, audio: +r.audio, book: +r.book, test: +r.test, browse: +r.browse, total: +r.total }));
  const r = all.find(x => x.user_id === uid) || { user_id: uid, name: '—', video: 0, audio: 0, book: 0, test: 0, browse: 0, total: 0 };
  const rank = [...all].sort((x, y) => y.total - x.total).findIndex(x => x.user_id === uid) + 1;
  let items = [], tests = [], ok = true;
  if (a.error) { const f = await sb.rpc('report_usage_items', { p_user: uid, p_from: from, p_to: to }); if (f.error) ok = false; else items = f.data || []; } else items = a.data || [];
  if (b2.error) { const f = await sb.rpc('report_tests', { p_user: uid, p_from: from, p_to: to }); if (!f.error) tests = (f.data || []).map(x => ({ ...x, created_at: x.day })); } else tests = b2.data || [];
  const KS = ['video', 'audio', 'book', 'test', 'browse'], KI = { video: 'video', audio: 'audio', book: 'book', test: 'test', browse: 'globe' };
  const avg = tests.length ? Math.round(tests.reduce((q2, x) => q2 + (+x.percent || 0), 0) / tests.length) : null;
  const perName = { today: t('rep.today'), '7': t('rep.p7'), '30': t('rep.p30'), all: t('rep.all') }[per];
  const stat = (ico, val, lab, col) => `<div class="pstat"><span class="pico" style="background:${col}">${ic(ico, 22)}</span><b>${val}</b><small>${esc(lab)}</small></div>`;
  const rows = KS.map(k => ({ k, sec: r[k] || 0, list: k === 'test' ? tests : items.filter(i => i.kind === k) })).filter(x => x.sec > 0 || x.list.length);
  const max = Math.max(1, ...rows.map(x => x.sec));
  el.innerHTML = `<div class="page pprofile"><div class="phero"><a class="btn ghost sm phback" href="#/rating">${ic('back')}</a>
      <span class="avatar xl">${r.avatar_url ? `<img src="${esc(r.avatar_url)}" alt="">` : esc(ini(r.name))}</span>
      <h2>${esc(r.name || '—')}</h2><div class="pchips"><span class="pchip">🏆 ${rank ? '#' + rank : '—'}</span><span class="pchip">⏱ ${esc(fmtMin(r.total))}</span><span class="pchip">${esc(perName)}</span></div></div>
    <div class="pgrid">${stat('trophy', rank ? '#' + rank : '—', t('rep.rank') === 'rep.rank' ? '#' : t('rep.rank'), 'linear-gradient(135deg,#f59e0b,#fbbf24)')}${stat('clock', esc(fmtMin(r.total)), t('rep.total'), 'linear-gradient(135deg,#16a34a,#4ade80)')}
      ${KS.filter(k => k !== 'browse').map(k => stat(KI[k], esc(fmtMin(r[k] || 0)), catName(k), 'linear-gradient(135deg,' + catCol(k) + ',' + catCol(k) + 'cc)')).join('')}
      ${stat('test', avg === null ? '—' : avg + '%', t('rep.tests_n', { n: tests.length }), 'linear-gradient(135deg,#0ea5e9,#38bdf8)')}</div>
    <h3 class="mt">${esc(t('rep.detail') === 'rep.detail' ? '' : t('rep.detail'))}</h3>
    <div class="card pad">${rows.length ? rows.map(x => `<details class="udrow" style="--cc:${catCol(x.k)}"><summary><span class="udl">${esc(catName(x.k))}</span><span class="udv">${esc(fmtMin(x.sec))}</span><span class="udb"><i style="width:${Math.max(3, x.sec / max * 100)}%"></i></span></summary>
      <div class="udi">${x.k === 'browse' ? `<p class="muted small">${esc(t('rep.browse_note'))}</p>` : x.list.length ? x.list.map(i => x.k === 'test'
        ? `<div class="trow"><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}<br><small class="muted">${esc(fmtDate(i.created_at))}</small></span><span class="muted">${i.correct}/${i.total}</span><b>${Math.round(i.percent)}%</b></div>`
        : `<div class="trow"><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}</span><b>${esc(fmtMin(i.seconds))}</b></div>`).join('') : `<p class="muted small">${esc(ok ? t('rep.no_data') : t('rep.unavail'))}</p>`}</div></details>`).join('')
      : `<p class="muted center">${esc(ok ? t('rep.no_data') : t('rep.unavail'))}</p>`}</div>
    ${state.isAdmin ? `<a class="btn block mt" href="#/reports/user/${uid}">${esc(t('rep.full'))}</a>` : ''}</div>`;
}, { auth: true });

route('/rating', async ({ el, alive }) => {
  if (!state.isAdmin && state.settings?.app?.leaderboard === false) { el.innerHTML = `<div class="page"><p class="muted center pad">${esc(t('rep.lb_off'))}</p></div>`; return; }
  let per = localStorage.getItem('bio.lbP') || 'today'; const cat = 'total';
  const cache = {}; let rows = [], err = false, range = ['', ''];
  const load = async () => {
    range = perRange(per);
    await Promise.all(Object.keys(PERD).filter(k => !cache[k]).map(async k => {
      const rg = perRange(k), { data, error } = await sb.rpc('leaderboard', { p_from: rg[0], p_to: rg[1] });
      if (error) { console.warn('leaderboard:', error.message); cache[k] = { err: true, rows: [] }; }
      else cache[k] = { err: false, rows: (data || []).map(r => ({ ...r, video: +r.video, audio: +r.audio, book: +r.book, test: +r.test, browse: +r.browse, total: +r.total })) };
    }));
    ({ err, rows } = cache[per]);
  };
  const paint = () => {
    const key = r => cat === 'test' ? r.test + (r.tests || 0) * 1e-3 : r[cat], sorted = [...rows].filter(r => cat === 'test' ? (r.test > 0 || r.tests > 0) : true).sort((a, b) => key(b) - key(a)), max = Math.max(1, ...sorted.map(r => r[cat]));
    const rank = k => { const l = [...rows].sort((a, b) => b[k] - a[k]), i = l.findIndex(r => r.user_id === state.user.id); return i < 0 || !l[i][k] ? null : i + 1; };
    $('#lb', el).innerHTML = `<h1>${esc(t('rep.lb'))}</h1>
      ${(() => { const top = [...rows].filter(r => r.total > 0).sort((a, b) => b.total - a.total).slice(0, 12); return top.length ? `<div class="ticker"><div class="tkin">${[0, 1].map(() => top.map((r, i) => `<span class="tki"><b>${i + 1}.</b> ${esc(r.name || '—')} <em>${esc(fmtMin(r.total))}</em></span>`).join('')).join('')}</div></div>` : ''; })()}
      <div class="ptabs">${[['today', t('rep.today')], ['7', t('rep.p7')], ['30', t('rep.p30')], ['all', t('rep.all')]].map(([k, n]) => { const l = [...(cache[k]?.rows || [])].sort((a, b) => b.total - a.total)[0]; return `<button type="button" class="ptab ${k === per ? 'on' : ''}" data-per="${k}"><span>${esc(n)}</span><b>${l && l.total > 0 ? '👑 ' + esc((l.name || '').split(' ')[0]) : '—'}</b></button>`; }).join('')}</div>
      ${err || !sorted.length ? '' : (() => { const mi = sorted.findIndex(r => r.user_id === state.user.id), top = sorted.slice(0, 3).filter(r => r[cat] > 0), av = r => `<span class="avatar ${'lg'}">${r.avatar_url ? `<img src="${esc(r.avatar_url)}" alt="">` : esc(ini(r.name))}</span>`;
        const pod = top.length >= 2 ? `<div class="podium">${[1, 0, 2].filter(i => top[i]).map(i => `<button type="button" class="pod p${i + 1}" data-u="${top[i].user_id}">${i === 0 ? '<span class="crown">👑</span>' : ''}${av(top[i])}<b class="pn">${esc((top[i].name || '—').split(' ')[0])}</b><span class="pv">${esc(fmtMin(top[i][cat]))}</span><span class="pb">${i + 1}</span></button>`).join('')}</div>` : '';
        return `${pod}${mi >= 0 ? `<div class="card pad merank"><span class="lbrank">${mi + 1}</span><div class="grow"><b>${esc(t('rep.me_rank'))}</b><br><small class="muted">${esc(catName(cat))}: ${esc(fmtMin(sorted[mi][cat]))} / ${rows.length}</small></div></div>` : ''}`; })()}
      <div id="lbody">${err ? `<p class="muted center pad">${esc(t('rep.unavail'))}</p>` : sorted.length ? `<div class="lb">${sorted.map((r, i) => `<button type="button" class="lbrow card ${r.user_id === state.user.id ? 'me' : ''}" data-u="${r.user_id}"><span class="lbrank r${i < 3 ? i + 1 : ''}">${i + 1}</span>
        <span class="avatar sm">${r.avatar_url ? `<img src="${esc(r.avatar_url)}" alt="">` : esc(ini(r.name))}</span>
        <span class="grow left"><b>${esc(r.name || '—')}</b>${cat === 'test' ? `<small class="muted">${esc(t('rep.tests_n', { n: r.tests || 0 }))}${r.avg_percent != null ? ' · ' + Math.round(r.avg_percent) + '%' : ''}</small>` : ''}
</span>
        <b class="lbtime">${esc(fmtMin(r[cat]))}</b></button>`).join('')}</div>` : `<p class="muted center pad">${esc(t('rep.no_data'))}</p>`}</div>`;
    $$('[data-per]', el).forEach(b => b.onclick = async () => { per = b.dataset.per; localStorage.setItem('bio.lbP', per); await load(); if (alive()) paint(); });
    $$('[data-u]', el).forEach(b => b.onclick = () => go('/rating/u/' + b.dataset.u + '?p=' + per));
  };
  el.innerHTML = `<div class="page"><div id="lb">${spinner()}</div></div>`;
  await load(); if (!alive()) return; paint();
}, { auth: true });

route('/reports/all', async () => { location.replace('#/rating'); }, { auth: true });
