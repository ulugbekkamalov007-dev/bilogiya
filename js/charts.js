// Yengil SVG grafiklar (telefon uchun moslashuvchan): donut va kunlik ustunlar
import { esc } from './core.js';

export const CCOL = { video: '#2563eb', audio: '#8b5cf6', book: '#f59e0b', test: '#087C50', app: '#94a3b8', other: '#94a3b8' };

// parts: [{label, value, color}]
export function donut(parts, centerTop = '', centerBot = '') {
  const tot = parts.reduce((a, p) => a + p.value, 0), R = 54, C = 2 * Math.PI * R;
  let off = 0, arcs = '';
  if (tot > 0) parts.filter(p => p.value > 0).forEach(p => { const len = p.value / tot * C; arcs += `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${p.color}" stroke-width="20" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${esc(p.label)}</title></circle>`; off += len; });
  else arcs = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="#e2e8f0" stroke-width="20"/>`;
  return `<svg viewBox="0 0 140 140" class="donut" role="img"><circle r="${R}" cx="70" cy="70" fill="none" stroke="#f1f5f9" stroke-width="20"/>${arcs}
    <text x="70" y="68" text-anchor="middle" class="dn-t">${esc(centerTop)}</text><text x="70" y="86" text-anchor="middle" class="dn-s">${esc(centerBot)}</text></svg>`;
}

// days: [{label, value, title}]
export function bars(days, color = '#2563eb') {
  const W = 320, H = 130, B = 18, T = 8, max = Math.max(1, ...days.map(d => d.value)), bw = W / Math.max(1, days.length);
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img"><line x1="0" x2="${W}" y1="${H - B}" y2="${H - B}" class="grid"/>`;
  days.forEach((d, i) => {
    const h = d.value / max * (H - B - T), x = i * bw + bw * 0.18, w = bw * 0.64;
    s += `<g><rect x="${x}" y="${H - B - h}" width="${w}" height="${Math.max(h, d.value ? 2 : 0)}" rx="3" fill="${color}"><title>${esc(d.title || '')}</title></rect>`;
    if (d.value) s += `<text x="${x + w / 2}" y="${H - B - h - 3}" text-anchor="middle" class="axis">${d.value}</text>`;
    if (days.length <= 16 || i % 2 === 0) s += `<text x="${x + w / 2}" y="${H - 4}" text-anchor="middle" class="axis">${esc(d.label)}</text>`;
    s += '</g>';
  });
  return s + '</svg>';
}
