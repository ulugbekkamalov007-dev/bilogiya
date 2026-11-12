// Ovozli xabar yozish, rasm/fayl yuborish va xabar media qismini chizish (guruh chati, vazifa, shaxsiy xabarlar)
// Joy tejash: ovoz ~16 kbit/s Opus (≈120 KB/daqiqa), rasm WebP ≤1280px, fayl ≤10 MB.
import { sb, state, t, addDict, esc, ic, $, $$, toast, compressImage, upload, uid8, safeName, fmtSize, fmtDur } from './core.js';
import { holdLock } from './lock.js';

addDict({
  uz: { 'med.rec': 'Yozilmoqda…', 'med.mic_denied': 'Mikrofonga ruxsat berilmadi', 'med.too_big': 'Fayl 10 MB dan katta', 'med.expired': 'Fayl joyni tejash uchun o\'chirilgan', 'med.file': 'Fayl', 'med.cancel': 'Bekor qilish' },
  ru: { 'med.rec': 'Запись…', 'med.mic_denied': 'Нет доступа к микрофону', 'med.too_big': 'Файл больше 10 МБ', 'med.expired': 'Файл удалён для экономии места', 'med.file': 'Файл', 'med.cancel': 'Отмена' },
  en: { 'med.rec': 'Recording…', 'med.mic_denied': 'Microphone access denied', 'med.too_big': 'File is larger than 10 MB', 'med.expired': 'File was removed to save space', 'med.file': 'File', 'med.cancel': 'Cancel' },
});

export const MAX_FILE = 10 * 1048576;

export async function startRecording(maxSec = 120, onTick) {
  let stream;
  try { holdLock(60000); stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }); }
  catch { toast(t('med.mic_denied'), 'err'); return null; }
  const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(m => window.MediaRecorder?.isTypeSupported?.(m)) || '';
  const rec = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 16000 });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const t0 = Date.now(); let cancelled = false, resolveStop;
  const done = new Promise(r => resolveStop = r);
  rec.onstop = () => {
    stream.getTracks().forEach(x => x.stop()); clearInterval(iv);
    const type = rec.mimeType || mime || 'audio/webm';
    resolveStop(cancelled ? null : { blob: new Blob(chunks, { type }), secs: Math.max(1, Math.round((Date.now() - t0) / 1000)), ext: type.includes('mp4') ? 'm4a' : 'webm' });
  };
  rec.start(1000);
  const iv = setInterval(() => { const s = (Date.now() - t0) / 1000; onTick?.(s); if (s >= maxSec) rec.stop(); }, 250);
  return { stop: () => { if (rec.state !== 'inactive') rec.stop(); return done; }, cancel: () => { cancelled = true; if (rec.state !== 'inactive') rec.stop(); } };
}

// Faylni (rasm bo'lsa siqib) chat bucket'iga yuklaydi. folder: "<group>/<uid>" yoki "dm/<thread>"
export async function uploadAttachment(folder, file) {
  const isImg = file.type.startsWith('image/');
  const blob = isImg ? await compressImage(file, { max: 1280, quality: 0.7 }) : file;
  if (blob.size > MAX_FILE) throw new Error(t('med.too_big'));
  const ext = isImg ? (blob.type === 'image/webp' ? 'webp' : 'jpg') : (file.name.split('.').pop() || 'bin').slice(0, 5);
  const path = `${folder}/${uid8()}-${Date.now()}.${ext.replace(/[^\w]/g, '')}`;
  await upload('chat', path, blob);
  return { path, isImg, name: file.name, size: blob.size };
}
export async function uploadVoice(folder, rec) {
  const path = `${folder}/${uid8()}-${Date.now()}.${rec.ext}`;
  await upload('chat', path, rec.blob); return path;
}

// Imzolangan URL'larni paket bilan olish
const cache = new Map();
export async function urlsFor(paths) {
  const need = [...new Set(paths.filter(p => p && !(cache.get(p)?.exp > Date.now())))];
  if (need.length) {
    const { data } = await sb.storage.from('chat').createSignedUrls(need, 3600);
    (data || []).forEach(d => d.signedUrl && cache.set(d.path, { url: d.signedUrl, exp: Date.now() + 3300000 }));
  }
  return p => cache.get(p)?.url;
}

// Xabar media qismining HTML'i (URL keyin to'ldiriladi: data-src)
export function mediaHtml(m) {
  if (m.media_expired) return `<small class="muted">🗑 ${esc(t('med.expired'))}</small>`;
  if (!m.media_path) return '';
  if (m.kind === 'voice') return `<div class="voice"><audio controls preload="none" data-src="${esc(m.media_path)}"></audio><small class="muted">${fmtDur(m.media_secs || 0)}</small></div>`;
  if (m.kind === 'image') return `<a data-href="${esc(m.media_path)}" target="_blank" rel="noopener"><img class="msg-img" data-src="${esc(m.media_path)}" alt="" loading="lazy"></a>`;
  return `<a class="filelink" data-href="${esc(m.media_path)}" target="_blank" rel="noopener">${ic('clip', 16)} ${esc((m.body || t('med.file')).slice(0, 40))}</a>`;
}
export async function fillMedia(root) {
  const els = $$('[data-src],[data-href]', root).filter(e => !e.dataset.done); if (!els.length) return;
  const get = await urlsFor(els.map(e => e.dataset.src || e.dataset.href));
  els.forEach(e => { e.dataset.done = 1; const u = get(e.dataset.src || e.dataset.href); if (!u) return; if (e.dataset.src) e.src = u; else e.href = u; });
}
