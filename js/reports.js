// Hisobotlar: foydalanish vaqti (kunlik/haftalik), video/kitob/test bo'yicha, test natijalari — SVG grafiklar.
// Admin ism bo'yicha foydalanuvchi hisobotini ham ko'ra oladi (/reports/user/:id).
import { sb, state, t, tr, addDict, route, go, esc, ic, $, $$, modal, fmtMin, fmtDate, dayStr, addDays, fmtDur, spinner } from './core.js';

addDict({
  uz: { 'rep.title': 'Hisobot', 'rep.of': '{name} — hisobot', 'rep.today': 'Bugun', 'rep.week': 'Oxirgi 7 kun', 'rep.total': 'Jami', 'rep.p7': '7 kun', 'rep.p30': '30 kun', 'rep.p12w': '12 hafta',
    'rep.time_chart': 'O\'qish vaqti (daqiqa)', 'rep.by_kind': 'Bo\'limlar bo\'yicha', 'rep.video': 'Video', 'rep.book': 'Kitob/material', 'rep.test': 'Test', 'rep.other': 'Boshqa', 'rep.app': 'Ilovada',
    'rep.items': 'Materiallar bo\'yicha vaqt', 'rep.tests': 'Test natijalari', 'rep.attempts': 'Urinishlar', 'rep.avg': 'O\'rtacha', 'rep.best': 'Eng yaxshi', 'rep.correct': 'to\'g\'ri',
    'rep.no_data': 'Ma\'lumot hali yo\'q', 'rep.day_detail': 'Kunlik to\'liq hisobot', 'rep.day': 'Kun', 'rep.min': 'daq', 'rep.close': 'Yopish', 'rep.hint': 'Kartani yoki ustunni bosing — kunlik tafsilot ochiladi',
    'rep.week_of': 'hafta', 'rep.deleted': '(o\'chirilgan material)' },
  ru: { 'rep.title': 'Отчёт', 'rep.of': '{name} — отчёт', 'rep.today': 'Сегодня', 'rep.week': 'Последние 7 дней', 'rep.total': 'Всего', 'rep.p7': '7 дней', 'rep.p30': '30 дней', 'rep.p12w': '12 недель',
    'rep.time_chart': 'Время обучения (минуты)', 'rep.by_kind': 'По разделам', 'rep.video': 'Видео', 'rep.book': 'Книги/материалы', 'rep.test': 'Тесты', 'rep.other': 'Другое', 'rep.app': 'В приложении',
    'rep.items': 'Время по материалам', 'rep.tests': 'Результаты тестов', 'rep.attempts': 'Попытки', 'rep.avg': 'Среднее', 'rep.best': 'Лучший', 'rep.correct': 'верно',
    'rep.no_data': 'Данных пока нет', 'rep.day_detail': 'Подробный отчёт по дням', 'rep.day': 'День', 'rep.min': 'мин', 'rep.close': 'Закрыть', 'rep.hint': 'Нажмите на карточку или столбец — откроется детализация по дням',
    'rep.week_of': 'неделя', 'rep.deleted': '(удалённый материал)' },
  en: { 'rep.title': 'Report', 'rep.of': '{name} — report', 'rep.today': 'Today', 'rep.week': 'Last 7 days', 'rep.total': 'Total', 'rep.p7': '7 days', 'rep.p30': '30 days', 'rep.p12w': '12 weeks',
    'rep.time_chart': 'Study time (minutes)', 'rep.by_kind': 'By section', 'rep.video': 'Video', 'rep.book': 'Books/materials', 'rep.test': 'Tests', 'rep.other': 'Other', 'rep.app': 'In app',
    'rep.items': 'Time per material', 'rep.tests': 'Test results', 'rep.attempts': 'Attempts', 'rep.avg': 'Average', 'rep.best': 'Best', 'rep.correct': 'correct',
    'rep.no_data': 'No data yet', 'rep.day_detail': 'Full daily report', 'rep.day': 'Day', 'rep.min': 'min', 'rep.close': 'Close', 'rep.hint': 'Tap a card or a bar to open the daily breakdown',
    'rep.week_of': 'week', 'rep.deleted': '(deleted item)' },
});

const COL = { video: '#2563eb', book: '#f59e0b', test: '#16a34a', other: '#94a3b8' };
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
    ['video', 'book', 'test', 'other'].forEach(k => { const h = b[k] / top * ih; if (h > 0.5) { y -= h; s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${COL[k]}"><title>${esc(b.label)} · ${t('rep.' + k)}: ${Math.round(b[k])} ${t('rep.min')}</title></rect>`; } });
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
    const rows = use.data || [], tests = tst.data || [], items = itm.data || [];
    // kun bo'yicha: {app,video,book,test}
    const byDay = {}; rows.forEach(r => { (byDay[r.day] ||= { app: 0, video: 0, book: 0, test: 0 })[r.kind] += +r.seconds / 60; });
    const days = Array.from({ length: nDays }, (_, i) => dayStr(addDays(today, -(nDays - 1 - i))));
    const mk = (key, label, ds) => { const o = { key, label, video: 0, book: 0, test: 0, app: 0 }; ds.forEach(d => { const x = byDay[d]; if (x) ['video', 'book', 'test', 'app'].forEach(k => o[k] += x[k]); }); o.other = Math.max(0, o.app - o.video - o.book - o.test); o.total = o.video + o.book + o.test + o.other; return o; };
    let buckets;
    if (weeks) { const g = {}; days.forEach(d => { const m = dayStr(mondayOf(new Date(d))); (g[m] ||= []).push(d); }); buckets = Object.entries(g).map(([m, ds]) => mk('w:' + ds[0] + ':' + ds[ds.length - 1], fmtDate(m), ds)); }
    else buckets = days.map(d => mk('d:' + d, nDays > 14 ? d.slice(8) : fmtDate(d), [d]));
    const sec = (ds, k) => ds.reduce((a, d) => a + ((byDay[d]?.[k] || 0) * 60), 0);
    const last7 = days.slice(-7), appTotal = (all.data || []).reduce((a, r) => a + (r.kind === 'app' ? +r.seconds : 0), 0);
    const kindTot = k => rows.reduce((a, r) => a + (r.kind === k ? +r.seconds : 0), 0);
    const kinds = [['video', kindTot('video')], ['book', kindTot('book')], ['test', kindTot('test')]]; kinds.push(['other', Math.max(0, kindTot('app') - kinds.reduce((a, k) => a + k[1], 0))]);
    const kmax = Math.max(1, ...kinds.map(k => k[1]));
    const pcts = tests.map(x => +x.percent), avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;

    el.innerHTML = `<div class="page"><div class="row between wrap"><h1>${esc(name ? t('rep.of', { name }) : t('rep.title'))}</h1>
      <div class="seg sm">${[['7', 'rep.p7'], ['30', 'rep.p30'], ['12w', 'rep.p12w']].map(([v, k]) => `<label><input type="radio" name="pp" value="${v}" ${v === period ? 'checked' : ''}><span>${esc(t(k))}</span></label>`).join('')}</div></div>
      <p class="muted small">${esc(t('rep.hint'))}</p>
      <div class="stats3 mb"><button class="stat card" data-sum="today"><span>${esc(t('rep.today'))}</span><b>${esc(fmtMin(sec([dayStr(today)], 'app')))}</b></button>
        <button class="stat card" data-sum="week"><span>${esc(t('rep.week'))}</span><b>${esc(fmtMin(sec(last7, 'app')))}</b></button>
        <button class="stat card" data-sum="all"><span>${esc(t('rep.total'))}</span><b>${esc(fmtMin(appTotal))}</b></button></div>
      <div class="card pad mb"><h3>${esc(t('rep.time_chart'))}</h3>${buckets.some(b => b.total > 0) ? stackedChart(buckets) : `<p class="muted center pad">${esc(t('rep.no_data'))}</p>`}
        <div class="legend">${['video', 'book', 'test', 'other'].map(k => `<span><i style="background:${COL[k]}"></i>${esc(t('rep.' + k))}</span>`).join('')}</div></div>
      <div class="card pad mb"><h3>${esc(t('rep.by_kind'))}</h3>${kinds.map(([k, s]) => `<div class="hbar"><span>${esc(t('rep.' + k))}</span><div><i style="width:${s / kmax * 100}%;background:${COL[k]}"></i></div><b>${esc(fmtMin(s))}</b></div>`).join('')}</div>
      <div class="card pad mb"><h3>${esc(t('rep.items'))}</h3>${items.length ? `<div class="tbl">${items.map(i => `<div class="trow"><span class="item-ic ${i.kind === 'book' ? 'book' : i.kind}">${ic(i.kind === 'video' ? 'video' : i.kind === 'test' ? 'test' : 'book', 16)}</span><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}</span><b>${esc(fmtMin(i.seconds))}</b></div>`).join('')}</div>` : `<p class="muted">${esc(t('rep.no_data'))}</p>`}</div>
      <div class="card pad mb"><h3>${esc(t('rep.tests'))}</h3>${tests.length ? `<div class="stats3"><div class="stat"><span>${esc(t('rep.attempts'))}</span><b>${tests.length}</b></div><div class="stat"><span>${esc(t('rep.avg'))}</span><b>${avg}%</b></div><div class="stat"><span>${esc(t('rep.best'))}</span><b>${Math.round(Math.max(...pcts))}%</b></div></div>
        ${lineChart(tests.map(x => ({ v: +x.percent, label: fmtDate(x.day) + ' · ' + tr(x.title) })))}
        <div class="tbl mt">${[...tests].reverse().slice(0, 30).map(x => `<div class="trow"><small class="muted">${esc(fmtDate(x.day))}</small><span class="grow">${esc(tr(x.title))}</span><span class="muted">${x.correct}/${x.total}</span><b class="${x.percent >= 70 ? 'ok' : x.percent >= 50 ? '' : 'bad'}">${Math.round(x.percent)}%</b></div>`).join('')}</div>` : `<p class="muted">${esc(t('rep.no_data'))}</p>`}</div></div>`;

    $$('input[name=pp]', el).forEach(r => r.onchange = () => { period = r.value; localStorage.setItem('bio.repP', period); draw(); });
    $$('.cbar', el).forEach(g => g.onclick = () => { const [ty, a, b] = g.dataset.k.split(':'); dayDetail(uid, a, b || a, byDay, tests); });
    $$('[data-sum]', el).forEach(b => b.onclick = async () => {
      const k = b.dataset.sum; if (k === 'today') return dayDetail(uid, dayStr(today), dayStr(today), byDay, tests);
      if (k === 'week') return dayDetail(uid, last7[0], last7[6], byDay, tests);
      const m = await sb.rpc('report_usage', { p_user: uid, p_from: wideFrom, p_to: to }); const bd = {}; (m.data || []).forEach(r => { (bd[r.day] ||= { app: 0, video: 0, book: 0, test: 0 })[r.kind] += +r.seconds / 60; });
      dayDetail(uid, Object.keys(bd).sort()[0] || to, to, bd, tests, true);
    });
  };
  await draw();
}

// Kunlik to'liq hisobot oynasi: har bir kun uchun vaqt + ichidagi materiallar
async function dayDetail(uid, from, to, byDay, tests, allTime) {
  const m = modal(`<h3>${esc(t('rep.day_detail'))}</h3><div id="dd">${spinner()}</div>`, { cls: 'wide' });
  const days = []; for (let d = new Date(from); dayStr(d) <= to; d = addDays(d, 1)) days.push(dayStr(d)); days.reverse();
  const shown = allTime ? days.filter(d => byDay[d]) : days;
  const bucket = shown.map(d => { const x = byDay[d] || { app: 0, video: 0, book: 0, test: 0 }; const o = { key: d, label: fmtDate(d), video: x.video, book: x.book, test: x.test, app: x.app }; o.other = Math.max(0, o.app - o.video - o.book - o.test); o.total = o.video + o.book + o.test + o.other; return o; }).reverse();
  const first = shown.slice(0, 31);
  const per = await Promise.all(first.map(d => sb.rpc('report_usage_items', { p_user: uid, p_from: d, p_to: d })));
  $('#dd', m.el).innerHTML = `${bucket.length > 1 && bucket.length <= 62 ? stackedChart(bucket.slice(-31)) : ''}
    <div class="tbl">${first.map((d, i) => { const x = byDay[d] || { app: 0, video: 0, book: 0, test: 0 }, its = per[i].data || [], ts = tests.filter(q => q.day === d);
      return `<details class="dday" ${first.length === 1 ? 'open' : ''}><summary><b>${esc(fmtDate(d))}</b><span class="grow"></span><span>${esc(fmtMin(x.app * 60))}</span></summary>
        <div class="chips"><span class="chip" style="border-color:${COL.video}">${esc(t('rep.video'))}: ${Math.round(x.video)} ${esc(t('rep.min'))}</span><span class="chip" style="border-color:${COL.book}">${esc(t('rep.book'))}: ${Math.round(x.book)} ${esc(t('rep.min'))}</span><span class="chip" style="border-color:${COL.test}">${esc(t('rep.test'))}: ${Math.round(x.test)} ${esc(t('rep.min'))}</span></div>
        ${its.map(i => `<div class="trow"><span class="grow">${esc(tr(i.title) || t('rep.deleted'))}</span><b>${esc(fmtMin(i.seconds))}</b></div>`).join('')}
        ${ts.map(q => `<div class="trow"><span class="grow">🧪 ${esc(tr(q.title))}</span><span class="muted">${q.correct}/${q.total}</span><b>${Math.round(q.percent)}%</b></div>`).join('')}</details>`; }).join('')}</div>`;
}

route('/reports', async ({ el, alive }) => renderReport(el, state.user.id, null, alive), { auth: true });
route('/reports/user/:uid', async ({ el, params, alive }) => {
  const { data } = await sb.from('profiles').select('full_name,email').eq('id', params.uid).maybeSingle();
  await renderReport(el, params.uid, data?.full_name || data?.email || '', alive);
}, { auth: true, admin: true });
