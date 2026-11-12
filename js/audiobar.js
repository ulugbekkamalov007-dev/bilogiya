// Audio: butun ilova bo'ylab davom etadigan yagona pleyer (Mutolaa uslubida) + yuqoridagi mini-panel + ro'yxat sahifasi
import { sb, state, t, tr, addDict, route, go, esc, ic, $, $$, toast, signedUrl, fmtDur, spinner, trackTime, onLeave } from './core.js';
import { CONFIG } from './config.js';

addDict({
  uz: { 'ap.list': 'Audiolar', 'ap.now': 'Hozir eshitilmoqda', 'ap.next': 'Keyingi', 'ap.err': 'Bu formatni ilovada ijro etib bo\'lmadi', 'ap.dl': 'Yuklab olish', 'ap.unsup': 'Bu format brauzerda ijro etilmaydi. Faylni yuklab olib, telefondagi o\'z pleyeringizda oching.', 'ap.offline': 'Internet yo\'q — ijro to\'xtatildi, vaqt hisoblanmaydi', 'ap.no_fwd': 'Oldinga o\'tkazish mumkin emas', 'ap.empty': 'Bu bo\'limda audio yo\'q' },
  ru: { 'ap.list': 'Аудио', 'ap.now': 'Сейчас играет', 'ap.next': 'Далее', 'ap.err': 'Этот формат не удалось воспроизвести', 'ap.dl': 'Скачать', 'ap.unsup': 'Этот формат не воспроизводится в браузере. Скачайте файл и откройте в плеере телефона.', 'ap.offline': 'Нет интернета — пауза, время не считается', 'ap.no_fwd': 'Перематывать вперёд нельзя', 'ap.empty': 'В этом разделе нет аудио' },
  en: { 'ap.list': 'Audio', 'ap.now': 'Now playing', 'ap.next': 'Next', 'ap.err': 'This format could not be played', 'ap.dl': 'Download', 'ap.unsup': 'This format cannot be played in the browser. Download the file and open it in your phone player.', 'ap.offline': 'No internet — paused, time is not counted', 'ap.no_fwd': 'Skipping ahead is not allowed', 'ap.empty': 'No audio in this section' },
});

const A = new Audio(); A.preload = 'auto'; A.setAttribute('playsinline', '');
export const AP = { a: A, item: null, list: [], maxPos: 0, completed: false, tm: null, lastSent: 0, url: '', failed: false, subs: new Set(), onDone: null };
const emit = ev => AP.subs.forEach(f => { try { f(ev); } catch { /* */ } });
const S = () => ({ allow_forward_seek: false, forward_tolerance_s: 2, rewind_step_s: 10, allowed_speeds: [1], resume: true, complete_pct: 90, ...(state.settings.video || {}) });

async function save(force) {
  const it = AP.item; if (!it || !state.user) return; const now = Date.now(); if (!force && now - AP.lastSent < 10000) return; AP.lastSent = now;
  const d = A.duration || 0; if (!d) return;
  const done = AP.completed || (AP.maxPos / d * 100 >= S().complete_pct);
  if (done && !AP.completed) { AP.completed = true; try { AP.onDone?.(); } catch { /* */ } emit('done'); }
  if (!navigator.onLine) return;
  await sb.from('video_progress').upsert({ user_id: state.user.id, item_id: it.id, max_pos: AP.maxPos, last_pos: A.currentTime, duration: d, completed: done, updated_at: new Date().toISOString() });
}

export async function apPlay(item, list = [], { autoplay = true } = {}) {
  if (AP.item?.id === item.id) { if (list.length) AP.list = list; if (autoplay && A.paused) A.play().catch(() => {}); return; }
  if (AP.item) { await save(true).catch(() => {}); AP.tm?.stop(); }
  AP.item = item; AP.list = list.length ? list : [item]; AP.maxPos = 0; AP.completed = false; AP.failed = false; AP.onDone = null; AP.lastSent = 0; emit('load');
  AP.tm = trackTime('audio', item.id, () => !A.paused && !A.ended && navigator.onLine);
  const [{ data: prog }, url] = await Promise.all([
    sb.from('video_progress').select('*').eq('user_id', state.user.id).eq('item_id', item.id).maybeSingle(),
    item.url ? item.url : signedUrl('content', item.storage_path, 7200).catch(() => null),
  ]);
  if (AP.item?.id !== item.id) return;
  AP.maxPos = prog?.max_pos || 0; AP.completed = !!prog?.completed; AP.url = url || '';
  if (!url) { AP.failed = true; emit('error'); return; }
  A.src = url; A.playbackRate = 1;
  A.addEventListener('loadedmetadata', () => { if (S().resume && prog?.last_pos > 5 && prog.last_pos < (A.duration - 5)) A.currentTime = Math.min(prog.last_pos, AP.maxPos || prog.last_pos); emit('meta'); }, { once: true });
  media(); if (autoplay) A.play().catch(() => {});
}
export const apToggle = () => { if (A.paused) A.play().catch(() => {}); else A.pause(); };
export function apSeek(x) {
  const d = A.duration || 0, s = S(); x = Math.max(0, Math.min(x, d || x));
  if (!s.allow_forward_seek && x > AP.maxPos + s.forward_tolerance_s) { x = AP.maxPos; toast(t('ap.no_fwd')); }
  A.currentTime = x;
}
export function apStop() { save(true).catch(() => {}); A.pause(); AP.tm?.stop(); A.removeAttribute('src'); A.load(); AP.item = null; emit('load'); }
const nextOf = () => { const i = AP.list.findIndex(x => x.id === AP.item?.id); return i >= 0 ? AP.list[i + 1] : null; };

['play', 'pause', 'timeupdate', 'waiting', 'playing', 'durationchange'].forEach(e => A.addEventListener(e, () => {
  if (e === 'timeupdate') { const c = A.currentTime, s = S(); if (!s.allow_forward_seek && c > AP.maxPos + Math.max(s.forward_tolerance_s, 3) && !A.paused) { A.currentTime = AP.maxPos; return; } if (c > AP.maxPos && c - (AP._lt || 0) < 3) AP.maxPos = c; AP._lt = c; if (!A.paused) save(); }
  if (e === 'pause') save(true);
  emit(e);
}));
A.addEventListener('ended', async () => { AP.maxPos = A.duration || AP.maxPos; await save(true); emit('ended'); const n = nextOf(); if (n) apPlay(n, AP.list); });
A.addEventListener('error', () => { AP.failed = true; emit('error'); });
addEventListener('offline', () => { if (!A.paused) { A.pause(); toast(t('ap.offline')); } });

function media() {
  if (!('mediaSession' in navigator) || !AP.item) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: tr(AP.item.title) || 'BioAcademy', artist: CONFIG.APP_NAME, artwork: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    const h = (n, f) => { try { navigator.mediaSession.setActionHandler(n, f); } catch { /* */ } };
    h('play', () => A.play()); h('pause', () => A.pause()); h('seekbackward', () => apSeek(A.currentTime - S().rewind_step_s));
    h('seekforward', () => apSeek(A.currentTime + S().rewind_step_s)); h('nexttrack', () => { const n = nextOf(); if (n) apPlay(n, AP.list); });
  } catch { /* */ }
}

// ---------- to'liq audio sahifasi (doira ichida vaqt bo'yicha yuruvchi halqa)
const R = 92, C = 2 * Math.PI * R;
export function audioPage(host, item, list, { onDone } = {}) {
  AP.onDone = onDone || AP.onDone;
  host.innerHTML = `<div class="aplay"><div class="aring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="${R}" class="ar-bg"/><circle cx="100" cy="100" r="${R}" class="ar-fg" id="arf" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 100 100)"/><circle cx="100" cy="100" r="${R}" class="ar-mx" id="arm" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 100 100)"/></svg>
      <button class="ar-c" id="apb" aria-label="play"><span id="api">${ic('play', 52)}</span><small id="apt">0:00</small></button></div>
    <div class="aseek"><span id="ap1">0:00</span><input type="range" id="aps" min="0" max="1000" value="0"><span id="ap2">0:00</span></div>
    <div class="actl"><button class="vb" id="apr" aria-label="back">${ic('rewind', 26)}<small>${S().rewind_step_s}</small></button><button class="btn lg round" id="app">${ic('play', 30)}</button><button class="vb" id="apf" aria-label="forward">${ic('forward', 26)}<small>${S().rewind_step_s}</small></button></div>
    <div class="row center"><button class="btn sm soft" id="aprate">1×</button></div><div id="apmsg" class="center muted mt"></div></div>`;
  const q = s => $(s, host), speeds = S().allowed_speeds.length ? S().allowed_speeds : [1];
  const paint = () => {
    if (AP.item?.id !== item.id) return; const d = A.duration || 0, c = A.currentTime || 0, p = d ? c / d : 0;
    q('#arf').style.strokeDashoffset = C * (1 - p); q('#arm').style.strokeDashoffset = C * (1 - (d ? Math.max(AP.maxPos, c) / d : 0));
    q('#apt').textContent = fmtDur(c); q('#ap1').textContent = fmtDur(c); q('#ap2').textContent = fmtDur(d);
    if (document.activeElement !== q('#aps')) q('#aps').value = Math.round(p * 1000);
    const ic2 = A.paused ? 'play' : 'pause'; q('#api').innerHTML = ic(ic2, 52); q('#app').innerHTML = ic(ic2, 30);
    $('.aring', host).classList.toggle('on', !A.paused);
  };
  const onEv = ev => {
    if (ev === 'error') { const m = q('#apmsg'); if (m) m.innerHTML = `<p>${esc(t('ap.unsup'))}</p>${AP.url ? `<a class="btn" href="${esc(AP.url + (AP.url.includes('?') ? '&' : '?') + 'download=')}" target="_blank" rel="noopener">⬇ ${esc(t('ap.dl'))}</a>` : ''}`; return; }
    if (ev === 'load') q('#apmsg').textContent = ''; paint();
  };
  AP.subs.add(onEv);
  q('#apb').onclick = q('#app').onclick = () => { if (AP.item?.id !== item.id) apPlay(item, list); else apToggle(); };
  q('#apr').onclick = () => apSeek(A.currentTime - S().rewind_step_s); q('#apf').onclick = () => apSeek(A.currentTime + S().rewind_step_s);
  q('#aps').oninput = e => { const d = A.duration || 0; if (d) { A.currentTime = Math.min(+e.target.value / 1000 * d, S().allow_forward_seek ? d : AP.maxPos + S().forward_tolerance_s); } };
  const rt = q('#aprate'); if (speeds.length < 2) rt.hidden = true;
  rt.onclick = () => { const i = speeds.indexOf(A.playbackRate); A.playbackRate = speeds[(i + 1) % speeds.length] || 1; rt.textContent = A.playbackRate + '×'; };
  const iv = setInterval(paint, 500);
  apPlay(item, list).then(paint);
  return { completed: () => AP.completed, destroy() { AP.subs.delete(onEv); clearInterval(iv); } };
}

export function audioList(listEl, list, cur) {
  listEl.innerHTML = list.length ? `<div class="cards">${list.map(a => `<a class="card pad item-row ${a.id === cur ? 'cur' : ''}" href="#/item/${a.id}"><span class="item-ic audio">${ic(a.id === cur && !A.paused ? 'pause' : 'audio')}</span><b class="grow">${esc(tr(a.title))}</b>${a.id === cur ? `<small class="muted">${esc(t('ap.now'))}</small>` : ic('chev')}</a>`).join('')}</div>` : `<p class="muted center pad">${esc(t('ap.empty'))}</p>`;
}
export async function folderAudios(folderId) {
  let qy = sb.from('items').select('id,title,kind,storage_path,url,source,folder_id,meta,visible,created_at').eq('kind', 'audio').order('created_at');
  qy = folderId ? qy.eq('folder_id', folderId) : qy.is('folder_id', null);
  const { data } = await qy; return (data || []).filter(x => x.visible || state.isAdmin);
}

route('/audios/:fid', async ({ el, params, alive }) => {
  const fid = params.fid === '_' ? null : params.fid, list = await folderAudios(fid); if (!alive()) return;
  el.innerHTML = `<div class="page"><div class="row"><a class="icon-btn" href="#/library/${fid || ''}" aria-label="back">${ic('back')}</a><h1 class="mb0">${esc(t('ap.list'))}</h1></div><div id="al" class="mt"></div></div>`;
  const draw = () => audioList($('#al', el), list, AP.item?.id); draw();
  const f = ev => { if (ev === 'play' || ev === 'pause' || ev === 'load') draw(); }; AP.subs.add(f); onLeave(() => AP.subs.delete(f));
}, { auth: true });

// ---------- yuqoridagi mini-panel (boshqa bo'limlarda audio davom etganda)
export function initMiniBar() {
  const bar = document.createElement('div'); bar.id = 'mini'; bar.hidden = true; document.getElementById('top').after(bar);
  const paint = () => {
    const it = AP.item, onPage = it && location.hash.startsWith('#/item/' + it.id);
    bar.hidden = !it || onPage || !state.user || document.body.dataset.shell !== 'app'; if (bar.hidden) return;
    const d = A.duration || 0, p = d ? A.currentTime / d * 100 : 0;
    bar.innerHTML = `<button class="mb-pp" aria-label="play">${ic(A.paused ? 'play' : 'pause', 20)}</button><div class="mb-t grow"><b>${esc(tr(it.title))}</b><i style="width:${p}%"></i></div><button class="mb-x" aria-label="close">${ic('close', 18)}</button>`;
    $('.mb-pp', bar).onclick = e => { e.stopPropagation(); apToggle(); };
    $('.mb-x', bar).onclick = e => { e.stopPropagation(); apStop(); };
    bar.onclick = () => go('/audios/' + (it.folder_id || '_'));
  };
  AP.subs.add(paint); addEventListener('hashchange', () => setTimeout(paint, 30)); setInterval(() => { if (AP.item && !bar.hidden && !A.paused) { const i = $('.mb-t i', bar); if (i && A.duration) i.style.width = (A.currentTime / A.duration * 100) + '%'; } }, 1000);
}
