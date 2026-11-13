// BioAcademy 2.0: umumiy kichik yordamchilar (3 tilli matn, bo'sh/xato/skeleton holatlari, oddiy markdown)
import { state, esc, ic, sb } from './core.js';

export const T = (uz, ru, en) => ({ uz, ru, en }[state.lang] ?? uz);
export const skeleton = (n = 3, h = 64) => Array.from({ length: n }, () => `<div class="skel" style="height:${h}px;margin:10px 0"></div>`).join('');
export const empty = (icon, text, action = '') => `<div class="empty"><span class="ei">${ic(icon, 30)}</span><p>${esc(text)}</p>${action}</div>`;
export const errBox = (msg, retryId = '') => `<div class="errbox">⚠️ ${esc(msg)}${retryId ? ` <button class="btn sm ghost" id="${retryId}">${esc(T('Qayta urinish', 'Повторить', 'Retry'))}</button>` : ''}</div>`;
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const bar = (p, cls = '') => `<div class="pbar ${cls}"><i style="width:${Math.max(0, Math.min(100, p))}%"></i></div>`;

// xavfsiz oddiy markdown: # sarlavha, **qalin**, - ro'yxat, bo'sh qator = abzats
export function md(src) {
  const lines = String(src || '').split(/\r?\n/); let out = '', list = false;
  const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
  for (const ln of lines) {
    const li = ln.match(/^\s*[-•]\s+(.*)/);
    if (li) { if (!list) { out += '<ul>'; list = true; } out += `<li>${inl(li[1])}</li>`; continue; }
    if (list) { out += '</ul>'; list = false; }
    const h = ln.match(/^(#{1,3})\s+(.*)/);
    if (h) out += `<h${h[1].length + 2}>${inl(h[2])}</h${h[1].length + 2}>`; else if (ln.trim()) out += `<p>${inl(ln)}</p>`;
  }
  return out + (list ? '</ul>' : '');
}

// xato xabari (RLS/SQL) -> odam tushunadigan matn
export const dbErr = e => { const m = e?.message || String(e || ''); return /permission|row-level|policy/i.test(m) ? T('Ruxsat yo\'q', 'Нет доступа', 'Permission denied') : /duplicate|unique/i.test(m) ? T('Bu allaqachon mavjud', 'Уже существует', 'Already exists') : m; };

// SM-2 / XP / yutuq bildirishnomasi
export const achTitle = (a, lang = state.lang) => (a?.title?.[lang] || a?.title?.uz || a?.code || '');
export async function announceAchievements(codes) {
  if (!codes?.length) return;
  const { toast } = await import('./core.js');
  const { data } = await sb.from('achievements').select('code,title').in('code', codes);
  (data || []).forEach(a => toast('🏅 ' + achTitle(a), 'ok'));
}
