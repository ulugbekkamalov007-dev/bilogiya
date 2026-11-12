// Hisobotlar: foydalanish vaqti (kunlik/haftalik), video/kitob/test bo'yicha, test natijalari — SVG grafiklar.
// Admin ism bo'yicha foydalanuvchi hisobotini ham ko'ra oladi (/reports/user/:id).
import { sb, state, t, tr, addDict, route, go, esc, ic, $, $$, modal, fmtMin, fmtDate, dayStr, addDays, fmtDur, spinner } from './core.js';

addDict({
  uz: { 'rep.unavail': 'Ma\'lumotlar mavjud emas', 'rep.full': 'To\'liq hisobot', 'rep.tests_n': '{n} ta test', 'rep.browse_note': 'Ilovada sayr qilish — video, audio, kitob va testdan tashqari ilova ichida o\'tkazilgan vaqt', 'rep.period': 'Davr', 'rep.sortby': 'Tartiblash', 'rep.kind_hint': 'Kategoriyani bosing — qaysi materialga qancha vaqt ketgani ko\'rinadi', 'rep.mine': 'Mening hisobotim', 'rep.lb': 'Reyting', 'rep.all': 'Hammasi', 'rep.lb_off': 'Reyting o\'chirilgan', 'rep.title': 'Hisobot', 'rep.of': '{name} — hisobot', 'rep.today': 'Bugun', 'rep.week': 'Oxirgi 7 kun', 'rep.total': 'Jami', 'rep.p7': '7 kun', 'rep.p30': '30 kun', 'rep.p12w': '12 hafta',
    'rep.time_chart': 'O\'qish vaqti (daqiqa)', 'rep.by_kind': 'Bo\'limlar bo\'yicha', 'rep.video': 'Video', 'rep.book': 'Kitob/material', 'rep.test': 'Test', 'rep.other': 'Ilovada sayr qilish', 'rep.audio': 'Audio', 'rep.app': 'Ilovada',
    'rep.items': 'Materiallar bo\'yicha vaqt', 'rep.tests': 'Test natijalari', 'rep.attempts': 'Urinishlar', 'rep.avg': 'O\'rtacha', 'rep.best': 'Eng yaxshi', 'rep.correct': 'to\'g\'ri',
    'rep.no_data': 'Ma\'lumot hali yo\'q', 'rep.day_detail': 'Kunlik to\'liq hisobot', 'rep.day': 'Kun', 'rep.min': 'daq', 'rep.close': 'Yopish', 'rep.hint': 'Kartani yoki ustunni bosing — kunlik tafsilot ochiladi',
    'rep.week_of': 'hafta', 'rep.deleted': '(o\'chirilgan material)' },
  ru: { 'rep.unavail': 'Данные недоступны', 'rep.full': 'Полный отчёт', 'rep.tests_n': 'Тестов: {n}', 'rep.browse_note': 'Прогулка по приложению — время в приложении вне видео, аудио, книг и тестов', 'rep.period': 'Период', 'rep.sortby': 'Сортировка', 'rep.kind_hint': 'Нажмите на категорию — увидите, на какие материалы ушло время', 'rep.mine': 'Мой отчёт', 'rep.lb': 'Рейтинг', 'rep.all': 'Всё время', 'rep.lb_off': 'Рейтинг отключён', 'rep.title': 'Отчёт', 'rep.of': '{name} — отчёт', 'rep.today': 'Сегодня', 'rep.week': 'Последние 7 дней', 'rep.total': 'Всего', 'rep.p7': '7 дней', 'rep.p30': '30 дней', 'rep.p12w': '12 недель',
    'rep.time_chart': 'Время обучения (минуты)', 'rep.by_kind': 'По разделам', 'rep.video': 'Видео', 'rep.book': 'Книги/материалы', 'rep.test': 'Тесты', 'rep.other': 'Прогулка по приложению', 'rep.audio': 'Аудио', 'rep.app': 'В приложении',
    'rep.items': 'Время по материалам', 'rep.tests': 'Результаты тестов', 'rep.attempts': 'Попытки', 'rep.avg': 'Среднее', 'rep.best': 'Лучший', 'rep.correct': 'верно',
    'rep.no_data': 'Данных пока нет', 'rep.day_detail': 'Подробный отчёт по дням', 'rep.day': 'День', 'rep.min': 'мин', 'rep.close': 'Закрыть', 'rep.hint': 'Нажмите на карточку или столбец — откроется детализация по дням',
    'rep.week_of': 'неделя', 'rep.deleted': '(удалённый материал)' },
  en: { 'rep.unavail': 'No data available', 'rep.full': 'Full report', 'rep.tests_n': '{n} tests', 'rep.browse_note': 'Browsing the app — time in the app outside video, audio, books and tests', 'rep.period': 'Period', 'rep.sortby': 'Sort by', 'rep.kind_hint': 'Tap a category to see which items took the time', 'rep.mine': 'My report', 'rep.lb': 'Leaderboard', 'rep.all': 'All time', 'rep.lb_off': 'Leaderboard is off', 'rep.title': 'Report', 'rep.of': '{name} — report', 'rep.today': 'Today', 'rep.week': 'Last 7 days', 'rep.total': 'Total', 'rep.p7': '7 days', 'rep.p30': '30 days', 'rep.p12w': '12 weeks',
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

// Reytingdagi foydalanuvchi bosilganda: shu kategoriyaga aloqador batafsil oyna
async function userDetail(r, cat, from, to) {
  const m = modal(`<div class="row" style="gap:10px"><span class="avatar sm">${r.avatar_url ? `<img src="${esc(r.avatar_url)}" alt="">` : esc(ini(r.name))}</span><div class="grow"><b>${esc(r.name || '—')}</b><br><small class="muted">${esc(catName(cat))} · ${esc(fmtMin(r[cat]))}</small></div></div>
    <div class="chips mt">${['video', 'audio', 'book', 'test', 'browse'].map(k => `<span class="chip" style="border-color:${catCol(k)}">${esc(catName(k))}: ${esc(fmtMin(r[k]))}</span>`).join('')}</div>
    <div id="ud" class="mt">${spinner()}</div><a class="btn block mt" href="#/reports/user/${r.user_id}" id="full">${ic('chart', 16)} ${esc(t('rep.full'))}</a>`, { cls: 'wide' });
  $('#full', m.el).onclick = () => m.close();
  const box = $('#ud', m.el);
  try {
    if (cat === 'test') {
      const { data, error } = await sb.rpc('report_tests', { p_user: r.user_id, p_from: from, p_to: to }); if (error) throw error;
      const ts = [...(data || [])].reverse().slice(0, 40);
      box.innerHTML = ts.length ? `<div class="tbl">${ts.map(x => `<div class="trow"><small class="muted">${esc(fmtDate(x.day))}</small><span class="grow">${esc(tr(x.title) || t('rep.deleted'))}</span><span class="muted">${x.correct}/${x.total}</span><b class="${x.percent >= 70 ? 'ok' : x.percent >= 50 ? '' : 'bad'}">${Math.round(x.percent)}%</b></div>`).join('')}</div>` : `<p class="muted center">${esc(t('rep.no_data'))}</p>`;
    } else if (cat === 'browse') {
      box.innerHTML = `<p class="muted center">${esc(t('rep.browse_note'))}</p>`;
    } else {
      const { data, error } = await sb.rpc('report_usage_items', { p_user: r.user_id, p_from: from, p_to: to }); if (error) throw error;
      const its = (data || []).filter(i => cat === 'total' || i.kind === cat);
      box.innerHTML = its.length ? `<div class="tbl">${its.map(i => `<div class="trow"><span class="item-ic ${i.kind}">${ic(i.kind === 'video' ? 'video' : i.kind === 'audio' ? 'audio' : i.kind === 'test' ? 'test' : 'book', 16)}</span><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}</span><b>${esc(fmtMin(i.seconds))}</b></div>`).join('')}</div>` : `<p class="muted center">${esc(t('rep.no_data'))}</p>`;
    }
  } catch (e) { console.warn('detail:', e.message); box.innerHTML = `<p class="muted center">${esc(t('rep.unavail'))}</p>`; }
}

route('/rating', async ({ el, alive }) => {
  if (!state.isAdmin && state.settings?.app?.leaderboard === false) { el.innerHTML = `<div class="page"><p class="muted center pad">${esc(t('rep.lb_off'))}</p></div>`; return; }
  let per = localStorage.getItem('bio.lbP') || 'today', cat = localStorage.getItem('bio.lbS') || 'total';
  if (!CATS.includes(cat)) cat = 'total';
  const cache = {}; let rows = [], err = false, range = ['', ''];
  const load = async () => {
    const days = { today: 1, '7': 7, '30': 30, all: 3650 }[per], today = new Date(); range = [dayStr(addDays(today, -(days - 1))), dayStr(today)];
    if (!cache[per]) {
      const { data, error } = await sb.rpc('leaderboard', { p_from: range[0], p_to: range[1] });
      if (error) { console.warn('leaderboard:', error.message); cache[per] = { err: true, rows: [] }; }
      else cache[per] = { err: false, rows: (data || []).map(r => ({ ...r, video: +r.video, audio: +r.audio, book: +r.book, test: +r.test, browse: +r.browse, total: +r.total })) };
    }
    ({ err, rows } = cache[per]);
  };
  const paint = () => {
    const sorted = [...rows].sort((a, b) => b[cat] - a[cat]), max = Math.max(1, ...sorted.map(r => r[cat]));
    const rank = k => { const l = [...rows].sort((a, b) => b[k] - a[k]), i = l.findIndex(r => r.user_id === state.user.id); return i < 0 || !l[i][k] ? null : i + 1; };
    $('#lb', el).innerHTML = `<h1>${esc(t('rep.lb'))}</h1>
      <div class="row wrap" style="gap:8px">${ddHtml('per', t('rep.period'), [['today', t('rep.today')], ['7', t('rep.p7')], ['30', t('rep.p30')], ['all', t('rep.all')]], per)}</div>
      <div class="cats" id="cats">${CATS.map(k => { const rk = rank(k); return `<button type="button" class="cat ${k === cat ? 'on' : ''}" data-c="${k}" style="--cc:${catCol(k)}"><span class="cic">${ic(CIC[k], 22)}</span><b>${esc(catName(k))}</b><small>${rk ? '#' + rk : '—'}</small></button>`; }).join('')}</div>
      <div id="lbody">${err ? `<p class="muted center pad">${esc(t('rep.unavail'))}</p>` : sorted.length ? `<div class="lb">${sorted.map((r, i) => `<button type="button" class="lbrow card ${r.user_id === state.user.id ? 'me' : ''}" data-u="${r.user_id}"><span class="lbrank r${i < 3 ? i + 1 : ''}">${i + 1}</span>
        <span class="avatar sm">${r.avatar_url ? `<img src="${esc(r.avatar_url)}" alt="">` : esc(ini(r.name))}</span>
        <span class="grow left"><b>${esc(r.name || '—')}</b>${cat === 'test' ? `<small class="muted">${esc(t('rep.tests_n', { n: r.tests || 0 }))}${r.avg_percent != null ? ' · ' + Math.round(r.avg_percent) + '%' : ''}</small>` : ''}
          <span class="lbbar" style="width:${Math.max(3, r[cat] / max * 100)}%">${cat === 'total' && r.total > 0 ? ['video', 'audio', 'book', 'test', 'browse'].map(k => `<i style="flex:${r[k]};background:${catCol(k)}"></i>`).join('') : `<i style="flex:1;background:${catCol(cat)}"></i>`}</span></span>
        <b>${esc(fmtMin(r[cat]))}</b>${ic('chev', 16)}</button>`).join('')}</div>` : `<p class="muted center pad">${esc(t('rep.no_data'))}</p>`}</div>`;
    ddBind(el, async (k, v) => { per = v; localStorage.setItem('bio.lbP', per); $('#lbody', el).innerHTML = spinner(); await load(); if (alive()) paint(); });
    $$('.cat', el).forEach(b => b.onclick = () => pick(b.dataset.c));
    $$('[data-u]', el).forEach(b => b.onclick = () => { const r = rows.find(x => x.user_id === b.dataset.u); if (r) userDetail(r, cat, range[0], range[1]); });
    $('.cat.on', el)?.scrollIntoView({ inline: 'center', block: 'nearest' });
    // o'ngga/chapga surish — kategoriyani almashtiradi
    let sx = 0, sy = 0; const body = $('#lbody', el);
    body.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    body.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) pick(CATS[Math.max(0, Math.min(CATS.length - 1, CATS.indexOf(cat) + (dx < 0 ? 1 : -1)))]); }, { passive: true });
  };
  const pick = k => { if (k === cat) return; cat = k; localStorage.setItem('bio.lbS', cat); paint(); };
  el.innerHTML = `<div class="page"><div id="lb">${spinner()}</div></div>`;
  await load(); if (!alive()) return; paint();
}, { auth: true });

route('/reports/all', async () => { location.replace('#/rating'); }, { auth: true });
