// Foydalanuvchi profili (admin va o'qituvchi uchun): faqat ko'rish rejimi. Ko'rib turgan vaqt bu foydalanuvchiga yozilmaydi va hech narsani o'zgartirib bo'lmaydi.
import { sb, state, route, esc, ic, $, fmtDate, fmtMin, spinner } from './core.js';
import { T, errBox, dbErr } from './ui.js';
import { renderReport } from './reports.js';

const ini = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

route('/user/:uid', async ({ el, params, alive }) => {
  if (!state.isAdmin && state.profile?.role !== 'teacher') return location.replace('#/home');
  el.innerHTML = `<div class="page wide">${spinner()}</div>`;
  const { data: c, error } = await sb.rpc('admin_user_card', { p_user: params.uid });
  if (!alive()) return; if (error || !c) { el.innerHTML = `<div class="page">${errBox(dbErr(error || { message: 'topilmadi' }))}</div>`; return; }
  const role = c.role === 'admin' ? 'ADMIN' : c.role === 'teacher' ? T('O\'QITUVCHI', 'ПРЕПОДАВАТЕЛЬ', 'TEACHER') : T('TALABA', 'СТУДЕНТ', 'STUDENT');
  const sub = c.paid_until && new Date(c.paid_until) > new Date() ? T('Obuna: ', 'Подписка: ', 'Subscription: ') + fmtDate(c.paid_until) + T(' gacha', ' до', ' until') : T('Obuna yo\'q', 'Нет подписки', 'No subscription');
  const kv = (l, v) => `<div class="kv"><span class="muted">${esc(l)}</span><b>${v}</b></div>`;
  el.innerHTML = `<div class="page wide userview"><div class="row noprint"><a class="btn ghost sm" href="javascript:history.back()">${ic('back')}</a><span class="tag soft">${ic('eye', 12)} ${esc(T('Kuzatuv rejimi: faqat ko\'rish', 'Режим просмотра: только чтение', 'View-only mode'))}</span></div>
    <div class="card pad ucard mt"><span class="avatar xl">${c.avatar_url ? `<img src="${esc(c.avatar_url)}" alt="">` : esc(ini(c.full_name))}</span>
      <div class="grow"><h1 class="mb0">${esc(c.full_name || '—')} <span class="tag ${c.role === 'user' ? 'soft' : ''}">${esc(role)}</span>${c.blocked ? ` <span class="tag bad">${esc(T('BLOKLANGAN', 'ЗАБЛОКИРОВАН', 'BLOCKED'))}</span>` : ''}</h1>
        <p class="muted mb0">${esc(c.email || '')}</p>
        <div class="row wrap mt" style="gap:8px">${c.phone ? `<a class="btn sm" href="tel:${esc(c.phone)}">${ic('phone', 14)} ${esc(c.phone)}</a>` : `<span class="tag bad">${esc(T('Telefon kiritilmagan', 'Телефон не указан', 'No phone'))}</span>`}
          ${state.isAdmin ? `<a class="btn sm ghost" href="#/inbox/${c.id}">${ic('send', 14)} ${esc(T('Xabar yozish', 'Написать', 'Message'))}</a>` : ''}</div></div></div>
    <div class="stiles mt"><div class="card pad stile"><span class="item-ic">${ic('clock', 20)}</span><b>${esc(fmtMin(c.seconds_total))}</b><small class="muted">${esc(T('Jami o\'qish vaqti', 'Всего времени', 'Total learning time'))}</small></div>
      <div class="card pad stile" style="--c:#087C50"><span class="item-ic">${ic('test', 20)}</span><b>${c.tests}${c.tests ? ' · ' + Math.round(c.avg) + '%' : ''}</b><small class="muted">${esc(T('Testlar · o\'rtacha', 'Тесты · среднее', 'Tests · average'))}</small></div>
      <div class="card pad stile" style="--c:#8b5cf6"><span class="item-ic">${ic('cap', 20)}</span><b>${c.courses}</b><small class="muted">${esc(T('Kurslar', 'Курсы', 'Courses'))}</small></div>
      <div class="card pad stile" style="--c:#f59e0b"><span class="item-ic">${ic('users', 20)}</span><b>${(c.groups || []).length}</b><small class="muted">${esc((c.groups || []).join(', ') || T('Guruh yo\'q', 'Нет групп', 'No groups'))}</small></div></div>
    <div class="card pad mt">${kv(T('Ro\'yxatdan o\'tgan', 'Регистрация', 'Joined'), esc(fmtDate(c.created_at)))}${kv(T('Oxirgi faollik', 'Последняя активность', 'Last active'), c.last_day ? esc(fmtDate(c.last_day)) : '—')}${state.isAdmin ? kv(T('Obuna', 'Подписка', 'Subscription'), esc(sub)) : ''}</div>
    <div id="rp" class="mt"></div></div>`;
  await renderReport($('#rp', el), c.id, c.full_name, alive, { back: false, embed: true });
}, { auth: true });

// ---- Foydalanuvchilar ro'yxati (o'qituvchi: o'z guruhlaridagi talabalar; admin: hamma talabalar)
route('/users', async ({ el, alive }) => {
  if (!state.isAdmin && state.profile?.role !== 'teacher') return location.replace('#/home');
  el.innerHTML = `<div class="page wide"><div class="row between wrap"><div><h1 class="mb0">${esc(T('Foydalanuvchilar', 'Пользователи', 'Users'))}</h1><p class="muted small mb0">${esc(state.isAdmin ? T('Barcha talabalar. Birortasini bossangiz, uning profili ochiladi.', 'Все студенты. Нажмите на человека, чтобы открыть профиль.', 'All students. Tap anyone to open their profile.') : T('Guruhlaringizdagi talabalar. Birortasini bossangiz, uning profili ochiladi.', 'Студенты ваших групп. Нажмите на человека, чтобы открыть профиль.', 'Students in your groups. Tap anyone to open their profile.'))}</p></div></div>
    <input class="input mt" id="us" type="search" placeholder="${esc(T('Ism, email yoki guruh…', 'Имя, email или группа…', 'Name, email or group…'))}"><div id="ul" class="mt">${spinner()}</div></div>`;
  const { data, error } = await sb.rpc('my_students'); if (!alive()) return;
  const box = $('#ul', el); if (error) { box.innerHTML = errBox(dbErr(error)); return; }
  const rows = data || [];
  const paint = () => {
    const q = $('#us', el).value.trim().toLowerCase();
    const l = rows.filter(r => !q || [r.full_name, r.email, ...(r.groups || [])].join(' ').toLowerCase().includes(q));
    box.innerHTML = l.length ? `<p class="muted small">${l.length} ${esc(T('ta', 'шт.', ''))}</p><div class="card plist">${l.map(r => `<a class="prow" href="#/user/${r.id}"><span class="avatar sm">${r.avatar_url ? `<img src="${esc(r.avatar_url)}" alt="">` : esc(ini(r.full_name))}</span>
      <div class="grow"><b>${esc(r.full_name || r.email || '—')}</b><br><small class="muted">${esc((r.groups || []).join(', ') || r.email || '')}</small></div>
      <small class="muted end">${r.last_day ? esc(T('Oxirgi: ', 'Последний: ', 'Last: ') + fmtDate(r.last_day)) : ''}</small></a>`).join('')}</div>` : `<p class="muted center pad">${esc(T('Hech narsa topilmadi', 'Ничего не найдено', 'Nothing found'))}</p>`;
  };
  $('#us', el).oninput = paint; paint();
}, { auth: true });
