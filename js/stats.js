// Statistika (admin va o'qituvchi): umumiy ko'rsatkichlar. Kartalar bosiladi (tafsilot), grafiklar interaktiv, "Hisobot" tugmasi chop etish/PDF/CSV tayyorlaydi.
// Reytingdan farqi: Reyting — kim qancha o'qigani (o'rinlar). Statistika — platforma bo'yicha umumiy son va dinamika.
import { sb, state, route, esc, ic, $, $$, modal, dayStr, addDays, fmtMin, fmtDate, spinner } from './core.js';
import { T, skeleton, errBox, dbErr, empty } from './ui.js';
import { donut, bars, line, hbars, CCOL } from './charts.js';

const KN = () => ({ video: T('Video', 'Видео', 'Video'), audio: T('Audio', 'Аудио', 'Audio'), book: T('Kitob', 'Книги', 'Books'), test: T('Test', 'Тесты', 'Tests'), app: T('Ilovada', 'В приложении', 'In app') });
const ini = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = (n, url) => `<span class="avatar sm">${url ? `<img src="${esc(url)}" alt="">` : esc(ini(n))}</span>`;

// ---- ma'lumotlarni yig'ish (statistika va hisobot sahifasi uchun umumiy)
async function load(days) {
  const to = dayStr(), from = dayStr(addDays(new Date(), -(days - 1)));
  const [{ data: s, error }, { data: lb }] = await Promise.all([sb.rpc('platform_stats', { p_from: from, p_to: to }), sb.rpc('leaderboard', { p_from: from, p_to: to })]);
  if (error) throw error;
  const dm = new Map((s.daily || []).map(x => [String(x.d).slice(0, 10), x])), series = [];
  for (let i = days - 1; i >= 0; i--) { const k = dayStr(addDays(new Date(), -i)), x = dm.get(k); series.push({ k, users: x ? +x.users : 0, min: x ? Math.round(+x.s / 60) : 0 }); }
  return { s, lb: lb || [], series, from, to };
}
const groupSeries = (series, key, agg, step) => {
  const dd = k => k.slice(8) + '.' + k.slice(5, 7);
  if (step === 1) return series.map(x => ({ label: dd(x.k), value: x[key], title: fmtDate(x.k) }));
  const o = []; for (let i = 0; i < series.length; i += step) { const ch = series.slice(i, i + step); o.push({ label: dd(ch[ch.length - 1].k), value: agg(ch.map(c => c[key])), title: fmtDate(ch[0].k) + ' – ' + fmtDate(ch[ch.length - 1].k) }); }
  return o;
};

// ---- kartani bosganda ochiladigan tafsilotlar
const peopleList = rows => rows.length ? `<div class="plist">${rows.map(r => `<a class="prow" href="#/user/${r.user_id}">${avatar(r.name, r.avatar_url)}<div class="grow"><b>${esc(r.name || '—')}</b><br><small class="muted">${esc(r.sub || '')}</small></div>${r.right ? `<b>${esc(r.right)}</b>` : ''}</a>`).join('')}</div>` : `<p class="muted center pad">${esc(T('Ma\'lumot yo\'q', 'Нет данных', 'No data'))}</p>`;
async function detail(kind, D, days) {
  const K = KN(), s = D.s, bk = s.by_kind || {};
  const modalWith = (title, sub, body) => { const m = modal(`<h3>${esc(title)}</h3>${sub ? `<p class="muted small">${esc(sub)}</p>` : ''}<div class="detailbody">${body}</div>`); m.el.addEventListener('click', e => { if (e.target.closest('a')) m.close(); }); return m; };
  const per = T(`Oxirgi ${days} kun`, `Последние ${days} дн.`, `Last ${days} days`);
  if (kind === 'users' || kind === 'active') {
    const list = D.lb.filter(r => kind === 'users' || +r.total > 0).sort((a, b) => b.total - a.total).slice(0, 40);
    return modalWith(kind === 'users' ? T('Foydalanuvchilar', 'Пользователи', 'Users') : T('Faol foydalanuvchilar', 'Активные пользователи', 'Active users'), per + ' · ' + T('eng faollari birinchi', 'самые активные первыми', 'most active first'),
      peopleList(list.map(r => ({ ...r, sub: `${T('Testlar', 'Тесты', 'Tests')}: ${r.tests}`, right: fmtMin(r.total) }))));
  }
  if (kind === 'new') {
    const { data } = await sb.from('profiles').select('id,full_name,avatar_url,created_at').eq('role', 'user').gte('created_at', D.from + 'T00:00:00+05:00').order('created_at', { ascending: false }).limit(50);
    return modalWith(T('Yangi foydalanuvchilar', 'Новые пользователи', 'New users'), per, peopleList((data || []).map(r => ({ user_id: r.id, name: r.full_name, avatar_url: r.avatar_url, sub: T('Ro\'yxatdan o\'tgan: ', 'Регистрация: ', 'Joined: ') + fmtDate(r.created_at) }))));
  }
  if (kind === 'time') {
    const parts = ['video', 'audio', 'book', 'test'].map(k => ({ label: K[k], value: +bk[k] || 0, color: CCOL[k], text: fmtMin(+bk[k] || 0) }));
    return modalWith(T('O\'qish vaqti', 'Время обучения', 'Learning time'), per + ' · ' + T('turlar bo\'yicha taqsimot', 'распределение по типам', 'split by type'), hbars(parts.sort((a, b) => b.value - a.value)) + `<p class="muted small mt">${esc(T('Jami: ', 'Всего: ', 'Total: ') + fmtMin(s.seconds))}</p>`);
  }
  if (kind === 'sessions') {
    return modalWith(T('Jami foydalanishlar', 'Всего заходов', 'Total sessions'), T('Foydalanish — bitta foydalanuvchining bitta kunda ilovadan foydalanishi. Masalan, 3 kishi 2 kun kirsa — 6 foydalanish.', 'Заход — один пользователь за один день. Например, 3 человека в течение 2 дней — 6 заходов.', 'A session is one user active on one day. E.g. 3 users on 2 days = 6 sessions.'),
      `<div class="card pad">${line(groupSeries(D.series, 'users', a => Math.max(...a), 1).slice(-31), '#0ea5e9', T(' kishi', ' чел.', ' users'))}</div>`);
  }
  if (kind === 'tests') {
    const list = D.lb.filter(r => +r.tests > 0).sort((a, b) => b.tests - a.tests).slice(0, 40);
    return modalWith(T('Testlar', 'Тесты', 'Tests'), per + ' · ' + T('kim nechta test yechgan', 'кто сколько тестов решил', 'who solved how many'), peopleList(list.map(r => ({ ...r, sub: T('O\'rtacha natija: ', 'Средний результат: ', 'Average: ') + (r.avg_percent ?? 0) + '%', right: r.tests + ' ' + T('ta', 'шт.', '') }))));
  }
  if (kind === 'groups') {
    const g = s.top_groups || [];
    return modalWith(T('Guruhlar', 'Группы', 'Groups'), per + ' · ' + T('faolligi bo\'yicha', 'по активности', 'by activity'), g.length ? hbars(g.map(x => ({ label: x.name, sub: `${x.members} ${T('a\'zo', 'уч.', 'members')}`, value: +x.seconds, text: fmtMin(x.seconds) })), '#ec4899') : `<p class="muted center pad">${esc(T('Hali guruh yo\'q', 'Групп пока нет', 'No groups yet'))}</p>`);
  }
  if (kind === 'materials') {
    const m = modalWith(T('Materiallar', 'Материалы', 'Materials'), T('Tizimdagi hamma materiallar kategoriya bo\'yicha', 'Все материалы системы по категориям', 'All materials by category'), spinner());
    const { data } = await sb.from('items').select('kind,youtube_id,visible').is('deleted_at', null).limit(5000);
    const c = { book: 0, video: 0, audio: 0, presentation: 0, test: 0, hidden: 0 };
    (data || []).forEach(x => { const k = x.youtube_id ? 'video' : x.kind === 'pdf' ? 'book' : x.kind; if (k in c) c[k]++; if (x.visible === false) c.hidden++; });
    const rows = [['book', T('Kitob', 'Книги', 'Books'), '#f59e0b'], ['video', 'Video', '#2563eb'], ['audio', 'Audio', '#8b5cf6'], ['presentation', T('Taqdimot', 'Презентации', 'Presentations'), '#ec4899'], ['test', T('Test', 'Тесты', 'Tests'), '#087C50']];
    $('.detailbody', m.el).innerHTML = hbars(rows.map(([k, l, col]) => ({ label: l, value: c[k], text: String(c[k]), color: col }))) + `<p class="muted small mt">${esc(T('Ko\'rinmas qilingan: ', 'Скрыто: ', 'Hidden: ') + c.hidden)}</p>`;
  }
}

route('/stats', async ({ el, alive }) => {
  if (!state.isAdmin && state.profile?.role !== 'teacher') { location.replace('#/reports'); return; }
  let days = +localStorage.getItem('bio.stD') || 30;
  const draw = async () => {
    el.innerHTML = `<div class="page wide"><div class="row between wrap"><div><h1 class="mb0">${esc(T('Statistika', 'Статистика', 'Statistics'))}</h1>
      <p class="muted small mb0">${esc(state.isAdmin ? T('Barcha talabalar bo\'yicha umumiy ko\'rsatkichlar. Kartani bossangiz tafsilot ochiladi.', 'Общие показатели по всем студентам. Нажмите на карточку для подробностей.', 'Overall figures for all students. Tap a card for details.') : T('Sizning guruhlaringizdagi talabalar bo\'yicha. Kartani bossangiz tafsilot ochiladi.', 'По студентам ваших групп. Нажмите на карточку для подробностей.', 'For students in your groups. Tap a card for details.'))}</p></div>
      <div class="row wrap" style="gap:8px"><div class="catchips">${[7, 30, 90].map(d => `<button type="button" class="cchip ${d === days ? 'on' : ''}" data-d="${d}">${d} ${esc(T('kun', 'дн.', 'days'))}</button>`).join('')}</div>
        <a class="btn" href="#/stats/report?d=${days}">${ic('file', 16)} ${esc(T('Hisobot tayyorlash', 'Подготовить отчёт', 'Create report'))}</a></div></div>
      <div id="sb">${skeleton(4, 90)}</div></div>`;
    $$('[data-d]', el).forEach(b => b.onclick = () => { days = +b.dataset.d; localStorage.setItem('bio.stD', days); draw(); });
    let D; try { D = await load(days); } catch (e) { if (alive()) $('#sb', el).innerHTML = errBox(dbErr(e)); return; } if (!alive()) return;
    const { s, series } = D, K = KN(), bk = s.by_kind || {}, parts = ['video', 'audio', 'book', 'test'].map(k => ({ label: K[k], value: +bk[k] || 0, color: CCOL[k], tip: fmtMin(+bk[k] || 0) })), learn = parts.reduce((a, p) => a + p.value, 0);
    const tile = (id, n, l, i, c, hint) => `<button type="button" class="card pad stile click" data-k="${id}" style="--c:${c || 'var(--brand)'}"><span class="item-ic">${ic(i, 20)}</span><b>${n ?? 0}</b><small class="muted">${esc(l)}</small><em class="hint">${esc(hint || T('Batafsil', 'Подробнее', 'Details'))} ›</em></button>`;
    const step = days > 30 ? 3 : 1;
    $('#sb', el).innerHTML = `<div class="stiles">
        ${tile('users', s.users, T('Foydalanuvchilar', 'Пользователи', 'Users'), 'users')}${tile('active', s.active, T('Faol (davrda)', 'Активные', 'Active'), 'zap', '#f59e0b')}${tile('new', s.new_users, T('Yangi', 'Новые', 'New'), 'plus', '#2563eb')}
        ${tile('time', fmtMin(s.seconds), T('Jami o\'qish vaqti', 'Всего времени', 'Total learning time'), 'clock', '#8b5cf6')}${tile('sessions', s.sessions, T('Jami foydalanishlar', 'Всего заходов', 'Total sessions'), 'chart', '#0ea5e9')}
        ${tile('tests', (s.tests?.n || 0) + (s.tests?.n ? ' · ' + Math.round(s.tests.avg) + '%' : ''), T('Testlar · o\'rtacha', 'Тесты · среднее', 'Tests · average'), 'test', '#087C50')}
        ${tile('groups', s.groups, T('Guruhlar', 'Группы', 'Groups'), 'users', '#ec4899')}${tile('materials', s.materials, T('Materiallar', 'Материалы', 'Materials'), 'folder', '#d97706')}</div>
      <div class="scols mt">
        <div class="card pad chartcard"><h3>${esc(T('Vaqt turlari bo\'yicha', 'По типам', 'By type'))}</h3><div class="row" style="gap:18px;align-items:center;flex-wrap:wrap">${donut(parts, fmtMin(learn), T('jami', 'всего', 'total'))}
          <div class="stack grow">${parts.map(p => `<div class="row between"><span><i class="ldot" style="background:${p.color}"></i> ${esc(p.label)}</span><b>${esc(fmtMin(p.value))}</b></div>`).join('')}</div></div></div>
        <div class="card pad chartcard"><h3>${esc(T('Kunlik faol foydalanuvchilar', 'Активные пользователи по дням', 'Daily active users'))}</h3><p class="muted small">${esc(T('Ustun ustiga olib borsangiz — aniq son ko\'rinadi', 'Наведите на столбец — увидите точное число', 'Hover a bar to see the exact number'))}</p>${bars(groupSeries(series, 'users', a => Math.max(...a), step), '#f59e0b', ' ' + T('kishi', 'чел.', 'users'))}</div>
        <div class="card pad chartcard"><h3>${esc(T('Kunlik o\'qish (daqiqa)', 'Обучение по дням (мин)', 'Daily learning (min)'))}</h3>${line(groupSeries(series, 'min', a => a.reduce((x, y) => x + y, 0), step), '#8b5cf6', ' ' + T('daq', 'мин', 'min'))}</div>
        <div class="card pad chartcard"><h3>${esc(T('Guruhlar faolligi', 'Активность групп', 'Group activity'))}</h3>${(s.top_groups || []).length ? hbars(s.top_groups.map(g => ({ label: g.name, sub: `${g.members} ${T('a\'zo', 'уч.', 'members')}`, value: +g.seconds, text: fmtMin(g.seconds) })), '#ec4899') : `<p class="muted">${esc(T('Hali ma\'lumot yo\'q', 'Пока нет данных', 'No data yet'))}</p>`}</div>
      </div>`;
    $$('.stile', el).forEach(b => b.onclick = () => detail(b.dataset.k, D, days));
  };
  await draw();
}, { auth: true });

// ---- Hisobot (chop etish / PDF / CSV)
route('/stats/report', async ({ el, q, alive }) => {
  if (!state.isAdmin && state.profile?.role !== 'teacher') { location.replace('#/reports'); return; }
  const days = [7, 30, 90].includes(+q.d) ? +q.d : 30; el.innerHTML = `<div class="page">${spinner()}</div>`;
  let D; try { D = await load(days); } catch (e) { el.innerHTML = `<div class="page">${errBox(dbErr(e))}</div>`; return; } if (!alive()) return;
  const { s, lb, series } = D, K = KN(), bk = s.by_kind || {}, row = (a, b) => `<tr><td>${esc(a)}</td><td class="end"><b>${esc(String(b))}</b></td></tr>`;
  const top = [...lb].sort((a, b) => b.total - a.total).slice(0, 15);
  el.innerHTML = `<div class="page report"><div class="row between wrap noprint"><a class="btn ghost sm" href="#/stats">${ic('back')} ${esc(T('Statistika', 'Статистика', 'Statistics'))}</a>
      <div class="row wrap" style="gap:8px"><button class="btn" id="pr">${ic('file', 16)} ${esc(T('Chop etish / PDF', 'Печать / PDF', 'Print / PDF'))}</button><button class="btn ghost" id="cv">${ic('download', 16)} CSV</button></div></div>
    <div class="repdoc card pad mt"><div class="rephead"><div style="font-size:2.4rem">🧬</div><div><h1 class="mb0">BioAcademy — ${esc(T('Hisobot', 'Отчёт', 'Report'))}</h1><p class="muted mb0">${esc(fmtDate(D.from))} – ${esc(fmtDate(D.to))} (${days} ${esc(T('kun', 'дн.', 'days'))}) · ${esc(T('Tayyorlangan: ', 'Подготовлено: ', 'Prepared: ') + fmtDate(Date.now()))}</p></div></div>
      <h3>${esc(T('Asosiy ko\'rsatkichlar', 'Основные показатели', 'Key figures'))}</h3><table class="tbl2 reptbl"><tbody>
        ${row(T('Foydalanuvchilar', 'Пользователи', 'Users'), s.users)}${row(T('Faol foydalanuvchilar', 'Активные', 'Active users'), s.active)}${row(T('Yangi foydalanuvchilar', 'Новые', 'New users'), s.new_users)}
        ${row(T('Jami o\'qish vaqti', 'Всего времени', 'Total learning time'), fmtMin(s.seconds))}${row(T('Jami foydalanishlar', 'Всего заходов', 'Total sessions'), s.sessions)}
        ${row(T('Yechilgan testlar', 'Решено тестов', 'Tests taken'), (s.tests?.n || 0) + ' (' + T('o\'rtacha ', 'среднее ', 'avg ') + Math.round(s.tests?.avg || 0) + '%)')}${row(T('Guruhlar', 'Группы', 'Groups'), s.groups)}${row(T('Materiallar', 'Материалы', 'Materials'), s.materials)}</tbody></table>
      <h3>${esc(T('Vaqt turlari bo\'yicha', 'По типам', 'By type'))}</h3><table class="tbl2 reptbl"><tbody>${['video', 'audio', 'book', 'test'].map(k => row(K[k], fmtMin(+bk[k] || 0))).join('')}</tbody></table>
      <h3>${esc(T('Eng faol foydalanuvchilar', 'Самые активные пользователи', 'Most active users'))}</h3>${top.length ? `<table class="tbl2 reptbl"><thead><tr><th>#</th><th>${esc(T('Ism', 'Имя', 'Name'))}</th><th>${esc(T('Vaqt', 'Время', 'Time'))}</th><th>${esc(T('Testlar', 'Тесты', 'Tests'))}</th><th>${esc(T('O\'rtacha', 'Среднее', 'Avg'))}</th></tr></thead><tbody>${top.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${esc(fmtMin(r.total))}</td><td>${r.tests}</td><td>${r.avg_percent ?? '—'}${r.avg_percent != null ? '%' : ''}</td></tr>`).join('')}</tbody></table>` : `<p class="muted">—</p>`}
      <h3>${esc(T('Guruhlar', 'Группы', 'Groups'))}</h3>${(s.top_groups || []).length ? `<table class="tbl2 reptbl"><tbody>${s.top_groups.map(g => row(g.name + ' (' + g.members + ' ' + T('a\'zo', 'уч.', 'members') + ')', fmtMin(g.seconds))).join('')}</tbody></table>` : `<p class="muted">—</p>`}
      <h3>${esc(T('Kunlik faollik', 'Активность по дням', 'Daily activity'))}</h3><div class="chartcard">${line(groupSeries(series, 'users', a => Math.max(...a), days > 30 ? 3 : 1), '#087C50', ' ' + T('kishi', 'чел.', 'users'))}</div>
    </div></div>`;
  $('#pr', el).onclick = () => window.print();
  $('#cv', el).onclick = () => {
    const rows = [['BioAcademy', fmtDate(D.from) + ' - ' + fmtDate(D.to)], [], [T('Ko\'rsatkich', 'Показатель', 'Metric'), T('Qiymat', 'Значение', 'Value')],
      [T('Foydalanuvchilar', 'Пользователи', 'Users'), s.users], [T('Faol', 'Активные', 'Active'), s.active], [T('Yangi', 'Новые', 'New'), s.new_users], [T('O\'qish vaqti (daqiqa)', 'Время (мин)', 'Time (min)'), Math.round(s.seconds / 60)],
      [T('Foydalanishlar', 'Заходы', 'Sessions'), s.sessions], [T('Testlar', 'Тесты', 'Tests'), s.tests?.n || 0], [T('Guruhlar', 'Группы', 'Groups'), s.groups], [T('Materiallar', 'Материалы', 'Materials'), s.materials], [],
      [T('Ism', 'Имя', 'Name'), T('Vaqt (daq)', 'Время (мин)', 'Time (min)'), T('Testlar', 'Тесты', 'Tests'), T('O\'rtacha %', 'Среднее %', 'Avg %')], ...top.map(r => [r.name, Math.round(r.total / 60), r.tests, r.avg_percent ?? ''])];
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = `hisobot_${D.to}.csv`; a.click();
  };
}, { auth: true });
