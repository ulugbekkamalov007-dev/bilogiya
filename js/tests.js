// Test tizimi: hujjatdan import (Word/PDF/TXT → avtomatik savollar), har safar aralashadigan variantlar,
// bob bo'yicha tanlash, natija, foiz, motivatsiya va salyut effektlari.
import { sb, state, t, addDict, route, go, esc, ic, $, $$, tr, shuffle, rand, modal, toast, btnBusy, fmtDur, trackTime, onLeave, spinner, confirmDlg, i18nField, uzFix } from './core.js';
import { parseQuestions } from './testparse.js';
import { celebrate } from './fx.js';

addDict({
  uz: {
    'tests.q_count': '{n} ta savol', 'tests.start': 'Boshlash', 'tests.chapters': 'Boblar / mavzular', 'tests.all_ch': 'Hammasi', 'tests.no_ch': 'Bobsiz',
    'tests.how_many': 'Nechta savol?', 'tests.all': 'Hammasi', 'tests.next': 'Keyingi', 'tests.finish': 'Yakunlash', 'tests.q_of': 'Savol {i} / {n}',
    'tests.result': 'Natija', 'tests.correct': 'To\'g\'ri', 'tests.wrong': 'Xato', 'tests.time': 'Vaqt', 'tests.retry': 'Qayta yechish', 'tests.retry_wrong': 'Xatolarni qayta yechish',
    'tests.review': 'Xatolar tahlili', 'tests.your': 'Sizning javobingiz', 'tests.right': 'To\'g\'ri javob', 'tests.back': 'Kutubxonaga',
    'tests.empty': 'Bu testda hali savol yo\'q', 'tests.exit': 'Testdan chiqasizmi? Natija saqlanmaydi.',
    'imp.title': 'Test import qilish', 'imp.how': 'Word (.docx), PDF yoki TXT fayl yuklang yoki matnni shu yerga qo\'ying. Javob harflari (A, B, C, D) shart emas — ilova o\'zi aralashtiradi.',
    'imp.rules': 'Qoida: savol → variantlar. To\'g\'ri javob — BIRINCHI variant (yoki * bilan belgilang). Savollar raqamlangan yoki bo\'sh qator bilan ajratilgan bo\'lsin. Bob: «# Bob nomi».',
    'imp.file': 'Fayl', 'imp.paste': 'yoki matnni qo\'ying', 'imp.opts': 'Har savolda variantlar soni (raqamsiz, bo\'sh qatorsiz hujjatlar uchun)', 'imp.parse': 'Tahlil qilish',
    'imp.found': '{n} ta savol topildi ({mode})', 'imp.save': 'Saqlash', 'imp.name': 'Test nomi', 'imp.saved': 'Test saqlandi', 'imp.reading': 'Fayl o\'qilmoqda…',
    'imp.warn': 'Ogohlantirishlar', 'imp.pdf_fail': 'PDF o\'qib bo\'lmadi. Word yoki TXT ishlatib ko\'ring.', 'imp.none': 'Savollar topilmadi. Namunaga qarang.',
    'imp.example': 'Namuna', 'imp.ex_text': '# Hujayra\n1. Hujayraning energiya stansiyasi qaysi?\nMitoxondriya\nRibosoma\nLizosoma\nGolji apparati\n\n2. Fotosintez qayerda sodir bo\'ladi?\nXloroplastda\nYadroda\nVakuolada\nMitoxondriyada',
    'imp.mode_numbered': 'raqamlangan', 'imp.mode_blocks': 'bo\'sh qatorli bloklar', 'imp.mode_fixed': 'qat\'iy tartib',
  },
  ru: {
    'tests.q_count': 'Вопросов: {n}', 'tests.start': 'Начать', 'tests.chapters': 'Главы / темы', 'tests.all_ch': 'Все', 'tests.no_ch': 'Без главы',
    'tests.how_many': 'Сколько вопросов?', 'tests.all': 'Все', 'tests.next': 'Далее', 'tests.finish': 'Завершить', 'tests.q_of': 'Вопрос {i} / {n}',
    'tests.result': 'Результат', 'tests.correct': 'Верно', 'tests.wrong': 'Ошибок', 'tests.time': 'Время', 'tests.retry': 'Пройти снова', 'tests.retry_wrong': 'Повторить ошибки',
    'tests.review': 'Разбор ошибок', 'tests.your': 'Ваш ответ', 'tests.right': 'Правильный ответ', 'tests.back': 'В библиотеку',
    'tests.empty': 'В этом тесте пока нет вопросов', 'tests.exit': 'Выйти из теста? Результат не сохранится.',
    'imp.title': 'Импорт теста', 'imp.how': 'Загрузите файл Word (.docx), PDF или TXT либо вставьте текст. Буквы ответов (A, B, C, D) не нужны — приложение перемешает само.',
    'imp.rules': 'Правило: вопрос → варианты. Правильный — ПЕРВЫЙ вариант (или отметьте *). Вопросы нумеруйте или разделяйте пустой строкой. Глава: «# Название».',
    'imp.file': 'Файл', 'imp.paste': 'или вставьте текст', 'imp.opts': 'Вариантов в вопросе (для документов без нумерации и пустых строк)', 'imp.parse': 'Разобрать',
    'imp.found': 'Найдено вопросов: {n} ({mode})', 'imp.save': 'Сохранить', 'imp.name': 'Название теста', 'imp.saved': 'Тест сохранён', 'imp.reading': 'Чтение файла…',
    'imp.warn': 'Предупреждения', 'imp.pdf_fail': 'Не удалось прочитать PDF. Попробуйте Word или TXT.', 'imp.none': 'Вопросы не найдены. Смотрите пример.',
    'imp.example': 'Пример', 'imp.ex_text': '# Клетка\n1. Какая органелла — энергостанция клетки?\nМитохондрия\nРибосома\nЛизосома\nАппарат Гольджи\n\n2. Где происходит фотосинтез?\nВ хлоропласте\nВ ядре\nВ вакуоли\nВ митохондрии',
    'imp.mode_numbered': 'нумерация', 'imp.mode_blocks': 'блоки с пустой строкой', 'imp.mode_fixed': 'фиксированный порядок',
  },
  en: {
    'tests.q_count': '{n} questions', 'tests.start': 'Start', 'tests.chapters': 'Chapters / topics', 'tests.all_ch': 'All', 'tests.no_ch': 'No chapter',
    'tests.how_many': 'How many questions?', 'tests.all': 'All', 'tests.next': 'Next', 'tests.finish': 'Finish', 'tests.q_of': 'Question {i} / {n}',
    'tests.result': 'Result', 'tests.correct': 'Correct', 'tests.wrong': 'Wrong', 'tests.time': 'Time', 'tests.retry': 'Try again', 'tests.retry_wrong': 'Retry mistakes',
    'tests.review': 'Review mistakes', 'tests.your': 'Your answer', 'tests.right': 'Correct answer', 'tests.back': 'Back to library',
    'tests.empty': 'This test has no questions yet', 'tests.exit': 'Leave the test? Your result will not be saved.',
    'imp.title': 'Import a test', 'imp.how': 'Upload a Word (.docx), PDF or TXT file, or paste the text. Answer letters (A, B, C, D) are not required — the app shuffles for you.',
    'imp.rules': 'Rule: question → options. The correct one is the FIRST option (or mark it with *). Number the questions or separate them with a blank line. Chapter: "# Name".',
    'imp.file': 'File', 'imp.paste': 'or paste text', 'imp.opts': 'Options per question (for documents with no numbering / blank lines)', 'imp.parse': 'Parse',
    'imp.found': '{n} questions found ({mode})', 'imp.save': 'Save', 'imp.name': 'Test name', 'imp.saved': 'Test saved', 'imp.reading': 'Reading file…',
    'imp.warn': 'Warnings', 'imp.pdf_fail': 'Could not read the PDF. Try Word or TXT.', 'imp.none': 'No questions found. See the example.',
    'imp.example': 'Example', 'imp.ex_text': '# Cell\n1. Which organelle is the cell\'s power plant?\nMitochondrion\nRibosome\nLysosome\nGolgi apparatus\n\n2. Where does photosynthesis happen?\nIn the chloroplast\nIn the nucleus\nIn the vacuole\nIn the mitochondrion',
    'imp.mode_numbered': 'numbered', 'imp.mode_blocks': 'blank-line blocks', 'imp.mode_fixed': 'fixed order',
  },
});

// ---------- motivatsiya matnlari (har safar tasodifiy)
const M = {
  uz: { 100: ['Mukammal! 100% — haqiqiy biolog! 🏆', 'Xatosiz! Siz bilimlar cho\'qqisidasiz 🚀', 'Bitta ham xato yo\'q! Ajoyib natija 🌟', 'Zo\'r! Hujayradan ekotizimgacha hammasini bilasiz 🧬'],
    90: ['Deyarli mukammal! Yana bir oz — va 100% 🎯', 'Ajoyib natija! Davom eting 💪', 'Barakalla! Bilimingiz mustahkam 🌿', 'Ustozlar quvonadi bunday natijadan 👏'],
    70: ['Yaxshi natija! Xatolarni ko\'rib chiqing 📚', 'Yaxshi ketyapsiz — oldinga! 🌱', 'Ko\'rinib turibdi, harakat bor! Yana ozgina 🔬', 'Yaxshi! Murakkab savollarni takrorlang ✨'],
    50: ['Yomon emas, lekin siz ko\'proq qila olasiz! 💡', 'O\'rtacha natija. Mavzuni qayta o\'qib chiqing 📖', 'Yarmidan o\'tdingiz — endi tepaga! 🪜', 'Takrorlash — bilim onasi. Yana urinib ko\'ring 🔁'],
    30: ['Hech qisi yo\'q, hamma shu yo\'ldan o\'tadi. Qayta urinib ko\'ring! 🌤️', 'Birinchi qadam qiyin. Videoni qayta ko\'ring 🎬', 'Xato — o\'rganish imkoniyati! Davom eting 🌱', 'Sabr va mashq — muvaffaqiyat kaliti 🔑'],
    0: ['Boshlanish doim qiyin. Mavzuni birga qayta ko\'ramiz 🤝', 'Taslim bo\'lmang! Har bir biolog avval shunday boshlagan 🧪', 'Bugun kam bo\'ldi, ertaga ko\'p bo\'ladi 🌅', 'Video darsni qayta ko\'rib, testni yana yeching — albatta chiqadi! 💚'] },
  ru: { 100: ['Идеально! 100% — настоящий биолог! 🏆', 'Без ошибок! Вы на вершине знаний 🚀', 'Ни одной ошибки! Блестящий результат 🌟', 'Отлично! Вы знаете всё — от клетки до экосистемы 🧬'],
    90: ['Почти идеально! Ещё чуть-чуть — и 100% 🎯', 'Отличный результат! Так держать 💪', 'Молодец! Знания крепкие 🌿', 'Учитель будет доволен 👏'],
    70: ['Хороший результат! Разберите ошибки 📚', 'Вы на верном пути — вперёд! 🌱', 'Видно старание! Ещё немного 🔬', 'Хорошо! Повторите сложные вопросы ✨'],
    50: ['Неплохо, но вы можете больше! 💡', 'Средний результат. Перечитайте тему 📖', 'Вы перешагнули середину — теперь выше! 🪜', 'Повторение — мать учения. Попробуйте ещё раз 🔁'],
    30: ['Ничего страшного, все проходят этот путь. Попробуйте снова! 🌤️', 'Первый шаг самый трудный. Пересмотрите видео 🎬', 'Ошибка — шанс научиться! Продолжайте 🌱', 'Терпение и практика — ключ к успеху 🔑'],
    0: ['Начало всегда трудное. Давайте разберём тему вместе 🤝', 'Не сдавайтесь! Каждый биолог с этого начинал 🧪', 'Сегодня мало — завтра будет больше 🌅', 'Пересмотрите видеоурок и пройдите тест снова — получится! 💚'] },
  en: { 100: ['Perfect! 100% — a true biologist! 🏆', 'Flawless! You\'re at the top of your game 🚀', 'Not a single mistake! Brilliant 🌟', 'Superb! From cells to ecosystems, you know it all 🧬'],
    90: ['Almost perfect! A little more for 100% 🎯', 'Excellent result! Keep going 💪', 'Well done! Solid knowledge 🌿', 'Your teacher will be proud 👏'],
    70: ['Good result! Review your mistakes 📚', 'You\'re on the right track — onward! 🌱', 'The effort shows! Just a bit more 🔬', 'Nice! Revisit the tricky questions ✨'],
    50: ['Not bad, but you can do more! 💡', 'An average result. Re-read the topic 📖', 'Past the halfway mark — now climb higher! 🪜', 'Repetition is the mother of learning. Try again 🔁'],
    30: ['No worries, everyone goes through this. Try again! 🌤️', 'The first step is the hardest. Rewatch the video 🎬', 'A mistake is a chance to learn! Keep going 🌱', 'Patience and practice are the key 🔑'],
    0: ['Starting is always hard. Let\'s revisit the topic together 🤝', 'Don\'t give up! Every biologist started here 🧪', 'A little today, a lot tomorrow 🌅', 'Rewatch the lesson and retake the test — you\'ll get there! 💚'] },
};
const band = p => p >= 100 ? 100 : p >= 90 ? 90 : p >= 70 ? 70 : p >= 50 ? 50 : p >= 30 ? 30 : 0;
const motivation = p => { const x = rand(M[state.lang][band(p)]); return state.lang === 'uz' ? uzFix(x) : x; };

// ---------- fayldan matn olish
const loadScript = src => new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
export async function extractText(file) {
  const name = file.name.toLowerCase();
  if (/\.(txt|md|csv)$/.test(name)) return file.text();
  if (name.endsWith('.docx')) {
    await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
    const r = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return r.value.split('\n\n').join('\n');             // abzats = qator, bo'sh abzats = bo'sh qator
  }
  if (name.endsWith('.pdf')) {
    const base = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/';
    const pdfjs = await import(base + 'pdf.min.mjs');
    const wsrc = URL.createObjectURL(new Blob([await (await fetch(base + 'pdf.worker.min.mjs')).text()], { type: 'text/javascript' }));
    pdfjs.GlobalWorkerOptions.workerSrc = wsrc;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const out = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const tc = await (await doc.getPage(p)).getTextContent();
      const lines = []; let buf = '', ly = null;
      for (const it of tc.items) { const y = it.transform[5]; if (ly !== null && Math.abs(y - ly) > 2) { lines.push({ y: ly, s: buf }); buf = ''; } buf += it.str; ly = y; }
      if (buf) lines.push({ y: ly, s: buf });
      const gaps = lines.slice(1).map((l, i) => Math.abs(lines[i].y - l.y)).sort((a, b) => a - b), med = gaps[Math.floor(gaps.length / 2)] || 12;
      lines.forEach((l, i) => { if (i && Math.abs(lines[i - 1].y - l.y) > med * 1.7) out.push(''); out.push(l.s.trim()); });
      out.push('');
    }
    return out.join('\n');
  }
  throw new Error('format');
}

// ---------- import oynasi (admin)
export function testImportModal({ folderId = null, itemId = null, onDone } = {}) {
  const m = modal(`<h3>${ic('test')} ${esc(t('imp.title'))}</h3><p class="muted small">${esc(t('imp.how'))}</p><p class="small">${esc(t('imp.rules'))}</p>
    <details class="mb"><summary>${esc(t('imp.example'))}</summary><pre class="code">${esc(t('imp.ex_text'))}</pre></details>
    <div class="form">
      ${itemId ? '' : `<label class="fld"><span>${esc(t('imp.name'))}</span><input class="input" id="nm" required></label>`}
      <label class="fld"><span>${esc(t('imp.file'))} (.docx / .pdf / .txt)</span><input type="file" id="fl" accept=".docx,.pdf,.txt,.md"></label>
      <label class="fld"><span>${esc(t('imp.paste'))}</span><textarea class="input" id="tx" rows="5"></textarea></label>
      <label class="fld"><span>${esc(t('imp.opts'))}</span><input class="input" id="oc" type="number" min="2" max="8" value="4" style="max-width:100px"></label>
      <div class="err" id="err"></div><button class="btn" id="pr">${esc(t('imp.parse'))}</button>
      <div id="prev"></div></div>`, { cls: 'wide' });
  const el = m.el; let qs = [];
  const err = x => $('#err', el).textContent = x || '';
  $('#fl', el).onchange = async e => {
    const f = e.target.files[0]; if (!f) return; err(); $('#tx', el).value = t('imp.reading');
    try { $('#tx', el).value = await extractText(f); if (!itemId && !$('#nm', el).value) $('#nm', el).value = f.name.replace(/\.[^.]+$/, ''); }
    catch (x) { $('#tx', el).value = ''; err(f.name.toLowerCase().endsWith('.pdf') ? t('imp.pdf_fail') : (x.message || String(x))); }
  };
  $('#pr', el).onclick = () => {
    err(); const r = parseQuestions($('#tx', el).value, { optionsCount: +$('#oc', el).value || 4 }); qs = r.questions;
    const prev = $('#prev', el);
    if (!qs.length) { prev.innerHTML = ''; return err(t('imp.none')); }
    const chapters = [...new Set(qs.map(q => q.chapter).filter(Boolean))];
    prev.innerHTML = `<p class="ok"><b>${esc(t('imp.found', { n: qs.length, mode: t('imp.mode_' + r.mode) }))}</b>${chapters.length ? ' · ' + chapters.map(esc).join(', ') : ''}</p>
      ${r.warnings.length ? `<details class="warnbox"><summary>${esc(t('imp.warn'))} (${r.warnings.length})</summary>${r.warnings.map(w => `<div>${esc(w)}</div>`).join('')}</details>` : ''}
      <div class="qprev">${qs.slice(0, 60).map((q, i) => `<div class="qp" data-i="${i}"><button class="xbtn" data-rm="${i}">${ic('x', 14)}</button><b>${i + 1}. ${esc(q.question)}</b><div class="ok">✔ ${esc(q.correct)}</div>${q.wrong.map(w => `<div class="muted">✗ ${esc(w)}</div>`).join('')}</div>`).join('')}${qs.length > 60 ? `<p class="muted">… +${qs.length - 60}</p>` : ''}</div>
      <button class="btn lg block mt" id="sv">${esc(t('imp.save'))}</button>`;
    $$('[data-rm]', prev).forEach(b => b.onclick = () => { qs[+b.dataset.rm] = null; b.closest('.qp').remove(); });
    $('#sv', prev).onclick = async ev => {
      const btn = ev.currentTarget; btnBusy(btn, true);
      try {
        const list = qs.filter(Boolean); let id = itemId;
        if (!id) {
          const title = $('#nm', el).value.trim(); if (!title) throw new Error(t('imp.name'));
          const { data, error } = await sb.from('items').insert({ folder_id: folderId, kind: 'test', title: await i18nField(title, state.lang), created_by: state.user.id }).select('id').single();
          if (error) throw error; id = data.id;
        }
        const { count } = await sb.from('questions').select('*', { count: 'exact', head: true }).eq('item_id', id);
        const rows = list.map((q, i) => ({ item_id: id, position: (count || 0) + i, chapter: q.chapter, question: q.question, correct: q.correct, wrong: q.wrong, explanation: q.explanation || null }));
        for (let i = 0; i < rows.length; i += 200) { const { error } = await sb.from('questions').insert(rows.slice(i, i + 200)); if (error) throw error; }
        toast(t('imp.saved'), 'ok'); m.close(); onDone?.(id);
      } catch (x) { err(x.message || String(x)); btnBusy(btn, false); }
    };
  };
}

// ---------- test sahifasi
route('/test/:id', async ({ el, params, alive }) => {
  const [{ data: item }, { data: qs }] = await Promise.all([
    sb.from('items').select('id,title,kind,folder_id').eq('id', params.id).maybeSingle(),
    sb.from('questions').select('id,chapter,question,correct,wrong,explanation').eq('item_id', params.id).order('position').limit(5000),
  ]);
  if (!alive()) return;
  if (!item) return go('/library', true);
  if (!qs?.length) { el.innerHTML = `<div class="page"><a class="btn ghost sm" href="#/library/${item.folder_id || ''}">${ic('back')}</a><div class="card pad center mt">${esc(t('tests.empty'))}</div></div>`; return; }
  intro(el, item, qs);
}, { auth: true });

function intro(el, item, qs) {
  const chs = {}; qs.forEach(q => { const k = q.chapter || ''; chs[k] = (chs[k] || 0) + 1; });
  const names = Object.keys(chs).sort();
  el.innerHTML = `<div class="page narrow"><a class="btn ghost sm" href="#/library/${item.folder_id || ''}">${ic('back')}</a>
    <div class="card pad mt"><h2>${esc(tr(item.title))}</h2><p class="muted">${esc(t('tests.q_count', { n: qs.length }))}</p>
    ${names.length > 1 || names[0] ? `<h4>${esc(t('tests.chapters'))}</h4><div class="chlist">${names.map(n => `<label class="chk"><input type="checkbox" data-ch="${esc(n)}" checked> ${esc(n || t('tests.no_ch'))} <small class="muted">(${chs[n]})</small></label>`).join('')}</div>` : ''}
    <h4>${esc(t('tests.how_many'))}</h4><div class="chips" id="cnt">${[10, 20, 30, 50].filter(n => n < qs.length).map(n => `<button class="chip btnchip" data-n="${n}">${n}</button>`).join('')}<button class="chip btnchip on" data-n="0">${esc(t('tests.all'))}</button></div>
    <button class="btn lg block mt" id="go">${ic('play')} ${esc(t('tests.start'))}</button></div></div>`;
  let n = 0;
  $$('#cnt .btnchip', el).forEach(b => b.onclick = () => { $$('#cnt .btnchip', el).forEach(x => x.classList.remove('on')); b.classList.add('on'); n = +b.dataset.n; });
  $('#go', el).onclick = () => {
    const sel = names.length > 1 || names[0] ? $$('[data-ch]:checked', el).map(c => c.dataset.ch) : names;
    let pool = qs.filter(q => sel.includes(q.chapter || '')); if (!pool.length) return;
    pool = shuffle(pool); if (n) pool = pool.slice(0, n);
    run(el, item, pool, sel, qs);
  };
}

function run(el, item, pool, chapters, allQs) {
  let i = 0, correct = 0, answered = false; const wrongIds = [], wrongInfo = []; const t0 = Date.now();
  const timer = trackTime('test', item.id); onLeave(() => timer.stop());
  const draw = () => {
    const q = pool[i], opts = shuffle([q.correct, ...q.wrong]); answered = false;
    el.innerHTML = `<div class="page narrow"><div class="row between"><button class="btn ghost sm" id="ex">${ic('x')}</button><small class="muted">${esc(t('tests.q_of', { i: i + 1, n: pool.length }))}</small><span class="mono">⏱ <span id="tm">0:00</span></span></div>
      <div class="bar thick mt"><i style="width:${i / pool.length * 100}%"></i></div>
      <div class="card pad mt"><h3 class="qtext">${esc(q.question)}</h3>
      <div class="opts">${opts.map((o, k) => `<button class="opt" data-o="${k}"><span class="ltr">${'ABCDEFGH'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
      <div id="fb"></div></div></div>`;
    const tm = setInterval(() => { if (!$('#tm', el)) return clearInterval(tm); $('#tm', el).textContent = fmtDur((Date.now() - t0) / 1000); }, 1000);
    $('#ex', el).onclick = async () => { if (await confirmDlg(t('tests.exit'), t('yes'))) { timer.stop(); go('/library/' + (item.folder_id || '')); } };
    $$('.opt', el).forEach(b => b.onclick = () => {
      if (answered) return; answered = true; const pick = opts[+b.dataset.o], ok = pick === q.correct;
      if (ok) correct++; else { wrongIds.push(q.id); wrongInfo.push({ q, pick }); }
      $$('.opt', el).forEach((x, k) => { x.disabled = true; if (opts[k] === q.correct) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong'); navigator.vibrate?.(ok ? 20 : [40, 40, 40]);
      $('#fb', el).innerHTML = `${q.explanation ? `<p class="expl">💡 ${esc(q.explanation)}</p>` : ''}<button class="btn lg block mt" id="nx">${esc(i + 1 === pool.length ? t('tests.finish') : t('tests.next'))}</button>`;
      $('#nx', el).onclick = () => { if (++i < pool.length) draw(); else finish(); };
    });
  };
  async function finish() {
    const dur = Math.round((Date.now() - t0) / 1000), pct = Math.round(correct / pool.length * 1000) / 10;
    timer.stop();
    sb.from('test_attempts').insert({ user_id: state.user.id, item_id: item.id, total: pool.length, correct, percent: pct, duration_s: dur, chapters, wrong_ids: wrongIds }).then(() => {});
    const r = 52, C = 2 * Math.PI * r;
    el.innerHTML = `<div class="page narrow"><div class="card pad center result">
      <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" class="rbg"/><circle cx="60" cy="60" r="${r}" class="rfg" id="rfg" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><b>${Math.round(pct)}%</b></div>
      <h2 class="motiv">${esc(motivation(pct))}</h2>
      <div class="stats3"><div class="stat"><span>${esc(t('tests.correct'))}</span><b class="ok">${correct}/${pool.length}</b></div><div class="stat"><span>${esc(t('tests.wrong'))}</span><b class="bad">${pool.length - correct}</b></div><div class="stat"><span>${esc(t('tests.time'))}</span><b>${fmtDur(dur)}</b></div></div>
      <div class="row wrap center mt"><button class="btn" id="rt">${ic('rewind')} ${esc(t('tests.retry'))}</button>${wrongInfo.length ? `<button class="btn soft" id="rw">${esc(t('tests.retry_wrong'))}</button>` : ''}<a class="btn ghost" href="#/library/${item.folder_id || ''}">${esc(t('tests.back'))}</a></div></div>
      ${wrongInfo.length ? `<h3 class="mt">${esc(t('tests.review'))}</h3>${wrongInfo.map(w => `<div class="card pad mb"><b>${esc(w.q.question)}</b><div class="bad">✗ ${esc(t('tests.your'))}: ${esc(w.pick)}</div><div class="ok">✔ ${esc(t('tests.right'))}: ${esc(w.q.correct)}</div>${w.q.explanation ? `<p class="expl">💡 ${esc(w.q.explanation)}</p>` : ''}</div>`).join('')}` : ''}</div>`;
    requestAnimationFrame(() => { const f = $('#rfg', el); if (f) f.style.strokeDashoffset = C * (1 - pct / 100); });
    celebrate(pct);
    $('#rt', el).onclick = () => intro(el, item, allQs);
    $('#rw', el)?.addEventListener('click', () => run(el, item, shuffle(wrongInfo.map(w => w.q)), chapters, allQs));
  }
  draw();
}
