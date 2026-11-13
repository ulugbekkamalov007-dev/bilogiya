// Vizual effektlar: DNK spirali, hujayra, konfetti, salyut
import { rand } from './core.js';

// Animatsiyali DNK spirali (SVG). Element DOMdan chiqib ketsa animatsiya to'xtaydi.
export function dnaHelix(host, { rows = 16, w = 220, h = 420 } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('class', 'dna'); svg.setAttribute('aria-hidden', 'true');
  const items = [];
  for (let i = 0; i < rows; i++) {
    const line = document.createElementNS(NS, 'line'); line.setAttribute('class', 'dna-rung');
    const a = document.createElementNS(NS, 'circle'), b = document.createElementNS(NS, 'circle');
    a.setAttribute('class', 'dna-a'); b.setAttribute('class', 'dna-b');
    svg.append(line, a, b); items.push({ line, a, b });
  }
  host.appendChild(svg);
  let t0 = performance.now();
  (function frame(now) {
    if (!svg.isConnected) return;
    const t = (now - t0) / 1100;
    items.forEach((it, i) => {
      const y = 20 + i * ((h - 40) / (rows - 1)), ph = i * 0.62 + t, s = Math.sin(ph), c = Math.cos(ph);
      const x1 = w / 2 + s * (w * 0.32), x2 = w / 2 - s * (w * 0.32);
      it.line.setAttribute('x1', x1); it.line.setAttribute('x2', x2); it.line.setAttribute('y1', y); it.line.setAttribute('y2', y);
      it.a.setAttribute('cx', x1); it.a.setAttribute('cy', y); it.a.setAttribute('r', 6 + c * 2.2);
      it.b.setAttribute('cx', x2); it.b.setAttribute('cy', y); it.b.setAttribute('r', 6 - c * 2.2);
      it.line.style.opacity = 0.35 + Math.abs(s) * 0.5;
    });
    requestAnimationFrame(frame);
  })(t0);
}

// Hujayra rasmi; `open` = membrana kanali ochiq (kod tasdiqlanganda)
export function cellSvg(open = false) {
  return `<svg class="cell ${open ? 'open' : ''}" viewBox="0 0 240 240" aria-hidden="true">
    <defs><radialGradient id="cg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#d9f99d"/><stop offset="1" stop-color="#34b27b"/></radialGradient></defs>
    <circle cx="120" cy="120" r="104" fill="url(#cg)" stroke="#066642" stroke-width="6"/>
    <circle class="memb" cx="120" cy="120" r="112" fill="none" stroke="#86efac" stroke-width="3" stroke-dasharray="3 9"/>
    <circle cx="112" cy="112" r="34" fill="#a78bfa" stroke="#6d28d9" stroke-width="4"/><circle cx="104" cy="106" r="11" fill="#6d28d9"/>
    <ellipse cx="170" cy="150" rx="22" ry="11" fill="#fdba74" stroke="#c2410c" stroke-width="3" transform="rotate(-25 170 150)"/>
    <ellipse cx="72" cy="165" rx="18" ry="9" fill="#fdba74" stroke="#c2410c" stroke-width="3" transform="rotate(30 72 165)"/>
    <circle cx="160" cy="80" r="7" fill="#38bdf8"/><circle cx="82" cy="78" r="5" fill="#38bdf8"/><circle cx="150" cy="190" r="6" fill="#38bdf8"/>
    <g class="gate"><rect x="216" y="104" width="22" height="32" rx="6" fill="#fff" stroke="#066642" stroke-width="4"/>
      <path class="shackle" d="M222 104v-8a5 5 0 0 1 10 0v8" fill="none" stroke="#066642" stroke-width="4"/></g>
  </svg>`;
}

function mkCanvas() {
  const c = document.createElement('canvas'); c.className = 'fx-canvas';
  c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(c); const ctx = c.getContext('2d'); ctx.scale(devicePixelRatio, devicePixelRatio);
  return { c, ctx, W: innerWidth, H: innerHeight };
}

export function confetti(ms = 3500, count = 160) {
  const { c, ctx, W, H } = mkCanvas();
  const cols = ['#0a9b66', '#087C50', '#facc15', '#38bdf8', '#f472b6', '#a78bfa', '#fb923c'];
  const ps = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: -20 - Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
    s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: rand(cols),
  }));
  const end = performance.now() + ms;
  (function f(now) {
    ctx.clearRect(0, 0, W, H);
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
    if (now < end) requestAnimationFrame(f); else c.remove();
  })(performance.now());
}

export function fireworks(ms = 4500) {
  const { c, ctx, W, H } = mkCanvas();
  const sparks = [], rockets = []; const end = performance.now() + ms; let next = 0;
  const burst = (x, y) => { const hue = Math.random() * 360; for (let i = 0; i < 80; i++) { const a = Math.random() * 6.283, v = 1 + Math.random() * 5.5; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 55 + Math.random() * 35, hue }); } };
  (function f(now) {
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    if (now < end - 800 && now > next) { rockets.push({ x: W * (0.15 + Math.random() * 0.7), y: H, ty: H * (0.15 + Math.random() * 0.35), vy: -9 - Math.random() * 3 }); next = now + 260 + Math.random() * 300; }
    for (let i = rockets.length - 1; i >= 0; i--) { const r = rockets[i]; r.y += r.vy; ctx.fillStyle = '#fff'; ctx.fillRect(r.x, r.y, 2, 6); if (r.y <= r.ty) { burst(r.x, r.y); rockets.splice(i, 1); } }
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.vx *= 0.985; s.life--; ctx.fillStyle = `hsla(${s.hue},100%,60%,${Math.max(0, s.life / 70)})`; ctx.fillRect(s.x, s.y, 2.5, 2.5); if (s.life <= 0) sparks.splice(i, 1); }
    if (now < end || sparks.length) requestAnimationFrame(f); else c.remove();
  })(performance.now());
}

// Natijaga qarab effekt
export function celebrate(pct) {
  if (pct >= 90) { fireworks(5000); setTimeout(() => confetti(3500, 140), 600); }
  else if (pct >= 70) confetti(3800, 180);
  else if (pct >= 50) confetti(2200, 70);
}
