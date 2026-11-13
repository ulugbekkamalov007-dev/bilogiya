// Forum: umumiy yoki guruh ichidagi mavzular va javoblar (moderatsiya: admin/o'qituvchi)
import { sb, state, route, go, esc, ic, $, $$, modal, toast, btnBusy, confirmDlg, spinner, fmtDate, fmtTime } from './core.js';
import { T, skeleton, empty, errBox, dbErr } from './ui.js';

const staff = () => state.profile?.role !== 'user' || state.isAdmin;

route('/forum', async ({ el, q, alive }) => {
  const { data: gm } = await sb.from('group_members').select('group_id, groups(id,name)').eq('user_id', state.user.id).eq('status', 'approved');
  const groups = (gm || []).map(x => x.groups).filter(Boolean); let scope = q.g || 'all', term = '';
  el.innerHTML = `<div class="page"><div class="row between"><h1>${esc(T('Forum', 'Форум', 'Forum'))}</h1><button class="btn" id="nt">${ic('plus', 16)} ${esc(T('Yangi mavzu', 'Новая тема', 'New topic'))}</button></div>
    <div class="chipbar"><input class="input" id="s" type="search" placeholder="${esc(T('Mavzu qidirish…', 'Поиск темы…', 'Search topics…'))}" style="flex:1;max-width:340px"><select class="input" id="g"><option value="all">${esc(T('Umumiy forum', 'Общий форум', 'Public forum'))}</option>${groups.map(g => `<option value="${g.id}" ${scope === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select></div><div id="fl">${skeleton(4, 70)}</div></div>`;
  const load = async () => {
    const qq = sb.from('forum_threads').select('*, forum_posts(count)').order('pinned', { ascending: false }).order('last_post_at', { ascending: false }).limit(100);
    if (scope === 'all') qq.is('group_id', null); else qq.eq('group_id', scope); if (term) qq.ilike('title', `%${term.replace(/[%_]/g, '')}%`);
    const { data, error } = await qq; if (!alive()) return; if (error) { $('#fl', el).innerHTML = errBox(dbErr(error), 'rt'); $('#rt', el).onclick = load; return; }
    $('#fl', el).innerHTML = (data || []).length ? `<div class="cards cols1">${data.map(t => `<a class="card pad item-row" href="#/forum/${t.id}"><span class="item-ic">${ic(t.pinned ? 'flag' : 'msg', 18)}</span><div class="grow"><b>${esc(t.title)}</b> ${t.locked ? '🔒' : ''}<br><small class="muted">${esc(t.author_name || '')} · ${esc(fmtDate(t.last_post_at))} · ${t.forum_posts?.[0]?.count || 0} ${esc(T('javob', 'ответов', 'replies'))}</small></div>${ic('chev', 16)}</a>`).join('')}</div>` : empty('msg', T('Mavzular yo\'q — birinchi bo\'ling', 'Тем нет — станьте первым', 'No topics — be the first'));
  };
  let tm; $('#s', el).oninput = e => { clearTimeout(tm); tm = setTimeout(() => { term = e.target.value.trim(); load(); }, 250); }; $('#g', el).onchange = e => { scope = e.target.value; load(); };
  $('#nt', el).onclick = () => { const m = modal(`<h3>${esc(T('Yangi mavzu', 'Новая тема', 'New topic'))}</h3><form class="form" id="f"><label class="fld"><span>${esc(T('Sarlavha', 'Заголовок', 'Title'))}</span><input class="input" id="t" required minlength="3" maxlength="160"></label>
      <label class="fld"><span>${esc(T('Matn', 'Текст', 'Text'))}</span><textarea class="input" id="b" rows="5" required maxlength="4000"></textarea></label><button class="btn lg block">${esc(T('Yuborish', 'Опубликовать', 'Post'))}</button></form>`);
    $('#f', m.el).onsubmit = async e => { e.preventDefault(); const btn = $('button', m.el); btnBusy(btn, true); const { data, error } = await sb.from('forum_threads').insert({ author_id: state.user.id, group_id: scope === 'all' ? null : scope, title: $('#t', m.el).value.trim(), body: $('#b', m.el).value.trim() }).select('id').single(); if (error) { btnBusy(btn, false); return toast(dbErr(error), 'err'); } m.close(); go('/forum/' + data.id); }; };
  await load();
}, { auth: true });

route('/forum/:id', async ({ el, params, alive }) => {
  const id = params.id; const { data: t } = await sb.from('forum_threads').select('*').eq('id', id).maybeSingle(); if (!alive()) return; if (!t) return go('/forum', true);
  const draw = async () => {
    const { data: ps } = await sb.from('forum_posts').select('*').eq('thread_id', id).order('created_at');
    $('#ps', el).innerHTML = (ps || []).map(p => `<div class="card pad mb"><div class="row between"><b>${esc(p.author_name || '')}</b><small class="muted">${esc(fmtDate(p.created_at) + ' ' + fmtTime(p.created_at))}</small></div><p class="pre">${esc(p.body)}</p>${p.author_id === state.user.id || staff() ? `<button class="btn sm ghost" data-d="${p.id}">${ic('trash', 14)}</button>` : ''}</div>`).join('') || `<p class="muted">${esc(T('Hali javob yo\'q', 'Ответов пока нет', 'No replies yet'))}</p>`;
    $$('[data-d]', el).forEach(b => b.onclick = async () => { if (!(await confirmDlg(T('O\'chirilsinmi?', 'Удалить?', 'Delete?')))) return; await sb.from('forum_posts').delete().eq('id', b.dataset.d); draw(); });
  };
  el.innerHTML = `<div class="page narrow"><div class="row"><a class="btn ghost sm" href="#/forum">${ic('back')}</a><h2 class="mb0 grow">${esc(t.title)}</h2>${staff() ? `<button class="btn sm ghost" id="pn">${esc(t.pinned ? T('Yechish', 'Открепить', 'Unpin') : T('Mahkamlash', 'Закрепить', 'Pin'))}</button><button class="btn sm ghost" id="lk">${esc(t.locked ? T('Ochish', 'Открыть', 'Unlock') : T('Yopish', 'Закрыть', 'Lock'))}</button>` : ''}${t.author_id === state.user.id || staff() ? `<button class="btn sm danger" id="dt">${ic('trash', 14)}</button>` : ''}</div>
    <div class="card pad mt"><small class="muted">${esc(t.author_name || '')} · ${esc(fmtDate(t.created_at))}</small><p class="pre">${esc(t.body)}</p></div><h3 class="mt">${esc(T('Javoblar', 'Ответы', 'Replies'))}</h3><div id="ps">${spinner()}</div>
    ${t.locked && !staff() ? `<p class="muted center">🔒 ${esc(T('Mavzu yopilgan', 'Тема закрыта', 'Topic is locked'))}</p>` : `<form class="card pad form mt" id="f"><textarea class="input" id="b" rows="3" required maxlength="4000" placeholder="${esc(T('Javobingiz…', 'Ваш ответ…', 'Your reply…'))}"></textarea><button class="btn">${esc(T('Javob berish', 'Ответить', 'Reply'))}</button></form>`}</div>`;
  $('#f', el)?.addEventListener('submit', async e => { e.preventDefault(); const { error } = await sb.from('forum_posts').insert({ thread_id: id, author_id: state.user.id, body: $('#b', el).value.trim() }); if (error) return toast(dbErr(error), 'err'); e.target.reset(); draw(); });
  $('#pn', el)?.addEventListener('click', async () => { await sb.from('forum_threads').update({ pinned: !t.pinned }).eq('id', id); location.reload(); });
  $('#lk', el)?.addEventListener('click', async () => { await sb.from('forum_threads').update({ locked: !t.locked }).eq('id', id); location.reload(); });
  $('#dt', el)?.addEventListener('click', async () => { if (!(await confirmDlg(T('Mavzu o\'chirilsinmi?', 'Удалить тему?', 'Delete topic?')))) return; await sb.from('forum_threads').delete().eq('id', id); go('/forum'); });
  draw();
}, { auth: true });
