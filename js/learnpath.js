// Kurs 2.0: kurs tanlagich → boblar → mavzu xaritasi → mavzu qismlari (kitob, taqdimot, video, kartochka, test)
import { sb, state, tr, route, go, esc, ic, $, $$, toast, modal, btnBusy } from './core.js';
import { T, skeleton, empty, errBox, pct as pc, bar, dbErr } from './ui.js';
import { paidNow } from './billing.js';

const GRAD = [['#34c38f', '#0f9b6c'], ['#5b8def', '#3a5fcf'], ['#f6a04d', '#e0701f'], ['#b36bf2', '#7d3bd1'], ['#ef6f8e', '#d23b63'], ['#22b8cf', '#0b8fa3']];
const EMO = ['🧬', '🌿', '🔬', '🦋', '🌍', '🧪', '🦠', '🐾'];
const KL = () => ({ text: T('Kitob', 'Книга', 'Book'), slides: T('Taqdimot', 'Презентация', 'Slides'), video: T('Video', 'Видео', 'Video'), audio: T('Audio', 'Аудио', 'Audio'), document: T('Hujjat', 'Документ', 'Document'), cards: T('Kartochkalar', 'Карточки', 'Cards'), test: T('Test', 'Тест', 'Test') });
const KI = { text: 'book', video: 'video', audio: 'audio', document: 'file', test: 'test', slides: 'layers', cards: 'list' };
const stars = (p, thr) => (p >= 95 ? 3 : p >= 80 ? 2 : p >= thr ? 1 : 0);
const starHtml = n => `<span class="lp-st">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}">★</i>`).join('')}</span>`;
const remember = id => { try { localStorage.setItem('bio.course', id); } catch { /* */ } };
const recall = () => { try { return localStorage.getItem('bio.course'); } catch { return null; } };

function chCover(ch, i) {
  const g = GRAD[i % GRAD.length], cv = ch.cover || '';
  const img = /^https?:/.test(cv) ? `<img src="${esc(cv)}" alt="" loading="lazy">` : cv.startsWith('r2:') ? `<img data-r2="${esc(cv.slice(3))}" alt="" loading="lazy">` : '';
  return `<div class="lp-cov" style="background:linear-gradient(135deg,${g[0]},${g[1]})"><span class="lp-emo">${EMO[i % EMO.length]}</span>${img}</div>`;
}
async function fillR2(el) {
  const nodes = $$('img[data-r2]', el); if (!nodes.length) return;
  const { r2Src } = await import('./r2.js');
  for (const n of nodes) { try { n.src = await r2Src(n.dataset.r2); } catch { /* */ } }
}

// ---- ma'lumot yuklash va hisoblash ----
async function load(cid) {
  const uid = state.user.id;
  const [{ data: c, error }, { data: chs }, { data: secs }, { data: ls }, { data: lp }, { data: pp }, { data: gr }] = await Promise.all([
    sb.from('courses').select('*').eq('id', cid).maybeSingle(),
    sb.from('course_chapters').select('*').eq('course_id', cid).order('position'),
    sb.from('course_sections').select('*').eq('course_id', cid).order('position'),
    sb.from('lessons').select('id,section_id,title,kind,item_id,xp,position,created_at').eq('course_id', cid).order('position'),
    sb.from('lesson_progress').select('lesson_id').eq('course_id', cid),
    sb.from('lesson_pct').select('lesson_id,pct').eq('course_id', cid), sb.from('course_grants').select('upto').eq('course_id', cid).eq('user_id', uid).maybeSingle()]);
  if (error || !c) return null;
  const ids = (ls || []).filter(l => l.item_id).map(l => l.item_id);
  const att = {};
  if (ids.length) { const { data: at } = await sb.from('test_attempts').select('item_id,percent').eq('user_id', uid).in('item_id', ids); (at || []).forEach(a => { att[a.item_id] = Math.max(att[a.item_id] || 0, a.percent || 0); }); }
  const staff = state.isAdmin || state.profile?.role === 'teacher';
  const free = !c.is_premium || staff || c.author_id === uid || await paidNow();
  const allFree = free;
  const done = new Set((lp || []).map(x => x.lesson_id)), pm = Object.fromEntries((pp || []).map(x => [x.lesson_id, x.pct]));
  const thrOf = k => (k === 'review' ? c.review_pct : k === 'final' ? c.final_pct : c.unlock_pct) ?? 60;
  // bo'limlar (mavzu / takrorlash / yakuniy)
  let S = (secs || []).map(s => ({ ...s, kind: s.kind || 'topic', parts: (ls || []).filter(l => l.section_id === s.id) }));
  const loose = (ls || []).filter(l => !l.section_id || !(secs || []).some(s => s.id === l.section_id));
  if (loose.length) S.unshift({ id: 'loose', title: { uz: 'Umumiy darslar', ru: 'Общие уроки', en: 'General lessons' }, kind: 'topic', chapter_id: null, parts: loose });
  S = S.filter(s => s.parts.length);
  const allowed = Math.max(c.free_topics ?? 1, gr?.upto ?? 0); let ordc = 0;
  S.forEach(s => {
    if (s.kind === 'topic' && s.id !== 'loose') ordc++; s.ord = s.id === 'loose' ? 0 : ordc; s.pay = !free && s.ord > allowed;
    s.thr = thrOf(s.kind);
    s.parts.forEach(l => { const isT = l.kind === 'test' && l.item_id; l.done = done.has(l.id); l.p = isT ? (att[l.item_id] ?? 0) : (pm[l.id] ?? 0); if (l.done && !isT && !l.p) l.p = 100; if (l.done && isT && l.p < s.thr) l.p = Math.max(l.p, s.thr); });
    s.pct = Math.round(s.parts.reduce((a, l) => a + l.p, 0) / s.parts.length); s.passed = s.parts.every(l => l.done);
  });
  S.forEach((s, i) => { const pv = S[i - 1]; s.locked = !staff && !!pv && !pv.passed; s.prev = pv || null; s.parts.forEach((l, k) => { l.locked = s.locked || (!staff && k > 0 && !s.parts[k - 1].done); }); });
  // boblar
  let C = (chs || []).map(ch => ({ ...ch, secs: S.filter(s => s.chapter_id === ch.id) }));
  const orphan = S.filter(s => !s.chapter_id || !C.some(ch => ch.id === s.chapter_id));
  if (orphan.length) C.push({ id: 'x', title: { uz: 'Mavzular', ru: 'Темы', en: 'Topics' }, cover: null, secs: orphan });
  C = C.filter(ch => ch.secs.length);
  C.forEach((ch, i) => { ch.i = i; ch.pct = Math.round(ch.secs.reduce((a, s) => a + s.pct, 0) / ch.secs.length); ch.passed = ch.secs.every(s => s.passed); ch.locked = ch.secs[0].locked; ch.topics = ch.secs.filter(s => s.kind === 'topic').length; });
  const all = S.flatMap(s => s.parts);
  S.forEach(s => s.parts.forEach(l => { l.pay = s.pay; }));
  const total = all.length ? Math.round(all.reduce((a, l) => a + l.p, 0) / all.length) : 0;
  return { c, C, S, staff, free: allFree, total, uid, allowed };
}
// ruxsat yo'q: adminga yozish (xabar kurs nomi va mavzu bilan avtomatik yuboriladi)
export function askAdmin(d, s) {
  const cn = tr(d.c.title), tn = s ? tr(s.title) : '';
  const m = modal(`<h3>🔒 ${esc(T('Bu qismga ruxsat yo\'q', 'Нет доступа к этой части', 'No access to this part'))}</h3>
    <p>${esc(T(`«${cn}» kursida ${d.allowed}-mavzugacha ochiq. Davom etish uchun adminga murojaat qiling.`, `В курсе «${cn}» открыто до темы ${d.allowed}. Чтобы продолжить, обратитесь к админу.`, `In «${cn}» topics up to ${d.allowed} are open. Contact the admin to continue.`))}</p>
    <p class="muted small">${esc(T('Adminga yozasizmi? Xabar kurs nomi bilan yuboriladi.', 'Написать админу? Сообщение уйдёт с названием курса.', 'Message the admin? It will include the course name.'))}</p>
    <div class="row end" style="gap:8px;flex-wrap:wrap"><button class="btn ghost" id="ax-n">${esc(T('Yo\'q', 'Нет', 'No'))}</button><button class="btn" id="ax-y">${ic('chat', 16)} ${esc(T('Ha, adminga yozish', 'Да, написать админу', 'Yes, message admin'))}</button></div>`);
  $('#ax-n', m.el).onclick = m.close;
  $('#ax-y', m.el).onclick = async e => {
    btnBusy(e.currentTarget, true);
    const body = T(`Salom! «${cn}» kursida ${tn ? '«' + tn + '» mavzusiga ' : ''}ruxsat so'rayman.`, `Здравствуйте! Прошу доступ к курсу «${cn}»${tn ? ', тема «' + tn + '»' : ''}.`, `Hello! I'd like access to the course «${cn}»${tn ? ', topic «' + tn + '»' : ''}.`);
    await sb.from('direct_messages').insert({ thread_user: state.user.id, sender_id: state.user.id, topic: 'help', kind: 'text', body });
    m.close(); go('/inbox?topic=help&ctx=' + encodeURIComponent(cn));
  };
}
const lockMsg = s => T(`Avval oldingi qismni bajaring (kamida ${s}%)`, `Сначала пройдите предыдущую часть (минимум ${s}%)`, `Finish the previous step first (at least ${s}%)`);

// ---- kurs tanlagich (pastdan chiqadigan oyna) ----
async function openSheet(curId) {
  const { data } = await (state.isAdmin ? sb.from('courses').select('id,title,grade,is_premium,status').order('grade', { nullsFirst: false }) : sb.from('courses').select('id,title,grade,is_premium,status').eq('status', 'published').order('grade', { nullsFirst: false }));
  const bg = document.createElement('div'); bg.className = 'lp-sheet-bg';
  bg.innerHTML = `<div class="lp-sheet" role="dialog"><div class="lp-grab"></div><h3>${esc(T('Kursni tanlang', 'Выберите курс', 'Choose a course'))}</h3>
    ${(data || []).map((c, i) => `<a class="lp-ci ${c.id === curId ? 'on' : ''}" href="#/course/${c.id}"><span class="lp-ico" style="background:linear-gradient(135deg,${GRAD[i % 6][0]},${GRAD[i % 6][1]})">${c.grade || '★'}</span><span class="grow"><b>${esc(tr(c.title))}</b><small class="muted">${c.grade ? c.grade + '-' + esc(T('sinf', 'класс', 'grade')) : ''}${c.status !== 'published' ? ' · ' + esc(T('yashirin', 'скрыт', 'hidden')) : ''}</small></span>${c.is_premium ? '<span class="tg pr">Premium</span>' : '<span class="tg">' + esc(T('Bepul', 'Бесплатно', 'Free')) + '</span>'}${c.id === curId ? ic('check', 18) : ''}</a>`).join('') || `<p class="muted">${esc(T('Kurslar yo\'q', 'Курсов нет', 'No courses'))}</p>`}
    <a class="btn ghost block mt" href="#/courses/all">${esc(T('Barcha kurslar (katalog)', 'Все курсы (каталог)', 'All courses (catalog)'))}</a></div>`;
  document.body.appendChild(bg); requestAnimationFrame(() => bg.classList.add('on'));
  const close = () => { bg.classList.remove('on'); setTimeout(() => bg.remove(), 200); };
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('a')) close(); });
}

// ---- 1) boblar ----
async function chaptersView(el, cid, alive) {
  el.innerHTML = `<div class="page lp">${skeleton(3, 150)}</div>`;
  const d = await load(cid); if (!alive()) return;
  if (!d) { el.innerHTML = `<div class="page lp">${empty('cap', T('Kurs topilmadi yoki yopiq', 'Курс не найден или закрыт', 'Course not found or not available'))}<p class="center"><a class="btn" href="#/courses/all">${esc(T('Barcha kurslar', 'Все курсы', 'All courses'))}</a></p></div>`; return; }
  remember(cid); const { c, C, total } = d;
  el.innerHTML = `<div class="page lp">
    <div class="lp-top"><button class="lp-course" id="cs">${ic('cap', 20)}<span class="grow">${esc(tr(c.title))}</span><span class="lp-car">▾</span></button></div>
    <div class="lp-sum card pad"><div class="row between"><b>${esc(T('Kurs bo\'yicha progress', 'Прогресс по курсу', 'Course progress'))}</b><b>${total}%</b></div>${bar(total)}
      <div class="row mt" style="gap:8px;flex-wrap:wrap"><a class="btn ghost sm" href="#/cinfo/${cid}">${esc(T('Kurs haqida', 'О курсе', 'About'))}</a><a class="btn ghost sm" href="#/inbox?topic=help&ctx=${encodeURIComponent(tr(c.title))}">${ic('help', 14)} ${esc(T('Adminga yozish', 'Написать админу', 'Message admin'))}</a>${d.staff ? `<a class="btn ghost sm" href="#/teach/course/${cid}">${ic('edit', 14)} ${esc(T('Tahrirlash', 'Редактировать', 'Edit'))}</a>` : ''}</div></div>
    ${!d.free ? `<div class="card pad paynote mt"><b>${ic('lock', 16)} ${esc(T('Pullik kurs', 'Платный курс', 'Paid course'))}</b><p class="muted small mb0">${esc(T(`${d.allowed}-mavzugacha ochiq. Qolganini ochish uchun adminga murojaat qiling.`, `Открыто до темы ${d.allowed}. Для остального обратитесь к админу.`, `Topics up to ${d.allowed} are open. Contact the admin for the rest.`))}</p><button class="btn sm mt" id="ask">${ic('chat', 14)} ${esc(T('Adminga yozish', 'Написать админу', 'Message admin'))}</button></div>` : ''}
    <h3 class="mt">${esc(T('Boblar', 'Главы', 'Chapters'))}</h3>
    ${C.length ? `<div class="lp-chs">${C.map(ch => `<a class="lp-ch ${ch.locked ? 'lock' : ''}" href="#/chapter/${cid}/${ch.id}" data-i="${ch.i}">${chCover(ch, ch.i)}<span class="lp-badge">${ch.i + 1}-${esc(T('bob', 'глава', 'ch.'))}</span>${ch.locked ? `<span class="lp-lk">${ic('lock', 22)}</span>` : ch.passed ? `<span class="lp-ok">${ic('check', 18)}</span>` : ''}
      <div class="lp-cb"><b>${esc(tr(ch.title))}</b><small class="muted">${ch.topics} ${esc(T('mavzu', 'тем', 'topics'))} · ${ch.pct}%</small>${bar(ch.pct)}</div></a>`).join('')}</div>`
      : empty('list', T('Bu kursda hali boblar yo\'q', 'В курсе пока нет глав', 'No chapters yet'))}</div>`;
  $('#cs', el).onclick = () => openSheet(cid);
  $('#ask', el)?.addEventListener('click', () => askAdmin(d, null));
  $$('.lp-ch.lock', el).forEach(a => a.onclick = e => { e.preventDefault(); toast(T('Avval oldingi bobni tugating', 'Сначала завершите предыдущую главу', 'Finish the previous chapter first')); });
  fillR2(el);
}
route('/courses', async ({ el, alive }) => {
  el.innerHTML = `<div class="page lp">${skeleton(3, 150)}</div>`;
  const { data } = await (state.isAdmin ? sb.from('courses').select('id,grade').order('grade') : sb.from('courses').select('id,grade').eq('status', 'published').order('grade'));
  if (!alive()) return;
  if (!(data || []).length) { el.innerHTML = `<div class="page lp">${empty('cap', T('Hozircha kurslar yo\'q', 'Курсов пока нет', 'No courses yet'))}<p class="center"><a class="btn" href="#/courses/all">${esc(T('Katalog', 'Каталог', 'Catalog'))}</a></p></div>`; return; }
  const last = recall(); const id = (data.find(x => x.id === last) || data[0]).id;
  await chaptersView(el, id, alive);
}, { auth: true });
route('/course/:id', async ({ el, params, alive }) => { await chaptersView(el, params.id, alive); }, { auth: true });

// ---- 2) mavzu xaritasi ----
route('/chapter/:cid/:chid', async ({ el, params, alive }) => {
  const { cid, chid } = params; el.innerHTML = `<div class="page lp">${skeleton(3, 150)}</div>`;
  const d = await load(cid); if (!alive()) return;
  const ch = d && d.C.find(x => x.id === chid);
  if (!ch) return go('/course/' + cid, true);
  const secs = ch.secs, W = 340, STEP = 118, H = secs.length * STEP + 30, cx = W / 2, amp = 74;
  const pts = secs.map((s, i) => [cx + Math.sin(i * 1.3) * amp, 62 + i * STEP]);
  const path = pts.map((q, i) => { if (!i) return `M${q[0]},${q[1]}`; const o = pts[i - 1], my = (o[1] + q[1]) / 2; return `C${o[0]},${my} ${q[0]},${my} ${q[0]},${q[1]}`; }).join(' ');
  const firstOpen = secs.findIndex(s => !s.passed && !s.locked);
  let tn = 0;
  const nodes = secs.map((s, i) => {
    const [x, y] = pts[i], left = x > cx, k = s.kind, num = k === 'topic' ? ++tn : 0, st = (k === 'review' || k === 'final') && s.passed ? stars(Math.max(...s.parts.map(l => l.p)), s.thr) : 0;
    const body = s.locked || s.pay ? ic('lock', 24) : k === 'topic' ? `<b>${num}</b>` : k === 'review' ? '🔁' : k === 'intro' ? '📖' : '🏆';
    return `<a class="lp-n ${k} ${s.passed ? 'done' : ''} ${i === firstOpen ? 'cur' : ''} ${s.locked || s.pay ? 'lock' : ''} ${s.pay ? 'pay' : ''} ${left ? 'lft' : ''}" style="left:${x / W * 100}%;top:${y}px" href="#/topic/${cid}/${s.id}" data-lock="${s.pay ? 'pay' : s.locked ? 1 : ''}" data-s="${s.id}">
      <span class="lp-nd">${body}${!s.locked && !s.passed && s.pct ? `<em>${s.pct}%</em>` : ''}${s.passed ? `<em class="ok">${ic('check', 12)}</em>` : ''}</span>
      <span class="lp-nl">${esc(tr(s.title).replace(/^\d+-§\.\s*/, ''))}<small>${k === 'review' ? esc(T('Takrorlash', 'Повторение', 'Review')) : k === 'intro' ? esc(T('Kirish', 'Введение', 'Intro')) : k === 'final' ? esc(T('Yakuniy test', 'Итоговый тест', 'Final test')) : esc(T('Mavzu', 'Тема', 'Topic'))}${s.pct ? ' · ' + s.pct + '%' : ''}</small>${st ? starHtml(st) : ''}</span></a>`;
  }).join('');
  const nx = d.C[ch.i + 1], seenKey = nx ? 'bio.unl.' + nx.id : '';
  el.innerHTML = `<div class="page lp"><div class="row"><a class="btn ghost sm" href="#/course/${cid}">${ic('back')}</a><div class="grow"><small class="muted">${esc(tr(d.c.title))}</small><h2 class="mb0">${(() => { const r = tr(ch.title).replace(/^\d+-bob\.?\s*/i, '').trim(); return `${ch.i + 1}-${esc(T('bob', 'глава', 'chapter'))}${r ? '. ' + esc(r) : ''}`; })()}</h2></div><b>${ch.pct}%</b></div>
    ${bar(ch.pct)}
    <div class="lp-map" style="height:${H}px;max-width:${W}px"><svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" class="lp-path" aria-hidden="true"><path d="${path}" fill="none" stroke="var(--line)" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 12"/></svg>${nodes}</div>
    ${nx ? `<div class="lp-next"><button class="lp-go ${ch.passed ? 'ready' : ''}" id="nx" ${ch.passed || d.staff ? '' : 'aria-disabled="true"'}><span class="lp-gl">${ch.passed || d.staff ? '🔓' : ic('lock', 20)}</span><span class="grow"><small>${esc(T('Keyingi bob', 'Следующая глава', 'Next chapter'))}</small><b>${esc(tr(nx.title))}</b></span><span class="lp-arr">${esc(T('O\'tish', 'Перейти', 'Go'))} ➜</span></button>
      ${ch.passed || d.staff ? '' : `<p class="muted small center">${esc(T('Bobdagi barcha mavzu va testlarni o\'ting — keyingi bob ochiladi.', 'Пройдите все темы и тесты главы — откроется следующая.', 'Complete every topic and test to unlock the next chapter.'))}</p>`}</div>` : ''}</div>`;
  $$('.lp-n[data-lock="pay"]', el).forEach(a => a.onclick = e => { e.preventDefault(); askAdmin(d, d.S.find(x => x.id === a.dataset.s)); });
  $$('.lp-n[data-lock="1"]', el).forEach(a => a.onclick = e => { e.preventDefault(); toast(T('Avval oldingi mavzu yoki takrorlashni o\'ting', 'Сначала пройдите предыдущую тему или повторение', 'Complete the previous topic or review first')); });
  const cur = $('.lp-n.cur', el); if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
  const nb = $('#nx', el);
  if (nb) nb.onclick = () => {
    if (!(ch.passed || d.staff)) return toast(T('Bu bob hali tugamagan', 'Эта глава ещё не завершена', 'This chapter is not finished yet'));
    let seen = false; try { seen = !!localStorage.getItem(seenKey); localStorage.setItem(seenKey, '1'); } catch { /* */ }
    if (seen || d.staff) return go(`/chapter/${cid}/${nx.id}`);
    const fx = document.createElement('div'); fx.className = 'lp-fx';
    fx.innerHTML = `<div class="lp-fxc">${chCover(nx, nx.i)}<div class="lp-fxl">🔒</div><h2>${esc(T('Yangi bob ochildi!', 'Новая глава открыта!', 'New chapter unlocked!'))}</h2><p>${esc(tr(nx.title))}</p></div>${Array.from({ length: 18 }, (_, i) => `<i class="lp-cf" style="left:${(i * 37) % 100}%;animation-delay:${(i % 6) * .12}s">${['🎉', '✨', '⭐', '🌟'][i % 4]}</i>`).join('')}`;
    document.body.appendChild(fx); setTimeout(() => fx.classList.add('open'), 450); setTimeout(() => { fx.remove(); go(`/chapter/${cid}/${nx.id}`); }, 2300);
  };
  fillR2(el);
}, { auth: true });

// ---- 3) mavzu: tartibli qismlar ----
route('/topic/:cid/:sid', async ({ el, params, alive }) => {
  const { cid, sid } = params; el.innerHTML = `<div class="page lp">${skeleton(3, 100)}</div>`;
  const d = await load(cid); if (!alive()) return;
  const s = d && d.S.find(x => x.id === sid); if (!s) return go('/course/' + cid, true);
  const ch = d.C.find(x => x.secs.includes(s)), idx = d.S.indexOf(s), nxt = d.S[idx + 1], KLn = KL();
  const label = l => (s.kind === 'review' && l.kind === 'test' ? T('Takrorlash testi', 'Тест-повторение', 'Review test') : s.kind === 'final' && l.kind === 'test' ? T('Yakuniy test', 'Итоговый тест', 'Final test') : KLn[l.kind] || l.kind);
  const cur = s.parts.findIndex(l => !l.done);
  el.innerHTML = `<div class="page lp"><div class="row"><a class="btn ghost sm" href="#/chapter/${cid}/${ch ? ch.id : 'x'}">${ic('back')}</a><div class="grow"><small class="muted">${esc(tr(d.c.title))}</small><h2 class="mb0">${esc(tr(s.title))}</h2></div></div>
    <div class="lp-tp card pad mt"><div class="lp-ring" style="--p:${s.pct}"><b>${s.pct}%</b></div><div class="grow"><b>${s.passed ? esc(T('Mavzu tugatildi! 🎉', 'Тема пройдена! 🎉', 'Topic complete! 🎉')) : esc(T('Mavzu progressi', 'Прогресс темы', 'Topic progress'))}</b>
      <p class="muted small mb0">${esc(T(`Har qism kamida ${s.thr}% bo'lsa, keyingisi ochiladi.`, `Следующая часть откроется при результате от ${s.thr}%.`, `The next step opens at ${s.thr}% or more.`))}</p></div></div>
    <div class="lp-parts mt">${s.parts.map((l, i) => { const lk = l.locked && !l.pay, pay = l.pay;
      return `<a class="lp-part ${l.done ? 'done' : ''} ${lk ? 'lock' : ''} ${i === cur && !lk ? 'cur' : ''}" href="#/lesson/${cid}/${l.id}" data-l="${l.id}" data-k="${lk ? 'lock' : pay ? 'pay' : ''}">
        <span class="lp-pi">${lk ? ic('lock', 22) : pay ? ic('lock', 22) : l.done ? ic('check', 22) : ic(KI[l.kind] || 'book', 22)}</span>
        <span class="grow"><b>${esc(label(l))}</b><small class="muted">${esc(tr(l.title).replace(/^[^:]+:\s*/, ''))}</small>${bar(l.p)}</span><span class="lp-pp">${l.p}%</span></a>`; }).join('')}</div>
    <div class="lp-next">${nxt && (s.passed || d.staff) ? `<a class="lp-go ready" href="#/topic/${cid}/${nxt.id}"><span class="lp-gl">🔓</span><span class="grow"><small>${esc(T('Keyingisi', 'Далее', 'Next'))}</small><b>${esc(tr(nxt.title))}</b></span><span class="lp-arr">${esc(T('O\'tish', 'Перейти', 'Go'))} ➜</span></a>`
      : nxt ? `<div class="lp-go"><span class="lp-gl">${ic('lock', 20)}</span><span class="grow"><small>${esc(T('Keyingisi', 'Далее', 'Next'))}</small><b>${esc(tr(nxt.title))}</b></span></div><p class="muted small center">${esc(nxt.kind === 'review' ? T('Avval qismlarni bajaring — keyin takrorlash testi ochiladi.', 'Пройдите части — затем откроется повторение.', 'Finish the steps to unlock the review test.') : T('Barcha qismlarni bajaring — keyingisi ochiladi.', 'Пройдите все части — откроется следующая тема.', 'Complete all steps to unlock the next one.'))}</p>`
      : `<a class="btn block" href="#/chapter/${cid}/${ch ? ch.id : 'x'}">${esc(T('Xaritaga qaytish', 'К карте', 'Back to the map'))}</a>`}</div></div>`;
  $$('.lp-part', el).forEach(a => a.onclick = e => { const k = a.dataset.k; if (k === 'lock') { e.preventDefault(); toast(lockMsg(s.thr)); } else if (k === 'pay') { e.preventDefault(); askAdmin(d, s); } });
}, { auth: true });
