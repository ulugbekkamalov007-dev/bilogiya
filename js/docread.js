// Test fayli (.docx/.txt/.md/.csv) → { text, images:[{blob}] }. Word'dagi rasm "[[rasm:N]]" qatori bo'lib matnga qo'yiladi
// (rasm qaysi savolning ostida turgan bo'lsa, o'sha savolga bog'lanadi).
const loadScript = src => new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('script')); document.head.appendChild(s); });

const b64blob = (b64, type) => { const bin = atob(b64), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type }); };

export async function readTestDocx(file) {
  await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
  const mm = window.mammoth, images = [];
  const r = await mm.convertToHtml({ arrayBuffer: await file.arrayBuffer() }, {
    ignoreEmptyParagraphs: false,
    convertImage: mm.images.imgElement(async el => { const b = await el.read('base64'); images.push({ blob: b64blob(b, el.contentType || 'image/png') }); return { src: 'about:blank', alt: 'rasm:' + (images.length - 1) }; }),
  });
  const doc = new DOMParser().parseFromString('<body>' + r.value + '</body>', 'text/html'), lines = [];
  const walk = n => {
    for (const el of n.children) {
      if (/^(UL|OL|TABLE|TBODY|TR)$/.test(el.tagName)) { walk(el); continue; }
      const imgs = [...el.querySelectorAll('img')];
      const txt = (el.innerText ?? el.textContent ?? '').replace(/ /g, ' ').trim();
      if (txt) lines.push(...txt.split('\n').map(s => s.trim()).filter(Boolean)); else if (!imgs.length) lines.push('');
      for (const im of imgs) { const m = /^rasm:(\d+)$/.exec(im.getAttribute('alt') || ''); if (m) lines.push(`[[rasm:${m[1]}]]`); }
    }
  };
  walk(doc.body);
  return { text: lines.join('\n'), images };
}
export async function readTestFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) return readTestDocx(file);
  return { text: await file.text(), images: [] };
}
