// XP, daraja, seriya (streak), kunlik maqsad va yutuqlar — hisob-kitob serverda (my_stats, touch_streak, check_achievements)
import { sb, state, route, esc, ic, $, $$, toast, spinner, fmtMin, fmtDate, tr } from './core.js';
import { T, bar, pct, announceAchievements, dbErr } from './ui.js';

export async function refreshStats() {
  if (!state.user || !navigator.onLine) return state.stats;
  try {
    await sb.rpc('touch_streak');
    const { data } = await sb.rpc('my_stats'); if (data) state.stats = data;
    const a = await sb.rpc('check_achievements'); if (a.data?.length) announceAchievements(a.data);
    document.dispatchEvent(new Event('bio-stats'));
  } catch { /* oflayn */ }
  return state.stats;
}
export const xpChip = () => { const s = state.stats; return s && s.xp != null ? `<a class="xpchip" href="#/achievements" title="XP / ${esc(T('daraja', 'уровень', 'level'))}"><span class="fl">${ic('flame', 16)}${s.streak || 0}</span><span>${ic('zap', 14)} ${s.xp}</span><span>L${s.level || 1}</span></a>` : ''; };

route('/achievements', async ({ el, alive }) => {
  el.innerHTML = `<div class="page"><h1>${esc(T('Yutuqlar', 'Достижения', 'Achievements'))}</h1><div id="ac">${spinner()}</div></div>`;
  await refreshStats();
  const [{ data: all }, { data: mine }] = await Promise.all([sb.from('achievements').select('*').order('sort'), sb.from('user_achievements').select('code,earned_at')]);
  if (!alive()) return;
  const s = state.stats || { xp: 0, level: 1, cur_xp: 0, next_xp: 40, streak: 0, best: 0, goal: 20, today_sec: 0 };
  const got = Object.fromEntries((mine || []).map(x => [x.code, x.earned_at])); const goalP = pct(Math.floor(s.today_sec / 60), s.goal);
  $('#ac', el).innerHTML = `<div class="statrow"><div class="sbox"><b>${s.xp}</b><small>XP</small></div><div class="sbox"><b>L${s.level}</b><small>${esc(T('Daraja', 'Уровень', 'Level'))}</small></div>
      <div class="sbox"><b>${s.streak} 🔥</b><small>${esc(T('Seriya (kun)', 'Серия (дни)', 'Streak (days)'))}</small></div><div class="sbox"><b>${s.best}</b><small>${esc(T('Eng uzun seriya', 'Лучшая серия', 'Best streak'))}</small></div></div>
    <div class="card pad mt"><div class="row between"><b>${esc(T('Keyingi darajagacha', 'До следующего уровня', 'To next level'))}</b><small class="muted">${s.xp} / ${s.next_xp} XP</small></div>${bar(pct(s.xp - s.cur_xp, s.next_xp - s.cur_xp))}</div>
    <div class="card pad mt"><div class="row between"><b>${esc(T('Kunlik maqsad', 'Дневная цель', 'Daily goal'))}</b><small class="muted">${Math.floor(s.today_sec / 60)} / ${s.goal} ${esc(T('daq', 'мин', 'min'))}</small></div>${bar(goalP)}
      <div class="row mt" style="gap:8px"><label class="muted small" for="gl">${esc(T('Maqsad (daqiqa)', 'Цель (минуты)', 'Goal (minutes)'))}</label><input id="gl" class="input sm" type="number" min="5" max="240" value="${s.goal}" style="width:90px"><button class="btn sm" id="gs">${esc(T('Saqlash', 'Сохранить', 'Save'))}</button></div></div>
    <h3 class="mt">${esc(T('Yutuqlar', 'Достижения', 'Achievements'))} (${Object.keys(got).length}/${(all || []).length})</h3>
    <div class="cards">${(all || []).map(a => `<div class="card pad item-row" style="${got[a.code] ? '' : 'opacity:.55'}"><span class="item-ic">${ic(a.icon || 'trophy', 20)}</span><div class="grow"><b>${esc(tr(a.title))}</b><br><small class="muted">${esc(tr(a.descr))}${got[a.code] ? ' · ' + esc(fmtDate(got[a.code])) : ' · +' + a.xp + ' XP'}</small></div>${got[a.code] ? ic('check', 18) : ''}</div>`).join('')}</div>`;
  $('#gs', el).onclick = async () => { const { error } = await sb.rpc('set_daily_goal', { p_min: +$('#gl', el).value || 20 }); if (error) return toast(dbErr(error), 'err'); toast(T('Saqlandi', 'Сохранено', 'Saved'), 'ok'); await refreshStats(); location.reload(); };
}, { auth: true });
