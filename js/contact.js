// Dasturchi bilan bog'lanish: qo'ng'iroq (tasdiq bilan), Telegram (tasdiq bilan), kontaktni telefonga saqlash (.vcf)
// va birinchi kirishdagi bir martalik eslatma ("raqamni telefoningizga saqlab qo'ying").
import { state, t, addDict, esc, ic, modal, confirmDlg, toast, sb } from './core.js';
import { CONFIG } from './config.js';

addDict({
  uz: { 'ct.title': 'Dasturchi bilan bog\'lanish', 'ct.sub': 'Savol, xatolik yoki taklif bo\'lsa — to\'g\'ridan-to\'g\'ri yozing yoki qo\'ng\'iroq qiling.',
    'ct.phone': 'Telefon', 'ct.tg': 'Telegram', 'ct.call_q': '{n} raqamiga qo\'ng\'iroq qilinsinmi?', 'ct.tg_q': 'Telegramga o\'tasizmi? ({n})',
    'ct.call': 'Qo\'ng\'iroq qilish', 'ct.open_tg': 'Telegramga o\'tish', 'ct.vcf': 'Kontaktni telefonga saqlash', 'ct.vcf_done': 'Kontakt fayli yuklandi — uni oching va saqlang',
    'ct.note_t': 'Dasturchi raqamini saqlab qo\'ying', 'ct.note_d': 'Ilovada muammo bo\'lsa yoki parolni tiklab bo\'lmasa, dasturchi shu raqam va Telegram orqali yordam beradi. Raqamni telefoningizga kiriting.',
    'ct.saved': 'Kiritdim ✔', 'ct.later': 'Keyinroq eslating', 'ct.thanks': 'Rahmat! Endi eslatilmaydi' },
  ru: { 'ct.title': 'Связь с разработчиком', 'ct.sub': 'Вопрос, ошибка или предложение — напишите или позвоните напрямую.',
    'ct.phone': 'Телефон', 'ct.tg': 'Telegram', 'ct.call_q': 'Позвонить на номер {n}?', 'ct.tg_q': 'Перейти в Telegram? ({n})',
    'ct.call': 'Позвонить', 'ct.open_tg': 'Перейти в Telegram', 'ct.vcf': 'Сохранить контакт в телефон', 'ct.vcf_done': 'Файл контакта скачан — откройте и сохраните',
    'ct.note_t': 'Сохраните номер разработчика', 'ct.note_d': 'Если возникнет проблема или не получится восстановить пароль, разработчик поможет по этому номеру и в Telegram. Добавьте номер в контакты телефона.',
    'ct.saved': 'Добавил ✔', 'ct.later': 'Напомнить позже', 'ct.thanks': 'Спасибо! Больше не напомним' },
  en: { 'ct.title': 'Contact the developer', 'ct.sub': 'Question, bug or idea — write or call directly.',
    'ct.phone': 'Phone', 'ct.tg': 'Telegram', 'ct.call_q': 'Call {n}?', 'ct.tg_q': 'Open Telegram? ({n})',
    'ct.call': 'Call', 'ct.open_tg': 'Open Telegram', 'ct.vcf': 'Save contact to phone', 'ct.vcf_done': 'Contact file downloaded — open it and save',
    'ct.note_t': 'Save the developer\'s number', 'ct.note_d': 'If something goes wrong or you can\'t recover your password, the developer helps via this number and Telegram. Add it to your phone contacts.',
    'ct.saved': 'Done ✔', 'ct.later': 'Remind me later', 'ct.thanks': 'Thanks! We won\'t remind again' },
});

export const callDev = async () => { if (await confirmDlg(t('ct.call_q', { n: CONFIG.DEV_PHONE_LABEL }))) location.href = 'tel:' + CONFIG.DEV_PHONE; };
export const openTg = async () => { if (await confirmDlg(t('ct.tg_q', { n: '@' + CONFIG.DEV_TG }))) window.open('https://t.me/' + CONFIG.DEV_TG, '_blank', 'noopener'); };
export function saveVcf() {
  const v = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${CONFIG.DEV_NAME}\r\nN:;${CONFIG.DEV_NAME};;;\r\nORG:${CONFIG.APP_NAME}\r\nTEL;TYPE=CELL:${CONFIG.DEV_PHONE}\r\nURL:https://t.me/${CONFIG.DEV_TG}\r\nNOTE:Telegram @${CONFIG.DEV_TG}\r\nEND:VCARD\r\n`;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([v], { type: 'text/vcard' })); a.download = 'developer.vcf';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(t('ct.vcf_done'), 'ok');
}
export const contactCards = () => `<div class="cards">
  <button class="card pad item-row" data-ct="call"><span class="item-ic">${ic('phone')}</span><div class="grow left"><b>${esc(t('ct.phone'))}</b><br><small class="muted">${esc(CONFIG.DEV_PHONE_LABEL)}</small></div>${ic('chev')}</button>
  <button class="card pad item-row" data-ct="tg"><span class="item-ic">${ic('send')}</span><div class="grow left"><b>${esc(t('ct.tg'))}</b><br><small class="muted">@${esc(CONFIG.DEV_TG)}</small></div>${ic('chev')}</button>
  <button class="card pad item-row" data-ct="vcf"><span class="item-ic">${ic('download')}</span><b class="grow left">${esc(t('ct.vcf'))}</b>${ic('chev')}</button></div>`;
export function bindContact(root) {
  root.querySelectorAll('[data-ct]').forEach(b => b.onclick = () => ({ call: callDev, tg: openTg, vcf: saveVcf })[b.dataset.ct]());
}

// Birinchi kirishdan keyin (foydalanuvchi ham, admin ham): "raqamni saqlab qo'ying". "Kiritdim" bosilsa — qaytib so'ramaydi.
let shownThisSession = false;
export function maybeDevNote() {
  if (!state.user || shownThisSession) return; shownThisSession = true;
  if (state.profile?.prefs?.dev_saved || localStorage.getItem('bio.devnote.' + state.user.id)) return;
  const m = modal(`<div class="center"><div class="bigic">📞</div><h3>${esc(t('ct.note_t'))}</h3><p class="muted">${esc(t('ct.note_d'))}</p></div>${contactCards()}
    <div class="row mt"><button class="btn grow" id="ok">${esc(t('ct.saved'))}</button><button class="btn ghost grow" id="lt">${esc(t('ct.later'))}</button></div>`);
  bindContact(m.el);
  m.el.querySelector('#lt').onclick = () => m.close();
  m.el.querySelector('#ok').onclick = async () => {
    localStorage.setItem('bio.devnote.' + state.user.id, '1');
    const prefs = { ...(state.profile.prefs || {}), dev_saved: true }; state.profile.prefs = prefs;
    try { await sb.from('profiles').update({ prefs }).eq('id', state.user.id); } catch { /* */ }
    toast(t('ct.thanks'), 'ok'); m.close();
  };
}
