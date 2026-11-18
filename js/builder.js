// Kurs quruvchisi: yaratish ustasi, bob/mavzu tuzilmasi, har mavzuga 5 ta yuklash joyi (R2), papka yuklash, sozlamalar, ruxsatlar.
import { sb, state, tr, route, go, esc, ic, $, $$, modal, toast, btnBusy, confirmDlg } from './core.js';
import { T, skeleton, empty, errBox, bar, dbErr } from './ui.js';
import { r2Upload, r2Delete } from './r2.js';
import { parseQuestions } from './testparse.js';

const U = s => ({ uz: s, ru: s, en: s });
const staffOnly = () => state.profile?.role === 'teacher' || state.isAdmin;
const nat = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
const ytId = s => { const m = String(s || '').trim().match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || String(s || '').trim().match(/^([\w-]{11})$/); return m ? m[1] : null; };
const ext = n => (String(n).split('.').pop() || '').toLowerCase();
const stem = n => String(n).replace(/\.[^.]+$/, '');

const SLOTS = {
  book: { i: 0, lab: () => T('Kitob', 'Книга', 'Book'), kinds: ['document', 'text'], accept: '.pdf,.md,.txt', xp: 10, hint: () => T('PDF (tavsiya) yoki .md/.txt matn fayl', 'PDF (рекомендуется) или .md/.txt', 'PDF (recommended) or .md/.txt') },
  slides: { i: 1, lab: () => T('Taqdimot', 'Презентация', 'Slides'), kinds: ['slides'], accept: '.pdf', xp: 10, hint: () => T('PDF fayl (PowerPoint\'dan "PDF sifatida saqlang")', 'PDF (в PowerPoint «Сохранить как PDF»)', 'PDF (PowerPoint → Save as PDF)') },
  video: { i: 2, lab: () => T('Video', 'Видео', 'Video'), kinds: ['video'], accept: 'video/*,.mp4,.webm,.mov,.m4v', xp: 10, link: true, hint: () => T('Video fayl yoki YouTube havolasi', 'Видеофайл или ссылка YouTube', 'Video file or YouTube link') },
  cards: { i: 3, lab: () => T('Kartochkalar', 'Карточки', 'Cards'), kinds: ['cards'], accept: '.csv,.tsv,.txt', xp: 15, hint: () => T('CSV/TXT: «termin;ta\'rif» yoki «tf;termin;ta\'rif;ha|yo\'q»', 'CSV/TXT: «термин;определение» или «tf;термин;определение;да|нет»', 'CSV/TXT: "term;definition" or "tf;term;definition;yes|no"') },
  test: { i: 4, lab: () => T('Test', 'Тест', 'Test'), kinds: ['test'], accept: '.txt,.md,.csv', xp: 25, hint: () => T('TXT fayl: 1. savol, keyin variantlar (birinchisi to\'g\'ri)', 'TXT: 1. вопрос, затем варианты (первый верный)', 'TXT: 1. question, then options (first is correct)') },
};
const slotOfKind = k => Object.keys(SLOTS).find(s => SLOTS[s].kinds.includes(k));

export function parseCards(text) {
  const out = [];
  for (const raw of String(text || '').replace(/\r/g, '').split('\n')) {
    const line = raw.trim(); if (!line || line.startsWith('#')) continue;
    const sep = line.includes('\t') ? '\t' : line.includes(';') ? ';' : line.includes('|') ? '|' : ',';
    const p = line.split(sep).map(x => x.trim()), k = p[0].toLowerCase();
    if (k === 'tf' && p.length >= 4) out.push(['tf', p[1], p[2], /^(ha|true|1|yes|da|\+|to'g'ri|togri)$/i.test(p[3])]);
    else if ((k === 'yoz' || k === 'type') && p.length >= 3) out.push(['type', p[1], p[2], (p[3] || '').split(/[,/]/).map(s => s.trim()).filter(Boolean)]);
    else if (p.length >= 2 && !(/^(termin|term|термин)$/i.test(p[0]) && /^(ta['’‘`]?rif|tarif|izoh|definition|определение)$/i.test(p[1]))) out.push(['type', p[1], p[0], []]);
  }
  return out;
}

route('/teach/build/:id', async ({ el, params, alive }) => {
  if (!staffOnly()) return go('/teach', true);
  const id = params.id; el.innerHTML = `<div class="page">${skeleton(3, 100)}</div>`;
  let c, chs, secs, ls, bodies, tab = 'struct', grants = [];
  const load = async () => {
    const [a, b, d, e, f] = await Promise.all([sb.from('courses').select('*').eq('id', id).maybeSingle(), sb.from('course_chapters').select('*').eq('course_id', id).order('position'),
      sb.from('course_sections').select('*').eq('course_id', id).order('position'), sb.from('lessons').select('id,section_id,kind,title,item_id,position').eq('course_id', id).order('position'),
      sb.from('lesson_bodies').select('lesson_id,youtube_id,body')]);
    c = a.data; chs = b.data || []; secs = d.data || []; ls = e.data || []; bodies = Object.fromEntries((f.data || []).map(x => [x.lesson_id, x]));
  };
  await load(); if (!alive()) return; if (!c) return go('/teach', true);
  const lessonOf = (s, slot) => ls.find(l => l.section_id === s.id && SLOTS[slot].kinds.includes(l.kind));
  const stateOf = l => { if (!l) return null; const b = bodies[l.id]; return b?.youtube_id ? 'YouTube' : (b?.body || '').startsWith('r2:') ? 'R2' : l.kind === 'test' ? 'test' : 'matn'; };

  // ---------- yozish amallari ----------
  const delSlotAssets = async l => { if (!l) return; const b = bodies[l.id]; if (b?.body?.startsWith('r2:')) r2Delete(b.body.slice(3)).catch(() => {}); if (l.item_id) await sb.from('items').delete().eq('id', l.item_id); };
  async function setSlot(sec, slot, input, onP) {
    const cfg = SLOTS[slot], old = lessonOf(sec, slot), base = tr(sec.title);
    let kind, body = '', yt = null, item = null, lab = cfg.lab();
    if (input.link) { yt = ytId(input.link); if (!yt) throw new Error(T('YouTube havolasi noto\'g\'ri', 'Неверная ссылка YouTube', 'Invalid YouTube link')); kind = 'video'; }
    else {
      const f = input.file, e = ext(f.name);
      if (slot === 'book') { if (e === 'pdf') { const r = await r2Upload(f, onP); kind = 'document'; body = 'r2:' + r.key; } else if (['md', 'txt'].includes(e)) { kind = 'text'; body = await f.text(); } else throw new Error(T('Kitob: PDF, .md yoki .txt kerak', 'Книга: нужен PDF, .md или .txt', 'Book: PDF, .md or .txt required')); }
      else if (slot === 'slides') { if (e !== 'pdf') throw new Error(T('Taqdimot PDF bo\'lishi kerak (PowerPoint → PDF qilib saqlang)', 'Презентация должна быть PDF', 'Slides must be a PDF')); const r = await r2Upload(f, onP); kind = 'slides'; body = 'r2:' + r.key; }
      else if (slot === 'video') { const r = await r2Upload(f, onP); kind = 'video'; body = 'r2:' + r.key; }
      else if (slot === 'cards') { const cs = parseCards(await f.text()); if (!cs.length) throw new Error(T('Kartochka topilmadi — fayl formatini tekshiring', 'Карточки не найдены', 'No cards found')); kind = 'cards'; body = JSON.stringify(cs); }
      else if (slot === 'test') {
        const r = parseQuestions(await f.text()); if (!r.questions.length) throw new Error(T('Savol topilmadi — fayl formatini tekshiring', 'Вопросы не найдены', 'No questions found'));
        const { data: it, error } = await sb.from('items').insert({ folder_id: null, kind: 'test', visible: false, title: U(`${base} – test`), created_by: state.user.id }).select('id').single(); if (error) throw error; item = it.id;
        const rows = r.questions.map((q, i) => ({ item_id: item, position: i, chapter: q.chapter || base, question: q.question, correct: q.correct, wrong: q.wrong, explanation: q.explanation || null }));
        for (let i = 0; i < rows.length; i += 200) { const { error: e2 } = await sb.from('questions').insert(rows.slice(i, i + 200)); if (e2) { await sb.from('items').delete().eq('id', item); throw e2; } }
        kind = 'test';
      }
    }
    const xp = sec.kind === 'final' ? 40 : cfg.xp, row = { kind, title: U(`${lab}: ${base}`), item_id: item, xp, position: cfg.i };
    let lid;
    if (old) { const { error } = await sb.from('lessons').update(row).eq('id', old.id); if (error) throw error; lid = old.id; }
    else { const { data, error } = await sb.from('lessons').insert({ ...row, course_id: id, section_id: sec.id }).select('id').single(); if (error) throw error; lid = data.id; }
    const { error: eb } = await sb.from('lesson_bodies').upsert({ lesson_id: lid, body, youtube_id: yt }); if (eb) throw eb;
    if (old) await delSlotAssets(old);
    return lid;
  }
  const delSlot = async (sec, slot) => { const l = lessonOf(sec, slot); if (!l) return; const { error } = await sb.from('lessons').delete().eq('id', l.id); if (error) throw error; await delSlotAssets(l); };

  async function build(counts) {
    let { data: base } = await sb.from('course_sections').select('position').eq('course_id', id).order('position', { ascending: false }).limit(1); let pos = (base?.[0]?.position ?? -1) + 1;
    const { count: tc } = await sb.from('course_sections').select('*', { count: 'exact', head: true }).eq('course_id', id).eq('kind', 'topic'); let n = tc || 0;
    const { count: cc } = await sb.from('course_chapters').select('*', { count: 'exact', head: true }).eq('course_id', id); let ci = cc || 0;
    for (const k of counts) {
      ci++; const { data: ch, error } = await sb.from('course_chapters').insert({ course_id: id, title: U(`${ci}-bob`), position: ci - 1 }).select('id').single(); if (error) throw error;
      const rows = [];
      for (let t = 0; t < k; t++) { n++; rows.push({ course_id: id, chapter_id: ch.id, kind: 'topic', title: U(`${n}-mavzu`), position: pos++ }); if (n >= 2) rows.push({ course_id: id, chapter_id: ch.id, kind: 'review', title: U(`Takrorlash: ${n - 1}-mavzu va ${n}-mavzu`), position: pos++ }); }
      rows.push({ course_id: id, chapter_id: ch.id, kind: 'final', title: U(`${ci}-bob yakuniy testi`), position: pos++ });
      const { error: e2 } = await sb.from('course_sections').insert(rows); if (e2) throw e2;
    }
  }

  // ---------- chizish ----------
  const tabs = () => `<div class="chips mb">${[['struct', T('Tuzilma', 'Структура', 'Structure')], ['import', T('Papka yuklash', 'Загрузка папки', 'Folder upload')], ['settings', T('Sozlamalar', 'Настройки', 'Settings')], ['access', T('Ruxsatlar', 'Доступ', 'Access')]].map(([k, l]) => `<button class="chip btnchip ${tab === k ? 'on' : ''}" data-tab="${k}">${esc(l)}</button>`).join('')}</div>`;
  const paint = async () => {
    el.innerHTML = `<div class="page"><div class="row"><a class="btn ghost sm" href="#/teach">${ic('back')}</a><div class="grow"><small class="muted">${esc(T('Kurs quruvchisi', 'Конструктор курса', 'Course builder'))}</small><h2 class="mb0">${esc(tr(c.title))}</h2></div><a class="btn sm" href="#/course/${id}">${ic('eye', 14)} ${esc(T('Ko\'rish', 'Посмотреть', 'Preview'))}</a></div>
      <div class="mt">${tabs()}</div><div id="tb"></div></div>`;
    $$('[data-tab]', el).forEach(b => b.onclick = () => { tab = b.dataset.tab; paint(); });
    ({ struct: pStruct, import: pImport, settings: pSettings, access: pAccess })[tab]($('#tb', el));
  };
  const reload = async () => { await load(); if (alive()) paint(); };
  const run = async (btn, fn) => { btnBusy(btn, true); try { await fn(); } catch (e) { toast(dbErr(e), 'err'); } btnBusy(btn, false); };

  // --- Tuzilma ---
  function pStruct(host) {
    if (!chs.length) {
      host.innerHTML = `<div class="card pad form"><h3>${esc(T('Kurs tuzilmasini yaratish', 'Создать структуру курса', 'Create the course structure'))}</h3><p class="muted small">${esc(T('Nechta bob bo\'lishini va har bobda nechta mavzu borligini kiriting. Papkalar, takrorlash va yakuniy test joylari avtomatik ochiladi.', 'Укажите число глав и тем в каждой. Папки, повторения и итоговые тесты создадутся автоматически.', 'Enter the number of chapters and topics per chapter. Folders, review tests and final tests are created automatically.'))}</p>
        <label class="fld"><span>${esc(T('Boblar soni', 'Число глав', 'Chapters'))}</span><input class="input" id="nch" type="number" min="1" max="30" value="3"></label><div id="cnt"></div>
        <button class="btn lg block mt" id="mk">${esc(T('Tuzilmani yaratish', 'Создать', 'Create'))}</button><p class="muted small center mt">${esc(T('Yoki tayyor papkani «Papka yuklash» bo\'limidan yuklang.', 'Или загрузите готовую папку во вкладке «Загрузка папки».', 'Or upload a ready folder in the "Folder upload" tab.'))}</p></div>`;
      const draw = () => { const n = Math.max(1, Math.min(30, +$('#nch', host).value || 1)); $('#cnt', host).innerHTML = Array.from({ length: n }, (_, i) => `<label class="fld"><span>${i + 1}-${esc(T('bobda mavzular soni', 'глава: число тем', 'chapter: topics'))}</span><input class="input cn" type="number" min="1" max="100" value="${$$('.cn', host)[i]?.value || 4}"></label>`).join(''); };
      $('#nch', host).oninput = draw; draw();
      $('#mk', host).onclick = e => run(e.currentTarget, async () => { await build($$('.cn', host).map(x => Math.max(1, +x.value || 1))); toast(T('Tuzilma yaratildi', 'Структура создана', 'Structure created'), 'ok'); await reload(); });
      return;
    }
    host.innerHTML = `<div class="row mb" style="gap:8px;flex-wrap:wrap"><button class="btn sm" id="ac">${ic('plus', 14)} ${esc(T('Bob qo\'shish', 'Добавить главу', 'Add chapter'))}</button></div>
      ${chs.map((ch, ci) => { const ss = secs.filter(s => s.chapter_id === ch.id); return `<div class="card pad mb bd-ch" data-ch="${ch.id}"><div class="row"><b class="grow">${ci + 1}-${esc(T('bob', 'глава', 'chapter'))}</b><button class="btn ghost sm" data-cover="${ch.id}">${ic('image', 14)} ${esc(T('Rasm', 'Обложка', 'Cover'))}${ch.cover ? ' ✓' : ''}</button><button class="btn ghost sm" data-addt="${ch.id}">${ic('plus', 14)} ${esc(T('Mavzu', 'Тема', 'Topic'))}</button><button class="btn ghost sm" data-delch="${ch.id}">${ic('trash', 14)}</button></div>
        <input class="input bd-t" data-rn-ch="${ch.id}" value="${esc(tr(ch.title))}">
        ${ss.map(s => `<div class="bd-sec ${s.kind}"><div class="row"><span class="bd-k">${s.kind === 'topic' ? '📘' : s.kind === 'review' ? '🔁' : '🏆'}</span><input class="input bd-t grow" data-rn="${s.id}" value="${esc(tr(s.title))}"><button class="btn ghost sm" data-dels="${s.id}">${ic('trash', 14)}</button></div>
          <div class="bd-slots">${(s.kind === 'topic' ? ['book', 'slides', 'video', 'cards', 'test'] : ['test']).map(k => { const st = stateOf(lessonOf(s, k)); return `<button class="bd-slot ${st ? 'ok' : ''}" data-slot="${s.id}:${k}">${esc(SLOTS[k].lab())}<small>${st ? '✓ ' + esc(st) : esc(T('yuklash', 'загрузить', 'upload'))}</small></button>`; }).join('')}</div></div>`).join('')}</div>`; }).join('')}`;
    $('#ac', host).onclick = e => run(e.currentTarget, async () => { await build([1]); await reload(); });
    $$('[data-rn]', host).forEach(i => i.onchange = async () => { const { error } = await sb.from('course_sections').update({ title: U(i.value.trim() || '—') }).eq('id', i.dataset.rn); toast(error ? dbErr(error) : T('Saqlandi', 'Сохранено', 'Saved'), error ? 'err' : 'ok'); });
    $$('[data-rn-ch]', host).forEach(i => i.onchange = async () => { const { error } = await sb.from('course_chapters').update({ title: U(i.value.trim() || '—') }).eq('id', i.dataset.rnCh); toast(error ? dbErr(error) : T('Saqlandi', 'Сохранено', 'Saved'), error ? 'err' : 'ok'); });
    $$('[data-dels]', host).forEach(b => b.onclick = async () => { if (!await confirmDlg(T('Bu bo\'lim va ichidagi darslar o\'chadi. Davom etasizmi?', 'Раздел и его уроки будут удалены. Продолжить?', 'This section and its lessons will be deleted. Continue?'))) return; const s = secs.find(x => x.id === b.dataset.dels); for (const l of ls.filter(x => x.section_id === s.id)) { await sb.from('lessons').delete().eq('id', l.id); await delSlotAssets(l); } await sb.from('course_sections').delete().eq('id', s.id); reload(); });
    $$('[data-delch]', host).forEach(b => b.onclick = async () => { if (!await confirmDlg(T('Butun bob (mavzular, fayllar bilan) o\'chadi. Davom etasizmi?', 'Глава целиком будет удалена. Продолжить?', 'The whole chapter will be deleted. Continue?'))) return; const ss = secs.filter(s => s.chapter_id === b.dataset.delch); for (const s of ss) { for (const l of ls.filter(x => x.section_id === s.id)) { await sb.from('lessons').delete().eq('id', l.id); await delSlotAssets(l); } await sb.from('course_sections').delete().eq('id', s.id); } await sb.from('course_chapters').delete().eq('id', b.dataset.delch); reload(); });
    $$('[data-addt]', host).forEach(b => b.onclick = e => run(e.currentTarget, async () => {
      const ch = chs.find(x => x.id === b.dataset.addt), ss = secs.filter(s => s.chapter_id === ch.id), fin = ss.find(s => s.kind === 'final'), nT = secs.filter(s => s.kind === 'topic').length + 1;
      // yangi mavzu yakuniy testdan oldin turishi uchun tartib raqamlarini qayta yozamiz
      const order = secs.slice(); const at = fin ? order.indexOf(fin) : order.indexOf(ss[ss.length - 1]) + 1; const add = [{ kind: 'topic', title: U(`${nT}-mavzu`) }]; if (nT >= 2) add.push({ kind: 'review', title: U(`Takrorlash: ${nT - 1}-mavzu va ${nT}-mavzu`) });
      const ins = []; for (const a of add) { const { data, error } = await sb.from('course_sections').insert({ course_id: id, chapter_id: ch.id, kind: a.kind, title: a.title, position: 9999 + ins.length }).select('*').single(); if (error) throw error; ins.push(data); }
      order.splice(at < 0 ? order.length : at, 0, ...ins); for (let i = 0; i < order.length; i++) if (order[i].position !== i) await sb.from('course_sections').update({ position: i }).eq('id', order[i].id); await reload(); }));
    $$('[data-cover]', host).forEach(b => b.onclick = () => pickFile('image/*', async f => { const { key } = await r2Upload(f); const old = chs.find(x => x.id === b.dataset.cover)?.cover; const { error } = await sb.from('course_chapters').update({ cover: 'r2:' + key }).eq('id', b.dataset.cover); if (error) throw error; if (old?.startsWith('r2:')) r2Delete(old.slice(3)).catch(() => {}); toast(T('Rasm yuklandi', 'Обложка загружена', 'Cover uploaded'), 'ok'); reload(); }));
    $$('[data-slot]', host).forEach(b => b.onclick = () => { const [sid, k] = b.dataset.slot.split(':'); slotModal(secs.find(x => x.id === sid), k); });
  }
  function pickFile(accept, fn) { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.onchange = async () => { if (i.files[0]) try { await fn(i.files[0]); } catch (e) { toast(dbErr(e), 'err'); } }; i.click(); }
  function slotModal(s, k) {
    const cfg = SLOTS[k], l = lessonOf(s, k), b = l && bodies[l.id];
    const m = modal(`<h3>${esc(cfg.lab())} · ${esc(tr(s.title))}</h3><p class="muted small">${esc(cfg.hint())}</p>
      ${l ? `<p class="chip">${esc(T('Hozir:', 'Сейчас:', 'Now:'))} ${esc(stateOf(l))}${b?.youtube_id ? ' · youtu.be/' + esc(b.youtube_id) : ''}</p>` : ''}
      <div class="bd-prog" id="pg" hidden>${bar(0)}<small class="muted" id="pt"></small></div>
      <button class="btn block" id="up">${ic('plus', 16)} ${esc(l ? T('Almashtirish (fayl tanlash)', 'Заменить (выбрать файл)', 'Replace (choose file)') : T('Fayl tanlash va yuklash', 'Выбрать файл и загрузить', 'Choose a file and upload'))}</button>
      ${cfg.link ? `<label class="fld mt"><span>${esc(T('yoki YouTube havolasi', 'или ссылка YouTube', 'or YouTube link'))}</span><input class="input" id="yl" placeholder="https://youtu.be/…"></label><button class="btn ghost block" id="ys">${esc(T('Havolani saqlash', 'Сохранить ссылку', 'Save link'))}</button>` : ''}
      ${l ? `<button class="btn ghost block mt" id="rm" style="color:var(--danger,#d33)">${ic('trash', 16)} ${esc(T('O\'chirish', 'Удалить', 'Delete'))}</button>` : ''}`);
    const prog = f => { $('#pg', m.el).hidden = false; $('.pbar i', m.el).style.width = Math.round(f * 100) + '%'; $('#pt', m.el).textContent = Math.round(f * 100) + '%'; };
    const done = () => { m.close(); toast(T('Saqlandi', 'Сохранено', 'Saved'), 'ok'); reload(); };
    $('#up', m.el).onclick = () => pickFile(cfg.accept, async f => { btnBusy($('#up', m.el), true); try { await setSlot(s, k, { file: f }, prog); done(); } catch (e) { btnBusy($('#up', m.el), false); throw e; } });
    $('#ys', m.el)?.addEventListener('click', e => run(e.currentTarget, async () => { await setSlot(s, k, { link: $('#yl', m.el).value }); done(); }));
    $('#rm', m.el)?.addEventListener('click', e => run(e.currentTarget, async () => { await delSlot(s, k); done(); }));
  }

  // --- Papka yuklash ---
  const slotName = n => { const s = stem(n).toLowerCase(); return /takror|review|povtor/.test(s) ? 'review' : /yakuniy|final/.test(s) ? 'final' : /kitob|book/.test(s) ? 'book' : /taqdimot|slayd|slide|present/.test(s) ? 'slides' : /video/.test(s) ? 'video' : /kartochka|karta|cards?/.test(s) ? 'cards' : /test/.test(s) ? 'test' : null; };
  function planOf(files) {
    const root = { json: null, chapters: new Map(), warn: [] };
    for (const f of files) {
      const p = f.webkitRelativePath.split('/').slice(1); if (!p.length) continue;
      if (p.length === 1) { if (/^course\.json$/i.test(p[0])) root.json = f; continue; }
      const ch = root.chapters.get(p[0]) || root.chapters.set(p[0], { name: p[0], cover: null, final: null, topics: new Map() }).get(p[0]);
      if (p.length === 2) { if (/^(cover|rasm)\./i.test(p[1])) ch.cover = f; else if (slotName(p[1]) === 'final' || slotName(p[1]) === 'test') ch.final = f; else root.warn.push(`${p.join('/')}: ?`); continue; }
      const tp = ch.topics.get(p[1]) || ch.topics.set(p[1], { name: p[1], files: [] }).get(p[1]);
      const sn = slotName(p[p.length - 1]); if (!sn) { root.warn.push(`${p.join('/')}: ${T('nomi tanilmadi', 'имя не распознано', 'name not recognised')}`); continue; }
      if (sn === 'video' && /^(txt|url)$/.test(ext(p[p.length - 1]))) { tp.files.push({ slot: 'video', f, link: true }); continue; }
      if (ext(p[p.length - 1]) === 'pptx' || ext(p[p.length - 1]) === 'ppt') { root.warn.push(`${p.join('/')}: ${T('PPTX ko\'rsatilmaydi — PDF qilib saqlang', 'PPTX не отображается — сохраните как PDF', 'PPTX cannot be shown — save as PDF')}`); continue; }
      tp.files.push({ slot: sn, f });
    }
    return root;
  }
  function pImport(host) {
    host.innerHTML = `<div class="card pad form"><h3>${esc(T('Tayyor kurs papkasini yuklash', 'Загрузка готовой папки курса', 'Upload a ready course folder'))}</h3>
      <p class="muted small">${esc(T('Papka tuzilishi:', 'Структура папки:', 'Folder layout:'))}</p>
<pre class="bd-pre">KursPapkasi/
  course.json            (ixtiyoriy: {"title":"…","grade":5,"is_premium":true,"free_topics":1})
  1-bob. Nomi/
    cover.jpg            (bob rasmi, ixtiyoriy)
    yakuniy.txt          (bob yakuniy testi, ixtiyoriy)
    1-mavzu. Nomi/
      kitob.pdf   taqdimot.pdf   video.mp4 (yoki video.txt — YouTube havola)
      kartochka.csv   test.txt   takrorlash.txt (ixtiyoriy)</pre>
      <button class="btn lg block" id="pf">${ic('folder', 18)} ${esc(T('Papkani tanlash', 'Выбрать папку', 'Choose folder'))}</button><div id="pv" class="mt"></div></div>`;
    $('#pf', host).onclick = () => { const i = document.createElement('input'); i.type = 'file'; i.webkitdirectory = true; i.multiple = true; i.onchange = () => preview(Array.from(i.files)); i.click(); };
    const preview = files => {
      const pl = planOf(files), chl = [...pl.chapters.values()].sort((a, b) => nat(a.name, b.name)), nT = chl.reduce((a, x) => a + x.topics.size, 0), nF = chl.reduce((a, x) => a + [...x.topics.values()].reduce((q, t) => q + t.files.length, 0), 0), mb = Math.round(files.reduce((a, f) => a + f.size, 0) / 1048576);
      $('#pv', host).innerHTML = `<p><b>${chl.length}</b> ${esc(T('bob', 'глав', 'chapters'))} · <b>${nT}</b> ${esc(T('mavzu', 'тем', 'topics'))} · <b>${nF}</b> ${esc(T('fayl', 'файлов', 'files'))} · ${mb} MB</p>
        ${chl.map(ch => `<details class="mb"><summary><b>${esc(ch.name)}</b> (${ch.topics.size})</summary>${[...ch.topics.values()].sort((a, b) => nat(a.name, b.name)).map(t => `<div class="small">• ${esc(t.name)}: ${t.files.map(x => x.slot).join(', ') || '—'}</div>`).join('')}</details>`).join('')}
        ${pl.warn.length ? `<details class="warnbox"><summary>${esc(T('Ogohlantirishlar', 'Предупреждения', 'Warnings'))} (${pl.warn.length})</summary>${pl.warn.slice(0, 40).map(w => `<div>${esc(w)}</div>`).join('')}</details>` : ''}
        <button class="btn lg block mt" id="go" ${nT ? '' : 'disabled'}>${esc(T('Yuklashni boshlash', 'Начать загрузку', 'Start upload'))}</button><div id="log" class="bd-log"></div>`;
      $('#go', host).onclick = e => run(e.currentTarget, () => doImport(pl, chl, nF, $('#log', host)));
    };
  }
  async function doImport(pl, chl, nF, log) {
    const line = t => { const d = document.createElement('div'); d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
    let step = 0; const tick = () => { step++; $('#go', el) && ($('#go', el).title = Math.round(step / nF * 100) + '%'); };
    if (pl.json) { try { const j = JSON.parse(await pl.json.text()), u = {}; if (j.title) u.title = U(j.title); if (j.description) u.description = U(j.description); if ('grade' in j) u.grade = j.grade; if ('is_premium' in j) u.is_premium = !!j.is_premium; ['free_topics', 'unlock_pct', 'review_pct', 'final_pct'].forEach(k => { if (k in j) u[k] = +j[k]; }); if (Object.keys(u).length) { const { error } = await sb.from('courses').update(u).eq('id', id); if (error) throw error; line('✓ course.json'); } } catch (e) { line('✗ course.json: ' + (e.message || e)); } }
    let { data: base } = await sb.from('course_sections').select('position').eq('course_id', id).order('position', { ascending: false }).limit(1); let pos = (base?.[0]?.position ?? -1) + 1;
    const { count: tc } = await sb.from('course_sections').select('*', { count: 'exact', head: true }).eq('course_id', id).eq('kind', 'topic'); let n = tc || 0;
    const { count: cc } = await sb.from('course_chapters').select('*', { count: 'exact', head: true }).eq('course_id', id); let ci = cc || 0;
    for (const ch of chl) {
      line('📁 ' + ch.name);
      let cover = null; if (ch.cover) { try { cover = 'r2:' + (await r2Upload(ch.cover)).key; } catch (e) { line('✗ cover: ' + (e.message || e)); } }
      const { data: chr, error } = await sb.from('course_chapters').insert({ course_id: id, title: U(ch.name), cover, position: ci++ }).select('id').single(); if (error) throw error;
      const topics = [...ch.topics.values()].sort((a, b) => nat(a.name, b.name));
      for (const tp of topics) {
        n++; const { data: s, error: e1 } = await sb.from('course_sections').insert({ course_id: id, chapter_id: chr.id, kind: 'topic', title: U(tp.name), position: pos++ }).select('*').single(); if (e1) throw e1; secs.push(s);
        const rv = tp.files.find(x => x.slot === 'review'); let rs = null;
        if (rv) { const { data: r, error: e2 } = await sb.from('course_sections').insert({ course_id: id, chapter_id: chr.id, kind: 'review', title: U(`Takrorlash: ${Math.max(1, n - 1)}-mavzu va ${n}-mavzu`), position: pos++ }).select('*').single(); if (e2) throw e2; rs = r; secs.push(r); }
        for (const x of tp.files.slice().sort((a, b) => (SLOTS[a.slot]?.i ?? 9) - (SLOTS[b.slot]?.i ?? 9))) {
          const d = line('… ' + tp.name + ' / ' + x.f.name);
          try {
            if (x.slot === 'review') await setSlot(rs, 'test', { file: x.f });
            else if (x.link) await setSlot(s, 'video', { link: (await x.f.text()).trim() });
            else await setSlot(s, x.slot, { file: x.f }, f => { d.textContent = `… ${tp.name} / ${x.f.name} ${Math.round(f * 100)}%`; });
            d.textContent = '✓ ' + tp.name + ' / ' + x.f.name;
          } catch (e) { d.textContent = '✗ ' + tp.name + ' / ' + x.f.name + ': ' + (e.message || e); }
          tick();
          const { data: nl } = await sb.from('lessons').select('id,section_id,kind,title,item_id,position').eq('course_id', id); ls = nl || ls;
          const { data: nb } = await sb.from('lesson_bodies').select('lesson_id,youtube_id,body'); bodies = Object.fromEntries((nb || []).map(y => [y.lesson_id, y]));
        }
      }
      if (ch.final) { const { data: fs, error: e3 } = await sb.from('course_sections').insert({ course_id: id, chapter_id: chr.id, kind: 'final', title: U(`${ci}-bob yakuniy testi`), position: pos++ }).select('*').single(); if (e3) throw e3; secs.push(fs); const d = line('… ' + ch.final.name); try { await setSlot(fs, 'test', { file: ch.final }); d.textContent = '✓ ' + ch.final.name; } catch (e) { d.textContent = '✗ ' + ch.final.name + ': ' + (e.message || e); } }
    }
    line('✅ ' + T('Tugadi', 'Готово', 'Done')); toast(T('Papka yuklandi', 'Папка загружена', 'Folder uploaded'), 'ok'); setTimeout(reload, 1200);
  }

  // --- Sozlamalar ---
  function pSettings(host) {
    host.innerHTML = `<div class="card pad form"><label class="fld"><span>${esc(T('Kurs nomi', 'Название', 'Title'))}</span><input class="input" id="st" value="${esc(tr(c.title))}"></label>
      <label class="fld"><span>${esc(T('Tavsif', 'Описание', 'Description'))}</span><textarea class="input" id="sd" rows="3">${esc(tr(c.description || {}))}</textarea></label>
      <div class="grid2"><label class="fld"><span>${esc(T('Sinf', 'Класс', 'Grade'))}</span><input class="input" id="sg" type="number" min="1" max="12" value="${c.grade ?? ''}"></label>
      <label class="fld"><span>${esc(T('Holat', 'Статус', 'Status'))}</span><select class="input" id="ss"><option value="draft" ${c.status !== 'published' ? 'selected' : ''}>${esc(T('Yashirin (qoralama)', 'Скрыт (черновик)', 'Hidden (draft)'))}</option><option value="published" ${c.status === 'published' ? 'selected' : ''}>${esc(T('Hammaga ko\'rinadi', 'Виден всем', 'Visible to all'))}</option></select></label></div>
      <label class="chip" style="cursor:pointer;margin:8px 0"><input type="checkbox" id="sp" ${c.is_premium ? 'checked' : ''}> ${esc(T('Cheklangan kurs (ruxsat bilan ochiladi)', 'Ограниченный курс (открывается по доступу)', 'Restricted course (access by permission)'))}</label>
      <div class="grid2"><label class="fld"><span>${esc(T('Hammaga ochiq mavzular soni', 'Открытых тем для всех', 'Topics open to everyone'))}</span><input class="input" id="sf" type="number" min="0" max="500" value="${c.free_topics ?? 1}"></label>
      <label class="fld"><span>${esc(T('Qism o\'tish foizi', 'Порог части, %', 'Step pass %'))}</span><input class="input" id="su" type="number" min="1" max="100" value="${c.unlock_pct ?? 60}"></label>
      <label class="fld"><span>${esc(T('Takrorlash testi foizi', 'Порог повторения, %', 'Review pass %'))}</span><input class="input" id="sr" type="number" min="1" max="100" value="${c.review_pct ?? 70}"></label>
      <label class="fld"><span>${esc(T('Yakuniy test foizi', 'Порог итогового, %', 'Final pass %'))}</span><input class="input" id="sx" type="number" min="1" max="100" value="${c.final_pct ?? 70}"></label></div>
      <button class="btn lg block mt" id="sv">${esc(T('Saqlash', 'Сохранить', 'Save'))}</button>
      <button class="btn ghost block mt" id="dc" style="color:var(--danger,#d33)">${ic('trash', 16)} ${esc(T('Kursni butunlay o\'chirish', 'Удалить курс полностью', 'Delete the course'))}</button></div>`;
    $('#sv', host).onclick = e => run(e.currentTarget, async () => {
      const v = i => $('#' + i, host).value, num = (i, d) => Math.max(0, Math.min(100, +v(i) || d));
      const u = { title: U(v('st').trim() || tr(c.title)), description: U(v('sd').trim()), grade: v('sg') ? +v('sg') : null, status: v('ss'), is_premium: $('#sp', host).checked, free_topics: Math.max(0, +v('sf') || 0), unlock_pct: num('su', 60) || 60, review_pct: num('sr', 70) || 70, final_pct: num('sx', 70) || 70 };
      const { error } = await sb.from('courses').update(u).eq('id', id); if (error) throw error; toast(T('Saqlandi', 'Сохранено', 'Saved'), 'ok'); await reload(); });
    $('#dc', host).onclick = async () => { if (!await confirmDlg(T('Kurs, uning barcha darslari va testlari o\'chadi. Bu qaytmaydi!', 'Курс со всеми уроками и тестами будет удалён. Это необратимо!', 'The course with all lessons and tests will be deleted. This cannot be undone!'))) return;
      for (const l of ls) { await delSlotAssets(l); } const { error } = await sb.from('courses').delete().eq('id', id); if (error) return toast(dbErr(error), 'err'); go('/teach'); };
  }

  // --- Ruxsatlar ---
  async function pAccess(host) {
    host.innerHTML = `<div class="card pad form"><h3>${esc(T('Foydalanuvchiga ruxsat berish', 'Выдать доступ пользователю', 'Grant access'))}</h3><p class="muted small">${esc(T('Email va nechta mavzugacha ochilishini kiriting. Qolgan mavzular uchun foydalanuvchi «adminga yozish» tugmasini ko\'radi.', 'Укажите email и до какой темы открыть. Для остальных пользователь увидит «написать админу».', 'Enter an email and how many topics to open. For the rest the user sees "message admin".'))}</p>
      <label class="fld"><span>Email</span><input class="input" id="ge" type="email" list="gl" autocomplete="off" placeholder="name@gmail.com"><datalist id="gl"></datalist></label>
      <label class="fld"><span>${esc(T('Nechta mavzugacha ochiq', 'Открыть до темы №', 'Open up to topic #'))}</span><input class="input" id="gn" type="number" min="0" max="500" value="${Math.max(2, (c.free_topics || 1) + 1)}"></label>
      <p class="muted small">${esc(T(`Kursda hozir ${secs.filter(s => s.kind === 'topic').length} ta mavzu bor. Barchasini ochish uchun katta son kiriting (masalan 500).`, `Сейчас в курсе ${secs.filter(s => s.kind === 'topic').length} тем. Чтобы открыть всё — укажите большое число (например 500).`, `The course has ${secs.filter(s => s.kind === 'topic').length} topics. Enter a large number (e.g. 500) to open everything.`))}</p>
      <button class="btn block" id="gb">${esc(T('Ruxsat berish', 'Выдать', 'Grant'))}</button></div><div id="gls" class="mt">${skeleton(2, 60)}</div>`;
    let tm; $('#ge', host).oninput = e => { clearTimeout(tm); tm = setTimeout(async () => { const q = e.target.value.trim(); if (q.length < 3) return; try { const { data } = await sb.from('profiles').select('email,full_name').ilike('email', q + '%').limit(8); $('#gl', host).innerHTML = (data || []).map(x => `<option value="${esc(x.email)}">${esc(x.full_name || '')}</option>`).join(''); } catch { /* */ } }, 250); };
    const list = async () => { const { data, error } = await sb.rpc('list_grants', { p_course: id }); if (error) { $('#gls', host).innerHTML = errBox(dbErr(error)); return; } grants = data || [];
      $('#gls', host).innerHTML = grants.length ? `<div class="card pad"><h4>${esc(T('Ruxsat berilganlar', 'Выданные доступы', 'Granted'))} (${grants.length})</h4>${grants.map(g => `<div class="row bd-g"><div class="grow"><b>${esc(g.full_name || g.email)}</b><small class="muted" style="display:block">${esc(g.email)}</small></div><input class="input" style="width:84px" type="number" min="0" max="500" value="${g.upto}" data-up="${g.user_id}" data-em="${esc(g.email)}"><button class="btn ghost sm" data-rv="${g.user_id}">${ic('trash', 14)}</button></div>`).join('')}</div>` : `<p class="muted center">${esc(T('Hali hech kimga ruxsat berilmagan', 'Пока никому не выдано', 'Nobody has been granted access yet'))}</p>`;
      $$('[data-up]', host).forEach(i => i.onchange = async () => { const { error: er } = await sb.rpc('grant_course', { p_email: i.dataset.em, p_course: id, p_upto: +i.value || 0 }); toast(er ? dbErr(er) : T('Saqlandi', 'Сохранено', 'Saved'), er ? 'err' : 'ok'); });
      $$('[data-rv]', host).forEach(b => b.onclick = async () => { if (!await confirmDlg(T('Ruxsat olib tashlansinmi?', 'Отозвать доступ?', 'Revoke access?'))) return; const { error: er } = await sb.rpc('revoke_course', { p_user: b.dataset.rv, p_course: id }); if (er) return toast(dbErr(er), 'err'); list(); }); };
    $('#gb', host).onclick = e => run(e.currentTarget, async () => { const em = $('#ge', host).value.trim(); if (!em) throw new Error(T('Email kiriting', 'Введите email', 'Enter an email')); const { error } = await sb.rpc('grant_course', { p_email: em, p_course: id, p_upto: +$('#gn', host).value || 0 }); if (error) throw error; toast(T('Ruxsat berildi', 'Доступ выдан', 'Access granted'), 'ok'); $('#ge', host).value = ''; list(); });
    list();
  }
  paint();
}, { auth: true });
