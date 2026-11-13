// Test tizimi: hujjatdan import (Word/PDF/TXT → avtomatik savollar), har safar aralashadigan variantlar,
// bob bo'yicha tanlash, natija, foiz, motivatsiya va salyut effektlari.
import { sb, state, t, addDict, friendlyErr, route, go, esc, ic, $, $$, tr, shuffle, rand, modal, toast, btnBusy, fmtDur, trackTime, onLeave, spinner, confirmDlg, i18nField, uzFix, publicUrl } from './core.js';
import { T } from './ui.js';
import { paywall } from './billing.js';
import { parseQuestions } from './testparse.js';
import { celebrate } from './fx.js';

addDict({
  uz: {
    'tests.q_count': '{n} ta savol', 'tests.start': 'Boshlash', 'tests.chapters': 'Boblar / mavzular', 'tests.all_ch': 'Hammasi', 'tests.no_ch': 'Bobsiz',
    'tests.how_many': 'Nechta savol?', 'tests.all': 'Hammasi', 'tests.next': 'Keyingi', 'tests.finish': 'Yakunlash', 'tests.q_of': 'Savol {i} / {n}',
    'tests.result': 'Natija', 'tests.correct': 'To\'g\'ri', 'tests.wrong': 'Xato', 'tests.time': 'Vaqt', 'tests.retry': 'Qayta yechish', 'tests.retry_wrong': 'Xatolarni qayta yechish',
    'tests.review': 'Xatolar tahlili', 'tests.your': 'Sizning javobingiz', 'tests.right': 'To\'g\'ri javob', 'tests.back': 'Kutubxonaga',
    'tests.empty': 'Bu testda hali savol yo\'q', 'tests.exit': 'Testdan chiqasizmi? Natija saqlanmaydi.',
    'tg.btn': 'Yo\'riqnoma va namunalar', 'tg.title': 'Test tayyorlash yo\'riqnomasi', 'tg.intro': 'Ilova hujjat turini (Word, PDF, TXT) va savol shaklini o\'zi aniqlaydi. Quyidagi 5 usuldan istalganini ishlating — hatto bir faylda aralash ham bo\'ladi. Har bir namunani «Sinab ko\'rish» tugmasi bilan darhol tekshirishingiz mumkin.', 'tg.s1': '1-usul. Eng oddiy: birinchi variant to\'g\'ri', 'tg.s1d': 'Har bir savoldan keyin variantlar yoziladi. BIRINCHI variant to\'g\'ri javob hisoblanadi. Harflar shart emas — ilova o\'zi aralashtiradi, shuning uchun to\'g\'ri javob har safar boshqa joyda chiqadi.', 'tg.s2': '2-usul. Yulduzcha (*) bilan belgilash', 'tg.s2d': 'To\'g\'ri variant oldiga * yoki + qo\'ying. U istalgan joyda bo\'lishi mumkin.', 'tg.s3': '3-usul. «Javob:» qatori', 'tg.s3d': 'Variantlar A) B) C) D) harflari bilan yozilib, oxirida «Javob: B» deb ko\'rsatiladi.', 'tg.s4': '4-usul. Bob (mavzu) sarlavhalari', 'tg.s4d': '«# Bob nomi», «Mavzu: ...» yoki «Bob: ...» qatori keyingi savollarni shu mavzuga biriktiradi. Natijalarda mavzular bo\'yicha statistika chiqadi.', 'tg.s5': '5-usul. Izoh qo\'shish', 'tg.s5d': '«Izoh: ...» qatori savol tagida, javobdan keyin tushuntirish sifatida ko\'rsatiladi.', 'tg.tips': 'Muhim maslahatlar', 'tg.t1': 'Savollar orasiga bo\'sh qator qo\'ying yoki raqamlang (1. 2. 3.).', 'tg.t2': 'Word: oddiy matn yozing. Jadval va rasmlar o\'qilmaydi.', 'tg.t3': 'PDF: matnli bo\'lishi kerak. Telefon bilan suratga olingan (skan) PDF o\'qilmaydi — uni Word\'ga o\'tkazing.', 'tg.t4': 'Eng ko\'pi bilan 8 ta variant. Nechta variant bo\'lishini oynadagi «Variantlar soni» orqali belgilaysiz.', 'tg.t5': 'Yuklangach «Tahlil qilish»ni bosing: topilgan savollar ko\'rinadi, keraksizini ✕ bilan o\'chirasiz.', 'tg.try': 'Sinab ko\'rish', 'tg.dl': 'Namuna faylni yuklab olish (.txt)', 'tg.insert': 'Namunani maydonga qo\'yish', 'tg.sample_name': 'namuna-test', 'tg.close': 'Yopish',
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
    'tg.btn': 'Инструкция и образцы', 'tg.title': 'Инструкция по подготовке теста', 'tg.intro': 'Приложение само определяет тип файла (Word, PDF, TXT) и форму вопросов. Используйте любой из 5 способов — даже вперемешку в одном файле. Каждый образец можно сразу проверить кнопкой «Попробовать».', 'tg.s1': 'Способ 1. Самый простой: первый вариант верный', 'tg.s1d': 'После вопроса идут варианты. ПЕРВЫЙ вариант считается правильным. Буквы не нужны — приложение само перемешает, поэтому правильный ответ каждый раз на новом месте.', 'tg.s2': 'Способ 2. Пометка звёздочкой (*)', 'tg.s2d': 'Поставьте * или + перед верным вариантом. Он может стоять где угодно.', 'tg.s3': 'Способ 3. Строка «Ответ:»', 'tg.s3d': 'Варианты с буквами A) B) C) D), в конце «Ответ: B».', 'tg.s4': 'Способ 4. Заголовки глав (тем)', 'tg.s4d': 'Строка «# Название», «Тема: ...» или «Глава: ...» привязывает следующие вопросы к теме. В результатах появится статистика по темам.', 'tg.s5': 'Способ 5. Пояснение', 'tg.s5d': 'Строка «Объяснение: ...» показывается под вопросом после ответа.', 'tg.tips': 'Важные советы', 'tg.t1': 'Разделяйте вопросы пустой строкой или нумеруйте (1. 2. 3.).', 'tg.t2': 'Word: пишите обычный текст. Таблицы и картинки не читаются.', 'tg.t3': 'PDF должен быть текстовым. Скан с телефона не читается — переведите в Word.', 'tg.t4': 'Не более 8 вариантов. Число вариантов задаётся полем «Число вариантов».', 'tg.t5': 'После загрузки нажмите «Разобрать»: найденные вопросы появятся, лишние удаляются крестиком.', 'tg.try': 'Попробовать', 'tg.dl': 'Скачать образец (.txt)', 'tg.insert': 'Вставить образец в поле', 'tg.sample_name': 'obrazets-testa', 'tg.close': 'Закрыть',
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
    'tg.btn': 'Guide & samples', 'tg.title': 'How to prepare a test', 'tg.intro': 'The app detects the file type (Word, PDF, TXT) and question style by itself. Use any of the 5 styles below — they can even be mixed in one file. Each sample can be tried right away with the “Try it” button.', 'tg.s1': 'Style 1. Simplest: first option is correct', 'tg.s1d': 'Options follow each question. The FIRST option is treated as correct. No letters needed — the app shuffles them, so the right answer appears in a different place every time.', 'tg.s2': 'Style 2. Mark with an asterisk (*)', 'tg.s2d': 'Put * or + before the correct option. It can be anywhere.', 'tg.s3': 'Style 3. An “Answer:” line', 'tg.s3d': 'Options with letters A) B) C) D), then “Answer: B” at the end.', 'tg.s4': 'Style 4. Chapter (topic) headings', 'tg.s4d': 'A line like “# Name”, “Topic: ...” or “Chapter: ...” attaches the following questions to that topic. Results then show per-topic statistics.', 'tg.s5': 'Style 5. Add an explanation', 'tg.s5d': 'An “Explanation: ...” line is shown under the question after answering.', 'tg.tips': 'Important tips', 'tg.t1': 'Separate questions with a blank line or number them (1. 2. 3.).', 'tg.t2': 'Word: write plain text. Tables and pictures are not read.', 'tg.t3': 'PDF must contain real text. A phone scan is not readable — convert it to Word.', 'tg.t4': 'Up to 8 options. Set the count with the “Options” field.', 'tg.t5': 'After loading press “Parse”: found questions are listed and you can remove extras with ✕.', 'tg.try': 'Try it', 'tg.dl': 'Download sample file (.txt)', 'tg.insert': 'Put sample into the field', 'tg.sample_name': 'sample-test', 'tg.close': 'Close',
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
const SAMPLES = [
  ['tg.s1', 'tg.s1d', `Hujayra nazariyasini kim yaratgan?\nSchleiden va Schwann\nDarvin\nMendel\nPasteur\n\nDNK qayerda joylashgan?\nYadroda\nRibosomada\nLizosomada\nGolji apparatida`],
  ['tg.s2', 'tg.s2d', `1. Fotosintez qayerda boradi?\nMitoxondriyada\n*Xloroplastda\nYadroda\nRibosomada\n\n2. Qon guruhlari nechta?\n2\n3\n+4\n8`],
  ['tg.s3', 'tg.s3d', `1. Insulin qaysi bez gormoni?\nA) Qalqonsimon\nB) Oshqozon osti\nC) Buyrak usti\nD) Gipofiz\nJavob: B`],
  ['tg.s4', 'tg.s4d', `# Genetika\nIrsiyat birligi nima?\nGen\nHujayra\nTo'qima\nOrgan\n\n# Ekologiya\nProdutsentlar kimlar?\nYashil o'simliklar\nBakteriyalar\nHayvonlar\nVirus`],
  ['tg.s5', 'tg.s5d', `Yurak necha kamerali?\n4 kamerali\n2 kamerali\n3 kamerali\n5 kamerali\nIzoh: Odam yuragi ikki bo'lmacha va ikki qorinchadan iborat.`],
];
export function testGuide(onInsert) {
  const m = modal(`<h3>${ic('book')} ${esc(t('tg.title'))}</h3><p class="muted">${esc(t('tg.intro'))}</p>
    ${SAMPLES.map(([h, d, ex], i) => `<div class="card pad mb"><h4>${esc(t(h))}</h4><p class="small muted">${esc(t(d))}</p><pre class="code">${esc(ex)}</pre><button class="btn sm soft" data-try="${i}">${esc(t('tg.try'))}</button></div>`).join('')}
    <div class="card pad mb"><h4>💡 ${esc(t('tg.tips'))}</h4><ul class="small">${[1, 2, 3, 4, 5].map(i => `<li>${esc(t('tg.t' + i))}</li>`).join('')}</ul></div>
    <div class="row wrap"><button class="btn ghost" id="gdl">⬇ ${esc(t('tg.dl'))}</button><span class="grow"></span><button class="btn" id="gx">${esc(t('tg.close'))}</button></div>`, { cls: 'wide' });
  $$('[data-try]', m.el).forEach(b => b.onclick = () => { onInsert(SAMPLES[+b.dataset.try][2]); m.close(); });
  $('#gx', m.el).onclick = () => m.close();
  $('#gdl', m.el).onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([SAMPLES.map(x => x[2]).join('\n\n\n')], { type: 'text/plain;charset=utf-8' })); a.download = t('tg.sample_name') + '.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
}

export function testImportModal({ folderId = null, itemId = null, hidden = false, onDone } = {}) {
  const m = modal(`<h3>${ic('test')} ${esc(t('imp.title'))}</h3><p class="muted small">${esc(t('imp.how'))}</p><p class="small">${esc(t('imp.rules'))}</p>
    <button class="btn soft mb" id="tgb" type="button">${ic('book', 16)} ${esc(t('tg.btn'))}</button>
    <details class="mb"><summary>${esc(t('imp.example'))}</summary><pre class="code">${esc(t('imp.ex_text'))}</pre></details>
    <div class="form">
      ${itemId ? '' : `<label class="fld"><span>${esc(t('imp.name'))}</span><input class="input" id="nm" required></label>`}
      <label class="fld"><span>${esc(t('imp.file'))} (.docx / .pdf / .txt)</span><input type="file" id="fl" accept=".docx,.pdf,.txt,.md"></label>
      <label class="fld"><span>${esc(t('imp.paste'))}</span><textarea class="input" id="tx" rows="5"></textarea></label>
      <label class="fld"><span>${esc(t('imp.opts'))}</span><input class="input" id="oc" type="number" min="2" max="8" value="4" style="max-width:100px"></label>
      <div class="err" id="err"></div><button class="btn" id="pr">${esc(t('imp.parse'))}</button>
      <div id="prev"></div></div>`, { cls: 'wide' });
  const el = m.el; let qs = [];
  $('#tgb', el).onclick = () => testGuide(txt => { $('#tx', el).value = txt; if (!itemId && !$('#nm', el).value) $('#nm', el).value = t('tg.sample_name'); $('#pr', el).click(); });
  const err = x => $('#err', el).textContent = x || '';
  $('#fl', el).onchange = async e => {
    const f = e.target.files[0]; if (!f) return; err(); $('#tx', el).value = t('imp.reading');
    try { $('#tx', el).value = await extractText(f); if (!itemId && !$('#nm', el).value) $('#nm', el).value = f.name.replace(/\.[^.]+$/, ''); }
    catch (x) { $('#tx', el).value = ''; err(f.name.toLowerCase().endsWith('.pdf') ? t('imp.pdf_fail') : friendlyErr(x.message || String(x))); }
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
          const { data, error } = await sb.from('items').insert({ folder_id: folderId, kind: 'test', visible: !hidden, title: await i18nField(title, state.lang), created_by: state.user.id }).select('id').single();
          if (error) throw error; id = data.id;
        }
        const { count } = await sb.from('questions').select('*', { count: 'exact', head: true }).eq('item_id', id);
        const rows = list.map((q, i) => ({ item_id: id, position: (count || 0) + i, chapter: q.chapter, question: q.question, correct: q.correct, wrong: q.wrong, explanation: q.explanation || null }));
        for (let i = 0; i < rows.length; i += 200) { const { error } = await sb.from('questions').insert(rows.slice(i, i + 200)); if (error) throw error; }
        toast(t('imp.saved'), 'ok'); m.close(); onDone?.(id);
      } catch (x) { err(friendlyErr(x.message || String(x))); btnBusy(btn, false); }
    };
  };
}

// ---------- test sahifasi
route('/test/:id', async ({ el, params, alive }) => {
  if (await paywall(el)) return;
  const [{ data: item }, { data: qs }] = await Promise.all([
    sb.from('items').select('id,title,kind,folder_id,created_by').eq('id', params.id).maybeSingle(),
    sb.from('questions').select('id,chapter,question,correct,wrong,explanation,image_path,difficulty,points').eq('item_id', params.id).order('position').limit(5000),
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
    <div class="card pad mt"><div class="row between"><h2>${esc(tr(item.title))}</h2>${state.isAdmin || item.created_by === state.user.id ? `<a class="btn ghost sm" href="#/test/${item.id}/edit">${ic('edit', 14)} ${esc(T('Savollar', 'Вопросы', 'Questions'))}</a>` : ''}</div><p class="muted">${esc(t('tests.q_count', { n: qs.length }))}</p>
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
  let i = 0, correct = 0, earned = 0, answered = false; const maxPts = pool.reduce((a, x) => a + (x.points || 1), 0); const wrongIds = [], wrongInfo = []; const t0 = Date.now();
  const timer = trackTime('test', item.id); onLeave(() => timer.stop());
  const draw = () => {
    const q = pool[i], opts = shuffle([q.correct, ...q.wrong]); answered = false;
    el.innerHTML = `<div class="page narrow"><div class="row between"><button class="btn ghost sm" id="ex">${ic('x')}</button><small class="muted">${esc(t('tests.q_of', { i: i + 1, n: pool.length }))}</small><span class="mono">⏱ <span id="tm">0:00</span></span></div>
      <div class="bar thick mt"><i style="width:${i / pool.length * 100}%"></i></div>
      <div class="card pad mt">${q.image_path ? `<img class="qimg full" src="${esc(publicUrl('media', q.image_path))}" alt="" loading="lazy">` : ''}<h3 class="qtext">${esc(q.question)}</h3>
      <div class="opts">${opts.map((o, k) => `<button class="opt" data-o="${k}"><span class="ltr">${'ABCDEFGH'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
      <div id="fb"></div></div></div>`;
    const tm = setInterval(() => { if (!$('#tm', el)) return clearInterval(tm); $('#tm', el).textContent = fmtDur((Date.now() - t0) / 1000); }, 1000);
    $('#ex', el).onclick = async () => { if (await confirmDlg(t('tests.exit'), t('yes'))) { timer.stop(); go('/library/' + (item.folder_id || '')); } };
    // 1) variant tanlanadi, 2) "Tasdiqlash" bosiladi, 3) to'g'ri/xato ko'rsatiladi
    let sel = -1; const fb = $('#fb', el);
    const ask = () => { fb.innerHTML = `<button class="btn lg block mt" id="cf" ${sel < 0 ? 'disabled' : ''}>${esc(T('Tasdiqlash', 'Подтвердить', 'Confirm'))}</button>`; $('#cf', el).onclick = confirmPick; };
    const confirmPick = () => {
      if (answered || sel < 0) return; answered = true; const pick = opts[sel], ok = pick === q.correct;
      if (ok) { correct++; earned += q.points || 1; } else { wrongIds.push(q.id); wrongInfo.push({ q, pick }); }
      $$('.opt', el).forEach((x, k) => { x.disabled = true; x.classList.remove('sel'); if (opts[k] === q.correct) x.classList.add('right'); });
      if (!ok) $$('.opt', el)[sel].classList.add('wrong'); navigator.vibrate?.(ok ? 20 : [40, 40, 40]);
      fb.innerHTML = `<div class="verdict ${ok ? 'ok' : 'bad'}">${ok ? '✔ ' + esc(T('To\'g\'ri!', 'Верно!', 'Correct!')) : '✘ ' + esc(T('Noto\'g\'ri', 'Неверно', 'Wrong')) + ' — ' + esc(T('to\'g\'ri javob', 'правильный ответ', 'correct answer')) + ': ' + esc(q.correct)}</div>${q.explanation ? `<p class="expl">💡 ${esc(q.explanation)}</p>` : ''}<button class="btn lg block mt" id="nx">${esc(i + 1 === pool.length ? t('tests.finish') : t('tests.next'))}</button>`;
      $('#nx', el).onclick = async () => { if (i + 1 < pool.length) { i++; draw(); } else if (await confirmDlg(T('Testni topshirasizmi? Natija saqlanadi.', 'Завершить тест? Результат будет сохранён.', 'Submit the test? Your result will be saved.'), T('Topshirish', 'Завершить', 'Submit'))) { i++; finish(); } };
    };
    $$('.opt', el).forEach((b, k) => b.onclick = () => { if (answered) return; sel = k; $$('.opt', el).forEach((x, j) => x.classList.toggle('sel', j === k)); const c = $('#cf', el); if (c) c.disabled = false; });
    ask();
  };
  async function finish() {
    const dur = Math.round((Date.now() - t0) / 1000), pct = Math.round(correct / pool.length * 1000) / 10;
    timer.stop();
    sb.from('test_attempts').insert({ user_id: state.user.id, item_id: item.id, total: pool.length, correct, percent: pct, duration_s: dur, chapters, wrong_ids: wrongIds }).select('id').single().then(async ({ data: at }) => { if (!at) return; const { data: x } = await sb.rpc('claim_test_xp', { p_attempt: at.id }); if (x?.xp) { toast('+' + x.xp + ' XP', 'ok'); import('./xp.js').then(m => m.refreshStats()); } });
    const r = 52, C = 2 * Math.PI * r;
    el.innerHTML = `<div class="page narrow"><div class="card pad center result">
      <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" class="rbg"/><circle cx="60" cy="60" r="${r}" class="rfg" id="rfg" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><b>${Math.round(pct)}%</b></div>
      <h2 class="motiv">${esc(motivation(pct))}</h2>${maxPts !== pool.length ? `<p class="muted">${esc(T('Ball', 'Баллы', 'Score'))}: <b>${earned} / ${maxPts}</b></p>` : ''}
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
