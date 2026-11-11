// Test matnini tahlil qiluvchi toza modul (DOM ishlatmaydi — Node'da ham sinash mumkin).
//
// Admin hujjatda harf (A, B, C, D) yozmasligi ham mumkin. Qoidalar:
//  • Savol — raqam bilan boshlansa ("1." / "1)") yoki bo'sh qator bilan ajratilgan blok.
//  • Variantlar savoldan keyingi satrlar. TO'G'RI JAVOB: odatda BIRINCHI variant.
//    Agar variantlardan biri * yoki + bilan belgilangan bo'lsa — o'sha to'g'ri (joyi farq qilmaydi).
//    "Javob: B" qatori bo'lsa — harfli variantlardan shu tanlanadi.
//  • Harf yorliqlari (A) B. a) ...) agar bo'lsa — olib tashlanadi, ilova o'zi qayta tartiblaydi.
//  • "# Bob nomi" / "Bob: ..." / "Mavzu: ..." / "Глава: ..." / "Chapter: ..." — keyingi savollar shu bobga tegishli.
//  • "Izoh: ..." / "Объяснение: ..." / "Explanation: ..." — savolga tushuntirish.

const NUM_RE = /^\s*(\d{1,4})\s*[\.\)\-:]\s*(.+)$/;
const LABEL_RE = /^\s*[\(\[]?([A-Ha-hА-Га-г])[\)\]\.\:]\s+/;
const CHAPTER_RE = /^\s*(?:#{1,3}\s*|(?:bob|mavzu|bo['‘’`]?lim|глава|тема|раздел|chapter|topic|section)\s*[:\-–]\s*)(.+?)\s*$/i;
const EXPL_RE = /^\s*(?:izoh|tushuntirish|sharh|объяснение|пояснение|explanation|note)\s*[:\-–]\s*(.+)$/i;
const KEY_RE = /^\s*(?:javob|to['‘’`]?g['‘’`]?ri javob|kalit|answer|key|ответ|правильный ответ)\s*[:\-–=]\s*([A-Ha-hА-Га-г])\b/i;
const CYR = { 'А': 'A', 'Б': 'B', 'В': 'C', 'Г': 'D', 'Д': 'E', 'а': 'A', 'б': 'B', 'в': 'C', 'г': 'D', 'д': 'E' };
const normLetter = c => (CYR[c] || c).toUpperCase();

function clean(s) { return s.replace(/\s+/g, ' ').replace(/^[\s ]+|[\s ]+$/g, ''); }

// bitta blokni (savol + variantlar) savolga aylantiradi
function buildQuestion(lines, chapter, warnings, idx) {
  let explanation = '', key = null; const body = [];
  for (const raw of lines) {
    const m = raw.match(EXPL_RE); if (m) { explanation = clean(m[1]); continue; }
    const k = raw.match(KEY_RE); if (k) { key = normLetter(k[1]); continue; }
    body.push(raw);
  }
  if (body.length < 3) { warnings.push(`#${idx}: savol yoki variantlar yetarli emas — o'tkazib yuborildi`); return null; }
  const qLine = body[0].replace(NUM_RE, '$2');
  let opts = body.slice(1).map(s => s.replace(/ /g, ' '));
  if (opts.length > 8) { warnings.push(`#${idx}: variantlar 8 tadan oshdi, ortiqchasi kesildi`); opts = opts.slice(0, 8); }

  // yorliqlar
  const labeled = opts.map(o => { const m = o.replace(/^[\*\+]\s*/, '').match(LABEL_RE); return m ? normLetter(m[1]) : null; });
  const hasLabels = labeled.filter(Boolean).length >= Math.ceil(opts.length / 2);
  // belgilangan to'g'ri javob
  let correctIdx = -1;
  const marked = opts.map(o => /^\s*[\*\+]/.test(o) || /\s\*\s*$/.test(o) || /\s\+\s*$/.test(o));
  if (marked.some(Boolean)) {
    if (marked.filter(Boolean).length > 1) warnings.push(`#${idx}: bir nechta belgi (*) topildi, birinchisi olindi`);
    correctIdx = marked.indexOf(true);
  } else if (key && hasLabels) {
    correctIdx = labeled.indexOf(key);
    if (correctIdx < 0) warnings.push(`#${idx}: "Javob: ${key}" topilmadi, birinchi variant to'g'ri deb olindi`);
  }
  if (correctIdx < 0) correctIdx = 0;

  const texts = opts.map(o => {
    let s = o.replace(/^\s*[\*\+]\s*/, '').replace(/\s[\*\+]\s*$/, '');
    if (hasLabels) s = s.replace(LABEL_RE, '');
    return clean(s);
  });
  const correct = texts[correctIdx];
  const wrong = texts.filter((_, i) => i !== correctIdx);
  // bo'sh va takroriy variantlarni tozalash
  const seen = new Set([correct.toLowerCase()]), wrong2 = [];
  for (const w of wrong) { if (!w) continue; const k = w.toLowerCase(); if (seen.has(k)) continue; seen.add(k); wrong2.push(w); }
  if (!correct || !wrong2.length) { warnings.push(`#${idx}: variantlar to'g'ri emas — o'tkazib yuborildi`); return null; }
  return { chapter: chapter || '', question: clean(qLine), correct, wrong: wrong2, explanation };
}

export function parseQuestions(text, { optionsCount = 4 } = {}) {
  const warnings = [];
  const rawLines = String(text || '').replace(/\r/g, '').replace(/\t/g, ' ').split('\n').map(l => l.replace(/\s+$/, ''));
  // Bob sarlavhalarini ajratib olamiz (ular blok chegarasi ham bo'ladi)
  const items = []; // {t:'line'|'blank'|'chapter', v}
  for (const l of rawLines) {
    if (!l.trim()) { items.push({ t: 'blank' }); continue; }
    const c = l.match(CHAPTER_RE);
    if (c && !NUM_RE.test(l) && c[1].length < 90) { items.push({ t: 'chapter', v: clean(c[1]) }); continue; }
    items.push({ t: 'line', v: l.trim() });
  }
  const lineItems = items.filter(i => i.t === 'line');
  const numbered = lineItems.filter(i => NUM_RE.test(i.v) && !LABEL_RE.test(i.v)).length;

  // blok rejimini hisoblash: bo'sh qator bilan ajratilgan bloklar
  const blocks = []; let cur = [], chapter = '';
  const flush = () => { if (cur.length) { blocks.push({ chapter, lines: cur }); cur = []; } };
  let mode;
  if (numbered >= 2 && numbered >= lineItems.length / (optionsCount + 3)) {
    mode = 'numbered';
    for (const it of items) {
      if (it.t === 'chapter') { flush(); chapter = it.v; continue; }
      if (it.t === 'blank') continue;
      if (NUM_RE.test(it.v) && !LABEL_RE.test(it.v) && !/^\s*\d+\s*[\.\)]\s*$/.test(it.v)) { flush(); }
      cur.push(it.v);
    }
    flush();
  } else {
    // bo'sh qatorli bloklar bormi?
    const tmp = []; let c2 = [], ch2 = '';
    const f2 = () => { if (c2.length) { tmp.push({ chapter: ch2, lines: c2 }); c2 = []; } };
    for (const it of items) { if (it.t === 'chapter') { f2(); ch2 = it.v; } else if (it.t === 'blank') f2(); else c2.push(it.v); }
    f2();
    const good = tmp.filter(b => b.lines.length >= 3).length;
    if (tmp.length >= 2 && good >= tmp.length * 0.6) { mode = 'blocks'; blocks.push(...tmp); }
    else {
      mode = 'fixed'; // har (variantlar+1) qator = bitta savol
      let ch3 = '', buf = [];
      for (const it of items) {
        if (it.t === 'chapter') { buf = []; ch3 = it.v; continue; }
        if (it.t === 'blank') continue;
        buf.push(it.v);
        if (buf.length === optionsCount + 1) { blocks.push({ chapter: ch3, lines: buf }); buf = []; }
      }
      if (buf.length) warnings.push(`Oxirida ${buf.length} ta ortiqcha qator qoldi (variantlar soni ${optionsCount} deb olindi)`);
    }
  }
  const questions = [];
  blocks.forEach((b, i) => { const q = buildQuestion(b.lines, b.chapter, warnings, i + 1); if (q) questions.push(q); });
  return { questions, warnings, mode };
}
