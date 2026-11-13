// Testlar markazi: adaptiv mashq, xatolar daftari, kunlik savol, natijalar tarixi
import { sb, state, tr, route, go, esc, ic, $, $$, toast, spinner, fmtDate, shuffle } from './core.js';
import { T, skeleton, empty, errBox, pct, bar, dbErr, announceAchievements } from './ui.js';
import { refreshStats } from './xp.js';

route('/tests', async ({ el, alive }) => {
  el.innerHTML = `<div class="page"><h1>${esc(T('Testlar', 'Тесты', 'Tests'))}</h1><div id="th">${skeleton(3, 80)}</div></div>`;
  const [{ data: mm }, { data: its }, { data: at }] = await Promise.all([sb.rpc('my_mistakes'), sb.from('items').select('id,title,folder_id').eq('kind', 'test').order('created_at', { ascending: false }).limit(60), sb.from('test_attempts').select('id,item_id,percent,correct,total,created_at').order('created_at', { ascending: false }).limit(15)]);
  if (!alive()) return; const nm = (mm || []).length, tt = Object.fromEntries((its || []).map(i => [i.id, tr(i.title)]));
  $('#th', el).innerHTML = `<div class="hub"><a class="hubc" href="#/practice?mode=adaptive"><span class="item-ic">${ic('zap', 20)}</span><div><b>${esc(T('Adaptiv mashq', 'Адаптивная практика', 'Adaptive practice'))}</b><br><small class="muted">${esc(T('Avval xatolaringiz, keyin yangi savollar', 'Сначала ваши ошибки, затем новые вопросы', 'Your mistakes first, then new questions'))}</small></div></a>
    <a class="hubc" href="#/practice?mode=mistakes"><span class="item-ic">${ic('flag', 20)}</span><div><b>${esc(T('Xatolar daftari', 'Дневник ошибок', 'Mistakes notebook'))} (${nm})</b><br><small class="muted">${esc(T('Noto\'g\'ri javoblar ustida ishlash', 'Работа над ошибками', 'Work on wrong answers'))}</small></div></a>
    <a class="hubc" href="#/practice?mode=daily"><span class="item-ic">${ic('star', 20)}</span><div><b>${esc(T('Kunlik savol', 'Вопрос дня', 'Question of the day'))}</b><br><small class="muted">${esc(T('Har kuni bitta yangi savol', 'Каждый день новый вопрос', 'A new question every day'))}</small></div></a></div>
    <h3 class="mt">${esc(T('Mavzu testlari', 'Тесты по темам', 'Topic tests'))}</h3>${(its || []).length ? `<div class="cards">${its.map(i => `<a class="card pad item-row" href="#/test/${i.id}"><span class="item-ic">${ic('test', 18)}</span><b class="grow">${esc(tr(i.title))}</b>${ic('chev', 16)}</a>`).join('')}</div>` : empty('test', T('Testlar hali qo\'shilmagan', 'Тестов пока нет', 'No tests yet'))}
    <h3 class="mt">${esc(T('Natijalar tarixi', 'История результатов', 'Results history'))}</h3>${(at || []).length ? `<div class="tblwrap"><table class="tbl2"><tbody>${at.map(a => `<tr><td>${esc(tt[a.item_id] || T('Mashq', 'Практика', 'Practice'))}</td><td>${esc(fmtDate(a.created_at))}</td><td>${a.correct}/${a.total}</td><td><b>${Math.round(a.percent)}%</b></td></tr>`).join('')}</tbody></table></div>` : `<p class="muted">${esc(T('Hali test yechilmagan', 'Тесты ещё не проходились', 'No attempts yet'))}</p>`}`;
}, { auth: true });

route('/practice', async ({ el, q, alive }) => {
  const mode = ['mistakes', 'daily'].includes(q.mode) ? q.mode : 'adaptive';
  el.innerHTML = `<div class="page narrow">${spinner()}</div>`;
  let list = [];
  if (mode === 'mistakes') { const { data, error } = await sb.rpc('my_mistakes'); if (error) { el.innerHTML = `<div class="page">${errBox(dbErr(error))}</div>`; return; } list = (data || []).slice(0, 20).map(m => ({ id: m.question_id, item_id: m.item_id, question: m.question, correct: m.correct, wrong: m.wrong, explanation: m.explanation })); }
  else if (mode === 'daily') { const { data, error } = await sb.rpc('adaptive_questions', { p_item: q.item || null, p_n: 50 }); if (error) { el.innerHTML = `<div class="page">${errBox(dbErr(error))}</div>`; return; } const day = Math.floor(Date.now() / 864e5); const all = (data || []).sort((a, b) => a.id.localeCompare(b.id)); list = all.length ? [all[day % all.length]] : []; }
  else { const { data, error } = await sb.rpc('adaptive_questions', { p_item: q.item || null, p_n: 15 }); if (error) { el.innerHTML = `<div class="page">${errBox(dbErr(error))}</div>`; return; } list = data || []; }
  if (!alive()) return;
  if (!list.length) { el.innerHTML = `<div class="page narrow">${empty('test', mode === 'mistakes' ? T('Xatolar yo\'q — ajoyib!', 'Ошибок нет — отлично!', 'No mistakes — great!') : T('Savollar topilmadi. Avval biror testni yeching.', 'Вопросов нет. Сначала пройдите любой тест.', 'No questions yet. Take a test first.'), `<a class="btn" href="#/tests">${esc(T('Testlarga', 'К тестам', 'Back to tests'))}</a>`)}</div>`; return; }
  let i = 0, ok = 0; const wrongIds = [], t0 = Date.now(), items = new Set();
  const show = () => {
    if (i >= list.length) return finish(); const c = list[i]; items.add(c.item_id); const opts = shuffle([c.correct, ...(c.wrong || [])]);
    el.innerHTML = `<div class="page narrow"><div class="row"><a class="btn ghost sm" href="#/tests">${ic('back')}</a><div class="grow">${bar(pct(i, list.length))}</div><small class="muted">${i + 1}/${list.length}</small></div>
      <div class="card pad mt"><h3 style="font-size:1.15rem">${esc(c.question)}</h3><div class="cards mt cols1" id="op">${opts.map((o, k) => `<button class="card pad left" data-o="${k}" style="text-align:left;cursor:pointer;font:inherit">${esc(o)}</button>`).join('')}</div><div id="ex" class="mt"></div></div></div>`;
    $$('[data-o]', el).forEach(b => b.onclick = async () => { const good = opts[+b.dataset.o] === c.correct; $$('[data-o]', el).forEach(x => { x.disabled = true; if (opts[+x.dataset.o] === c.correct) x.style.borderColor = 'var(--ok)'; }); if (!good) b.style.borderColor = 'var(--bad)';
      if (good) { ok++; if (mode !== 'adaptive' || c.was_wrong) sb.rpc('resolve_mistake', { p_question: c.id }).then(() => {}); } else wrongIds.push(c.id);
      $('#ex', el).innerHTML = `${c.explanation ? `<p class="muted">${esc(c.explanation)}</p>` : ''}<button class="btn block" id="nx">${esc(i + 1 < list.length ? T('Keyingi', 'Далее', 'Next') : T('Yakunlash', 'Завершить', 'Finish'))}</button>`; $('#nx', el).onclick = () => { i++; show(); }; $('#nx', el).focus(); });
  };
  const finish = async () => {
    const p = Math.round(ok / list.length * 1000) / 10; let gain = 0;
    if (mode !== 'daily' && list.length >= 3) { const single = items.size === 1 ? [...items][0] : null; const { data: at } = await sb.from('test_attempts').insert({ user_id: state.user.id, item_id: single, total: list.length, correct: ok, percent: p, duration_s: Math.round((Date.now() - t0) / 1000), chapters: [], wrong_ids: wrongIds }).select('id').single();
      if (at) { const { data: x } = await sb.rpc('claim_test_xp', { p_attempt: at.id }); gain = x?.xp || 0; announceAchievements(x?.achievements); } }
    refreshStats();
    el.innerHTML = `<div class="page narrow"><div class="card pad center"><h2>${Math.round(p)}%</h2><p>${ok}/${list.length} ${esc(T('to\'g\'ri', 'верно', 'correct'))}${gain ? ` · +${gain} XP` : ''}</p><div class="row" style="justify-content:center;gap:10px"><a class="btn" href="#/practice?mode=${mode}">${esc(T('Yana', 'Ещё раз', 'Again'))}</a><a class="btn ghost" href="#/tests">${esc(T('Testlar', 'Тесты', 'Tests'))}</a></div></div></div>`;
  };
  show();
}, { auth: true });
