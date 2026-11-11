// Ilova kirish nuqtasi: sessiya, qulf, navigatsiya, "orqaga" tugmasi mantig'i
import { sb, state, t, $, $$, esc, ic, render, go, setShellHook, loadSettings, trackTime, toast, setLang, currentPath } from './core.js';
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
import { lockEnabled, showLock, initAutoLock, offerQuickLogin } from './lock.js';
import { registerSW, canInstall, installApp } from './pwa.js';
import { CONFIG } from './config.js';

registerSW();

// ---- mavzu / shrift
export function applyTheme() {
  const th = localStorage.getItem('bio.theme') || 'auto';
  document.documentElement.dataset.theme = th === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : th;
  document.documentElement.style.fontSize = ({ s: '15px', m: '16px', l: '18px' })[localStorage.getItem('bio.fs') || 'm'];
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#0b1a12' : '#16a34a');
}
applyTheme(); matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
document.documentElement.lang = state.lang;

// ---- qobiq (header + pastki navigatsiya)
const NAV = () => [
  ['/home', 'home', t('nav.home')], ['/library', 'book', t('nav.library')], ['/groups', 'users', t('nav.groups')],
  ['/reports', 'chart', t('nav.reports')], state.isAdmin ? ['/admin', 'shield', t('nav.admin')] : ['/settings', 'settings', t('nav.settings')],
];
let unread = 0;
function paintShell(path = currentPath()) {
  const app = document.body.dataset.shell === 'app' && state.user;
  $('#top').hidden = !app; $('#tabs').hidden = !app;
  if (!app) return;
  const av = state.profile?.avatar_url, ini = (state.profile?.full_name || '?').trim()[0]?.toUpperCase();
  $('#top').innerHTML = `<a class="brand" href="#/home">🧬 <b>${esc(CONFIG.APP_NAME)}</b></a><span class="grow"></span>
    ${canInstall() ? `<button class="icon-btn" id="tinst" title="${esc(t('land.install'))}">${ic('download')}</button>` : ''}
    <select class="langsel" id="tlang" aria-label="language">${['uz', 'ru', 'en'].map(l => `<option value="${l}" ${l === state.lang ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('')}</select>
    <a class="icon-btn bell" href="#/inbox" title="${esc(t('nav.inbox'))}">${ic('bell')}${unread ? `<i class="badge">${unread > 9 ? '9+' : unread}</i>` : ''}</a>
    <a class="avatar" href="#/settings">${av ? `<img src="${esc(av)}" alt="">` : esc(ini)}</a>`;
  $('#tlang').onchange = e => setLang(e.target.value);
  $('#tinst')?.addEventListener('click', installApp);
  $('#tabs').innerHTML = NAV().map(([p, i, l]) => `<a href="#${p}" class="${path.startsWith(p) ? 'on' : ''}">${ic(i, 22)}<span>${esc(l)}</span></a>`).join('');
}
setShellHook((path, opts) => { document.body.dataset.shell = opts.auth ? 'app' : 'public'; paintShell(path); });
document.addEventListener('pwa-can-install', () => paintShell());

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
  const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
  state.profile = p || { id: user.id, full_name: user.email, role: 'user' };
  state.isAdmin = state.profile.role === 'admin';
  if (state.profile.lang && !localStorage.getItem('bio.lang')) { state.lang = state.profile.lang; document.documentElement.lang = state.lang; }
  await loadSettings();
  if (lockEnabled()) { $('#boot')?.remove(); await showLock(); }
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
  refreshUnread();
  if (['/', '/login', '/register', '/verify', '/forgot'].includes(currentPath())) go('/home', true); else render();
  offerQuickLogin();
}

sb.auth.onAuthStateChange((evt, session) => {
  setTimeout(async () => {
    if (evt === 'SIGNED_OUT') { state.user = null; state.profile = null; state.isAdmin = false; appTimer?.stop(); document.body.dataset.shell = 'public'; go('/', true); render(); return; }
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
addEventListener('online', () => toast(t('net.on'), 'ok'));
addEventListener('offline', () => toast(t('net.off'), 'err'));

(async function boot() {
  setupBackGuard(); initAutoLock();
  const { data } = await sb.auth.getSession();
  if (data.session?.user) await onSignedIn(data.session.user);
  else { document.body.dataset.shell = 'public'; render(); }
  $('#boot')?.remove();
})();
