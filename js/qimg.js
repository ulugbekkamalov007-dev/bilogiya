// Savol rasmlari: R2 ("r2:kalit") yoki eski Supabase 'media' yo'li. Chiroyli ramka + bosganda kattalashadi.
import { esc, publicUrl, $$, compressImage } from './core.js';
import { T } from './ui.js';

export function qFig(path) {
  if (!path) return '';
  const src = path.startsWith('r2:') ? `data-r2="${esc(path.slice(3))}"` : `src="${esc(publicUrl('media', path))}"`;
  return `<figure class="qfig"><img ${src} alt="" loading="lazy"><figcaption>🔍 ${esc(T('Kattalashtirish uchun bosing', 'Нажмите, чтобы увеличить', 'Tap to enlarge'))}</figcaption></figure>`;
}
export async function hydrateQ(root) {
  const r2 = $$('img[data-r2]', root);
  if (r2.length) { const { r2Src } = await import('./r2.js'); for (const i of r2) { try { i.src = await r2Src(i.dataset.r2); } catch { /* */ } } }
  $$('.qfig', root).forEach(f => { if (f.dataset.z) return; f.dataset.z = '1'; f.addEventListener('click', () => {
    const img = f.querySelector('img'); if (!img || !img.src) return;
    const o = document.createElement('div'); o.className = 'qzoom'; o.innerHTML = `<img src="${esc(img.src)}" alt="">`; o.onclick = () => o.remove(); document.body.appendChild(o);
  }); });
}
// docx dan ajratilgan rasmlarni R2 ga yuklaydi. used: kerakli indekslar. Qaytaradi: {indeks: 'r2:kalit'}
export async function uploadQImages(images, used, onP) {
  const { r2Upload } = await import('./r2.js'); const out = {}; let n = 0;
  for (const i of used) {
    const im = images[i]; if (!im) continue;
    const blob = await compressImage(im.blob, { max: 1400, quality: 0.82 });
    const f = new File([blob], 'q.' + (blob.type === 'image/webp' ? 'webp' : 'jpg'), { type: blob.type });
    out[i] = 'r2:' + (await r2Upload(f)).key; onP?.(++n / used.length);
  }
  return out;
}
