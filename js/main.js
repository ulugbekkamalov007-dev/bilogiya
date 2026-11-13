// Ilova kirish nuqtasi: sessiya, qulf, navigatsiya, "orqaga" tugmasi mantig'i
import { sb, state, t, $, $$, esc, ic, render, go, setShellHook, loadSettings, trackTime, toast, setLang, currentPath, snapClear } from './core.js';
import './i18n.js';
import './auth.js';
import './home.js';
import './library.js';
import './tests.js';
import './reports.js';
import './groups.js';
import './news.js';
import './inbox.js';
import './settings.js';
import './admin.js';
import './guide.js';
import './courses.js';
import './flash.js';
import './teacher.js';
import './forum.js';
import './practice.js';
import './lab.js';
import './ai.js';
import './materials.js';
import './qedit.js';
import { offList } from './offline.js';
import { maybeDevNote } from './contact.js';
import { initials } from './core.js';
import { applyBg } from './bg.js';
import { initMiniBar } from './audiobar.js';
import { doLogout, lockEnabled, showLock, initAutoLock, offerQuickLogin, isReloadUnlocked } from './lock.js';
import { openSearch } from './search.js';
import { refreshStats, xpChip } from './xp.js';
import { T } from './ui.js';
import { registerSW, canInstall, installApp } from './pwa.js';
import { CONFIG } from './config.js';

registerSW();

// ---- mavzu / shrift
export function applyTheme() {
  const th = localStorage.getItem('bio.theme') || 'auto';
  document.documentElement.dataset.theme = th === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : th;
  document.documentElement.style.fontSize = ({ s: '15px', m: '16px', l: '18px' })[localStorage.getItem('bio.fs') || 'm'];
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#101A15' : '#087C50');
}
document.body.classList.toggle('nav-collapsed', !!localStorage.getItem('bio.navc'));
document.addEventListener('click', e => { const d = document.getElementById('pdrop'); if (d && !d.hidden && !e.target.closest('.pmenu')) d.hidden = true; });
addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && state.user && !document.body.classList.contains('locked')) { e.preventDefault(); openSearch(); } });
applyTheme(); matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
document.documentElement.lang = state.lang;

// ---- qobiq (header + pastki navigatsiya)
const staffNow = () => state.isAdmin || state.profile?.role === 'teacher';
// [yo'l, ikonka, nom, kompyuterda ham/faqat, faol bo'lgan yo'llar]
const isTeacher = () => !state.isAdmin && state.profile?.role === 'teacher';
const TEACHER_NAV = () => [
  ['/home', 'home', t('nav.home'), 0, /^\/home/], ['/teach', 'cap', T('Kurslarim', 'Мои курсы', 'My courses'), 0, /^\/(teach(\/course.*)?$|courses|course|lesson|cert)/],
  ['/teach/materials', 'plus', T('Materiallar', 'Материалы', 'Materials'), 0, /^\/(teach\/materials|library|item|audios)/, 'cfab'],
  ['/groups', 'users', t('nav.groups'), 0, /^\/group/],
  ['/tests', 'test', T('Testlar', 'Тесты', 'Tests'), 1, /^\/(tests|test|practice)/], ['/library', 'book', t('nav.library'), 1, /^\/(library|item|audios)/],
  ['/reports/all', 'chart', T('Statistika', 'Статистика', 'Statistics'), 1, /^\/reports/], ['/rating', 'trophy', t('nav.rating'), 1, /^\/rating/],
  ['/inbox', 'msg', T('Chat', 'Чат', 'Chat'), 1, /^\/inbox/], ['/forum', 'msg', T('Forum', 'Форум', 'Forum'), 1, /^\/forum/],
  ['/settings', 'user', t('nav.profile'), 0, /^\/(settings|admin|offline|guide|teacher-apply|inbox)/],
];
const NAV = () => isTeacher() ? TEACHER_NAV() : [
  ['/home', 'home', t('nav.home'), 0, /^\/home/], ['/courses', 'cap', T('Kurslar', 'Курсы', 'Courses'), 0, /^\/(courses|course|lesson|cert)/],
  ['/library', 'book', t('nav.library'), 1, /^\/(library|item|audios)/], ['/cards', 'layers', T('Kartalar', 'Карточки', 'Cards'), 0, /^\/cards/],
  ['/tests', 'test', T('Testlar', 'Тесты', 'Tests'), 0, /^\/(tests|test|practice)/], ['/lab', 'flask', T('Laboratoriya', 'Лаборатория', 'Lab'), 1, /^\/lab/],
  ['/groups', 'users', t('nav.groups'), 1, /^\/group/], ['/forum', 'msg', T('Forum', 'Форум', 'Forum'), 1, /^\/forum/],
  ...(state.isAdmin || state.settings?.app?.leaderboard !== false ? [['/rating', 'trophy', t('nav.rating'), 1, /^\/(rating|reports)/]] : []),
  ['/ai', 'bot', T('AI yordamchi', 'ИИ-помощник', 'AI assistant'), 1, /^\/ai/], ['/achievements', 'award', T('Yutuqlar', 'Достижения', 'Achievements'), 1, /^\/achievements/],
  ...(staffNow() ? [['/teach', 'edit', T('Kabinet', 'Кабинет', 'Studio'), 1, /^\/teach(?!\/materials)/], ['/teach/materials', 'folder', T('Materiallar', 'Материалы', 'Materials'), 1, /^\/teach\/materials/]] : []),
  ['/settings', 'user', t('nav.profile'), 0, /^\/(settings|admin|offline|guide|teacher-apply)/],
];
let unread = 0;
function paintShell(path = currentPath()) {
  const app = document.body.dataset.shell === 'app' && state.user;
  $('#top').hidden = !app; $('#tabs').hidden = !app;
  if (!app) return;
  const av = state.profile?.avatar_url, ini = initials(state.profile?.full_name);
  const dark = document.documentElement.dataset.theme === 'dark';
  $('#top').innerHTML = `<button class="icon-btn navtg" id="ntg" title="menu" aria-label="menu">${ic('panel')}</button><a class="brand" href="#/home">🧬 <b>${esc(CONFIG.APP_NAME)}</b></a>
    <button class="gsearch" id="gs" type="button">${ic('search', 18)}<span>${esc(t('gs.ph'))}</span><kbd>/</kbd></button><span class="grow"></span>${xpChip()}
    ${canInstall() ? `<button class="icon-btn" id="tinst" title="${esc(t('land.install'))}">${ic('download')}</button>` : ''}
    <button class="icon-btn" id="tth" title="${esc(t('set.theme'))}" aria-label="theme">${ic(dark ? 'sun' : 'moon')}</button>
    <select class="langsel" id="tlang" aria-label="language">${['uz', 'ru', 'en'].map(l => `<option value="${l}" ${l === state.lang ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('')}</select>
    <a class="icon-btn bell" href="#/inbox" title="${esc(t('nav.inbox'))}" aria-label="${esc(t('nav.inbox'))}">${ic('bell')}${unread ? `<i class="badge">${unread > 9 ? '9+' : unread}</i>` : ''}</a>
    <div class="pmenu"><button class="avatar" id="pav" aria-label="${esc(t('nav.profile'))}" aria-haspopup="menu">${av ? `<img src="${esc(av)}" alt="">` : esc(ini)}</button>
      <div class="pdrop" id="pdrop" hidden role="menu"><div class="pdh"><b>${esc(state.profile?.full_name || '')}</b><small class="muted">${esc(state.user?.email || '')}</small></div>
        <div class="pmore">${NAV().filter(n => n[3]).map(([p, i, l]) => `<a href="#${p}" role="menuitem">${ic(i, 16)} ${esc(l)}</a>`).join('')}</div>
        <a href="#/settings" role="menuitem">${ic('user', 16)} ${esc(t('nav.profile'))}</a>${state.isAdmin ? `<a href="#/admin" role="menuitem">${ic('shield', 16)} ${esc(t('nav.admin'))}</a>` : ''}
        <a href="#/guide" role="menuitem">${ic('help', 16)} ${esc(t('settings.guide'))}</a><button id="plo" role="menuitem">${ic('logout', 16)} ${esc(t('settings.logout'))}</button></div></div>`;
  $('#tlang').onchange = e => setLang(e.target.value);
  $('#tinst')?.addEventListener('click', installApp);
  $('#gs').onclick = () => openSearch();
  $('#tth').onclick = () => { const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('bio.theme', cur); applyTheme(); paintShell(); };
  $('#ntg').onclick = () => { const on = !document.body.classList.contains('nav-collapsed'); document.body.classList.toggle('nav-collapsed', on); localStorage.setItem('bio.navc', on ? '1' : ''); };
  const pd = $('#pdrop'); $('#pav').onclick = e => { e.stopPropagation(); pd.hidden = !pd.hidden; };
  pd.onclick = e => { if (e.target.closest('a')) pd.hidden = true; };
  $('#plo').onclick = () => { pd.hidden = true; doLogout(true); };
  $('#tabs').innerHTML = NAV().map(([p, i, l, dk, re, xc]) => `<a href="#${p}" class="${dk ? 'dk' : ''} ${xc || ''} ${re.test(path) ? 'on' : ''}" ${re.test(path) ? 'aria-current="page"' : ''}>${ic(i, xc === 'cfab' ? 28 : 22)}<span>${esc(l)}</span></a>`).join('');
}
setShellHook((path, opts) => { document.body.dataset.shell = opts.auth ? 'app' : 'public'; paintShell(path); });
document.addEventListener('pwa-can-install', () => paintShell());
document.addEventListener('bio-stats', () => paintShell());

async function refreshUnread() {
  if (!state.user) return;
  const { data } = await sb.from('direct_messages').select('thread_user,sender_id').is('read_at', null).limit(300);
  unread = (data || []).filter(m => state.isAdmin ? m.sender_id === m.thread_user : m.sender_id !== state.user.id).length;
  paintShell();
}
export { refreshUnread };

// ---- kirish / chiqish
let appTimer = null, rt = null;
async function onSignedIn(user) {
  state.user = user;
  const [{ data: p }] = await Promise.all([sb.from('profiles').select('*').eq('id', user.id).maybeSingle(), loadSettings()]);
  const pk = 'bio.prof.' + user.id;
  if (p) { if (p.blocked) { await sb.auth.signOut().catch(() => {}); toast(t('err.banned'), 'err'); return; } try { localStorage.setItem(pk, JSON.stringify(p)); } catch { /* */ } }
  state.profile = p || (() => { try { return JSON.parse(localStorage.getItem(pk)); } catch { return null; } })() || { id: user.id, full_name: user.email, role: 'user' };
  state.isAdmin = state.profile.role === 'admin';
  if (state.profile.lang && !localStorage.getItem('bio.lang')) { state.lang = state.profile.lang; document.documentElement.lang = state.lang; }
  if (lockEnabled() && !isReloadUnlocked()) { $('#boot')?.remove(); await showLock(); }
  appTimer?.stop(); appTimer = trackTime('app', null);
  rt?.unsubscribe?.();
  rt = sb.channel('dm-badge').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, p => {
    refreshUnread();
    // qurilma bildirishnomasi (ilova ochiq yoki fonda bo'lsa)
    const m = p.new, pr = state.profile?.prefs || {};
    if (m.sender_id !== state.user.id && pr.notif_chat !== false && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(CONFIG.APP_NAME, { body: m.kind === 'text' ? m.body.slice(0, 100) : '🎤', icon: 'icons/icon-192.png', tag: 'dm' }); } catch { /* */ }
    }
  }).subscribe();
  document.body.dataset.shell = 'app';
  if (navigator.onLine) refreshUnread();
  if (!navigator.onLine && offList().length && !currentPath().startsWith('/offline')) go('/offline', true);
  else if (['/', '/login', '/register', '/verify', '/forgot'].includes(currentPath())) go('/home', true); else render();
  if (!window._miniInit) { window._miniInit = 1; initMiniBar(); }
  watchBlocked(); refreshStats();
  offerQuickLogin();
  setTimeout(() => { try { maybeDevNote(); } catch { /* */ } }, 2500);
}

// bloklangan yoki o'chirilgan foydalanuvchini ochiq ilovadan ham chiqarib yuborish (har 2 daqiqada tekshiradi)
let blkIv;
function watchBlocked() {
  clearInterval(blkIv);
  blkIv = setInterval(async () => {
    if (!state.user || !navigator.onLine || document.hidden) return;
    const { data, error } = await sb.from('profiles').select('blocked').eq('id', state.user.id).maybeSingle();
    if (!error && (!data || data.blocked)) { await sb.auth.signOut().catch(() => {}); toast(t('err.banned'), 'err'); }
  }, 120000);
}

sb.auth.onAuthStateChange((evt, session) => {
  setTimeout(async () => {
    if (evt === 'SIGNED_OUT') { state.user = null; state.profile = null; state.isAdmin = false; appTimer?.stop(); snapClear(); document.body.dataset.shell = 'public'; go('/', true); render(); return; }
    if (session?.user && state.user?.id !== session.user.id && (evt === 'SIGNED_IN' || evt === 'INITIAL_SESSION')) await onSignedIn(session.user);
  }, 0);
});

// ---- "orqaga" mantig'i: ilovadan chiqib ketmaydi, har bosishda bitta qadam orqaga
function setupBackGuard() {
  history.replaceState({ root: true }, '');
  history.pushState({ guard: true }, '');
  let warned = 0;
  addEventListener('popstate', e => {
    if (e.state?.root) {                       // eng birinchi sahifadan ham orqaga bosildi
      if (Date.now() - warned < 2200) { history.back(); return; }   // ikkinchi marta — chiqishga ruxsat
      warned = Date.now(); toast(t('back.again'));
      history.pushState({ guard: true }, '');
    }
  });
  // iPhone uslubida chetdan sudrab qaytish (o'rnatilgan ilovada)
  let sx = 0, sy = 0, tracking = false;
  addEventListener('touchstart', e => { const x = e.touches[0]; tracking = x.clientX < 22; sx = x.clientX; sy = x.clientY; }, { passive: true });
  addEventListener('touchend', e => {
    if (!tracking) return; tracking = false; const x = e.changedTouches[0];
    if (x.clientX - sx > 90 && Math.abs(x.clientY - sy) < 60 && !document.body.classList.contains('locked')) history.back();
  }, { passive: true });
}

document.addEventListener('bio-unread', () => refreshUnread());
addEventListener('hashchange', render);
const offBar = () => { let b = $('#offbar'); if (!b) { b = document.createElement('a'); b.id = 'offbar'; b.href = '#/offline'; $('#view').before(b); } b.hidden = navigator.onLine || !state.user || !offList().length; b.textContent = t('off.mode') + ' ›'; };
addEventListener('online', () => { toast(t('net.on'), 'ok'); offBar(); });
addEventListener('offline', () => { toast(t('net.off'), 'err'); offBar(); });
addEventListener('hashchange', offBar);

(async function boot() {
  setupBackGuard(); initAutoLock();
  const { data } = await sb.auth.getSession().catch(() => ({ data: {} }));
  let user = data?.session?.user;
  if (!user && !navigator.onLine) {   // internet yo'q va token yangilanmadi: saqlangan sessiyadan oflayn rejimda kiramiz (faqat saqlangan materiallar)
    try { const k = Object.keys(localStorage).find(x => /^sb-.*-auth-token$/.test(x)); user = JSON.parse(localStorage.getItem(k) || 'null')?.user; } catch { /* */ }
  }
  if (user) await onSignedIn(user);
  else { document.body.dataset.shell = 'public'; render(); }
  $('#boot')?.remove();
})();

// iPhone: zoom faqat hujjat o'quvchisida mumkin
['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => { if (!document.body.classList.contains('fs-read')) e.preventDefault(); }, { passive: false }));

applyBg();
