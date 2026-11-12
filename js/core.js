// Umumiy yadro: Supabase mijozi, holat, til, router, yordamchilar
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG } from './config.js';

export const sb = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  realtime: { params: { eventsPerSecond: 8 } },
});

export const state = {
  user: null, profile: null, isAdmin: false,
  lang: localStorage.getItem('bio.lang') || ((navigator.language || '').slice(0, 2) === 'ru' ? 'ru' : 'uz'),
  settings: { video: {}, app: {} },
};
if (!['uz', 'ru', 'en'].includes(state.lang)) state.lang = 'uz';

// ---------- i18n ----------
const DICT = { uz: {}, ru: {}, en: {} };
// O'zbek lotin imlosi: oʻ, gʻ (U+02BB) va tutuq belgisi (U+02BC). Kodda oddiy ' yozilgan — shu yerda to'g'rilanadi.
export function uzFix(s) {
  if (typeof s !== 'string') return Array.isArray(s) ? s.map(uzFix) : s;
  return s.replace(/([oOgG])['‘’`ʼ´]/g, '$1\u02BB').replace(/([A-Za-z])['‘’`´]([A-Za-z])/g, '$1\u02BC$2');
}
export function addDict(d) {
  for (const l of ['uz', 'ru', 'en']) {
    const src = d[l] || {};
    if (l === 'uz') for (const k of Object.keys(src)) src[k] = uzFix(src[k]);
    Object.assign(DICT[l], src);
  }
}
export function t(k, vars) {
  let s = DICT[state.lang]?.[k] ?? DICT.uz[k] ?? k;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, n) => vars[n] ?? '');
  return s;
}
// {uz,ru,en} ko'rinishidagi kontentni joriy tilga o'tkazadi
export function tr(o) {
  if (!o) return '';
  if (typeof o === 'string') return o;
  return o[state.lang] || o.uz || o.ru || o.en || Object.values(o)[0] || '';
}
export function setLang(l) {
  state.lang = l; localStorage.setItem('bio.lang', l); document.documentElement.lang = l;
  if (state.user) sb.from('profiles').update({ lang: l }).eq('id', state.user.id).then(() => {});
  render();
}

// ---------- DOM yordamchilari ----------
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const rand = a => a[Math.floor(Math.random() * a.length)];
export function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const IC = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  audio: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
  test: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  mega: '<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 8a5 5 0 0 1 0 8"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  chev: '<polyline points="9 18 15 12 9 6"/>',
  clip: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  rewind: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  full: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
};
export const ic = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

// ---------- Vaqt/format ----------
export function fmtDur(s) {
  s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
}
export function fmtMin(sec) {
  const m = Math.round((sec || 0) / 60), h = Math.floor(m / 60);
  if (!h) return m + ' ' + t('u.min');
  return h + ' ' + t('u.h') + (m % 60 ? ' ' + (m % 60) + ' ' + t('u.min') : '');
}
export const dayStr = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export function fmtDate(ts) {
  const d = new Date(ts); return d.toLocaleDateString(state.lang === 'uz' ? 'uz-UZ' : state.lang === 'ru' ? 'ru-RU' : 'en-GB', { day: '2-digit', month: 'short' });
}
export function fmtTime(ts) { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
export const fmtSize = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';

// ---------- UI: toast / modal / confirm ----------
export function toast(msg, type = '') {
  let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div'); el.className = 'toast ' + type; el.textContent = msg; box.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2800); setTimeout(() => el.remove(), 3300);
}
export function modal(inner, { cls = '', onClose } = {}) {
  const wrap = document.createElement('div'); wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true"><button class="modal-x" aria-label="close">${ic('x')}</button><div class="modal-body">${inner}</div></div>`;
  document.body.appendChild(wrap);
  const close = () => { wrap.remove(); onClose?.(); };
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  $('.modal-x', wrap).onclick = close;
  return { el: $('.modal-body', wrap), close };
}
export function confirmDlg(msg, okText) {
  return new Promise(res => {
    const m = modal(`<p class="mb">${esc(msg)}</p><div class="row end"><button class="btn ghost" data-n>${t('cancel')}</button><button class="btn danger" data-y>${esc(okText || t('yes'))}</button></div>`, { onClose: () => res(false) });
    $('[data-n]', m.el).onclick = () => { m.close(); res(false); };
    $('[data-y]', m.el).onclick = () => { res(true); m.close(); };
  });
}
export function promptDlg(title, value = '', ph = '') {
  return new Promise(res => {
    const m = modal(`<h3>${esc(title)}</h3><input class="input" data-i value="${esc(value)}" placeholder="${esc(ph)}"><div class="row end mt"><button class="btn ghost" data-n>${t('cancel')}</button><button class="btn" data-y>OK</button></div>`, { onClose: () => res(null) });
    const i = $('[data-i]', m.el); i.focus();
    const ok = () => { res(i.value.trim()); m.close(); };
    $('[data-y]', m.el).onclick = ok; $('[data-n]', m.el).onclick = () => { res(null); m.close(); };
    i.onkeydown = e => { if (e.key === 'Enter') ok(); };
  });
}
export const spinner = () => `<div class="center pad"><div class="spin"></div></div>`;
export function btnBusy(btn, on) { if (!btn) return; btn.disabled = on; btn.classList.toggle('busy', on); }

// ---------- Fayl/rasm ----------
export async function compressImage(file, { max = 1280, quality = 0.72 } = {}) {
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  let blob = await new Promise(r => c.toBlob(r, 'image/webp', quality));
  if (!blob || blob.type !== 'image/webp') blob = await new Promise(r => c.toBlob(r, 'image/jpeg', quality));
  return blob;
}
export const uid8 = () => crypto.randomUUID().slice(0, 8);
export function safeName(n) { return String(n).normalize('NFKD').replace(/[^\w.\-]+/g, '_').slice(-80); }
export async function upload(bucket, path, blob, opts = {}) {
  const { error } = await sb.storage.from(bucket).upload(path, blob, { upsert: false, cacheControl: '3600', contentType: blob.type || undefined, ...opts });
  if (error) throw error; return path;
}
const urlCache = new Map();
export async function signedUrl(bucket, path, ttl = 3600) {
  const k = bucket + '/' + path, c = urlCache.get(k);
  if (c && c.exp > Date.now()) return c.url;
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, ttl);
  if (error) throw error;
  urlCache.set(k, { url: data.signedUrl, exp: Date.now() + (ttl - 120) * 1000 });
  return data.signedUrl;
}
export const publicUrl = (bucket, path) => path ? sb.storage.from(bucket).getPublicUrl(path).data.publicUrl : '';

// ---------- Avto-tarjima (MyMemory, bepul) ----------
export async function translateText(text, from, to) {
  if (!text || from === to) return text;
  const parts = text.match(/[\s\S]{1,420}(?:[.!?\n]|$)|[\s\S]+/g) || [text];
  const out = [];
  for (const p of parts) {
    try {
      const q = new URLSearchParams({ q: p, langpair: `${from}|${to}` });
      if (CONFIG.TRANSLATE_EMAIL) q.set('de', CONFIG.TRANSLATE_EMAIL);
      const r = await fetch('https://api.mymemory.translated.net/get?' + q);
      const j = await r.json();
      const tx = j?.responseData?.translatedText;
      out.push(tx && j.responseStatus === 200 ? tx : p);
    } catch { out.push(p); }
  }
  return out.join('');
}
// {uz,ru,en} qaytaradi. Asl matn `from` tilida deb olinadi.
export async function i18nField(text, from = state.lang, auto = CONFIG.AI_TRANSLATE) {
  const o = { uz: '', ru: '', en: '' }; o[from] = text;
  if (!auto || !text) { for (const l of ['uz', 'ru', 'en']) if (!o[l]) o[l] = text; return o; }
  await Promise.all(['uz', 'ru', 'en'].filter(l => l !== from).map(async l => { o[l] = await translateText(text, from, l); }));
  return o;
}

// ---------- Foydalanish vaqtini kuzatish ----------
export function trackTime(kind, itemId, isActive = () => true) {
  let acc = 0, last = Date.now(), stopped = false;
  const flush = async () => {
    const s = Math.floor(acc); if (s <= 0) return; acc -= s;
    try { await sb.rpc('add_usage', { p_kind: kind, p_item: itemId || null, p_secs: s }); } catch { /* oflayn */ }
  };
  const tick = () => {
    if (stopped) return; const now = Date.now();
    if (!document.hidden && isActive()) acc += (now - last) / 1000;
    last = now; if (acc >= 20) flush();
  };
  const iv = setInterval(tick, 4000);
  return { stop() { if (stopped) return; tick(); stopped = true; clearInterval(iv); flush(); }, flush };
}

// ---------- Router (hash) ----------
const routes = []; let leaveFns = []; let tok = 0;
export function route(pattern, handler, opts = {}) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ re, keys, handler, opts });
}
export const onLeave = fn => leaveFns.push(fn);
export const go = (path, replace) => { if (replace) location.replace('#' + path); else location.hash = path; };
export const currentPath = () => (location.hash.slice(1) || '/').split('?')[0];
let shellHook = () => {};
export const setShellHook = fn => { shellHook = fn; };

export async function render() {
  const my = ++tok;
  const raw = location.hash.slice(1) || '/';
  const [path, qs] = raw.split('?'); const q = Object.fromEntries(new URLSearchParams(qs || ''));
  leaveFns.forEach(f => { try { f(); } catch { /* */ } }); leaveFns = [];
  for (const r of routes) {
    const m = path.match(r.re); if (!m) continue;
    if (r.opts.auth && !state.user) return go('/', true);
    if (r.opts.admin && !state.isAdmin) return go('/home', true);
    const params = {}; r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
    const el = $('#view'); el.innerHTML = spinner(); el.scrollTop = 0; window.scrollTo(0, 0);
    shellHook(path, r.opts);
    try { await r.handler({ params, q, el, alive: () => my === tok }); }
    catch (e) { console.error(e); if (my === tok) el.innerHTML = `<div class="card pad center"><p>⚠️ ${esc(e.message || e)}</p></div>`; }
    return;
  }
  go(state.user ? '/home' : '/', true);
}

// ---------- Sozlamalar (admin o'zgartiradi) ----------
export async function loadSettings() {
  const { data } = await sb.from('app_settings').select('key,value');
  (data || []).forEach(r => { state.settings[r.key] = r.value; });
}


// ---------- kichik xotira keshi (tez ochilish): bir xil so'rovni qisqa muddat qayta yubormaydi
const MEMO = new Map();
export async function memo(key, ttl, fn) {
  const h = MEMO.get(key); if (h && Date.now() - h.t < ttl) return h.v;
  const v = await fn(); MEMO.set(key, { t: Date.now(), v }); return v;
}
export function memoClear(prefix = '') { for (const k of [...MEMO.keys()]) if (k.startsWith(prefix)) MEMO.delete(k); }

// ---------- parol: kuchli parol yaratish va baholash
const COMMON = ['12345678', '123456789', 'password', 'qwertyui', '11111111', '00000000', 'umidjon21', 'ulugbek0829', 'parol123', 'password1', 'iloveyou', '87654321'];
export function genPassword(len = 14) {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@#$%^&*?-_'];
  const rnd = n => { const a = new Uint32Array(1); let x; do { crypto.getRandomValues(a); x = a[0]; } while (x >= Math.floor(4294967296 / n) * n); return x % n; };
  const all = sets.join(''), out = sets.map(s => s[rnd(s.length)]);
  while (out.length < len) out.push(all[rnd(all.length)]);
  for (let i = out.length - 1; i > 0; i--) { const j = rnd(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out.join('');
}
// 0..4 ball + muammo kodi (null = yaxshi)
export function passScore(p) {
  p = p || ''; let sc = 0;
  if (p.length >= 8) sc++; if (p.length >= 12) sc++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) sc++; if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) sc++;
  let issue = null;
  if (p.length < 8) issue = 'len'; else if (COMMON.includes(p.toLowerCase()) || /^(.)\1+$/.test(p) || /^\d+$/.test(p)) { issue = 'weak'; sc = Math.min(sc, 1); }
  return { score: Math.min(4, sc), issue };
}
