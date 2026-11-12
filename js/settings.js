// Sozlamalar: profil, til va ko'rinish, xavfsizlik (parol, PIN, barmoq izi), bildirishnomalar, ilova haqida
import { sb, state, t, addDict, friendlyErr, route, go, esc, ic, $, $$, toast, btnBusy, compressImage, upload, publicUrl, setLang, confirmDlg, passScore } from './core.js';
import { contactCards, bindContact } from './contact.js';
import { aboutHtml } from './guide.js';
import { strengthBar, bindStrength } from './auth.js';
import { lockEnabled, bioEnabled, lockInfo, pinSetup, removeLock, removeBiometric, registerBiometric, biometricSupported, setAutoLock, doLogout } from './lock.js';
import { canInstall, installApp, isStandalone } from './pwa.js';
import { applyTheme } from './main.js';
import { CONFIG } from './config.js';

addDict({
  uz: { 'settings.title': 'Sozlamalar', 'settings.profile': 'Profil', 'settings.look': 'Til va ko\'rinish', 'settings.security': 'Xavfsizlik', 'settings.notif': 'Bildirishnomalar', 'settings.about': 'Ilova haqida',
    'settings.logout': 'Hisobdan chiqish', 'set.name': 'Ism familiya', 'set.photo': 'Profil rasmi', 'set.change_photo': 'Rasmni o\'zgartirish', 'set.saved': 'Saqlandi', 'set.gender': 'Jins',
    'set.lang': 'Til', 'set.theme': 'Mavzu', 'set.th_auto': 'Avto', 'set.th_light': 'Yorug\'', 'set.th_dark': 'Qorong\'i', 'set.font': 'Shrift o\'lchami', 'set.f_s': 'Kichik', 'set.f_m': 'O\'rta', 'set.f_l': 'Katta',
    'set.pass': 'Parolni o\'zgartirish', 'set.new_pass': 'Yangi parol', 'set.pin': 'PIN-kod', 'set.pin_set': 'PIN o\'rnatish', 'set.pin_change': 'PIN-kodni o\'zgartirish', 'set.pin_off': 'PIN-kodni o\'chirish',
    'set.bio': 'Barmoq izi / Face ID bilan kirish', 'set.bio_na': 'Bu qurilmada biometriya mavjud emas', 'set.auto': 'Avtomatik qulflash', 'set.a_now': 'Darhol', 'set.a_1': '1 daqiqadan so\'ng', 'set.a_5': '5 daqiqadan so\'ng', 'set.a_15': '15 daqiqadan so\'ng', 'set.a_never': 'Hech qachon',
    'set.pin_state_on': 'Yoqilgan', 'set.pin_state_off': 'O\'chiq', 'set.n_news': 'Yangi e\'lonlar', 'set.n_chat': 'Xabarlar va guruh chati', 'set.n_task': 'Vazifalar', 'set.n_perm': 'Qurilma bildirishnomalariga ruxsat berish',
    'set.n_note': 'Ilova ochiq yoki fonda bo\'lganda xabar kelsa, qurilma bildirishnomasi chiqadi. Ilova butunlay yopiq bo\'lganda push xabarlar keyingi bosqichda qo\'shiladi.', 'set.install': 'Ilovani o\'rnatish', 'set.installed': 'Ilova o\'rnatilgan ✔',
    'set.version': 'Versiya', 'set.role': 'Rol', 'set.admin': 'Administrator', 'set.user': 'Foydalanuvchi', 'set.pin_removed': 'PIN-kod o\'chirildi', 'set.email': 'Email', 'set.save': 'Saqlash' },
  ru: { 'settings.title': 'Настройки', 'settings.profile': 'Профиль', 'settings.look': 'Язык и вид', 'settings.security': 'Безопасность', 'settings.notif': 'Уведомления', 'settings.about': 'О приложении',
    'settings.logout': 'Выйти из аккаунта', 'set.name': 'Имя и фамилия', 'set.photo': 'Фото профиля', 'set.change_photo': 'Изменить фото', 'set.saved': 'Сохранено', 'set.gender': 'Пол',
    'set.lang': 'Язык', 'set.theme': 'Тема', 'set.th_auto': 'Авто', 'set.th_light': 'Светлая', 'set.th_dark': 'Тёмная', 'set.font': 'Размер шрифта', 'set.f_s': 'Мелкий', 'set.f_m': 'Средний', 'set.f_l': 'Крупный',
    'set.pass': 'Смена пароля', 'set.new_pass': 'Новый пароль', 'set.pin': 'PIN-код', 'set.pin_set': 'Задать PIN', 'set.pin_change': 'Изменить PIN-код', 'set.pin_off': 'Отключить PIN-код',
    'set.bio': 'Вход по отпечатку / Face ID', 'set.bio_na': 'Биометрия на этом устройстве недоступна', 'set.auto': 'Автоблокировка', 'set.a_now': 'Сразу', 'set.a_1': 'Через 1 минуту', 'set.a_5': 'Через 5 минут', 'set.a_15': 'Через 15 минут', 'set.a_never': 'Никогда',
    'set.pin_state_on': 'Включён', 'set.pin_state_off': 'Выключен', 'set.n_news': 'Новые объявления', 'set.n_chat': 'Сообщения и чат групп', 'set.n_task': 'Задания', 'set.n_perm': 'Разрешить уведомления устройства',
    'set.n_note': 'Если приложение открыто или в фоне, придёт уведомление устройства. Push при полностью закрытом приложении будет добавлен на следующем этапе.', 'set.install': 'Установить приложение', 'set.installed': 'Приложение установлено ✔',
    'set.version': 'Версия', 'set.role': 'Роль', 'set.admin': 'Администратор', 'set.user': 'Пользователь', 'set.pin_removed': 'PIN-код отключён', 'set.email': 'Email', 'set.save': 'Сохранить' },
  en: { 'settings.title': 'Settings', 'settings.profile': 'Profile', 'settings.look': 'Language & appearance', 'settings.security': 'Security', 'settings.notif': 'Notifications', 'settings.about': 'About',
    'settings.logout': 'Log out', 'set.name': 'Full name', 'set.photo': 'Profile photo', 'set.change_photo': 'Change photo', 'set.saved': 'Saved', 'set.gender': 'Gender',
    'set.lang': 'Language', 'set.theme': 'Theme', 'set.th_auto': 'Auto', 'set.th_light': 'Light', 'set.th_dark': 'Dark', 'set.font': 'Font size', 'set.f_s': 'Small', 'set.f_m': 'Medium', 'set.f_l': 'Large',
    'set.pass': 'Change password', 'set.new_pass': 'New password', 'set.pin': 'PIN code', 'set.pin_set': 'Set a PIN', 'set.pin_change': 'Change PIN', 'set.pin_off': 'Turn off PIN',
    'set.bio': 'Sign in with fingerprint / Face ID', 'set.bio_na': 'Biometrics are not available on this device', 'set.auto': 'Auto-lock', 'set.a_now': 'Immediately', 'set.a_1': 'After 1 minute', 'set.a_5': 'After 5 minutes', 'set.a_15': 'After 15 minutes', 'set.a_never': 'Never',
    'set.pin_state_on': 'On', 'set.pin_state_off': 'Off', 'set.n_news': 'New announcements', 'set.n_chat': 'Messages & group chat', 'set.n_task': 'Assignments', 'set.n_perm': 'Allow device notifications',
    'set.n_note': 'You get a device notification while the app is open or in the background. Push for a fully closed app comes in a later stage.', 'set.install': 'Install the app', 'set.installed': 'App installed ✔',
    'set.version': 'Version', 'set.role': 'Role', 'set.admin': 'Administrator', 'set.user': 'User', 'set.pin_removed': 'PIN turned off', 'set.email': 'Email', 'set.save': 'Save' },
});

addDict({
  uz: { 'settings.contact': 'Dasturchi bilan bog\'lanish', 'settings.guide': 'Foydalanish yo\'riqnomasi',
    'set.pw_note': 'Xavfsizlik uchun avval emailingizga tasdiqlash kodi yuboriladi, so\'ng yangi parol kiritasiz.', 'set.pw_send': 'Emailga kod yuborish', 'set.pw_sent': 'Kod {email} manziliga yuborildi',
    'set.pw_code': 'Emaildagi kod', 'set.pw_new2': 'Yangi parolni takrorlang', 'set.pw_resend': 'Qayta yuborish ({s} s)', 'set.pw_bad': 'Kod noto\'g\'ri yoki eskirgan',
    'set.pw_lost': 'Parolni eslay olmayapsizmi? Chiqib, kirish sahifasidagi «Parolni unutdingizmi?» ni bosing. Email ham ishlamasa — dasturchiga murojaat qiling.' },
  ru: { 'settings.contact': 'Связь с разработчиком', 'settings.guide': 'Руководство',
    'set.pw_note': 'Для безопасности сначала на email придёт код подтверждения, затем вы введёте новый пароль.', 'set.pw_send': 'Отправить код на email', 'set.pw_sent': 'Код отправлен на {email}',
    'set.pw_code': 'Код из письма', 'set.pw_new2': 'Повторите новый пароль', 'set.pw_resend': 'Отправить снова ({s} с)', 'set.pw_bad': 'Код неверный или устарел',
    'set.pw_lost': 'Не помните пароль? Выйдите и нажмите «Забыли пароль?» на странице входа. Если email недоступен — обратитесь к разработчику.' },
  en: { 'settings.contact': 'Contact the developer', 'settings.guide': 'User guide',
    'set.pw_note': 'For security we first email you a confirmation code, then you enter the new password.', 'set.pw_send': 'Send code to email', 'set.pw_sent': 'Code sent to {email}',
    'set.pw_code': 'Code from email', 'set.pw_new2': 'Repeat new password', 'set.pw_resend': 'Resend ({s} s)', 'set.pw_bad': 'Code is wrong or expired',
    'set.pw_lost': 'Can\'t remember your password? Log out and tap “Forgot password?” on the sign-in page. If email is unavailable, contact the developer.' },
});

const SECTIONS = [['profile', 'user'], ['look', 'globe'], ['security', 'lock'], ['notif', 'bell'], ['contact', 'phone'], ['about', 'help']];
const saveProfile = async patch => { const { error } = await sb.from('profiles').update(patch).eq('id', state.user.id); if (error) { toast(error.message, 'err'); return false; } Object.assign(state.profile, patch); toast(t('set.saved'), 'ok'); return true; };

route('/settings', async ({ el }) => {
  const p = state.profile;
  el.innerHTML = `<div class="page narrow"><h1>${esc(t('settings.title'))}</h1>
    <div class="card pad row"><span class="avatar lg">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="">` : esc((p.full_name || '?')[0])}</span><div class="grow"><b>${esc(p.full_name)}</b><br><small class="muted">${esc(state.user.email)} · ${esc(t(state.isAdmin ? 'set.admin' : 'set.user'))}</small></div></div>
    <div class="cards mt">${SECTIONS.map(([k, i]) => `<a class="card pad item-row" href="#/settings/${k}"><span class="item-ic">${ic(i)}</span><b class="grow">${esc(t('settings.' + k))}</b>${ic('chev')}</a>`).join('')}
      <a class="card pad item-row" href="#/offline"><span class="item-ic">${ic('download')}</span><b class="grow">${esc(t('off.title'))}</b>${ic('chev')}</a>
      <a class="card pad item-row" href="#/guide"><span class="item-ic">${ic('book')}</span><b class="grow">${esc(t('settings.guide'))}</b>${ic('chev')}</a>
      ${state.isAdmin ? `<a class="card pad item-row" href="#/admin"><span class="item-ic">${ic('shield')}</span><b class="grow">${esc(t('nav.admin'))}</b>${ic('chev')}</a>` : ''}
      <button class="card pad item-row danger-row" id="lo"><span class="item-ic">${ic('logout')}</span><b class="grow left">${esc(t('settings.logout'))}</b></button></div></div>`;
  $('#lo', el).onclick = () => doLogout(true);
}, { auth: true });

route('/settings/:s', async ({ el, params }) => {
  const s = params.s, p = state.profile; if (!SECTIONS.find(x => x[0] === s)) return go('/settings', true);
  const head = `<div class="row"><a class="btn ghost sm" href="#/settings">${ic('back')}</a><h2 class="mb0">${esc(t('settings.' + s))}</h2></div>`;
  let body = '';
  if (s === 'profile') body = `<div class="card pad form mt"><div class="row"><span class="avatar lg" id="av">${p.avatar_url ? `<img src="${esc(p.avatar_url)}" alt="">` : esc((p.full_name || '?')[0])}</span>
      <label class="btn ghost sm">${esc(t('set.change_photo'))}<input type="file" id="ph" accept="image/*" hidden></label></div>
      <label class="fld"><span>${esc(t('set.name'))}</span><input class="input" id="nm" value="${esc(p.full_name)}"></label>
      <div class="fld"><span>${esc(t('set.gender'))}</span><div class="seg"><label><input type="radio" name="g" value="m" ${p.gender === 'm' ? 'checked' : ''}><span>${esc(t('auth.male'))}</span></label><label><input type="radio" name="g" value="f" ${p.gender === 'f' ? 'checked' : ''}><span>${esc(t('auth.female'))}</span></label></div></div>
      <label class="fld"><span>${esc(t('set.email'))}</span><input class="input" value="${esc(state.user.email)}" disabled></label><button class="btn" id="sv">${esc(t('set.save'))}</button></div>`;
  if (s === 'look') body = `<div class="card pad form mt"><div class="fld"><span>${esc(t('set.lang'))}</span><div class="seg">${['uz', 'ru', 'en'].map(l => `<label><input type="radio" name="l" value="${l}" ${state.lang === l ? 'checked' : ''}><span>${({ uz: 'O\'zbekcha', ru: 'Русский', en: 'English' })[l]}</span></label>`).join('')}</div></div>
      <div class="fld"><span>${esc(t('set.theme'))}</span><div class="seg">${[['auto', 'set.th_auto'], ['light', 'set.th_light'], ['dark', 'set.th_dark']].map(([v, k]) => `<label><input type="radio" name="th" value="${v}" ${(localStorage.getItem('bio.theme') || 'auto') === v ? 'checked' : ''}><span>${esc(t(k))}</span></label>`).join('')}</div></div>
      <div class="fld"><span>${esc(t('set.font'))}</span><div class="seg">${[['s', 'set.f_s'], ['m', 'set.f_m'], ['l', 'set.f_l']].map(([v, k]) => `<label><input type="radio" name="fs" value="${v}" ${(localStorage.getItem('bio.fs') || 'm') === v ? 'checked' : ''}><span>${esc(t(k))}</span></label>`).join('')}</div></div></div>`;
  if (s === 'security') {
    const on = lockEnabled(), info = lockInfo(), bsup = await biometricSupported();
    body = `<div class="card pad form mt"><h4>${esc(t('set.pass'))}</h4><p class="muted small">${esc(t('set.pw_note'))}</p>
      <button class="btn" id="pcode">${esc(t('set.pw_send'))}</button>
      <div id="pstep" hidden class="form"><small class="muted" id="psent"></small>
        <label class="fld"><span>${esc(t('set.pw_code'))}</span><input class="input otp" id="pc" inputmode="numeric" autocomplete="one-time-code" maxlength="${CONFIG.OTP_LENGTH}" placeholder="${'•'.repeat(CONFIG.OTP_LENGTH)}"></label>
        <label class="fld"><span>${esc(t('set.new_pass'))}</span><input class="input" id="np" type="password" autocomplete="new-password"></label>${strengthBar('np')}
        <label class="fld"><span>${esc(t('set.pw_new2'))}</span><input class="input" id="np2" type="password" autocomplete="new-password"></label>
        <div class="err" id="perr"></div><button class="btn" id="cp">${esc(t('set.save'))}</button></div>
      <p class="muted small">${esc(t('set.pw_lost'))}</p></div>
      <div class="card pad form mt"><div class="row between"><h4>${esc(t('set.pin'))}</h4><span class="chip ${on ? 'ok' : ''}">${esc(t(on ? 'set.pin_state_on' : 'set.pin_state_off'))}</span></div>
      <button class="btn" id="pin">${esc(t(on ? 'set.pin_change' : 'set.pin_set'))}</button>
      ${on ? `${bsup ? `<label class="chk"><input type="checkbox" id="bio" ${bioEnabled() ? 'checked' : ''}> ${esc(t('set.bio'))}</label>` : `<small class="muted">${esc(t('set.bio_na'))}</small>`}
        <label class="fld"><span>${esc(t('set.auto'))}</span><select class="input" id="al">${[[0, 'set.a_now'], [1, 'set.a_1'], [5, 'set.a_5'], [15, 'set.a_15'], [-1, 'set.a_never']].map(([v, k]) => `<option value="${v}" ${(info.auto ?? 0) === v ? 'selected' : ''}>${esc(t(k))}</option>`).join('')}</select></label>
        <button class="btn ghost danger" id="off">${esc(t('set.pin_off'))}</button>` : ''}</div>`;
  }
  if (s === 'notif') { const pr = p.prefs || {}; const perm = 'Notification' in window ? Notification.permission : 'denied';
    body = `<div class="card pad form mt">${[['notif_news', 'set.n_news'], ['notif_chat', 'set.n_chat'], ['notif_task', 'set.n_task']].map(([k, l]) => `<label class="chk"><input type="checkbox" data-n="${k}" ${pr[k] === false ? '' : 'checked'}> ${esc(t(l))}</label>`).join('')}
      ${'Notification' in window ? `<button class="btn ${perm === 'granted' ? 'ghost' : ''}" id="perm" ${perm === 'granted' ? 'disabled' : ''}>${esc(t('set.n_perm'))}${perm === 'granted' ? ' ✔' : ''}</button>` : ''}<p class="muted small">${esc(t('set.n_note'))}</p></div>`; }
  if (s === 'contact') body = `<p class="muted mt">${esc(t('ct.sub'))}</p>${contactCards()}`;
  if (s === 'about') body = `<div class="card pad mt center"><div class="lock-logo">🧬</div><h3>${esc(CONFIG.APP_NAME)}</h3><p class="muted">${esc(t('set.version'))} 2.0 · ${esc(t(state.isAdmin ? 'set.admin' : 'set.user'))}</p>
      ${isStandalone() ? `<p class="ok">${esc(t('set.installed'))}</p>` : canInstall() ? `<button class="btn lg" id="ins">${ic('download')} ${esc(t('set.install'))}</button>` : ''}</div>${aboutHtml()}`;
  el.innerHTML = `<div class="page narrow">${head}${body}</div>`;

  // --- hodisalar
  $('#ph', el)?.addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return;
    try { const blob = await compressImage(f, { max: 320, quality: 0.8 }); const path = `${state.user.id}/avatar-${Date.now()}.webp`; await upload('avatars', path, blob);
      const url = publicUrl('avatars', path); if (await saveProfile({ avatar_url: url })) $('#av', el).innerHTML = `<img src="${esc(url)}" alt="">`; } catch (x) { toast(x.message, 'err'); } });
  $('#sv', el)?.addEventListener('click', () => saveProfile({ full_name: $('#nm', el).value.trim() || p.full_name, gender: $('input[name=g]:checked', el)?.value || null }));
  $$('input[name=l]', el).forEach(r => r.onchange = () => setLang(r.value));
  $$('input[name=th]', el).forEach(r => r.onchange = () => { localStorage.setItem('bio.theme', r.value); applyTheme(); });
  $$('input[name=fs]', el).forEach(r => r.onchange = () => { localStorage.setItem('bio.fs', r.value); applyTheme(); });
  if ($('#pcode', el)) {
    bindStrength(el, 'np'); bindContact(el);
    const sendBtn = $('#pcode', el); let cd = 0, iv;
    const tick = () => { if (!sendBtn.isConnected) return clearInterval(iv); if (cd > 0) { sendBtn.disabled = true; sendBtn.textContent = t('set.pw_resend', { s: cd-- }); } else { sendBtn.disabled = false; sendBtn.textContent = t('set.pw_send'); clearInterval(iv); } };
    sendBtn.onclick = async () => {
      btnBusy(sendBtn, true); const { error } = await sb.auth.resetPasswordForEmail(state.user.email); btnBusy(sendBtn, false);
      if (error) return toast(/rate|429/i.test(error.message) ? t('auth.err_rate') : error.message, 'err');
      $('#pstep', el).hidden = false; $('#psent', el).textContent = t('set.pw_sent', { email: state.user.email }); $('#pc', el).focus(); cd = 60; clearInterval(iv); iv = setInterval(tick, 1000); tick();
    };
    $('#pc', el).oninput = e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, CONFIG.OTP_LENGTH); };
    $('#cp', el).onclick = async ev => {
      const err = $('#perr', el), code = $('#pc', el).value, p1 = $('#np', el).value, p2 = $('#np2', el).value; err.textContent = '';
      if (code.length < 6) return err.textContent = t('set.pw_bad');
      if (p1.length < 8) return err.textContent = t('auth.err_pass_len');
      if (passScore(p1).issue) return err.textContent = t('pw.weak');
      if (p1 !== p2) return err.textContent = t('auth.err_pass_match');
      const b = ev.currentTarget; btnBusy(b, true);
      const v = await sb.auth.verifyOtp({ email: state.user.email, token: code, type: 'recovery' });
      if (v.error) { btnBusy(b, false); return err.textContent = t('set.pw_bad'); }
      const { error } = await sb.auth.updateUser({ password: p1 }); btnBusy(b, false);
      if (error) return err.textContent = friendlyErr(error.message);
      toast(t('rec.done'), 'ok'); go('/settings/security', true);
    };
  }
  if (s === 'contact') bindContact(el);
  $('#pin', el)?.addEventListener('click', () => pinSetup({ skippable: false, onDone: () => go('/settings/security', true) }));
  $('#bio', el)?.addEventListener('change', async e => { if (e.target.checked) { try { await registerBiometric(); } catch { e.target.checked = false; toast(t('lock.bio_fail')); } } else removeBiometric(); });
  $('#al', el)?.addEventListener('change', e => setAutoLock(+e.target.value));
  $('#off', el)?.addEventListener('click', async () => { if (await confirmDlg(t('set.pin_off') + '?')) { removeLock(); toast(t('set.pin_removed')); go('/settings/security', true); } });
  $$('[data-n]', el).forEach(c => c.onchange = () => saveProfile({ prefs: { ...(p.prefs || {}), [c.dataset.n]: c.checked } }));
  $('#perm', el)?.addEventListener('click', async () => { await Notification.requestPermission(); go('/settings/notif', true); });
  $('#ins', el)?.addEventListener('click', installApp);
}, { auth: true });
