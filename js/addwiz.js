// Kutubxonaga qo'shish: butun ekranli oyna. 1) turni tanlash (cheksiz aylanuvchi zanjir), 2) forma, 3) manba tanlash (+ tugmasi → tanlov varag'i)
import { sb, state, t, addDict, esc, ic, $, $$, toast, btnBusy, i18nField, upload, friendlyErr, go } from './core.js';
import { holdLock } from './lock.js';
import { CONFIG } from './config.js';

addDict({
  uz: { 'aw.pick': 'Nima qo\'shamiz?', 'aw.folder': 'Papka', 'aw.folder_d': 'Bo\'lim yaratish', 'aw.video': 'Video', 'aw.video_d': 'YouTube yoki telefondan', 'aw.audio': 'Audio', 'aw.audio_d': 'Istalgan formatdagi ovoz', 'aw.doc': 'Hujjat', 'aw.doc_d': 'PDF, Word, PowerPoint', 'aw.book': 'Kitob', 'aw.book_d': 'PDF kitob', 'aw.test': 'Test', 'aw.test_d': 'Savollar to\'plami',
    'aw.add_src': 'Qo\'shish', 'aw.change': 'O\'zgartirish', 'aw.src_t': 'Qayerdan qo\'shamiz?', 'aw.yt': 'YouTube havolasi', 'aw.yt_d': 'Havolani joylashtirasiz', 'aw.gal': 'Galereya va fayllar', 'aw.gal_d': 'Telefondagi videolar', 'aw.cam': 'Kamera', 'aw.cam_d': 'Hozir video olish', 'aw.files': 'Telefon fayllari', 'aw.files_d': 'mp3, m4a, wav, flac, ogg, amr va boshqalar', 'aw.dict': 'Diktofon yozuvlari', 'aw.dict_d': 'Diktofonda olingan audiolar', 'aw.docf': 'Fayllardan tanlash', 'aw.docf_d': 'PDF, Word, PowerPoint', 'aw.pdff': 'PDF fayl', 'aw.pdff_d': 'Telefondan PDF tanlash',
    'aw.yt_ph': 'YouTube havolasini joylang', 'aw.chosen': 'Tanlandi', 'aw.need_src': 'Avval manbani tanlang', 'aw.save': 'Qo\'shish', 'aw.title': 'Nomi', 'aw.desc': 'Izoh (ixtiyoriy)' },
  ru: { 'aw.pick': 'Что добавим?', 'aw.folder': 'Папка', 'aw.folder_d': 'Создать раздел', 'aw.video': 'Видео', 'aw.video_d': 'YouTube или с телефона', 'aw.audio': 'Аудио', 'aw.audio_d': 'Звук в любом формате', 'aw.doc': 'Документ', 'aw.doc_d': 'PDF, Word, PowerPoint', 'aw.book': 'Книга', 'aw.book_d': 'PDF-книга', 'aw.test': 'Тест', 'aw.test_d': 'Набор вопросов',
    'aw.add_src': 'Добавить', 'aw.change': 'Изменить', 'aw.src_t': 'Откуда добавим?', 'aw.yt': 'Ссылка YouTube', 'aw.yt_d': 'Вставьте ссылку', 'aw.gal': 'Галерея и файлы', 'aw.gal_d': 'Видео на телефоне', 'aw.cam': 'Камера', 'aw.cam_d': 'Снять видео сейчас', 'aw.files': 'Файлы телефона', 'aw.files_d': 'mp3, m4a, wav, flac, ogg, amr и др.', 'aw.dict': 'Записи диктофона', 'aw.dict_d': 'Аудио, записанные на диктофон', 'aw.docf': 'Выбрать из файлов', 'aw.docf_d': 'PDF, Word, PowerPoint', 'aw.pdff': 'PDF файл', 'aw.pdff_d': 'Выбрать PDF на телефоне',
    'aw.yt_ph': 'Вставьте ссылку YouTube', 'aw.chosen': 'Выбрано', 'aw.need_src': 'Сначала выберите источник', 'aw.save': 'Добавить', 'aw.title': 'Название', 'aw.desc': 'Описание (необязательно)' },
  en: { 'aw.pick': 'What shall we add?', 'aw.folder': 'Folder', 'aw.folder_d': 'Create a section', 'aw.video': 'Video', 'aw.video_d': 'YouTube or from phone', 'aw.audio': 'Audio', 'aw.audio_d': 'Any audio format', 'aw.doc': 'Document', 'aw.doc_d': 'PDF, Word, PowerPoint', 'aw.book': 'Book', 'aw.book_d': 'PDF book', 'aw.test': 'Test', 'aw.test_d': 'Set of questions',
    'aw.add_src': 'Add', 'aw.change': 'Change', 'aw.src_t': 'Add from where?', 'aw.yt': 'YouTube link', 'aw.yt_d': 'Paste a link', 'aw.gal': 'Gallery & files', 'aw.gal_d': 'Videos on your phone', 'aw.cam': 'Camera', 'aw.cam_d': 'Record a video now', 'aw.files': 'Phone files', 'aw.files_d': 'mp3, m4a, wav, flac, ogg, amr and more', 'aw.dict': 'Voice recorder', 'aw.dict_d': 'Audio recorded with the recorder', 'aw.docf': 'Choose from files', 'aw.docf_d': 'PDF, Word, PowerPoint', 'aw.pdff': 'PDF file', 'aw.pdff_d': 'Pick a PDF from your phone',
    'aw.yt_ph': 'Paste the YouTube link', 'aw.chosen': 'Selected', 'aw.need_src': 'Choose a source first', 'aw.save': 'Add', 'aw.title': 'Title', 'aw.desc': 'Description (optional)' },
});

const TYPES = [['folder', 'folder'], ['video', 'video'], ['audio', 'audio'], ['doc', 'file'], ['book', 'book'], ['test', 'test']];
const SRC = {
  video: [['yt', 'link', 'aw.yt', 'aw.yt_d'], ['gal', 'image', 'aw.gal', 'aw.gal_d', 'video/*'], ['cam', 'video', 'aw.cam', 'aw.cam_d', 'video/*', true]],
  audio: [['files', 'file', 'aw.files', 'aw.files_d', ''], ['dict', 'mic', 'aw.dict', 'aw.dict_d', 'audio/*']],
  doc: [['docf', 'file', 'aw.docf', 'aw.docf_d', '.pdf,.doc,.docx,.ppt,.pptx']],
  book: [['pdff', 'book', 'aw.pdff', 'aw.pdff_d', '.pdf,application/pdf']],
};

export function openAddWizard(fid, done, H) {
  const fs = document.createElement('div'); fs.className = 'fscr'; document.body.appendChild(fs); document.body.classList.add('noscroll');
  const close = () => { fs.remove(); document.body.classList.remove('noscroll'); };
  const head = (title, back) => `<div class="fs-h"><button class="icon-btn" id="fx" aria-label="close">${ic(back ? 'back' : 'x')}</button><h2 class="mb0 grow">${esc(title)}</h2></div>`;

  // ---- 1-qadam: aylanuvchi zanjir
  const stepPick = () => {
    const N = TYPES.length, cards = [...TYPES, ...TYPES, ...TYPES];
    fs.innerHTML = `${head(t('aw.pick'))}<div class="fs-b"><div class="wheel" id="wh">${cards.map(([k, i], n) => `<button class="wcard" data-k="${k}" data-n="${n}"><span class="wic ${k}">${ic(i, 44)}</span><b>${esc(t('aw.' + k))}</b><small>${esc(t('aw.' + k + '_d'))}</small></button>`).join('')}</div></div>`;
    $('#fx', fs).onclick = close;
    const wh = $('#wh', fs), cw = () => wh.children[0].offsetWidth + 14, set = N * cw();
    requestAnimationFrame(() => { wh.scrollLeft = set; });
    let t0; wh.addEventListener('scroll', () => { clearTimeout(t0); t0 = setTimeout(() => { if (wh.scrollLeft < set * 0.5) wh.scrollLeft += set; else if (wh.scrollLeft > set * 1.5) wh.scrollLeft -= set; }, 90); }, { passive: true });
    $$('.wcard', fs).forEach(c => c.onclick = () => pick(c.dataset.k));
  };
  const pick = k => { if (k === 'test') { close(); return H.testImportModal({ folderId: fid, onDone: done }); } stepForm(k); };

  // ---- 2-qadam: forma
  const stepForm = type => {
    let src = null;   // {kind:'yt', url} | {kind:'file', file}
    fs.innerHTML = `${head(t('aw.' + type), true)}<form id="f" class="fs-b form">
      <label class="fld"><span>${esc(t('aw.title'))}</span><input class="input" id="ti" required maxlength="140"></label>
      <label class="fld"><span>${esc(t('aw.desc'))}</span><textarea class="input" id="de" rows="2"></textarea></label>
      ${type === 'folder' ? `<label class="fld"><span>${esc(t('lib.price'))}</span><input class="input" id="pr" type="number" min="0" value="0"></label>` : `<div id="srcbox"></div>`}
      <label class="chk"><input type="checkbox" id="vi" checked> ${esc(t('lib.visible'))}</label><div class="err" id="err"></div><div class="prog" id="pg" hidden><i></i></div>
      <button class="btn lg block" id="go">${esc(t('aw.save'))}</button></form>`;
    $('#fx', fs).onclick = stepPick;
    const box = $('#srcbox', fs);
    const drawSrc = () => {
      if (!box) return;
      box.innerHTML = !src ? `<button type="button" class="addbox" id="ab"><span class="plus">${ic('plus', 34)}</span><b>${esc(t('aw.add_src'))}</b></button>`
        : src.kind === 'yt' ? `<label class="fld"><span>${esc(t('aw.yt'))}</span><input class="input" id="yu" value="${esc(src.url || '')}" placeholder="${esc(t('aw.yt_ph'))}" required></label><button type="button" class="link" id="ab">${esc(t('aw.change'))}</button>`
        : `<div class="card pad item-row"><span class="item-ic ${type}">${ic(type === 'audio' ? 'audio' : type === 'video' ? 'video' : 'file')}</span><div class="grow"><b>${esc(src.file.name)}</b><br><small class="muted">${esc(t('aw.chosen'))} · ${H.fmtSize(src.file.size)}</small></div><button type="button" class="link" id="ab">${esc(t('aw.change'))}</button></div>`;
      $('#ab', box).onclick = sheet;
    };
    const sheet = () => {
      const sh = document.createElement('div'); sh.className = 'sheetbg'; fs.appendChild(sh);
      sh.innerHTML = `<div class="sheet"><h3>${esc(t('aw.src_t'))}</h3>${SRC[type].map(([k, i, l, d]) => `<button type="button" class="sopt" data-s="${k}"><span class="item-ic ${type}">${ic(i, 22)}</span><span class="grow left"><b>${esc(t(l))}</b><br><small class="muted">${esc(t(d))}</small></span>${ic('chev')}</button>`).join('')}</div>`;
      sh.onclick = e => { if (e.target === sh) sh.remove(); };
      $$('.sopt', sh).forEach(b => b.onclick = () => {
        const def = SRC[type].find(x => x[0] === b.dataset.s);
        if (def[0] === 'yt') { src = { kind: 'yt', url: '' }; sh.remove(); drawSrc(); return $('#yu', box)?.focus(); }
        const inp = document.createElement('input'); inp.type = 'file'; if (def[4]) inp.accept = def[4]; if (def[5]) inp.setAttribute('capture', 'environment');
        inp.onchange = () => { if (inp.files[0]) { src = { kind: 'file', file: inp.files[0] }; const ti = $('#ti', fs); if (!ti.value) ti.value = inp.files[0].name.replace(/\.[^.]+$/, ''); } sh.remove(); drawSrc(); };
        holdLock(180000); inp.click();
      });
    };
    drawSrc();
    $('#f', fs).onsubmit = async e => {
      e.preventDefault(); const err = $('#err', fs); err.textContent = ''; const b = $('#go', fs);
      if (type !== 'folder' && !src) { err.textContent = t('aw.need_src'); return; }
      btnBusy(b, true);
      try {
        const title = await i18nField($('#ti', fs).value.trim(), state.lang), description = await i18nField($('#de', fs).value.trim(), state.lang), visible = $('#vi', fs).checked;
        if (type === 'folder') {
          const { error } = await sb.from('folders').insert({ parent_id: fid, title, description, visible, price: +$('#pr', fs).value || 0, created_by: state.user.id }); if (error) throw error;
        } else {
          const id = crypto.randomUUID(), row = { id, folder_id: fid, title, description, visible, created_by: state.user.id, meta: {}, kind: { video: 'video', audio: 'audio', doc: 'presentation', book: 'book' }[type] };
          if (src.kind === 'yt') { const y = H.ytId($('#yu', fs).value); if (!y) throw new Error(t('lib.bad_yt')); Object.assign(row, { source: 'youtube', youtube_id: y }); }
          else {
            const f = src.file;
            if (f.size > CONFIG.MAX_UPLOAD_MB * 1048576) throw new Error(t('lib.too_big', { mb: CONFIG.MAX_UPLOAD_MB }));
            if (type === 'video') { const pr = await H.probeMedia(f, 'video'); if (!pr.ok) throw new Error(t('lib.bad_media')); Object.assign(row.meta, { width: pr.w, height: pr.h, duration: pr.d }); }
            if (type === 'audio') { const pr = await H.probeMedia(f, 'audio'); if (pr.ok) row.meta.duration = pr.d; else row.meta.noplay = true; }
            const pg = $('#pg', fs); pg.hidden = false; $('i', pg).style.width = '30%'; const path = `${id}/${H.safeName(f.name)}`;
            await upload('content', path, f, { contentType: H.mimeOf(f) }); $('i', pg).style.width = '100%';
            Object.assign(row, { storage_path: path, size_bytes: f.size, source: 'storage' });
          }
          const { error } = await sb.from('items').insert(row); if (error) throw error;
        }
        toast(t('lib.saved'), 'ok'); close(); done();
      } catch (x) { console.warn('add:', x?.message); err.textContent = friendlyErr(x?.message || String(x)); btnBusy(b, false); }
    };
  };
  stepPick();
}
