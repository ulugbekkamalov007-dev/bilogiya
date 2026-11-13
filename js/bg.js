// Ilova foni: biologiya mavzusidagi fon naqshlari (DNK, hujayra, barg, neyron, plankton, mikroskop). Tanlov shu qurilmada saqlanadi.
import { t, addDict, esc, ic, $, $$, route } from './core.js';

addDict({
  uz: { 'bg.title': 'Ilova foni', 'bg.none': 'Oddiy', 'bg.dna': 'DNK spirali', 'bg.cells': 'Hujayralar', 'bg.leaf': 'Barg tomirlari', 'bg.neuro': 'Neyron tarmog\'i', 'bg.plankton': 'Yorug\' plankton', 'bg.aurora': 'Shimol nuri', 'bg.sunset': 'Quyosh botishi', 'bg.ocean': 'Okean to\'lqinlari', 'bg.honey': 'Asal chuchvara', 'bg.bubbles': 'Pufakchalar', 'bg.stars': 'Yulduzli osmon', 'bg.forest': 'Tun o\'rmoni', 'bg.mint': 'Yalpiz bulut', 'bg.page': 'Fon tanlash', 'bg.hint': 'Fonni tanlang — ilova ranglari saqlanadi' },
  ru: { 'bg.title': 'Фон приложения', 'bg.none': 'Обычный', 'bg.dna': 'Спираль ДНК', 'bg.cells': 'Клетки', 'bg.leaf': 'Жилки листа', 'bg.neuro': 'Сеть нейронов', 'bg.plankton': 'Светящийся планктон', 'bg.aurora': 'Северное сияние', 'bg.sunset': 'Закат', 'bg.ocean': 'Волны океана', 'bg.honey': 'Соты', 'bg.bubbles': 'Пузырьки', 'bg.stars': 'Звёздное небо', 'bg.forest': 'Ночной лес', 'bg.mint': 'Мятные облака', 'bg.page': 'Выбор фона', 'bg.hint': 'Выберите фон — цвета приложения сохранятся' },
  en: { 'bg.title': 'App background', 'bg.none': 'Plain', 'bg.dna': 'DNA helix', 'bg.cells': 'Cells', 'bg.leaf': 'Leaf veins', 'bg.neuro': 'Neuron network', 'bg.plankton': 'Glowing plankton', 'bg.aurora': 'Aurora', 'bg.sunset': 'Sunset', 'bg.ocean': 'Ocean waves', 'bg.honey': 'Honeycomb', 'bg.bubbles': 'Bubbles', 'bg.stars': 'Starry sky', 'bg.forest': 'Night forest', 'bg.mint': 'Mint clouds', 'bg.page': 'Choose background', 'bg.hint': 'Pick a background — app colors stay the same' },
});

const G = 'rgba(34,197,94,', T = 'rgba(20,184,166,', P = 'rgba(139,92,246,';
const svg = (w, h, body) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`)}")`;

// DNK: ikki sinus chiziq + ko'ndalang "narvon"
const dna = () => { let p1 = '', p2 = '', r = ''; for (let x = 0; x <= 120; x += 4) { const y1 = 60 + 36 * Math.sin(x / 120 * Math.PI * 2), y2 = 60 - 36 * Math.sin(x / 120 * Math.PI * 2); p1 += (x ? 'L' : 'M') + x + ' ' + y1.toFixed(1); p2 += (x ? 'L' : 'M') + x + ' ' + y2.toFixed(1); if (x % 12 === 0 && x) r += `<line x1='${x}' y1='${y1.toFixed(1)}' x2='${x}' y2='${y2.toFixed(1)}' stroke='${T}.22)' stroke-width='2'/>`; }
  return svg(120, 120, `<path d='${p1}' fill='none' stroke='${G}.3)' stroke-width='3'/><path d='${p2}' fill='none' stroke='${P}.25)' stroke-width='3'/>${r}`); };
const cells = () => svg(220, 220, [[40, 50, 30], [150, 40, 22], [110, 120, 36], [30, 160, 20], [185, 175, 28], [75, 205, 14]].map(([x, y, r]) => `<circle cx='${x}' cy='${y}' r='${r}' fill='${G}.07)' stroke='${G}.3)' stroke-width='2'/><circle cx='${x + r * .2}' cy='${y - r * .1}' r='${r * .38}' fill='${T}.25)'/><circle cx='${x - r * .45}' cy='${y + r * .4}' r='${r * .12}' fill='${P}.35)'/>`).join(''));
const leaf = () => svg(160, 160, `<path d='M0 80 H160 M30 80 L60 40 M60 80 L100 30 M100 80 L140 45 M30 80 L55 120 M70 80 L105 125 M110 80 L145 115' stroke='${G}.28)' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M80 0 V160' stroke='${G}.2)' stroke-width='2'/><circle cx='80' cy='80' r='3' fill='${T}.4)'/>`);
const neuro = () => { const n = [[30, 30], [120, 20], [200, 70], [90, 100], [30, 160], [150, 150], [210, 200], [100, 210]]; const e = [[0, 1], [1, 2], [0, 3], [1, 3], [3, 2], [3, 4], [3, 5], [5, 2], [5, 6], [4, 7], [7, 5]];
  return svg(240, 240, e.map(([a, b]) => `<line x1='${n[a][0]}' y1='${n[a][1]}' x2='${n[b][0]}' y2='${n[b][1]}' stroke='${T}.25)' stroke-width='1.6'/>`).join('') + n.map(([x, y], i) => `<circle cx='${x}' cy='${y}' r='${i % 3 ? 5 : 8}' fill='${i % 2 ? P + '.35)' : G + '.4)'}'/>`).join('')); };

export const BGS = {
  none: () => ({}),
  dna: () => ({ img: dna(), size: '120px 120px', anim: 'bgslide' }),
  cells: () => ({ img: cells(), size: '220px 220px', anim: 'bgslide' }),
  leaf: () => ({ img: leaf(), size: '160px 160px' }),
  neuro: () => ({ img: neuro(), size: '240px 240px', anim: 'bgslide' }),
  plankton: () => ({ img: `radial-gradient(circle at 20% 25%, ${G}.22), transparent 38%), radial-gradient(circle at 80% 15%, ${T}.2), transparent 34%), radial-gradient(circle at 70% 80%, ${P}.18), transparent 40%), radial-gradient(circle at 15% 85%, ${G}.16), transparent 36%)`, size: '100% 100%', anim: 'bgglow' }),
  aurora: () => ({ img: `linear-gradient(135deg, ${G}.2), ${T}.16) 38%, ${P}.18) 70%, rgba(59,130,246,.16))`, size: '100% 100%', anim: 'bgglow' }),
  sunset: () => ({ img: `linear-gradient(180deg, rgba(251,146,60,.2), rgba(244,114,182,.16) 55%, ${P}.16))`, size: '100% 100%' }),
  ocean: () => ({ img: `${svg(200, 50, `<path d='M0 25 Q25 5 50 25 T100 25 T150 25 T200 25' fill='none' stroke='rgba(14,165,233,.3)' stroke-width='2.4'/><path d='M0 40 Q25 22 50 40 T100 40 T150 40 T200 40' fill='none' stroke='${T}.26)' stroke-width='2'/>`)}, linear-gradient(180deg, rgba(14,165,233,.1), rgba(20,184,166,.1))`, size: '200px 50px, 100% 100%', anim: 'bgslide' }),
  honey: () => ({ img: svg(56, 98, `<path d='M28 2 L54 17 L54 47 L28 62 L2 47 L2 17 Z' fill='rgba(245,158,11,.06)' stroke='rgba(245,158,11,.32)' stroke-width='2'/><path d='M0 51 L26 66 L26 96 M56 51 L30 66' fill='none' stroke='rgba(245,158,11,.28)' stroke-width='2'/>`), size: '56px 98px' }),
  bubbles: () => ({ img: svg(220, 220, [[40, 60, 22], [150, 40, 12], [110, 150, 30], [190, 190, 14], [30, 190, 10], [190, 100, 8]].map(([x, y, r]) => `<circle cx='${x}' cy='${y}' r='${r}' fill='${T}.07)' stroke='${T}.32)' stroke-width='2'/><circle cx='${x - r * .3}' cy='${y - r * .3}' r='${Math.max(2, r * .16)}' fill='rgba(255,255,255,.6)'/>`).join('')), size: '220px 220px', anim: 'bgslide' }),
  stars: () => ({ img: `${svg(180, 180, [[20, 30, 2], [90, 12, 1.4], [150, 60, 2.2], [60, 100, 1.6], [120, 140, 2], [16, 160, 1.4], [165, 165, 1.8]].map(([x, y, r]) => `<circle cx='${x}' cy='${y}' r='${r}' fill='rgba(250,204,21,.7)'/>`).join(''))}, linear-gradient(180deg, rgba(30,41,99,.14), rgba(79,70,229,.1))`, size: '180px 180px, 100% 100%' }),
  forest: () => ({ img: `${svg(160, 120, `<path d='M30 110 L30 60 M30 80 L14 66 M30 70 L46 56 M110 110 L110 40 M110 70 L90 52 M110 56 L128 40' stroke='${G}.3)' stroke-width='3' fill='none' stroke-linecap='round'/><circle cx='30' cy='56' r='7' fill='${G}.22)'/><circle cx='110' cy='34' r='9' fill='${G}.2)'/>`)}, linear-gradient(180deg, rgba(5,46,22,.1), rgba(21,128,61,.08))`, size: '160px 120px, 100% 100%' }),
  mint: () => ({ img: `radial-gradient(ellipse at 15% 20%, ${G}.18), transparent 45%), radial-gradient(ellipse at 85% 30%, ${T}.16), transparent 42%), radial-gradient(ellipse at 40% 90%, ${G}.14), transparent 50%)`, size: '100% 100%', anim: 'bgglow' }),
};

export const getBg = () => { try { return localStorage.getItem('bio.bg') || 'none'; } catch { return 'none'; } };
export function applyBg(id = getBg()) {
  const d = (BGS[id] || BGS.none)(), r = document.documentElement.style;
  if (!d.img) { r.removeProperty('--bgimg'); document.body.removeAttribute('data-bg'); return; }
  r.setProperty('--bgimg', d.img); r.setProperty('--bgsize', d.size || 'auto'); document.body.dataset.bg = id; document.body.dataset.bga = d.anim || '';
}
export function bgPicker(host) {
  const cur = getBg();
  host.innerHTML = `<h3 class="mt">${esc(t('bg.title'))}</h3><p class="muted small">${esc(t('bg.hint'))}</p><div class="bgs">${Object.keys(BGS).map(k => { const d = BGS[k](); return `<button type="button" class="bgsw ${k === cur ? 'on' : ''}" data-b="${k}"><span class="bgp" data-k="${k}"></span><small>${esc(t('bg.' + k))}</small></button>`; }).join('')}</div>`;
  $$('.bgp', host).forEach(sp => { const d = BGS[sp.dataset.k](); if (d.img) { sp.style.backgroundImage = d.img; sp.style.backgroundSize = d.size || 'auto'; } });
  $$('.bgsw', host).forEach(b => b.onclick = () => { try { localStorage.setItem('bio.bg', b.dataset.b); } catch { /* */ } applyBg(b.dataset.b); $$('.bgsw', host).forEach(x => x.classList.toggle('on', x === b)); });
}

// Alohida "Fon" sahifasi (yuqori paneldagi tugma shu yerga olib keladi)
route('/backgrounds', async ({ el }) => {
  el.innerHTML = `<div class="page"><div class="row"><a class="btn ghost sm" href="#/settings">${ic('back')}</a><h1 class="mb0">${esc(t('bg.page'))}</h1></div><div id="bgp" class="card pad mt"></div></div>`;
  bgPicker($('#bgp', el));
}, { auth: true });
