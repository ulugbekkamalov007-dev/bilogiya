// E'lonlar va reklamalar: ko'rish, admin tomonidan yaratish (hammaga / guruhlarga / shaxslarga)
import { sb, state, t, tr, addDict, friendlyErr, route, esc, ic, $, $$, modal, toast, confirmDlg, fmtDate, publicUrl, compressImage, upload, uid8, i18nField, btnBusy, spinner } from './core.js';

addDict({
  uz: { 'news.title': 'E\'lonlar', 'news.new': 'Yangi e\'lon', 'news.kind': 'Turi', 'news.k_news': 'E\'lon', 'news.k_ad': 'Reklama (banner)',
    'news.f_title': 'Sarlavha', 'news.f_body': 'Matn', 'news.f_link': 'Havola (ixtiyoriy)', 'news.f_img': 'Rasm (ixtiyoriy)', 'news.f_end': 'Tugash sanasi (ixtiyoriy)',
    'news.f_pin': 'Tepaga mahkamlash', 'news.f_tr': 'Boshqa tillarga avtomatik tarjima qilish', 'news.target': 'Kimga yuboriladi?',
    'news.t_all': 'Hamma foydalanuvchilarga', 'news.t_groups': 'Guruhlarga', 'news.t_users': 'Shaxslarga',
    'news.g_all': 'Barcha guruhlar', 'news.g_search': 'Guruhni qidirish yoki tanlash…', 'news.u_search': 'Ism yoki email bo\'yicha qidiring…',
    'news.publish': 'E\'lon berish', 'news.done': 'E\'lon yuborildi', 'news.empty': 'E\'lonlar yo\'q', 'news.hidden': 'Yashirin',
    'news.need_target': 'Kamida bitta guruh yoki foydalanuvchi tanlang', 'news.need_title': 'Sarlavhani kiriting', 'news.open_link': 'Havolani ochish',
    'news.to_groups': '{n} ta guruh', 'news.to_users': '{n} ta shaxs', 'news.to_all': 'Hamma', 'news.translating': 'Tarjima qilinmoqda…' },
  ru: { 'news.title': 'Объявления', 'news.new': 'Новое объявление', 'news.kind': 'Тип', 'news.k_news': 'Объявление', 'news.k_ad': 'Реклама (баннер)',
    'news.f_title': 'Заголовок', 'news.f_body': 'Текст', 'news.f_link': 'Ссылка (необязательно)', 'news.f_img': 'Картинка (необязательно)', 'news.f_end': 'Дата окончания (необязательно)',
    'news.f_pin': 'Закрепить сверху', 'news.f_tr': 'Автоматически перевести на другие языки', 'news.target': 'Кому отправить?',
    'news.t_all': 'Всем пользователям', 'news.t_groups': 'Группам', 'news.t_users': 'Отдельным людям',
    'news.g_all': 'Все группы', 'news.g_search': 'Найти или выбрать группу…', 'news.u_search': 'Поиск по имени или email…',
    'news.publish': 'Опубликовать', 'news.done': 'Объявление отправлено', 'news.empty': 'Объявлений нет', 'news.hidden': 'Скрыто',
    'news.need_target': 'Выберите хотя бы одну группу или человека', 'news.need_title': 'Введите заголовок', 'news.open_link': 'Открыть ссылку',
    'news.to_groups': 'Групп: {n}', 'news.to_users': 'Людей: {n}', 'news.to_all': 'Всем', 'news.translating': 'Перевод…' },
  en: { 'news.title': 'Announcements', 'news.new': 'New announcement', 'news.kind': 'Type', 'news.k_news': 'Announcement', 'news.k_ad': 'Ad (banner)',
    'news.f_title': 'Title', 'news.f_body': 'Text', 'news.f_link': 'Link (optional)', 'news.f_img': 'Image (optional)', 'news.f_end': 'End date (optional)',
    'news.f_pin': 'Pin to top', 'news.f_tr': 'Auto-translate to other languages', 'news.target': 'Send to',
    'news.t_all': 'All users', 'news.t_groups': 'Groups', 'news.t_users': 'Specific people',
    'news.g_all': 'All groups', 'news.g_search': 'Search or pick groups…', 'news.u_search': 'Search by name or email…',
    'news.publish': 'Publish', 'news.done': 'Announcement sent', 'news.empty': 'No announcements', 'news.hidden': 'Hidden',
    'news.need_target': 'Pick at least one group or person', 'news.need_title': 'Enter a title', 'news.open_link': 'Open link',
    'news.to_groups': '{n} groups', 'news.to_users': '{n} people', 'news.to_all': 'Everyone', 'news.translating': 'Translating…' },
});

export function annCard(a) {
  return `<div class="card pad ann ${a.pinned ? 'pin' : ''}" data-ann="${a.id}">
    ${a.image_path ? `<img class="ann-img" src="${esc(publicUrl('media', a.image_path))}" alt="" loading="lazy">` : ''}
    <div class="grow"><div class="row between"><b>${a.pinned ? '📌 ' : ''}${esc(tr(a.title))}</b><small class="muted">${esc(fmtDate(a.created_at))}</small></div>
    <p class="muted clamp2">${esc(tr(a.body))}</p>
    ${state.isAdmin ? `<div class="chips"><span class="chip">${a.kind === 'ad' ? 'AD' : 'NEWS'}</span><span class="chip">${a.target === 'all' ? esc(t('news.to_all')) : a.target === 'groups' ? esc(t('news.to_groups', { n: a.group_ids.length })) : esc(t('news.to_users', { n: a.user_ids.length }))}</span>${a.visible ? '' : `<span class="chip warn">${esc(t('news.hidden'))}</span>`}</div>` : ''}
    </div></div>`;
}

export function openAnnouncement(a) {
  if (!a) return;
  const m = modal(`${a.image_path ? `<img class="ann-full" src="${esc(publicUrl('media', a.image_path))}" alt="">` : ''}
    <h3>${esc(tr(a.title))}</h3><p class="pre">${esc(tr(a.body))}</p>
    ${a.link ? `<a class="btn mt" href="${esc(a.link)}" target="_blank" rel="noopener">${ic('link')} ${esc(t('news.open_link'))}</a>` : ''}
    ${state.isAdmin ? `<div class="row end mt"><button class="btn ghost sm" data-vis>${ic(a.visible ? 'eyeoff' : 'eye')}</button><button class="btn danger sm" data-del>${ic('trash')}</button></div>` : ''}`);
  $('[data-vis]', m.el)?.addEventListener('click', async () => { await sb.from('announcements').update({ visible: !a.visible }).eq('id', a.id); m.close(); location.reload(); });
  $('[data-del]', m.el)?.addEventListener('click', async () => { if (!(await confirmDlg(t('delete') + '?'))) return; await sb.from('announcements').delete().eq('id', a.id); m.close(); location.reload(); });
}

export function composeAnnouncement(onDone, preset = {}) {
  const m = modal(`<h3>${ic('mega')} ${esc(t('news.new'))}</h3>
  <form id="f" class="form">
    <div class="seg"><label><input type="radio" name="k" value="news" ${preset.kind === 'ad' ? '' : 'checked'}><span>${esc(t('news.k_news'))}</span></label><label><input type="radio" name="k" value="ad" ${preset.kind === 'ad' ? 'checked' : ''}><span>${esc(t('news.k_ad'))}</span></label></div>
    <label class="fld"><span>${esc(t('news.f_title'))}</span><input class="input" id="ti" required maxlength="120"></label>
    <label class="fld"><span>${esc(t('news.f_body'))}</span><textarea class="input" id="bo" rows="4" maxlength="2000"></textarea></label>
    <label class="fld"><span>${esc(t('news.f_img'))}</span><input type="file" id="im" accept="image/*"></label>
    <label class="fld"><span>${esc(t('news.f_link'))}</span><input class="input" id="li" type="url" placeholder="https://"></label>
    <div class="fld"><span>${esc(t('news.target'))}</span>
      <div class="seg"><label><input type="radio" name="tg" value="all" checked><span>${esc(t('news.t_all'))}</span></label><label><input type="radio" name="tg" value="groups"><span>${esc(t('news.t_groups'))}</span></label><label><input type="radio" name="tg" value="users"><span>${esc(t('news.t_users'))}</span></label></div></div>
    <div id="pick"></div>
    <label class="fld"><span>${esc(t('news.f_end'))}</span><input class="input" id="en" type="date"></label>
    <label class="chk"><input type="checkbox" id="pi"> ${esc(t('news.f_pin'))}</label>
    <label class="chk"><input type="checkbox" id="tr" checked> ${esc(t('news.f_tr'))}</label>
    <div class="err" id="err"></div>
    <button class="btn lg block" id="go">${esc(t('news.publish'))}</button>
  </form>`, { cls: 'wide' });
  const el = m.el; let groups = null; const selG = new Set(), selU = new Map();

  const drawPick = async () => {
    const tg = $('input[name=tg]:checked', el).value, box = $('#pick', el);
    if (tg === 'all') { box.innerHTML = ''; return; }
    if (tg === 'groups') {
      if (!groups) groups = (await sb.from('groups').select('id,name').eq('archived', false).order('name')).data || [];
      const paint = () => {
        const q = ($('#gq', el)?.value || '').toLowerCase();
        $('#glist', el).innerHTML = groups.filter(g => g.name.toLowerCase().includes(q)).map(g => `<label class="chk"><input type="checkbox" data-g="${g.id}" ${selG.has(g.id) ? 'checked' : ''}> ${esc(g.name)}</label>`).join('') || `<p class="muted">—</p>`;
        $$('[data-g]', el).forEach(c => c.onchange = () => c.checked ? selG.add(c.dataset.g) : selG.delete(c.dataset.g));
      };
      box.innerHTML = `<label class="chk"><input type="checkbox" id="gall"> <b>${esc(t('news.g_all'))}</b></label><input class="input" id="gq" placeholder="${esc(t('news.g_search'))}"><div class="pick-list" id="glist"></div>`;
      $('#gq', el).oninput = paint; paint();
      $('#gall', el).onchange = e => { groups.forEach(g => e.target.checked ? selG.add(g.id) : selG.delete(g.id)); paint(); };
    } else {
      box.innerHTML = `<input class="input" id="uq" placeholder="${esc(t('news.u_search'))}"><div class="chips" id="usel"></div><div class="pick-list" id="ulist"></div>`;
      const paintSel = () => { $('#usel', el).innerHTML = [...selU].map(([id, n]) => `<span class="chip">${esc(n)} <button type="button" data-rm="${id}">×</button></span>`).join(''); $$('[data-rm]', el).forEach(b => b.onclick = () => { selU.delete(b.dataset.rm); paintSel(); }); };
      let to; $('#uq', el).oninput = e => { clearTimeout(to); const q = e.target.value.trim(); if (q.length < 2) { $('#ulist', el).innerHTML = ''; return; }
        to = setTimeout(async () => { const { data } = await sb.rpc('admin_find_users', { p_q: q });
          $('#ulist', el).innerHTML = (data || []).map(u => `<button type="button" class="pick-row" data-u="${u.id}" data-n="${esc(u.full_name)}">${esc(u.full_name)} <small class="muted">${esc(u.email)}</small></button>`).join('');
          $$('[data-u]', el).forEach(b => b.onclick = () => { selU.set(b.dataset.u, b.dataset.n); paintSel(); }); }, 300); };
      paintSel();
    }
  };
  $$('input[name=tg]', el).forEach(r => r.onchange = drawPick);

  $('#f', el).onsubmit = async e => {
    e.preventDefault(); const err = $('#err', el); err.textContent = '';
    const title = $('#ti', el).value.trim(), body = $('#bo', el).value.trim(), tg = $('input[name=tg]:checked', el).value;
    if (!title) return err.textContent = t('news.need_title');
    if ((tg === 'groups' && !selG.size) || (tg === 'users' && !selU.size)) return err.textContent = t('news.need_target');
    const b = $('#go', el); btnBusy(b, true); b.textContent = t('news.translating');
    try {
      const auto = $('#tr', el).checked;
      const [ti, bo] = await Promise.all([i18nField(title, state.lang, auto), i18nField(body, state.lang, auto)]);
      let image_path = null; const f = $('#im', el).files[0];
      if (f) { const blob = await compressImage(f, { max: 1200, quality: 0.75 }); image_path = await upload('media', `ann/${uid8()}-${Date.now()}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`, blob); }
      const end = $('#en', el).value;
      const { error } = await sb.from('announcements').insert({
        kind: $('input[name=k]:checked', el).value, title: ti, body: bo, image_path, link: $('#li', el).value.trim() || null,
        target: tg, group_ids: tg === 'groups' ? [...selG] : [], user_ids: tg === 'users' ? [...selU.keys()] : [],
        pinned: $('#pi', el).checked, ends_at: end ? new Date(end + 'T23:59:59').toISOString() : null, created_by: state.user.id,
      });
      if (error) throw error;
      toast(t('news.done'), 'ok'); m.close(); onDone?.();
    } catch (x) { err.textContent = friendlyErr(x.message || String(x)); btnBusy(b, false); b.textContent = t('news.publish'); }
  };
}

route('/news', async ({ el, alive }) => {
  const { data } = await sb.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(100);
  if (!alive()) return;
  const list = data || [];
  el.innerHTML = `<div class="page"><div class="row between mb"><h1>${esc(t('news.title'))}</h1>${state.isAdmin ? `<button class="btn" id="new">${ic('plus')} ${esc(t('news.new'))}</button>` : ''}</div>
    <div class="cards">${list.length ? list.map(annCard).join('') : `<p class="muted">${esc(t('news.empty'))}</p>`}</div></div>`;
  $$('[data-ann]', el).forEach(c => c.onclick = () => openAnnouncement(list.find(a => a.id === c.dataset.ann)));
  $('#new', el)?.addEventListener('click', () => composeAnnouncement(() => location.reload()));
}, { auth: true });
