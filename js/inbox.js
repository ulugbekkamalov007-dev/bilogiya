// Shaxsiy xabarlar: foydalanuvchi ⇄ admin (o'quvchilar bir-biriga yozmaydi). Yordam va shikoyat mavzulari bor.
import { sb, state, t, addDict, route, go, onLeave, esc, ic, $, $$, fmtDate, fmtTime, spinner } from './core.js';
import { mountChat } from './chat.js';

addDict({
  uz: { 'inbox.title': 'Xabarlar', 'inbox.talk_admin': 'O\'qituvchi / admin bilan yozishma', 'inbox.topic': 'Mavzu', 'inbox.t_question': 'Savol', 'inbox.t_help': 'Yordam kerak', 'inbox.t_complaint': 'Shikoyat',
    'inbox.private': 'Bu yozishmani faqat siz va adminlar ko\'radi.', 'inbox.empty': 'Hali yozishmalar yo\'q', 'inbox.search': 'Ism yoki email bo\'yicha qidirish…', 'inbox.new': 'Yangi suhbat', 'inbox.report': 'Hisobot', 'inbox.help_ctx': 'Guruh: {g}' },
  ru: { 'inbox.title': 'Сообщения', 'inbox.talk_admin': 'Переписка с учителем / админом', 'inbox.topic': 'Тема', 'inbox.t_question': 'Вопрос', 'inbox.t_help': 'Нужна помощь', 'inbox.t_complaint': 'Жалоба',
    'inbox.private': 'Эту переписку видите только вы и админы.', 'inbox.empty': 'Переписок пока нет', 'inbox.search': 'Поиск по имени или email…', 'inbox.new': 'Новый диалог', 'inbox.report': 'Отчёт', 'inbox.help_ctx': 'Группа: {g}' },
  en: { 'inbox.title': 'Messages', 'inbox.talk_admin': 'Chat with the teacher / admin', 'inbox.topic': 'Topic', 'inbox.t_question': 'Question', 'inbox.t_help': 'I need help', 'inbox.t_complaint': 'Complaint',
    'inbox.private': 'Only you and the admins can see this conversation.', 'inbox.empty': 'No conversations yet', 'inbox.search': 'Search by name or email…', 'inbox.new': 'New conversation', 'inbox.report': 'Report', 'inbox.help_ctx': 'Group: {g}' },
});

const markRead = tu => {
  const q = sb.from('direct_messages').update({ read_at: new Date().toISOString() }).eq('thread_user', tu).is('read_at', null);
  return (state.isAdmin ? q.eq('sender_id', tu) : q.neq('sender_id', state.user.id)).then(() => document.dispatchEvent(new Event('bio-unread')));
};

function thread(el, tu, title, { topic, ctx } = {}) {
  const base = { thread_user: tu }; if (topic) base.topic = topic;
  const topics = [['question', 'inbox.t_question'], ['help', 'inbox.t_help'], ['complaint', 'inbox.t_complaint']];
  el.innerHTML = `<div class="page chatpage"><div class="row between"><div class="row">${state.isAdmin ? `<a class="btn ghost sm" href="#/inbox">${ic('back')}</a>` : ''}<h2 class="mb0">${esc(title)}</h2></div>
    ${state.isAdmin ? `<a class="btn ghost sm" href="#/reports/user/${tu}">${ic('chart', 16)} ${esc(t('inbox.report'))}</a>` : ''}</div>
    ${state.isAdmin ? '' : `<p class="muted small">🔒 ${esc(t('inbox.private'))}</p><div class="chips" id="tp">${topics.map(([k, l]) => `<button class="chip btnchip ${topic === k ? 'on' : ''}" data-t="${k}">${esc(t(l))}</button>`).join('')}</div>`}
    ${ctx ? `<p class="chip">${esc(t('inbox.help_ctx', { g: ctx }))}</p>` : ''}<div id="th"></div></div>`;
  $$('[data-t]', el).forEach(b => b.onclick = () => { const on = b.classList.contains('on'); $$('[data-t]', el).forEach(x => x.classList.remove('on')); if (on) delete base.topic; else { b.classList.add('on'); base.topic = b.dataset.t; } });
  const names = {};
  const c = mountChat($('#th', el), { table: 'direct_messages', filterCol: 'thread_user', filterVal: tu, userCol: 'sender_id', insertBase: base, folder: 'dm/' + tu, canWrite: true,
    canDelete: m => m.sender_id === state.user.id,
    normalize: m => ({ id: m.id, mine: m.sender_id === state.user.id, name: m.sender_id === tu ? title : t('chat.teacher'), role: m.sender_id === tu ? 'user' : 'admin', kind: m.kind, body: m.body, media_path: m.media_path, media_secs: m.media_secs, media_expired: m.media_expired, created_at: m.created_at }),
    onLoaded: () => markRead(tu), onSent: m => { if (!m.topic && base.topic) sb.from('direct_messages').update({ topic: base.topic }).eq('id', m.id).then(() => {}); } });
  onLeave(() => c.destroy());
  // yangi kelgan xabarlarni o'qilgan deb belgilash
  const ch = sb.channel('dmread:' + tu).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `thread_user=eq.${tu}` }, () => markRead(tu)).subscribe();
  onLeave(() => sb.removeChannel(ch));
}

route('/inbox', async ({ el, q, alive }) => {
  if (!state.isAdmin) return thread(el, state.user.id, t('inbox.talk_admin'), { topic: q.topic, ctx: q.ctx });
  const { data } = await sb.from('direct_messages').select('thread_user,sender_id,body,kind,created_at,read_at').order('created_at', { ascending: false }).limit(600);
  const th = {}; (data || []).forEach(m => { const x = th[m.thread_user] ||= { u: m.thread_user, last: m, unread: 0 }; if (!m.read_at && m.sender_id === m.thread_user) x.unread++; });
  const ids = Object.keys(th); const { data: ps } = ids.length ? await sb.from('profiles').select('id,full_name,email').in('id', ids) : { data: [] };
  if (!alive()) return; const nm = Object.fromEntries((ps || []).map(p => [p.id, p.full_name || p.email]));
  const rows = Object.values(th).sort((a, b) => (b.unread - a.unread) || (new Date(b.last.created_at) - new Date(a.last.created_at)));
  el.innerHTML = `<div class="page"><h1>${esc(t('inbox.title'))}</h1><input class="input" id="s" placeholder="${esc(t('inbox.search'))}"><div id="sr" class="cards mt"></div>
    <h3 class="mt">${esc(t('inbox.title'))}</h3><div class="cards">${rows.length ? rows.map(r => `<a class="card pad item-row" href="#/inbox/${r.u}"><span class="avatar sm">${esc((nm[r.u] || '?')[0])}</span><div class="grow"><b>${esc(nm[r.u] || '—')}</b>
      <small class="muted clamp1">${r.last.kind === 'text' ? esc(r.last.body) : r.last.kind === 'voice' ? '🎤' : '📎'}</small></div><small class="muted">${esc(fmtDate(r.last.created_at))}</small>${r.unread ? `<i class="badge static">${r.unread}</i>` : ''}</a>`).join('') : `<p class="muted">${esc(t('inbox.empty'))}</p>`}</div></div>`;
  let to; $('#s', el).oninput = e => { clearTimeout(to); const v = e.target.value.trim(); if (v.length < 2) { $('#sr', el).innerHTML = ''; return; }
    to = setTimeout(async () => { const { data: us } = await sb.rpc('admin_find_users', { p_q: v });
      $('#sr', el).innerHTML = (us || []).map(u => `<a class="card pad item-row" href="#/inbox/${u.id}"><span class="avatar sm">${esc((u.full_name || '?')[0])}</span><div class="grow"><b>${esc(u.full_name)}</b><small class="muted">${esc(u.email)}</small></div>${ic('send', 16)}</a>`).join(''); }, 300); };
}, { auth: true });

route('/inbox/:uid', async ({ el, params }) => {
  if (!state.isAdmin) return go('/inbox', true);
  const { data: p } = await sb.from('profiles').select('full_name,email').eq('id', params.uid).maybeSingle();
  thread(el, params.uid, p?.full_name || p?.email || '—');
}, { auth: true, admin: true });
