// Pullik tizim: admin uchun sozlama + to'lov so'rovlari; foydalanuvchi uchun to'lov ekrani
import { sb, state, t, addDict, loadSettings, esc, ic, $, $$, toast, btnBusy, confirmDlg, fmtDate, spinner, friendlyErr } from './core.js';

addDict({
  uz: { 'bill.title': 'To\'lov tizimi', 'bill.on': 'Pullik tizim yoqilgan (hamma uchun)', 'bill.on_d': 'Yoqilganda ruxsat berilmagan foydalanuvchilar hech qanday video, audio, kitob, hujjat va testni ocha olmaydi. Adminlar cheklanmaydi.', 'bill.price': 'Oylik narx (so\'m)', 'bill.cards': 'To\'lov kartalari (har qatorda: raqam | karta egasi | bank)', 'bill.cards_ph': '8600 1234 5678 9012 | Ali Valiyev | Uzcard', 'bill.note': 'Foydalanuvchiga xabar (ixtiyoriy)', 'bill.save': 'Saqlash', 'bill.saved': 'Saqlandi',
    'bill.reqs': 'To\'lov so\'rovlari', 'bill.none_req': 'Yangi so\'rov yo\'q', 'bill.months': 'Oy', 'bill.approve': 'Ruxsat berish', 'bill.reject': 'Rad etish', 'bill.subs': 'Faol obunalar', 'bill.none_sub': 'Faol obuna yo\'q', 'bill.until': 'gacha', 'bill.revoke': 'Bekor qilish', 'bill.grant': 'Foydalanuvchiga ruxsat berish', 'bill.search': 'Ism yoki email…', 'bill.give': 'Ruxsat', 'bill.done': 'Ruxsat berildi', 'bill.revoke_q': 'Obunani bekor qilamizmi?',
    'pay.title': 'Ilovadan foydalanish pullik', 'pay.sub': 'Materiallarni ochish uchun oylik to\'lov qiling', 'pay.amount': 'Oylik to\'lov', 'pay.som': 'so\'m', 'pay.cards': 'To\'lov uchun karta', 'pay.copy': 'Nusxalash', 'pay.copied': 'Nusxalandi', 'pay.how': 'To\'lovni qilgach «To\'lov qildim» tugmasini bosing. Admin tekshirib, sizga ruxsat beradi.', 'pay.paid': 'To\'lov qildim', 'pay.sent': 'So\'rov yuborildi. Admin tasdiqlashini kuting.', 'pay.pending': 'So\'rovingiz ko\'rib chiqilmoqda', 'pay.expired': 'Obuna muddati tugagan', 'pay.contact': 'Savol bo\'lsa adminga yozing', 'pay.until': 'Obuna: {d} gacha', 'pay.note_ph': 'Izoh (ixtiyoriy): to\'lovchi ismi, vaqti…', 'pay.none': 'To\'lov kartasi hali kiritilmagan. Adminga murojaat qiling.' },
  ru: { 'bill.title': 'Система оплаты', 'bill.on': 'Платный доступ включён (для всех)', 'bill.on_d': 'Когда включено, пользователи без разрешения не могут открыть видео, аудио, книги, документы и тесты. Админы не ограничены.', 'bill.price': 'Цена в месяц (сум)', 'bill.cards': 'Карты для оплаты (в строке: номер | владелец | банк)', 'bill.cards_ph': '8600 1234 5678 9012 | Али Валиев | Uzcard', 'bill.note': 'Сообщение пользователю (необязательно)', 'bill.save': 'Сохранить', 'bill.saved': 'Сохранено',
    'bill.reqs': 'Заявки на оплату', 'bill.none_req': 'Новых заявок нет', 'bill.months': 'Мес.', 'bill.approve': 'Разрешить', 'bill.reject': 'Отклонить', 'bill.subs': 'Активные подписки', 'bill.none_sub': 'Нет активных подписок', 'bill.until': 'до', 'bill.revoke': 'Отменить', 'bill.grant': 'Дать доступ пользователю', 'bill.search': 'Имя или email…', 'bill.give': 'Доступ', 'bill.done': 'Доступ выдан', 'bill.revoke_q': 'Отменить подписку?',
    'pay.title': 'Доступ к приложению платный', 'pay.sub': 'Оплатите месяц, чтобы открыть материалы', 'pay.amount': 'Оплата в месяц', 'pay.som': 'сум', 'pay.cards': 'Карта для оплаты', 'pay.copy': 'Копировать', 'pay.copied': 'Скопировано', 'pay.how': 'После оплаты нажмите «Я оплатил(а)». Админ проверит и откроет доступ.', 'pay.paid': 'Я оплатил(а)', 'pay.sent': 'Заявка отправлена. Дождитесь подтверждения админа.', 'pay.pending': 'Ваша заявка рассматривается', 'pay.expired': 'Срок подписки истёк', 'pay.contact': 'Есть вопросы — напишите админу', 'pay.until': 'Подписка до {d}', 'pay.note_ph': 'Комментарий (необязательно): имя плательщика, время…', 'pay.none': 'Карта для оплаты пока не указана. Обратитесь к админу.' },
  en: { 'bill.title': 'Payments', 'bill.on': 'Paid access enabled (for everyone)', 'bill.on_d': 'When on, users without permission cannot open any video, audio, book, document or test. Admins are never limited.', 'bill.price': 'Monthly price (UZS)', 'bill.cards': 'Payment cards (one per line: number | holder | bank)', 'bill.cards_ph': '8600 1234 5678 9012 | Ali Valiyev | Uzcard', 'bill.note': 'Message to users (optional)', 'bill.save': 'Save', 'bill.saved': 'Saved',
    'bill.reqs': 'Payment requests', 'bill.none_req': 'No new requests', 'bill.months': 'Mo.', 'bill.approve': 'Grant access', 'bill.reject': 'Reject', 'bill.subs': 'Active subscriptions', 'bill.none_sub': 'No active subscriptions', 'bill.until': 'until', 'bill.revoke': 'Revoke', 'bill.grant': 'Grant access to a user', 'bill.search': 'Name or email…', 'bill.give': 'Grant', 'bill.done': 'Access granted', 'bill.revoke_q': 'Revoke this subscription?',
    'pay.title': 'App access is paid', 'pay.sub': 'Pay for a month to open the materials', 'pay.amount': 'Monthly payment', 'pay.som': 'UZS', 'pay.cards': 'Card to pay', 'pay.copy': 'Copy', 'pay.copied': 'Copied', 'pay.how': 'After paying press “I have paid”. The admin will check and grant access.', 'pay.paid': 'I have paid', 'pay.sent': 'Request sent. Wait for the admin to confirm.', 'pay.pending': 'Your request is being reviewed', 'pay.expired': 'Subscription expired', 'pay.contact': 'Questions? Write to the admin', 'pay.until': 'Subscription until {d}', 'pay.note_ph': 'Note (optional): payer name, time…', 'pay.none': 'No payment card has been added yet. Contact the admin.' },
});

const cfg = () => ({ enabled: false, price: 0, cards: [], note: '', ...(state.settings.billing || {}) });
const fmtSom = n => new Intl.NumberFormat('ru-RU').format(+n || 0).replace(/ /g, ' ');
let cache = { at: 0, ok: true };

// Ruxsat bormi? (tarmoq yoki SQL xatosida foydalanuvchini qulflamaymiz — server baribir himoyalaydi)
export async function hasAccess(force = false) {
  if (state.isAdmin || !navigator.onLine) return true;
  if (!force && Date.now() - cache.at < 20000) return cache.ok;
  try { await loadSettings(); } catch { /* */ }
  if (!cfg().enabled) { cache = { at: Date.now(), ok: true }; return true; }
  const { data, error } = await sb.rpc('has_access'); const ok = error ? true : !!data;
  cache = { at: Date.now(), ok }; return ok;
}

// Ruxsat bo'lmasa to'lov ekranini chizadi va true qaytaradi
export async function paywall(el) {
  if (await hasAccess()) return false;
  const c = cfg(), uid = state.user.id;
  const [{ data: sub }, { data: reqs }] = await Promise.all([
    sb.from('subscriptions').select('paid_until').eq('user_id', uid).maybeSingle(),
    sb.from('payment_requests').select('id,status,created_at').eq('user_id', uid).eq('status', 'pending').limit(1),
  ]);
  let pending = !!(reqs || []).length;
  const draw = () => {
    el.innerHTML = `<div class="page narrow"><div class="card pad center paycard"><div class="bigic">🔒</div><h2>${esc(t('pay.title'))}</h2><p class="muted">${esc(sub ? t('pay.expired') : t('pay.sub'))}</p>
      ${c.price > 0 ? `<div class="payamt"><small>${esc(t('pay.amount'))}</small><b>${esc(fmtSom(c.price))}</b> ${esc(t('pay.som'))}</div>` : ''}
      ${c.note ? `<p class="pre">${esc(c.note)}</p>` : ''}
      <h4 class="left mt">${esc(t('pay.cards'))}</h4>
      ${(c.cards || []).length ? `<div class="cards left">${c.cards.map((k, i) => `<div class="card pad item-row"><span class="item-ic">${ic('dollar')}</span><div class="grow"><b class="mono cardno">${esc(k.number)}</b><br><small class="muted">${esc([k.holder, k.bank].filter(Boolean).join(' · '))}</small></div><button class="btn sm soft" data-cp="${i}">${esc(t('pay.copy'))}</button></div>`).join('')}</div>` : `<p class="muted">${esc(t('pay.none'))}</p>`}
      <p class="small muted mt">${esc(t('pay.how'))}</p>
      ${pending ? `<p class="ok"><b>${esc(t('pay.pending'))}</b></p>` : `<textarea class="input" id="pn" rows="2" placeholder="${esc(t('pay.note_ph'))}"></textarea><button class="btn lg block mt" id="pd">${esc(t('pay.paid'))}</button>`}
      <a class="btn ghost block mt" href="#/inbox?topic=help">${esc(t('pay.contact'))}</a></div></div>`;
    $$('[data-cp]', el).forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(String(c.cards[+b.dataset.cp].number).replace(/\s+/g, '')); toast(t('pay.copied'), 'ok'); } catch { /* */ } });
    $('#pd', el)?.addEventListener('click', async ev => {
      const b = ev.currentTarget; btnBusy(b, true);
      const { error } = await sb.from('payment_requests').insert({ user_id: uid, amount: c.price || null, note: $('#pn', el).value.trim() });
      if (error) { btnBusy(b, false); return toast(friendlyErr(error.message), 'err'); }
      pending = true; toast(t('pay.sent'), 'ok'); draw();
    });
  };
  draw(); return true;
}

// ---------- ADMIN: sozlama + so'rovlar + obunalar
export async function billingTab(body) {
  const c = cfg();
  const [{ data: rq }, { data: sb2 }] = await Promise.all([
    sb.from('payment_requests').select('id,user_id,amount,note,created_at,profiles(full_name,email)').eq('status', 'pending').order('created_at'),
    sb.from('subscriptions').select('user_id,paid_until,profiles(full_name,email)').gt('paid_until', new Date().toISOString()).order('paid_until'),
  ]);
  body.innerHTML = `<div class="card pad form mb"><label class="chk"><input type="checkbox" id="en" ${c.enabled ? 'checked' : ''}> <b>${esc(t('bill.on'))}</b></label><p class="muted small">${esc(t('bill.on_d'))}</p>
      <label class="fld"><span>${esc(t('bill.price'))}</span><input class="input" id="pr" type="number" min="0" step="1000" value="${c.price || ''}"></label>
      <label class="fld"><span>${esc(t('bill.cards'))}</span><textarea class="input mono" id="cd" rows="3" placeholder="${esc(t('bill.cards_ph'))}">${esc((c.cards || []).map(k => [k.number, k.holder, k.bank].filter((x, i) => i === 0 || x).join(' | ')).join('\n'))}</textarea></label>
      <label class="fld"><span>${esc(t('bill.note'))}</span><textarea class="input" id="nt" rows="2">${esc(c.note || '')}</textarea></label>
      <button class="btn" id="sv">${esc(t('bill.save'))}</button></div>
    <h3>${esc(t('bill.reqs'))}</h3>${(rq || []).length ? `<div class="cards mb">${rq.map(r => `<div class="card pad"><div class="row between"><b>${esc(r.profiles?.full_name || r.profiles?.email || '—')}</b><small class="muted">${esc(fmtDate(r.created_at))}</small></div>
      <small class="muted">${esc(r.profiles?.email || '')}${r.amount ? ' · ' + esc(fmtSom(r.amount)) : ''}</small>${r.note ? `<p class="pre">${esc(r.note)}</p>` : ''}
      <div class="row wrap mt"><label class="row small">${esc(t('bill.months'))} <input class="input sm" style="width:70px" type="number" min="1" max="36" value="1" data-m="${r.id}"></label><button class="btn sm" data-ok="${r.id}:${r.user_id}">${ic('check', 14)} ${esc(t('bill.approve'))}</button><button class="btn sm ghost" data-no="${r.id}">${esc(t('bill.reject'))}</button></div></div>`).join('')}</div>` : `<p class="muted mb">${esc(t('bill.none_req'))}</p>`}
    <h3>${esc(t('bill.grant'))}</h3><div class="card pad mb"><input class="input" id="gs" placeholder="${esc(t('bill.search'))}" autocomplete="off"><div id="gr" class="cards mt"></div></div>
    <h3>${esc(t('bill.subs'))}</h3>${(sb2 || []).length ? `<div class="cards">${sb2.map(s => `<div class="card pad item-row"><div class="grow"><b>${esc(s.profiles?.full_name || s.profiles?.email || '—')}</b><br><small class="muted">${esc(t('bill.until'))} ${esc(fmtDate(s.paid_until))}</small></div><button class="btn sm ghost" data-rv="${s.user_id}">${esc(t('bill.revoke'))}</button></div>`).join('')}</div>` : `<p class="muted">${esc(t('bill.none_sub'))}</p>`}`;
  $('#sv', body).onclick = async () => {
    const cards = $('#cd', body).value.split('\n').map(l => l.split('|').map(x => x.trim())).filter(p => p[0]).map(p => ({ number: p[0], holder: p[1] || '', bank: p[2] || '' }));
    const v = { enabled: $('#en', body).checked, price: +$('#pr', body).value || 0, cards, note: $('#nt', body).value.trim() };
    const { error } = await sb.from('app_settings').upsert({ key: 'billing', value: v, updated_at: new Date().toISOString() });
    if (error) return toast(friendlyErr(error.message), 'err'); await loadSettings(); cache.at = 0; toast(t('bill.saved'), 'ok');
  };
  const grant = async (uid, months, reqId) => { const { error } = await sb.rpc('grant_subscription', { p_user: uid, p_months: months, p_request: reqId || null }); if (error) return toast(friendlyErr(error.message), 'err'); toast(t('bill.done'), 'ok'); billingTab(body); };
  $$('[data-ok]', body).forEach(b => b.onclick = () => { const [rid, uid] = b.dataset.ok.split(':'); grant(uid, +$(`[data-m="${rid}"]`, body).value || 1, rid); });
  $$('[data-no]', body).forEach(b => b.onclick = async () => { await sb.from('payment_requests').update({ status: 'rejected', resolved_at: new Date().toISOString() }).eq('id', b.dataset.no); billingTab(body); });
  $$('[data-rv]', body).forEach(b => b.onclick = async () => { if (!(await confirmDlg(t('bill.revoke_q')))) return; await sb.rpc('revoke_subscription', { p_user: b.dataset.rv }); billingTab(body); });
  let to; $('#gs', body).oninput = e => { clearTimeout(to); to = setTimeout(async () => {
    const v = e.target.value.trim(), box = $('#gr', body); if (v.length < 2) { box.innerHTML = ''; return; }
    const { data } = await sb.rpc('admin_users_summary', { p_search: v });
    box.innerHTML = (data || []).filter(u => u.role !== 'admin').slice(0, 10).map(u => `<div class="card pad item-row"><div class="grow"><b>${esc(u.full_name || '—')}</b><br><small class="muted">${esc(u.email || '')}</small></div><input class="input sm" style="width:64px" type="number" min="1" max="36" value="1" data-gm="${u.id}"><button class="btn sm" data-gv="${u.id}">${esc(t('bill.give'))}</button></div>`).join('');
    $$('[data-gv]', box).forEach(b => b.onclick = () => grant(b.dataset.gv, +$(`[data-gm="${b.dataset.gv}"]`, box).value || 1));
  }, 300); };
}
