// Oflayn rejim: oxirigacha ko'rilgan video/audioni telefon xotirasiga VAQTINCHA saqlash va internetsiz qayta ko'rish.
// Saqlash: Cache Storage (blob), ro'yxat (nomi, hajmi) — localStorage. Foydalanuvchi istagan paytda o'chiradi.
import { state, t, tr, addDict, route, go, onLeave, esc, ic, $, $$, toast, signedUrl, fmtSize, fmtDur, spinner, confirmDlg, friendlyErr } from './core.js';
import { mountPlayer } from './player.js';

addDict({
  uz: { 'off.title': 'Oflayn (telefonda saqlangan)', 'off.sub': 'Internetsiz ko\'rish mumkin bo\'lgan materiallar. Joy kerak bo\'lsa o\'chirib tashlang.', 'off.save': 'Telefonga saqlash', 'off.saved': 'Telefonda saqlangan', 'off.remove': 'Telefondan o\'chirish',
    'off.need_done': 'Oxirigacha ko\'rgach, uni internetsiz qayta ko\'rish uchun telefonga saqlash mumkin.', 'off.saving': 'Saqlanmoqda…', 'off.unsupported': 'Bu materialni saqlab bo\'lmaydi (YouTube yoki oqim havolasi).', 'off.space': 'Telefonda joy yetarli emas', 'off.fail': 'Saqlab bo\'lmadi. Internetni tekshirib qayta urinib ko\'ring.',
    'off.empty': 'Hali hech narsa saqlanmagan', 'off.del_q': 'Telefondan o\'chirilsinmi? (Internet bilan qayta ko\'rish mumkin)', 'off.mode': 'Oflayn rejim — faqat saqlangan materiallar ochiladi', 'off.open': 'Oflayn bo\'lim', 'off.used': 'Band joy', 'off.note': 'Oflayn ko\'rilganda ham o\'zingiz uchun ijro etiladi, internet yo\'q paytda vaqt hisobotga qo\'shilmaydi.', 'off.gone': 'Saqlangan fayl topilmadi (telefon xotirasi tozalangan bo\'lishi mumkin)', 'off.go_online': 'Internetga ulanganda boshqa bo\'limlar ham ishlaydi.' },
  ru: { 'off.title': 'Офлайн (сохранено на телефоне)', 'off.sub': 'Материалы, которые можно смотреть без интернета. Удаляйте, если нужно место.', 'off.save': 'Сохранить на телефон', 'off.saved': 'Сохранено на телефоне', 'off.remove': 'Удалить с телефона',
    'off.need_done': 'После просмотра до конца материал можно сохранить на телефон для просмотра без интернета.', 'off.saving': 'Сохранение…', 'off.unsupported': 'Этот материал нельзя сохранить (YouTube или потоковая ссылка).', 'off.space': 'Недостаточно места на телефоне', 'off.fail': 'Не удалось сохранить. Проверьте интернет и повторите.',
    'off.empty': 'Пока ничего не сохранено', 'off.del_q': 'Удалить с телефона? (Можно снова смотреть онлайн)', 'off.mode': 'Офлайн-режим — открываются только сохранённые материалы', 'off.open': 'Офлайн-раздел', 'off.used': 'Занято', 'off.note': 'Время без интернета в отчёт не засчитывается.', 'off.gone': 'Сохранённый файл не найден (память телефона могла быть очищена)', 'off.go_online': 'С интернетом заработают и остальные разделы.' },
  en: { 'off.title': 'Offline (saved on this phone)', 'off.sub': 'Items you can watch without internet. Delete them if you need space.', 'off.save': 'Save to phone', 'off.saved': 'Saved on phone', 'off.remove': 'Remove from phone',
    'off.need_done': 'After you watch it to the end, you can save it to your phone to rewatch without internet.', 'off.saving': 'Saving…', 'off.unsupported': 'This item cannot be saved (YouTube or a streaming link).', 'off.space': 'Not enough space on the phone', 'off.fail': 'Could not save. Check your internet and try again.',
    'off.empty': 'Nothing saved yet', 'off.del_q': 'Remove from the phone? (You can still watch online)', 'off.mode': 'Offline mode — only saved items open', 'off.open': 'Offline section', 'off.used': 'Used', 'off.note': 'Time spent without internet is not counted in reports.', 'off.gone': 'Saved file not found (the phone may have cleared its storage)', 'off.go_online': 'Other sections work again once you are online.' },
});

const CACHE = 'bio-off-v1';
const lkey = () => 'bio.off.' + (state.user?.id || 'x');
export const offList = () => { try { return JSON.parse(localStorage.getItem(lkey()) || '[]'); } catch { return []; } };
const offSet = l => localStorage.setItem(lkey(), JSON.stringify(l));
export const offHas = id => offList().some(x => x.id === id);
const ckey = id => new Request(`${location.origin}/__offline/${state.user.id}/${id}`);
export const offSupported = () => 'caches' in window;

export function offEligible(item) {
  if (!offSupported() || state.settings?.video?.allow_offline === false) return false;
  if (item.source === 'youtube' || item.youtube_id) return false;
  const u = item.url || ''; if (/\.m3u8(\?|$)/i.test(u)) return false;
  return !!(item.storage_path || u || (item.meta?.sources || []).some(s => s.url && !/\.m3u8/i.test(s.url)));
}

export async function offSave(item, onProg = () => {}) {
  let url = item.url; const vs = (item.meta?.sources || []).filter(s => s.url && !/\.m3u8/i.test(s.url));
  if (vs.length) url = (vs.find(s => /480|360/.test(s.label)) || vs[0]).url;
  if (!url && item.storage_path) url = await signedUrl('content', item.storage_path, 3600);
  if (!url) throw new Error('off_unsupported');
  const est = await navigator.storage?.estimate?.().catch(() => null), need = item.size_bytes || 0;
  if (est && need && est.quota - est.usage < need * 1.3) throw new Error('off_space');
  const res = await fetch(url); if (!res.ok || !res.body) throw new Error('off_fail');
  const total = +res.headers.get('content-length') || need || 0, rd = res.body.getReader(), parts = []; let got = 0;
  for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (total) onProg(Math.min(1, got / total)); }
  const type = res.headers.get('content-type') || (item.kind === 'audio' ? 'audio/mpeg' : 'video/mp4'), blob = new Blob(parts, { type });
  await (await caches.open(CACHE)).put(ckey(item.id), new Response(blob, { headers: { 'content-type': type } }));
  navigator.storage?.persist?.().catch(() => {});
  offSet([...offList().filter(x => x.id !== item.id), { id: item.id, kind: item.kind, title: item.title, size: blob.size, saved: Date.now(), dur: item.meta?.duration || 0 }]);
  return blob.size;
}
export async function offRemove(id) { try { await (await caches.open(CACHE)).delete(ckey(id)); } catch { /* */ } offSet(offList().filter(x => x.id !== id)); }
async function offBlobUrl(id) { const r = await (await caches.open(CACHE)).match(ckey(id)); return r ? URL.createObjectURL(await r.blob()) : null; }

// ---- pleyer ostidagi "Telefonga saqlash" bloki
export function offlineBox(box, item, getDone) {
  if (!offEligible(item)) { box.innerHTML = ''; return { repaint() {} }; }
  let busy = 0;
  const paint = () => {
    const saved = offHas(item.id), done = state.isAdmin || getDone();
    box.innerHTML = `<div class="card pad offbox"><div class="row" style="gap:10px"><span class="item-ic">${ic('download')}</span><div class="grow">
      ${saved ? `<b class="ok">${esc(t('off.saved'))} ✔</b><br><small class="muted">${esc(fmtSize(offList().find(x => x.id === item.id)?.size || 0))}</small>`
        : busy ? `<b>${esc(t('off.saving'))} ${Math.round(busy * 100)}%</b><div class="prog"><i style="width:${busy * 100}%"></i></div>`
        : `<b>${esc(t('off.save'))}${item.size_bytes ? ' · ' + esc(fmtSize(item.size_bytes)) : ''}</b>${done ? '' : `<br><small class="muted">${esc(t('off.need_done'))}</small>`}`}</div>
      ${saved ? `<button class="btn sm ghost" id="orm">${esc(t('off.remove'))}</button>` : `<button class="btn sm" id="osv" ${done && !busy ? '' : 'disabled'}>${ic('download', 14)}</button>`}</div></div>`;
    $('#osv', box)?.addEventListener('click', async () => {
      busy = 0.01; paint();
      try { await offSave(item, p => { busy = Math.max(0.01, p); const i = $('.prog i', box); if (i) { i.style.width = busy * 100 + '%'; $('b', box).textContent = t('off.saving') + ' ' + Math.round(busy * 100) + '%'; } }); busy = 0; toast(t('off.saved'), 'ok'); }
      catch (e) { busy = 0; toast(e.message === 'off_space' ? t('off.space') : e.message === 'off_unsupported' ? t('off.unsupported') : t('off.fail'), 'err'); }
      paint();
    });
    $('#orm', box)?.addEventListener('click', async () => { if (!(await confirmDlg(t('off.del_q')))) return; await offRemove(item.id); paint(); });
  };
  paint(); return { repaint: paint };
}

// ---- /offline : saqlangan materiallar ro'yxati
route('/offline', async ({ el }) => {
  const list = offList().sort((a, b) => b.saved - a.saved), est = await navigator.storage?.estimate?.().catch(() => null);
  el.innerHTML = `<div class="page narrow"><h1>${esc(t('off.title'))}</h1><p class="muted">${esc(t('off.sub'))}</p>
    ${navigator.onLine ? '' : `<div class="card pad warnbox mb">${esc(t('off.mode'))}<br><small>${esc(t('off.go_online'))}</small></div>`}
    ${list.length ? `<div class="cards">${list.map(x => `<div class="card pad item-row"><a class="item-row grow" href="#/offline/${x.id}"><span class="item-ic ${x.kind}">${ic(x.kind === 'audio' ? 'audio' : 'video')}</span><div class="grow"><b>${esc(tr(x.title))}</b><br><small class="muted">${esc(fmtSize(x.size))}${x.dur ? ' · ' + esc(fmtDur(x.dur)) : ''}</small></div></a>
      <button class="btn sm ghost" data-rm="${x.id}" aria-label="delete">${ic('trash', 16)}</button></div>`).join('')}</div>` : `<p class="muted center pad">${esc(t('off.empty'))}</p>`}
    ${est ? `<p class="muted center mt"><small>${esc(t('off.used'))}: ${esc(fmtSize(est.usage || 0))}</small></p>` : ''}<p class="muted center"><small>${esc(t('off.note'))}</small></p></div>`;
  $$('[data-rm]', el).forEach(b => b.onclick = async () => { if (await confirmDlg(t('off.del_q'))) { await offRemove(b.dataset.rm); go('/offline', true); location.reload(); } });
}, { auth: true });

route('/offline/:id', async ({ el, params, alive }) => {
  const meta = offList().find(x => x.id === params.id); if (!meta) return go('/offline', true);
  const url = await offBlobUrl(params.id); if (!alive()) return;
  if (!url) { await offRemove(params.id); toast(t('off.gone'), 'err'); return go('/offline', true); }
  el.innerHTML = `<div class="page"><a class="btn ghost sm" href="#/offline">${ic('back')}</a><h2 class="mt">${esc(tr(meta.title))}</h2><div id="host" class="mb"></div></div>`;
  const pl = await mountPlayer($('#host', el), { id: meta.id, kind: meta.kind, title: meta.title, source: 'url', url, meta: {} }, { offline: true });
  onLeave(() => { pl.destroy(); URL.revokeObjectURL(url); });
}, { auth: true });
