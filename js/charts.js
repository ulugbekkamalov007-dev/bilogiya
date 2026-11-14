// Interaktiv SVG grafiklar: ustunli, chiziqli, donut va gorizontal. Sichqoncha/barmoq tegsa tafsilot ko'rsatiladi (data-tip).
import { esc } from './core.js';

export const CCOL = { video: '#2563eb', audio: '#8b5cf6', book: '#f59e0b', test: '#087C50', app: '#94a3b8', other: '#94a3b8' };

// ---- umumiy tooltip: [data-tip] bo'lgan har qanday element ustiga olib borilganda
let tipEl;
function tipShow(t, x, y) {
  if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'ctip'; document.body.appendChild(tipEl); }
  tipEl.innerHTML = t; tipEl.style.display = 'block';
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  tipEl.style.left = Math.max(6, Math.min(innerWidth - w - 6, x - w / 2)) + 'px';
  tipEl.style.top = Math.max(6, y - h - 12) + 'px';
}
const tipHide = () => { if (tipEl) tipEl.style.display = 'none'; };
if (!window._ctipInit) {
  window._ctipInit = 1;
  const f = e => { const n = e.target.closest?.('[data-tip]'); if (!n) return tipHide(); const r = n.getBoundingClientRect(); tipShow(n.dataset.tip, e.clientX || r.left + r.width / 2, e.clientY || r.top); };
  document.addEventListener('pointermove', f); document.addEventListener('pointerdown', f);
  document.addEventListener('pointerleave', tipHide, true); addEventListener('scroll', tipHide, { passive: true, capture: true });
}

const nice = max => { if (max <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(max))), n = max / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
let uid = 0;

// parts: [{label, value, color, tip?}]
export function donut(parts, centerTop = '', centerBot = '') {
  const tot = parts.reduce((a, p) => a + p.value, 0), R = 54, C = 2 * Math.PI * R;
  let off = 0, arcs = '';
  if (tot > 0) parts.filter(p => p.value > 0).forEach(p => {
    const len = p.value / tot * C;
    arcs += `<circle class="arc" r="${R}" cx="70" cy="70" fill="none" stroke="${p.color}" stroke-width="20" stroke-dasharray="${Math.max(len - 1.5, 0.1)} ${C - len + 1.5}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)" data-tip="<b>${esc(p.label)}</b><br>${esc(p.tip || String(p.value))} · ${Math.round(p.value / tot * 100)}%"></circle>`;
    off += len;
  });
  else arcs = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="#e2e8f0" stroke-width="20"/>`;
  return `<svg viewBox="0 0 140 140" class="donut" role="img"><circle r="${R}" cx="70" cy="70" fill="none" stroke="#f1f5f9" stroke-width="20"/>${arcs}
    <text x="70" y="68" text-anchor="middle" class="dn-t">${esc(centerTop)}</text><text x="70" y="86" text-anchor="middle" class="dn-s">${esc(centerBot)}</text></svg>`;
}

// days: [{label, value, title}] — gorizontal chiziqlar (y o'qi), tepada joy qoldiriladi (raqam kesilmaydi), tooltip bor
export function bars(days, color = '#2563eb', unit = '') {
  const W = 480, H = 190, L = 34, Bm = 24, Tp = 14, R = 8, n = Math.max(1, days.length), max = nice(Math.max(1, ...days.map(d => d.value)));
  const gid = 'bg' + (++uid), bw = (W - L - R) / n, ph = H - Bm - Tp;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="1"/><stop offset="1" stop-color="${color}" stop-opacity=".55"/></linearGradient></defs>`;
  for (let i = 0; i <= 4; i++) { const v = max / 4 * i, y = Tp + ph - ph * i / 4; s += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="grid ${i ? 'dash' : ''}"/><text x="${L - 6}" y="${y + 3}" text-anchor="end" class="axis">${Number.isInteger(v) ? v : v.toFixed(1)}</text>`; }
  const every = Math.ceil(n / 12);
  days.forEach((d, i) => {
    const h = d.value / max * ph, x = L + i * bw + bw * 0.16, w = Math.max(bw * 0.68, 2), y = Tp + ph - h;
    s += `<g class="bar"><rect x="${L + i * bw}" y="${Tp}" width="${bw}" height="${ph}" fill="transparent" data-tip="<b>${esc(d.title || d.label)}</b><br>${d.value}${esc(unit)}"/>`;
    if (d.value) s += `<rect class="b" x="${x}" y="${y}" width="${w}" height="${Math.max(h, 3)}" rx="${Math.min(6, w / 2)}" fill="url(#${gid})" pointer-events="none"/>`;
    if (i % every === 0 || i === n - 1) s += `<text x="${x + w / 2}" y="${H - 7}" text-anchor="middle" class="axis">${esc(d.label)}</text>`;
    s += '</g>';
  });
  return s + '</svg>';
}

// Silliq chiziqli grafik (maydon bilan)
export function line(days, color = '#087C50', unit = '') {
  const W = 480, H = 190, L = 34, Bm = 24, Tp = 14, R = 12, n = days.length, max = nice(Math.max(1, ...days.map(d => d.value))), ph = H - Bm - Tp, gid = 'lg' + (++uid);
  if (!n) return '';
  const X = i => L + (n === 1 ? (W - L - R) / 2 : i * (W - L - R) / (n - 1)), Y = v => Tp + ph - v / max * ph;
  const pts = days.map((d, i) => [X(i), Y(d.value)]);
  const path = pts.map((p, i) => { if (!i) return `M${p[0]},${p[1]}`; const q = pts[i - 1], cx = (q[0] + p[0]) / 2; return `C${cx},${q[1]} ${cx},${p[1]} ${p[0]},${p[1]}`; }).join(' ');
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>`;
  for (let i = 0; i <= 4; i++) { const v = max / 4 * i, y = Tp + ph - ph * i / 4; s += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="grid ${i ? 'dash' : ''}"/><text x="${L - 6}" y="${y + 3}" text-anchor="end" class="axis">${Number.isInteger(v) ? v : v.toFixed(1)}</text>`; }
  s += `<path d="${path} L${pts[n - 1][0]},${Tp + ph} L${pts[0][0]},${Tp + ph} Z" fill="url(#${gid})"/><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  const every = Math.ceil(n / 12), cw = (W - L - R) / Math.max(1, n - 1);
  days.forEach((d, i) => {
    s += `<g class="pt"><rect x="${X(i) - cw / 2}" y="${Tp}" width="${cw}" height="${ph}" fill="transparent" data-tip="<b>${esc(d.title || d.label)}</b><br>${d.value}${esc(unit)}"/><circle cx="${X(i)}" cy="${Y(d.value)}" r="${n > 31 ? 0 : 3.5}" fill="#fff" stroke="${color}" stroke-width="2" pointer-events="none"/>`;
    if (i % every === 0 || i === n - 1) s += `<text x="${X(i)}" y="${H - 7}" text-anchor="middle" class="axis">${esc(d.label)}</text>`;
    s += '</g>';
  });
  return s + '</svg>';
}

// rows: [{label, sub?, value, text?, href?, color?}] — gorizontal ustunlar (HTML)
export function hbars(rows, color = '#087C50') {
  const max = Math.max(1, ...rows.map(r => r.value));
  return `<div class="hbars">${rows.map(r => { const tag = r.href ? 'a' : 'div';
    return `<${tag} class="hb" ${r.href ? `href="${r.href}"` : ''} data-tip="<b>${esc(r.label)}</b><br>${esc(r.text ?? String(r.value))}"><div class="hb-h"><b class="trunc">${esc(r.label)}</b><span>${esc(r.text ?? String(r.value))}</span></div>
      <div class="hb-t"><i style="width:${Math.max(r.value / max * 100, r.value ? 3 : 0)}%;background:${r.color || color}"></i></div>${r.sub ? `<small class="muted">${esc(r.sub)}</small>` : ''}</${tag}>`; }).join('')}</div>`;
}
