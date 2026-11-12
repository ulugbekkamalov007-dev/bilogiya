// Umumiy chat komponenti: guruh chati, vazifa muhokamasi va shaxsiy yozishmalar uchun.
// Matn + ovozli xabar + rasm/fayl, real vaqt (Supabase Realtime), eski xabarlarni sahifalab yuklash.
import { sb, state, t, addDict, esc, ic, $, $$, toast, fmtTime, fmtDate, fmtDur, btnBusy } from './core.js';
import { startRecording, uploadAttachment, uploadVoice, mediaHtml, fillMedia } from './media.js';

addDict({
  uz: { 'chat.ph': 'Xabar yozing…', 'chat.older': 'Oldingi xabarlar', 'chat.empty': 'Hali xabar yo\'q. Birinchi bo\'lib yozing 👋', 'chat.readonly': 'Bu guruhda faqat o\'qituvchi yozadi. Savol bo\'lsa — vazifa ichida yoki «Yordam» orqali yozing.',
    'chat.send_err': 'Yuborib bo\'lmadi', 'chat.report': 'Shikoyat qilish', 'chat.del': 'O\'chirish', 'chat.rec_send': 'Yuborish', 'chat.you': 'Siz', 'chat.reply': 'Javob berish', 'chat.replying': 'Javob:', 'chat.teacher': 'O\'qituvchi' },
  ru: { 'chat.ph': 'Напишите сообщение…', 'chat.older': 'Предыдущие сообщения', 'chat.empty': 'Сообщений пока нет. Напишите первым 👋', 'chat.readonly': 'В этой группе пишет только учитель. Есть вопрос — пишите внутри задания или через «Помощь».',
    'chat.send_err': 'Не удалось отправить', 'chat.report': 'Пожаловаться', 'chat.del': 'Удалить', 'chat.rec_send': 'Отправить', 'chat.you': 'Вы', 'chat.reply': 'Ответить', 'chat.replying': 'Ответ:', 'chat.teacher': 'Учитель' },
  en: { 'chat.ph': 'Type a message…', 'chat.older': 'Earlier messages', 'chat.empty': 'No messages yet. Be the first 👋', 'chat.readonly': 'Only the teacher can post in this group. Ask questions inside an assignment or via "Help".',
    'chat.send_err': 'Could not send', 'chat.report': 'Report', 'chat.del': 'Delete', 'chat.rec_send': 'Send', 'chat.you': 'You', 'chat.reply': 'Reply', 'chat.replying': 'Replying:', 'chat.teacher': 'Teacher' },
});

export function mountChat(host, c) {
  const uidCol = c.userCol || 'user_id', PAGE = 40;
  const seen = new Set(), byId = new Map(); let replyTo = null; let oldest = null, hasMore = false, destroyed = false;
  host.innerHTML = `<div class="chat"><div class="msgs" id="ml"></div>
    ${c.canWrite ? `<div class="composer"><div class="rpbar" hidden><span class="grow"></span><button class="icon-btn" id="rpx" aria-label="x">${ic('x', 16)}</button></div><div class="cmp-main">
        <label class="icon-btn" title="attach">${ic('clip')}<input type="file" id="at" hidden accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"></label>
        <textarea id="tx" rows="1" placeholder="${esc(t('chat.ph'))}" maxlength="2000"></textarea>
        <button class="icon-btn" id="mic" title="voice">${ic('mic')}</button><button class="icon-btn send" id="sd">${ic('send')}</button></div>
        <div class="cmp-rec" hidden><span class="recdot"></span><b id="rt">0:00</b><span class="grow">${esc(t('med.rec'))}</span><button class="btn ghost sm" id="rc">${esc(t('med.cancel'))}</button><button class="btn sm" id="rs">${esc(t('chat.rec_send'))}</button></div></div>`
      : `<div class="chat-ro muted small">${esc(t('chat.readonly'))}</div>`}</div>`;
  const list = $('#ml', host);

  const norm = m => c.normalize ? c.normalize(m) : ({ id: m.id, mine: m[uidCol] === state.user.id, name: m.sender_name, role: m.sender_role, kind: m.kind, body: m.body, media_path: m.media_path, media_secs: m.media_secs, media_expired: m.media_expired, created_at: m.created_at });
  const prev = r => { const x = norm(r); return x.kind === 'text' || x.body ? x.body : x.kind === 'voice' ? '🎤' : x.kind === 'image' ? '🖼' : '📎'; };
  const quote = id => { const r = byId.get(id); return `<div class="mquote" data-q="${id}"><b>${esc(r ? (norm(r).name || '') : '↩')}</b><span>${esc(r ? prev(r).slice(0, 90) : '…')}</span></div>`; };
  const bubble = raw => {
    const m = norm(raw); const staff = m.role === 'admin';
    const showText = m.kind === 'text' || (m.kind === 'image' && m.body);
    return `<div class="msg ${m.mine ? 'mine' : ''} ${staff ? 'staff' : ''}" data-id="${m.id}">
      ${!m.mine ? `<div class="mname">${esc(m.name || '')}${staff ? ` <span class="tag">${esc(t('chat.teacher'))}</span>` : ''}</div>` : ''}
      ${c.reply && raw.reply_to ? quote(raw.reply_to) : ''}${mediaHtml(m)}${showText ? `<div class="mtext">${esc(m.body)}</div>` : ''}
      <div class="mmeta"><span>${esc(fmtTime(m.created_at))}</span>
        ${c.reply ? `<button data-rp="${m.id}" title="${esc(t('chat.reply'))}">${ic('reply', 13)}</button>` : ''}
        ${c.onReport && !m.mine ? `<button data-rep="${m.id}" title="${esc(t('chat.report'))}">${ic('flag', 13)}</button>` : ''}
        ${c.canDelete?.(raw) ? `<button data-del="${m.id}" title="${esc(t('chat.del'))}">${ic('trash', 13)}</button>` : ''}</div></div>`;
  };
  const nearBottom = () => list.scrollHeight - list.scrollTop - list.clientHeight < 140;
  const add = (raw, { prepend = false } = {}) => {
    if (seen.has(raw.id)) return; seen.add(raw.id); byId.set(raw.id, raw);
    const stick = nearBottom(); const tmp = document.createElement('div'); tmp.innerHTML = bubble(raw); const node = tmp.firstElementChild;
    $('.chat-empty', list)?.remove();
    if (prepend) list.insertBefore(node, $('#more', list)?.nextSibling || list.firstChild); else { list.appendChild(node); if (stick || norm(raw).mine) list.scrollTop = list.scrollHeight; }
    fillMedia(node);
  };

  async function load(before) {
    let q = sb.from(c.table).select('*').eq(c.filterCol, c.filterVal); if (c.scope) q = c.scope(q);
    q = q.order('created_at', { ascending: false }).limit(PAGE); if (before) q = q.lt('created_at', before);
    const { data, error } = await q; if (error) return toast(error.message, 'err');
    const rows = (data || []).reverse(); hasMore = (data || []).length === PAGE;
    if (before) { const h = list.scrollHeight; [...rows].reverse().forEach(r => add(r, { prepend: true })); list.scrollTop += list.scrollHeight - h; }
    else { rows.forEach(r => add(r)); list.scrollTop = list.scrollHeight; if (!rows.length) list.insertAdjacentHTML('beforeend', `<p class="chat-empty muted center pad">${esc(t('chat.empty'))}</p>`); c.onLoaded?.(rows); }
    if (rows.length) oldest = rows[0].created_at;
    $('#more', list)?.remove();
    if (hasMore) { list.insertAdjacentHTML('afterbegin', `<button class="btn ghost sm" id="more">${esc(t('chat.older'))}</button>`); $('#more', list).onclick = () => load(oldest); }
  }
  load();

  // real vaqt
  const ch = sb.channel('chat:' + c.table + ':' + c.filterVal + ':' + (c.aid || ''))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: c.table, filter: `${c.filterCol}=eq.${c.filterVal}` }, p => { if (!c.accept || c.accept(p.new)) add(p.new); })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: c.table }, p => { $(`[data-id="${p.old.id}"]`, list)?.remove(); })
    .subscribe();

  list.addEventListener('click', async e => {
    const d = e.target.closest('[data-del]'), r = e.target.closest('[data-rep]');
    if (d) { const { error } = await sb.from(c.table).delete().eq('id', d.dataset.del); if (!error) $(`[data-id="${d.dataset.del}"]`, list)?.remove(); else toast(error.message, 'err'); }
    if (r) c.onReport(r.dataset.rep);
    const rp = e.target.closest('[data-rp]'); if (rp) setReply(rp.dataset.rp);
    const qq = e.target.closest('[data-q]'); if (qq) { const n = $(`[data-id="${qq.dataset.q}"]`, list); if (n) { n.scrollIntoView({ block: 'center', behavior: 'smooth' }); n.classList.add('flash'); setTimeout(() => n.classList.remove('flash'), 1300); } }
  });

  function setReply(id) {
    replyTo = id; const bar = $('.rpbar', host); if (!bar) return; bar.hidden = !id;
    if (id) { const r = byId.get(id); bar.firstElementChild.innerHTML = `<b>${esc(t('chat.replying'))} ${esc(r ? norm(r).name || '' : '')}</b> ${esc(r ? prev(r).slice(0, 70) : '')}`; $('#tx', host)?.focus(); }
  }
  // o'ngga surish = javob berish (Telegram singari)
  let tx0 = 0, ty0 = 0, tn = null;
  if (c.reply) {
    list.addEventListener('touchstart', e => { tn = e.target.closest('.msg'); tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
    list.addEventListener('touchmove', e => { if (!tn) return; const dx = e.touches[0].clientX - tx0; if (Math.abs(e.touches[0].clientY - ty0) < 30 && dx > 0) tn.style.transform = `translateX(${Math.min(dx, 70)}px)`; }, { passive: true });
    list.addEventListener('touchend', e => { if (!tn) return; const dx = e.changedTouches[0].clientX - tx0, dy = Math.abs(e.changedTouches[0].clientY - ty0); tn.style.transform = ''; if (dx > 70 && dy < 30) setReply(tn.dataset.id); tn = null; });
  }
  async function send(fields) {
    if (c.reply && replyTo) fields = { ...fields, reply_to: replyTo };
    const { data, error } = await sb.from(c.table).insert({ ...c.insertBase, [uidCol]: state.user.id, ...fields }).select().single();
    if (error) { toast(t('chat.send_err') + ': ' + error.message, 'err'); return false; }
    add(data); c.onSent?.(data); setReply(null); return true;
  }
  if (c.canWrite) {
    const tx = $('#tx', host), main = $('.cmp-main', host), recBar = $('.cmp-rec', host);
    const doText = async () => { const v = tx.value.trim(); if (!v) return; tx.value = ''; tx.style.height = ''; if (!(await send({ kind: 'text', body: v }))) tx.value = v; };
    $('#sd', host).onclick = doText; $('#rpx', host).onclick = () => setReply(null);
    tx.oninput = () => { tx.style.height = 'auto'; tx.style.height = Math.min(120, tx.scrollHeight) + 'px'; };
    tx.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey && matchMedia('(pointer:fine)').matches) { e.preventDefault(); doText(); } };
    $('#at', host).onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      try { const up = await uploadAttachment(c.folder, f); await send({ kind: up.isImg ? 'image' : 'file', body: up.isImg ? '' : f.name, media_path: up.path }); } catch (x) { toast(x.message || String(x), 'err'); }
    };
    let rec = null;
    $('#mic', host).onclick = async () => {
      const max = state.settings.app?.max_voice_seconds || 120;
      rec = await startRecording(max, s => { $('#rt', host).textContent = fmtDur(s); }); if (!rec) return;
      main.hidden = true; recBar.hidden = false;
    };
    const closeRec = () => { recBar.hidden = true; main.hidden = false; rec = null; };
    $('#rc', host).onclick = () => { rec?.cancel(); closeRec(); };
    $('#rs', host).onclick = async ev => {
      const b = ev.currentTarget; btnBusy(b, true); const r = await rec?.stop(); closeRec(); btnBusy(b, false); if (!r) return;
      try { const path = await uploadVoice(c.folder, r); await send({ kind: 'voice', media_path: path, media_secs: r.secs }); } catch (x) { toast(x.message || String(x), 'err'); }
    };
  }
  return { destroy() { destroyed = true; sb.removeChannel(ch); } };
}
