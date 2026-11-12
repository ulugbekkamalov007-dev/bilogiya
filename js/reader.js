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
  // ilovaning qolgan qismida zoom yo'q; faqat o'qish oynasida yaqinlashtirish/uzoqlashtirish mumkin
  const vp = document.querySelector('meta[name=viewport]'), vp0 = vp?.content;
  if (vp) vp.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover';
  onLeave(() => { if (vp && vp0) vp.content = vp0; });
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
      const buf = await fetch(url).then(r => r.arrayBuffer());
      try {
        // haqiqiy PowerPoint ko'rinishi (dizayn, rasm, jadval) — slaydlar ketma-ket, ekran kengligiga moslangan
        const { init } = await import('https://esm.sh/pptx-preview@1.0.7');
        b.innerHTML = '<div class="pptxhost" id="px"></div>'; const host = $('#px', b), w = Math.max(280, Math.floor(host.clientWidth || b.clientWidth || 360));
        const pv = init(host, { width: w, height: Math.round(w * 9 / 16) }); await pv.preview(buf);
        if (!host.children.length) throw new Error('empty');
      } catch (e) {
        console.warn('pptx-preview:', e?.message);
        const Z = await import('https://esm.sh/jszip@3.10.1'), zip = await (Z.default || Z).loadAsync(buf);
        const names = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, c) => +a.match(/\d+/)[0] - +c.match(/\d+/)[0]), slides = [];
        for (const n of names) { const doc = new DOMParser().parseFromString(await zip.files[n].async('string'), 'application/xml'); slides.push([...doc.getElementsByTagName('a:p')].map(p => [...p.getElementsByTagName('a:t')].map(x => x.textContent).join('')).filter(Boolean)); }
        b.innerHTML = `<div class="slides">${slides.map((ps, i) => `<section class="slide-card"><small class="muted">${esc(t('rd.slide'))} ${i + 1}</small>${ps.map((p, k) => k === 0 ? `<h3>${esc(p)}</h3>` : `<p>${esc(p)}</p>`).join('')}</section>`).join('')}</div>`;
      }
    } else {
      b.innerHTML = `<div class="card pad center"><p>${esc(t('rd.unsup'))}</p><a class="btn lg" href="${esc(url)}" download>⬇ ${esc(t('rd.dl'))}</a></div>`;
    }
  } catch (e) { console.warn('reader:', e?.message); b.innerHTML = `<div class="card pad center"><p>${esc(t('rd.err'))}</p><a class="btn" href="${esc(url)}" download>⬇ ${esc(t('rd.dl'))}</a></div>`; }
}
