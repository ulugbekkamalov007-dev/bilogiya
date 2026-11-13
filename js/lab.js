// Virtual biologiya laboratoriyasi (2D, brauzerda hisoblanadi): hujayra, DNK, Punnett, anatomiya, fotosintez, ekotizim
import { route, esc, ic, $, $$ } from './core.js';
import { T } from './ui.js';

const TABS = () => [['cell', T('Hujayra', 'Клетка', 'Cell')], ['dna', T('DNK', 'ДНК', 'DNA')], ['punnett', 'Punnett'], ['anat', T('Anatomiya', 'Анатомия', 'Anatomy')], ['photo', T('Fotosintez', 'Фотосинтез', 'Photosynthesis')], ['eco', T('Ekotizim', 'Экосистема', 'Ecosystem')]];

// ---- 1) hujayra
const ORG = () => ({
  nucleus: [T('Yadro', 'Ядро', 'Nucleus'), T('DNK saqlanadi, hujayra faoliyatini boshqaradi.', 'Хранит ДНК и управляет работой клетки.', 'Stores DNA and controls the cell.')],
  mito: [T('Mitoxondriya', 'Митохондрия', 'Mitochondrion'), T('ATF (energiya) ishlab chiqaradi — hujayra nafasi.', 'Вырабатывает АТФ — клеточное дыхание.', 'Makes ATP (energy) — cellular respiration.')],
  er: [T('Endoplazmatik to\'r', 'Эндоплазматическая сеть', 'Endoplasmic reticulum'), T('Oqsil va lipidlar sintezi, moddalar tashish.', 'Синтез белков и липидов, транспорт.', 'Protein and lipid synthesis, transport.')],
  golgi: [T('Golji apparati', 'Аппарат Гольджи', 'Golgi apparatus'), T('Moddalarni qadoqlaydi va hujayra tashqarisiga yuboradi.', 'Упаковывает и выводит вещества.', 'Packages and ships molecules.')],
  ribo: [T('Ribosoma', 'Рибосома', 'Ribosome'), T('Oqsil sintezi sodir bo\'ladigan joy.', 'Место синтеза белка.', 'Site of protein synthesis.')],
  lyso: [T('Lizosoma', 'Лизосома', 'Lysosome'), T('Fermentlar yordamida chiqindilarni parchalaydi.', 'Расщепляет отходы ферментами.', 'Digests waste with enzymes.')],
  chloro: [T('Xloroplast', 'Хлоропласт', 'Chloroplast'), T('Fotosintez: yorug\'lik energiyasini glyukozaga aylantiradi (faqat o\'simlikda).', 'Фотосинтез (только у растений).', 'Photosynthesis (plants only).')],
  wall: [T('Hujayra devori', 'Клеточная стенка', 'Cell wall'), T('Hujayrani mustahkamlaydi (o\'simlik, zamburug\'da).', 'Укрепляет клетку (растения, грибы).', 'Rigid support (plants, fungi).')],
  memb: [T('Hujayra membranasi', 'Клеточная мембрана', 'Cell membrane'), T('Moddalar o\'tishini tanlab boshqaradi.', 'Избирательно пропускает вещества.', 'Selectively controls what passes.')],
});
function cell(box) {
  let plant = false, sel = 'nucleus';
  const draw = () => {
    const o = ORG(), cls = k => `org ${sel === k ? 'on' : ''}`;
    box.innerHTML = `<div class="row" style="gap:8px;margin-bottom:10px"><button class="btn sm ${plant ? 'ghost' : ''}" data-p="0">${esc(T('Hayvon hujayrasi', 'Животная клетка', 'Animal cell'))}</button><button class="btn sm ${plant ? '' : 'ghost'}" data-p="1">${esc(T('O\'simlik hujayrasi', 'Растительная клетка', 'Plant cell'))}</button></div>
      <svg class="labsvg" viewBox="0 0 400 300" role="img" aria-label="cell">
        ${plant ? `<g class="${cls('wall')}" data-k="wall"><rect x="12" y="12" width="376" height="276" rx="34" fill="#bde3a5" stroke="#4d7c0f" stroke-width="6"/></g>` : ''}
        <g class="${cls('memb')}" data-k="memb"><rect x="${plant ? 24 : 14}" y="${plant ? 24 : 14}" width="${plant ? 352 : 372}" height="${plant ? 252 : 272}" rx="${plant ? 28 : 60}" fill="#e8f5e9" stroke="#087C50" stroke-width="4"/></g>
        <g class="${cls('er')}" data-k="er"><path d="M150 110c20-20 40 0 20 20s-30 20-10 36M165 90c25-10 35 10 15 25" fill="none" stroke="#6366f1" stroke-width="8" stroke-linecap="round"/></g>
        <g class="${cls('nucleus')}" data-k="nucleus"><circle cx="200" cy="150" r="46" fill="#c4b5fd" stroke="#6d28d9" stroke-width="4"/><circle cx="208" cy="144" r="14" fill="#6d28d9"/></g>
        <g class="${cls('mito')}" data-k="mito"><ellipse cx="86" cy="190" rx="32" ry="17" fill="#fdba74" stroke="#c2410c" stroke-width="3"/><path d="M62 190q8-10 12 0t12 0 12 0" fill="none" stroke="#c2410c" stroke-width="2"/><ellipse cx="300" cy="215" rx="30" ry="16" fill="#fdba74" stroke="#c2410c" stroke-width="3"/></g>
        <g class="${cls('golgi')}" data-k="golgi"><path d="M280 80q22-8 40 0M278 92q24-8 44 0M280 104q22-8 40 0" fill="none" stroke="#db2777" stroke-width="6" stroke-linecap="round"/></g>
        <g class="${cls('ribo')}" data-k="ribo">${[[120, 70], [135, 62], [250, 230], [265, 238], [100, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#0ea5e9"/>`).join('')}</g>
        <g class="${cls('lyso')}" data-k="lyso"><circle cx="320" cy="170" r="14" fill="#fca5a5" stroke="#b91c1c" stroke-width="3"/><circle cx="105" cy="245" r="11" fill="#fca5a5" stroke="#b91c1c" stroke-width="3"/></g>
        ${plant ? `<g class="${cls('chloro')}" data-k="chloro"><ellipse cx="150" cy="235" rx="26" ry="14" fill="#4ade80" stroke="#15803d" stroke-width="3"/><ellipse cx="330" cy="120" rx="24" ry="13" fill="#4ade80" stroke="#15803d" stroke-width="3"/></g>` : ''}
      </svg><div class="card pad mt" id="inf"><b>${esc(o[sel][0])}</b><p class="muted">${esc(o[sel][1])}</p></div>
      <div class="chips mt">${Object.keys(o).filter(k => plant || (k !== 'chloro' && k !== 'wall')).map(k => `<button class="chip" data-k="${k}" style="cursor:pointer">${esc(o[k][0])}</button>`).join('')}</div>`;
    $$('[data-p]', box).forEach(b => b.onclick = () => { plant = b.dataset.p === '1'; if (!plant && (sel === 'chloro' || sel === 'wall')) sel = 'nucleus'; draw(); });
    $$('[data-k]', box).forEach(b => b.onclick = () => { sel = b.dataset.k; draw(); });
  };
  draw();
}

// ---- 2) DNK -> mRNK -> oqsil
const CODON = { UUU: 'Phe', UUC: 'Phe', UUA: 'Leu', UUG: 'Leu', CUU: 'Leu', CUC: 'Leu', CUA: 'Leu', CUG: 'Leu', AUU: 'Ile', AUC: 'Ile', AUA: 'Ile', AUG: 'Met', GUU: 'Val', GUC: 'Val', GUA: 'Val', GUG: 'Val', UCU: 'Ser', UCC: 'Ser', UCA: 'Ser', UCG: 'Ser', CCU: 'Pro', CCC: 'Pro', CCA: 'Pro', CCG: 'Pro', ACU: 'Thr', ACC: 'Thr', ACA: 'Thr', ACG: 'Thr', GCU: 'Ala', GCC: 'Ala', GCA: 'Ala', GCG: 'Ala', UAU: 'Tyr', UAC: 'Tyr', UAA: 'STOP', UAG: 'STOP', CAU: 'His', CAC: 'His', CAA: 'Gln', CAG: 'Gln', AAU: 'Asn', AAC: 'Asn', AAA: 'Lys', AAG: 'Lys', GAU: 'Asp', GAC: 'Asp', GAA: 'Glu', GAG: 'Glu', UGU: 'Cys', UGC: 'Cys', UGA: 'STOP', UGG: 'Trp', CGU: 'Arg', CGC: 'Arg', CGA: 'Arg', CGG: 'Arg', AGU: 'Ser', AGC: 'Ser', AGA: 'Arg', AGG: 'Arg', GGU: 'Gly', GGC: 'Gly', GGA: 'Gly', GGG: 'Gly' };
function dna(box) {
  box.innerHTML = `<label class="fld"><span>${esc(T('DNK zanjiri (kodlovchi / matritsa) — A, T, G, C harflari', 'Цепь ДНК — буквы A, T, G, C', 'DNA strand — letters A, T, G, C'))}</span><input class="input" id="s" value="TACGGATTCAAGCTA" maxlength="90" autocomplete="off" spellcheck="false"></label><div id="o" class="mt"></div>`;
  const run = () => {
    const s = $('#s', box).value.toUpperCase().replace(/[^ATGC]/g, ''), o = $('#o', box); if (s.length < 3) { o.innerHTML = `<p class="muted">${esc(T('Kamida 3 ta harf kiriting', 'Введите минимум 3 буквы', 'Enter at least 3 letters'))}</p>`; return; }
    const comp = [...s].map(c => ({ A: 'T', T: 'A', G: 'C', C: 'G' }[c])).join(''), mrna = [...s].map(c => ({ A: 'U', T: 'A', G: 'C', C: 'G' }[c])).join(''); const cod = mrna.match(/.{3}/g).filter(x => x.length === 3); const aa = []; for (const c of cod) { const a = CODON[c]; if (a === 'STOP') { aa.push('STOP'); break; } aa.push(a); }
    const gc = Math.round([...s].filter(c => c === 'G' || c === 'C').length / s.length * 100); const col = c => ({ A: '#16a34a', T: '#dc2626', G: '#2563eb', C: '#d97706', U: '#dc2626' }[c]); const sp = str => [...str].map(c => `<b style="color:${col(c)}">${c}</b>`).join('');
    o.innerHTML = `<div class="labcard" style="font-family:monospace;font-size:1.15rem;letter-spacing:.2em;overflow:auto"><div>5′ ${sp(s)} 3′<br><small style="letter-spacing:0">${esc(T('DNK (berilgan)', 'ДНК (исходная)', 'DNA (given)'))}</small></div><div class="mt">3′ ${sp(comp)} 5′<br><small style="letter-spacing:0">${esc(T('Komplementar zanjir', 'Комплементарная цепь', 'Complementary strand'))}</small></div><div class="mt">${sp(mrna)}<br><small style="letter-spacing:0">mRNK (${esc(T('transkripsiya: matritsa bo\'yicha', 'транскрипция по матрице', 'transcription from the template'))})</small></div>
      <div class="mt">${cod.map(c => `<span style="margin-right:10px">${sp(c)}</span>`).join('')}<br><small style="letter-spacing:0">${esc(T('Kodonlar', 'Кодоны', 'Codons'))}</small></div><div class="mt" style="letter-spacing:0"><b>${esc(T('Oqsil (translyatsiya)', 'Белок (трансляция)', 'Protein (translation)'))}:</b> ${aa.join(' – ')}</div></div>
      <div class="statrow mt"><div class="sbox"><b>${s.length}</b><small>${esc(T('Nukleotid', 'Нуклеотидов', 'Nucleotides'))}</small></div><div class="sbox"><b>${gc}%</b><small>GC</small></div><div class="sbox"><b>${aa.filter(x => x !== 'STOP').length}</b><small>${esc(T('Aminokislota', 'Аминокислот', 'Amino acids'))}</small></div></div>`;
  }; $('#s', box).oninput = run; run();
}

// ---- 3) Punnett
function punnett(box) {
  box.innerHTML = `<div class="row wrap" style="gap:12px"><label class="fld"><span>${esc(T('Ota-ona 1 genotipi', 'Генотип родителя 1', 'Parent 1 genotype'))}</span><input class="input" id="a" value="Aa" maxlength="4" style="width:110px"></label><label class="fld"><span>${esc(T('Ota-ona 2 genotipi', 'Генотип родителя 2', 'Parent 2 genotype'))}</span><input class="input" id="b" value="Aa" maxlength="4" style="width:110px"></label></div><p class="muted small">${esc(T('Bitta gen (Aa) yoki ikkita gen (AaBb). Bosh harf — dominant.', 'Один ген (Aa) или два гена (AaBb). Заглавная — доминантный.', 'One gene (Aa) or two (AaBb). Capital = dominant.'))}</p><div id="o"></div>`;
  const gam = g => { const pairs = g.match(/[A-Za-z]{2}/g) || []; let r = ['']; for (const p of pairs) r = r.flatMap(x => [x + p[0], x + p[1]]); return [...new Set(r)]; };
  const norm = g => { const p = g.match(/[A-Za-z]{2}/g) || []; return p.map(x => x[0] === x[0].toUpperCase() ? x : (x[1] === x[1].toUpperCase() ? x[1] + x[0] : x)).join(''); };
  const run = () => {
    const a = $('#a', box).value.trim(), b = $('#b', box).value.trim(), o = $('#o', box); const ok = g => g.length >= 2 && g.length <= 4 && g.length % 2 === 0 && /^[A-Za-z]+$/.test(g) && (g.match(/[A-Za-z]{2}/g) || []).every(p => p[0].toLowerCase() === p[1].toLowerCase());
    if (!ok(a) || !ok(b) || a.length !== b.length) { o.innerHTML = `<p class="muted">${esc(T('Genotipni to\'g\'ri kiriting (masalan Aa × Aa yoki AaBb × AaBb)', 'Введите генотипы (например Aa × Aa или AaBb × AaBb)', 'Enter valid genotypes (e.g. Aa × Aa or AaBb × AaBb)'))}</p>`; return; }
    const ga = gam(a), gb = gam(b), cnt = {}, cells = ga.map(x => gb.map(y => { const pairs = a.length / 2, g = Array.from({ length: pairs }, (_, i) => [x[i], y[i]].sort((m, n) => (m === m.toUpperCase() ? -1 : 1) - (n === n.toUpperCase() ? -1 : 1)).join('')).join(''); cnt[g] = (cnt[g] || 0) + 1; return g; }));
    const ph = {}; for (const [g, n] of Object.entries(cnt)) { const k = (g.match(/[A-Za-z]{2}/g) || []).map(p => p[0] === p[0].toUpperCase() ? p[0].toUpperCase() + '_' : p[0] + p[0]).join(''); ph[k] = (ph[k] || 0) + n; }
    const tot = ga.length * gb.length;
    o.innerHTML = `<table class="punnett"><tr><th></th>${gb.map(g => `<th>${g}</th>`).join('')}</tr>${ga.map((g, i) => `<tr><th>${g}</th>${cells[i].map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>
      <div class="statrow"><div class="sbox"><b>${Object.entries(cnt).map(([g, n]) => `${g}: ${n}`).join(' · ')}</b><small>${esc(T('Genotip nisbati', 'Расщепление по генотипу', 'Genotype ratio'))} (${tot})</small></div><div class="sbox"><b>${Object.entries(ph).map(([g, n]) => `${g}: ${n}`).join(' · ')}</b><small>${esc(T('Fenotip nisbati', 'Расщепление по фенотипу', 'Phenotype ratio'))}</small></div></div>`;
  }; $('#a', box).oninput = $('#b', box).oninput = run; run();
}

// ---- 4) anatomiya
const ORGANS = () => [['brain', 200, 40, T('Bosh miya', 'Головной мозг', 'Brain'), T('Asab tizimining markazi: fikrlash, xotira, harakat boshqaruvi.', 'Центр нервной системы: мышление, память, управление движением.', 'Control center of the nervous system.'), '#f9a8d4'],
  ['lungs', 200, 110, T('O\'pka', 'Лёгкие', 'Lungs'), T('Gaz almashinuvi: kislorod qonga o\'tadi, CO₂ chiqariladi.', 'Газообмен: кислород в кровь, CO₂ наружу.', 'Gas exchange: O₂ in, CO₂ out.'), '#93c5fd'],
  ['heart', 214, 132, T('Yurak', 'Сердце', 'Heart'), T('Qonni butun tanaga haydaydi (kuniga ~100 000 marta uradi).', 'Перекачивает кровь по телу.', 'Pumps blood through the body.'), '#f87171'],
  ['liver', 178, 172, T('Jigar', 'Печень', 'Liver'), T('Zararsizlantirish, safro ishlab chiqarish, moddalar almashinuvi.', 'Обезвреживание, желчь, обмен веществ.', 'Detoxification, bile production, metabolism.'), '#b45309'],
  ['stomach', 218, 176, T('Oshqozon', 'Желудок', 'Stomach'), T('Ovqatni kislota va fermentlar bilan hazm qiladi.', 'Переваривает пищу кислотой и ферментами.', 'Digests food with acid and enzymes.'), '#fdba74'],
  ['kidney', 200, 215, T('Buyrak', 'Почки', 'Kidneys'), T('Qonni filtrlaydi, siydik hosil qiladi, suv-tuz balansini saqlaydi.', 'Фильтруют кровь, образуют мочу.', 'Filter blood and form urine.'), '#a78bfa'],
  ['intestine', 200, 255, T('Ichak', 'Кишечник', 'Intestines'), T('Oziq moddalar va suv so\'riladi.', 'Всасывание питательных веществ и воды.', 'Absorbs nutrients and water.'), '#fcd34d']];
function anat(box) {
  let sel = 'heart'; const draw = () => { const o = ORGANS(), cur = o.find(x => x[0] === sel);
    box.innerHTML = `<svg class="labsvg" viewBox="0 0 400 300" style="max-width:340px" role="img" aria-label="body"><path d="M200 10c-22 0-34 16-34 34 0 14 8 26 18 32l-70 30c-12 6-14 20-12 40l8 60c1 8 8 10 10 2l12-60 16 8v90c0 10 4 20 10 20h20l6-70 6 70h20c6 0 10-10 10-20v-90l16-8 12 60c2 8 9 6 10-2l8-60c2-20 0-34-12-40l-70-30c10-6 18-18 18-32 0-18-12-34-34-34z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3"/>
      ${o.map(([k, x, y, , , c]) => `<g class="org ${sel === k ? 'on' : ''}" data-k="${k}"><circle cx="${x}" cy="${y}" r="${sel === k ? 17 : 13}" fill="${c}" stroke="#334155" stroke-width="2"/></g>`).join('')}</svg>
      <div class="card pad mt"><b>${esc(cur[3])}</b><p class="muted">${esc(cur[4])}</p></div><div class="chips mt">${o.map(x => `<button class="chip" data-k="${x[0]}" style="cursor:pointer">${esc(x[3])}</button>`).join('')}</div>`;
    $$('[data-k]', box).forEach(b => b.onclick = () => { sel = b.dataset.k; draw(); }); }; draw();
}

// ---- 5) fotosintez (cheklovchi omil modeli)
function photo(box) {
  box.innerHTML = `<p class="muted">6CO₂ + 6H₂O + ${esc(T('yorug\'lik', 'свет', 'light'))} → C₆H₁₂O₆ + 6O₂</p>
    ${[['l', T('Yorug\'lik', 'Свет', 'Light'), 60, 100], ['c', 'CO₂', 40, 100], ['t', T('Harorat (°C)', 'Температура (°C)', 'Temperature (°C)'), 25, 50]].map(([k, n, v, m]) => `<label class="fld"><span>${esc(n)}: <b id="${k}v">${v}</b></span><input type="range" id="${k}" min="0" max="${m}" value="${v}"></label>`).join('')}
    <div class="labcard mt"><svg class="labsvg" viewBox="0 0 400 150" id="bub"></svg><div class="statrow"><div class="sbox"><b id="rt">0</b><small>${esc(T('Fotosintez tezligi (%)', 'Скорость фотосинтеза (%)', 'Rate (%)'))}</small></div><div class="sbox"><b id="lf">—</b><small>${esc(T('Cheklovchi omil', 'Лимитирующий фактор', 'Limiting factor'))}</small></div></div></div>`;
  let n = 0, raf; const run = () => { const L = +$('#l', box).value, C = +$('#c', box).value, Tm = +$('#t', box).value; ['l', 'c', 't'].forEach(k => $('#' + k + 'v', box).textContent = $('#' + k, box).value);
    const sat = x => 100 * (1 - Math.exp(-x / 35)), fl = sat(L), fc = sat(C), ft = Math.max(0, 1 - Math.pow((Tm - 30) / 22, 2)); const rate = Math.round(Math.min(fl, fc) * ft);
    $('#rt', box).textContent = rate; const lim = ft < 0.6 ? T('Harorat', 'Температура', 'Temperature') : fl < fc ? T('Yorug\'lik', 'Свет', 'Light') : T('CO₂', 'CO₂', 'CO₂'); $('#lf', box).textContent = rate === 0 ? '—' : lim; box._rate = rate; };
  const loop = () => { if (!box.isConnected) return; const svg = $('#bub', box); if (svg) { const r = box._rate || 0; if (Math.random() * 100 < r / 3) { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', 40 + Math.random() * 320); c.setAttribute('cy', 140); c.setAttribute('r', 3 + Math.random() * 5); c.setAttribute('fill', '#7dd3fc'); c.setAttribute('opacity', '.8'); c._y = 140; svg.appendChild(c); }
      [...svg.children].forEach(c => { c._y -= 1.6; c.setAttribute('cy', c._y); if (c._y < 5) c.remove(); }); } raf = requestAnimationFrame(loop); };
  $$('input', box).forEach(i => i.oninput = run); run(); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) loop();
}

// ---- 6) ekotizim (yirtqich–o'lja, Lotka–Volterra)
function eco(box) {
  box.innerHTML = `<p class="muted">${esc(T('Quyon (o\'lja) va tulki (yirtqich) populyatsiyalari o\'zaro ta\'sirda.', 'Популяции зайцев (жертва) и лис (хищник) влияют друг на друга.', 'Rabbit (prey) and fox (predator) populations interact.'))}</p>
    ${[['r', T('Quyonlarning ko\'payish tezligi', 'Рождаемость зайцев', 'Rabbit birth rate'), 10, 20], ['p', T('Tulkining ov qilish samaradorligi', 'Эффективность охоты лис', 'Fox hunting efficiency'), 6, 20], ['d', T('Tulkining o\'lim tezligi', 'Смертность лис', 'Fox death rate'), 8, 20]].map(([k, n, v, m]) => `<label class="fld"><span>${esc(n)}</span><input type="range" id="${k}" min="1" max="${m}" value="${v}"></label>`).join('')}
    <div class="labcard"><svg id="ch" class="labsvg" viewBox="0 0 400 200" style="max-width:600px"></svg><div class="chips"><span class="chip" style="border-color:#16a34a">🐇 ${esc(T('Quyon', 'Заяц', 'Rabbit'))}</span><span class="chip" style="border-color:#dc2626">🦊 ${esc(T('Tulki', 'Лиса', 'Fox'))}</span></div></div>`;
  const run = () => { const r = +$('#r', box).value / 10, p = +$('#p', box).value / 1000, d = +$('#d', box).value / 10; let x = 40, y = 9; const A = [], B = []; for (let i = 0; i < 400; i++) { const dt = 0.02; const dx = (r * x - p * x * y) * dt, dy = (p * 0.6 * x * y - d * y) * dt; x = Math.max(0.1, x + dx); y = Math.max(0.1, y + dy); if (i % 1 === 0) { A.push(x); B.push(y); } }
    const mx = Math.max(...A, ...B) * 1.1, line = (a, c) => `<polyline fill="none" stroke="${c}" stroke-width="2" points="${a.map((v, i) => `${(i / a.length * 400).toFixed(1)},${(200 - v / mx * 190).toFixed(1)}`).join(' ')}"/>`; $('#ch', box).innerHTML = `<rect width="400" height="200" fill="none" stroke="var(--line)"/>${line(A, '#16a34a')}${line(B, '#dc2626')}`; };
  $$('input', box).forEach(i => i.oninput = run); run();
}

const MODS = { cell, dna, punnett, anat, photo, eco };
route('/lab', async ({ el, q }) => {
  const cur = MODS[q.t] ? q.t : 'cell';
  el.innerHTML = `<div class="page narrow"><h1>${ic('flask', 26)} ${esc(T('Laboratoriya', 'Лаборатория', 'Laboratory'))}</h1><div class="labtabs" role="tablist">${TABS().map(([k, n]) => `<button class="${k === cur ? 'on' : ''}" data-t="${k}" role="tab">${esc(n)}</button>`).join('')}</div><div class="labcard" id="lb"></div></div>`;
  $$('[data-t]', el).forEach(b => b.onclick = () => { location.hash = '#/lab?t=' + b.dataset.t; });
  MODS[cur]($('#lb', el));
}, { auth: true });
