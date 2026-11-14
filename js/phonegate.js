// Telefon raqami majburiy (talaba va o'qituvchi): kiritmaguncha ilovadan foydalanib bo'lmaydi. Obuna muddati tugashi haqida ogohlantirish ham shu yerda.
import { sb, state, esc, ic, $, toast, btnBusy, friendlyErr, setGate, render, fmtDate } from './core.js';
import { T } from './ui.js';
import { CONFIG } from './config.js';

const PH = /^\+?[0-9]{9,15}$/;
export const normPhone = v => { let s = String(v || '').replace(/[^0-9+]/g, ''); if (/^[0-9]{9}$/.test(s)) s = '+998' + s; else if (/^998[0-9]{9}$/.test(s)) s = '+' + s; return s; };
export const needPhone = () => !!state.user && !!state.profile && state.profile.role !== 'admin' && !state.profile.phone && navigator.onLine;

setGate(async () => {
  if (!needPhone()) { document.getElementById('phonegate')?.remove(); return false; }
  if (document.getElementById('phonegate')) return true;
  const g = document.createElement('div'); g.id = 'phonegate'; g.className = 'gate';
  g.innerHTML = `<div class="card pad gatecard"><div class="bigic">📱</div><h2>${esc(T('Telefon raqamingizni kiriting', 'Введите номер телефона', 'Enter your phone number'))}</h2>
    <p class="muted">${esc(T('Ilovadan foydalanish uchun telefon raqami majburiy. Parolni tiklash, to\'lov yoki akkaunt bilan bog\'liq muammo bo\'lsa administrator siz bilan shu raqam orqali bog\'lanadi.', 'Для работы с приложением нужен номер телефона. Если возникнут проблемы с паролем, оплатой или аккаунтом — администратор свяжется с вами по этому номеру.', 'A phone number is required to use the app. If there is a problem with your password, payment or account, the administrator will contact you on this number.'))}</p>
    <form class="form" id="pf"><label class="fld"><span>${esc(T('Telefon raqami', 'Номер телефона', 'Phone number'))}</span><input class="input" id="ph" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" required></label>
      <p class="muted small mb0">${esc(T('Raqamingiz faqat administrator va o\'qituvchingizga ko\'rinadi.', 'Номер виден только администратору и вашему преподавателю.', 'Your number is visible only to the administrator and your teacher.'))}</p>
      <button class="btn lg block mt" id="sv">${esc(T('Saqlash va davom etish', 'Сохранить и продолжить', 'Save and continue'))}</button></form>
    <p class="muted small mt">${esc(T('Muammo bo\'lsa: ', 'Если проблемы: ', 'Need help: '))}<a href="https://t.me/${esc(CONFIG.DEV_TG)}" target="_blank" rel="noopener">@${esc(CONFIG.DEV_TG)}</a></p>
    <button class="btn ghost sm" id="lo" type="button">${esc(T('Chiqish', 'Выйти', 'Log out'))}</button></div>`;
  document.body.appendChild(g);
  $('#lo', g).onclick = async () => { g.remove(); await sb.auth.signOut().catch(() => { }); };
  $('#pf', g).onsubmit = async e => {
    e.preventDefault(); const v = normPhone($('#ph', g).value);
    if (!PH.test(v)) return toast(T('Telefon raqami noto\'g\'ri. Masalan: +998 90 123 45 67', 'Неверный номер. Например: +998 90 123 45 67', 'Invalid number. Example: +998 90 123 45 67'), 'err');
    const b = $('#sv', g); btnBusy(b, true);
    const { error } = await sb.rpc('set_my_phone', { p_phone: v });
    if (error) { btnBusy(b, false); return toast(friendlyErr(error.message), 'err'); }
    state.profile.phone = v; try { localStorage.setItem('bio.prof.' + state.user.id, JSON.stringify(state.profile)); } catch { /* */ }
    g.remove(); toast(T('Saqlandi', 'Сохранено', 'Saved'), 'ok'); render();
  };
  return true;
});

// Obuna tugashiga 5 kun qolganda yoki tugagan bo'lsa — tepada eslatma (kuniga bir marta)
export async function subscriptionNotice() {
  try {
    if (!state.user || state.profile?.role !== 'user' || !state.settings?.billing?.enabled || document.getElementById('subbar')) return;
    const { data } = await sb.from('subscriptions').select('paid_until').eq('user_id', state.user.id).maybeSingle();
    if (!data) return;
    const left = Math.ceil((new Date(data.paid_until) - Date.now()) / 86400000);
    if (left > 5) return;
    const key = 'bio.subnote.' + state.user.id + '.' + new Date().toISOString().slice(0, 10); if (localStorage.getItem(key)) return;
    const msg = left > 0 ? T(`Obunangiz ${left} kundan keyin tugaydi (${fmtDate(data.paid_until)}). Uzilmaslik uchun to'lovni yangilang.`, `Подписка закончится через ${left} дн. (${fmtDate(data.paid_until)}). Продлите оплату.`, `Your subscription ends in ${left} day(s) (${fmtDate(data.paid_until)}). Renew to keep access.`)
      : T(`Obuna muddati tugadi (${fmtDate(data.paid_until)}). Materiallarni ochish uchun to'lov qiling.`, `Подписка истекла (${fmtDate(data.paid_until)}). Оплатите для доступа к материалам.`, `Your subscription expired (${fmtDate(data.paid_until)}). Pay to open materials.`);
    const b = document.createElement('div'); b.id = 'subbar'; b.className = 'updbar'; b.setAttribute('role', 'status');
    b.innerHTML = `<span>${ic('bell', 16)}</span><span class="grow">${esc(msg)}</span><a class="btn sm" href="#/inbox?topic=help">${esc(T('Bog\'lanish', 'Связаться', 'Contact'))}</a><button class="icon-btn" aria-label="close">${ic('x', 16)}</button>`;
    b.querySelector('button').onclick = () => { try { localStorage.setItem(key, '1'); } catch { /* */ } b.remove(); };
    document.body.appendChild(b);
  } catch { /* */ }
}
