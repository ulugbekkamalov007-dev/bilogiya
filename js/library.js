// Kutubxona: Drive kabi papkalar, materiallar (video/PDF/taqdimot/kitob/test/havola), pullik to'plamlar, admin boshqaruvi
import { sb, state, t, tr, addDict, route, go, onLeave, esc, ic, $, $$, modal, toast, confirmDlg, btnBusy, i18nField, upload, signedUrl, safeName, fmtSize, fmtDur, trackTime, spinner, memo, memoClear, friendlyErr } from './core.js';
import { mountPlayer } from './player.js';
import { offlineBox, offList } from './offline.js';
import { testImportModal } from './tests.js';
import { renderPdf } from './pdfjs.js';
import { paywall } from './billing.js';
import { openReader } from './reader.js';
import { audioPage, audioList, folderAudios, AP } from './audiobar.js';
import { openAddWizard } from './addwiz.js';
import { CONFIG } from './config.js';

addDict({
  uz: { 'lib.title': 'Kutubxona', 'lib.root': 'Bosh papka', 'lib.empty': 'Bu yerda hali hech narsa yo\'q', 'lib.folder': 'Papka', 'lib.new_folder': 'Yangi papka',
    'lib.add_video': 'Video', 'lib.bad_audio': 'Bu audio formatini telefon/brauzer ocha olmaydi. Uni MP3 yoki M4A formatiga o\'tkazib qayta yuklang (har qanday audio-konverter yoki telefondagi "Diktofon" ilovasi shunday saqlaydi).', 'lib.src_upv': 'Video yuklash', 'lib.src_upa': 'Audio yuklash', 'lib.vid_file': 'Video fayl', 'lib.bad_media': 'Bu fayl brauzerda ochilmaydi. Videoni MP4 (H.264) formatiga o\'tkazib qayta yuklang (masalan HandBrake yoki telefon kamerasida "Eng mos" format).', 'lib.vid_hint': 'Tavsiya: MP4 (H.264 + AAC), 720p. Fayl tekshiriladi: ochilmaydigan format yuklanmaydi.', 'lib.add_audio': 'Audio', 'lib.k_audio': 'Audio', 'lib.src_aud': 'Audio fayl (istalgan format: mp3, m4a, wav, flac, ogg, amr, wma, aiff...)', 'lib.add_file': 'Fayl (PDF / taqdimot / kitob)', 'lib.add_test': 'Test', 'lib.add_link': 'Havola', 'lib.add': 'Qo\'shish',
    'lib.title_f': 'Nomi', 'lib.desc': 'Tavsif (ixtiyoriy)', 'lib.price': 'Narxi, so\'m (0 = bepul)', 'lib.visible': 'Foydalanuvchilarga ko\'rinsin',
    'lib.hidden': 'Yashirin', 'lib.paid': 'Pullik', 'lib.locked_t': 'Pullik to\'plam', 'lib.locked_d': 'Bu to\'plamga kirish uchun so\'rov yuboring. Admin tasdiqlagach ochiladi.',
    'lib.request': 'Kirishni so\'rash', 'lib.requested': 'So\'rov yuborildi — admin javobini kuting', 'lib.pending': 'So\'rov ko\'rib chiqilmoqda',
    'lib.src': 'Manba', 'lib.src_yt': 'YouTube havolasi', 'lib.src_url': 'Video URL (mp4 / m3u8)', 'lib.src_up': 'Fayl yuklash',
    'lib.yt_hint': 'YouTube videoni «Unlisted» (havola orqali) qilib qo\'ying — ilova uni o\'z pleyerida, havolasiz ko\'rsatadi.',
    'lib.variants': 'Sifat variantlari (ixtiyoriy). Har qatorda: 720p|https://...mp4', 'lib.kind': 'Turi', 'lib.k_pdf': 'Hujjat', 'lib.k_presentation': 'Hujjat', 'lib.k_book': 'Kitob',
    'lib.k_video': 'Video', 'lib.k_test': 'Test', 'lib.k_link': 'Havola', 'lib.uploading': 'Yuklanmoqda…', 'lib.too_big': 'Fayl {mb} MB dan katta. Kattaroq fayl uchun tashqi havoladan foydalaning.',
    'lib.url_or_file': 'Fayl yoki havola kerak', 'lib.saved': 'Saqlandi', 'lib.open': 'Ochish', 'lib.download': 'Yuklab olish', 'lib.start_test': 'Testni boshlash', 'lib.add_q': 'Savollar qo\'shish',
    'lib.url': 'Havola (URL)', 'lib.watched': 'Ko\'rilgan', 'lib.edit': 'Tahrirlash', 'lib.del_q': 'O\'chirilsinmi? Ichidagi hamma narsa ham o\'chadi.', 'lib.bad_yt': 'YouTube havolasi noto\'g\'ri',
    'lib.file_hint': 'Bepul rejada bitta fayl ≤ {mb} MB. Katta kitoblarni Google Drive/R2 ga qo\'yib, havola sifatida qo\'shing.' },
  ru: { 'lib.title': 'Библиотека', 'lib.root': 'Корневая папка', 'lib.empty': 'Здесь пока ничего нет', 'lib.folder': 'Папка', 'lib.new_folder': 'Новая папка',
    'lib.add_video': 'Видео', 'lib.bad_audio': 'Этот формат аудио не открывается. Конвертируйте в MP3 или M4A и загрузите снова.', 'lib.src_upv': 'Загрузить видео', 'lib.src_upa': 'Загрузить аудио', 'lib.vid_file': 'Видеофайл', 'lib.bad_media': 'Этот файл не открывается в браузере. Конвертируйте видео в MP4 (H.264) и загрузите снова (например, HandBrake).', 'lib.vid_hint': 'Рекомендуется: MP4 (H.264 + AAC), 720p. Файл проверяется: неподдерживаемый формат не загрузится.', 'lib.add_audio': 'Аудио', 'lib.k_audio': 'Аудио', 'lib.src_aud': 'Аудио файл (любой формат: mp3, m4a, wav, flac, ogg, amr, wma...)', 'lib.add_file': 'Файл (PDF / презентация / книга)', 'lib.add_test': 'Тест', 'lib.add_link': 'Ссылка', 'lib.add': 'Добавить',
    'lib.title_f': 'Название', 'lib.desc': 'Описание (необязательно)', 'lib.price': 'Цена, сум (0 = бесплатно)', 'lib.visible': 'Показывать пользователям',
    'lib.hidden': 'Скрыто', 'lib.paid': 'Платно', 'lib.locked_t': 'Платный набор', 'lib.locked_d': 'Отправьте запрос на доступ. После подтверждения админом набор откроется.',
    'lib.request': 'Запросить доступ', 'lib.requested': 'Запрос отправлен — ждите ответа админа', 'lib.pending': 'Запрос рассматривается',
    'lib.src': 'Источник', 'lib.src_yt': 'Ссылка YouTube', 'lib.src_url': 'URL видео (mp4 / m3u8)', 'lib.src_up': 'Загрузить файл',
    'lib.yt_hint': 'Сделайте видео на YouTube «по ссылке» (Unlisted) — приложение покажет его в своём плеере, без ссылки.',
    'lib.variants': 'Варианты качества (необязательно). В строке: 720p|https://...mp4', 'lib.kind': 'Тип', 'lib.k_pdf': 'Документ', 'lib.k_presentation': 'Документ', 'lib.k_book': 'Книга',
    'lib.k_video': 'Видео', 'lib.k_test': 'Тест', 'lib.k_link': 'Ссылка', 'lib.uploading': 'Загрузка…', 'lib.too_big': 'Файл больше {mb} МБ. Для крупных файлов используйте внешнюю ссылку.',
    'lib.url_or_file': 'Нужен файл или ссылка', 'lib.saved': 'Сохранено', 'lib.open': 'Открыть', 'lib.download': 'Скачать', 'lib.start_test': 'Начать тест', 'lib.add_q': 'Добавить вопросы',
    'lib.url': 'Ссылка (URL)', 'lib.watched': 'Просмотрено', 'lib.edit': 'Изменить', 'lib.del_q': 'Удалить? Всё внутри тоже удалится.', 'lib.bad_yt': 'Неверная ссылка YouTube',
    'lib.file_hint': 'На бесплатном тарифе файл ≤ {mb} МБ. Большие книги загрузите в Google Drive/R2 и добавьте как ссылку.' },
  en: { 'lib.title': 'Library', 'lib.root': 'Root folder', 'lib.empty': 'Nothing here yet', 'lib.folder': 'Folder', 'lib.new_folder': 'New folder',
    'lib.add_video': 'Video', 'lib.bad_audio': 'This audio format cannot be opened. Convert it to MP3 or M4A and upload again.', 'lib.src_upv': 'Upload video', 'lib.src_upa': 'Upload audio', 'lib.vid_file': 'Video file', 'lib.bad_media': 'This file cannot be played in a browser. Convert the video to MP4 (H.264) and upload again (e.g. HandBrake).', 'lib.vid_hint': 'Recommended: MP4 (H.264 + AAC), 720p. The file is checked: unsupported formats will not upload.', 'lib.add_audio': 'Audio', 'lib.k_audio': 'Audio', 'lib.src_aud': 'Audio file (any format: mp3, m4a, wav, flac, ogg, amr, wma...)', 'lib.add_file': 'File (PDF / slides / book)', 'lib.add_test': 'Test', 'lib.add_link': 'Link', 'lib.add': 'Add',
    'lib.title_f': 'Title', 'lib.desc': 'Description (optional)', 'lib.price': 'Price, UZS (0 = free)', 'lib.visible': 'Visible to users',
    'lib.hidden': 'Hidden', 'lib.paid': 'Paid', 'lib.locked_t': 'Paid collection', 'lib.locked_d': 'Send an access request. It unlocks once the admin approves.',
    'lib.request': 'Request access', 'lib.requested': 'Request sent — wait for the admin', 'lib.pending': 'Request is being reviewed',
    'lib.src': 'Source', 'lib.src_yt': 'YouTube link', 'lib.src_url': 'Video URL (mp4 / m3u8)', 'lib.src_up': 'Upload a file',
    'lib.yt_hint': 'Set the YouTube video to "Unlisted" — the app plays it in its own player with no visible link.',
    'lib.variants': 'Quality variants (optional). One per line: 720p|https://...mp4', 'lib.kind': 'Type', 'lib.k_pdf': 'Document', 'lib.k_presentation': 'Document', 'lib.k_book': 'Book',
    'lib.k_video': 'Video', 'lib.k_test': 'Test', 'lib.k_link': 'Link', 'lib.uploading': 'Uploading…', 'lib.too_big': 'File exceeds {mb} MB. Use an external link for bigger files.',
    'lib.url_or_file': 'A file or a link is required', 'lib.saved': 'Saved', 'lib.open': 'Open', 'lib.download': 'Download', 'lib.start_test': 'Start the test', 'lib.add_q': 'Add questions',
    'lib.url': 'Link (URL)', 'lib.watched': 'Watched', 'lib.edit': 'Edit', 'lib.del_q': 'Delete? Everything inside will be removed.', 'lib.bad_yt': 'Invalid YouTube link',
    'lib.file_hint': 'On the free plan a file must be ≤ {mb} MB. Put big books on Google Drive/R2 and add them as links.' },
});

export const ytId = u => (String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/) || [])[1] || null;
const KIND_IC = { video: 'video', audio: 'audio', pdf: 'file', presentation: 'file', book: 'book', test: 'test', link: 'link' };
const fmtPrice = f => new Intl.NumberFormat('uz-UZ').format(f.price) + ' ' + (f.currency === 'UZS' ? (state.lang === 'en' ? 'UZS' : state.lang === 'ru' ? 'сум' : 'so\'m') : f.currency);

async function crumbs(fid) {
  const out = []; let cur = fid, n = 0;
  while (cur && n++ < 12) { const { data } = await sb.from('folders').select('id,parent_id,title,price,visible').eq('id', cur).maybeSingle(); if (!data) break; out.unshift(data); cur = data.parent_id; }
  return out;
}

// ------------------------------------------------------------------ KATALOG
const browse = async ({ el, params, alive }) => {
  if (await paywall(el)) return;
  const fid = params.fid || null;
  const fq = sb.from('folders').select('*').order('sort').order('created_at');
  const iq = sb.from('items').select('*').order('sort').order('created_at');
  const [path, f, i, ent, reqs] = await Promise.all([
    memo('lib:crumbs:' + fid, 60000, () => crumbs(fid)), fid ? fq.eq('parent_id', fid) : fq.is('parent_id', null), fid ? iq.eq('folder_id', fid) : iq.is('folder_id', null),
    sb.from('entitlements').select('folder_id').eq('user_id', state.user.id), sb.from('access_requests').select('folder_id,status').eq('user_id', state.user.id),
  ]);
  if (!alive()) return;
  const owned = new Set((ent.data || []).map(e => e.folder_id)), reqMap = Object.fromEntries((reqs.data || []).map(r => [r.folder_id, r.status]));
  const isLocked = fo => !state.isAdmin && fo.price > 0 && !owned.has(fo.id);
  // joriy papka yoki ota-papkalaridan biri qulflimi?
  const lockedAnc = state.isAdmin ? null : path.find(p => p.price > 0 && !owned.has(p.id));
  const folders = f.data || [], items = lockedAnc ? [] : (i.data || []);

  let prog = {};
  const vids = items.filter(x => x.kind === 'video' || x.kind === 'audio').map(x => x.id);
  if (vids.length) (await sb.from('video_progress').select('item_id,last_pos,duration,completed').eq('user_id', state.user.id).in('item_id', vids)).data?.forEach(p => prog[p.item_id] = p);

  const crumbHtml = `<nav class="crumbs"><a href="#/library">${ic('home', 16)} ${esc(t('lib.title'))}</a>${path.map(p => ` ${ic('chev', 14)} <a href="#/library/${p.id}">${esc(tr(p.title))}</a>`).join('')}</nav>`;
  const adminBar = state.isAdmin && !lockedAnc ? `<button class="fab" id="fab" aria-label="add">${ic('plus', 28)}</button>` : '';
  const adm = (type, id, vis) => state.isAdmin ? `<span class="acts"><button data-vis="${type}:${id}:${vis ? 1 : 0}" title="visible">${ic(vis ? 'eye' : 'eyeoff', 16)}</button><button data-edit="${type}:${id}">${ic('edit', 16)}</button><button data-del="${type}:${id}">${ic('trash', 16)}</button></span>` : '';

  el.innerHTML = `<div class="page"><h1 class="mb0">${esc(path.length ? tr(path[path.length - 1].title) : t('lib.title'))}</h1>${crumbHtml}${!path.length && offList().length ? `<a class="btn sm soft mt" href="#/offline">${ic('download', 14)} ${esc(t('off.open'))} (${offList().length})</a>` : ''}${adminBar}
    ${lockedAnc ? `<div class="card pad center mt"><div class="bigic">🔒</div><h3>${esc(t('lib.locked_t'))}: ${esc(tr(lockedAnc.title))}</h3><p class="muted">${esc(t('lib.locked_d'))}</p>
       ${reqMap[lockedAnc.id] === 'pending' ? `<p class="ok">${esc(t('lib.pending'))}</p>` : `<button class="btn lg" id="rq">${esc(t('lib.request'))}</button>`}</div>` : `
    ${folders.length ? `<div class="flist mt">${folders.map(fo => `<div class="card fldcard ${fo.visible ? '' : 'dim'}" data-open="${fo.id}">
      <div class="fic">${isLocked(fo) ? '🔒' : ic('folder', 30)}</div><b>${esc(tr(fo.title))}</b>
      <small class="muted">${fo.price > 0 ? `<span class="chip paid">${esc(t('lib.paid'))} · ${esc(fmtPrice(fo))}</span>` : ''}${fo.visible ? '' : `<span class="chip warn">${esc(t('lib.hidden'))}</span>`}</small>
      ${adm('folder', fo.id, fo.visible)}</div>`).join('')}</div>` : ''}
    ${items.length ? `<div class="cards mt">${items.map(it => { const p = prog[it.id]; return `<div class="card pad item-row ${it.visible ? '' : 'dim'}" data-item="${it.id}" data-kind="${it.kind}">
      <span class="item-ic ${it.kind}">${ic(KIND_IC[it.kind])}</span><div class="grow"><b>${esc(tr(it.title))}</b>
      <small class="muted">${esc(t('lib.k_' + it.kind))}${it.visible ? '' : ' · ' + esc(t('lib.hidden'))}${p?.completed ? ' · ✔ ' + esc(t('lib.watched')) : ''}</small>
      ${p && p.duration && !p.completed ? `<div class="bar"><i style="width:${Math.min(100, p.last_pos / p.duration * 100)}%"></i></div>` : ''}</div>${adm('item', it.id, it.visible)}${ic('chev')}</div>`; }).join('')}</div>` : ''}
    ${!folders.length && !items.length ? `<div class="card pad center mt muted">${esc(t('lib.empty'))}</div>` : ''}`}</div>`;

  $('#rq', el)?.addEventListener('click', async () => {
    const { error } = await sb.from('access_requests').insert({ user_id: state.user.id, folder_id: lockedAnc.id });
    if (error && !String(error.message).includes('duplicate')) return toast(error.message, 'err');
    toast(t('lib.requested'), 'ok'); browse({ el, params, alive });
  });
  const refresh = () => { memoClear('lib:'); return browse({ el, params, alive }); };
  $$('[data-open]', el).forEach(c => c.onclick = e => { if (e.target.closest('.acts')) return; const fo = folders.find(x => x.id === c.dataset.open); if (isLocked(fo)) lockedModal(fo, reqMap[fo.id]); else go('/library/' + fo.id); });
  $$('[data-item]', el).forEach(c => c.onclick = e => { if (e.target.closest('.acts')) return; openItem(items.find(x => x.id === c.dataset.item)); });
  $('#fab', el)?.addEventListener('click', () => openAddWizard(fid, refresh, { probeMedia, mimeOf, ytId, safeName, fmtSize, testImportModal }));
  $$('[data-vis]', el).forEach(b => b.onclick = async () => { const [ty, id, v] = b.dataset.vis.split(':'); await sb.from(ty === 'folder' ? 'folders' : 'items').update({ visible: v !== '1' }).eq('id', id); refresh(); });
  $$('[data-del]', el).forEach(b => b.onclick = async () => { const [ty, id] = b.dataset.del.split(':'); if (!(await confirmDlg(t('lib.del_q')))) return; const { error } = await sb.from(ty === 'folder' ? 'folders' : 'items').delete().eq('id', id); if (error) toast(error.message, 'err'); refresh(); });
  $$('[data-edit]', el).forEach(b => b.onclick = () => { const [ty, id] = b.dataset.edit.split(':'); editDialog(ty, (ty === 'folder' ? folders : items).find(x => x.id === id), refresh); });
};
route('/library', browse, { auth: true });
route('/library/:fid', browse, { auth: true });

function lockedModal(fo, st) {
  const m = modal(`<div class="center"><div class="bigic">🔒</div><h3>${esc(tr(fo.title))}</h3><p class="chip paid">${esc(fmtPrice(fo))}</p><p class="muted">${esc(t('lib.locked_d'))}</p>
    ${st === 'pending' ? `<p class="ok">${esc(t('lib.pending'))}</p>` : `<button class="btn lg" id="rq">${esc(t('lib.request'))}</button>`}</div>`);
  $('#rq', m.el)?.addEventListener('click', async () => {
    const { error } = await sb.from('access_requests').insert({ user_id: state.user.id, folder_id: fo.id });
    if (error && !String(error.message).includes('duplicate')) return toast(error.message, 'err');
    toast(t('lib.requested'), 'ok'); m.close();
  });
}

function openItem(it) {
  if (it.kind === 'test') return go('/test/' + it.id);
  if (it.kind === 'link' && !it.youtube_id) return window.open(it.url, '_blank', 'noopener');
  go('/item/' + it.id);
}

// ------------------------------------------------------------------ MATERIAL KO'RISH
route('/item/:id', async ({ el, params, alive }) => {
  if (await paywall(el)) return;
  const { data: it } = await sb.from('items').select('*').eq('id', params.id).maybeSingle();
  if (!alive()) return; if (!it) return go('/library', true);
  sb.rpc('item_open', { p_item: it.id }).then(() => { }, () => { });
  const back = `#/library/${it.folder_id || ''}`;
  el.innerHTML = `<div class="page"><a class="btn ghost sm" href="${back}">${ic('back')}</a><h2 class="mt">${esc(tr(it.title))}</h2><div id="host" class="mb"></div>${tr(it.description) ? `<p class="pre muted">${esc(tr(it.description))}</p>` : ''}</div>`;
  const host = $('#host', el);
  if (it.kind === 'audio') {
    const list = await folderAudios(it.folder_id); if (!alive()) return;
    const box = document.createElement('div'); box.className = 'mb'; host.after(box); let ob;
    const ap = audioPage(host, it, list, { onDone: () => ob?.repaint() }); onLeave(() => ap.destroy());
    ob = offlineBox(box, it, () => ap.completed());
    const lst = document.createElement('div'); lst.className = 'mt'; box.after(lst); audioList(lst, list, it.id);
    return;
  }
  if (it.kind === 'video') {
    const box = document.createElement('div'); box.className = 'mb'; host.after(box); let ob;
    const pl = await mountPlayer(host, it, { onDone: () => ob?.repaint() }); onLeave(() => pl.destroy());
    ob = offlineBox(box, it, () => pl.completed());
    const vl = document.createElement('div'); vl.className = 'mt'; box.after(vl);
    let q2 = sb.from('items').select('id,title,description,youtube_id,meta,visible,created_at').eq('kind', 'video').order('created_at');
    q2 = it.folder_id ? q2.eq('folder_id', it.folder_id) : q2.is('folder_id', null);
    q2.then(({ data }) => { const list = (data || []).filter(x => x.visible || state.isAdmin); if (list.length < 2 || !vl.isConnected) return;
      vl.innerHTML = `<h3>${esc(t('lib.k_video'))}</h3><div class="vlist">${list.map(v => `<a class="vrow ${v.id === it.id ? 'cur' : ''}" href="#/item/${v.id}"><span class="vth">${v.youtube_id ? `<img src="https://i.ytimg.com/vi/${esc(v.youtube_id)}/mqdefault.jpg" alt="" loading="lazy">` : ic('video', 30)}${v.meta?.duration ? `<i>${esc(fmtDur(v.meta.duration))}</i>` : ''}</span><span class="vin"><b>${esc(tr(v.title))}</b><small class="muted">${esc(tr(v.description) || '')}</small></span></a>`).join('')}</div>`; });
    return;
  }
  // o'qiladigan materiallar (hujjat, kitob) — butun ekranda, o'qish vaqti hisoblanadi
  const tm = trackTime('book', it.id); onLeave(() => tm.stop());
  let url = it.url; if (!url && it.storage_path) url = await signedUrl('content', it.storage_path, 7200);
  const ext = (it.storage_path || it.url || '').split('?')[0].split('.').pop().toLowerCase();
  if (!url) return go('/library', true);
  return openReader(el, it, url, ext, back);
}, { auth: true });

// ------------------------------------------------------------------ ADMIN: QO'SHISH / TAHRIRLASH
export const MIME = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', flac: 'audio/flac', weba: 'audio/webm', webm: 'video/webm', mp4: 'video/mp4', mov: 'video/quicktime', '3gp': 'video/3gpp', amr: 'audio/amr', mka: 'audio/x-matroska' };
export const mimeOf = f => f.type || MIME[(f.name.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
// Yuklashdan oldin faylni tekshirish: brauzer ocha oladimi, o'lchami va davomiyligi qancha
export const probeMedia = (file, tag) => new Promise(res => {
  const u = URL.createObjectURL(file), m = document.createElement(tag); m.preload = 'metadata'; let done = false;
  const fin = r => { if (done) return; done = true; URL.revokeObjectURL(u); res(r); };
  m.onloadedmetadata = () => fin({ ok: true, w: m.videoWidth || 0, h: m.videoHeight || 0, d: Math.round(m.duration || 0) });
  // faqat brauzer aniq "ochib bo'lmaydi" desa rad etamiz; telefon metadata yuklamasa (vaqt tugasa) — faylni qabul qilamiz
  m.onerror = () => fin({ ok: false }); setTimeout(() => fin({ ok: true, w: 0, h: 0, d: 0, unknown: true }), 7000); m.src = u; try { m.load(); } catch { /* */ }
});
function addDialog(type, fid, done) {
  if (type === 'test') {
    const m = modal(`<h3>${esc(t('lib.add_test'))}</h3><div class="stack"><button class="btn lg" id="a">${esc(t('imp.title'))}</button></div>`);
    $('#a', m.el).onclick = () => { m.close(); testImportModal({ folderId: fid, onDone: done }); }; return;
  }
  const fields = {
    folder: `<label class="fld"><span>${esc(t('lib.price'))}</span><input class="input" id="pr" type="number" min="0" value="0"></label>`,
    video: `<div class="fld"><span>${esc(t('lib.src'))}</span><div class="seg"><label><input type="radio" name="s" value="youtube" checked><span>YouTube</span></label><label><input type="radio" name="s" value="url"><span>URL</span></label><label><input type="radio" name="s" value="storage"><span>${esc(t('lib.src_upv'))}</span></label></div></div>
      <div id="vsrc"></div>`,
    audio: `<div class="fld"><span>${esc(t('lib.src'))}</span><div class="seg"><label><input type="radio" name="s" value="storage" checked><span>${esc(t('lib.src_upa'))}</span></label><label><input type="radio" name="s" value="url"><span>URL</span></label></div></div><div id="asrc"></div>`,
    file: `<div class="fld"><span>${esc(t('lib.kind'))}</span><div class="seg"><label><input type="radio" name="k" value="pdf" checked><span>${esc(t('lib.k_pdf'))}</span></label><label><input type="radio" name="k" value="presentation"><span>${esc(t('lib.k_presentation'))}</span></label><label><input type="radio" name="k" value="book"><span>${esc(t('lib.k_book'))}</span></label></div></div>
      <label class="fld"><span>${esc(t('lib.src_up'))}</span><input type="file" id="fl" accept=".pdf,.ppt,.pptx,.doc,.docx"></label><small class="muted">${esc(t('lib.file_hint', { mb: CONFIG.MAX_UPLOAD_MB }))}</small>
      <label class="fld"><span>${esc(t('lib.url'))}</span><input class="input" id="ur" type="url" placeholder="https://"></label>`,
    link: `<label class="fld"><span>${esc(t('lib.url'))}</span><input class="input" id="ur" type="url" placeholder="https://" required></label><small class="muted">${esc(t('lib.yt_hint'))}</small>`,
  };
  const m = modal(`<h3>${esc(t(type === 'folder' ? 'lib.new_folder' : type === 'video' ? 'lib.add_video' : type === 'audio' ? 'lib.add_audio' : type === 'file' ? 'lib.add_file' : 'lib.add_link'))}</h3>
    <form id="f" class="form"><label class="fld"><span>${esc(t('lib.title_f'))}</span><input class="input" id="ti" required maxlength="140"></label>
    <label class="fld"><span>${esc(t('lib.desc'))}</span><textarea class="input" id="de" rows="2"></textarea></label>${fields[type]}
    <label class="chk"><input type="checkbox" id="vi" checked> ${esc(t('lib.visible'))}</label><div class="err" id="err"></div><div class="prog" id="pg" hidden><i></i></div>
    <button class="btn lg block" id="go">${esc(t('lib.add'))}</button></form>`, { cls: 'wide' });
  const el = m.el;
  if (type === 'video') {
    const draw = () => { const s = $('input[name=s]:checked', el).value; $('#vsrc', el).innerHTML = s === 'youtube'
      ? `<label class="fld"><span>${esc(t('lib.src_yt'))}</span><input class="input" id="ur" placeholder="https://youtu.be/..." required></label><small class="muted">${esc(t('lib.yt_hint'))}</small>`
      : s === 'url' ? `<label class="fld"><span>${esc(t('lib.src_url'))}</span><input class="input" id="ur" type="url" required></label><label class="fld"><span>${esc(t('lib.variants'))}</span><textarea class="input" id="vr" rows="3" placeholder="360p|https://...&#10;720p|https://..."></textarea></label>`
      : `<label class="fld"><span>${esc(t('lib.vid_file'))} (mp4 ≤ ${CONFIG.MAX_UPLOAD_MB} MB)</span><input type="file" id="fl" accept="video/*" required></label><small class="muted">${esc(t('lib.vid_hint'))}</small>`; };
    $$('input[name=s]', el).forEach(r => r.onchange = draw); draw();
  }
  if (type === 'audio') {
    const draw = () => { const v = $('input[name=s]:checked', el).value; $('#asrc', el).innerHTML = v === 'url'
      ? `<label class="fld"><span>URL (mp3/m4a)</span><input class="input" id="ur" type="url" required></label>`
      : `<label class="fld"><span>${esc(t('lib.src_aud'))} ≤ ${CONFIG.MAX_UPLOAD_MB} MB</span><input type="file" id="fl" required></label>`; };
    $$('input[name=s]', el).forEach(r => r.onchange = draw); draw();
  }
  $('#f', el).onsubmit = async e => {
    e.preventDefault(); const err = $('#err', el); err.textContent = ''; const b = $('#go', el); btnBusy(b, true);
    try {
      const title = await i18nField($('#ti', el).value.trim(), state.lang), description = await i18nField($('#de', el).value.trim(), state.lang), visible = $('#vi', el).checked;
      if (type === 'folder') {
        const { error } = await sb.from('folders').insert({ parent_id: fid, title, description, visible, price: +$('#pr', el).value || 0, created_by: state.user.id }); if (error) throw error;
      } else {
        const id = crypto.randomUUID(); let row = { id, folder_id: fid, title, description, visible, created_by: state.user.id, meta: {} };
        const putFile = async f => {
          if (f.size > CONFIG.MAX_UPLOAD_MB * 1048576) throw new Error(t('lib.too_big', { mb: CONFIG.MAX_UPLOAD_MB }));
          const pg = $('#pg', el); pg.hidden = false; $('i', pg).style.width = '30%'; const path = `${id}/${safeName(f.name)}`;
          await upload('content', path, f, { contentType: mimeOf(f) }); $('i', pg).style.width = '100%'; row.storage_path = path; row.size_bytes = f.size; row.source = 'storage';
        };
        if (type === 'video') {
          const s = $('input[name=s]:checked', el).value; row.kind = 'video';
          if (s === 'youtube') { const y = ytId($('#ur', el).value); if (!y) throw new Error(t('lib.bad_yt')); Object.assign(row, { source: 'youtube', youtube_id: y }); }
          else if (s === 'url') {
            Object.assign(row, { source: 'url', url: $('#ur', el).value.trim() });
            const vs = ($('#vr', el).value || '').split('\n').map(l => l.split('|')).filter(p => p.length === 2).map(([label, url]) => ({ label: label.trim(), url: url.trim() })); if (vs.length) row.meta.sources = vs;
          } else { const f = $('#fl', el).files[0], pr = await probeMedia(f, 'video'); if (!pr.ok) throw new Error(t('lib.bad_media')); Object.assign(row.meta, { width: pr.w, height: pr.h, duration: pr.d }); await putFile(f); }
        } else if (type === 'audio') {
          row.kind = 'audio'; if ($('input[name=s]:checked', el).value === 'url') Object.assign(row, { source: 'url', url: $('#ur', el).value.trim() }); else { const f = $('#fl', el).files[0], pr = await probeMedia(f, 'audio'); if (pr.ok) row.meta.duration = pr.d; else row.meta.noplay = true; await putFile(f); }
        } else if (type === 'file') {
          row.kind = $('input[name=k]:checked', el).value; const f = $('#fl', el).files[0], u = $('#ur', el).value.trim();
          if (f) await putFile(f); else if (u) Object.assign(row, { source: 'url', url: u }); else throw new Error(t('lib.url_or_file'));
        } else {
          const u = $('#ur', el).value.trim(), y = ytId(u);
          if (y) Object.assign(row, { kind: 'video', source: 'youtube', youtube_id: y }); else Object.assign(row, { kind: 'link', source: 'url', url: u });
        }
        const { error } = await sb.from('items').insert(row); if (error) throw error;
      }
      toast(t('lib.saved'), 'ok'); m.close(); done();
    } catch (x) { console.warn('add:', x?.message); err.textContent = friendlyErr(x?.message || String(x)); btnBusy(b, false); }
  };
}

function editDialog(type, row, done) {
  const m = modal(`<h3>${esc(t('lib.edit'))}</h3><form id="f" class="form">
    ${['uz', 'ru', 'en'].map(l => `<label class="fld"><span>${esc(t('lib.title_f'))} (${l.toUpperCase()})</span><input class="input" data-l="${l}" value="${esc(row.title?.[l] || '')}"></label>`).join('')}
    ${type === 'folder' ? `<label class="fld"><span>${esc(t('lib.price'))}</span><input class="input" id="pr" type="number" min="0" value="${row.price}"></label>` : ''}
    ${type === 'item' && row.kind === 'test' ? `<button type="button" class="btn soft" id="aq">${esc(t('lib.add_q'))}</button>` : ''}
    <button class="btn lg block" id="go">${esc(t('save'))}</button></form>`);
  $('#aq', m.el)?.addEventListener('click', () => { m.close(); testImportModal({ itemId: row.id, onDone: done }); });
  $('#f', m.el).onsubmit = async e => {
    e.preventDefault(); const title = {}; $$('[data-l]', m.el).forEach(i => title[i.dataset.l] = i.value.trim());
    const patch = { title }; if (type === 'folder') patch.price = +$('#pr', m.el).value || 0;
    const { error } = await sb.from(type === 'folder' ? 'folders' : 'items').update(patch).eq('id', row.id);
    if (error) return toast(error.message, 'err'); toast(t('lib.saved'), 'ok'); m.close(); done();
  };
}
