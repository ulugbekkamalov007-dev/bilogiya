// Kitob/taqdimot ko'rgichi: sarlavha tepada, sahifalar chapga-o'ngga suriladi, ikki yon bo'sh joy teng.
// R2 dagi PDF (token bilan) yoki oddiy URL. onProg(0..1) — ko'rilgan sahifalar ulushi.
import { getPdfJs } from './pdfjs.js';
import { esc, $ } from './core.js';
import { T } from './ui.js';

export async function pdfReader(host, url, { title = '', mode = 'book', onProg } = {}) {
  host.innerHTML = `<div class="pv ${mode}"><div class="pv-top"><b>${esc(title)}</b><small class="muted" id="pv-n"></small></div>
    <div class="pv-stage" id="pv-st"><div class="pv-load">${esc(T('Yuklanmoqda…', 'Загрузка…', 'Loading…'))}</div><canvas id="pv-c" hidden></canvas></div>
    <div class="pv-bar"><button class="btn ghost sm" id="pv-p" aria-label="prev">‹</button><div class="pv-pb"><i id="pv-pi"></i></div><button class="btn sm" id="pv-nx" aria-label="next">›</button></div></div>`;
  const st = $('#pv-st', host), cv = $('#pv-c', host);
  let doc, i = 1, token = 0, seen = new Set(), busy = false;
  try { const lib = await getPdfJs(); doc = await lib.getDocument({ url }).promise; }
  catch (e) { st.innerHTML = `<p class="muted center pad">${esc(T('Fayl ochilmadi: ', 'Не удалось открыть: ', 'Cannot open: '))}${esc(e.message || '')}</p>`; return { destroy() {} }; }
  const N = doc.numPages;
  const draw = async (dir = 0) => {
    const my = ++token; busy = true;
    const page = await doc.getPage(i); if (my !== token) return;
    const w = Math.max(200, st.clientWidth - 2), vp0 = page.getViewport({ scale: 1 }), cssScale = w / vp0.width, dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const vp = page.getViewport({ scale: cssScale * dpr });
    const off = document.createElement('canvas'); off.width = vp.width; off.height = vp.height;
    await page.render({ canvasContext: off.getContext('2d'), viewport: vp }).promise; if (my !== token) return;
    cv.width = vp.width; cv.height = vp.height; cv.style.width = '100%'; cv.getContext('2d').drawImage(off, 0, 0);
    $('.pv-load', st)?.remove(); cv.hidden = false;
    if (dir) { cv.style.transition = 'none'; cv.style.transform = `translateX(${dir * 40}px)`; cv.style.opacity = '.2'; requestAnimationFrame(() => { cv.style.transition = 'transform .22s, opacity .22s'; cv.style.transform = ''; cv.style.opacity = '1'; }); }
    seen.add(i); $('#pv-n', host).textContent = `${i} / ${N}`; $('#pv-pi', host).style.width = (i / N * 100) + '%';
    $('#pv-p', host).disabled = i <= 1; $('#pv-nx', host).disabled = i >= N; busy = false; onProg?.(seen.size / N);
    if (i < N) doc.getPage(i + 1).catch(() => {});
  };
  const go = d => { const n = Math.min(N, Math.max(1, i + d)); if (n === i) return; i = n; draw(d); st.scrollTo?.(0, 0); };
  $('#pv-p', host).onclick = () => go(-1); $('#pv-nx', host).onclick = () => go(1);
  let x0 = null, y0 = 0;
  st.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  st.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1); }, { passive: true });
  const key = e => { if (!document.body.contains(host)) return removeEventListener('keydown', key); if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return; if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); };
  addEventListener('keydown', key);
  let rt; const rs = () => { clearTimeout(rt); rt = setTimeout(() => { if (document.body.contains(host)) draw(); }, 250); }; addEventListener('resize', rs);
  await draw();
  return { pages: N, destroy() { token++; removeEventListener('keydown', key); removeEventListener('resize', rs); try { doc.destroy(); } catch { /* */ } } };
}

// R2 dagi video (yoki oddiy URL). Ko'rilgan vaqt 5 soniyalik bo'laklarda hisoblanadi (oldinga o'tkazib yuborish hisobga olinmaydi).
export function videoPlayer(host, url, { onProg } = {}) {
  host.innerHTML = `<div class="vp"><video controls playsinline preload="metadata" src="${esc(url)}"></video></div>`;
  const v = $('video', host), b = new Set();
  v.addEventListener('timeupdate', () => { if (!v.duration || v.paused || v.seeking) return; b.add(Math.floor(v.currentTime / 5)); onProg?.(Math.min(1, b.size * 5 / v.duration)); });
  v.addEventListener('ended', () => onProg?.(Math.min(1, Math.max(b.size * 5 / (v.duration || 1), .6))));
  return { destroy() { v.pause(); v.removeAttribute('src'); v.load(); } };
}
