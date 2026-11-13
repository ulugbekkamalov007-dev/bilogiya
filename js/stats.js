// Statistika (admin va o'qituvchi): umumiy ko'rsatkichlar va diagrammalar. Reytingdan farqi: reyting — kim qancha o'qigani (o'rinlar), statistika — platforma bo'yicha umumiy son va dinamika.
import { sb, state, route, esc, ic, $, $$, dayStr, addDays, fmtMin } from './core.js';
import { T, skeleton, errBox, dbErr } from './ui.js';
import { donut, bars, CCOL } from './charts.js';

const KN = () => ({ video: T('Video', 'Видео', 'Video'), audio: T('Audio', 'Аудио', 'Audio'), book: T('Kitob', 'Книги', 'Books'), test: T('Test', 'Тесты', 'Tests'), app: T('Ilovada', 'В приложении', 'In app') });

route('/stats', async ({ el, alive }) => {
  if (!state.isAdmin && state.profile?.role !== 'teacher') { location.replace('#/reports'); return; }
  let days = +localStorage.getItem('bio.stD') || 30;
  const draw = async () => {
    el.innerHTML = `<div class="page wide"><div class="row between wrap"><h1 class="mb0">${esc(T('Statistika', 'Статистика', 'Statistics'))}</h1>
      <div class="catchips">${[7, 30, 90].map(d => `<button type="button" class="cchip ${d === days ? 'on' : ''}" data-d="${d}">${d} ${esc(T('kun', 'дн.', 'days'))}</button>`).join('')}</div></div>
      <p class="muted small">${esc(state.isAdmin ? T('Barcha talabalar bo\'yicha umumiy ko\'rsatkichlar.', 'Общие показатели по всем студентам.', 'Overall figures for all students.') : T('Sizning guruhlaringizdagi talabalar bo\'yicha.', 'По студентам ваших групп.', 'For students in your groups.'))}</p>
      <div id="sb">${skeleton(4, 90)}</div></div>`;
    $$('[data-d]', el).forEach(b => b.onclick = () => { days = +b.dataset.d; localStorage.setItem('bio.stD', days); draw(); });
    const to = dayStr(), from = dayStr(addDays(new Date(), -(days - 1)));
    const { data: s, error } = await sb.rpc('platform_stats', { p_from: from, p_to: to }); if (!alive()) return;
    if (error) { $('#sb', el).innerHTML = errBox(dbErr(error)); return; }
    const K = KN(), bk = s.by_kind || {}, parts = ['video', 'audio', 'book', 'test'].map(k => ({ label: K[k], value: +bk[k] || 0, color: CCOL[k] })), learn = parts.reduce((a, p) => a + p.value, 0);
    const tile = (n, l, i, c) => `<div class="card pad stile" style="--c:${c || 'var(--brand)'}"><span class="item-ic">${ic(i, 20)}</span><b>${n ?? 0}</b><small class="muted">${esc(l)}</small></div>`;
    const dm = new Map((s.daily || []).map(x => [String(x.d).slice(0, 10), x])), series = [];
    for (let i = days - 1; i >= 0; i--) { const k = dayStr(addDays(new Date(), -i)), x = dm.get(k); series.push({ k, users: x ? +x.users : 0, min: x ? Math.round(+x.s / 60) : 0 }); }
    const step = days > 30 ? 3 : 1, cut = a => a.filter((_, i) => i % step === step - 1 || step === 1);
    // uzoq davrda ustunlar ko'p bo'lmasligi uchun kunlar guruhlanadi
    const grp = (key, agg) => { if (step === 1) return series.map(x => ({ label: x.k.slice(8), value: x[key], title: x.k + ': ' + x[key] })); const o = []; for (let i = 0; i < series.length; i += step) { const ch = series.slice(i, i + step); o.push({ label: ch[ch.length - 1].k.slice(5).replace('-', '.'), value: agg(ch.map(c => c[key])), title: ch[0].k + ' – ' + ch[ch.length - 1].k }); } return o; };
    $('#sb', el).innerHTML = `<div class="stiles">
        ${tile(s.users, T('Foydalanuvchilar', 'Пользователи', 'Users'), 'users')}${tile(s.active, T('Faol (davrda)', 'Активные', 'Active'), 'zap', '#f59e0b')}${tile(s.new_users, T('Yangi', 'Новые', 'New'), 'plus', '#2563eb')}
        ${tile(fmtMin(s.seconds), T('Jami o\'qish vaqti', 'Всего времени', 'Total learning time'), 'clock', '#8b5cf6')}${tile(s.sessions, T('Jami foydalanishlar', 'Всего заходов', 'Total sessions'), 'chart', '#0ea5e9')}
        ${tile((s.tests?.n || 0) + (s.tests?.n ? ' · ' + Math.round(s.tests.avg) + '%' : ''), T('Testlar · o\'rtacha', 'Тесты · среднее', 'Tests · average'), 'test', '#087C50')}
        ${tile(s.groups, T('Guruhlar', 'Группы', 'Groups'), 'users', '#ec4899')}${tile(s.materials, T('Materiallar', 'Материалы', 'Materials'), 'folder', '#d97706')}</div>
      <div class="scols mt">
        <div class="card pad"><h3>${esc(T('Vaqt turlari bo\'yicha', 'По типам', 'By type'))}</h3><div class="row" style="gap:16px;align-items:center;flex-wrap:wrap">${donut(parts, fmtMin(learn), T('jami', 'всего', 'total'))}
          <div class="stack grow">${parts.map(p => `<div class="row between"><span><i class="ldot" style="background:${p.color}"></i> ${esc(p.label)}</span><b>${esc(fmtMin(p.value))}</b></div>`).join('')}</div></div></div>
        <div class="card pad"><h3>${esc(T('Kunlik faol foydalanuvchilar', 'Активные пользователи по дням', 'Daily active users'))}</h3>${bars(grp('users', a => Math.max(...a)), '#f59e0b')}</div>
        <div class="card pad"><h3>${esc(T('Kunlik o\'qish (daqiqa)', 'Обучение по дням (мин)', 'Daily learning (min)'))}</h3>${bars(grp('min', a => a.reduce((x, y) => x + y, 0)), '#8b5cf6')}</div>
        <div class="card pad"><h3>${esc(T('Guruhlar faolligi', 'Активность групп', 'Group activity'))}</h3>${(s.top_groups || []).length ? `<div class="stack">${s.top_groups.map(g => `<a class="row between" href="#/groups" style="gap:8px"><span class="grow"><b>${esc(g.name)}</b><br><small class="muted">${g.members} ${esc(T('a\'zo', 'уч.', 'members'))}</small></span><b>${esc(fmtMin(g.seconds))}</b></a>`).join('')}</div>` : `<p class="muted">—</p>`}</div>
      </div>`;
  };
  await draw();
}, { auth: true });
