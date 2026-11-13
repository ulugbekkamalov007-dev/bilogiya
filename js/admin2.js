// Admin 2.0: kengaytirilgan analitika, audit jurnali, o'qituvchilar (arizalar/rollar), AI sozlamalari
import { sb, state, tr, esc, ic, $, $$, toast, btnBusy, confirmDlg, spinner, fmtDate, fmtTime, dayStr, addDays, loadSettings, addDict } from './core.js';
import { T, empty, errBox, dbErr, pct } from './ui.js';

addDict({ uz: { 'adm2.analytics': 'Analitika', 'adm2.audit': 'Audit jurnali', 'adm2.teachers': 'O\'qituvchilar', 'adm2.ai': 'AI sozlamalari' }, ru: { 'adm2.analytics': 'Аналитика', 'adm2.audit': 'Журнал аудита', 'adm2.teachers': 'Преподаватели', 'adm2.ai': 'Настройки ИИ' }, en: { 'adm2.analytics': 'Analytics', 'adm2.audit': 'Audit log', 'adm2.teachers': 'Teachers', 'adm2.ai': 'AI settings' } });
export const TABS2 = [['analytics', 'adm2.analytics', 'chart'], ['audit', 'adm2.audit', 'shield'], ['teachers', 'adm2.teachers', 'cap'], ['ai', 'adm2.ai', 'bot']];

const bars = (rows, key = 'n', color = 'var(--brand)') => { const mx = Math.max(1, ...rows.map(r => r[key])); return rows.length ? `<div style="display:flex;gap:3px;align-items:flex-end;height:90px">${rows.map(r => `<i title="${esc(String(r.day))}: ${r[key]}" style="flex:1;min-width:3px;background:${color};border-radius:3px 3px 0 0;height:${Math.max(4, r[key] / mx * 100)}%"></i>`).join('')}</div>` : `<p class="muted small">—</p>`; };
const csv = (name, rows) => { const s = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + s], { type: 'text/csv' })); a.download = name; a.click(); };

export async function analyticsTab(body) {
  let days = 30;
  const load = async () => {
    body.innerHTML = spinner(); const to = new Date(), from = addDays(to, -(days - 1));
    const { data: a, error } = await sb.rpc('admin_analytics', { p_from: dayStr(from), p_to: dayStr(to) }); if (error) { body.innerHTML = errBox(dbErr(error)); return; }
    const xp = a.xp_by_kind || {}, xpTot = Object.values(xp).reduce((p, v) => p + (+v), 0), roles = a.users_by_role || {};
    body.innerHTML = `<div class="chipbar">${[7, 30, 90].map(d => `<button class="btn sm ${d === days ? '' : 'ghost'}" data-d="${d}">${d} ${esc(T('kun', 'дн.', 'days'))}</button>`).join('')}<button class="btn sm ghost" id="ex">CSV</button></div>
      <div class="statrow"><div class="sbox"><b>${(a.signups || []).reduce((p, x) => p + x.n, 0)}</b><small>${esc(T('Yangi foydalanuvchi', 'Новые пользователи', 'New users'))}</small></div><div class="sbox"><b>${a.enrollments}</b><small>${esc(T('Kursga yozilish', 'Записей на курсы', 'Enrollments'))}</small></div><div class="sbox"><b>${a.lessons_done}</b><small>${esc(T('Tugatilgan dars', 'Пройдено уроков', 'Lessons done'))}</small></div><div class="sbox"><b>${a.certificates}</b><small>${esc(T('Sertifikat', 'Сертификаты', 'Certificates'))}</small></div>
        <div class="sbox"><b>${a.card_reviews}</b><small>${esc(T('Karta takrori', 'Повторов карточек', 'Card reviews'))}</small></div><div class="sbox"><b>${a.tests?.n ?? 0} · ${a.tests?.avg ?? 0}%</b><small>${esc(T('Testlar · o\'rtacha', 'Тесты · средний', 'Tests · avg'))}</small></div><div class="sbox"><b>${a.ai_calls}</b><small>${esc(T('AI so\'rovlari', 'Запросы ИИ', 'AI requests'))}</small></div><div class="sbox"><b>${xpTot}</b><small>XP</small></div></div>
      <div class="card pad mt"><b>${esc(T('Kunlik faol foydalanuvchilar', 'Активные пользователи по дням', 'Daily active users'))}</b>${bars(a.dau || [])}</div>
      <div class="card pad mt"><b>${esc(T('Ro\'yxatdan o\'tish', 'Регистрации', 'Sign-ups'))}</b>${bars(a.signups || [], 'n', '#3286CF')}</div>
      <div class="card pad mt"><b>${esc(T('Foydalanuvchilar rollari', 'Роли пользователей', 'Users by role'))}</b><div class="chips mt">${Object.entries(roles).map(([r, n]) => `<span class="chip">${esc(r)}: ${n}</span>`).join('')}</div></div>
      <div class="card pad mt"><b>${esc(T('XP manbalari', 'Источники XP', 'XP sources'))}</b><div class="chips mt">${Object.entries(xp).map(([k, v]) => `<span class="chip">${esc(k)}: ${v}</span>`).join('') || '—'}</div></div>
      <div class="card pad mt"><b>${esc(T('Eng mashhur kurslar', 'Популярные курсы', 'Top courses'))}</b>${(a.top_courses || []).length ? `<div class="tblwrap mt"><table class="tbl2"><tbody>${a.top_courses.map(c => `<tr><td>${esc(tr(c.title))}</td><td>${c.n}</td><td>${c.done} ✔ (${pct(c.done, c.n)}%)</td></tr>`).join('')}</tbody></table></div>` : `<p class="muted small">${esc(T('Kurslar yo\'q', 'Курсов нет', 'No courses'))}</p>`}</div>`;
    $$('[data-d]', body).forEach(b => b.onclick = () => { days = +b.dataset.d; load(); });
    $('#ex', body).onclick = () => csv('analytics.csv', [['metric', 'value'], ['signups', (a.signups || []).reduce((p, x) => p + x.n, 0)], ['enrollments', a.enrollments], ['lessons_done', a.lessons_done], ['certificates', a.certificates], ['card_reviews', a.card_reviews], ['tests', a.tests?.n], ['tests_avg', a.tests?.avg], ['ai_calls', a.ai_calls], ...(a.dau || []).map(d => ['dau ' + d.day, d.n])]);
  }; await load();
}

export async function auditTab(body) {
  let page = 0, term = ''; const PS = 25;
  body.innerHTML = `<div class="chipbar"><input class="input" id="q" type="search" placeholder="${esc(T('Amal, obyekt yoki ism…', 'Действие, объект или имя…', 'Action, entity or name…'))}" style="max-width:320px;flex:1"><button class="btn sm ghost" id="ex">CSV</button></div><div id="al">${spinner()}</div><div class="row mt" style="gap:8px;justify-content:center"><button class="btn sm ghost" id="pv">←</button><span id="pg" class="muted"></span><button class="btn sm ghost" id="nx">→</button></div>`;
  const qry = (range = true) => { let q = sb.from('audit_log').select('*', { count: 'exact' }).order('at', { ascending: false }); if (term) { const s = term.replace(/[%,()]/g, ''); q = q.or(`action.ilike.%${s}%,entity.ilike.%${s}%,actor_name.ilike.%${s}%`); } return range ? q.range(page * PS, page * PS + PS - 1) : q.limit(2000); };
  const load = async () => { const { data, error, count } = await qry(); if (error) { $('#al', body).innerHTML = errBox(dbErr(error)); return; }
    $('#al', body).innerHTML = (data || []).length ? `<div class="tblwrap"><table class="tbl2"><thead><tr><th>${esc(T('Vaqt', 'Время', 'Time'))}</th><th>${esc(T('Kim', 'Кто', 'Who'))}</th><th>${esc(T('Amal', 'Действие', 'Action'))}</th><th>${esc(T('Obyekt', 'Объект', 'Entity'))}</th><th>${esc(T('Tafsilot', 'Детали', 'Details'))}</th></tr></thead><tbody>${data.map(r => `<tr><td style="white-space:nowrap">${esc(fmtDate(r.at) + ' ' + fmtTime(r.at))}</td><td>${esc(r.actor_name || '—')}</td><td><span class="tg">${esc(r.action)}</span></td><td>${esc(r.entity || '')}</td><td><small class="muted">${esc(JSON.stringify(r.meta || {}).slice(0, 120))}</small></td></tr>`).join('')}</tbody></table></div>` : empty('shield', T('Yozuvlar yo\'q', 'Записей нет', 'No entries'));
    $('#pg', body).textContent = `${page + 1} / ${Math.max(1, Math.ceil((count || 0) / PS))}`; $('#pv', body).disabled = page === 0; $('#nx', body).disabled = (page + 1) * PS >= (count || 0); };
  let tm; $('#q', body).oninput = e => { clearTimeout(tm); tm = setTimeout(() => { term = e.target.value.trim(); page = 0; load(); }, 250); };
  $('#pv', body).onclick = () => { page--; load(); }; $('#nx', body).onclick = () => { page++; load(); };
  $('#ex', body).onclick = async () => { const { data } = await qry(false); csv('audit.csv', [['at', 'actor', 'action', 'entity', 'entity_id', 'meta'], ...(data || []).map(r => [r.at, r.actor_name, r.action, r.entity, r.entity_id, JSON.stringify(r.meta)])]); };
  await load();
}

export async function teachersTab(body) {
  const load = async () => {
    const [{ data: apps }, { data: ts }] = await Promise.all([sb.from('teacher_applications').select('*, profiles!teacher_applications_user_id_fkey(full_name,email)').eq('status', 'pending').order('created_at'), sb.from('profiles').select('id,full_name,email').eq('role', 'teacher').order('full_name')]);
    body.innerHTML = `<h3>${esc(T('Arizalar', 'Заявки', 'Applications'))}</h3>${(apps || []).length ? `<div class="cards cols1">${apps.map(a => `<div class="card pad"><b>${esc(a.profiles?.full_name || a.profiles?.email || '')}</b><br><small class="muted">${esc(a.profiles?.email || '')} · ${esc(fmtDate(a.created_at))}</small><p class="pre">${esc(a.message)}</p><div class="row" style="gap:8px"><button class="btn sm" data-ok="${a.id}">${ic('check', 14)} ${esc(T('Tasdiqlash', 'Одобрить', 'Approve'))}</button><button class="btn sm ghost" data-no="${a.id}">${esc(T('Rad etish', 'Отклонить', 'Reject'))}</button></div></div>`).join('')}</div>` : `<p class="muted">${esc(T('Yangi ariza yo\'q', 'Новых заявок нет', 'No pending applications'))}</p>`}
      <h3 class="mt">${esc(T('O\'qituvchilar', 'Преподаватели', 'Teachers'))}</h3>${(ts || []).length ? `<div class="cards cols1">${ts.map(u => `<div class="card pad item-row"><div class="grow"><b>${esc(u.full_name || '')}</b><br><small class="muted">${esc(u.email || '')}</small></div><button class="btn sm ghost" data-dm="${u.id}">${esc(T('Oddiy foydalanuvchi qilish', 'Сделать обычным', 'Make regular user'))}</button></div>`).join('')}</div>` : `<p class="muted">${esc(T('O\'qituvchilar yo\'q. Foydalanuvchilar ro\'yxatidan ham tayinlashingiz mumkin.', 'Преподавателей нет. Можно назначить из списка пользователей.', 'No teachers yet. You can also assign from the users list.'))}</p>`}`;
    const dec = async (id, ok) => { if (!(await confirmDlg(ok ? T('Tasdiqlansinmi?', 'Одобрить?', 'Approve?') : T('Rad etilsinmi?', 'Отклонить?', 'Reject?')))) return; const { error } = await sb.rpc('decide_teacher_application', { p_id: id, p_approve: ok }); if (error) return toast(dbErr(error), 'err'); toast('✔', 'ok'); load(); };
    $$('[data-ok]', body).forEach(b => b.onclick = () => dec(b.dataset.ok, true)); $$('[data-no]', body).forEach(b => b.onclick = () => dec(b.dataset.no, false));
    $$('[data-dm]', body).forEach(b => b.onclick = async () => { if (!(await confirmDlg(T('Roli o\'zgartirilsinmi?', 'Изменить роль?', 'Change role?')))) return; const { error } = await sb.rpc('admin_set_role', { p_user: b.dataset.dm, p_role: 'user' }); if (error) return toast(dbErr(error), 'err'); load(); });
  }; await load();
}

export async function aiTab(body) {
  const cur = state.settings?.ai || { enabled: true, daily_limit: 30 };
  body.innerHTML = `<form class="card pad form" id="f"><label class="chip" style="cursor:pointer;width:fit-content"><input type="checkbox" id="en" ${cur.enabled !== false ? 'checked' : ''}> ${esc(T('AI yordamchi yoqilgan', 'ИИ-помощник включён', 'AI assistant enabled'))}</label>
    <label class="fld"><span>${esc(T('Kunlik limit (har bir foydalanuvchiga; o\'qituvchi ×3)', 'Дневной лимит на пользователя (преподаватель ×3)', 'Daily limit per user (teachers ×3)'))}</span><input class="input" id="lm" type="number" min="1" max="500" value="${cur.daily_limit ?? 30}" style="max-width:140px"></label><button class="btn">${esc(T('Saqlash', 'Сохранить', 'Save'))}</button></form>
    <div class="card pad mt"><b>${esc(T('Sozlash', 'Настройка', 'Setup'))}</b><ol class="muted small"><li><code>supabase secrets set ANTHROPIC_API_KEY=…</code></li><li><code>supabase functions deploy ai-chat</code></li><li>${esc(T('Funksiya kodi: supabase/functions/ai-chat/index.ts', 'Код функции: supabase/functions/ai-chat/index.ts', 'Function code: supabase/functions/ai-chat/index.ts'))}</li></ol></div>`;
  $('#f', body).onsubmit = async e => { e.preventDefault(); const { error } = await sb.from('app_settings').upsert({ key: 'ai', value: { enabled: $('#en', body).checked, daily_limit: Math.max(1, Math.min(500, +$('#lm', body).value || 30)) }, updated_at: new Date().toISOString() }); if (error) return toast(dbErr(error), 'err'); await loadSettings(); toast('✔', 'ok'); };
}
