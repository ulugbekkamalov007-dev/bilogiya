// Dars ko'rgichlari: slaydlar va kartochkalar (kurs darslari uchun)
import { esc, $, $$, ic } from './core.js';
import { T, md } from './ui.js';

const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const norm = s => String(s ?? '').toLowerCase().replace(/[’ʻʼ`‘´′]/g, "'").replace(/\s+/g, ' ').trim();

export function renderSlides(host, slides, onDone, onProg) {
  let i = 0, seen = new Set();
  const draw = () => {
    const s = slides[i]; seen.add(i); onProg?.(seen.size / slides.length);
    host.innerHTML = `<div class="sld"><div class="sld-top"><small class="muted">${i + 1} / ${slides.length}</small><div class="sld-dots">${slides.map((_, k) => `<i class="${k === i ? 'on' : seen.has(k) ? 'seen' : ''}"></i>`).join('')}</div></div>
      <div class="sld-card"><div class="sld-ic">${esc(s.ic || '📘')}</div><h2>${esc(s.h)}</h2><ul>${(s.p || []).map(p => `<li>${inline(p)}</li>`).join('')}</ul>
      ${s.q ? `<div class="sld-q"><b>🤔 ${esc(T('O\'ylab ko\'ring', 'Подумайте', 'Think'))}:</b> ${esc(s.q)}<div><button class="btn ghost sm" id="sa">${esc(T('Javobni ko\'rish', 'Показать ответ', 'Show answer'))}</button></div><p class="sld-a" id="sat" hidden>${esc(s.a || '')}</p></div>` : ''}</div>
      <div class="lnav"><button class="btn ghost" id="sp" ${i ? '' : 'disabled'}>${ic('back', 16)} ${esc(T('Oldingi', 'Назад', 'Previous'))}</button><button class="btn" id="sn">${i < slides.length - 1 ? esc(T('Keyingi', 'Далее', 'Next')) + ' ' + ic('chev', 16) : esc(T('Tugatish', 'Готово', 'Finish'))}</button></div></div>`;
    $('#sa', host)?.addEventListener('click', e => { $('#sat', host).hidden = false; e.currentTarget.hidden = true; });
    $('#sp', host).onclick = () => { i--; draw(); };
    $('#sn', host).onclick = () => { if (i < slides.length - 1) { i++; draw(); } else onDone?.(); };
    if (i === slides.length - 1) onDone?.();
  };
  draw();
}

export function renderCards(host, cards, onDone, onProg) {
  let queue = shuffle(cards.map((c, k) => ({ c, k, miss: 0 }))), total = cards.length, right = 0, tries = 0, fin = false;
  const bar = () => `<div class="bar"><i style="width:${Math.round(right / total * 100)}%"></i></div>`;
  const next = () => {
    onProg?.(right / total);
    if (!queue.length) {
      if (!fin) { fin = true; onDone?.(); }
      host.innerHTML = `<div class="crd-end card pad"><div style="font-size:3rem">🎉</div><h3>${esc(T('Hamma kartochka to\'g\'ri!', 'Все карточки верно!', 'All cards correct!'))}</h3><p class="muted">${esc(T(`Urinishlar: ${tries}, aniqlik: ${Math.round(total / tries * 100)}%`, `Попыток: ${tries}, точность: ${Math.round(total / tries * 100)}%`, `Attempts: ${tries}, accuracy: ${Math.round(total / tries * 100)}%`))}</p><button class="btn ghost" id="rs">${esc(T('Qayta mashq qilish', 'Повторить', 'Practise again'))}</button></div>`;
      $('#rs', host).onclick = () => { queue = shuffle(cards.map((c, k) => ({ c, k, miss: 0 }))); right = 0; tries = 0; next(); };
      return;
    }
    const it = queue[0], [kind, a, b, c] = it.c;
    const head = `${bar()}<small class="muted">${right} / ${total} · ${esc(T('Qolgan', 'Осталось', 'Left'))}: ${queue.length}</small>`;
    if (kind === 'tf') host.innerHTML = `<div class="crd">${head}<div class="crd-face top"><small>${esc(T('Ibora', 'Термин', 'Term'))}</small><h3>${esc(a)}</h3></div><div class="crd-face bot"><small>${esc(T('Ta\'rif', 'Определение', 'Definition'))}</small><p>${esc(b)}</p></div>
      <p class="muted center">${esc(T('Bu ta\'rif shu iboraga mosmi?', 'Определение подходит к термину?', 'Does the definition match?'))}</p><div class="row crd-btns"><button class="btn ok" data-v="1">${ic('check', 18)} ${esc(T('To\'g\'ri', 'Верно', 'True'))}</button><button class="btn danger" data-v="0">✕ ${esc(T('Noto\'g\'ri', 'Неверно', 'False'))}</button></div><div id="fb"></div></div>`;
    else host.innerHTML = `<div class="crd">${head}<div class="crd-face top"><small>${esc(T('Ta\'rif', 'Определение', 'Definition'))}</small><h3>${esc(a)}</h3></div>
      <form id="tf" autocomplete="off"><input class="input" id="ans" placeholder="${esc(T('Javobni yozing (bitta so\'z)', 'Введите ответ', 'Type the answer'))}" autocapitalize="off" spellcheck="false"><button class="btn block mt">${esc(T('Tekshirish', 'Проверить', 'Check'))}</button></form><div id="fb"></div></div>`;
    const res = ok => {
      tries++; $$('button,input', host).forEach(x => x.disabled = true);
      const exp = kind === 'tf' ? (c ? T('Aynan shunday: ', 'Верно: ', 'Correct: ') : T('Noto\'g\'ri. To\'g\'ri ta\'rif: ', 'Неверно. Правильно: ', 'Wrong. Correct: ')) + (c ? '' : '') : T('To\'g\'ri javob: ', 'Правильный ответ: ', 'Correct answer: ');
      const hint = kind === 'tf' ? (c ? '' : esc(T('Bu ibora ta\'rifi boshqacha.', 'У этого термина другое определение.', 'This term has another definition.'))) : `<b>${esc(b)}</b>`;
      $('#fb', host).innerHTML = `<div class="crd-fb ${ok ? 'good' : 'bad'}"><b>${ok ? '✅ ' + esc(T('To\'g\'ri!', 'Верно!', 'Correct!')) : '❌ ' + esc(T('Xato', 'Ошибка', 'Wrong'))}</b> ${ok ? '' : hint}</div><button class="btn block mt" id="nx">${esc(T('Keyingisi', 'Далее', 'Next'))} ${ic('chev', 16)}</button>`;
      queue.shift(); if (ok) right++; else { it.miss++; queue.splice(Math.min(queue.length, 2 + Math.floor(Math.random() * 3)), 0, it); }
      const nx = $('#nx', host); nx.disabled = false; nx.focus(); nx.onclick = next;
    };
    if (kind === 'tf') $$('[data-v]', host).forEach(btn => btn.onclick = () => res((btn.dataset.v === '1') === !!c));
    else { const inp = $('#ans', host); inp.focus(); $('#tf', host).onsubmit = e => { e.preventDefault(); const v = norm(inp.value); if (!v) return; res([b, ...(c || [])].map(norm).includes(v)); }; }
  };
  next();
}
