// Flesh-kartalar: to'plamlar, o'rganish (SM-2 server tomonda), statistika
import { sb, state, route, go, esc, ic, $, $$, modal, toast, btnBusy, confirmDlg, spinner } from './core.js';
import { T, skeleton, empty, errBox, bar, pct, dbErr, announceAchievements } from './ui.js';
import { refreshStats } from './xp.js';

route('/cards', async ({ el, alive }) => {
  el.innerHTML = `<div class="page"><div class="row between"><h1>${esc(T('Flesh-kartalar', 'Карточки', 'Flashcards'))}</h1><button class="btn" id="nd">${ic('plus', 16)} ${esc(T('Yangi to\'plam', 'Новая колода', 'New deck'))}</button></div><div id="fc">${skeleton(3, 80)}</div></div>`;
  const load = async () => {
    const [st, { data: decks, error }, { data: cards }, { data: cs }] = await Promise.all([sb.rpc('card_stats'), sb.from('flash_decks').select('*').order('created_at', { ascending: false }), sb.from('flash_cards').select('id,deck_id'), sb.from('card_state').select('card_id,reps')]);
    if (!alive()) return; if (error) { $('#fc', el).innerHTML = errBox(dbErr(error), 'rt'); $('#rt', el).onclick = load; return; }
    const s = st.data || {}, per = {}; (cards || []).forEach(c => per[c.deck_id] = (per[c.deck_id] || 0) + 1);
    const learned = new Set((cs || []).filter(x => x.reps >= 1).map(x => x.card_id)), lper = {}; (cards || []).forEach(c => { if (learned.has(c.id)) lper[c.deck_id] = (lper[c.deck_id] || 0) + 1; });
    const days = s.days || [], mx = Math.max(1, ...days.map(d => d.n));
    $('#fc', el).innerHTML = `<div class="statrow"><div class="sbox"><b>${s.due ?? 0}</b><small>${esc(T('Takrorlash navbati', 'К повторению', 'Due now'))}</small></div><div class="sbox"><b>${s.today ?? 0}</b><small>${esc(T('Bugun', 'Сегодня', 'Today'))}</small></div><div class="sbox"><b>${s.learned ?? 0}/${s.total ?? 0}</b><small>${esc(T('O\'rganilgan', 'Изучено', 'Learned'))}</small></div><div class="sbox"><b>${s.retention == null ? '—' : s.retention + '%'}</b><small>${esc(T('Eslab qolish', 'Запоминание', 'Retention'))}</small></div></div>
      ${days.length ? `<div class="card pad mt"><small class="muted">${esc(T('Oxirgi 14 kun', 'Последние 14 дней', 'Last 14 days'))}</small><div style="display:flex;gap:4px;align-items:flex-end;height:60px">${days.map(d => `<i title="${d.day}: ${d.n}" style="flex:1;background:var(--brand);border-radius:4px;height:${Math.max(6, d.n / mx * 100)}%"></i>`).join('')}</div></div>` : ''}
      <a class="btn lg block mt ${(s.due || 0) + 1 ? '' : 'ghost'}" href="#/cards/study">${ic('layers', 18)} ${esc(T('Bugungi navbatni boshlash', 'Начать сегодняшнюю очередь', 'Start today\'s queue'))}</a>
      <h3 class="mt">${esc(T('To\'plamlar', 'Колоды', 'Decks'))}</h3>${(decks || []).length ? `<div class="cards">${decks.map(d => `<div class="card pad"><div class="row between"><b>${esc(d.title)}</b>${d.is_public ? `<span class="tg">${esc(T('Ommaviy', 'Публичная', 'Public'))}</span>` : ''}</div><small class="muted">${per[d.id] || 0} ${esc(T('karta', 'карточек', 'cards'))}</small>${bar(pct(lper[d.id] || 0, per[d.id] || 0))}
        <div class="row mt" style="gap:8px"><a class="btn sm" href="#/cards/study?deck=${d.id}">${esc(T('O\'rganish', 'Учить', 'Study'))}</a>${d.owner_id === state.user.id || state.isAdmin ? `<a class="btn sm ghost" href="#/cards/deck/${d.id}">${ic('edit', 14)}</a>` : ''}</div></div>`).join('')}</div>` : empty('layers', T('Hali to\'plam yo\'q — birinchisini yarating', 'Колод пока нет — создайте первую', 'No decks yet — create your first'))}`;
  };
  $('#nd', el).onclick = () => { const staff = state.profile?.role !== 'user'; const m = modal(`<h3>${esc(T('Yangi to\'plam', 'Новая колода', 'New deck'))}</h3><form class="form" id="f"><label class="fld"><span>${esc(T('Nomi', 'Название', 'Title'))}</span><input class="input" id="t" maxlength="120" required></label>
    ${staff ? `<label class="chip" style="cursor:pointer"><input type="checkbox" id="pb"> ${esc(T('Hamma ko\'ra oladi (ommaviy)', 'Видна всем (публичная)', 'Visible to everyone (public)'))}</label>` : ''}<button class="btn lg block">${esc(T('Yaratish', 'Создать', 'Create'))}</button></form>`);
    $('#f', m.el).onsubmit = async e => { e.preventDefault(); const { data, error } = await sb.from('flash_decks').insert({ owner_id: state.user.id, title: $('#t', m.el).value.trim(), is_public: !!$('#pb', m.el)?.checked }).select('id').single(); if (error) return toast(dbErr(error), 'err'); m.close(); go('/cards/deck/' + data.id); }; };
  await load();
}, { auth: true });

route('/cards/deck/:id', async ({ el, params, alive }) => {
  const id = params.id; const { data: d } = await sb.from('flash_decks').select('*').eq('id', id).maybeSingle();
  if (!alive()) return; if (!d) return go('/cards', true);
  const mine = d.owner_id === state.user.id || state.isAdmin;
  const draw = async () => {
    const { data: cs } = await sb.from('flash_cards').select('*').eq('deck_id', id).order('position').order('created_at');
    $('#cl', el).innerHTML = (cs || []).length ? (cs).map(c => `<div class="card pad mb"><div class="row between"><div class="grow"><b>${esc(c.front)}</b><br><span class="muted">${esc(c.back)}</span></div>${mine ? `<button class="icon-btn" data-d="${c.id}" aria-label="delete">${ic('trash', 18)}</button>` : ''}</div></div>`).join('') : empty('layers', T('Kartalar yo\'q', 'Карточек нет', 'No cards'));
    $$('[data-d]', el).forEach(b => b.onclick = async () => { if (!(await confirmDlg(T('O\'chirilsinmi?', 'Удалить?', 'Delete?')))) return; await sb.from('flash_cards').delete().eq('id', b.dataset.d); draw(); });
  };
  el.innerHTML = `<div class="page narrow"><div class="row"><a class="btn ghost sm" href="#/cards">${ic('back')}</a><h2 class="mb0 grow">${esc(d.title)}</h2>${mine ? `<button class="btn danger sm" id="dd">${ic('trash', 14)}</button>` : ''}</div>
    ${mine ? `<form class="card pad form mt" id="f"><label class="fld"><span>${esc(T('Old tomoni (savol)', 'Лицевая сторона (вопрос)', 'Front (question)'))}</span><input class="input" id="fr" maxlength="600" required></label><label class="fld"><span>${esc(T('Orqa tomoni (javob)', 'Обратная сторона (ответ)', 'Back (answer)'))}</span><textarea class="input" id="bk" rows="2" maxlength="1200" required></textarea></label><button class="btn">${ic('plus', 16)} ${esc(T('Qo\'shish', 'Добавить', 'Add'))}</button></form>
      <details class="card pad mt"><summary>${esc(T('Ko\'p kartani birdan qo\'shish', 'Массовое добавление', 'Bulk add'))}</summary><p class="muted small">${esc(T('Har qatorda: savol | javob', 'В каждой строке: вопрос | ответ', 'One per line: question | answer'))}</p><textarea class="input" id="bulk" rows="5"></textarea><button class="btn sm mt" id="bb">${esc(T('Qo\'shish', 'Добавить', 'Add'))}</button></details>` : ''}
    <div class="row between mt"><h3>${esc(T('Kartalar', 'Карточки', 'Cards'))}</h3><a class="btn sm" href="#/cards/study?deck=${id}">${esc(T('O\'rganish', 'Учить', 'Study'))}</a></div><div id="cl">${spinner()}</div></div>`;
  $('#f', el)?.addEventListener('submit', async e => { e.preventDefault(); const { error } = await sb.from('flash_cards').insert({ deck_id: id, front: $('#fr', el).value.trim(), back: $('#bk', el).value.trim() }); if (error) return toast(dbErr(error), 'err'); e.target.reset(); draw(); });
  $('#bb', el)?.addEventListener('click', async () => { const rows = $('#bulk', el).value.split('\n').map(l => l.split('|')).filter(p => p.length >= 2 && p[0].trim() && p[1].trim()).map(p => ({ deck_id: id, front: p[0].trim().slice(0, 600), back: p.slice(1).join('|').trim().slice(0, 1200) }));
    if (!rows.length) return toast(T('Format: savol | javob', 'Формат: вопрос | ответ', 'Format: question | answer'), 'err'); const { error } = await sb.from('flash_cards').insert(rows); if (error) return toast(dbErr(error), 'err'); $('#bulk', el).value = ''; toast(rows.length + ' ✔', 'ok'); draw(); });
  $('#dd', el)?.addEventListener('click', async () => { if (!(await confirmDlg(T('To\'plam o\'chirilsinmi?', 'Удалить колоду?', 'Delete the deck?')))) return; await sb.from('flash_decks').delete().eq('id', id); go('/cards'); });
  draw();
}, { auth: true });

route('/cards/study', async ({ el, q, alive }) => {
  el.innerHTML = `<div class="page narrow">${spinner()}</div>`;
  const { data, error } = await sb.rpc('due_cards', { p_deck: q.deck || null, p_limit: 30, p_new: 10 });
  if (!alive()) return; if (error) { el.innerHTML = `<div class="page">${errBox(dbErr(error))}</div>`; return; }
  const queue = [...(data || [])]; let total = queue.length, done = 0, xp = 0, again = [];
  const show = () => {
    if (!queue.length) { refreshStats(); el.innerHTML = `<div class="page narrow">${empty('check', total ? T(`Ajoyib! ${total} ta karta takrorlandi (+${xp} XP)`, `Отлично! Повторено карточек: ${total} (+${xp} XP)`, `Great! ${total} cards reviewed (+${xp} XP)`) : T('Bugun takrorlash uchun karta yo\'q', 'На сегодня карточек нет', 'Nothing due today'), `<a class="btn" href="#/cards">${esc(T('To\'plamlarga', 'К колодам', 'Back to decks'))}</a>`)}</div>`; return; }
    const c = queue[0];
    el.innerHTML = `<div class="page narrow"><div class="row"><a class="btn ghost sm" href="#/cards">${ic('back')}</a><div class="grow">${bar(pct(done, total))}</div><small class="muted">${done}/${total}</small></div>
      <div class="fcard-wrap"><div class="fcard" id="fc" tabindex="0" role="button" aria-label="flip"><div class="fface">${esc(c.front)}</div><div class="fface bk">${esc(c.back)}</div></div></div>
      <p class="center muted small">${c.is_new ? esc(T('Yangi karta', 'Новая карточка', 'New card')) : esc(c.deck_title)} · ${esc(T('aylantirish uchun bosing', 'нажмите, чтобы перевернуть', 'tap to flip'))}</p>
      <div class="gbtns" id="gb" hidden><button class="btn" data-g="0">${esc(T('Takrorlash', 'Повторить', 'Again'))}</button><button class="btn" data-g="1">${esc(T('Qiyin', 'Трудно', 'Hard'))}</button><button class="btn" data-g="2">${esc(T('Bilaman', 'Знаю', 'Know'))}</button></div></div>`;
    const fc = $('#fc', el), flip = () => { fc.classList.toggle('flip'); $('#gb', el).hidden = !fc.classList.contains('flip'); }; fc.onclick = flip; fc.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } };
    $$('[data-g]', el).forEach(b => b.onclick = async () => { $$('[data-g]', el).forEach(x => x.disabled = true); const g = +b.dataset.g;
      const { data: r, error: er } = await sb.rpc('review_card', { p_card: c.card_id, p_grade: g }); if (er) { toast(dbErr(er), 'err'); $$('[data-g]', el).forEach(x => x.disabled = false); return; }
      xp += r.xp || 0; queue.shift(); if (g === 0) queue.push(c); else done++; show(); });
  };
  show();
}, { auth: true });
