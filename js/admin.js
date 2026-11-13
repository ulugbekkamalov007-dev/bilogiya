// Admin paneli: foydalanuvchilar, so'rovlar/shikoyatlar, video qoidalari (kodsiz), ilova sozlamalari, platforma hisoboti, saqlash joyi
import { billingTab } from './billing.js';
import { TABS2, analyticsTab, auditTab, teachersTab, aiTab } from './admin2.js';
import { T } from './ui.js';
import { sb, state, t, tr, addDict, friendlyErr, route, go, esc, ic, $, $$, toast, modal, confirmDlg, btnBusy, fmtMin, fmtDate, fmtSize, dayStr, addDays, loadSettings, spinner } from './core.js';
import { composeAnnouncement } from './news.js';

addDict({
  uz: { 'adm.news_t': 'E\'lon va reklama', 'adm.sections': 'Boshqaruv bo\'limlari', 'nav.admin': 'Admin', 'adm.title': 'Admin paneli', 'adm.users': 'Foydalanuvchilar', 'adm.requests': 'So\'rovlar', 'adm.video': 'Video qoidalari', 'adm.app': 'Ilova', 'adm.stats': 'Platforma', 'adm.storage': 'Saqlash joyi', 'adm.news': 'E\'lonlar',
    'adm.search': 'Ism yoki email…', 'adm.7d': '7 kun', 'adm.total': 'Jami', 'adm.tests': 'Testlar', 'adm.avg': 'O\'rtacha', 'adm.last': 'Oxirgi faollik', 'adm.make_admin': 'Admin qilish', 'adm.make_user': 'Oddiy foydalanuvchi qilish', 'adm.report': 'Hisobot',
    'adm.buy_req': 'To\'plamga kirish so\'rovlari', 'adm.no_req': 'So\'rovlar yo\'q', 'adm.approve': 'Tasdiqlash', 'adm.reject': 'Rad etish', 'adm.reports': 'Xabarlarga shikoyatlar', 'adm.resolve': 'Hal qilindi', 'adm.open_group': 'Guruhga o\'tish',
    'adm.v_fwd': 'Videoni oldinga o\'tkazishga ruxsat', 'adm.v_tol': 'Oldinga o\'tishga ruxsat etilgan farq (soniya)', 'adm.v_rw': 'Orqaga qaytarish qadami (soniya)', 'adm.v_speeds': 'Ruxsat etilgan tezliklar (vergul bilan)', 'adm.v_q': 'Boshlang\'ich sifat',
    'adm.v_off': 'Oxirigacha ko\'rilgan materialni telefonga saqlashga (oflayn) ruxsat', 'adm.block': 'Bloklash', 'adm.unblock': 'Blokdan chiqarish', 'adm.delete': 'O\'chirish', 'adm.blocked': 'BLOKLANGAN', 'adm.block_q': 'Foydalanuvchi bloklansinmi? U ilovaga kira olmaydi.', 'adm.unblock_q': 'Blokdan chiqarilsinmi?', 'adm.del_q': 'Foydalanuvchi va uning BARCHA ma\'lumotlari (hisobotlar, test natijalari, xabarlar) butunlay o\'chiriladi. Qaytarib bo\'lmaydi. Davom etasizmi?', 'adm.done': 'Bajarildi', 'adm.v_resume': 'Oxirgi joydan davom ettirish', 'adm.v_pct': 'Ko\'rilgan deb hisoblash uchun (%)', 'adm.v_wm': 'Ism suv belgisi (yozib olishga qarshi)', 'adm.v_hid': 'Sahifa yopilsa videoni to\'xtatish', 'adm.saved': 'Saqlandi ✔',
    'adm.a_pin': 'PIN xato urinishlari (so\'ng chiqarib yuboriladi)', 'adm.a_chat': 'Chat fayllarini saqlash muddati (kun)', 'adm.a_voice': 'Ovozli xabar maks. uzunligi (soniya)', 'adm.a_lb': 'Reytingni yoqish (foydalanuvchilar bir-birining hisobotini ko\'radi)', 'adm.a_lbn': 'Reytingda ismlar', 'adm.a_short': 'Qisqa (Ali V.)', 'adm.a_full': 'To\'liq ism', 'rep.audio': 'Audio', 'rep.other': 'Ilovada sayr',
    'adm.users_n': 'Foydalanuvchilar soni', 'adm.active': 'Faol foydalanuvchilar', 'adm.time_by': 'Bo\'limlar bo\'yicha vaqt', 'adm.dau': 'Kunlik faol foydalanuvchilar', 'adm.st_used': 'Ishlatilgan joy', 'adm.st_free': 'Bepul reja: 1 GB',
    'adm.cleanup': 'Eski chat fayllarini tozalash', 'adm.cleanup_d': 'Belgilangan muddatdan eski ovoz, rasm va topshiriq fayllari o\'chiriladi (matn qoladi).', 'adm.cleaned': '{n} ta fayl o\'chirildi', 'adm.new_ad': 'Yangi reklama', 'adm.new_news': 'Yangi e\'lon', 'adm.all_news': 'Barcha e\'lonlar',
    'rep.video': 'Video', 'rep.book': 'Kitob/material', 'rep.test': 'Test', 'rep.app': 'Ilovada' },
  ru: { 'adm.news_t': 'Объявления и реклама', 'adm.sections': 'Разделы управления', 'nav.admin': 'Админ', 'adm.title': 'Панель админа', 'adm.users': 'Пользователи', 'adm.requests': 'Заявки', 'adm.video': 'Правила видео', 'adm.app': 'Приложение', 'adm.stats': 'Платформа', 'adm.storage': 'Хранилище', 'adm.news': 'Объявления',
    'adm.search': 'Имя или email…', 'adm.7d': '7 дней', 'adm.total': 'Всего', 'adm.tests': 'Тесты', 'adm.avg': 'Среднее', 'adm.last': 'Последняя активность', 'adm.make_admin': 'Сделать админом', 'adm.make_user': 'Сделать обычным', 'adm.report': 'Отчёт',
    'adm.buy_req': 'Заявки на доступ к наборам', 'adm.no_req': 'Заявок нет', 'adm.approve': 'Подтвердить', 'adm.reject': 'Отклонить', 'adm.reports': 'Жалобы на сообщения', 'adm.resolve': 'Решено', 'adm.open_group': 'Перейти в группу',
    'adm.v_fwd': 'Разрешить перемотку видео вперёд', 'adm.v_tol': 'Допуск перемотки вперёд (сек)', 'adm.v_rw': 'Шаг перемотки назад (сек)', 'adm.v_speeds': 'Разрешённые скорости (через запятую)', 'adm.v_q': 'Качество по умолчанию',
    'adm.v_off': 'Разрешить сохранять просмотренное до конца на телефон (офлайн)', 'adm.block': 'Заблокировать', 'adm.unblock': 'Разблокировать', 'adm.delete': 'Удалить', 'adm.blocked': 'ЗАБЛОКИРОВАН', 'adm.block_q': 'Заблокировать пользователя? Он не сможет войти в приложение.', 'adm.unblock_q': 'Разблокировать?', 'adm.del_q': 'Пользователь и ВСЕ его данные (отчёты, результаты тестов, сообщения) будут удалены навсегда. Это нельзя отменить. Продолжить?', 'adm.done': 'Готово', 'adm.v_resume': 'Продолжать с последнего места', 'adm.v_pct': '% для статуса «просмотрено»', 'adm.v_wm': 'Водяной знак с именем (против записи экрана)', 'adm.v_hid': 'Ставить на паузу при сворачивании', 'adm.saved': 'Сохранено ✔',
    'adm.a_pin': 'Попыток ввода PIN (затем выход)', 'adm.a_chat': 'Срок хранения файлов чата (дней)', 'adm.a_voice': 'Макс. длина голосового (сек)', 'adm.a_lb': 'Включить рейтинг (пользователи видят отчёты друг друга)', 'adm.a_lbn': 'Имена в рейтинге', 'adm.a_short': 'Кратко (Али В.)', 'adm.a_full': 'Полное имя', 'rep.audio': 'Аудио', 'rep.other': 'Прогулка',
    'adm.users_n': 'Всего пользователей', 'adm.active': 'Активные пользователи', 'adm.time_by': 'Время по разделам', 'adm.dau': 'Активные пользователи по дням', 'adm.st_used': 'Занято', 'adm.st_free': 'Бесплатный тариф: 1 ГБ',
    'adm.cleanup': 'Очистить старые файлы чата', 'adm.cleanup_d': 'Голос, фото и файлы работ старше срока будут удалены (текст останется).', 'adm.cleaned': 'Удалено файлов: {n}', 'adm.new_ad': 'Новая реклама', 'adm.new_news': 'Новое объявление', 'adm.all_news': 'Все объявления',
    'rep.video': 'Видео', 'rep.book': 'Книги/материалы', 'rep.test': 'Тесты', 'rep.app': 'В приложении' },
  en: { 'adm.news_t': 'News & ads', 'adm.sections': 'Management sections', 'nav.admin': 'Admin', 'adm.title': 'Admin panel', 'adm.users': 'Users', 'adm.requests': 'Requests', 'adm.video': 'Video rules', 'adm.app': 'App', 'adm.stats': 'Platform', 'adm.storage': 'Storage', 'adm.news': 'Announcements',
    'adm.search': 'Name or email…', 'adm.7d': '7 days', 'adm.total': 'Total', 'adm.tests': 'Tests', 'adm.avg': 'Average', 'adm.last': 'Last seen', 'adm.make_admin': 'Make admin', 'adm.make_user': 'Make regular user', 'adm.report': 'Report',
    'adm.buy_req': 'Collection access requests', 'adm.no_req': 'No requests', 'adm.approve': 'Approve', 'adm.reject': 'Reject', 'adm.reports': 'Message reports', 'adm.resolve': 'Resolved', 'adm.open_group': 'Open group',
    'adm.v_fwd': 'Allow skipping forward in videos', 'adm.v_tol': 'Forward-seek tolerance (sec)', 'adm.v_rw': 'Rewind step (sec)', 'adm.v_speeds': 'Allowed speeds (comma-separated)', 'adm.v_q': 'Default quality',
    'adm.v_off': 'Allow saving fully watched items to the phone (offline)', 'adm.block': 'Block', 'adm.unblock': 'Unblock', 'adm.delete': 'Delete', 'adm.blocked': 'BLOCKED', 'adm.block_q': 'Block this user? They will not be able to sign in.', 'adm.unblock_q': 'Unblock?', 'adm.del_q': 'The user and ALL their data (reports, test results, messages) will be permanently deleted. This cannot be undone. Continue?', 'adm.done': 'Done', 'adm.v_resume': 'Resume from last position', 'adm.v_pct': '% needed to count as watched', 'adm.v_wm': 'Name watermark (anti screen-recording)', 'adm.v_hid': 'Pause when the page is hidden', 'adm.saved': 'Saved ✔',
    'adm.a_pin': 'Wrong-PIN attempts (then logout)', 'adm.a_chat': 'Chat file retention (days)', 'adm.a_voice': 'Max voice message length (sec)', 'adm.a_lb': 'Enable leaderboard (users can see each other\'s reports)', 'adm.a_lbn': 'Names in leaderboard', 'adm.a_short': 'Short (Ali V.)', 'adm.a_full': 'Full name', 'rep.audio': 'Audio', 'rep.other': 'Browsing',
    'adm.users_n': 'Total users', 'adm.active': 'Active users', 'adm.time_by': 'Time by section', 'adm.dau': 'Daily active users', 'adm.st_used': 'Used', 'adm.st_free': 'Free plan: 1 GB',
    'adm.cleanup': 'Clean up old chat files', 'adm.cleanup_d': 'Voice, photos and submission files older than the retention period are deleted (text stays).', 'adm.cleaned': '{n} files deleted', 'adm.new_ad': 'New ad', 'adm.new_news': 'New announcement', 'adm.all_news': 'All announcements',
    'rep.video': 'Video', 'rep.book': 'Books/materials', 'rep.test': 'Tests', 'rep.app': 'In app' },
});

export const TABS = [['users', 'adm.users', 'users'], ['requests', 'adm.requests', 'bell'], ['video', 'adm.video', 'video'], ['app', 'adm.app', 'settings'], ['stats', 'adm.stats', 'chart'], ['news', 'adm.news_t', 'mega'], ['billing', 'bill.title', 'dollar'], ['storage', 'adm.storage', 'download'], ...TABS2];
const save = async (key, value) => { const { error } = await sb.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() }); if (error) return toast(error.message, 'err'); await loadSettings(); toast(t('adm.saved'), 'ok'); };

route('/admin', async ({ el, q, alive }) => {
  const tab = q.tab || 'stats'; if (!TABS.some(x => x[0] === tab)) { location.replace('#/admin?tab=stats'); return; }
  const title = t(TABS.find(x => x[0] === tab)[1]);
  el.innerHTML = `<div class="page wide"><div class="row"><h1 class="mb0">${esc(title)}</h1></div><div id="body" class="mt">${spinner()}</div></div>`;
  await ({ users: usersTab, requests: requestsTab, video: videoTab, app: appTab, stats: statsTab, storage: storageTab, news: newsTab, billing: billingTab, analytics: analyticsTab, audit: auditTab, teachers: teachersTab, ai: aiTab })[tab]($('#body', el));
}, { auth: true, admin: true });

function newsTab(body) {
  body.innerHTML = `<div class="cards"><button class="card pad item-row" id="nn"><span class="item-ic">${ic('mega')}</span><b class="grow left">${esc(t('adm.new_news'))}</b></button>
    <button class="card pad item-row" id="na"><span class="item-ic">${ic('mega')}</span><b class="grow left">${esc(t('adm.new_ad'))}</b></button>
    <a class="card pad item-row" href="#/news"><span class="item-ic">${ic('book')}</span><b class="grow">${esc(t('adm.all_news'))}</b>${ic('chev')}</a></div>`;
  $('#nn', body).onclick = () => composeAnnouncement(); $('#na', body).onclick = () => composeAnnouncement(null, { kind: 'ad' });
}

// ---------------- foydalanuvchilar
async function usersTab(body) {
  let cat = 'all';
  body.innerHTML = `<div class="row wrap"><input class="input grow" id="s" placeholder="${esc(t('adm.search'))}"></div><div class="chips mt" id="cats">${[['all', T('Hammasi', 'Все', 'All')], ['user', T('Talabalar', 'Студенты', 'Students')], ['teacher', T('O\'qituvchilar', 'Преподаватели', 'Teachers')], ['admin', 'Admin']].map(([k, l]) => `<button class="chip catb ${k === cat ? 'on' : ''}" data-c="${k}">${esc(l)}<b class="cn" id="cn-${k}"></b></button>`).join('')}</div><div id="ul" class="mt">${spinner()}</div>`;
  const load = async (v = '') => {
    let { data, error } = await sb.rpc('admin_users_summary', { p_search: v }); if (error) return $('#ul', body).innerHTML = `<p class="muted center pad">${esc(friendlyErr(error.message))}</p>`;
    if (!usersTab.ex) { const { data: ex } = await sb.rpc('admin_users_extra'); usersTab.ex = Object.fromEntries((ex || []).map(x => [x.user_id, x])); }
    const ini = n => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const all = data || []; ['all', 'user', 'teacher', 'admin'].forEach(k => { const n = $('#cn-' + k, body); if (n) n.textContent = ' ' + (k === 'all' ? all.length : all.filter(u => (u.role || 'user') === k).length); });
    data = cat === 'all' ? all : all.filter(u => (u.role || 'user') === cat);
    $('#ul', body).innerHTML = `<div class="ulist">${(data || []).map((u, i) => `<div class="urow2" data-i="${i}"><span class="avatar">${u.avatar_url ? `<img src="${esc(u.avatar_url)}" alt="">` : esc(ini(u.full_name))}</span>
      <div class="grow um"><b>${esc(u.full_name || '—')}</b>${u.role === 'admin' ? ' <span class="tag">ADMIN</span>' : u.role === 'teacher' ? ` <span class="tag">${esc(T('O\'QITUVCHI', 'ПРЕПОДАВАТЕЛЬ', 'TEACHER'))}</span>` : ` <span class="tag soft">${esc(T('TALABA', 'СТУДЕНТ', 'STUDENT'))}</span>`}${u.blocked ? ` <span class="tag bad">${esc(t('adm.blocked'))}</span>` : ''}<small class="muted">${esc(u.email)}${usersTab.ex[u.id] ? ' · ' + esc(fmtDate(usersTab.ex[u.id].created_at)) : ''}</small>
        ${(usersTab.ex[u.id]?.groups || []).length ? `<small class="muted">${ic('users', 12)} ${esc(usersTab.ex[u.id].groups.join(', '))}</small>` : ''}
        <small class="muted">${esc(t('adm.7d'))}: ${esc(fmtMin(u.secs_7d))} · ${esc(t('adm.total'))}: ${esc(fmtMin(u.secs_total))} · ${esc(t('adm.tests'))}: ${u.tests_total}</small></div>
      <button class="icon-btn" data-more="${i}" aria-label="menu">⋮</button></div>`).join('')}</div>`;
    const openMenu = u => { const m = modal(`<h3>${esc(u.full_name || '—')}</h3><small class="muted">${esc(u.email)}</small><div class="cards mt">
        <a class="btn block" href="#/reports/user/${u.id}">${ic('chart', 16)} ${esc(t('adm.report'))}</a><a class="btn ghost block" href="#/inbox/${u.id}">${ic('send', 16)} ${esc(t('inbox.title') === 'inbox.title' ? 'Xabar' : t('inbox.title'))}</a>
        ${u.id !== state.user.id ? `<button class="btn ghost block" data-role="${u.id}:${u.role}">${esc(t(u.role === 'admin' ? 'adm.make_user' : 'adm.make_admin'))}</button>${u.role !== 'admin' ? `<button class="btn ghost block" data-setrole="${u.id}:${u.role === 'teacher' ? 'user' : 'teacher'}">${esc(u.role === 'teacher' ? T('Oddiy foydalanuvchi qilish', 'Сделать обычным', 'Make regular user') : T('O\'qituvchi qilish', 'Сделать преподавателем', 'Make teacher'))}</button>` : ''}` : ''}
        ${u.id !== state.user.id && u.role !== 'admin' ? `<button class="btn ghost block" data-blk="${u.id}:${u.blocked ? 0 : 1}">${esc(t(u.blocked ? 'adm.unblock' : 'adm.block'))}</button><button class="btn danger block" data-del="${u.id}">${ic('trash', 16)} ${esc(t('adm.delete'))}</button>` : ''}</div>`);
      m.el.addEventListener('click', e => { if (e.target.closest('a')) m.close(); });
      $$('[data-blk]', m.el).forEach(b => b.onclick = () => { m.close(); const [id, bl] = b.dataset.blk.split(':'); act('admin_set_block', { p_id: id, p_block: bl === '1' }, t(bl === '1' ? 'adm.block_q' : 'adm.unblock_q')); });
      $$('[data-del]', m.el).forEach(b => b.onclick = () => { m.close(); act('admin_delete_user', { p_id: b.dataset.del }, t('adm.del_q'), t('adm.delete')); });
      $$('[data-role]', m.el).forEach(b => b.onclick = async () => { m.close(); const [id, r] = b.dataset.role.split(':'); if (!(await confirmDlg(b.textContent + '?'))) return; const { error: er } = await sb.rpc('admin_set_role', { p_user: id, p_role: r === 'admin' ? 'user' : 'admin' }); if (er) toast(friendlyErr(er.message), 'err'); load($('#s', body).value.trim()); });
      $$('[data-setrole]', m.el).forEach(b => b.onclick = async () => { m.close(); const [id, r] = b.dataset.setrole.split(':'); if (!(await confirmDlg(b.textContent + '?'))) return; const { error: er } = await sb.rpc('admin_set_role', { p_user: id, p_role: r }); if (er) toast(friendlyErr(er.message), 'err'); load($('#s', body).value.trim()); }); };
    const act = async (fn, args, q, ok) => { if (!(await confirmDlg(q, ok))) return; const { error } = await sb.rpc(fn, args); if (error) return toast(friendlyErr(error.message), 'err'); toast(t('adm.done'), 'ok'); load($('#s', body).value.trim()); };
    $$('.urow2', body).forEach(r => r.onclick = e => { const u = (data || [])[+r.dataset.i]; if (!u) return; if (e.target.closest('[data-more]')) openMenu(u); else location.hash = '#/reports/user/' + u.id; });
  };
  $$('.catb', body).forEach(b => b.onclick = () => { cat = b.dataset.c; $$('.catb', body).forEach(x => x.classList.toggle('on', x === b)); load($('#s', body).value.trim()); });
  let to; $('#s', body).oninput = e => { clearTimeout(to); to = setTimeout(() => load(e.target.value.trim()), 300); }; load();
}

// ---------------- so'rovlar va shikoyatlar
async function requestsTab(body) {
  const [{ data: rq }, { data: rp }] = await Promise.all([
    sb.from('access_requests').select('id,created_at,user_id,folder_id,profiles(full_name,email),folders(title,price)').eq('status', 'pending').order('created_at'),
    sb.from('message_reports').select('id,created_at,reason,group_id,message_id,profiles!reporter(full_name),messages(body,sender_name,kind)').eq('status', 'open').order('created_at'),
  ]);
  body.innerHTML = `<h3>${esc(t('adm.buy_req'))}</h3>${(rq || []).length ? `<div class="cards">${rq.map(r => `<div class="card pad item-row"><div class="grow"><b>${esc(r.profiles?.full_name || r.profiles?.email)}</b><br><small class="muted">${esc(tr(r.folders?.title))} · ${new Intl.NumberFormat('uz-UZ').format(r.folders?.price || 0)}</small></div>
      <button class="btn sm" data-ok="${r.id}">${ic('check', 14)} ${esc(t('adm.approve'))}</button><button class="btn sm ghost" data-no="${r.id}">${esc(t('adm.reject'))}</button></div>`).join('')}</div>` : `<p class="muted">${esc(t('adm.no_req'))}</p>`}
    <h3 class="mt">${esc(t('adm.reports'))}</h3>${(rp || []).length ? `<div class="cards">${rp.map(r => `<div class="card pad"><div class="row between"><b>${esc(r.profiles?.full_name || '')}</b><small class="muted">${esc(fmtDate(r.created_at))}</small></div>
      <p class="pre">«${esc(r.messages?.kind === 'text' ? r.messages.body : '[' + (r.messages?.kind || '?') + ']')}» — <i>${esc(r.messages?.sender_name || '')}</i></p>${r.reason ? `<p class="muted">${esc(r.reason)}</p>` : ''}
      <div class="row"><a class="btn sm ghost" href="#/group/${r.group_id}">${esc(t('adm.open_group'))}</a><button class="btn sm" data-rs="${r.id}">${esc(t('adm.resolve'))}</button></div></div>`).join('')}</div>` : `<p class="muted">${esc(t('adm.no_req'))}</p>`}`;
  $$('[data-ok]', body).forEach(b => b.onclick = async () => { await sb.rpc('resolve_access_request', { p_id: b.dataset.ok, p_approve: true }); requestsTab(body); });
  $$('[data-no]', body).forEach(b => b.onclick = async () => { await sb.rpc('resolve_access_request', { p_id: b.dataset.no, p_approve: false }); requestsTab(body); });
  $$('[data-rs]', body).forEach(b => b.onclick = async () => { await sb.from('message_reports').update({ status: 'resolved' }).eq('id', b.dataset.rs); requestsTab(body); });
}

// ---------------- video qoidalari
function videoTab(body) {
  const v = { allow_forward_seek: false, forward_tolerance_s: 2, rewind_step_s: 10, allowed_speeds: [1], default_quality: 'auto', resume: true, complete_pct: 90, watermark: true, pause_when_hidden: true, allow_offline: true, ...(state.settings.video || {}) };
  const chk = (id, k, l) => `<label class="chk"><input type="checkbox" id="${id}" ${v[k] ? 'checked' : ''}> ${esc(t(l))}</label>`;
  body.innerHTML = `<div class="card pad form">${chk('fw', 'allow_forward_seek', 'adm.v_fwd')}
    <label class="fld"><span>${esc(t('adm.v_tol'))}</span><input class="input" id="tl" type="number" min="0" max="60" value="${v.forward_tolerance_s}"></label>
    <label class="fld"><span>${esc(t('adm.v_rw'))}</span><input class="input" id="rw" type="number" min="5" max="60" value="${v.rewind_step_s}"></label>
    <label class="fld"><span>${esc(t('adm.v_speeds'))}</span><input class="input" id="sp" value="${esc(v.allowed_speeds.join(', '))}"></label>
    <label class="fld"><span>${esc(t('adm.v_q'))}</span><select class="input" id="dq">${['auto', '1080p', '720p', '480p', '360p', '240p'].map(q => `<option ${v.default_quality === q ? 'selected' : ''}>${q}</option>`).join('')}</select></label>
    ${chk('rs', 'resume', 'adm.v_resume')}<label class="fld"><span>${esc(t('adm.v_pct'))}</span><input class="input" id="pc" type="number" min="10" max="100" value="${v.complete_pct}"></label>${chk('wm', 'watermark', 'adm.v_wm')}${chk('hd', 'pause_when_hidden', 'adm.v_hid')}${chk('of', 'allow_offline', 'adm.v_off')}
    <button class="btn lg" id="sv">${esc(t('set.save'))}</button></div>`;
  $('#sv', body).onclick = () => save('video', {
    allow_forward_seek: $('#fw', body).checked, forward_tolerance_s: +$('#tl', body).value || 0, rewind_step_s: +$('#rw', body).value || 10,
    allowed_speeds: [...new Set($('#sp', body).value.split(',').map(s => parseFloat(s)).filter(n => n > 0 && n <= 4))].sort((a, b) => a - b).length ? [...new Set($('#sp', body).value.split(',').map(s => parseFloat(s)).filter(n => n > 0 && n <= 4))].sort((a, b) => a - b) : [1],
    default_quality: $('#dq', body).value, resume: $('#rs', body).checked, complete_pct: +$('#pc', body).value || 90, watermark: $('#wm', body).checked, pause_when_hidden: $('#hd', body).checked, allow_offline: $('#of', body).checked });
}

function appTab(body) {
  const a = { pin_max_attempts: 5, autolock_minutes: 1, chat_media_days: 60, max_voice_seconds: 120, leaderboard: true, leaderboard_names: 'short', ...(state.settings.app || {}) };
  body.innerHTML = `<div class="card pad form"><label class="fld"><span>${esc(t('adm.a_pin'))}</span><input class="input" id="pn" type="number" min="3" max="10" value="${a.pin_max_attempts}"></label>
    <label class="fld"><span>${esc(t('adm.a_chat'))}</span><input class="input" id="cd" type="number" min="7" max="365" value="${a.chat_media_days}"></label>
    <label class="fld"><span>${esc(t('adm.a_voice'))}</span><input class="input" id="vs" type="number" min="15" max="300" value="${a.max_voice_seconds}"></label><label class="chk"><input type="checkbox" id="lb" ${a.leaderboard !== false ? 'checked' : ''}> ${esc(t('adm.a_lb'))}</label>
    <label class="fld"><span>${esc(t('adm.a_lbn'))}</span><select class="input" id="ln"><option value="short" ${a.leaderboard_names !== 'full' ? 'selected' : ''}>${esc(t('adm.a_short'))}</option><option value="full" ${a.leaderboard_names === 'full' ? 'selected' : ''}>${esc(t('adm.a_full'))}</option></select></label><button class="btn lg" id="sv">${esc(t('set.save'))}</button></div>`;
  $('#sv', body).onclick = () => save('app', { ...a, leaderboard: $('#lb', body).checked, leaderboard_names: $('#ln', body).value, pin_max_attempts: +$('#pn', body).value || 5, chat_media_days: +$('#cd', body).value || 60, max_voice_seconds: +$('#vs', body).value || 120 });
}

// ---------------- platforma hisoboti
async function statsTab(body) {
  const to = dayStr(), from = dayStr(addDays(new Date(), -29));
  const [ov, dau, cnt] = await Promise.all([sb.rpc('admin_overview', { p_from: from, p_to: to }), sb.rpc('admin_daily_active', { p_from: from, p_to: to }), sb.from('profiles').select('*', { count: 'exact', head: true })]);
  const rows = ov.data || [], days = dau.data || [], max = Math.max(1, ...rows.map(r => +r.seconds)), dmax = Math.max(1, ...days.map(d => +d.users));
  const COL = { video: '#2563eb', audio: '#8b5cf6', book: '#f59e0b', test: '#087C50', app: '#94a3b8' };
  body.innerHTML = `<div class="stats3 mb"><div class="stat card"><span>${esc(t('adm.users_n'))}</span><b>${cnt.count ?? 0}</b></div><div class="stat card"><span>${esc(t('adm.active'))} (30)</span><b>${Math.max(0, ...rows.map(r => +r.users))}</b></div>
      <div class="stat card"><span>${esc(t('rep.app'))} (30)</span><b>${esc(fmtMin((rows.find(r => r.kind === 'app') || { seconds: 0 }).seconds))}</b></div></div>
    <div class="card pad mb"><h3>${esc(t('adm.time_by'))} · 30</h3>${['video', 'audio', 'book', 'test', 'app'].map(k => { const r = rows.find(x => x.kind === k) || { seconds: 0, users: 0 }; return `<div class="hbar"><span>${esc(t('rep.' + k))}</span><div><i style="width:${+r.seconds / max * 100}%;background:${COL[k]}"></i></div><b>${esc(fmtMin(r.seconds))} · ${r.users}👤</b></div>`; }).join('')}</div>
    <div class="card pad"><h3>${esc(t('adm.dau'))}</h3>${days.length ? `<div class="mini-bars">${days.map(d => `<div title="${esc(fmtDate(d.day))}: ${d.users}"><i style="height:${+d.users / dmax * 100}%"></i><small>${d.day.slice(8)}</small></div>`).join('')}</div>` : `<p class="muted">—</p>`}</div>`;
}

// ---------------- saqlash joyi
async function storageTab(body) {
  const { data } = await sb.rpc('storage_usage'); const rows = data || [], total = rows.reduce((a, r) => a + +r.bytes, 0), GB = 1073741824;
  body.innerHTML = `<div class="card pad mb"><h3>${esc(t('adm.st_used'))}: ${esc(fmtSize(total))} <small class="muted">/ ${esc(t('adm.st_free'))}</small></h3><div class="bar thick"><i style="width:${Math.min(100, total / GB * 100)}%"></i></div>
    <div class="tbl mt">${rows.map(r => `<div class="trow"><b>${esc(r.bucket)}</b><span class="grow muted">${r.files} files</span><span>${esc(fmtSize(r.bytes))}</span></div>`).join('')}</div></div>
    <div class="card pad"><h3>${esc(t('adm.cleanup'))}</h3><p class="muted">${esc(t('adm.cleanup_d'))} (${state.settings.app?.chat_media_days || 60})</p><button class="btn" id="cl">${ic('trash', 16)} ${esc(t('adm.cleanup'))}</button></div>`;
  $('#cl', body).onclick = async ev => {
    const b = ev.currentTarget; btnBusy(b, true);
    try {
      const { data: ex, error } = await sb.rpc('expired_media', { p_days: state.settings.app?.chat_media_days || 60 }); if (error) throw error;
      const by = {}; (ex || []).forEach(r => (by[r.src] ||= []).push(r)); let n = 0;
      for (const [src, list] of Object.entries(by)) {
        for (let i = 0; i < list.length; i += 100) { const part = list.slice(i, i + 100); const { error: e2 } = await sb.storage.from('chat').remove(part.map(p => p.path)); if (e2) throw e2; await sb.rpc('mark_media_expired', { p_src: src, p_ids: part.map(p => p.id) }); n += part.length; }
      }
      toast(t('adm.cleaned', { n }), 'ok'); storageTab(body);
    } catch (x) { toast(x.message || String(x), 'err'); btnBusy(b, false); }
  };
}
