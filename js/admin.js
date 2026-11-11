// Admin paneli: foydalanuvchilar, so'rovlar/shikoyatlar, video qoidalari (kodsiz), ilova sozlamalari, platforma hisoboti, saqlash joyi
import { sb, state, t, tr, addDict, route, go, esc, ic, $, $$, toast, confirmDlg, btnBusy, fmtMin, fmtDate, fmtSize, dayStr, addDays, loadSettings, spinner } from './core.js';
import { composeAnnouncement } from './news.js';

addDict({
  uz: { 'nav.admin': 'Admin', 'adm.title': 'Admin paneli', 'adm.users': 'Foydalanuvchilar', 'adm.requests': 'So\'rovlar', 'adm.video': 'Video qoidalari', 'adm.app': 'Ilova', 'adm.stats': 'Platforma', 'adm.storage': 'Saqlash joyi', 'adm.news': 'E\'lonlar',
    'adm.search': 'Ism yoki email…', 'adm.7d': '7 kun', 'adm.total': 'Jami', 'adm.tests': 'Testlar', 'adm.avg': 'O\'rtacha', 'adm.last': 'Oxirgi faollik', 'adm.make_admin': 'Admin qilish', 'adm.make_user': 'Oddiy qilish', 'adm.report': 'Hisobot',
    'adm.buy_req': 'To\'plamga kirish so\'rovlari', 'adm.no_req': 'So\'rovlar yo\'q', 'adm.approve': 'Tasdiqlash', 'adm.reject': 'Rad etish', 'adm.reports': 'Xabarlarga shikoyatlar', 'adm.resolve': 'Hal qilindi', 'adm.open_group': 'Guruhga o\'tish',
    'adm.v_fwd': 'Videoni oldinga o\'tkazishga ruxsat', 'adm.v_tol': 'Oldinga o\'tish bardoshi (soniya)', 'adm.v_rw': 'Orqaga qaytarish qadami (soniya)', 'adm.v_speeds': 'Ruxsat etilgan tezliklar (vergul bilan)', 'adm.v_q': 'Boshlang\'ich sifat',
    'adm.v_resume': 'Oxirgi joydan davom ettirish', 'adm.v_pct': 'Ko\'rilgan hisoblanishi uchun % ', 'adm.v_wm': 'Ism suv belgisi (yozib olishga qarshi)', 'adm.v_hid': 'Sahifa yopilsa videoni to\'xtatish', 'adm.saved': 'Saqlandi ✔',
    'adm.a_pin': 'PIN xato urinishlari (so\'ng chiqarib yuboriladi)', 'adm.a_chat': 'Chat fayllarini saqlash muddati (kun)', 'adm.a_voice': 'Ovozli xabar maks. uzunligi (soniya)',
    'adm.users_n': 'Foydalanuvchilar soni', 'adm.active': 'Faol foydalanuvchilar', 'adm.time_by': 'Bo\'limlar bo\'yicha vaqt', 'adm.dau': 'Kunlik faol foydalanuvchilar', 'adm.st_used': 'Ishlatilgan joy', 'adm.st_free': 'Bepul reja: 1 GB',
    'adm.cleanup': 'Eski chat fayllarini tozalash', 'adm.cleanup_d': 'Belgilangan muddatdan eski ovoz, rasm va topshiriq fayllari o\'chiriladi (matn qoladi).', 'adm.cleaned': '{n} ta fayl o\'chirildi', 'adm.new_ad': 'Yangi reklama', 'adm.new_news': 'Yangi e\'lon', 'adm.all_news': 'Barcha e\'lonlar',
    'rep.video': 'Video', 'rep.book': 'Kitob/material', 'rep.test': 'Test', 'rep.app': 'Ilovada' },
  ru: { 'nav.admin': 'Админ', 'adm.title': 'Панель админа', 'adm.users': 'Пользователи', 'adm.requests': 'Заявки', 'adm.video': 'Правила видео', 'adm.app': 'Приложение', 'adm.stats': 'Платформа', 'adm.storage': 'Хранилище', 'adm.news': 'Объявления',
    'adm.search': 'Имя или email…', 'adm.7d': '7 дней', 'adm.total': 'Всего', 'adm.tests': 'Тесты', 'adm.avg': 'Среднее', 'adm.last': 'Последняя активность', 'adm.make_admin': 'Сделать админом', 'adm.make_user': 'Сделать обычным', 'adm.report': 'Отчёт',
    'adm.buy_req': 'Заявки на доступ к наборам', 'adm.no_req': 'Заявок нет', 'adm.approve': 'Подтвердить', 'adm.reject': 'Отклонить', 'adm.reports': 'Жалобы на сообщения', 'adm.resolve': 'Решено', 'adm.open_group': 'Перейти в группу',
    'adm.v_fwd': 'Разрешить перемотку видео вперёд', 'adm.v_tol': 'Допуск перемотки вперёд (сек)', 'adm.v_rw': 'Шаг перемотки назад (сек)', 'adm.v_speeds': 'Разрешённые скорости (через запятую)', 'adm.v_q': 'Качество по умолчанию',
    'adm.v_resume': 'Продолжать с последнего места', 'adm.v_pct': '% для статуса «просмотрено»', 'adm.v_wm': 'Водяной знак с именем (против записи экрана)', 'adm.v_hid': 'Ставить на паузу при сворачивании', 'adm.saved': 'Сохранено ✔',
    'adm.a_pin': 'Попыток ввода PIN (затем выход)', 'adm.a_chat': 'Срок хранения файлов чата (дней)', 'adm.a_voice': 'Макс. длина голосового (сек)',
    'adm.users_n': 'Всего пользователей', 'adm.active': 'Активные пользователи', 'adm.time_by': 'Время по разделам', 'adm.dau': 'Активные пользователи по дням', 'adm.st_used': 'Занято', 'adm.st_free': 'Бесплатный тариф: 1 ГБ',
    'adm.cleanup': 'Очистить старые файлы чата', 'adm.cleanup_d': 'Голос, фото и файлы работ старше срока будут удалены (текст останется).', 'adm.cleaned': 'Удалено файлов: {n}', 'adm.new_ad': 'Новая реклама', 'adm.new_news': 'Новое объявление', 'adm.all_news': 'Все объявления',
    'rep.video': 'Видео', 'rep.book': 'Книги/материалы', 'rep.test': 'Тесты', 'rep.app': 'В приложении' },
  en: { 'nav.admin': 'Admin', 'adm.title': 'Admin panel', 'adm.users': 'Users', 'adm.requests': 'Requests', 'adm.video': 'Video rules', 'adm.app': 'App', 'adm.stats': 'Platform', 'adm.storage': 'Storage', 'adm.news': 'Announcements',
    'adm.search': 'Name or email…', 'adm.7d': '7 days', 'adm.total': 'Total', 'adm.tests': 'Tests', 'adm.avg': 'Average', 'adm.last': 'Last seen', 'adm.make_admin': 'Make admin', 'adm.make_user': 'Make regular user', 'adm.report': 'Report',
    'adm.buy_req': 'Collection access requests', 'adm.no_req': 'No requests', 'adm.approve': 'Approve', 'adm.reject': 'Reject', 'adm.reports': 'Message reports', 'adm.resolve': 'Resolved', 'adm.open_group': 'Open group',
    'adm.v_fwd': 'Allow skipping forward in videos', 'adm.v_tol': 'Forward-seek tolerance (sec)', 'adm.v_rw': 'Rewind step (sec)', 'adm.v_speeds': 'Allowed speeds (comma-separated)', 'adm.v_q': 'Default quality',
    'adm.v_resume': 'Resume from last position', 'adm.v_pct': '% needed to count as watched', 'adm.v_wm': 'Name watermark (anti screen-recording)', 'adm.v_hid': 'Pause when the page is hidden', 'adm.saved': 'Saved ✔',
    'adm.a_pin': 'Wrong-PIN attempts (then logout)', 'adm.a_chat': 'Chat file retention (days)', 'adm.a_voice': 'Max voice message length (sec)',
    'adm.users_n': 'Total users', 'adm.active': 'Active users', 'adm.time_by': 'Time by section', 'adm.dau': 'Daily active users', 'adm.st_used': 'Used', 'adm.st_free': 'Free plan: 1 GB',
    'adm.cleanup': 'Clean up old chat files', 'adm.cleanup_d': 'Voice, photos and submission files older than the retention period are deleted (text stays).', 'adm.cleaned': '{n} files deleted', 'adm.new_ad': 'New ad', 'adm.new_news': 'New announcement', 'adm.all_news': 'All announcements',
    'rep.video': 'Video', 'rep.book': 'Books/materials', 'rep.test': 'Tests', 'rep.app': 'In app' },
});

const TABS = [['users', 'adm.users'], ['requests', 'adm.requests'], ['video', 'adm.video'], ['app', 'adm.app'], ['stats', 'adm.stats'], ['storage', 'adm.storage']];
const save = async (key, value) => { const { error } = await sb.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() }); if (error) return toast(error.message, 'err'); await loadSettings(); toast(t('adm.saved'), 'ok'); };

route('/admin', async ({ el, q, alive }) => {
  let tab = q.tab || 'users';
  const paint = async () => {
    el.innerHTML = `<div class="page"><div class="row between wrap"><h1>${esc(t('adm.title'))}</h1><div class="row wrap"><button class="btn sm" id="nn">${ic('mega', 16)} ${esc(t('adm.new_news'))}</button><button class="btn sm soft" id="na">${esc(t('adm.new_ad'))}</button><a class="btn sm ghost" href="#/news">${esc(t('adm.all_news'))}</a></div></div>
      <div class="tabs scroll">${TABS.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-tab="${k}">${esc(t(l))}</button>`).join('')}</div><div id="body">${spinner()}</div></div>`;
    $$('[data-tab]', el).forEach(b => b.onclick = () => { tab = b.dataset.tab; paint(); });
    $('#nn', el).onclick = () => composeAnnouncement(); $('#na', el).onclick = () => composeAnnouncement(null, { kind: 'ad' });
    await ({ users: usersTab, requests: requestsTab, video: videoTab, app: appTab, stats: statsTab, storage: storageTab })[tab]($('#body', el));
  };
  paint();
}, { auth: true, admin: true });

// ---------------- foydalanuvchilar
async function usersTab(body) {
  body.innerHTML = `<input class="input" id="s" placeholder="${esc(t('adm.search'))}"><div id="ul" class="mt">${spinner()}</div>`;
  const load = async (v = '') => {
    const { data, error } = await sb.rpc('admin_users_summary', { p_search: v }); if (error) return $('#ul', body).innerHTML = esc(error.message);
    $('#ul', body).innerHTML = `<div class="cards">${(data || []).map(u => `<div class="card pad urow"><div class="grow"><a href="#/reports/user/${u.id}"><b>${esc(u.full_name || '—')}</b></a> ${u.role === 'admin' ? '<span class="tag">ADMIN</span>' : ''}<br><small class="muted">${esc(u.email)}</small>
      <div class="chips"><span class="chip">${esc(t('adm.7d'))}: ${esc(fmtMin(u.secs_7d))}</span><span class="chip">${esc(t('adm.total'))}: ${esc(fmtMin(u.secs_total))}</span><span class="chip">${esc(t('adm.tests'))}: ${u.tests_total}${u.avg_percent !== null ? ' · ' + u.avg_percent + '%' : ''}</span>${u.last_seen ? `<span class="chip">${esc(t('adm.last'))}: ${esc(fmtDate(u.last_seen))}</span>` : ''}</div></div>
      <div class="col"><a class="btn sm" href="#/reports/user/${u.id}">${ic('chart', 14)} ${esc(t('adm.report'))}</a><a class="btn sm ghost" href="#/inbox/${u.id}">${ic('send', 14)}</a>
      ${u.id !== state.user.id ? `<button class="btn sm ghost" data-role="${u.id}:${u.role}">${esc(t(u.role === 'admin' ? 'adm.make_user' : 'adm.make_admin'))}</button>` : ''}</div></div>`).join('')}</div>`;
    $$('[data-role]', body).forEach(b => b.onclick = async () => { const [id, r] = b.dataset.role.split(':'); if (!(await confirmDlg(b.textContent + '?'))) return; await sb.from('profiles').update({ role: r === 'admin' ? 'user' : 'admin' }).eq('id', id); load($('#s', body).value.trim()); });
  };
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
  const v = { allow_forward_seek: false, forward_tolerance_s: 2, rewind_step_s: 10, allowed_speeds: [1], default_quality: 'auto', resume: true, complete_pct: 90, watermark: true, pause_when_hidden: true, ...(state.settings.video || {}) };
  const chk = (id, k, l) => `<label class="chk"><input type="checkbox" id="${id}" ${v[k] ? 'checked' : ''}> ${esc(t(l))}</label>`;
  body.innerHTML = `<div class="card pad form">${chk('fw', 'allow_forward_seek', 'adm.v_fwd')}
    <label class="fld"><span>${esc(t('adm.v_tol'))}</span><input class="input" id="tl" type="number" min="0" max="60" value="${v.forward_tolerance_s}"></label>
    <label class="fld"><span>${esc(t('adm.v_rw'))}</span><input class="input" id="rw" type="number" min="5" max="60" value="${v.rewind_step_s}"></label>
    <label class="fld"><span>${esc(t('adm.v_speeds'))}</span><input class="input" id="sp" value="${esc(v.allowed_speeds.join(', '))}"></label>
    <label class="fld"><span>${esc(t('adm.v_q'))}</span><select class="input" id="dq">${['auto', '1080p', '720p', '480p', '360p', '240p'].map(q => `<option ${v.default_quality === q ? 'selected' : ''}>${q}</option>`).join('')}</select></label>
    ${chk('rs', 'resume', 'adm.v_resume')}<label class="fld"><span>${esc(t('adm.v_pct'))}</span><input class="input" id="pc" type="number" min="10" max="100" value="${v.complete_pct}"></label>${chk('wm', 'watermark', 'adm.v_wm')}${chk('hd', 'pause_when_hidden', 'adm.v_hid')}
    <button class="btn lg" id="sv">${esc(t('set.save'))}</button></div>`;
  $('#sv', body).onclick = () => save('video', {
    allow_forward_seek: $('#fw', body).checked, forward_tolerance_s: +$('#tl', body).value || 0, rewind_step_s: +$('#rw', body).value || 10,
    allowed_speeds: [...new Set($('#sp', body).value.split(',').map(s => parseFloat(s)).filter(n => n > 0 && n <= 4))].sort((a, b) => a - b).length ? [...new Set($('#sp', body).value.split(',').map(s => parseFloat(s)).filter(n => n > 0 && n <= 4))].sort((a, b) => a - b) : [1],
    default_quality: $('#dq', body).value, resume: $('#rs', body).checked, complete_pct: +$('#pc', body).value || 90, watermark: $('#wm', body).checked, pause_when_hidden: $('#hd', body).checked });
}

function appTab(body) {
  const a = { pin_max_attempts: 5, autolock_minutes: 1, chat_media_days: 60, max_voice_seconds: 120, ...(state.settings.app || {}) };
  body.innerHTML = `<div class="card pad form"><label class="fld"><span>${esc(t('adm.a_pin'))}</span><input class="input" id="pn" type="number" min="3" max="10" value="${a.pin_max_attempts}"></label>
    <label class="fld"><span>${esc(t('adm.a_chat'))}</span><input class="input" id="cd" type="number" min="7" max="365" value="${a.chat_media_days}"></label>
    <label class="fld"><span>${esc(t('adm.a_voice'))}</span><input class="input" id="vs" type="number" min="15" max="300" value="${a.max_voice_seconds}"></label><button class="btn lg" id="sv">${esc(t('set.save'))}</button></div>`;
  $('#sv', body).onclick = () => save('app', { ...a, pin_max_attempts: +$('#pn', body).value || 5, chat_media_days: +$('#cd', body).value || 60, max_voice_seconds: +$('#vs', body).value || 120 });
}

// ---------------- platforma hisoboti
async function statsTab(body) {
  const to = dayStr(), from = dayStr(addDays(new Date(), -29));
  const [ov, dau, cnt] = await Promise.all([sb.rpc('admin_overview', { p_from: from, p_to: to }), sb.rpc('admin_daily_active', { p_from: from, p_to: to }), sb.from('profiles').select('*', { count: 'exact', head: true })]);
  const rows = ov.data || [], days = dau.data || [], max = Math.max(1, ...rows.map(r => +r.seconds)), dmax = Math.max(1, ...days.map(d => +d.users));
  const COL = { video: '#2563eb', book: '#f59e0b', test: '#16a34a', app: '#94a3b8' };
  body.innerHTML = `<div class="stats3 mb"><div class="stat card"><span>${esc(t('adm.users_n'))}</span><b>${cnt.count ?? 0}</b></div><div class="stat card"><span>${esc(t('adm.active'))} (30)</span><b>${Math.max(0, ...rows.map(r => +r.users))}</b></div>
      <div class="stat card"><span>${esc(t('rep.app'))} (30)</span><b>${esc(fmtMin((rows.find(r => r.kind === 'app') || { seconds: 0 }).seconds))}</b></div></div>
    <div class="card pad mb"><h3>${esc(t('adm.time_by'))} · 30</h3>${['video', 'book', 'test', 'app'].map(k => { const r = rows.find(x => x.kind === k) || { seconds: 0, users: 0 }; return `<div class="hbar"><span>${esc(t('rep.' + k))}</span><div><i style="width:${+r.seconds / max * 100}%;background:${COL[k]}"></i></div><b>${esc(fmtMin(r.seconds))} · ${r.users}👤</b></div>`; }).join('')}</div>
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
