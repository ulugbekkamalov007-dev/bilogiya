// Maxsus video pleyer: YouTube (ilovadan chiqmasdan), to'g'ridan-to'g'ri URL/MP4, HLS.
// Qoidalar admin sozlamalaridan olinadi (app_settings.video): oldinga o'tkazish taqiqi, tezlik, sifat va h.k.
import { CONFIG } from './config.js';
import { sb, state, t, tr, addDict, esc, ic, $, $$, toast, fmtDur, trackTime, signedUrl } from './core.js';

addDict({
  uz: { 'pl.speed': 'Tezlik', 'pl.quality': 'Sifat', 'pl.auto': 'Avto', 'pl.no_fwd': 'Videoni oldinga o\'tkazib bo\'lmaydi — har bir daqiqani ko\'ring',
    'pl.back': 'Orqaga {s} s', 'pl.fwd': 'Oldinga {s} s', 'pl.done': 'Video ko\'rib bo\'ldi ✔', 'pl.resume': 'Oxirgi joydan davom ettirildi', 'pl.err': 'Videoni yuklab bo\'lmadi',
    'pl.watched': 'Ko\'rilgan', 'pl.dl': 'Yuklab olish', 'pl.unsup': 'Bu format brauzerda ijro etilmaydi. Faylni yuklab olib, telefondagi o\'z pleyeringizda oching.', 'pl.resume_at': '{t} dan davom etdi', 'pl.offline': 'Internet yo\'q — ijro to\'xtatildi, vaqt hisoblanmaydi' },
  ru: { 'pl.speed': 'Скорость', 'pl.quality': 'Качество', 'pl.auto': 'Авто', 'pl.no_fwd': 'Видео нельзя перематывать вперёд — смотрите каждую минуту',
    'pl.back': 'Назад {s} с', 'pl.fwd': 'Вперёд {s} с', 'pl.done': 'Видео просмотрено ✔', 'pl.resume': 'Продолжено с последнего места', 'pl.err': 'Не удалось загрузить видео',
    'pl.watched': 'Просмотрено', 'pl.dl': 'Скачать', 'pl.unsup': 'Этот формат не воспроизводится в браузере. Скачайте файл и откройте в плеере телефона.', 'pl.resume_at': 'Продолжено с {t}', 'pl.offline': 'Нет интернета — пауза, время не считается' },
  en: { 'pl.speed': 'Speed', 'pl.quality': 'Quality', 'pl.auto': 'Auto', 'pl.no_fwd': 'You can\'t skip ahead — watch every minute',
    'pl.back': 'Back {s}s', 'pl.fwd': 'Forward {s}s', 'pl.done': 'Video completed ✔', 'pl.resume': 'Resumed where you left off', 'pl.err': 'Could not load the video',
    'pl.watched': 'Watched', 'pl.dl': 'Download', 'pl.unsup': 'This format cannot be played in the browser. Download the file and open it in your phone player.', 'pl.resume_at': 'Resumed at {t}', 'pl.offline': 'No internet — paused, time is not counted' },
});

const loadScript = src => new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
let ytP = null;
const loadYT = () => ytP || (ytP = new Promise((res, rej) => {
  if (window.YT?.Player) return res(); window.onYouTubeIframeAPIReady = res; loadScript('https://www.youtube.com/iframe_api').catch(rej);
  setTimeout(() => { if (!window.YT?.Player) { ytP = null; rej(new Error('YouTube unavailable')); } }, 12000);
}));
const YTQ = { hd2160: '2160p', hd1440: '1440p', hd1080: '1080p', hd720: '720p', large: '480p', medium: '360p', small: '240p', tiny: '144p', auto: 'auto' };

// ---------- adapterlar
async function html5Adapter(stage, item, startQuality) {
  const isAud = item.kind === 'audio';
  const v = document.createElement(isAud ? 'audio' : 'video'); v.preload = 'auto'; if (!isAud) { v.playsInline = true; v.disablePictureInPicture = true; }
  v.setAttribute('controlslist', 'nodownload noremoteplayback'); v.oncontextmenu = e => e.preventDefault();
  stage.appendChild(v);
  const variants = (item.meta?.sources || []).filter(s => s.url);
  let src = item.url, hls = null, quals = [];
  if (!src && item.storage_path) src = await (item._urlP || signedUrl('content', item.storage_path, 7200));
  if (variants.length) { const pick = variants.find(s => s.label === startQuality) || variants.find(s => /720/.test(s.label)) || variants[0]; src = pick.url; quals = variants.map(s => s.label); }
  const load = async url => {
    hls?.destroy(); hls = null;
    if (/\.m3u8(\?|$)/i.test(url) && !v.canPlayType('application/vnd.apple.mpegurl')) {
      await loadScript('https://cdn.jsdelivr.net/npm/hls.js@1');
      if (window.Hls?.isSupported()) { hls = new Hls(); hls.loadSource(url); hls.attachMedia(v); hls.on(Hls.Events.MANIFEST_PARSED, () => { quals = ['auto', ...hls.levels.map(l => l.height + 'p')]; ad.onQuals?.(); }); return; }
    }
    v.src = url;
  };
  await load(src);
  const ad = {
    kind: 'html5', video: v, srcUrl: () => v.currentSrc || v.src || '',
    play: () => v.play().catch(() => {}), pause: () => v.pause(), seek: x => { v.currentTime = x; },
    time: () => v.currentTime, duration: () => v.duration || 0, playing: () => !v.paused && !v.ended,
    setRate: r => { v.playbackRate = r; }, qualities: () => quals, currentQuality: () => ad._q || quals[0],
    async setQuality(q) {
      ad._q = q;
      if (hls) { hls.currentLevel = q === 'auto' ? -1 : hls.levels.findIndex(l => l.height + 'p' === q); return; }
      const s = variants.find(x => x.label === q); if (!s) return;
      const was = !v.paused, at = v.currentTime; await load(s.url);
      v.addEventListener('loadedmetadata', () => { v.currentTime = at; if (was) v.play().catch(() => {}); }, { once: true });
    },
    onEvents(cb) {
      ['play', 'pause', 'ended', 'loadedmetadata', 'waiting', 'playing', 'timeupdate', 'error'].forEach(e => v.addEventListener(e, () => cb(e)));
      v.addEventListener('error', () => cb('error'));
    },
    destroy() { hls?.destroy(); v.pause(); v.removeAttribute('src'); v.load(); v.remove(); },
  };
  return ad;
}

async function ytAdapter(stage, item) {
  await loadYT();
  const div = document.createElement('div'); stage.appendChild(div);
  let cb = () => {}, player, ready, poll;
  const ad = {
    kind: 'yt',
    play: () => player.playVideo(), pause: () => player.pauseVideo(), seek: x => player.seekTo(x, true),
    time: () => player?.getCurrentTime?.() || 0, duration: () => player?.getDuration?.() || 0, playing: () => player?.getPlayerState?.() === 1,
    setRate: r => player.setPlaybackRate(r),
    qualities: () => (player?.getAvailableQualityLevels?.() || []).map(q => YTQ[q] || q).filter((q, i, a) => a.indexOf(q) === i && q !== 'auto'),
    currentQuality: () => YTQ[player?.getPlaybackQuality?.()] || 'auto',
    setQuality: q => { const k = Object.keys(YTQ).find(x => YTQ[x] === q) || 'auto'; player.setPlaybackQuality(k); },
    onEvents(f) { cb = f; },
    destroy() { clearInterval(poll); try { player.destroy(); } catch { /* */ } },
  };
  await new Promise(res => {
    player = new YT.Player(div, {
      videoId: item.youtube_id, host: 'https://www.youtube-nocookie.com',
      playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1, fs: 0, iv_load_policy: 3, origin: location.origin },
      events: {
        onReady: () => { ready = true; res(); cb('loadedmetadata'); },
        onStateChange: e => cb(({ 1: 'play', 2: 'pause', 0: 'ended', 3: 'waiting' })[e.data] || 'state'),
        onError: () => cb('error'),
      },
    });
    poll = setInterval(() => { if (ready) cb('timeupdate'); }, 500);
  });
  return ad;
}

// ---------- asosiy pleyer
export async function mountPlayer(host, item, opts = {}) {
  const offline = !!opts.offline;   // telefonda saqlangan nusxa: tarmoq/progress kerak emas
  const S = { allow_forward_seek: false, forward_tolerance_s: 2, rewind_step_s: 10, allowed_speeds: [1], resume: true, complete_pct: 90, watermark: true, pause_when_hidden: true, ...(state.settings.video || {}) };
  if (offline) { S.allow_forward_seek = true; S.resume = false; }   // oxirigacha ko'rilgan materialni qayta ko'rish — erkin
  const uid = state.user.id;
  // tezroq ochilish: imzolangan havola va YouTube kutubxonasi progress so'rovi bilan PARALLEL tayyorlanadi
  if (item.storage_path && !item.url) item._urlP = signedUrl('content', item.storage_path, 7200).catch(() => null);
  if (item.source === 'youtube' || item.youtube_id) loadYT().catch(() => {});
  const { data: prog } = offline ? { data: null } : await sb.from('video_progress').select('*').eq('user_id', uid).eq('item_id', item.id).maybeSingle();
  let maxPos = prog?.max_pos || 0, completed = !!prog?.completed, lastSent = 0, lastT = 0;

  const isAud = item.kind === 'audio';
  host.innerHTML = `<div class="vplayer ${isAud ? 'aud' : ''}" tabindex="0"><div class="vstage"></div>${isAud ? `<div class="vstage-aud"><div class="aud-ic">🎧</div><div class="eq"><i></i><i></i><i></i><i></i><i></i></div></div>` : '<div class="vshield"></div>'}
    ${S.watermark && !isAud ? `<div class="vmark">${esc(state.profile.full_name || state.user.email)}</div>` : ''}
    <div class="vspin" hidden><div class="spin"></div></div><div class="vtoast" hidden></div>
    <div class="vbig">${ic('play', 44)}</div>
    <div class="vctl">
      <div class="vbar" role="slider"><i class="vmax"></i><i class="vcur"></i><b class="vknob"></b></div>
      <div class="vrow">
        <button class="vb" data-a="play" aria-label="play">${ic('play')}</button>
        <button class="vb" data-a="back" title="${esc(t('pl.back', { s: S.rewind_step_s }))}">${ic('rewind')}<small>${S.rewind_step_s}</small></button>
        <span class="vtime"><span id="vt">0:00</span> / <span id="vd">0:00</span></span><span class="grow"></span>
        <button class="vb" data-a="menu" aria-label="settings">${ic('gear')}</button>
        ${isAud ? '' : `<button class="vb" data-a="full" aria-label="fullscreen">${ic('full')}</button>`}
      </div>
      <div class="vmenu" hidden></div>
    </div></div>`;
  const root = $('.vplayer', host), stage = $('.vstage', root);
  const qSaved = localStorage.getItem('bio.vq') || S.default_quality;
  let ad;
  try { ad = item.source === 'youtube' || item.youtube_id ? await ytAdapter(stage, item) : await html5Adapter(stage, item, qSaved); }
  catch { root.innerHTML = `<div class="center pad">⚠️ ${esc(t('pl.err'))}</div>`; return { destroy() {} }; }

  const q = s => $(s, root), vcur = q('.vcur'), vmax = q('.vmax'), knob = q('.vknob'), bar = q('.vbar');
  const msg = txt => { const m = q('.vtoast'); m.textContent = txt; m.hidden = false; clearTimeout(msg.t); msg.t = setTimeout(() => m.hidden = true, 2200); };
  // vaqt faqat video HAQIQATAN yurib turganda hisoblanadi: bufer kutish (waiting) va qotib qolish hisobga olinmaydi
  let buffering = false, stalled = false, chkT = -1;
  const timer = trackTime(isAud ? 'audio' : 'video', item.id, () => ad.playing() && !buffering && !stalled && navigator.onLine);
  const stallIv = setInterval(() => { const c = ad.time(); stalled = ad.playing() && Math.abs(c - chkT) < 0.15; chkT = c; if (ad.playing()) q('.vspin').hidden = !(stalled || buffering); }, 2000);
  const dur = () => ad.duration() || prog?.duration || 0;

  const paint = () => {
    const d = dur(), c = ad.time(); if (!d) return;
    vcur.style.width = (c / d * 100) + '%'; vmax.style.width = (Math.max(maxPos, c) / d * 100) + '%'; knob.style.left = (c / d * 100) + '%';
    q('#vt').textContent = fmtDur(c); q('#vd').textContent = fmtDur(d);
    q('[data-a=play]').innerHTML = ic(ad.playing() ? 'pause' : 'play'); root.classList.toggle('playing', ad.playing()); root.classList.toggle('paused', !ad.playing());
  };
  async function save(force) {
    const now = Date.now(); if (!force && now - lastSent < 10000) return; lastSent = now;
    const d = dur(); if (!d) return;
    const done = completed || (maxPos / d * 100 >= S.complete_pct);
    if (done && !completed) { completed = true; msg(t('pl.done')); try { opts.onDone?.(); } catch { /* */ } }
    if (offline) return;
    await sb.from('video_progress').upsert({ user_id: uid, item_id: item.id, max_pos: maxPos, last_pos: ad.time(), duration: d, completed: done, updated_at: new Date().toISOString() });
  }
  function seekTo(x) {
    const d = dur(); x = Math.max(0, Math.min(x, d || x));
    if (!S.allow_forward_seek && x > maxPos + S.forward_tolerance_s) { x = maxPos; msg(t('pl.no_fwd')); }
    ad.seek(x); paint();
  }
  ad.onEvents(ev => {
    if (ev === 'error') {
      q('.vspin').hidden = true; msg(t('pl.err'));
      const u = ad.srcUrl?.(); if (u && !offline && !q('.vdl')) { const a = document.createElement('a'); a.className = 'btn vdl'; a.href = u + (u.includes('?') ? '&' : '?') + 'download='; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '⬇ ' + t('pl.dl'); const n = document.createElement('div'); n.className = 'center pad vdl'; n.innerHTML = '<p class="muted">' + esc(t('pl.unsup')) + '</p>'; n.appendChild(a); root.after(n); }
      return;
    }
    if (ev === 'waiting') { buffering = true; q('.vspin').hidden = false; } if (ev === 'playing') { buffering = false; stalled = false; } if (ev === 'playing' || ev === 'play' || ev === 'pause') q('.vspin').hidden = true;
    if (ev === 'loadedmetadata' && S.resume && prog && prog.last_pos > 5 && prog.last_pos < (dur() - 5) && !ad._resumed) { ad._resumed = true; ad.seek(Math.min(prog.last_pos, maxPos || prog.last_pos)); msg(t('pl.resume_at', { t: fmtDur(prog.last_pos) })); }
    if (ev === 'timeupdate' || ev === 'play') {
      const c = ad.time();
      if (!S.allow_forward_seek && c > maxPos + Math.max(S.forward_tolerance_s, 3) && ad.playing()) { ad.seek(maxPos); msg(t('pl.no_fwd')); }
      else if (c > maxPos && c - lastT < 3) maxPos = c;
      lastT = c; paint(); if (ad.playing()) save();
    }
    if (ev === 'pause') { paint(); save(true); }
    if (ev === 'ended') { maxPos = dur(); paint(); save(true); }
  });

  // boshqaruv
  const toggle = () => ad.playing() ? ad.pause() : ad.play();
  (q('.vshield') || q('.vstage-aud')).onclick = q('.vbig').onclick = toggle;
  const menu = q('.vmenu');
  const drawMenu = () => {
    const quals = ad.qualities(), cq = ad.currentQuality();
    menu.innerHTML = `<div class="vm-h">${esc(t('pl.speed'))}</div><div class="vm-o">${S.allowed_speeds.map(s => `<button data-sp="${s}" class="${(ad._rate || 1) === s ? 'on' : ''}">${s}×</button>`).join('')}</div>
      ${quals.length ? `<div class="vm-h">${esc(t('pl.quality'))}</div><div class="vm-o">${quals.map(x => `<button data-q="${x}" class="${cq === x ? 'on' : ''}">${x === 'auto' ? esc(t('pl.auto')) : x}</button>`).join('')}</div>` : ''}`;
    $$('[data-sp]', menu).forEach(b => b.onclick = () => { ad._rate = +b.dataset.sp; ad.setRate(ad._rate); drawMenu(); });
    $$('[data-q]', menu).forEach(b => b.onclick = () => { localStorage.setItem('bio.vq', b.dataset.q); ad.setQuality(b.dataset.q); setTimeout(drawMenu, 400); });
  };
  ad.onQuals = drawMenu;
  root.querySelector('.vctl').onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'play') toggle();
    else if (a === 'back') seekTo(ad.time() - S.rewind_step_s);
    else if (a === 'menu') { drawMenu(); menu.hidden = !menu.hidden; }
    else if (a === 'full' && !isAud) {
      if (document.fullscreenElement) document.exitFullscreen(); else if (root.requestFullscreen) root.requestFullscreen().then(() => screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => root.classList.toggle('pseudo-full')); else root.classList.toggle('pseudo-full');
    }
  };
  // progress bar
  let drag = false;
  const at = e => { const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, ((e.touches?.[0] || e).clientX - r.left) / r.width)) * dur(); };
  bar.addEventListener('pointerdown', e => { drag = true; bar.setPointerCapture(e.pointerId); seekTo(at(e)); });
  bar.addEventListener('pointermove', e => { if (drag) seekTo(at(e)); });
  bar.addEventListener('pointerup', () => { drag = false; });
  // klaviatura
  root.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
    else if (e.key === 'ArrowLeft') seekTo(ad.time() - S.rewind_step_s);
    else if (e.key === 'ArrowRight') seekTo(ad.time() + S.rewind_step_s);
    else if (e.key === 'f') q('[data-a=full]').click();
  });
  // boshqaruv panelini yashirish
  let hideT; const wake = () => { root.classList.add('show-ctl'); clearTimeout(hideT); hideT = setTimeout(() => { if (ad.playing()) { root.classList.remove('show-ctl'); menu.hidden = true; } }, 3000); };
  ['mousemove', 'touchstart', 'click'].forEach(e => root.addEventListener(e, wake)); wake();
  // yashirin belgi harakati
  const mark = q('.vmark'); const markIv = mark ? setInterval(() => { mark.style.top = (8 + Math.random() * 70) + '%'; mark.style.left = (4 + Math.random() * 60) + '%'; }, 7000) : null;
  const vis = () => { if (document.hidden) { save(true).catch(() => {}); if (S.pause_when_hidden && !isAud && ad.playing()) ad.pause(); } };
  document.addEventListener('visibilitychange', vis);
  const off = () => { if (offline) return; if (ad.playing()) { ad.pause(); } msg(t('pl.offline')); };
  addEventListener('offline', off);
  const ui = setInterval(paint, 500);
  const onFs = () => { root.classList.toggle('is-full', !!document.fullscreenElement); if (!document.fullscreenElement) screen.orientation?.unlock?.(); }; document.addEventListener('fullscreenchange', onFs);
  // telefon yonlatilsa (landshaft) video butun ekranga yoyiladi; tik holatga qaytsa — oddiy ko'rinish
  const orient = () => { if (isAud) return; const land = innerWidth > innerHeight && innerHeight < 560; root.classList.toggle('land-full', land); document.body.classList.toggle('vland', land); };
  addEventListener('orientationchange', orient); addEventListener('resize', orient); orient();

  // Ekran o'chganda/qulflanganda ham audio davom etadi: tizimning "media" boshqaruvi (qulf ekrani, bildirishnoma)
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: tr(item.title) || 'BioAcademy', artist: CONFIG.APP_NAME, artwork: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
      navigator.mediaSession.setActionHandler('play', () => ad.play());
      navigator.mediaSession.setActionHandler('pause', () => ad.pause());
      navigator.mediaSession.setActionHandler('seekbackward', () => seekTo(ad.time() - S.rewind_step_s));
      navigator.mediaSession.setActionHandler('seekforward', null);
    } catch { /* eski brauzer */ }
  }
  return {
    completed: () => completed || offline,
    async destroy() {
      try { if ('mediaSession' in navigator) { navigator.mediaSession.metadata = null; ['play', 'pause', 'seekbackward'].forEach(a => navigator.mediaSession.setActionHandler(a, null)); } } catch { /* */ }
      clearInterval(ui); clearInterval(markIv); clearInterval(stallIv); screen.orientation?.unlock?.(); removeEventListener('orientationchange', orient); document.removeEventListener('visibilitychange', vis); removeEventListener('offline', off); removeEventListener('resize', orient); document.body.classList.remove('vland'); document.removeEventListener('fullscreenchange', onFs);
      try { await save(true); } catch { /* */ } timer.stop(); ad.destroy();
    },
  };
}
