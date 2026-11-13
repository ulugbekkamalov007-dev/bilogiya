// Kurslar: katalog, kurs sahifasi, dars sahifasi, sertifikat (backend: courses, lessons, enrollments, complete_lesson, verify_certificate)
import { sb, state, tr, route, go, esc, ic, $, $$, toast, btnBusy, spinner, fmtDate } from './core.js';
import { T, skeleton, empty, errBox, pct, bar, md, dbErr, announceAchievements } from './ui.js';
import { refreshStats } from './xp.js';

const LV = () => ({ basic: T('Boshlang\'ich', 'Начальный', 'Basic'), medium: T('O\'rta', 'Средний', 'Intermediate'), advanced: T('Yuqori', 'Продвинутый', 'Advanced') });
const KI = { text: 'book', video: 'video', audio: 'audio', document: 'file', test: 'test' };
export const cover = c => `<div class="cover">${c.cover_url ? `<img src="${esc(c.cover_url)}" alt="" loading="lazy">` : ic('cap', 44)}</div>`;

async function myProgress() {
  const [{ data: en }, { data: lp }] = await Promise.all([sb.from('enrollments').select('course_id,completed_at'), sb.from('lesson_progress').select('course_id')]);
  const done = {}; (lp || []).forEach(x => done[x.course_id] = (done[x.course_id] || 0) + 1);
  return { enrolled: Object.fromEntries((en || []).map(e => [e.course_id, e])), done };
}

route('/courses', async ({ el, alive }) => {
  const f = { q: '', grade: '', level: '', price: '', sort: 'new', mine: false };
  el.innerHTML = `<div class="page"><div class="row between"><h1>${esc(T('Kurslar', 'Курсы', 'Courses'))}</h1>${state.profile?.role !== 'user' ? `<a class="btn sm" href="#/teach">${ic('edit', 16)} ${esc(T('Kabinet', 'Кабинет', 'Studio'))}</a>` : ''}</div>
    <div class="chipbar"><input class="input" id="q" type="search" placeholder="${esc(T('Kurs qidirish…', 'Поиск курса…', 'Search courses…'))}" style="max-width:320px;flex:1">
      <select class="input" id="g"><option value="">${esc(T('Barcha sinflar', 'Все классы', 'All grades'))}</option>${Array.from({ length: 11 }, (_, i) => `<option value="${i + 1}">${i + 1}-${esc(T('sinf', 'класс', 'grade'))}</option>`).join('')}</select>
      <select class="input" id="l"><option value="">${esc(T('Barcha darajalar', 'Все уровни', 'All levels'))}</option>${Object.entries(LV()).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>
      <select class="input" id="p"><option value="">${esc(T('Bepul + Premium', 'Бесплатные + Premium', 'Free + Premium'))}</option><option value="free">${esc(T('Bepul', 'Бесплатные', 'Free'))}</option><option value="prem">Premium</option></select>
      <select class="input" id="s"><option value="new">${esc(T('Yangilari', 'Новые', 'Newest'))}</option><option value="pop">${esc(T('Mashhur', 'Популярные', 'Popular'))}</option><option value="az">A–Z</option></select>
      <label class="chip" style="cursor:pointer"><input type="checkbox" id="m"> ${esc(T('Mening kurslarim', 'Мои курсы', 'My courses'))}</label></div>
    <div id="cl">${skeleton(3, 200)}</div></div>`;
  let courses = [], pg, cnt = {};
  const load = async () => {
    const [{ data, error }, p, { data: ec }] = await Promise.all([sb.from('courses').select('*, lessons(count)').eq('status', 'published').order('created_at', { ascending: false }), myProgress(), sb.from('enrollments').select('course_id')]);
    if (error) { $('#cl', el).innerHTML = errBox(dbErr(error), 'rt'); $('#rt', el).onclick = load; return; }
    courses = data || []; pg = p; (ec || []).forEach(x => cnt[x.course_id] = (cnt[x.course_id] || 0) + 1); paint();
  };
  const paint = () => {
    let l = courses.filter(c => (!f.q || tr(c.title).toLowerCase().includes(f.q)) && (!f.grade || c.grade === +f.grade) && (!f.level || c.level === f.level) && (!f.price || (f.price === 'prem') === c.is_premium) && (!f.mine || pg.enrolled[c.id]));
    l.sort((a, b) => f.sort === 'az' ? tr(a.title).localeCompare(tr(b.title)) : f.sort === 'pop' ? (cnt[b.id] || 0) - (cnt[a.id] || 0) : 0);
    $('#cl', el).innerHTML = l.length ? `<div class="cgrid">${l.map(c => { const total = c.lessons?.[0]?.count || 0, d = pg.done[c.id] || 0, en = pg.enrolled[c.id];
      return `<a class="ccard" href="#/course/${c.id}">${cover(c)}<div class="cb"><div class="tagrow">${c.grade ? `<span class="tg">${c.grade}-${esc(T('sinf', 'класс', 'grade'))}</span>` : ''}<span class="tg">${esc(LV()[c.level])}</span>${c.is_premium ? '<span class="tg pr">Premium</span>' : `<span class="tg">${esc(T('Bepul', 'Бесплатно', 'Free'))}</span>`}</div>
        <h3>${esc(tr(c.title))}</h3><small class="muted">${total} ${esc(T('dars', 'уроков', 'lessons'))} · ${cnt[c.id] || 0} ${esc(T('o\'quvchi', 'учеников', 'students'))}</small>
        ${en ? `${bar(pct(d, total))}<small class="muted">${en.completed_at ? '✔ ' + esc(T('Tugatilgan', 'Завершён', 'Completed')) : pct(d, total) + '%'}</small>` : ''}</div></a>`; }).join('')}</div>`
      : empty('cap', courses.length ? T('Filtrga mos kurs topilmadi', 'Нет курсов по фильтру', 'No courses match the filters') : T('Hozircha kurslar yo\'q', 'Курсов пока нет', 'No courses yet'));
  };
  $('#q', el).oninput = e => { clearTimeout(pg2); pg2 = setTimeout(() => { f.q = e.target.value.trim().toLowerCase(); if (courses.length) paint(); }, 150); }; let pg2;
  [['g', 'grade'], ['l', 'level'], ['p', 'price'], ['s', 'sort']].forEach(([id, k]) => $('#' + id, el).onchange = e => { f[k] = e.target.value; paint(); });
  $('#m', el).onchange = e => { f.mine = e.target.checked; paint(); };
  await load();
}, { auth: true });

route('/course/:id', async ({ el, params, alive }) => {
  const id = params.id; el.innerHTML = `<div class="page">${skeleton(4, 90)}</div>`;
  const [{ data: c, error }, { data: secs }, { data: ls }, { data: lp }, { data: en }, { data: rv }, { data: cert }] = await Promise.all([
    sb.from('courses').select('*').eq('id', id).maybeSingle(), sb.from('course_sections').select('*').eq('course_id', id).order('position'),
    sb.from('lessons').select('id,section_id,title,kind,xp,position').eq('course_id', id).order('position'), sb.from('lesson_progress').select('lesson_id').eq('course_id', id),
    sb.from('enrollments').select('*').eq('course_id', id).maybeSingle(), sb.from('course_reviews').select('*').eq('course_id', id).order('created_at', { ascending: false }),
    sb.from('certificates').select('code').eq('course_id', id).maybeSingle()]);
  if (!alive()) return;
  if (error || !c) { el.innerHTML = `<div class="page">${empty('cap', T('Kurs topilmadi yoki yopiq', 'Курс не найден или закрыт', 'Course not found or not available'))}<p class="center"><a href="#/courses">${esc(T('Kurslarga qaytish', 'К курсам', 'Back to courses'))}</a></p></div>`; return; }
  const done = new Set((lp || []).map(x => x.lesson_id)), total = (ls || []).length, p = pct(done.size, total);
  const avg = (rv || []).length ? ((rv.reduce((a, r) => a + r.rating, 0)) / rv.length).toFixed(1) : null;
  const next = (ls || []).find(l => !done.has(l.id)) || (ls || [])[0];
  const lrow = (l, i) => `<a class="lrow ${done.has(l.id) ? 'done' : ''}" href="#/lesson/${id}/${l.id}"><span class="li">${done.has(l.id) ? ic('check', 14) : i + 1}</span>${ic(KI[l.kind] || 'book', 18)}<span class="grow">${esc(tr(l.title))}</span><small class="muted">+${l.xp} XP</small></a>`;
  let n = 0; const bySec = (secs || []).map(s => ({ s, l: (ls || []).filter(x => x.section_id === s.id) })); const loose = (ls || []).filter(x => !secs?.some(s => s.id === x.section_id));
  const mine = (rv || []).find(r => r.user_id === state.user.id);
  el.innerHTML = `<div class="page"><a class="btn ghost sm" href="#/courses">${ic('back')}</a><div class="cdetail mt"><div>
    ${cover(c)}<h1 class="mt">${esc(tr(c.title))}</h1><div class="tagrow">${c.grade ? `<span class="tg">${c.grade}-${esc(T('sinf', 'класс', 'grade'))}</span>` : ''}<span class="tg">${esc(LV()[c.level])}</span>${c.is_premium ? '<span class="tg pr">Premium</span>' : ''}${avg ? `<span class="tg">★ ${avg} (${rv.length})</span>` : ''}</div>
    <div class="lbody mt" style="font-size:1rem">${md(tr(c.description))}</div>
    ${(c.goals || []).length ? `<h3>${esc(T('O\'quv maqsadlari', 'Цели обучения', 'Learning goals'))}</h3><ul>${c.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
    <h3>${esc(T('Darslar dasturi', 'Программа', 'Syllabus'))}</h3>${total ? `${bySec.map(({ s, l }) => `<div class="sec"><h4>${esc(tr(s.title))}</h4>${l.map(x => lrow(x, n++)).join('')}</div>`).join('')}${loose.map(x => lrow(x, n++)).join('')}` : `<p class="muted">${esc(T('Darslar hali qo\'shilmagan', 'Уроки ещё не добавлены', 'No lessons yet'))}</p>`}
    <h3>${esc(T('Izohlar va baholar', 'Отзывы и оценки', 'Reviews'))}</h3>
    ${en && !mine ? `<div class="card pad form mb"><label class="fld"><span>${esc(T('Bahongiz', 'Оценка', 'Rating'))}</span><select class="input" id="rr">${[5, 4, 3, 2, 1].map(v => `<option value="${v}">${'★'.repeat(v)}</option>`).join('')}</select></label><textarea class="input" id="rc" rows="2" maxlength="600" placeholder="${esc(T('Izoh (ixtiyoriy)', 'Комментарий (необязательно)', 'Comment (optional)'))}"></textarea><button class="btn" id="rs">${esc(T('Yuborish', 'Отправить', 'Submit'))}</button></div>` : ''}
    ${(rv || []).length ? (rv).map(r => `<div class="card pad mb"><div class="row between"><b>${esc(r.author_name || '')}</b><span class="muted">${'★'.repeat(r.rating)}</span></div>${r.comment ? `<p class="pre">${esc(r.comment)}</p>` : ''}<small class="muted">${esc(fmtDate(r.created_at))}</small></div>`).join('') : `<p class="muted">${esc(T('Hali izoh yo\'q', 'Отзывов пока нет', 'No reviews yet'))}</p>`}
    </div><aside><div class="card pad"><h3>${esc(T('Progress', 'Прогресс', 'Progress'))}</h3>${bar(p)}<p class="muted small">${done.size}/${total} ${esc(T('dars', 'уроков', 'lessons'))} · ${p}%</p>
      ${total ? `<a class="btn lg block" href="#/lesson/${id}/${next.id}" id="go">${ic('play', 16)} ${esc(en ? (done.size ? T('Davom ettirish', 'Продолжить', 'Continue') : T('Boshlash', 'Начать', 'Start')) : T('Kursga yozilish', 'Записаться', 'Enroll'))}</a>` : ''}
      <div class="mt">${cert ? `<a class="btn block" href="#/cert/${cert.code}">${ic('award', 16)} ${esc(T('Sertifikat', 'Сертификат', 'Certificate'))}</a>` : `<small class="muted">${esc(T('Sertifikat: kursni to\'liq tugatganingizda beriladi', 'Сертификат выдаётся после завершения курса', 'Certificate is issued when you finish the course'))}</small>`}</div></div></aside></div></div>`;
  $('#go', el)?.addEventListener('click', async e => { if (!en) { e.preventDefault(); const { error: er } = await sb.rpc('enroll_course', { p_course: id }); if (er) return toast(dbErr(er), 'err'); go(`/lesson/${id}/${next.id}`); } });
  $('#rs', el)?.addEventListener('click', async e => { btnBusy(e.target, true); const { error: er } = await sb.from('course_reviews').insert({ user_id: state.user.id, course_id: id, rating: +$('#rr', el).value, comment: $('#rc', el).value.trim() || null }); if (er) { btnBusy(e.target, false); return toast(dbErr(er), 'err'); } location.reload(); });
}, { auth: true });

route('/lesson/:cid/:lid', async ({ el, params, alive }) => {
  const { cid, lid } = params; el.innerHTML = `<div class="page">${skeleton(3, 120)}</div>`;
  const [{ data: c }, { data: ls }, { data: lp }, { data: l, error }] = await Promise.all([sb.from('courses').select('id,title').eq('id', cid).maybeSingle(), sb.from('lessons').select('id,title,kind,position,section_id').eq('course_id', cid).order('position'),
    sb.from('lesson_progress').select('lesson_id').eq('course_id', cid), sb.from('lessons').select('*').eq('id', lid).maybeSingle()]);
  if (!alive()) return; if (error || !l || !c) return go('/course/' + cid, true);
  const done = new Set((lp || []).map(x => x.lesson_id)), i = ls.findIndex(x => x.id === lid), prev = ls[i - 1], next = ls[i + 1];
  const gl = []; const body = (l.body || '').replace(/\[\[(.+?)\|(.+?)\]\]/g, (_, a, b) => { gl.push([a, b]); return a; });
  const tocHtml = ls.map((x, k) => `<a class="lrow ${done.has(x.id) ? 'done' : ''}" href="#/lesson/${cid}/${x.id}" ${x.id === lid ? 'style="border-color:var(--brand)"' : ''}><span class="li">${done.has(x.id) ? ic('check', 14) : k + 1}</span><span class="grow">${esc(tr(x.title))}</span></a>`).join('');
  const noteKey = 'bio.note.' + lid;
  const media = l.youtube_id ? `<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(l.youtube_id)}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" title="video"></iframe></div>` : '';
  const linked = l.item_id ? `<a class="btn lg block mt" href="#/${l.kind === 'test' ? 'test' : 'item'}/${l.item_id}">${ic(KI[l.kind] || 'book', 18)} ${esc(l.kind === 'test' ? T('Testni boshlash', 'Начать тест', 'Start test') : T('Materialni ochish', 'Открыть материал', 'Open material'))}</a>` : '';
  const aiQ = encodeURIComponent(`${tr(c.title)} — ${tr(l.title)}`);
  el.innerHTML = `<div class="page" style="max-width:1400px"><div class="row"><a class="btn ghost sm" href="#/course/${cid}">${ic('back')}</a><div class="grow"><small class="muted">${esc(tr(c.title))}</small><h2 class="mb0">${esc(tr(l.title))}</h2></div><button class="btn ghost sm tocbtn" id="tb" style="display:none">${ic('list', 16)}</button></div>
    <div class="lesson mt"><nav class="toc card pad"><h4>${esc(T('Mundarija', 'Содержание', 'Contents'))}</h4>${tocHtml}</nav>
      <article>${media}<div class="lbody card pad mt">${md(body) || `<p class="muted">${esc(T('Matn yo\'q', 'Нет текста', 'No text'))}</p>`}${linked}</div>
        <div class="lnav">${prev ? `<a class="btn ghost" href="#/lesson/${cid}/${prev.id}">${ic('back', 16)} ${esc(T('Oldingi', 'Назад', 'Previous'))}</a>` : ''}<button class="btn" id="fin">${done.has(lid) ? ic('check', 16) + ' ' + esc(T('Tugatilgan', 'Завершён', 'Completed')) : esc(T('Darsni tugatdim', 'Урок пройден', 'Mark complete'))} (+${l.xp} XP)</button>${next ? `<a class="btn ghost" href="#/lesson/${cid}/${next.id}">${esc(T('Keyingi', 'Далее', 'Next'))} ${ic('chev', 16)}</a>` : ''}</div></article>
      <aside class="side"><div class="card pad"><h4>${esc(T('Lug\'at', 'Словарь', 'Glossary'))}</h4>${gl.length ? gl.map(([a, b]) => `<p><b>${esc(a)}</b><br><small class="muted">${esc(b)}</small></p>`).join('') : `<p class="muted small">${esc(T('Bu darsda atamalar yo\'q (matnda [[atama|izoh]] yoziladi)', 'В уроке нет терминов', 'No terms in this lesson'))}</p>`}</div>
        <div class="card pad mt"><h4>${esc(T('Eslatmalar', 'Заметки', 'Notes'))}</h4><textarea class="input" id="nt" rows="6" placeholder="${esc(T('Shaxsiy eslatma (shu qurilmada saqlanadi)', 'Личная заметка (на этом устройстве)', 'Personal note (saved on this device)'))}"></textarea></div>
        <a class="btn block mt" href="#/ai?q=${aiQ}">${ic('bot', 16)} ${esc(T('AI yordamchidan so\'rash', 'Спросить ИИ', 'Ask the AI'))}</a></aside></div></div>`;
  const nt = $('#nt', el); try { nt.value = localStorage.getItem(noteKey) || ''; } catch { /* */ } nt.oninput = () => { try { localStorage.setItem(noteKey, nt.value); } catch { /* */ } };
  const tb = $('#tb', el); if (window.matchMedia('(max-width:1099px)').matches) tb.style.display = ''; tb.onclick = async () => { const { modal } = await import('./core.js'); const m = modal(`<h3>${esc(T('Mundarija', 'Содержание', 'Contents'))}</h3>${tocHtml}`); m.el.addEventListener('click', e => { if (e.target.closest('a')) m.close(); }); };
  $('#fin', el).onclick = async e => { if (done.has(lid)) return next ? go(`/lesson/${cid}/${next.id}`) : go('/course/' + cid); btnBusy(e.currentTarget, true);
    const { data, error: er } = await sb.rpc('complete_lesson', { p_lesson: lid }); if (er) { btnBusy($('#fin', el), false); return toast(dbErr(er), 'err'); }
    if (data.xp) toast(`+${data.xp} XP`, 'ok'); announceAchievements(data.achievements); refreshStats();
    if (data.finished) { toast('🎓 ' + T('Kurs tugatildi!', 'Курс завершён!', 'Course completed!'), 'ok'); go('/cert/' + data.cert); } else if (next) go(`/lesson/${cid}/${next.id}`); else go('/course/' + cid); };
}, { auth: true });

// sertifikat (ochiq tekshirish: kod bilan)
route('/cert/:code', async ({ el, params }) => {
  const { data } = await sb.rpc('verify_certificate', { p_code: params.code });
  if (!data?.ok) { el.innerHTML = `<div class="page">${empty('award', T('Sertifikat topilmadi', 'Сертификат не найден', 'Certificate not found'))}</div>`; return; }
  el.innerHTML = `<div class="page"><div class="cert"><div style="font-size:3rem">🧬</div><h1>${esc(T('SERTIFIKAT', 'СЕРТИФИКАТ', 'CERTIFICATE'))}</h1><p>${esc(T('Ushbu sertifikat', 'Настоящий сертификат подтверждает, что', 'This certifies that'))}</p><div class="nm">${esc(data.name)}</div>
    <p>${esc(T('quyidagi kursni muvaffaqiyatli tamomlaganini tasdiqlaydi:', 'успешно завершил(а) курс:', 'has successfully completed the course:'))}</p><h2>${esc(tr(data.course))}</h2><p>${esc(fmtDate(data.issued))}</p><small>BioAcademy · ${esc(T('Tekshirish kodi', 'Код проверки', 'Verification code'))}: <b>${esc(String(params.code).toUpperCase())}</b></small></div>
    <p class="center mt"><button class="btn" onclick="window.print()">${esc(T('Chop etish / PDF', 'Печать / PDF', 'Print / PDF'))}</button> <a class="btn ghost" href="#/courses">${esc(T('Kurslar', 'Курсы', 'Courses'))}</a></p></div>`;
});
