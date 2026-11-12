// Bosh sahifa: salomlashish, reklama banneri, qisqa statistika, davom ettirish, e'lonlar
import { sb, state, t, tr, addDict, route, esc, ic, $, $$, fmtMin, dayStr, addDays, rand, publicUrl, fmtDate, spinner } from './core.js';
import { openAnnouncement, annCard } from './news.js';
import { donut, bars, CCOL } from './charts.js';

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

route('/home', async ({ el, alive }) => {
  const uid = state.user.id, today = dayStr(), from = dayStr(addDays(new Date(), -6));
  const [usage, att, anns, prog] = await Promise.all([
    sb.rpc('report_usage', { p_user: uid, p_from: from, p_to: today }),
    sb.from('test_attempts').select('percent').eq('user_id', uid).order('created_at', { ascending: false }).limit(20),
    sb.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(25),
    sb.from('video_progress').select('item_id,last_pos,duration,completed,items(id,title,kind)').eq('user_id', uid).eq('completed', false).order('updated_at', { ascending: false }).limit(3),
  ]);
  if (!alive()) return;
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
    
    const d = (da.data || [])[0] || { users: 0, seconds: 0 };
    const dm = {}; (d14.data || []).forEach(x => { dm[x.day] = +x.users; });
    const dd = []; for (let i = 13; i >= 0; i--) { const dk = dayStr(addDays(new Date(), -i)); dd.push({ label: dk.slice(8), value: dm[dk] || 0, title: fmtDate(dk) + ': ' + (dm[dk] || 0) }); }
    const ovr = ov.data || [], kinds = ['video', 'audio', 'book', 'test'], sec = k => +((ovr.find(x => x.kind === k) || {}).seconds || 0);
    const parts = kinds.map(k => ({ label: t('rep.' + k), value: sec(k), color: CCOL[k] })), totS = parts.reduce((a, p) => a + p.value, 0);
    adminBox = `<div class="card pad mb"><div class="row between"><h3>${esc(t('home.rep'))}</h3></div>
      <div class="stats3"><a class="stat" href="#/admin?tab=users"><span>${esc(t('home.all_users'))}</span><b>${nu}</b></a><a class="stat" href="#/rating"><span>${esc(t('home.admin_today'))}</span><b>${d.users}</b></a><a class="stat" href="#/rating"><span>${esc(t('home.admin_min'))}</span><b>${esc(fmtMin(d.seconds))}</b></a></div>
      <h4 class="mt">${esc(t('home.dau14'))}</h4>${bars(dd)}
      <h4 class="mt">${esc(t('home.by30'))}</h4><div class="row donutrow">${donut(parts, fmtMin(totS), '30')}<div class="legend col">${parts.map(p => `<span><i style="background:${p.color}"></i>${esc(p.label)} · ${esc(fmtMin(p.value))}</span>`).join('')}</div></div></div>
      <div class="card pad mb"><div class="row between"><h3>${esc(t('home.pending'))}</h3><a href="#/admin">${ic('chev')}</a></div>
      <div class="stats3"><a class="stat" href="#/groups"><b>${j}</b><span>${esc(t('home.p_join'))}</span></a><a class="stat" href="#/admin"><b>${b}</b><span>${esc(t('home.p_buy'))}</span></a><a class="stat" href="#/admin"><b>${r}</b><span>${esc(t('home.p_rep'))}</span></a></div>
      <p class="muted small mt">${esc(t('home.admin_today'))}: <b>${d.users}</b> ${esc(t('home.users'))} · ${esc(t('home.admin_min'))}: <b>${esc(fmtMin(d.seconds))}</b></p></div>`;
  }

  el.innerHTML = `<div class="page">
    <h1 class="mb0">${esc(t('home.hello', { name: (state.profile.full_name || '').split(' ')[0] }))}</h1><p class="muted mb">${esc(t('home.sub'))}</p>
    ${ads.length ? `<div class="carousel mb" id="car">${ads.map((a, i) => `<a class="slide ${i ? '' : 'on'}" data-ad="${a.id}">
        ${a.image_path ? `<img src="${esc(publicUrl('media', a.image_path))}" alt="" loading="lazy">` : '<div class="slide-bg"></div>'}
        <div class="slide-t"><span class="tag">AD</span><b>${esc(tr(a.title))}</b><small>${esc(tr(a.body).slice(0, 90))}</small></div></a>`).join('')}
        <div class="dots2">${ads.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div>` : ''}
    ${adminBox}
    <div class="stats3 mb">
      <a class="stat card" href="#/reports"><span>${esc(t('home.today'))}</span><b>${esc(fmtMin(secToday))}</b></a>
      <a class="stat card" href="#/reports"><span>${esc(t('home.week'))}</span><b>${esc(fmtMin(secWeek))}</b></a>
      <a class="stat card" href="#/reports"><span>${esc(t('home.avg'))}</span><b>${avg === null ? '—' : avg + '%'}</b></a>
    </div>
    ${cont.length ? `<h3>${esc(t('home.cont'))}</h3><div class="cards mb">${cont.map(p => `<a class="card pad item-row" href="#/item/${p.item_id}">
      <span class="item-ic video">${ic('video')}</span><div class="grow"><b>${esc(tr(p.items.title))}</b>
      <div class="bar"><i style="width:${Math.min(100, Math.round(p.last_pos / p.duration * 100))}%"></i></div></div>${ic('play')}</a>`).join('')}</div>` : ''}
    <div class="row between"><h3>${esc(t('home.news'))}</h3><a href="#/news">${esc(t('home.all_news'))}</a></div>
    <div class="cards">${news.length ? news.slice(0, 5).map(annCard).join('') : `<p class="muted">${esc(t('home.no_news'))}</p>`}</div>
    <div class="center mt"><a class="btn" href="#/library">${ic('book')} ${esc(t('home.to_lib'))}</a></div>
  </div>`;

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
