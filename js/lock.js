// Tezkor kirish: PIN-kod + barmoq izi/Face ID (WebAuthn platform authenticator).
// Eslatma: bu QURILMA ichidagi qulf (bank ilovalari kabi UX). Hisob sessiyasi Supabase'da saqlanadi;
// PIN/barmoq izi faqat ilovani ochishni himoyalaydi. Chiqish (logout) — sessiya va qulfni to'liq o'chiradi.
import { sb, state, t, addDict, esc, ic, toast, $, $$, modal, confirmDlg } from './core.js';
import { CONFIG } from './config.js';

addDict({
  uz: { 'lock.enter': 'PIN-kodni kiriting', 'lock.hello': 'Salom, {name}!', 'lock.wrong': 'PIN noto\'g\'ri. Qolgan urinish: {n}', 'lock.forgot': 'PIN esdan chiqdimi? Hisobdan chiqish',
    'lock.set': 'Yangi PIN o\'rnating', 'lock.confirm': 'PIN-kodni takrorlang', 'lock.mismatch': 'PIN-kodlar mos kelmadi, qaytadan urining',
    'lock.setup_t': 'Tez kirishni yoqing', 'lock.setup_d': 'Keyingi safar email va parolsiz — PIN-kod yoki barmoq izi bilan kirasiz.',
    'lock.len4': '4 xonali', 'lock.len6': '6 xonali', 'lock.later': 'Keyinroq', 'lock.start': 'PIN o\'rnatish',
    'lock.bio_q': 'Barmoq izi / Face ID ham yoqilsinmi?', 'lock.bio_on': 'Yoqish', 'lock.bio_skip': 'Faqat PIN', 'lock.bio_fail': 'Biometriya yoqilmadi — PIN ishlaydi',
    'lock.done': 'Tez kirish yoqildi ✔', 'lock.bio': 'Barmoq izi', 'lock.old': 'Joriy PIN-kodni kiriting', 'lock.confirm_logout': 'Hisobdan chiqasizmi? Qurilmadagi barcha ma\'lumotlar tozalanadi.' },
  ru: { 'lock.enter': 'Введите PIN-код', 'lock.hello': 'Привет, {name}!', 'lock.wrong': 'Неверный PIN. Осталось попыток: {n}', 'lock.forgot': 'Забыли PIN? Выйти из аккаунта',
    'lock.set': 'Задайте новый PIN', 'lock.confirm': 'Повторите PIN-код', 'lock.mismatch': 'PIN-коды не совпали, попробуйте снова',
    'lock.setup_t': 'Включите быстрый вход', 'lock.setup_d': 'В следующий раз без email и пароля — по PIN-коду или отпечатку.',
    'lock.len4': '4 цифры', 'lock.len6': '6 цифр', 'lock.later': 'Позже', 'lock.start': 'Задать PIN',
    'lock.bio_q': 'Включить также отпечаток / Face ID?', 'lock.bio_on': 'Включить', 'lock.bio_skip': 'Только PIN', 'lock.bio_fail': 'Биометрия не включена — PIN работает',
    'lock.done': 'Быстрый вход включён ✔', 'lock.bio': 'Отпечаток', 'lock.old': 'Введите текущий PIN', 'lock.confirm_logout': 'Выйти из аккаунта? Все данные на устройстве будут очищены.' },
  en: { 'lock.enter': 'Enter your PIN', 'lock.hello': 'Hi, {name}!', 'lock.wrong': 'Wrong PIN. Attempts left: {n}', 'lock.forgot': 'Forgot PIN? Log out',
    'lock.set': 'Set a new PIN', 'lock.confirm': 'Repeat the PIN', 'lock.mismatch': 'PINs did not match, try again',
    'lock.setup_t': 'Turn on quick sign-in', 'lock.setup_d': 'Next time sign in with a PIN or fingerprint — no email and password.',
    'lock.len4': '4 digits', 'lock.len6': '6 digits', 'lock.later': 'Later', 'lock.start': 'Set PIN',
    'lock.bio_q': 'Also enable fingerprint / Face ID?', 'lock.bio_on': 'Enable', 'lock.bio_skip': 'PIN only', 'lock.bio_fail': 'Biometrics not enabled — PIN works',
    'lock.done': 'Quick sign-in enabled ✔', 'lock.bio': 'Fingerprint', 'lock.old': 'Enter your current PIN', 'lock.confirm_logout': 'Log out? All data on this device will be cleared.' },
});

const KEY = 'bio.lock';
const get = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const put = o => localStorage.setItem(KEY, JSON.stringify(o));
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export const lockEnabled = () => { const l = get(); return !!(l && state.user && l.uid === state.user.id && l.hash); };
export const bioEnabled = () => !!(lockEnabled() && get().cred);
export const lockInfo = () => get() || {};
export const biometricSupported = async () => !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.().catch(() => false));

async function hashPin(pin, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(salt), iterations: 150000 }, k, 256));
}
export async function setPin(pin) {
  const salt = b64(crypto.getRandomValues(new Uint8Array(16))), old = get();
  put({ uid: state.user.id, salt, hash: await hashPin(pin, salt), len: pin.length, fails: 0, auto: old?.auto ?? 1, cred: old?.uid === state.user.id ? old.cred : null });
}
export async function checkPin(pin) { const l = get(); return !!l && await hashPin(pin, l.salt) === l.hash; }
export function setAutoLock(min) { const l = get(); if (l) put({ ...l, auto: min }); }
export function removeLock() { localStorage.removeItem(KEY); }
export async function registerBiometric() {
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: CONFIG.APP_NAME },
    user: { id: new TextEncoder().encode(state.user.id), name: state.user.email, displayName: state.profile?.full_name || state.user.email },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
    timeout: 60000, attestation: 'none' } });
  put({ ...get(), cred: b64(cred.rawId) });
}
export function removeBiometric() { const l = get(); if (l) put({ ...l, cred: null }); }
async function biometricUnlock() {
  const l = get(); if (!l?.cred) return false;
  try {
    await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: 'public-key', id: unb64(l.cred), transports: ['internal'] }], userVerification: 'required', timeout: 60000 } });
    return true;
  } catch { return false; }
}

// To'liq chiqish: sessiya + qulf + mahalliy ma'lumotlar tozalanadi, ilova "hech kim kirmagandek" ochiladi
export async function doLogout(ask = true) {
  if (ask && !(await confirmDlg(t('lock.confirm_logout'), t('settings.logout')))) return;
  const lang = state.lang;
  try { await sb.auth.signOut(); } catch { /* oflayn bo'lsa ham mahalliy tozalanadi */ }
  Object.keys(localStorage).filter(k => k.startsWith('bio.') || k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
  localStorage.setItem('bio.lang', lang);
  location.hash = '#/'; location.reload();
}

// ---- PIN klaviaturasi
function keypad(len, onDone, { bio = false, onBio } = {}) {
  const el = document.createElement('div'); el.className = 'pinpad';
  el.innerHTML = `<div class="dots">${'<i></i>'.repeat(len)}</div>
    <div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" data-k="${n}">${n}</button>`).join('')}
    <button type="button" class="alt" data-bio ${bio ? '' : 'disabled style="visibility:hidden"'} aria-label="${esc(t('lock.bio'))}">${ic('lock', 24)}</button>
    <button type="button" data-k="0">0</button><button type="button" class="alt" data-del aria-label="del">⌫</button></div>`;
  let v = '';
  const paint = () => $$('.dots i', el).forEach((d, i) => d.classList.toggle('on', i < v.length));
  const api = {
    el, reset() { v = ''; paint(); },
    shake() { el.classList.add('shake'); navigator.vibrate?.(120); setTimeout(() => { el.classList.remove('shake'); api.reset(); }, 450); },
  };
  el.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k !== undefined && v.length < len) { v += b.dataset.k; paint(); if (v.length === len) setTimeout(() => onDone(v), 80); }
    else if (b.hasAttribute('data-del')) { v = v.slice(0, -1); paint(); }
    else if (b.hasAttribute('data-bio')) onBio?.();
  };
  return api;
}

// ---- Qulf ekrani (overlay — ilova holati yo'qolmaydi)
let lockP = null;
export function showLock() {
  if (lockP) return lockP;
  lockP = new Promise(resolve => {
    const l = get(); const wrap = document.createElement('div'); wrap.className = 'lockscreen';
    wrap.innerHTML = `<div class="lock-in"><div class="lock-logo">🧬</div><h2>${esc(t('lock.hello', { name: (state.profile?.full_name || '').split(' ')[0] }))}</h2>
      <p class="muted" id="lm">${esc(t('lock.enter'))}</p><div id="kp"></div>
      <button class="link mt" id="lo">${esc(t('lock.forgot'))}</button></div>`;
    document.body.appendChild(wrap); document.body.classList.add('locked');
    const done = () => { wrap.remove(); document.body.classList.remove('locked'); lockP = null; resolve(true); };
    const bioOn = !!l.cred;
    const pad = keypad(l.len || 4, async pin => {
      if (await checkPin(pin)) { put({ ...get(), fails: 0 }); return done(); }
      const cur = get(), fails = (cur.fails || 0) + 1, max = state.settings.app?.pin_max_attempts || 5;
      put({ ...cur, fails }); pad.shake();
      if (fails >= max) return doLogout(false);
      $('#lm', wrap).textContent = t('lock.wrong', { n: max - fails });
    }, { bio: bioOn, onBio: async () => { if (await biometricUnlock()) done(); } });
    $('#kp', wrap).appendChild(pad.el);
    $('#lo', wrap).onclick = () => doLogout(true);
    if (bioOn) setTimeout(async () => { if (lockP && await biometricUnlock()) done(); }, 350);
  });
  return lockP;
}

// ---- Avtomatik qulflash (ilovadan chiqib qaytganda)
let hiddenAt = 0;
export function initAutoLock() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (!lockEnabled() || !hiddenAt) return;
    const mins = get().auto ?? 1;
    if (mins >= 0 && Date.now() - hiddenAt >= mins * 60000) showLock();
  });
}

// ---- Sozlash oynasi (PIN o'rnatish yoki o'zgartirish)
export function pinSetup({ onDone, skippable = true } = {}) {
  return new Promise(async resolve => {
    let len = 4;
    const m = modal(`<div id="ps"></div>`, { onClose: () => resolve(false) });
    const host = $('#ps', m.el);
    const stepIntro = () => {
      host.innerHTML = `<div class="center"><div class="lock-logo">🔐</div><h3>${esc(t('lock.setup_t'))}</h3><p class="muted mb">${esc(t('lock.setup_d'))}</p>
        <div class="seg mb"><label><input type="radio" name="ln" value="4" checked><span>${esc(t('lock.len4'))}</span></label><label><input type="radio" name="ln" value="6"><span>${esc(t('lock.len6'))}</span></label></div>
        <button class="btn lg block" id="go">${esc(t('lock.start'))}</button>${skippable ? `<button class="link mt" id="sk">${esc(t('lock.later'))}</button>` : ''}</div>`;
      $('#go', host).onclick = () => { len = +$('input[name=ln]:checked', host).value; stepEnter(); };
      $('#sk', host)?.addEventListener('click', () => { m.close(); resolve(false); });
    };
    const stepEnter = (first = null) => {
      host.innerHTML = `<div class="center"><h3>${esc(first ? t('lock.confirm') : t('lock.set'))}</h3><p class="muted" id="pm">&nbsp;</p><div id="kp"></div></div>`;
      const pad = keypad(len, async pin => {
        if (!first) return stepEnter(pin);
        if (pin !== first) { pad.shake(); $('#pm', host).textContent = t('lock.mismatch'); return setTimeout(() => stepEnter(), 600); }
        await setPin(pin); await stepBio();
      });
      $('#kp', host).appendChild(pad.el);
    };
    const stepBio = async () => {
      if (!(await biometricSupported())) return finish();
      host.innerHTML = `<div class="center"><div class="lock-logo">👆</div><h3>${esc(t('lock.bio_q'))}</h3>
        <button class="btn lg block mt" id="y">${esc(t('lock.bio_on'))}</button><button class="link mt" id="n">${esc(t('lock.bio_skip'))}</button></div>`;
      $('#y', host).onclick = async () => { try { await registerBiometric(); } catch { toast(t('lock.bio_fail')); } finish(); };
      $('#n', host).onclick = finish;
    };
    const finish = () => { toast(t('lock.done'), 'ok'); m.close(); onDone?.(); resolve(true); };
    stepIntro();
  });
}

// Birinchi kirishda bir marta taklif qilish
export function offerQuickLogin() {
  if (lockEnabled() || localStorage.getItem('bio.lockAsk') === state.user.id) return;
  localStorage.setItem('bio.lockAsk', state.user.id);
  setTimeout(() => pinSetup({}), 900);
}
