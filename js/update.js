// Yangilanishlarni tekshirish: tizim o'zi tekshiradi (ochilganda, har 10 daqiqada, ilovaga qaytganda). Bildirishnoma o'chiq bo'lsa ham ilova ichida xabar chiqadi.
import { BUILD } from './version.js';
import { T } from './ui.js';
import { state, route, esc, ic, $, toast } from './core.js';

let latest = null, timer = null;
export const updateAvailable = () => !!latest && latest !== BUILD;

export async function checkUpdate(manual = false) {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('v');
    latest = (await r.json()).v || null;
  } catch { if (manual) toast(T('Tekshirib bo\'lmadi — internetni tekshiring', 'Не удалось проверить — проверьте интернет', 'Could not check — check your connection'), 'err'); return false; }
  const has = updateAvailable(); document.dispatchEvent(new Event('bio-update')); if (has) showBanner();
  return has;
}

export async function applyUpdate() {
  try { const rs = await navigator.serviceWorker?.getRegistrations(); await Promise.all((rs || []).map(r => r.unregister())); const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } catch { /* */ }
  location.reload();
}

function showBanner() {
  if (document.getElementById('updbar')) return;
  const b = document.createElement('div'); b.id = 'updbar'; b.setAttribute('role', 'status');
  b.innerHTML = `<span>${ic('zap', 18)}</span><div class="grow"><b>${esc(T('Yangilanish mavjud', 'Доступно обновление', 'Update available'))}</b><small>${esc(T('«Yangilash» ni bosing yoki ilovadan chiqib, qayta kiring.', 'Нажмите «Обновить» или выйдите из приложения и зайдите снова.', 'Tap “Update”, or close the app and open it again.'))}</small></div>
    <button class="btn sm" id="updgo">${esc(T('Yangilash', 'Обновить', 'Update'))}</button><button class="icon-btn" id="updx" aria-label="x">${ic('x', 16)}</button>`;
  document.body.appendChild(b);
  $('#updgo', b).onclick = applyUpdate; $('#updx', b).onclick = () => b.remove();
  // qurilma bildirishnomasi ham (agar ruxsat berilgan bo'lsa); ruxsat bo'lmasa ham yuqoridagi xabar ko'rinadi
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') { try { new Notification(T('Yangilanish mavjud', 'Доступно обновление', 'Update available'), { body: T('Ilovani yangilang', 'Обновите приложение', 'Please update the app'), icon: 'icons/icon-192.png', tag: 'upd' }); } catch { /* */ } }
}

export function startUpdateWatch() {
  if (timer) return; checkUpdate();
  timer = setInterval(() => { if (!document.hidden) checkUpdate(); }, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdate(); });
  addEventListener('online', () => checkUpdate());
}

route('/update', async ({ el }) => {
  const draw = () => {
    const has = updateAvailable();
    el.innerHTML = `<div class="page narrow"><h1>${esc(T('Yangilash', 'Обновление', 'Update'))}</h1>
      <div class="card pad center"><div class="item-ic" style="margin:0 auto 10px;width:56px;height:56px">${ic('zap', 28)}</div>
        <h3>${has ? esc(T('Yangi versiya mavjud!', 'Доступна новая версия!', 'A new version is available!')) : esc(T('Sizda eng so\'nggi versiya', 'У вас последняя версия', 'You are up to date'))}</h3>
        <p class="muted small">${esc(T('Joriy versiya', 'Текущая версия', 'Current version'))}: <b>${esc(BUILD)}</b>${latest ? ` · ${esc(T('Eng so\'nggisi', 'Последняя', 'Latest'))}: <b>${esc(latest)}</b>` : ''}</p>
        <div class="row wrap center"><button class="btn ${has ? '' : 'ghost'}" id="ug">${ic('rewind', 16)} ${esc(T('Yangilash', 'Обновить', 'Update now'))}</button><button class="btn ghost" id="uc">${esc(T('Tekshirish', 'Проверить', 'Check again'))}</button></div>
        <p class="muted small mt">${esc(T('Tizim yangilanishlarni o\'zi ham tekshirib turadi. Yangilanishdan keyin hisobingiz va ma\'lumotlaringiz saqlanadi.', 'Система сама проверяет обновления. Ваш аккаунт и данные сохраняются.', 'The app checks for updates on its own. Your account and data stay intact.'))}</p></div></div>`;
    $('#ug', el).onclick = applyUpdate; $('#uc', el).onclick = async () => { const h = await checkUpdate(true); draw(); if (!h && latest) toast(T('Yangilanish yo\'q', 'Обновлений нет', 'No updates'), 'ok'); };
  };
  await checkUpdate(); draw();
}, { auth: true });
