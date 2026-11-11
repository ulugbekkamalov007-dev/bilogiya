// pdf.js ni CDN'dan yuklash (worker cross-origin muammosini blob orqali hal qiladi)
const BASE = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/';
let p = null;
export function getPdfJs() {
  return p || (p = (async () => {
    const lib = await import(BASE + 'pdf.min.mjs');
    const src = await (await fetch(BASE + 'pdf.worker.min.mjs')).text();
    lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    return lib;
  })());
}

// PDF sahifalarini kenglikka moslab, sust (lazy) chizadi. iPhone'da ham ishlaydi.
export async function renderPdf(host, url) {
  const lib = await getPdfJs();
  const doc = await lib.getDocument({ url }).promise;
  host.innerHTML = ''; host.classList.add('pdfview');
  const io = new IntersectionObserver(es => es.forEach(async e => {
    if (!e.isIntersecting || e.target.dataset.done) return; e.target.dataset.done = 1;
    const page = await doc.getPage(+e.target.dataset.p);
    const w = host.clientWidth || 600, vp0 = page.getViewport({ scale: 1 }), scale = Math.min(2.2, (w / vp0.width) * (window.devicePixelRatio || 1));
    const vp = page.getViewport({ scale }); const c = e.target; c.width = vp.width; c.height = vp.height; c.style.aspectRatio = '';
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
  }), { rootMargin: '600px' });
  for (let i = 1; i <= doc.numPages; i++) {
    const c = document.createElement('canvas'); c.dataset.p = i; c.className = 'pdfpage'; c.style.aspectRatio = '0.707'; host.appendChild(c); io.observe(c);
  }
  return { pages: doc.numPages, destroy() { io.disconnect(); doc.destroy(); } };
}
