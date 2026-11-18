import fs from 'fs'; import crypto from 'crypto';
import c1 from './ch1.mjs'; import c2a from './ch2a.mjs'; import c2b from './ch2b.mjs'; import c2c from './ch2c.mjs'; import c2d from './ch2d.mjs'; import c3 from './ch3.mjs'; import CT from './chtests.mjs';
const topics = [...c1, ...c2a, ...c2b, ...c2c, ...c2d, ...c3].sort((a, b) => a.n - b.n);
const uid = s => { const h = crypto.createHash('md5').update('bio5:' + s).digest('hex'); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`; };
const q = s => `'${String(s).replace(/'/g, "''")}'`;
const J = o => q(JSON.stringify(o));
const T3 = s => J({ uz: s, ru: s, en: s });
const CID = uid('course');
const chNames = { 1: `1-bob. Biologiya – tirik tabiat haqidagi fan`, 2: `2-bob. Tirik organizmlar dunyosi`, 3: `3-bob. Organizm va tashqi muhit` };
const out = []; let secPos = 0;
out.push(`-- 5-sinf Biologiya kursi (avto-yaratilgan). Qayta ishga tushirsa avval o'chirib, qaytadan yaratadi.
-- Oldin update12.sql va update16.sql ni ishga tushiring.
begin;
delete from public.items where id in (select item_id from public.lessons where course_id = '${CID}' and item_id is not null);
delete from public.courses where id = '${CID}';
insert into public.courses(id, title, description, grade, level, is_premium, status, author_id, goals)
values ('${CID}', ${T3('5-sinf Biologiya')}, ${T3("5-sinf biologiya darsligi asosida: har bir mavzuda hujjat, slayd, kartochkalar, mavzu testi va takrorlash testi; har bob oxirida yakuniy test.")}, 5, 'basic', true, 'published',
  (select id from public.profiles where lower(email) = 'ulugbekkamalov0829@gmail.com' limit 1),
  ${J(['Biologiya asoslarini sodda tilda o\'rganish', 'Har mavzuni test va kartochkalar bilan mustahkamlash', 'Tabiatni tushunish va asrash'])});`);
let lp = 0;
let curCh = null;
function chapter(id, title, pos) { out.push(`insert into public.course_chapters(id, course_id, title, position) values ('${id}','${CID}',${T3(title)},${pos});`); }
function section(id, title, kind = 'topic') { out.push(`insert into public.course_sections(id, course_id, title, position, chapter_id, kind) values ('${id}','${CID}',${T3(title)},${secPos++},'${curCh}','${kind}');`); }
function lesson(sec, id, title, kind, body, xp, item) { out.push(`insert into public.lessons(id, course_id, section_id, title, kind, item_id, body, xp, position) values ('${id}','${CID}','${sec}',${T3(title)},'${kind}',${item ? `'${item}'` : 'null'},'',${xp},${lp++});`); if (body) out.push(`insert into public.lesson_bodies(lesson_id, body) values ('${id}',${q(body)});`); }
function testItem(key, title, qs, chapterOf) {
  const iid = uid('item:' + key);
  out.push(`insert into public.items(id, folder_id, kind, title, visible, source, created_by) values ('${iid}', null, 'test', ${T3(title)}, false, null, (select author_id from public.courses where id='${CID}'));`);
  qs.forEach((x, i) => out.push(`insert into public.questions(id, item_id, position, chapter, question, correct, wrong, explanation) values ('${uid('q:' + key + ':' + i)}','${iid}',${i},${q(chapterOf(x))},${q(x[0])},${q(x[1])},${J(x[2])},${q(x[3] || '')});`));
  return iid;
}
const shuf = a => a; // aralashtirish ilovada (variantlar va savollar tartibi) bajariladi
for (const ch of [1, 2, 3]) {
  curCh = uid('chap:' + ch); chapter(curCh, chNames[ch], ch - 1);
  for (const t of topics.filter(x => x.ch === ch)) {
    const sid = uid('sec:' + t.n); const name = `${t.n}-§. ${t.title}`;
    section(sid, name);
    lesson(sid, uid(`l:${t.n}:doc`), `Hujjat: ${t.title}`, 'text', t.doc, 10);
    lesson(sid, uid(`l:${t.n}:sl`), `Slayd: ${t.title}`, 'slides', JSON.stringify(t.slides), 10);
    lesson(sid, uid(`l:${t.n}:cd`), `Kartochkalar: ${t.title}`, 'cards', JSON.stringify(t.cards), 15);
    lesson(sid, uid(`l:${t.n}:t`), `Mavzu testi: ${t.title}`, 'test', '', 25, testItem(`t${t.n}`, `${t.n}-§ ${t.title} – mavzu testi`, t.test, () => name));
    if (t.rev && t.rev.length) { const rid = uid('sec:r' + t.n); section(rid, `Takrorlash: ${t.n - 1}-§ va ${t.n}-§`, 'review');
      lesson(rid, uid(`l:${t.n}:r`), `Takrorlash testi: ${t.n - 1}-§ va ${t.n}-§`, 'test', '', 25, testItem(`r${t.n}`, `${t.n - 1}-§ + ${t.n}-§ takrorlash testi`, t.rev, () => `${t.n - 1}–${t.n}-§ takrorlash`)); }
  }
  const sid = uid('sec:ch' + ch);
  section(sid, `${ch}-bob yakuniy testi`, 'final');
  const byN = Object.fromEntries(topics.map(t => [t.n, t.title]));
  lesson(sid, uid(`l:ch${ch}`), `${ch}-bob yakuniy testi`, 'test', '', 40, testItem(`ch${ch}`, chNames[ch] + ' – yakuniy test', CT[ch], x => `${x[4]}-§ ${byN[x[4]]}`));
}
out.push('commit;');
fs.writeFileSync(new URL('../seed_biologiya5.sql', import.meta.url).pathname, out.join('\n') + '\n');
console.log('lines', out.length, 'lessons', lp, 'sections', secPos);
