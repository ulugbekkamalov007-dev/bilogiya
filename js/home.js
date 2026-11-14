// Bosh sahifa: salomlashish, reklama banneri, qisqa statistika, davom ettirish, e'lonlar
import { sb, state, t, tr, addDict, route, esc, ic, $, $$, fmtMin, dayStr, addDays, rand, publicUrl, fmtDate, spinner } from './core.js';
import { openAnnouncement, annCard } from './news.js';
import { donut, bars, line, hbars, CCOL } from './charts.js';
import { learnSummary, learnBlock, KINDS } from './learn.js';
import { T, skeleton, empty } from './ui.js';
import { fmtSize } from './core.js';

addDict({
  uz: { 'home.hello': 'Salom, {name}! 👋', 'home.sub': 'Bugun nimani o\'rganamiz?', 'home.today': 'Bugun', 'home.week': 'Bu hafta', 'home.avg': 'O\'rtacha test',
    'home.cont': 'Davom ettirish', 'home.news': 'E\'lonlar', 'home.no_news': 'Hozircha e\'lon yo\'q', 'home.to_lib': 'Kutubxonaga o\'tish',
    'home.pending': 'Kutayotgan so\'rovlar', 'home.p_join': 'Guruhga qo\'shilish', 'home.p_buy': 'To\'plamga kirish', 'home.p_rep': 'Shikoyatlar',
    'home.rep': 'Hisobotlar', 'home.all_users': 'Foydalanuvchilar', 'home.dau14': 'Faol foydalanuvchilar (14 kun)', 'home.by30': 'Vaqt bo\'limlar bo\'yicha (30 kun)', 'home.admin_today': 'Bugun faol', 'home.admin_min': 'Bugungi jami vaqt', 'home.users': 'o\'quvchi', 'home.all_news': 'Hammasi', 'home.pinned': 'Muhim' },
  ru: { 'home.hello': 'Привет, {name}! 👋', 'home.sub': 'Что изучим сегодня?', 'home.today': 'Сегодня', 'home.week': 'Эта неделя', 'home.avg': 'Средний тест',
    'home.cont': 'Продолжить', 'home.news': 'Объявления', 'home.no_news': 'Пока нет объявлений', 'home.to_lib': 'Перейти в библиотеку',
    'home.pending': 'Ожидающие заявки', 'home.p_join': 'Вступление в группу', 'home.p_buy': 'Доступ к набору', 'home.p_rep': 'Жалобы',
    'home.rep': 'Отчёты', 'home.all_users': 'Пользователи', 'home.dau14': 'Активные пользователи (14 дней)', 'home.by30': 'Время по разделам (30 дней)', 'home.admin_today': 'Активны сегодня', 'home.admin_min': 'Всего времени сегодня', 'home.users': 'учеников', 'home.all_news': 'Все', 'home.pinned': 'Важно' },
  en: { 'home.hello': 'Hi, {name}! 👋', 'home.sub': 'What shall we learn today?', 'home.today': 'Today', 'home.week': 'This week', 'home.avg': 'Avg. test',
    'home.cont': 'Continue', 'home.news': 'Announcements', 'home.no_news': 'No announcements yet', 'home.to_lib': 'Go to library',
    'home.pending': 'Pending requests', 'home.p_join': 'Group join', 'home.p_buy': 'Collection access', 'home.p_rep': 'Reports',
    'home.rep': 'Reports', 'home.all_users': 'Users', 'home.dau14': 'Active users (14 days)', 'home.by30': 'Time by section (30 days)', 'home.admin_today': 'Active today', 'home.admin_min': 'Total time today', 'home.users': 'learners', 'home.all_news': 'All', 'home.pinned': 'Pinned' },
});


// Bosh sahifadagi katta "Statistika" tugmasi (fayl kartasi kabi katta maydon): o'qituvchi/admin — umumiy statistika, talaba — o'z statistikasi
function statTile() {
  const st = state.isAdmin || state.profile?.role === 'teacher';
  return `<a class="bigtile" href="${st ? '#/stats' : '#/reports'}"><span class="item-ic">${ic('chart', 30)}</span><div><b>${esc(st ? T('Statistika', 'Статистика', 'Statistics') : T('Mening statistikam', 'Моя статистика', 'My statistics'))}</b><small>${esc(st ? T('Foydalanuvchilar, faollik va diagrammalar', 'Пользователи, активность и диаграммы', 'Users, activity and charts') : T('Kunlik va haftalik natijalaringiz', 'Ваши результаты по дням и неделям', 'Your daily and weekly results'))}</small></div>${ic('chev', 22)}</a>`;
}

route('/home', async ({ el, alive }) => {
  const uid = state.user.id, today = dayStr(), from = dayStr(addDays(new Date(), -6));
  const [usage, att, anns, prog] = await Promise.all([
    sb.rpc('report_usage', { p_user: uid, p_from: from, p_to: today }),
    sb.from('test_attempts').select('percent').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    sb.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(25),
    sb.from('video_progress').select('item_id,last_pos,duration,completed,items(id,title,kind)').eq('user_id', uid).eq('completed', false).order('updated_at', { ascending: false }).limit(3),
  ]);
  if (!alive()) return;
  const isTeacher = !state.isAdmin && state.profile?.role === 'teacher', isStudent = !state.isAdmin && !isTeacher;
  if (isTeacher || state.isAdmin) return staffHome(el, alive, anns.data || [], isTeacher);
  let ls = null, hc = {}, grp = '';
  if (isStudent) {
    const [a, h, g] = await Promise.all([learnSummary(), sb.rpc('item_history', { p_kinds: ['video', 'audio', 'book', 'pdf', 'presentation'] }), sb.from('group_members').select('groups(name)').eq('user_id', uid).eq('status', 'approved')]);
    if (!alive()) return; ls = a; (h.data || []).forEach(r => { const k = r.kind === 'pdf' ? 'book' : r.kind; hc[k] = (hc[k] || 0) + 1; });
    grp = (g.data || []).map(x => x.groups?.name).filter(Boolean).join(', ');
    const tn = ls.tests?.n || 0; hc.test = tn;
  }
  const u = usage.data || [];
  const secToday = u.filter(r => r.day === today && r.kind !== 'app').reduce((a, r) => a + +r.seconds, 0) || u.filter(r => r.day === today).reduce((a, r) => a + +r.seconds, 0);
  const secWeek = u.reduce((a, r) => a + +r.seconds, 0);
  const pcts = (att.data || []).map(a => +a.percent), avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null;
  const all = anns.data || [], ads = all.filter(a => a.kind === 'ad'), news = all.filter(a => a.kind === 'news');
  const cont = (prog.data || []).filter(p => p.items && p.duration > 0 && p.last_pos > 5);

  let adminBox = '';
  if (state.isAdmin) {
    const cnt = q => q.then(r => r.count || 0);
    const from14 = dayStr(addDays(new Date(), -13)), from30 = dayStr(addDays(new Date(), -29));
    const [j, b, r, da, nu, d14, ov] = await Promise.all([
      cnt(sb.from('group_members').select('*', { count: 'exact', head: true }).eq('status', 'pending')),
      cnt(sb.from('access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')),
      cnt(sb.from('message_reports').select('*', { count: 'exact', head: true }).eq('status', 'open')),
      sb.rpc('admin_daily_active', { p_from: today, p_to: today }),
      cnt(sb.from('profiles').select('*', { count: 'exact', head: true })),
      sb.rpc('admin_daily_active', { p_from: from14, p_to: today }),
      sb.rpc('admin_overview', { p_from: from30, p_to: today }),
    ]);
    const hc2 = (tbl, f = x => x) => f(sb.from(tbl).select('*', { count: 'exact', head: true })).then(r => r.count || 0);
    const [nStu, nTea, nCour, nLes, nMat, nTest, nGrp, grow] = await Promise.all([hc2('profiles', q => q.eq('role', 'user')), hc2('profiles', q => q.eq('role', 'teacher')), hc2('courses'), hc2('lessons'),
      hc2('items', q => q.is('deleted_at', null).neq('kind', 'test')), hc2('items', q => q.is('deleted_at', null).eq('kind', 'test')), hc2('groups', q => q.eq('archived', false)),
      sb.from('profiles').select('created_at').gte('created_at', dayStr(addDays(new Date(), -83))).limit(5000)]);
    const gw = Array(12).fill(0); (grow.data || []).forEach(x => { const d = Math.floor((Date.now() - new Date(x.created_at)) / 864e5), w = 11 - Math.floor(d / 7); if (w >= 0 && w < 12) gw[w]++; });
    const growBars = gw.map((v, i) => ({ label: String(i + 1), value: v, title: T('Hafta', 'Неделя', 'Week') + ' ' + (i + 1) + ': ' + v }));
    
    const d = (da.data || [])[0] || { users: 0, seconds: 0 };
    const dm = {}; (d14.data || []).forEach(x => { dm[x.day] = +x.users; });
    const dd = []; for (let i = 13; i >= 0; i--) { const dk = dayStr(addDays(new Date(), -i)); dd.push({ label: dk.slice(8), value: dm[dk] || 0, title: fmtDate(dk) + ': ' + (dm[dk] || 0) }); }
    const ovr = ov.data || [], kinds = ['video', 'audio', 'book', 'test'], sec = k => +((ovr.find(x => x.kind === k) || {}).seconds || 0);
    const parts = kinds.map(k => ({ label: t('rep.' + k), value: sec(k), color: CCOL[k] })), totS = parts.reduce((a, p) => a + p.value, 0);
    adminBox = `<div class="card pad mb"><div class="row between"><h3>${esc(t('home.rep'))}</h3></div>
      <div class="admgrid">${[['users', nu, T('Jami foydalanuvchilar', 'Всего пользователей', 'Total users'), '#/admin?tab=users'], ['user', nStu, T('Talabalar', 'Студенты', 'Students'), '#/admin?tab=users'], ['cap', nTea, T('O\'qituvchilar', 'Преподаватели', 'Teachers'), '#/admin?tab=teachers'],
        ['cap', nCour, T('Kurslar', 'Курсы', 'Courses'), '#/courses'], ['list', nLes, T('Darslar', 'Уроки', 'Lessons'), '#/courses'], ['folder', nMat, T('Materiallar', 'Материалы', 'Materials'), '#/library'], ['test', nTest, T('Testlar', 'Тесты', 'Tests'), '#/tests'],
        ['users', nGrp, T('Guruhlar', 'Группы', 'Groups'), '#/groups'], ['clock', fmtMin(totS), T('O\'qish vaqti (30 kun)', 'Время обучения (30 дн.)', 'Learning time (30d)'), '#/rating'], ['zap', d.users, T('Bugun faol', 'Активны сегодня', 'Active today'), '#/rating']]
        .map(([i2, n, l, h]) => `<a class="stat card admc" href="${h}"><span class="item-ic">${ic(i2, 18)}</span><b>${esc(String(n))}</b><span>${esc(l)}</span></a>`).join('')}</div>
      <h4 class="mt">${esc(T('Foydalanuvchilar o\'sishi (12 hafta)', 'Рост пользователей (12 нед.)', 'User growth (12 weeks)'))}</h4>${bars(growBars)}
      <h4 class="mt">${esc(T('Foydalanuvchilar taqsimoti', 'Распределение пользователей', 'User distribution'))}</h4><div class="row donutrow">${donut([{ label: T('Talabalar', 'Студенты', 'Students'), value: nStu, color: '#087C50' }, { label: T('O\'qituvchilar', 'Преподаватели', 'Teachers'), value: nTea, color: '#3286CF' }, { label: 'Admin', value: Math.max(0, nu - nStu - nTea), color: '#E7A52D' }], String(nu), '')}<div class="legend col"><span><i style="background:#087C50"></i>${esc(T('Talabalar', 'Студенты', 'Students'))} · ${nStu}</span><span><i style="background:#3286CF"></i>${esc(T('O\'qituvchilar', 'Преподаватели', 'Teachers'))} · ${nTea}</span></div></div>

      <h4 class="mt">${esc(t('home.dau14'))}</h4>${bars(dd)}
      <h4 class="mt">${esc(t('home.by30'))}</h4><div class="row donutrow">${donut(parts, fmtMin(totS), '30')}<div class="legend col">${parts.map(p => `<span><i style="background:${p.color}"></i>${esc(p.label)} · ${esc(fmtMin(p.value))}</span>`).join('')}</div></div></div>
      <div class="card pad mb"><div class="row between"><h3>${esc(t('home.pending'))}</h3><a href="#/admin">${ic('chev')}</a></div>
      <div class="stats3"><a class="stat" href="#/groups"><b>${j}</b><span>${esc(t('home.p_join'))}</span></a><a class="stat" href="#/admin"><b>${b}</b><span>${esc(t('home.p_buy'))}</span></a><a class="stat" href="#/admin"><b>${r}</b><span>${esc(t('home.p_rep'))}</span></a></div>
      <p class="muted small mt">${esc(t('home.admin_today'))}: <b>${d.users}</b> ${esc(t('home.users'))} · ${esc(t('home.admin_min'))}: <b>${esc(fmtMin(d.seconds))}</b></p></div>`;
  }

  el.innerHTML = `<div class="page">
    <h1 class="mb0">${esc(t('home.hello', { name: (state.profile.full_name || '').split(' ')[0] }))}</h1><p class="muted mb">${esc(grp ? T('Guruh', 'Группа', 'Group') + ': ' + grp : t('home.sub'))}</p>
    ${ads.length ? `<div class="carousel mb" id="car">${ads.map((a, i) => `<a class="slide ${i ? '' : 'on'}" data-ad="${a.id}">
        ${a.image_path ? `<img src="${esc(publicUrl('media', a.image_path))}" alt="" loading="lazy">` : '<div class="slide-bg"></div>'}
        <div class="slide-t"><span class="tag">AD</span><b>${esc(tr(a.title))}</b><small>${esc(tr(a.body).slice(0, 90))}</small></div></a>`).join('')}
        <div class="dots2">${ads.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div>` : ''}
    ${adminBox}
    ${isStudent ? learnBlock(ls, hc) : `    <div class="stats3 mb">
      <a class="stat card" href="#/reports"><span>${esc(t('home.today'))}</span><b>${esc(fmtMin(secToday))}</b></a>
      <a class="stat card" href="#/reports"><span>${esc(t('home.week'))}</span><b>${esc(fmtMin(secWeek))}</b></a>
      <a class="stat card" href="#/reports"><span>${esc(t('home.avg'))}</span><b>${avg === null ? '—' : avg + '%'}</b></a>
    </div>`}

    ${cont.length ? `<h3>${esc(t('home.cont'))}</h3><div class="cards mb">${cont.map(p => `<a class="card pad item-row" href="#/item/${p.item_id}">
      <span class="item-ic video">${ic('video')}</span><div class="grow"><b>${esc(tr(p.items.title))}</b>
      <div class="bar"><i style="width:${Math.min(100, Math.round(p.last_pos / p.duration * 100))}%"></i></div></div>${ic('play')}</a>`).join('')}</div>` : ''}
    <div class="row between"><h3>${esc(t('home.news'))}</h3><a href="#/news">${esc(t('home.all_news'))}</a></div>
    <div class="cards">${news.length ? news.slice(0, 5).map(annCard).join('') : `<p class="muted">${esc(t('home.no_news'))}</p>`}</div>
    <div class="center mt"><a class="btn" href="#/library">${ic('book')} ${esc(t('home.to_lib'))}</a></div>
  </div>`;

  el.querySelector('h1.mb0')?.nextElementSibling?.insertAdjacentHTML('afterend', `<div class="mb">${statTile()}</div>`);
  $$('[data-ann]', el).forEach(c => c.onclick = () => openAnnouncement(all.find(a => a.id === c.dataset.ann)));
  $$('[data-ad]', el).forEach(c => c.onclick = () => openAnnouncement(all.find(a => a.id === c.dataset.ad)));
  const car = $('#car', el);
  if (car && ads.length > 1) {
    let i = 0; const iv = setInterval(() => {
      if (!car.isConnected) return clearInterval(iv);
      $$('.slide', car)[i].classList.remove('on'); $$('.dots2 i', car)[i].classList.remove('on');
      i = (i + 1) % ads.length; $$('.slide', car)[i].classList.add('on'); $$('.dots2 i', car)[i].classList.add('on');
    }, 5000);
  }
}, { auth: true });


// ---- O'qituvchi bosh sahifasi: kabinet statistikasi, tezkor amallar, so'nggi materiallar
async function teacherHome(el, alive, anns) {
  const uid = state.user.id;
  const [ov, rec, pend] = await Promise.all([sb.rpc('teacher_overview'), sb.from('items').select('id,kind,title,size_bytes,created_at').eq('created_by', uid).is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    sb.from('group_members').select('user_id,created_at,profiles(full_name),groups!inner(name,owner_id)').eq('status', 'pending').eq('groups.owner_id', uid).limit(5)]);
  if (!alive()) return; const o = ov.data || {};
  const KIC = k => k === 'pdf' ? 'book' : k;
  const card = (n, label, ic2, href) => `<a class="card pad tstat" href="${href}"><span class="item-ic">${ic(ic2, 20)}</span><b>${n ?? 0}</b><small class="muted">${esc(label)}</small></a>`;
  el.innerHTML = `<div class="page"><div class="thero card pad"><div><small class="muted">${esc(T('Assalomu alaykum,', 'Здравствуйте,', 'Hello,'))}</small><h1 class="mb0">${esc((state.profile.full_name || '').split(' ')[0] || T('O\'qituvchi', 'Преподаватель', 'Teacher'))}!</h1><small class="muted">${esc(T('Biologiya o\'qituvchisi', 'Преподаватель биологии', 'Biology teacher'))}</small></div><span class="thero-ic">${ic('flask', 44)}</span></div>
    <h3 class="mt">${esc(T('Bugungi qisqacha', 'Кратко', 'At a glance'))}</h3>
    <div class="tstats">${card(o.courses, T('Kurslarim', 'Мои курсы', 'My courses'), 'cap', '#/teach')}${card(o.materials, T('Material', 'Материалы', 'Materials'), 'folder', '#/teach/materials')}${card(o.groups, T('Guruh', 'Группы', 'Groups'), 'users', '#/groups')}${card(o.students, T('Talaba', 'Студенты', 'Students'), 'user', '#/groups')}${o.pending ? card(o.pending, T('Yangi so\'rov', 'Новые заявки', 'New requests'), 'bell', '#/groups') : ''}</div>
    <div class="tcols mt"><div class="card pad"><div class="row between"><h3 class="mb0">${esc(T('So\'nggi materiallar', 'Последние материалы', 'Recent materials'))}</h3><a href="#/teach/materials">${esc(T('Barchasi', 'Все', 'All'))}</a></div>
      ${(rec.data || []).length ? `<div class="stack mt">${rec.data.map(x => `<a class="row mrec" style="gap:10px" href="#/item/${x.id}"><span class="item-ic ${KIC(x.kind)}">${ic(KINDS[KIC(x.kind)]?.ic || 'link', 18)}</span><span class="grow"><b class="clamp2">${esc(tr(x.title))}</b><br><small class="muted">${esc(KINDS[KIC(x.kind)]?.one() || x.kind)}${x.size_bytes ? ' · ' + esc(fmtSize(x.size_bytes)) : ''} · ${esc(fmtDate(x.created_at))}</small></span></a>`).join('')}</div>` : `<p class="muted mt">${esc(T('Hali material yuklamagansiz.', 'Вы ещё не загружали материалы.', 'You have not uploaded anything yet.'))}</p>`}</div>
      <div class="card pad"><h3>${esc(T('Tezkor amallar', 'Быстрые действия', 'Quick actions'))}</h3><div class="stack"><a class="btn block" href="#/teach/materials">${ic('plus', 16)} ${esc(T('Material yuklash', 'Загрузить материал', 'Upload material'))}</a>
        <a class="btn ghost block" href="#/teach">${ic('cap', 16)} ${esc(T('Yangi kurs', 'Новый курс', 'New course'))}</a><a class="btn ghost block" href="#/tests">${ic('test', 16)} ${esc(T('Yangi test', 'Новый тест', 'New test'))}</a><a class="btn ghost block" href="#/groups">${ic('users', 16)} ${esc(T('Yangi guruh', 'Новая группа', 'New group'))}</a></div></div></div>
    ${(pend.data || []).length ? `<div class="card pad mt"><div class="row between"><h3 class="mb0">${esc(T('Guruhga qo\'shilish so\'rovlari', 'Заявки в группы', 'Group join requests'))}</h3><a href="#/groups">${esc(T('Ko\'rish', 'Открыть', 'Open'))}</a></div><div class="stack mt">${pend.data.map(p => `<div class="row" style="gap:10px"><span class="item-ic">${ic('user', 16)}</span><span class="grow"><b>${esc(p.profiles?.full_name || '')}</b><br><small class="muted">${esc(p.groups?.name || '')}</small></span></div>`).join('')}</div></div>` : ''}
    <div class="row between mt"><h3>${esc(t('home.news'))}</h3><a href="#/news">${esc(t('home.all_news'))}</a></div><div class="cards">${anns.filter(a => a.kind === 'news').slice(0, 3).map(annCard).join('') || `<p class="muted">${esc(t('home.no_news'))}</p>`}</div></div>`;
  el.querySelector('.thero')?.insertAdjacentHTML('afterend', `<div class="mt">${statTile()}</div>`);
  $$('[data-ann]', el).forEach(c => c.onclick = () => openAnnouncement(anns.find(a => a.id === c.dataset.ann)));
}


// ---- Admin va o'qituvchi uchun boshqaruv paneli (kompyuterda keng, telefonda ustma-ust)
async function staffHome(el, alive, anns, isTeacher) {
  const uid = state.user.id, to = dayStr(), from7 = dayStr(addDays(new Date(), -6)), from14 = dayStr(addDays(new Date(), -13));
  const cnt = (tb, f) => { let q = sb.from(tb).select('*', { count: 'exact', head: true }); return (f ? f(q) : q).then(r => r.count || 0, () => 0); };
  const [ps, ps14, lb, ov, rec, news, payN, appN, joinN] = await Promise.all([
    sb.rpc('platform_stats', { p_from: from7, p_to: to }), sb.rpc('platform_stats', { p_from: from14, p_to: to }), sb.rpc('leaderboard', { p_from: from7, p_to: to }),
    isTeacher ? sb.rpc('teacher_overview') : Promise.resolve({ data: null }),
    sb.from('items').select('id,kind,title,size_bytes,created_at,visible').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    Promise.resolve(anns.filter(a => a.kind === 'news').slice(0, 3)),
    state.isAdmin ? cnt('payment_requests', q => q.eq('status', 'pending')) : 0, state.isAdmin ? cnt('teacher_applications', q => q.eq('status', 'pending')) : 0,
    cnt('group_members', q => q.eq('status', 'pending'))]);
  if (!alive()) return; const s = ps.data || {}, o = ov.data || {};
  const dm = new Map(((ps14.data || {}).daily || []).map(x => [String(x.d).slice(0, 10), x])), series = [];
  for (let i = 13; i >= 0; i--) { const k = dayStr(addDays(new Date(), -i)), x = dm.get(k); series.push({ label: k.slice(8) + '.' + k.slice(5, 7), value: x ? +x.users : 0, title: fmtDate(k) }); }
  const top = [...(lb.data || [])].sort((a, b) => b.total - a.total).slice(0, 5), bk = s.by_kind || {};
  const KN = { video: 'Video', audio: 'Audio', book: T('Kitob', 'Книги', 'Books'), test: T('Test', 'Тесты', 'Tests') };
  const parts = Object.keys(KN).map(k => ({ label: KN[k], value: +bk[k] || 0, color: CCOL[k], tip: fmtMin(+bk[k] || 0) }));
  const ini = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const kpi = (n, l, i, c, href) => `<a class="card kpi" href="${href}" style="--c:${c}"><span class="item-ic">${ic(i, 22)}</span><div><b>${n ?? 0}</b><small class="muted">${esc(l)}</small></div></a>`;
  const pend = [[T('Guruhga qo\'shilish so\'rovlari', 'Заявки в группы', 'Group join requests'), joinN, '#/groups', 'users'], ...(state.isAdmin ? [[T('To\'lov so\'rovlari', 'Заявки на оплату', 'Payment requests'), payN, '#/admin?tab=billing', 'dollar'], [T('O\'qituvchi arizalari', 'Заявки преподавателей', 'Teacher applications'), appN, '#/admin?tab=teachers', 'cap']] : [])];
  const first = (state.profile.full_name || '').split(' ')[0] || (isTeacher ? T('O\'qituvchi', 'Преподаватель', 'Teacher') : 'Admin');
  const actions = [['#/teach/materials', 'plus', T('Material yuklash', 'Загрузить материал', 'Upload material'), true], ['#/teach', 'cap', T('Yangi kurs', 'Новый курс', 'New course')], ['#/tests', 'test', T('Yangi test', 'Новый тест', 'New test')], ['#/groups', 'users', T('Guruhlar', 'Группы', 'Groups')], ...(state.isAdmin ? [['#/admin?tab=users', 'user', T('Foydalanuvchilar', 'Пользователи', 'Users')], ['#/stats/report?d=30', 'file', T('Hisobot', 'Отчёт', 'Report')]] : [])];
  el.innerHTML = `<div class="page wide dash"><div class="dhero card pad"><div><small class="muted">${esc(T('Assalomu alaykum,', 'Здравствуйте,', 'Hello,'))}</small><h1 class="mb0">${esc(first)}!</h1>
      <small class="muted">${esc(fmtDate(Date.now()))} · ${esc(isTeacher ? T('O\'qituvchi kabineti', 'Кабинет преподавателя', 'Teacher workspace') : T('Boshqaruv paneli', 'Панель управления', 'Admin dashboard'))}</small></div>
      <div class="dact">${actions.map(([h, i, l, pr]) => `<a class="btn ${pr ? '' : 'ghost'}" href="${h}">${ic(i, 16)} ${esc(l)}</a>`).join('')}</div></div>
    <div class="kpis mt">${kpi(s.users, T('Foydalanuvchilar', 'Пользователи', 'Users'), 'users', '#2563eb', '#/stats')}${kpi(s.active, T('Faol (7 kun)', 'Активные (7 дн.)', 'Active (7 days)'), 'zap', '#f59e0b', '#/stats')}
      ${kpi(fmtMin(s.seconds), T('O\'qish vaqti (7 kun)', 'Время (7 дн.)', 'Study time (7 days)'), 'clock', '#8b5cf6', '#/stats')}${kpi((s.tests?.n || 0) + (s.tests?.n ? ' · ' + Math.round(s.tests.avg) + '%' : ''), T('Testlar (7 kun)', 'Тесты (7 дн.)', 'Tests (7 days)'), 'test', '#087C50', '#/stats')}
      ${kpi(s.groups, T('Guruhlar', 'Группы', 'Groups'), 'users', '#ec4899', '#/groups')}${kpi(s.materials, T('Materiallar', 'Материалы', 'Materials'), 'folder', '#d97706', '#/teach/materials')}</div>
    <div class="dgrid mt"><div class="dmain"><div class="card pad chartcard"><div class="row between"><h3 class="mb0">${esc(T('Faol foydalanuvchilar (14 kun)', 'Активные пользователи (14 дней)', 'Active users (14 days)'))}</h3><a href="#/stats">${esc(T('Statistika', 'Статистика', 'Statistics'))} ›</a></div>${line(series, '#087C50', ' ' + T('kishi', 'чел.', 'users'))}</div>
      <div class="dtwo mt"><div class="card pad chartcard"><h3>${esc(T('Vaqt turlari (7 kun)', 'По типам (7 дней)', 'By type (7 days)'))}</h3><div class="row" style="gap:14px;align-items:center;flex-wrap:wrap">${donut(parts, fmtMin(parts.reduce((a, p) => a + p.value, 0)), T('jami', 'всего', 'total'))}<div class="stack grow">${parts.map(p => `<div class="row between"><span><i class="ldot" style="background:${p.color}"></i> ${esc(p.label)}</span><b>${esc(fmtMin(p.value))}</b></div>`).join('')}</div></div></div>
        <div class="card pad"><div class="row between"><h3 class="mb0">${esc(T('So\'nggi materiallar', 'Последние материалы', 'Recent materials'))}</h3><a href="#/teach/materials">${esc(T('Barchasi', 'Все', 'All'))}</a></div>
          ${(rec.data || []).length ? `<div class="stack mt">${rec.data.map(x => { const k = x.kind === 'pdf' ? 'book' : x.kind; return `<a class="row mrec" style="gap:10px" href="#/item/${x.id}"><span class="item-ic ${k}">${ic(KINDS[k]?.ic || 'link', 18)}</span><span class="grow"><b class="clamp2">${esc(tr(x.title))}</b>${x.visible === false ? ` <span class="tag bad">${esc(T('Yashirin', 'Скрыто', 'Hidden'))}</span>` : ''}<br><small class="muted">${esc(fmtDate(x.created_at))}${x.size_bytes ? ' · ' + esc(fmtSize(x.size_bytes)) : ''}</small></span></a>`; }).join('')}</div>` : `<p class="muted mt">${esc(T('Hali material yo\'q', 'Материалов пока нет', 'No materials yet'))}</p>`}</div></div></div>
      <aside class="dside"><div class="card pad"><div class="row between"><h3 class="mb0">${esc(T('Eng faol talabalar', 'Самые активные студенты', 'Most active students'))}</h3><a href="#/rating">${esc(T('Reyting', 'Рейтинг', 'Rating'))} ›</a></div>
          ${top.length ? `<div class="plist mt">${top.map((r, i) => `<a class="prow" href="#/user/${r.user_id}"><b class="rk">${i + 1}</b><span class="avatar sm">${r.avatar_url ? `<img src="${esc(r.avatar_url)}" alt="">` : esc(ini(r.name))}</span><div class="grow"><b class="clamp1">${esc(r.name)}</b></div><b>${esc(fmtMin(r.total))}</b></a>`).join('')}</div>` : `<p class="muted mt">${esc(T('Hali faollik yo\'q', 'Активности пока нет', 'No activity yet'))}</p>`}</div>
        <div class="card pad mt"><h3>${esc(T('Kutilayotgan ishlar', 'Ожидают решения', 'Needs attention'))}</h3><div class="stack">${pend.map(([l, n, h, i]) => `<a class="row between pendrow ${n ? 'has' : ''}" href="${h}"><span class="row" style="gap:8px">${ic(i, 16)} ${esc(l)}</span><b class="pcount">${n}</b></a>`).join('')}</div></div>
        ${isTeacher ? `<div class="card pad mt"><h3>${esc(T('Mening kabinetim', 'Мой кабинет', 'My workspace'))}</h3><div class="row between"><span>${esc(T('Kurslarim', 'Курсы', 'Courses'))}</span><b>${o.courses ?? 0}</b></div><div class="row between"><span>${esc(T('Talabalar', 'Студенты', 'Students'))}</span><b>${o.students ?? 0}</b></div></div>` : ''}
        <div class="card pad mt"><div class="row between"><h3 class="mb0">${esc(t('home.news'))}</h3><a href="#/news">${esc(t('home.all_news'))}</a></div><div class="cards mt">${news.map(annCard).join('') || `<p class="muted">${esc(t('home.no_news'))}</p>`}</div></div></aside></div></div>`;
  $$('[data-ann]', el).forEach(c => c.onclick = () => openAnnouncement(anns.find(a => a.id === c.dataset.ann)));
}
