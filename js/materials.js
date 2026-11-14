// O'qituvchi (va admin) materiallar markazi: papkalar, 5 ta kategoriya, yuklash (tanlash + drag&drop), amallar menyusi, guruhga biriktirish, chiqitdon
import { sb, state, tr, route, go, esc, ic, $, $$, modal, toast, btnBusy, confirmDlg, spinner, fmtDate, fmtSize, i18nField, upload, safeName } from './core.js';
import { T, skeleton, empty, errBox, dbErr } from './ui.js';
import { CONFIG } from './config.js';
import { probeMedia, mimeOf, ytId } from './library.js';
import { testImportModal, takersModal } from './tests.js';

const staffOnly = () => state.profile?.role === 'teacher' || state.isAdmin;
// kategoriya -> [kind'lar, ikonka, rang sinfi, qabul qilinadigan kengaytmalar, nomi]
const CATS = {
  presentation: { kinds: ['presentation'], ic: 'file', cls: 'presentation', acc: '.pptx,.ppt,.odp', n: () => T('Taqdimot', 'Презентация', 'Presentation'), fm: 'PPTX' },
  book: { kinds: ['book', 'pdf'], ic: 'book', cls: 'book', acc: '.pdf,.epub,.doc,.docx,.txt', n: () => T('Kitob', 'Книга', 'Book'), fm: 'PDF, ePub' },
  video: { kinds: ['video'], ic: 'video', cls: 'video', acc: 'video/*,.mp4,.webm,.mov,.m4v,.mkv', n: () => T('Video', 'Видео', 'Video'), fm: 'MP4, WEBM' },
  audio: { kinds: ['audio'], ic: 'audio', cls: 'audio', acc: 'audio/*,.mp3,.m4a,.aac,.wav,.ogg,.opus,.flac', n: () => T('Audio', 'Аудио', 'Audio'), fm: 'MP3, M4A' },
  test: { kinds: ['test'], ic: 'test', cls: 'test', acc: '', n: () => T('Test', 'Тест', 'Test'), fm: T('Savollar', 'Вопросы', 'Questions') },
};
const catOf = kind => Object.keys(CATS).find(c => CATS[c].kinds.includes(kind)) || null;
// havola (YouTube) orqali qo'shilgan video ham "Video" kategoriyasida hisoblanadi
const catOfItem = x => (x.youtube_id || x.source === 'youtube' || (x.url && /youtu|vimeo|\.mp4/i.test(x.url))) ? 'video' : catOf(x.kind);

// ---- fayl turi: kengaytma + HAQIQIY imzo (magic bytes) bo'yicha
const EXT_KIND = { pptx: 'presentation', ppt: 'presentation', odp: 'presentation', pdf: 'book', epub: 'book', docx: 'book', doc: 'book', txt: 'book',
  mp4: 'video', webm: 'video', mov: 'video', m4v: 'video', mkv: 'video', ogv: 'video',
  mp3: 'audio', m4a: 'audio', aac: 'audio', wav: 'audio', ogg: 'audio', oga: 'audio', opus: 'audio', flac: 'audio', weba: 'audio' };
const BLOCK = /^(exe|dll|bat|cmd|com|msi|sh|js|mjs|vbs|ps1|jar|apk|html?|svg|php|py|scr|lnk)$/i;
const ext = n => (n.split('.').pop() || '').toLowerCase();
async function sniff(file) {
  const e = ext(file.name), b = new Uint8Array(await file.slice(0, 1024).arrayBuffer()), s = (a, n) => String.fromCharCode(...b.slice(a, a + n));
  const at = (...v) => v.every((x, i) => b[i] === x);
  if (e === 'pdf') return s(0, 1024).includes('%PDF') ? '' : 'pdf';
  if (['pptx', 'docx', 'epub', 'odp'].includes(e)) return at(0x50, 0x4b, 0x03, 0x04) ? '' : 'zip';
  if (['ppt', 'doc'].includes(e)) return at(0xd0, 0xcf, 0x11, 0xe0) ? '' : 'ole';
  if (['mp4', 'm4a', 'mov', 'm4v'].includes(e)) return ['ftyp', 'moov', 'wide', 'mdat', 'free', 'skip'].includes(s(4, 4)) ? '' : 'mp4';
  if (['webm', 'mkv', 'weba'].includes(e)) return at(0x1a, 0x45, 0xdf, 0xa3) ? '' : 'webm';
  if (e === 'mp3') return s(0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) ? '' : 'mp3';
  if (e === 'aac') return (b[0] === 0xff && (b[1] & 0xf0) === 0xf0) || s(0, 4) === 'ADIF' ? '' : 'aac';
  if (e === 'wav') return s(0, 4) === 'RIFF' ? '' : 'wav';
  if (['ogg', 'oga', 'opus', 'ogv'].includes(e)) return s(0, 4) === 'OggS' ? '' : 'ogg';
  if (e === 'flac') return s(0, 4) === 'fLaC' ? '' : 'flac';
  if (e === 'txt') return b.includes(0) ? 'txt' : '';
  return 'unknown';
}
const KB_LIMIT = () => CONFIG.MAX_UPLOAD_MB;

route('/teach/materials', async ({ el, q, alive }) => {
  if (!staffOnly()) return go('/home', true);
  const uid = state.user.id; let fid = q?.f || null, filter = q?.k || '', term = '', trash = false, busyUp = false, hideNew = false;
  const folderMenuTitle = f => tr(f.title);

  const load = async () => {
    let fq = sb.from('folders').select('id,parent_id,title,created_at,deleted_at,visible').order('created_at'); if (!state.isAdmin) fq = fq.eq('created_by', uid);
    let iq = sb.from('items').select('id,folder_id,kind,title,size_bytes,created_at,deleted_at,storage_path,source,youtube_id,url,meta,visible,created_by').order('created_at', { ascending: false }).limit(3000); if (!state.isAdmin) iq = iq.eq('created_by', uid);
    const [f, i, g] = await Promise.all([fq, iq, sb.from('groups').select('id,name').eq('archived', false).order('name')]);
    if (f.error || i.error) throw (f.error || i.error);
    return { folders: f.data || [], items: i.data || [], groups: (state.isAdmin ? g.data : (g.data || [])).filter(Boolean) };
  };
  let D;
  const myGroups = async () => { const r = await sb.from('groups').select('id,name,owner_id').eq('archived', false).order('name'); return (r.data || []).filter(x => state.isAdmin || x.owner_id === uid); };

  const crumbs = () => { const out = []; let cur = fid; let n = 0; while (cur && n++ < 12) { const f = D.folders.find(x => x.id === cur); if (!f) break; out.unshift(f); cur = f.parent_id; } return out; };
  const kindIc = x => { const c = catOfItem(x); return c ? `<span class="item-ic ${CATS[c].cls}">${ic(CATS[c].ic, 18)}</span>` : `<span class="item-ic">${ic('link', 18)}</span>`; };

  const paint = () => {
    const live = D.items.filter(x => !x.deleted_at), liveF = D.folders.filter(x => !x.deleted_at);
    const cnt = c => live.filter(x => catOfItem(x) === c).length;
    const subF = liveF.filter(f => (f.parent_id || null) === (fid || null) && (!term || tr(f.title).toLowerCase().includes(term)));
    let its = live.filter(x => (term ? true : (x.folder_id || null) === (fid || null)));
    if (filter) its = its.filter(x => catOfItem(x) === filter);
    if (term) its = its.filter(x => tr(x.title).toLowerCase().includes(term));
    const tF = D.folders.filter(x => x.deleted_at), tI = D.items.filter(x => x.deleted_at);
    const bc = crumbs();
    el.innerHTML = `<div class="page mat">
      <div class="row between wrap"><h1 class="mb0">${esc(T('Materiallar', 'Материалы', 'Materials'))}</h1>
        <div class="row wrap" style="gap:8px"><button class="btn" id="nf">${ic('plus', 16)} ${esc(T('Papka yaratish', 'Создать папку', 'New folder'))}</button>
          <button class="btn ghost ${trash ? 'on' : ''}" id="tr">${ic('trash', 16)} ${esc(T('Chiqitdon', 'Корзина', 'Trash'))}${tF.length + tI.length ? ` (${tF.length + tI.length})` : ''}</button></div></div>
      <div class="row mt wrap" style="gap:10px"><label class="searchbox grow">${ic('search', 16)}<input class="input" id="qs" type="search" placeholder="${esc(T('Material qidirish…', 'Поиск материала…', 'Search materials…'))}" value="${esc(term)}"></label></div>
      ${trash ? '' : `<div class="mat-cats mt">
        <button class="mat-cat all ${filter ? '' : 'on'}" data-c=""><b>${live.length}</b><span>${esc(T('Barchasi', 'Все', 'All'))}</span></button>
        ${Object.keys(CATS).map(c => `<div class="mat-cat ${CATS[c].cls} ${filter === c ? 'on' : ''}" data-c="${c}" data-drop="${c}"><button class="mc-main" data-c="${c}" aria-label="${esc(CATS[c].n())}">
          <span class="item-ic ${CATS[c].cls}">${ic(CATS[c].ic, 22)}</span><b>${esc(CATS[c].n())}</b><small>${cnt(c)} · ${esc(CATS[c].fm)}</small></button><button class="mc-add" data-add="${c}" aria-label="${esc(T('Qo\'shish', 'Добавить', 'Add'))} ${esc(CATS[c].n())}">${ic('plus', 18)}</button></div>`).join('')}</div>`}
      ${trash ? trashHtml(tF, tI) : `
      <div class="crumbs mt">${[`<a href="#/teach/materials" data-f="">${esc(state.isAdmin ? T('Barcha materiallar', 'Все материалы', 'All materials') : T('Papkalarim', 'Мои папки', 'My folders'))}</a>`, ...bc.map(f => `<a href="#/teach/materials?f=${f.id}" data-f="${f.id}">${esc(folderMenuTitle(f))}</a>`)].join(' <span class="muted">›</span> ')}</div>
      <label class="chk mt hidenew"><input type="checkbox" id="hn" ${hideNew ? 'checked' : ''}> ${esc(T('Yangi yuklanganlar talabalarga ko\'rinmasin (avval tayyorlab qo\'yaman, keyin ochaman)', 'Новые загрузки скрыть от студентов (подготовлю и открою позже)', 'Hide new uploads from students (prepare now, publish later)'))}</label>
      <div class="drop mt" id="dz"><div>${ic('download', 22)}<b>${esc(T('Fayllarni shu yerga tashlang', 'Перетащите файлы сюда', 'Drop files here'))}</b><small class="muted">${esc(T('yoki yuqoridagi kategoriyadagi + ni bosing. Hajm: ' + KB_LIMIT() + ' MB gacha', 'или нажмите + в категории выше. До ' + KB_LIMIT() + ' МБ', 'or press + on a category above. Up to ' + KB_LIMIT() + ' MB'))}</small></div></div>
      ${subF.length ? `<h4 class="mt">${esc(T('Papkalar', 'Папки', 'Folders'))}</h4><div class="mat-folders">${subF.map(f => { const n = live.filter(x => x.folder_id === f.id).length + liveF.filter(x => x.parent_id === f.id).length;
        return `<div class="mat-folder" data-ctx="f:${f.id}"><a href="#/teach/materials?f=${f.id}" data-f="${f.id}" class="grow row" style="gap:10px">${ic('folder', 22)}<b>${esc(folderMenuTitle(f))}</b>${f.visible === false ? ` <span class="tag bad">${esc(T('Yashirin', 'Скрыто', 'Hidden'))}</span>` : ''}<span class="muted">(${n})</span></a><button class="icon-btn" data-m="f:${f.id}" aria-label="menu">${ic('more')}</button></div>`; }).join('')}</div>` : ''}
      <h4 class="mt">${esc(filter ? CATS[filter].n() : T('Materiallar', 'Материалы', 'Materials'))} <span class="muted">(${its.length})</span></h4>
      ${its.length ? `<div class="tblwrap"><table class="tbl2 mat-tbl"><thead><tr><th>${esc(T('Nomi', 'Название', 'Name'))}</th><th class="hide-sm">${esc(T('Turi', 'Тип', 'Type'))}</th><th class="hide-sm">${esc(T('Hajmi', 'Размер', 'Size'))}</th><th class="hide-sm">${esc(T('Sana', 'Дата', 'Date'))}</th><th></th></tr></thead><tbody>
        ${its.map(x => `<tr data-ctx="i:${x.id}"><td><a class="row" style="gap:10px" href="#/item/${x.id}">${kindIc(x)}<span class="grow"><b>${esc(tr(x.title))}</b>${x.visible === false ? ` <span class="tag bad">${esc(T('Yashirin', 'Скрыто', 'Hidden'))}</span>` : ''}<br><small class="muted show-sm">${esc(catOfItem(x) ? CATS[catOfItem(x)].n() : x.kind)} · ${x.size_bytes ? esc(fmtSize(x.size_bytes)) + ' · ' : ''}${esc(fmtDate(x.created_at))}</small></span></a></td>
          <td class="hide-sm">${esc(catOfItem(x) ? CATS[catOfItem(x)].n() : x.kind)}</td><td class="hide-sm">${x.size_bytes ? esc(fmtSize(x.size_bytes)) : '—'}</td><td class="hide-sm">${esc(fmtDate(x.created_at))}</td>
          <td class="end"><button class="icon-btn" data-m="i:${x.id}" aria-label="menu">${ic('more')}</button></td></tr>`).join('')}</tbody></table></div>` : empty('folder', term || filter ? T('Hech narsa topilmadi', 'Ничего не найдено', 'Nothing found') : T('Bu papka bo\'sh. Yuqoridagi kategoriyadan + ni bosib material qo\'shing.', 'Папка пуста. Нажмите + в категории, чтобы добавить материал.', 'This folder is empty. Press + on a category to add material.'))}`}
    </div>`;
    bind();
  };

  const trashHtml = (tF, tI) => `<p class="muted mt">${esc(T('O\'chirilgan materiallar shu yerda saqlanadi. Tiklashingiz yoki butunlay o\'chirishingiz mumkin.', 'Удалённые материалы хранятся здесь. Их можно восстановить или удалить навсегда.', 'Deleted items are kept here. Restore them or delete permanently.'))}</p>
    ${(tF.length + tI.length) ? `<div class="tblwrap"><table class="tbl2"><tbody>${[...tF.map(f => ({ id: f.id, k: 'f', t: tr(f.title), ic: 'folder', at: f.deleted_at })), ...tI.map(x => ({ id: x.id, k: 'i', t: tr(x.title), ic: 'file', at: x.deleted_at }))].map(r =>
      `<tr><td><span class="row" style="gap:10px">${ic(r.ic, 18)}<b>${esc(r.t)}</b></span><br><small class="muted">${esc(fmtDate(r.at))}</small></td><td class="end"><button class="btn sm ghost" data-rs="${r.k}:${r.id}">${esc(T('Tiklash', 'Восстановить', 'Restore'))}</button> <button class="btn sm danger" data-pd="${r.k}:${r.id}">${esc(T('Butunlay o\'chirish', 'Удалить навсегда', 'Delete forever'))}</button></td></tr>`).join('')}</tbody></table></div>` : empty('trash', T('Chiqitdon bo\'sh', 'Корзина пуста', 'Trash is empty'))}`;

  // ---------- amallar
  const find = ref => { const [k, id] = ref.split(':'); return { k, id, o: (k === 'f' ? D.folders : D.items).find(x => x.id === id) }; };
  const reload = async () => { try { D = await load(); if (alive()) paint(); } catch (e) { el.innerHTML = `<div class="page">${errBox(dbErr(e))}</div>`; } };

  const rename = async ref => {
    const { k, id, o } = find(ref); const m = modal(`<h3>${esc(T('Nomini o\'zgartirish', 'Переименовать', 'Rename'))}</h3><form class="form" id="f"><input class="input" id="n" required maxlength="140" value="${esc(tr(o.title))}"><button class="btn lg block">${esc(T('Saqlash', 'Сохранить', 'Save'))}</button></form>`);
    $('#n', m.el).select(); $('#f', m.el).onsubmit = async e => { e.preventDefault(); const b = $('button', m.el); btnBusy(b, true); const v = $('#n', m.el).value.trim(); if (!v) return btnBusy(b, false);
      const { error } = await sb.from(k === 'f' ? 'folders' : 'items').update({ title: await i18nField(v, state.lang) }).eq('id', id); if (error) { btnBusy(b, false); return toast(dbErr(error), 'err'); } m.close(); toast(T('Saqlandi', 'Сохранено', 'Saved'), 'ok'); reload(); };
  };

  const info = async ref => {
    const { k, id, o } = find(ref); const m = modal(`<h3>${esc(T('Ma\'lumot', 'Информация', 'Info'))}</h3><div id="ib">${spinner()}</div>`);
    const [st, mg] = await Promise.all([k === 'i' ? sb.rpc('material_stats', { p_item: id }) : Promise.resolve({ data: null }), sb.from('material_groups').select('group_id,groups(name)').eq(k === 'f' ? 'folder_id' : 'item_id', id)]);
    const s = st.data || {}, gs = (mg.data || []).map(x => x.groups?.name).filter(Boolean);
    const row = (a, b) => `<div class="kv"><span class="muted">${esc(a)}</span><b>${b}</b></div>`;
    $('#ib', m.el).innerHTML = `${row(T('Nomi', 'Название', 'Name'), esc(tr(o.title)))}${k === 'i' ? row(T('Turi', 'Тип', 'Type'), esc(catOfItem(o) ? CATS[catOfItem(o)].n() : o.kind)) + row(T('Hajmi', 'Размер', 'Size'), o.size_bytes ? esc(fmtSize(o.size_bytes)) : '—') : ''}
      ${row(T('Yuklangan', 'Загружено', 'Uploaded'), esc(fmtDate(o.created_at)))}${row(T('Ko\'rinish', 'Видимость', 'Visibility'), gs.length ? esc(T('Faqat guruhlar: ', 'Только группы: ', 'Groups only: ') + gs.join(', ')) : esc(T('Umumiy', 'Общий', 'Public')))}
      ${k === 'i' ? row(T('Ko\'rganlar', 'Просмотрели', 'Viewers'), s.viewers ?? 0) + row(T('Ochilishlar', 'Открытий', 'Opens'), s.plays ?? 0) + row(T('Sarflangan vaqt', 'Затраченное время', 'Time spent'), Math.round((s.seconds || 0) / 60) + ' ' + T('daq', 'мин', 'min')) + (o.kind === 'test' ? row(T('Urinishlar', 'Попытки', 'Attempts'), (s.attempts ?? 0) + ' · ' + (s.avg_percent ?? 0) + '%') : '') : ''}`;
  };

  const move = async ref => {
    const { k, id, o } = find(ref); const lf = D.folders.filter(f => !f.deleted_at);
    const path = f => { const out = []; let c = f, n = 0; while (c && n++ < 12) { out.unshift(tr(c.title)); c = lf.find(x => x.id === c.parent_id); } return out.join(' / '); };
    const bad = new Set(); if (k === 'f') { const walk = i => { bad.add(i); lf.filter(x => x.parent_id === i).forEach(x => walk(x.id)); }; walk(id); }
    const opts = lf.filter(f => !bad.has(f.id)).map(f => ({ id: f.id, p: path(f) })).sort((a, b) => a.p.localeCompare(b.p));
    const m = modal(`<h3>${esc(T('Boshqa papkaga ko\'chirish', 'Переместить в папку', 'Move to folder'))}</h3><div class="stack">${k === 'f' ? `<button class="btn ghost block" data-to="">${ic('folder', 16)} ${esc(T('Papkalarim (bosh)', 'Мои папки (корень)', 'My folders (root)'))}</button>` : ''}${opts.map(f => `<button class="btn ghost block left" data-to="${f.id}" ${((k === 'i' ? o.folder_id : o.parent_id) === f.id) ? 'disabled' : ''}>${ic('folder', 16)} ${esc(f.p)}</button>`).join('') || `<p class="muted">${esc(T('Avval papka yarating', 'Сначала создайте папку', 'Create a folder first'))}</p>`}</div>`);
    $$('[data-to]', m.el).forEach(b => b.onclick = async () => { const to = b.dataset.to || null;
      const { error } = await sb.from(k === 'f' ? 'folders' : 'items').update(k === 'f' ? { parent_id: to } : { folder_id: to }).eq('id', id); if (error) return toast(dbErr(error), 'err'); m.close(); toast(T('Ko\'chirildi', 'Перемещено', 'Moved'), 'ok'); reload(); });
  };

  const assign = async ref => {
    const { k, id } = find(ref); const m = modal(`<h3>${esc(T('Guruhga biriktirish', 'Привязать к группам', 'Assign to groups'))}</h3><div id="gb">${spinner()}</div>`);
    const [gs, cur] = await Promise.all([myGroups(), sb.from('material_groups').select('group_id').eq(k === 'f' ? 'folder_id' : 'item_id', id)]);
    const sel = new Set((cur.data || []).map(x => x.group_id));
    $('#gb', m.el).innerHTML = gs.length ? `<p class="muted small">${esc(T('Tanlansa, material FAQAT shu guruh a\'zolariga ko\'rinadi. Hech narsa tanlanmasa — hamma uchun umumiy.', 'Если выбрать — материал увидят ТОЛЬКО участники этих групп. Если ничего — общий для всех.', 'If selected, only members of those groups can see it. If none selected, it is public.'))}</p>
      <div class="stack">${gs.map(g => `<label class="chk"><input type="checkbox" value="${g.id}" ${sel.has(g.id) ? 'checked' : ''}> ${esc(g.name)}</label>`).join('')}</div><button class="btn lg block mt" id="sv">${esc(T('Saqlash', 'Сохранить', 'Save'))}</button>`
      : `<p class="muted">${esc(T('Sizda hali guruh yo\'q.', 'У вас пока нет групп.', 'You have no groups yet.'))}</p><a class="btn" href="#/groups">${esc(T('Guruh yaratish', 'Создать группу', 'Create a group'))}</a>`;
    $('#sv', m.el)?.addEventListener('click', async e => { btnBusy(e.currentTarget, true); const ids = $$('input:checked', m.el).map(x => x.value);
      const { error } = await sb.rpc('assign_material_groups', { p_kind: k, p_id: id, p_groups: ids }); if (error) { btnBusy(e.currentTarget, false); return toast(dbErr(error), 'err'); } m.close(); toast(T('Saqlandi', 'Сохранено', 'Saved'), 'ok'); });
  };

  const toggleVis = async ref => {
    const { k, id, o } = find(ref); const to = o.visible === false;
    const { error } = await sb.from(k === 'f' ? 'folders' : 'items').update({ visible: to }).eq('id', id); if (error) return toast(dbErr(error), 'err');
    toast(to ? T('Endi hamma ko\'ra oladi', 'Теперь виден всем', 'Now visible') : T('Talabalarga ko\'rinmaydi', 'Скрыто от студентов', 'Hidden from students'), 'ok'); reload();
  };
  const toTrash = async ref => {
    const { k, id, o } = find(ref);
    if (!(await confirmDlg(T(`"${tr(o.title)}" o'chirilsinmi? U chiqitdonga tushadi, keyin tiklash mumkin.`, `Удалить «${tr(o.title)}»? Он попадёт в корзину, его можно восстановить.`, `Delete "${tr(o.title)}"? It goes to Trash and can be restored.`), T('O\'chirish', 'Удалить', 'Delete')))) return;
    const { error } = await sb.from(k === 'f' ? 'folders' : 'items').update({ deleted_at: new Date().toISOString() }).eq('id', id); if (error) return toast(dbErr(error), 'err'); toast(T('Chiqitdonga ko\'chirildi', 'Перемещено в корзину', 'Moved to Trash'), 'ok'); reload();
  };
  const restore = async ref => { const { k, id } = find(ref); const { error } = await sb.from(k === 'f' ? 'folders' : 'items').update({ deleted_at: null }).eq('id', id); if (error) return toast(dbErr(error), 'err'); toast(T('Tiklandi', 'Восстановлено', 'Restored'), 'ok'); reload(); };
  const purge = async ref => {
    const { k, id, o } = find(ref);
    if (!(await confirmDlg(T('Butunlay o\'chirilsinmi? Buni qaytarib bo\'lmaydi.', 'Удалить навсегда? Это нельзя отменить.', 'Delete permanently? This cannot be undone.'), T('Butunlay o\'chirish', 'Удалить навсегда', 'Delete forever')))) return;
    if (k === 'i' && o.storage_path) await sb.storage.from('content').remove([o.storage_path]).catch(() => { });
    const { error } = await sb.from(k === 'f' ? 'folders' : 'items').delete().eq('id', id); if (error) return toast(dbErr(error), 'err'); reload();
  };

  const menu = ref => {
    const { k, o } = find(ref); if (!o) return;
    const acts = [['edit', T('Nomini tahrirlash', 'Переименовать', 'Rename'), rename], ['users', T('Guruhga biriktirish', 'Привязать к группе', 'Assign to group'), assign],
      ['folder', T('Boshqa papkaga ko\'chirish', 'Переместить', 'Move'), move], ...(k === 'i' && o.kind === 'test' ? [['users', T('Kim yechdi', 'Кто решал', 'Who took it'), r => takersModal(find(r).o)]] : []), [o.visible === false ? 'eye' : 'x', o.visible === false ? T('Ko\'rinadigan qilish', 'Сделать видимым', 'Make visible') : T('Ko\'rinmas qilish (yashirish)', 'Скрыть от студентов', 'Hide from students'), toggleVis], ['help', T('Fayl ma\'lumoti', 'Информация', 'Info'), info]];
    const m = modal(`<h3 class="trunc">${esc(tr(o.title))}</h3><div class="stack actmenu">${k === 'i' ? `<a class="btn ghost block left" href="#/item/${o.id}" id="op">${ic('eye', 16)} ${esc(T('Ochish', 'Открыть', 'Open'))}</a>` : ''}
      ${acts.map(([i, l], n) => `<button class="btn ghost block left" data-a="${n}">${ic(i, 16)} ${esc(l)}</button>`).join('')}<button class="btn ghost block left dg" data-a="del">${ic('trash', 16)} ${esc(T('O\'chirish', 'Удалить', 'Delete'))}</button></div>`);
    $('#op', m.el)?.addEventListener('click', () => m.close());
    $$('[data-a]', m.el).forEach(b => b.onclick = () => { m.close(); b.dataset.a === 'del' ? toTrash(ref) : acts[+b.dataset.a][2](ref); });
  };

  const newFolder = async () => {
    const m = modal(`<h3>${esc(T('Yangi papka', 'Новая папка', 'New folder'))}</h3><form class="form" id="f"><label class="fld"><span>${esc(T('Papka nomi', 'Название папки', 'Folder name'))}</span><input class="input" id="n" required maxlength="120" placeholder="${esc(T('Masalan: Genetika', 'Например: Генетика', 'e.g. Genetics'))}"></label>
      <div class="row end"><button type="button" class="btn ghost" data-c>${esc(T('Bekor qilish', 'Отмена', 'Cancel'))}</button><button class="btn">${esc(T('Yaratish', 'Создать', 'Create'))}</button></div></form>`);
    $('#n', m.el).focus(); $('[data-c]', m.el).onclick = () => m.close();
    $('#f', m.el).onsubmit = async e => { e.preventDefault(); const b = $('.btn:not(.ghost)', m.el); btnBusy(b, true); const v = $('#n', m.el).value.trim(); if (!v) return btnBusy(b, false);
      const { error } = await sb.from('folders').insert({ parent_id: fid, title: await i18nField(v, state.lang), description: {}, visible: true, price: 0, created_by: uid }); if (error) { btnBusy(b, false); return toast(dbErr(error), 'err'); } m.close(); reload(); };
  };

  // ---------- yuklash
  const ensureFolder = async () => {
    if (fid) return fid;
    let f = D.folders.find(x => !x.deleted_at && !x.parent_id && tr(x.title) === T('Umumiy', 'Общее', 'General'));
    if (f) { fid = f.id; return fid; }
    const { data, error } = await sb.from('folders').insert({ parent_id: null, title: await i18nField(T('Umumiy', 'Общее', 'General'), state.lang), description: {}, visible: true, price: 0, created_by: uid }).select('id').single();
    if (error) throw error; fid = data.id; return fid;
  };
  const uploadFiles = async (files, forced) => {
    if (busyUp) return toast(T('Oldingi yuklash tugashini kuting', 'Дождитесь окончания загрузки', 'Wait for the current upload'), 'err');
    const list = [...files]; if (!list.length) return; busyUp = true;
    const m = modal(`<h3>${esc(T('Yuklanmoqda', 'Загрузка', 'Uploading'))}</h3><div class="stack" id="ul">${list.map((f, i) => `<div class="uprow" data-u="${i}"><span class="grow trunc">${esc(f.name)}</span><small class="muted">${esc(fmtSize(f.size))}</small><span class="us muted">…</span></div>`).join('')}</div><div class="row end mt"><button class="btn" id="ud" hidden>${esc(T('Tayyor', 'Готово', 'Done'))}</button></div>`, { onClose: () => { busyUp = false; reload(); } });
    const st = (i, txt, cls) => { const r = $(`[data-u="${i}"] .us`, m.el); if (r) { r.textContent = txt; r.className = 'us ' + (cls || 'muted'); } };
    let target; try { target = await ensureFolder(); } catch (e) { m.close(); busyUp = false; return toast(dbErr(e), 'err'); }
    for (let i = 0; i < list.length; i++) {
      const f = list[i], e = ext(f.name);
      try {
        if (BLOCK.test(e)) throw new Error(T('Xavfli fayl turi', 'Опасный тип файла', 'Unsafe file type'));
        const kind = EXT_KIND[e]; if (!kind) throw new Error(T('Bu format qo\'llab-quvvatlanmaydi', 'Формат не поддерживается', 'Unsupported format'));
        const k2 = forced && CATS[forced].kinds.includes(kind) ? kind : forced ? (() => { throw new Error(T(`${CATS[forced].n()} bo'limiga mos emas (.${e})`, `Не подходит для раздела «${CATS[forced].n()}» (.${e})`, `Not valid for ${CATS[forced].n()} (.${e})`)); })() : kind;
        if (f.size > KB_LIMIT() * 1048576) throw new Error(T(`Fayl ${KB_LIMIT()} MB dan katta`, `Файл больше ${KB_LIMIT()} МБ`, `File exceeds ${KB_LIMIT()} MB`));
        if (f.size < 16) throw new Error(T('Fayl bo\'sh', 'Файл пуст', 'File is empty'));
        const bad = await sniff(f); if (bad) throw new Error(T('Fayl ichidagi tur kengaytmaga mos emas (buzilgan yoki soxta fayl)', 'Содержимое не соответствует расширению (повреждён или подделан)', 'File content does not match its extension (corrupt or fake)'));
        const meta = {}; if (k2 === 'video' || k2 === 'audio') { const pr = await probeMedia(f, k2); if (!pr.ok) throw new Error(T('Brauzer bu faylni ocha olmaydi. MP4/MP3 ga o\'tkazing', 'Браузер не может открыть файл. Конвертируйте в MP4/MP3', 'The browser cannot open this file. Convert to MP4/MP3')); meta.duration = pr.d; if (k2 === 'video') { meta.width = pr.w; meta.height = pr.h; } }
        st(i, T('yuklanmoqda…', 'загрузка…', 'uploading…'));
        const id = crypto.randomUUID(), path = `${id}/${safeName(f.name)}`; await upload('content', path, f, { contentType: mimeOf(f) });
        const { error } = await sb.from('items').insert({ id, folder_id: target, kind: k2, title: await i18nField(f.name.replace(/\.[^.]+$/, ''), state.lang), description: {}, visible: !hideNew, source: 'storage', storage_path: path, size_bytes: f.size, meta, created_by: uid });
        if (error) { await sb.storage.from('content').remove([path]).catch(() => { }); throw error; }
        st(i, '✓', 'ok');
      } catch (err) { st(i, '✗ ' + (err?.message || String(err)).slice(0, 90), 'err'); }
    }
    const d = $('#ud', m.el); d.hidden = false; d.onclick = () => m.close();
  };
  const pickFiles = cat => {
    if (cat === 'test') return ensureFolder().then(f => testImportModal({ folderId: f, onDone: reload })).catch(e => toast(dbErr(e), 'err'));
    const go2 = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = CATS[cat].acc; inp.onchange = () => uploadFiles(inp.files, cat); inp.click(); };
    if (cat !== 'video') return go2();
    const m = modal(`<h3>${esc(T('Video qo\'shish', 'Добавить видео', 'Add video'))}</h3><div class="stack"><button class="btn lg block" id="f1">${ic('video', 18)} ${esc(T('Telefon/kompyuterdan fayl', 'Файл с телефона/компьютера', 'File from device'))}</button>
      <form class="form" id="yf"><label class="fld"><span>${esc(T('yoki YouTube havolasi', 'или ссылка YouTube', 'or YouTube link'))}</span><input class="input" id="yu" placeholder="https://youtu.be/…"></label><button class="btn ghost block">${esc(T('Havolani qo\'shish', 'Добавить ссылку', 'Add link'))}</button></form></div>`);
    $('#f1', m.el).onclick = () => { m.close(); go2(); };
    $('#yf', m.el).onsubmit = async e => { e.preventDefault(); const y = ytId($('#yu', m.el).value); if (!y) return toast(T('YouTube havolasi noto\'g\'ri', 'Неверная ссылка YouTube', 'Invalid YouTube link'), 'err');
      try { const f = await ensureFolder(); const { error } = await sb.from('items').insert({ folder_id: f, kind: 'video', title: await i18nField('YouTube ' + y, state.lang), description: {}, visible: !hideNew, source: 'youtube', youtube_id: y, created_by: uid }); if (error) throw error; m.close(); reload(); } catch (x) { toast(dbErr(x), 'err'); } };
  };

  const bind = () => {
    const hn = $('#hn', el); if (hn) hn.onchange = () => { hideNew = hn.checked; };
    $('#nf', el).onclick = newFolder; $('#tr', el).onclick = () => { trash = !trash; paint(); };
    const qs = $('#qs', el); qs.oninput = () => { term = qs.value.trim().toLowerCase(); clearTimeout(qs._t); qs._t = setTimeout(() => { paint(); const n = $('#qs', el); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 180); };
    $$('.mc-main,.mat-cat.all', el).forEach(b => b.onclick = () => { filter = filter === b.dataset.c ? '' : (b.dataset.c || ''); paint(); });
    $$('[data-add]', el).forEach(b => b.onclick = e => { e.stopPropagation(); pickFiles(b.dataset.add); });
    $$('[data-f]', el).forEach(a => a.onclick = e => { e.preventDefault(); fid = a.dataset.f || null; term = ''; history.replaceState(null, '', '#/teach/materials' + (fid ? '?f=' + fid : '')); paint(); });
    $$('[data-m]', el).forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); menu(b.dataset.m); });
    $$('[data-rs]', el).forEach(b => b.onclick = () => restore(b.dataset.rs)); $$('[data-pd]', el).forEach(b => b.onclick = () => purge(b.dataset.pd));
    // kontekst menyu (kompyuter) va uzoq bosish (telefon)
    $$('[data-ctx]', el).forEach(r => {
      r.oncontextmenu = e => { e.preventDefault(); menu(r.dataset.ctx); };
      let tm, sx, sy; r.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; tm = setTimeout(() => { navigator.vibrate?.(15); menu(r.dataset.ctx); }, 550); }, { passive: true });
      r.addEventListener('touchmove', e => { if (Math.abs(e.touches[0].clientX - sx) > 8 || Math.abs(e.touches[0].clientY - sy) > 8) clearTimeout(tm); }, { passive: true });
      ['touchend', 'touchcancel'].forEach(ev => r.addEventListener(ev, () => clearTimeout(tm)));
    });
    // drag & drop
    const dz = $('#dz', el), over = (n, on) => n?.classList.toggle('over', on);
    const prev = e => { e.preventDefault(); e.stopPropagation(); };
    [dz, ...$$('[data-drop]', el)].filter(Boolean).forEach(n => { ['dragenter', 'dragover'].forEach(ev => n.addEventListener(ev, e => { prev(e); over(n, true); })); n.addEventListener('dragleave', e => { prev(e); over(n, false); });
      n.addEventListener('drop', e => { prev(e); over(n, false); const fs = e.dataTransfer?.files; if (fs?.length) uploadFiles(fs, n.dataset.drop || null); }); });
  };

  el.innerHTML = `<div class="page">${skeleton(4, 80)}</div>`;
  try { D = await load(); } catch (e) { if (alive()) el.innerHTML = `<div class="page">${errBox(dbErr(e))}</div>`; return; }
  if (alive()) paint();
}, { auth: true });
