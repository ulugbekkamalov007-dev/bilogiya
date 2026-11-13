// Test savollari muharriri: savol, A–D variantlar (to'g'risi belgilanadi), mavzu, qiyinlik, ball, rasm. Faqat egasi va admin.
import { sb, state, tr, route, go, esc, ic, $, $$, modal, toast, btnBusy, confirmDlg, spinner, publicUrl, upload, compressImage, uid8 } from './core.js';
import { T, empty, errBox, dbErr } from './ui.js';

const DIFF = () => ({ 1: T('Oson', 'Легко', 'Easy'), 2: T('O\'rta', 'Средне', 'Medium'), 3: T('Qiyin', 'Сложно', 'Hard') });

route('/test/:id/edit', async ({ el, params, alive }) => {
  const iid = params.id; let item, qs = [], term = '';
  const load = async () => {
    const [i, q] = await Promise.all([sb.from('items').select('id,title,folder_id,created_by,kind').eq('id', iid).maybeSingle(),
      sb.from('questions').select('id,chapter,question,correct,wrong,explanation,image_path,difficulty,points,position').eq('item_id', iid).order('position').limit(5000)]);
    if (i.error || q.error) throw (i.error || q.error); item = i.data; qs = q.data || [];
  };
  const paint = () => {
    const list = qs.filter(q => !term || q.question.toLowerCase().includes(term) || (q.chapter || '').toLowerCase().includes(term));
    el.innerHTML = `<div class="page narrow"><div class="row between wrap"><div class="row"><a class="icon-btn" href="#/test/${iid}" aria-label="back">${ic('back')}</a><h2 class="mb0 trunc">${esc(tr(item.title))}</h2></div>
      <button class="btn" id="add">${ic('plus', 16)} ${esc(T('Savol qo\'shish', 'Добавить вопрос', 'Add question'))}</button></div>
      <p class="muted mt">${qs.length} ${esc(T('ta savol', 'вопросов', 'questions'))}</p>
      <label class="searchbox mt">${ic('search', 16)}<input class="input" id="qs" type="search" placeholder="${esc(T('Savol yoki mavzu bo\'yicha qidirish…', 'Поиск по вопросу или теме…', 'Search by question or topic…'))}" value="${esc(term)}"></label>
      <div class="stack mt">${list.slice(0, 300).map((q, n) => `<div class="card pad qrow" data-q="${q.id}"><div class="row" style="gap:10px;align-items:flex-start"><b class="muted">${n + 1}.</b><div class="grow"><div>${esc(q.question)}</div>
        <small class="muted">${esc(q.chapter || T('Mavzusiz', 'Без темы', 'No topic'))} · ${esc(DIFF()[q.difficulty] || '')} · ${q.points} ${esc(T('ball', 'балл', 'pt'))}${q.image_path ? ' · 🖼' : ''}</small></div>
        <button class="icon-btn" data-e="${q.id}" aria-label="edit">${ic('edit', 16)}</button><button class="icon-btn" data-d="${q.id}" aria-label="delete">${ic('trash', 16)}</button></div></div>`).join('') || empty('test', T('Savol yo\'q', 'Нет вопросов', 'No questions'))}
        ${list.length > 300 ? `<p class="muted center">${esc(T('Dastlabki 300 tasi ko\'rsatildi — qidiruvdan foydalaning', 'Показаны первые 300 — используйте поиск', 'First 300 shown — use search'))}</p>` : ''}</div></div>`;
    $('#add', el).onclick = () => form(null);
    const s = $('#qs', el); s.oninput = () => { term = s.value.trim().toLowerCase(); clearTimeout(s._t); s._t = setTimeout(() => { paint(); const n = $('#qs', el); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200); };
    $$('[data-e]', el).forEach(b => b.onclick = () => form(qs.find(x => x.id === b.dataset.e)));
    $$('[data-d]', el).forEach(b => b.onclick = async () => { if (!(await confirmDlg(T('Savol o\'chirilsinmi?', 'Удалить вопрос?', 'Delete this question?'), T('O\'chirish', 'Удалить', 'Delete')))) return;
      const { error } = await sb.from('questions').delete().eq('id', b.dataset.d); if (error) return toast(dbErr(error), 'err'); qs = qs.filter(x => x.id !== b.dataset.d); paint(); });
  };
  const form = q => {
    const opts = q ? shuffleKeep(q) : ['', '', '', '']; let corr = q ? 0 : 0, img = q?.image_path || null, newFile = null;
    const m = modal(`<h3>${esc(q ? T('Savolni tahrirlash', 'Редактировать вопрос', 'Edit question') : T('Yangi savol', 'Новый вопрос', 'New question'))}</h3><form class="form" id="f">
      <label class="fld"><span>${esc(T('Savol matni', 'Текст вопроса', 'Question'))}</span><textarea class="input" id="qq" rows="3" required maxlength="1500">${esc(q?.question || '')}</textarea></label>
      <div class="fld"><span>${esc(T('Variantlar (to\'g\'risini belgilang)', 'Варианты (отметьте верный)', 'Options (mark the correct one)'))}</span>${[0, 1, 2, 3].map(k => `<label class="optin"><input type="radio" name="c" value="${k}" ${k === corr ? 'checked' : ''}><b>${'ABCD'[k]}</b><input class="input" data-o="${k}" value="${esc(opts[k])}" maxlength="400" ${k < 2 ? 'required' : ''}></label>`).join('')}</div>
      <div class="row wrap" style="gap:10px"><label class="fld grow"><span>${esc(T('Mavzu', 'Тема', 'Topic'))}</span><input class="input" id="ch" maxlength="120" value="${esc(q?.chapter || '')}" list="chl"></label>
        <label class="fld"><span>${esc(T('Qiyinlik', 'Сложность', 'Difficulty'))}</span><select class="input" id="df">${Object.entries(DIFF()).map(([k, v]) => `<option value="${k}" ${(q?.difficulty || 2) == k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
        <label class="fld"><span>${esc(T('Ball', 'Балл', 'Points'))}</span><input class="input" id="pt" type="number" min="1" max="100" value="${q?.points || 1}" style="width:90px"></label></div>
      <datalist id="chl">${[...new Set(qs.map(x => x.chapter).filter(Boolean))].map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      <label class="fld"><span>${esc(T('Izoh (ixtiyoriy)', 'Пояснение (необязательно)', 'Explanation (optional)'))}</span><textarea class="input" id="ex" rows="2" maxlength="1000">${esc(q?.explanation || '')}</textarea></label>
      <div class="fld"><span>${esc(T('Rasm (ixtiyoriy)', 'Изображение (необязательно)', 'Image (optional)'))}</span><div id="ip" class="row" style="gap:10px;align-items:center"></div><input type="file" id="fi" accept="image/png,image/jpeg,image/webp" hidden></div>
      <div class="row end"><button type="button" class="btn ghost" data-c>${esc(T('Bekor qilish', 'Отмена', 'Cancel'))}</button><button class="btn">${esc(T('Saqlash', 'Сохранить', 'Save'))}</button></div></form>`);
    const prev = () => { $('#ip', m.el).innerHTML = (newFile ? `<img class="qimg" src="${URL.createObjectURL(newFile)}" alt="">` : img ? `<img class="qimg" src="${esc(publicUrl('media', img))}" alt="">` : '') +
      `<button type="button" class="btn ghost sm" id="pk">${esc(img || newFile ? T('Almashtirish', 'Заменить', 'Replace') : T('Rasm tanlash', 'Выбрать', 'Choose image'))}</button>${img || newFile ? `<button type="button" class="btn ghost sm" id="rm">${esc(T('Olib tashlash', 'Убрать', 'Remove'))}</button>` : ''}`;
      $('#pk', m.el).onclick = () => $('#fi', m.el).click(); $('#rm', m.el)?.addEventListener('click', () => { img = null; newFile = null; prev(); }); };
    $('#fi', m.el).onchange = e => { const f = e.target.files[0]; if (!f) return; if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return toast(T('Faqat PNG/JPG/WEBP', 'Только PNG/JPG/WEBP', 'PNG/JPG/WEBP only'), 'err'); if (f.size > 8 * 1048576) return toast(T('Rasm 8 MB dan katta', 'Больше 8 МБ', 'Over 8 MB'), 'err'); newFile = f; prev(); };
    prev(); $('[data-c]', m.el).onclick = () => m.close();
    $('#f', m.el).onsubmit = async e => { e.preventDefault(); const b = $('.btn:not(.ghost)', m.el); btnBusy(b, true);
      try {
        const o = $$('[data-o]', m.el).map(x => x.value.trim()), ci = +$('input[name=c]:checked', m.el).value; if (!o[ci]) throw new Error(T('To\'g\'ri variant bo\'sh bo\'lmasligi kerak', 'Верный вариант не может быть пустым', 'Correct option cannot be empty'));
        const correct = o[ci], wrong = o.filter((x, k) => k !== ci && x); if (!wrong.length) throw new Error(T('Kamida bitta noto\'g\'ri variant kerak', 'Нужен хотя бы один неверный вариант', 'At least one wrong option is needed'));
        if (new Set(o.filter(Boolean)).size !== o.filter(Boolean).length) throw new Error(T('Variantlar takrorlanmasin', 'Варианты не должны повторяться', 'Options must be unique'));
        let path = img; if (newFile) { const blob = await compressImage(newFile, { max: 1400, quality: 0.8 }); path = `q/${state.user.id}/${uid8()}-${Date.now()}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`; await upload('media', path, blob, { contentType: blob.type }); }
        const row = { item_id: iid, question: $('#qq', m.el).value.trim(), correct, wrong, chapter: $('#ch', m.el).value.trim() || null, explanation: $('#ex', m.el).value.trim() || null, difficulty: +$('#df', m.el).value, points: Math.max(1, Math.min(100, +$('#pt', m.el).value || 1)), image_path: path };
        if (!row.question) throw new Error(T('Savol matni kerak', 'Нужен текст вопроса', 'Question text required'));
        const r = q ? await sb.from('questions').update(row).eq('id', q.id) : await sb.from('questions').insert({ ...row, position: (qs.reduce((a, x) => Math.max(a, x.position || 0), 0) || 0) + 1 });
        if (r.error) throw r.error; m.close(); toast(T('Saqlandi', 'Сохранено', 'Saved'), 'ok'); await load(); if (alive()) paint();
      } catch (err) { btnBusy(b, false); toast(err.message ? (err.code ? dbErr(err) : err.message) : dbErr(err), 'err'); } };
  };
  const shuffleKeep = q => { const o = [q.correct, ...(q.wrong || [])]; while (o.length < 4) o.push(''); return o.slice(0, 4); };
  el.innerHTML = `<div class="page narrow">${spinner()}</div>`;
  try { await load(); } catch (e) { if (alive()) el.innerHTML = `<div class="page">${errBox(dbErr(e))}</div>`; return; }
  if (!alive()) return; if (!item || item.kind !== 'test' || (!state.isAdmin && item.created_by !== state.user.id)) return go('/library', true); paint();
}, { auth: true });
