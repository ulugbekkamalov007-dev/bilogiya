// Hujjat/kitob o'qish: butun ekranda, ilovaning o'zida (PDF, Word, PowerPoint) — tashqi Microsoft saytisiz
import { t, addDict, esc, ic, $, spinner, go, onLeave, tr } from './core.js';
import { renderPdf } from './pdfjs.js';

addDict({
  uz: { 'rd.unsup': 'Bu fayl turini ilovada ochib bo\'lmaydi. Yuklab olib, telefondagi dastur bilan oching.', 'rd.dl': 'Yuklab olish', 'rd.slide': 'Slayd', 'rd.err': 'Hujjatni ochib bo\'lmadi', 'rd.pages': 'bet' },
  ru: { 'rd.unsup': 'Этот тип файла нельзя открыть в приложении. Скачайте и откройте в программе телефона.', 'rd.dl': 'Скачать', 'rd.slide': 'Слайд', 'rd.err': 'Не удалось открыть документ', 'rd.pages': 'стр.' },
  en: { 'rd.unsup': 'This file type cannot be opened in the app. Download it and open it with a phone app.', 'rd.dl': 'Download', 'rd.slide': 'Slide', 'rd.err': 'Could not open the document', 'rd.pages': 'p.' },
});

const clean = html => {
  const d = new DOMParser().parseFromString(html, 'text/html');
  d.querySelectorAll('script,iframe,object,embed,link,style').forEach(n => n.remove());
  d.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => { if (/^on/i.test(a.name) || /^javascript:/i.test(a.value)) n.removeAttribute(a.name); }));
  return d.body.innerHTML;
};

export async function openReader(el, it, url, ext, back) {
  document.body.classList.add('fs-read'); onLeave(() => document.body.classList.remove('fs-read'));
  el.innerHTML = `<div class="reader"><div class="rd-h"><a class="icon-btn" href="${back}" aria-label="back">${ic('back')}</a><b class="grow rd-t">${esc(tr(it.title))}</b><span class="muted small" id="rdp"></span><a class="icon-btn" href="${esc(url)}" download title="${esc(t('rd.dl'))}">${ic('download')}</a></div><div class="rd-b" id="rdb">${spinner()}</div></div>`;
  const b = $('#rdb', el);
  try {
    if (ext === 'pdf') {
      b.innerHTML = '<div class="pdfhost"></div>'; const v = await renderPdf($('.pdfhost', b), url); onLeave(() => v.destroy());
      $('#rdp', el).textContent = v.pages + ' ' + t('rd.pages');
    } else if (ext === 'docx') {
      const [m, buf] = await Promise.all([import('https://esm.sh/mammoth@1.8.0'), fetch(url).then(r => r.arrayBuffer())]);
      const res = await (m.default || m).convertToHtml({ arrayBuffer: buf });
      b.innerHTML = `<article class="docx">${clean(res.value)}</article>`;
    } else if (ext === 'pptx') {
      const [Z, buf] = await Promise.all([import('https://esm.sh/jszip@3.10.1'), fetch(url).then(r => r.arrayBuffer())]);
      const zip = await (Z.default || Z).loadAsync(buf);
      const names = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, c) => +a.match(/\d+/)[0] - +c.match(/\d+/)[0]);
      const slides = [];
      for (const n of names) {
        const xml = await zip.files[n].async('string'), doc = new DOMParser().parseFromString(xml, 'application/xml');
        const paras = [...doc.getElementsByTagName('a:p')].map(p => [...p.getElementsByTagName('a:t')].map(x => x.textContent).join('')).filter(Boolean);
        slides.push(paras);
      }
      b.innerHTML = `<div class="slides">${slides.map((ps, i) => `<section class="slide-card"><small class="muted">${esc(t('rd.slide'))} ${i + 1}</small>${ps.map((p, k) => k === 0 ? `<h3>${esc(p)}</h3>` : `<p>${esc(p)}</p>`).join('')}</section>`).join('')}</div>`;
      $('#rdp', el).textContent = slides.length + ' ' + t('rd.slide').toLowerCase();
    } else {
      b.innerHTML = `<div class="card pad center"><p>${esc(t('rd.unsup'))}</p><a class="btn lg" href="${esc(url)}" download>⬇ ${esc(t('rd.dl'))}</a></div>`;
    }
  } catch (e) { console.warn('reader:', e?.message); b.innerHTML = `<div class="card pad center"><p>${esc(t('rd.err'))}</p><a class="btn" href="${esc(url)}" download>⬇ ${esc(t('rd.dl'))}</a></div>`; }
}
