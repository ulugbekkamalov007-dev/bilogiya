// R2 (bio-media) ga yuklash/o'qish — /media/* Worker orqali.
import { sb } from './core.js';

async function tok() { const { data } = await sb.auth.getSession(); return data.session ? data.session.access_token : ''; }
const CHUNK = 8 * 1024 * 1024;

// Fayl yuklash: bo'laklab (8 MB), progress(0..1), 3 marta qayta urinish. Qaytaradi: { key, url, size }
export async function r2Upload(file, onProgress) {
  const t = await tok();
  const H = { authorization: 'Bearer ' + t };
  let r = await fetch(`/media?new&name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type || 'application/octet-stream')}`, { method: 'POST', headers: H });
  if (!r.ok) throw new Error('upload_start_' + r.status);
  const { key, uploadId } = await r.json();
  const parts = [];
  const n = Math.max(1, Math.ceil(file.size / CHUNK));
  try {
    for (let i = 0; i < n; i++) {
      const blob = file.slice(i * CHUNK, Math.min(file.size, (i + 1) * CHUNK));
      let ok = null;
      for (let a = 0; a < 3 && !ok; a++) {
        try {
          const pr = await fetch(`/media/${encodeURI(key)}?uploadId=${encodeURIComponent(uploadId)}&part=${i + 1}`, { method: 'PUT', headers: H, body: blob });
          if (pr.ok) ok = await pr.json();
        } catch (e) { /* qayta uriniladi */ }
        if (!ok) await new Promise((res) => setTimeout(res, 800 * (a + 1)));
      }
      if (!ok) throw new Error('upload_part_failed');
      parts.push(ok);
      if (onProgress) onProgress((i + 1) / n);
    }
    r = await fetch(`/media/${encodeURI(key)}?uploadId=${encodeURIComponent(uploadId)}`, { method: 'POST', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ parts }) });
    if (!r.ok) throw new Error('upload_done_' + r.status);
    return await r.json();
  } catch (e) {
    fetch(`/media/${encodeURI(key)}?uploadId=${encodeURIComponent(uploadId)}`, { method: 'DELETE', headers: H }).catch(() => {});
    throw e;
  }
}

// <video>/<audio>/<img> src uchun manzil (token query orqali; Range ishlaydi)
export async function r2Src(key) { return `/media/${encodeURI(key)}?t=${encodeURIComponent(await tok())}`; }
export async function r2Delete(key) { await fetch(`/media/${encodeURI(key)}`, { method: 'DELETE', headers: { authorization: 'Bearer ' + (await tok()) } }); }
